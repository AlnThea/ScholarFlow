// lib/ai/rate-limiter.ts
// Token Bucket & Sliding Window Rate Limiter for Gemini AI API Routes (15 RPM Limit)
// Edge Runtime & Serverless Compatible

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
};

interface RateLimiterOptions {
  maxRequests?: number; // Default: 15 RPM
  windowMs?: number;    // Default: 60000ms (1 minute)
}

// In-Memory Sliding Window Store for Edge Runtime
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

export class EdgeRateLimiter {
  private maxRequests: number;
  private windowMs: number;

  constructor(options: RateLimiterOptions = {}) {
    this.maxRequests = options.maxRequests ?? 15;
    this.windowMs = options.windowMs ?? 60000;
  }

  public check(identifier: string): RateLimitResult {
    const now = Date.now();
    const key = `ratelimit:${identifier}`;

    let record = rateLimitMap.get(key);

    if (!record || now - record.windowStart >= this.windowMs) {
      // Initialize new window
      record = { count: 1, windowStart: now };
      rateLimitMap.set(key, record);
      return {
        allowed: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        resetSeconds: Math.ceil(this.windowMs / 1000),
      };
    }

    if (record.count >= this.maxRequests) {
      const resetMs = this.windowMs - (now - record.windowStart);
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        resetSeconds: Math.ceil(resetMs / 1000),
      };
    }

    record.count += 1;
    rateLimitMap.set(key, record);

    const resetMs = this.windowMs - (now - record.windowStart);
    return {
      allowed: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.count,
      resetSeconds: Math.ceil(resetMs / 1000),
    };
  }
}

export const defaultAiRateLimiter = new EdgeRateLimiter({
  maxRequests: 15, // 15 RPM Edge Rate Limit
  windowMs: 60000, // 1 minute window
});
