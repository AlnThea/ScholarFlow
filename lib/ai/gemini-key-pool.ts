// lib/ai/gemini-key-pool.ts
// Gemini Multi-API Key Rotation & Failover Pool
// Automatically rotates and fails over across multiple Gemini API keys when quota (HTTP 429) is exceeded.

interface KeyStatus {
  key: string;
  cooldownUntil: number | null;
}

class GeminiKeyPoolManager {
  private cooldownMap: Map<string, number> = new Map();

  /**
   * Extract API keys from env or custom string (supports comma/space separation)
   */
  public parseKeys(customKeyStr?: string): string[] {
    const rawKeys = customKeyStr || process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
    if (!rawKeys.trim()) return [];

    return rawKeys
      .split(/[\s,]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 5);
  }

  /**
   * Check if an error indicates rate-limiting or quota exhaustion
   */
  public isQuotaError(error: any): boolean {
    if (!error) return false;
    const msg = String(error.message || error || '').toLowerCase();
    const status = error.status || (error.response && error.response.status);

    return (
      status === 429 ||
      msg.includes('429') ||
      msg.includes('quota') ||
      msg.includes('resource_exhausted') ||
      msg.includes('rate limit') ||
      msg.includes('exceeded') ||
      msg.includes('too many requests')
    );
  }

  /**
   * Mark a key as exhausted/cooldown (default 30 mins cooldown, or until midnight)
   */
  public markCooldown(key: string, cooldownDurationMs = 30 * 60 * 1000) {
    const until = Date.now() + cooldownDurationMs;
    this.cooldownMap.set(key, until);
    console.warn(`[Gemini Key Pool] Key ...${key.slice(-6)} marked in cooldown until ${new Date(until).toLocaleTimeString()}`);
  }

  /**
   * Get sorted list of available keys (Primary key #1 prioritized if available)
   */
  public getOrderedActiveKeys(allKeys: string[]): string[] {
    const now = Date.now();

    // Clean up expired cooldowns
    for (const [key, until] of this.cooldownMap.entries()) {
      if (now >= until) {
        this.cooldownMap.delete(key);
        console.log(`[Gemini Key Pool] Key ...${key.slice(-6)} cooldown expired. Restored to active pool.`);
      }
    }

    const available = allKeys.filter((k) => {
      const until = this.cooldownMap.get(k);
      return !until || now >= until;
    });

    // If all keys are in cooldown, reset cooldowns to allow retry
    if (available.length === 0 && allKeys.length > 0) {
      console.warn('[Gemini Key Pool] All keys in cooldown. Resetting pool to attempt request.');
      this.cooldownMap.clear();
      return [...allKeys];
    }

    return available;
  }

  /**
   * Execute an API runner with automatic key rotation and failover
   */
  public async execute<T>(
    runnerFn: (apiKey: string) => Promise<T>,
    customKeyStr?: string
  ): Promise<{ result: T; usedKey: string; keyIndex: number }> {
    const allKeys = this.parseKeys(customKeyStr);

    if (allKeys.length === 0) {
      throw new Error('No Gemini API Keys configured. Please set GEMINI_API_KEY in .env');
    }

    const activeKeys = this.getOrderedActiveKeys(allKeys);
    const errors: string[] = [];

    for (let i = 0; i < activeKeys.length; i++) {
      const apiKey = activeKeys[i];
      const keyIndex = allKeys.indexOf(apiKey);

      try {
        const result = await runnerFn(apiKey);
        if (i > 0) {
          console.log(`[Gemini Key Pool] Failover succeeded using Key #${keyIndex + 1} (...${apiKey.slice(-6)})`);
        }
        return { result, usedKey: apiKey, keyIndex };
      } catch (err: any) {
        const isQuota = this.isQuotaError(err);
        errors.push(`Key #${keyIndex + 1} (...${apiKey.slice(-6)}): ${err.message || err}`);

        if (isQuota) {
          this.markCooldown(apiKey);
          console.warn(`[Gemini Key Pool] Key #${keyIndex + 1} quota exhausted. Attempting failover to next key...`);
        } else {
          // If non-quota error and it's the last active key, rethrow
          if (i === activeKeys.length - 1) {
            throw err;
          }
        }
      }
    }

    throw new Error(`All ${allKeys.length} Gemini API keys failed in pool: ${errors.join('; ')}`);
  }
}

export const geminiKeyPool = new GeminiKeyPoolManager();
