// lib/ai/tenant-key-resolver.ts
// Multi-Tenant Campus Dedicated AI Key & Workload Resolver
// Resolves per-campus dedicated keys (BYOK) with in-memory caching and graceful tier fallbacks.

import { supabase } from '@/lib/supabase';

export type WorkloadCategory = 'text' | 'vision';

export type KeyCategoryPool =
  | 'text'
  | 'vision'
  | 'pro_text'
  | 'pro_vision'
  | 'institution_text'
  | 'institution_vision';

export interface TenantKeyResolveParams {
  userId?: string | null;
  userEmail?: string | null;
  userPlan?: string | null;
  category: WorkloadCategory;
}

export interface TenantKeyResolution {
  customKey?: string;
  category: KeyCategoryPool;
  source: 'campus_byok' | 'campus_pool' | 'pro_pool' | 'free_pool';
  institutionId?: string;
  institutionName?: string;
}

interface CacheEntry {
  resolution: TenantKeyResolution;
  expiresAt: number;
}

// In-memory cache with 5-minute TTL to prevent repetitive database queries
const resolutionCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export function clearTenantKeyCache() {
  resolutionCache.clear();
}

/**
 * Resolves the optimal Gemini API Key and Workload Category for a given tenant or user.
 */
export async function resolveTenantKey(
  params: TenantKeyResolveParams
): Promise<TenantKeyResolution> {
  const { userId, userEmail, userPlan = 'free', category } = params;

  const normalizedPlan = (userPlan || 'free').toLowerCase();
  const cacheKey = `${userId || 'none'}:${userEmail || 'none'}:${normalizedPlan}:${category}`;

  const cached = resolutionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.resolution;
  }

  let resolution: TenantKeyResolution | null = null;

  // 1. If user identifier is provided, check if user belongs to an active institution
  if (userId || userEmail) {
    try {
      // Query institution membership
      let memberQuery = supabase
        .from('institution_members')
        .select(`
          institution_id,
          role,
          status,
          institutions (
            id,
            name,
            status,
            campus_text_key,
            campus_vision_key
          )
        `)
        .eq('status', 'Active');

      if (userId) {
        memberQuery = memberQuery.eq('user_id', userId);
      } else if (userEmail) {
        memberQuery = memberQuery.eq('email', userEmail);
      }

      const { data: memberRows } = await memberQuery.limit(1);
      const member = memberRows?.[0];

      let institutionData: any = member?.institutions;

      // Fallback check on profiles.institution_id if member row wasn't directly found
      if (!institutionData && userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('institution_id')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.institution_id) {
          const { data: inst } = await supabase
            .from('institutions')
            .select('id, name, status, campus_text_key, campus_vision_key')
            .eq('id', profile.institution_id)
            .maybeSingle();

          if (inst) institutionData = inst;
        }
      }

      // If active institution found, resolve campus dedicated key
      if (institutionData && institutionData.status !== 'suspended' && institutionData.status !== 'expired') {
        const isVision = category === 'vision';
        const dedicatedKey = isVision
          ? (institutionData.campus_vision_key || institutionData.campus_text_key)
          : (institutionData.campus_text_key || institutionData.campus_vision_key);

        const poolCategory: KeyCategoryPool = isVision ? 'institution_vision' : 'institution_text';

        if (dedicatedKey && dedicatedKey.trim().length > 5) {
          resolution = {
            customKey: dedicatedKey.trim(),
            category: poolCategory,
            source: 'campus_byok',
            institutionId: institutionData.id,
            institutionName: institutionData.name,
          };
        } else {
          // Institution active but using platform shared campus pool
          resolution = {
            category: poolCategory,
            source: 'campus_pool',
            institutionId: institutionData.id,
            institutionName: institutionData.name,
          };
        }
      }
    } catch (err) {
      console.warn('[TenantKeyResolver] Error querying institution membership, fallback to tier:', err);
    }
  }

  // 2. Fallback based on subscription plan if not an active institution member
  if (!resolution) {
    const isVision = category === 'vision';

    if (normalizedPlan === 'institution') {
      resolution = {
        category: isVision ? 'institution_vision' : 'institution_text',
        source: 'campus_pool',
      };
    } else if (normalizedPlan === 'pro') {
      resolution = {
        category: isVision ? 'pro_vision' : 'pro_text',
        source: 'pro_pool',
      };
    } else {
      resolution = {
        category: isVision ? 'vision' : 'text',
        source: 'free_pool',
      };
    }
  }

  // Cache resolution
  resolutionCache.set(cacheKey, {
    resolution,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return resolution;
}
