// lib/testing/resilience-validator.ts
// Automated System Health & Resilience Validator for ScholarFlow

import { defaultAiRateLimiter } from '@/lib/ai/rate-limiter';
import { getAppEnv, isProductionEnv } from '@/lib/config/env';

export interface HealthCheckResult {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  checks: {
    name: string;
    passed: boolean;
    details: string;
  }[];
  timestamp: string;
}

/**
 * Perform automatic production health check on critical subsystems
 */
export async function runResilienceHealthCheck(): Promise<HealthCheckResult> {
  const checks = [];

  // 1. Environment Mode Check
  const appEnv = getAppEnv();
  checks.push({
    name: 'Environment Mode Config',
    passed: true,
    details: `Running in ${appEnv.toUpperCase()} mode (Production Lock: ${isProductionEnv() ? 'ACTIVE' : 'TESTING'})`,
  });

  // 2. AI Rate Limiter Check
  const testIp = `healthcheck-${Date.now()}`;
  const rateResult = defaultAiRateLimiter.check(testIp);
  checks.push({
    name: 'Edge AI Rate Limiter (15 RPM)',
    passed: rateResult.allowed && rateResult.limit === 15,
    details: `Rate limiter responding correctly (Limit: ${rateResult.limit} RPM, Remaining: ${rateResult.remaining})`,
  });

  // 3. Supabase Credentials Check
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  checks.push({
    name: 'Supabase Credentials Config',
    passed: hasSupabaseUrl && hasSupabaseKey,
    details: hasSupabaseUrl && hasSupabaseKey
      ? 'Supabase URL & Anon Key configured'
      : 'Missing Supabase environment variables',
  });

  // 4. AI Engine Credentials Check
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  checks.push({
    name: 'Gemini AI Studio API Key',
    passed: hasGeminiKey,
    details: hasGeminiKey
      ? 'GEMINI_API_KEY configured'
      : 'GEMINI_API_KEY not set (Fallback model queue active)',
  });

  const allPassed = checks.every((c) => c.passed);

  return {
    status: allPassed ? 'HEALTHY' : 'DEGRADED',
    checks,
    timestamp: new Date().toISOString(),
  };
}
