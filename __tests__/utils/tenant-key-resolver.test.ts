import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  resolveTenantKey, 
  clearTenantKeyCache 
} from '@/lib/ai/tenant-key-resolver';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

function setupSupabaseMock(memberData: any[] = [], profileData: any = null, instData: any = null) {
  (supabase.from as any).mockImplementation((table: string) => {
    if (table === 'institution_members') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: memberData }),
            }),
          }),
        }),
      };
    }
    if (table === 'profiles') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: profileData }),
          }),
        }),
      };
    }
    if (table === 'institutions') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: instData }),
          }),
        }),
      };
    }
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          limit: vi.fn().mockResolvedValue({ data: [] }),
        }),
      }),
    };
  });
}

describe('Multi-Tenant Campus Dedicated AI Key Resolver', () => {
  beforeEach(() => {
    clearTenantKeyCache();
    vi.clearAllMocks();
  });

  describe('Free and Pro Individual Fallbacks (Non-Campus)', () => {
    it('should resolve to free text pool for anonymous free user', async () => {
      const res = await resolveTenantKey({
        userId: null,
        userPlan: 'free',
        category: 'text',
      });

      expect(res.source).toBe('free_pool');
      expect(res.category).toBe('text');
      expect(res.customKey).toBeUndefined();
    });

    it('should resolve to free vision pool for anonymous free user', async () => {
      const res = await resolveTenantKey({
        userId: null,
        userPlan: 'free',
        category: 'vision',
      });

      expect(res.source).toBe('free_pool');
      expect(res.category).toBe('vision');
      expect(res.customKey).toBeUndefined();
    });

    it('should resolve to pro text pool for Pro subscriber without institution', async () => {
      setupSupabaseMock([], null, null);

      const res = await resolveTenantKey({
        userId: 'pro-user-123',
        userPlan: 'pro',
        category: 'text',
      });

      expect(res.source).toBe('pro_pool');
      expect(res.category).toBe('pro_text');
      expect(res.customKey).toBeUndefined();
    });

    it('should resolve to pro vision pool for Pro subscriber in vision workload', async () => {
      setupSupabaseMock([], null, null);

      const res = await resolveTenantKey({
        userId: 'pro-user-123',
        userPlan: 'pro',
        category: 'vision',
      });

      expect(res.source).toBe('pro_pool');
      expect(res.category).toBe('pro_vision');
      expect(res.customKey).toBeUndefined();
    });
  });

  describe('Campus Dedicated Key (BYOK) Resolution', () => {
    it('should resolve campus_text_key for an affiliated university member', async () => {
      setupSupabaseMock([
        {
          institution_id: 'inst-ugm-01',
          role: 'Student',
          status: 'Active',
          institutions: {
            id: 'inst-ugm-01',
            name: 'Universitas Gadjah Mada',
            status: 'active',
            campus_text_key: 'AIzaSyUGMTextKey123456789',
            campus_vision_key: 'AIzaSyUGMVisionKey123456789',
          },
        },
      ]);

      const res = await resolveTenantKey({
        userId: 'mhs-ugm-99',
        userEmail: 'budi@mail.ugm.ac.id',
        userPlan: 'institution',
        category: 'text',
      });

      expect(res.source).toBe('campus_byok');
      expect(res.customKey).toBe('AIzaSyUGMTextKey123456789');
      expect(res.category).toBe('institution_text');
      expect(res.institutionName).toBe('Universitas Gadjah Mada');
    });

    it('should resolve campus_vision_key for statistical vision interpretation', async () => {
      setupSupabaseMock([
        {
          institution_id: 'inst-itb-02',
          role: 'Lecturer',
          status: 'Active',
          institutions: {
            id: 'inst-itb-02',
            name: 'Institut Teknologi Bandung',
            status: 'active',
            campus_text_key: 'AIzaSyITBTextKey123',
            campus_vision_key: 'AIzaSyITBVisionKey999',
          },
        },
      ]);

      const res = await resolveTenantKey({
        userId: 'dosen-itb-01',
        userPlan: 'institution',
        category: 'vision',
      });

      expect(res.source).toBe('campus_byok');
      expect(res.customKey).toBe('AIzaSyITBVisionKey999');
      expect(res.category).toBe('institution_vision');
      expect(res.institutionName).toBe('Institut Teknologi Bandung');
    });

    it('should fallback to campus_pool if institution has not set custom BYOK keys', async () => {
      setupSupabaseMock([
        {
          institution_id: 'inst-ui-03',
          role: 'Student',
          status: 'Active',
          institutions: {
            id: 'inst-ui-03',
            name: 'Universitas Indonesia',
            status: 'active',
            campus_text_key: null,
            campus_vision_key: null,
          },
        },
      ]);

      const res = await resolveTenantKey({
        userId: 'mhs-ui-12',
        userPlan: 'institution',
        category: 'text',
      });

      expect(res.source).toBe('campus_pool');
      expect(res.customKey).toBeUndefined();
      expect(res.category).toBe('institution_text');
      expect(res.institutionName).toBe('Universitas Indonesia');
    });
  });

  describe('In-Memory Caching & Performance', () => {
    it('should return cached resolution on subsequent calls without re-querying database', async () => {
      setupSupabaseMock([
        {
          institution_id: 'inst-undip-04',
          role: 'Student',
          status: 'Active',
          institutions: {
            id: 'inst-undip-04',
            name: 'Universitas Diponegoro',
            status: 'active',
            campus_text_key: 'AIzaSyUndipTextKey123',
          },
        },
      ]);

      // First call (hits database)
      const res1 = await resolveTenantKey({
        userId: 'user-undip-cache',
        userPlan: 'institution',
        category: 'text',
      });

      expect(res1.source).toBe('campus_byok');
      expect(res1.customKey).toBe('AIzaSyUndipTextKey123');

      // Second call (hits cache)
      const res2 = await resolveTenantKey({
        userId: 'user-undip-cache',
        userPlan: 'institution',
        category: 'text',
      });

      expect(res2.source).toBe('campus_byok');
      expect(res2.customKey).toBe('AIzaSyUndipTextKey123');

      // Supabase should only be queried once for institution_members
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });

    it('should re-query after clearTenantKeyCache() is executed', async () => {
      setupSupabaseMock([], null, null);

      await resolveTenantKey({ userId: 'cache-test-user', userPlan: 'free', category: 'text' });
      const initialCallCount = (supabase.from as any).mock.calls.length;
      expect(initialCallCount).toBeGreaterThanOrEqual(1);

      clearTenantKeyCache();

      await resolveTenantKey({ userId: 'cache-test-user', userPlan: 'free', category: 'text' });
      expect((supabase.from as any).mock.calls.length).toBe(initialCallCount * 2);
    });
  });
});
