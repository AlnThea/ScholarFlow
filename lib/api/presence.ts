// lib/api/presence.ts
// Helper untuk membaca & menguji status pengguna online (Owner & Co-Editor)

import { supabase } from '@/lib/supabase';

export type UserPresence = {
  id: string;
  document_id: string;
  user_id: string;
  user_name: string;
  user_role: 'owner' | 'co-editor' | 'reader';
  last_seen_at: string;
};

// Local fallback in-memory presence store if table presence isn't deployed yet
const memoryPresenceStore: Map<string, UserPresence[]> = new Map();

/**
 * Send heartbeat to update user presence in document
 */
export async function updatePresence(
  docId: string,
  userId: string,
  userName: string,
  userRole: 'owner' | 'co-editor' | 'reader'
): Promise<UserPresence | null> {
  const now = new Date().toISOString();
  
  try {
    const res = await fetch('/api/v1/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, userId, userName, userRole }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.activeUsers) {
        memoryPresenceStore.set(docId, data.activeUsers);
      }
    }
  } catch (e) {
    console.warn('API presence heartbeat warning:', e);
  }

  return updateMemoryPresence(docId, userId, userName, userRole, now);
}

/**
 * Fetch active users for a document (last seen within 25 seconds)
 */
export async function fetchActivePresence(docId: string): Promise<UserPresence[]> {
  try {
    const res = await fetch(`/api/v1/presence?docId=${encodeURIComponent(docId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.activeUsers) {
        memoryPresenceStore.set(docId, data.activeUsers);
        return data.activeUsers;
      }
    }
  } catch (e) {
    console.warn('API fetch presence warning:', e);
  }

  return getMemoryActivePresence(docId);
}

/**
 * Instantly notify server & local storage that user is leaving/closing tab
 */
export function leavePresence(docId: string, userId: string): void {
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `scholarflow_presence_${docId}`;
      const existingStr = localStorage.getItem(storageKey);
      if (existingStr) {
        let list: UserPresence[] = JSON.parse(existingStr);
        list = list.filter(p => p.user_id !== userId);
        localStorage.setItem(storageKey, JSON.stringify(list));
      }

      const payload = JSON.stringify({ docId, userId, action: 'leave' });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/v1/presence', blob);
      } else {
        fetch('/api/v1/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('leavePresence error:', e);
    }
  }
}

function updateMemoryPresence(
  docId: string,
  userId: string,
  userName: string,
  userRole: 'owner' | 'co-editor' | 'reader',
  timestamp: string
): UserPresence {
  const presenceRecord: UserPresence = {
    id: `${docId}-${userId}`,
    document_id: docId,
    user_id: userId,
    user_name: userName || 'Collaborator',
    user_role: userRole,
    last_seen_at: timestamp
  };

  if (typeof window !== 'undefined') {
    try {
      const storageKey = `scholarflow_presence_${docId}`;
      const existingStr = localStorage.getItem(storageKey);
      let list: UserPresence[] = existingStr ? JSON.parse(existingStr) : [];
      
      const thresholdTime = Date.now() - 25000;
      list = list.filter(p => new Date(p.last_seen_at).getTime() >= thresholdTime && p.user_id !== userId);
      list.push(presenceRecord);

      localStorage.setItem(storageKey, JSON.stringify(list));
      memoryPresenceStore.set(docId, list);
      return presenceRecord;
    } catch (e) {
      console.warn('LocalStorage presence error:', e);
    }
  }

  const list = memoryPresenceStore.get(docId) || [];
  const existingIdx = list.findIndex(p => p.user_id === userId);
  if (existingIdx >= 0) {
    list[existingIdx] = presenceRecord;
  } else {
    list.push(presenceRecord);
  }
  memoryPresenceStore.set(docId, list);

  return presenceRecord;
}

function getMemoryActivePresence(docId: string): UserPresence[] {
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `scholarflow_presence_${docId}`;
      const existingStr = localStorage.getItem(storageKey);
      if (existingStr) {
        const thresholdTime = Date.now() - 25000;
        const list: UserPresence[] = JSON.parse(existingStr);
        return list.filter(p => new Date(p.last_seen_at).getTime() >= thresholdTime);
      }
    } catch (e) {
      console.warn('LocalStorage fetch presence error:', e);
    }
  }

  const list = memoryPresenceStore.get(docId) || [];
  const thresholdTime = Date.now() - 25000;
  return list.filter(p => new Date(p.last_seen_at).getTime() >= thresholdTime);
}
