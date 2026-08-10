// lib/config/env.ts
// Environment Configuration Helper for ScholarFlow (Laravel APP_ENV Equivalent)

export type AppEnvironment = 'development' | 'staging' | 'production';

/**
 * Get current application environment mode
 * Priority: NEXT_PUBLIC_APP_ENV -> NODE_ENV -> 'development'
 */
export function getAppEnv(): AppEnvironment {
  const env = (
    process.env.NEXT_PUBLIC_APP_ENV ||
    process.env.NODE_ENV ||
    'development'
  ).toLowerCase();

  if (env === 'production' || env === 'prod') {
    return 'production';
  }
  if (env === 'staging' || env === 'stage') {
    return 'staging';
  }
  return 'development';
}

/**
 * Returns true if running in Production environment mode
 */
export function isProductionEnv(): boolean {
  return getAppEnv() === 'production';
}

/**
 * Returns true if running in Development environment mode
 */
export function isDevelopmentEnv(): boolean {
  return getAppEnv() === 'development';
}

/**
 * Returns true if running in Staging environment mode
 */
export function isStagingEnv(): boolean {
  return getAppEnv() === 'staging';
}
