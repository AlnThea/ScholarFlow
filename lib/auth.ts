// lib/auth.ts
// Supabase Auth helper functions for ScholarFlow

import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type { User, Session };

export type AuthError = {
  message: string;
};

/** Sign in with email and password */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data?.user ?? null, session: data?.session ?? null, error };
}

/** Register a new user with email and password */
export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName ?? '',
        display_name: fullName ?? email.split('@')[0],
      },
    },
  });
  return { user: data?.user ?? null, session: data?.session ?? null, error };
}

/** Sign out the current user */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/** Get the current session (null if not logged in) */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Get the current user (null if not logged in) */
export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Get user display name from metadata */
export function getUserDisplayName(user: User | null): string {
  if (!user) return '';
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'User'
  );
}

/** Get user initials for avatar */
export function getUserInitials(user: User | null): string {
  const name = getUserDisplayName(user);
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
