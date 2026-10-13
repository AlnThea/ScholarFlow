import { describe, it, expect, beforeEach } from 'vitest';
import { 
  estimateTokens, 
  FREE_MONTHLY_TOKEN_QUOTA, 
  PRO_MONTHLY_TOKEN_QUOTA,
  getLocalQuotaState,
  saveLocalQuotaState,
  recordPersonalTokenConsumption,
  checkPersonalQuota
} from '@/lib/ai/token-quota';

describe('Personal AI Token Quota & Fair Usage Utils', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('estimateTokens', () => {
    it('should return 0 for empty or whitespace text', () => {
      expect(estimateTokens('')).toBe(0);
      expect(estimateTokens('   ')).toBe(0);
    });

    it('should estimate reasonable token count with standard NLP heuristics', () => {
      const sampleText = 'Academic writing requires rigorous methodologies and critical thinking.';
      const tokens = estimateTokens(sampleText);
      expect(tokens).toBeGreaterThan(5);
      expect(tokens).toBeLessThan(50);
    });
  });

  describe('Quota Constants', () => {
    it('should enforce 50,000 monthly tokens for free tier and 1,000,000 for pro', () => {
      expect(FREE_MONTHLY_TOKEN_QUOTA).toBe(50000);
      expect(PRO_MONTHLY_TOKEN_QUOTA).toBe(1000000);
    });
  });

  describe('Local Dual-Persistence Quota', () => {
    it('should initialize free tier quota properly', () => {
      const quota = getLocalQuotaState('free');
      expect(quota.used).toBe(0);
      expect(quota.limit).toBe(50000);
    });

    it('should initialize pro tier quota properly', () => {
      const quota = getLocalQuotaState('pro');
      expect(quota.used).toBe(0);
      expect(quota.limit).toBe(1000000);
    });

    it('should record consumption and update remaining allowance', async () => {
      const result = await recordPersonalTokenConsumption(null, 1500, 'free');
      expect(result.success).toBe(true);
      expect(result.used).toBe(1500);
      expect(result.remaining).toBe(48500);
      expect(result.percentUsed).toBe(3);
    });

    it('should detect when quota is exceeded', async () => {
      saveLocalQuotaState(50000, 50000);
      const check = await checkPersonalQuota(null, 'free');
      expect(check.allowed).toBe(false);
      expect(check.remaining).toBe(0);
      expect(check.percentUsed).toBe(100);
    });
  });
});
