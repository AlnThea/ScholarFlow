// components/auth/auth-provider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_end: string | null;
  institution?: string | null;
  preferences?: Record<string, any>;
  ai_tokens_used?: number;
  ai_monthly_quota?: number;
  ai_quota_reset_at?: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshProfile: async () => {},
});

async function fetchProfile(user: User): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at, subscription_plan, subscription_status, subscription_end, preferences, ai_tokens_used, ai_monthly_quota, ai_quota_reset_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[AuthProvider] fetchProfile error:', error.message, error);
    return null;
  }

  // Jika profile belum ada (user lama sebelum trigger), buat otomatis
  if (!data) {
    console.warn('[AuthProvider] No profile found, creating one...');
    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name ?? '',
        role: 'user',
        subscription_plan: 'free',
        subscription_status: 'active',
        ai_tokens_used: 0,
        ai_monthly_quota: 50000
      })
      .select('id, full_name, role, created_at, subscription_plan, subscription_status, subscription_end, preferences, ai_tokens_used, ai_monthly_quota, ai_quota_reset_at')
      .maybeSingle();

    if (insertError) {
      console.error('[AuthProvider] Failed to create profile:', insertError.message);
      return null;
    }
    return inserted as UserProfile;
  }

  // Provide sensible default fallback if newly added columns are null
  const plan = data.subscription_plan || 'free';
  const defaultQuota = plan === 'pro' ? 1000000 : 50000;
  const profileWithDefaults: UserProfile = {
    ...data,
    ai_tokens_used: typeof data.ai_tokens_used === 'number' ? data.ai_tokens_used : 0,
    ai_monthly_quota: typeof data.ai_monthly_quota === 'number' ? data.ai_monthly_quota : defaultQuota,
  };

  return profileWithDefaults;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (currentUser: User) => {
    const p = await fetchProfile(currentUser);
    console.log('[AuthProvider] Loaded profile:', p);
    setProfile(p);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data }) => {
      const currentSession = data.session;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadProfile(currentSession.user);
      }

      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth state anywhere in the app */
export function useAuth() {
  return useContext(AuthContext);
}
