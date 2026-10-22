// lib/ai/token-quota.ts
// Monthly AI Token Quota & Fair Usage Policy Guard for Personal Users (Free & Pro)

import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const FREE_MONTHLY_TOKEN_QUOTA = 50_000;
export const PRO_MONTHLY_TOKEN_QUOTA = 1_000_000;
export const LOCAL_QUOTA_STORAGE_KEY = 'scholarflow.personal_ai_quota.v1';

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  isPro: boolean;
  resetAt?: string;
  source: 'database' | 'local_fallback';
}

export interface TokenUsageRecord {
  success: boolean;
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  tokensConsumed: number;
}

/**
 * Standard NLP token estimation heuristic
 * 1 word ≈ 1.33 tokens, or approx 1 token per 4 characters.
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  const charBased = Math.ceil(text.length / 4);
  const wordBased = Math.ceil(text.trim().split(/\s+/).length * 1.33);
  return Math.max(10, Math.round((charBased + wordBased) / 2));
}

/**
 * Client-side LocalStorage helper for optimistic offline/dual-persistence
 */
export function getLocalQuotaState(planId: string = 'free'): { used: number; limit: number; resetAt?: string } {
  const defaultLimit = planId === 'pro' ? PRO_MONTHLY_TOKEN_QUOTA : FREE_MONTHLY_TOKEN_QUOTA;
  if (typeof window === 'undefined') {
    return { used: 0, limit: defaultLimit };
  }

  try {
    const raw = localStorage.getItem(LOCAL_QUOTA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Check if monthly cycle (30 days) has passed
      if (parsed.resetAt && new Date(parsed.resetAt).getTime() <= Date.now()) {
        const nextCycle = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const resetData = { used: 0, limit: defaultLimit, resetAt: nextCycle };
        localStorage.setItem(LOCAL_QUOTA_STORAGE_KEY, JSON.stringify(resetData));
        return resetData;
      }
      return {
        used: typeof parsed.used === 'number' ? parsed.used : 0,
        limit: typeof parsed.limit === 'number' ? parsed.limit : defaultLimit,
        resetAt: parsed.resetAt
      };
    }
  } catch (e) {
    console.warn('[TokenQuota] Failed to read localStorage quota:', e);
  }

  const initial = {
    used: 0,
    limit: defaultLimit,
    resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  try {
    localStorage.setItem(LOCAL_QUOTA_STORAGE_KEY, JSON.stringify(initial));
  } catch (_) {}
  return initial;
}

/**
 * Update local storage cache
 */
export function saveLocalQuotaState(used: number, limit: number, resetAt?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const nextReset = resetAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(LOCAL_QUOTA_STORAGE_KEY, JSON.stringify({ used, limit, resetAt: nextReset }));
    window.dispatchEvent(new CustomEvent('scholarflow:quota-updated', { detail: { used, limit, resetAt: nextReset } }));
  } catch (e) {
    console.warn('[TokenQuota] Failed to save localStorage quota:', e);
  }
}

/**
 * Check if the user is allowed to consume AI tokens
 */
export async function checkPersonalQuota(
  userId?: string | null,
  planId: string = 'free'
): Promise<QuotaCheckResult> {
  const isPro = planId === 'pro';
  const defaultLimit = isPro ? PRO_MONTHLY_TOKEN_QUOTA : FREE_MONTHLY_TOKEN_QUOTA;

  // 1. Try reading directly from Supabase profiles if userId is available
  if (userId) {
    try {
      const dbClient = supabaseAdmin || supabase;
      const { data, error } = await dbClient
        .from('profiles')
        .select('ai_tokens_used, ai_monthly_quota, ai_quota_reset_at, subscription_plan')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        let used = typeof data.ai_tokens_used === 'number' ? data.ai_tokens_used : 0;
        let limit = typeof data.ai_monthly_quota === 'number' ? data.ai_monthly_quota : defaultLimit;
        const resetAt = data.ai_quota_reset_at;

        // Auto-reset cycle check if 30 days have elapsed
        if (resetAt && new Date(resetAt).getTime() <= Date.now()) {
          used = 0;
          const nextReset = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          await dbClient
            .from('profiles')
            .update({ ai_tokens_used: 0, ai_quota_reset_at: nextReset })
            .eq('id', userId);
        }

        const remaining = Math.max(0, limit - used);
        const percentUsed = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
        const allowed = used < limit;

        // Keep local cache synced
        saveLocalQuotaState(used, limit, resetAt);

        return {
          allowed,
          used,
          limit,
          remaining,
          percentUsed,
          isPro,
          resetAt,
          source: 'database'
        };
      }
    } catch (dbErr) {
      console.warn('[TokenQuota] DB check error, falling back to local state:', dbErr);
    }
  }

  // 2. Dual-persistence fallback to localStorage
  const local = getLocalQuotaState(planId);
  const remaining = Math.max(0, local.limit - local.used);
  const percentUsed = local.limit > 0 ? Math.min(100, Math.round((local.used / local.limit) * 100)) : 0;
  const allowed = local.used < local.limit;

  return {
    allowed,
    used: local.used,
    limit: local.limit,
    remaining,
    percentUsed,
    isPro,
    resetAt: local.resetAt,
    source: 'local_fallback'
  };
}

/**
 * Record and increment consumed AI tokens
 */
export async function recordPersonalTokenConsumption(
  userId?: string | null,
  tokensConsumed: number = 0,
  planId: string = 'free'
): Promise<TokenUsageRecord> {
  const safeTokens = Math.max(1, tokensConsumed);
  const isPro = planId === 'pro';
  const defaultLimit = isPro ? PRO_MONTHLY_TOKEN_QUOTA : FREE_MONTHLY_TOKEN_QUOTA;

  // 1. Update Database if user logged in
  if (userId) {
    try {
      const dbClient = supabaseAdmin || supabase;
      const { data } = await dbClient
        .from('profiles')
        .select('ai_tokens_used, ai_monthly_quota')
        .eq('id', userId)
        .maybeSingle();

      const currentUsed = typeof data?.ai_tokens_used === 'number' ? data.ai_tokens_used : 0;
      const limit = typeof data?.ai_monthly_quota === 'number' ? data.ai_monthly_quota : defaultLimit;
      const newUsed = currentUsed + safeTokens;

      await dbClient
        .from('profiles')
        .update({ ai_tokens_used: newUsed })
        .eq('id', userId);

      saveLocalQuotaState(newUsed, limit);

      const remaining = Math.max(0, limit - newUsed);
      const percentUsed = limit > 0 ? Math.min(100, Math.round((newUsed / limit) * 100)) : 0;

      return {
        success: true,
        used: newUsed,
        limit,
        remaining,
        percentUsed,
        tokensConsumed: safeTokens
      };
    } catch (err) {
      console.warn('[TokenQuota] DB record consumption failed, syncing local cache:', err);
    }
  }

  // 2. LocalStorage Fallback
  const local = getLocalQuotaState(planId);
  const newUsed = local.used + safeTokens;
  saveLocalQuotaState(newUsed, local.limit, local.resetAt);

  const remaining = Math.max(0, local.limit - newUsed);
  const percentUsed = local.limit > 0 ? Math.min(100, Math.round((newUsed / local.limit) * 100)) : 0;

  return {
    success: true,
    used: newUsed,
    limit: local.limit,
    remaining,
    percentUsed,
    tokensConsumed: safeTokens
  };
}
