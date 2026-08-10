// lib/sync/hybrid-sync-engine.ts
// Hybrid Realtime & Polling Sync Engine for ScholarFlow
// Features: Supabase WebSocket (postgres_changes), Adaptive HTTP Polling (3s active/15s idle), 3x Auto-Failover, Reconnect Recovery, Page Visibility Guard

import { supabase } from '@/lib/supabase';

export type SyncMode = 'websocket' | 'polling';
export type SyncStatus = 'connected' | 'connecting' | 'fallback' | 'disconnected';

export interface HybridSyncEngineOptions {
  documentId: string;
  backendType?: 'supabase' | 'express';
  onRemoteUpdate: (payload: any) => void;
  onStatusChange?: (mode: SyncMode, status: SyncStatus) => void;
  activePollingIntervalMs?: number;  // Default: 3000ms (3s)
  idlePollingIntervalMs?: number;    // Default: 15000ms (15s)
  failoverThreshold?: number;         // Default: 3 disconnects
  reconnectIntervalMs?: number;      // Default: 30000ms (30s)
}

export class HybridSyncEngine {
  private documentId: string;
  private backendType: 'supabase' | 'express';
  private onRemoteUpdate: (payload: any) => void;
  private onStatusChange?: (mode: SyncMode, status: SyncStatus) => void;

  private mode: SyncMode = 'websocket';
  private status: SyncStatus = 'disconnected';

  private activePollingMs: number;
  private idlePollingMs: number;
  private failoverThreshold: number;
  private reconnectIntervalMs: number;

  private wsChannel: any = null;
  private wsDisconnectCount = 0;
  private pollingTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private idleTimeoutTimer: NodeJS.Timeout | null = null;

  private isUserActive = true;
  private isTabVisible = true;
  private lastKnownUpdatedTime: string | null = null;

  constructor(options: HybridSyncEngineOptions) {
    this.documentId = options.documentId;
    this.backendType = options.backendType || 'supabase';
    this.onRemoteUpdate = options.onRemoteUpdate;
    this.onStatusChange = options.onStatusChange;

    this.activePollingMs = options.activePollingIntervalMs ?? 3000;
    this.idlePollingMs = options.idlePollingIntervalMs ?? 15000;
    this.failoverThreshold = options.failoverThreshold ?? 3;
    this.reconnectIntervalMs = options.reconnectIntervalMs ?? 30000;

    this.setupPageVisibilityGuard();
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  public connect(): void {
    if (typeof window === 'undefined') return;

    if (this.backendType === 'express') {
      // Express backend uses Adaptive Smart HTTP Polling
      this.switchToPolling('connected');
      return;
    }

    // Default to Supabase WebSocket Realtime Channel
    this.connectSupabaseWebSocket();
  }

  public disconnect(): void {
    this.cleanupWebSocket();
    this.stopPollingTimer();
    this.stopReconnectTimer();
    this.stopIdleTimer();
    this.updateStatus(this.mode, 'disconnected');
  }

  public markUserActive(): void {
    this.isUserActive = true;

    // Reset idle timer (10s idle threshold)
    if (this.idleTimeoutTimer) clearTimeout(this.idleTimeoutTimer);
    this.idleTimeoutTimer = setTimeout(() => {
      this.isUserActive = false;
      if (this.mode === 'polling') {
        this.restartPollingTimer();
      }
    }, 10000);

    if (this.mode === 'polling') {
      this.restartPollingTimer();
    }
  }

  public async syncNow(): Promise<void> {
    if (!this.documentId || !this.isTabVisible) return;

    try {
      const res = await fetch(`/api/shared-document?id=${encodeURIComponent(this.documentId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.updated_at !== this.lastKnownUpdatedTime) {
          this.lastKnownUpdatedTime = data.updated_at;
          this.onRemoteUpdate(data);
        }
      }
    } catch (err) {
      console.warn('[HybridSyncEngine] Manual syncNow error:', err);
    }
  }

  public getMode(): SyncMode {
    return this.mode;
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  // ============================================================================
  // WEBSOCKET REALTIME SUBSCRIPTION
  // ============================================================================

  private connectSupabaseWebSocket(): void {
    if (this.wsChannel) {
      this.cleanupWebSocket();
    }

    this.updateStatus('websocket', 'connecting');

    try {
      this.wsChannel = supabase
        .channel(`doc-sync-${this.documentId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'documents',
            filter: `id=eq.${this.documentId}`,
          },
          (payload: any) => {
            console.log('[HybridSyncEngine] WebSocket postgres_changes update:', payload);
            if (payload.new && payload.new.updated_at !== this.lastKnownUpdatedTime) {
              this.lastKnownUpdatedTime = payload.new.updated_at;
              this.onRemoteUpdate(payload.new);
            }
          }
        )
        .subscribe((status: string, err?: any) => {
          if (status === 'SUBSCRIBED') {
            console.log('[HybridSyncEngine] WebSocket Subscribed successfully');
            this.wsDisconnectCount = 0;
            this.updateStatus('websocket', 'connected');
            this.stopPollingTimer();
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.warn('[HybridSyncEngine] WebSocket error/closed:', status, err);
            this.handleWebSocketFailure();
          }
        });
    } catch (err) {
      console.error('[HybridSyncEngine] WebSocket connection exception:', err);
      this.handleWebSocketFailure();
    }
  }

  private handleWebSocketFailure(): void {
    this.wsDisconnectCount += 1;
    console.warn(`[HybridSyncEngine] WebSocket failure count: ${this.wsDisconnectCount}/${this.failoverThreshold}`);

    if (this.wsDisconnectCount >= this.failoverThreshold) {
      console.warn('[HybridSyncEngine] Failover threshold reached -> Switching to Smart HTTP Polling');
      this.switchToPolling('fallback');
      this.scheduleWebSocketReconnect();
    } else {
      this.updateStatus('websocket', 'connecting');
      // Retry WebSocket connection after 3s delay
      setTimeout(() => {
        if (this.mode === 'websocket') {
          this.connectSupabaseWebSocket();
        }
      }, 3000);
    }
  }

  private scheduleWebSocketReconnect(): void {
    this.stopReconnectTimer();
    this.reconnectTimer = setInterval(() => {
      if (this.isTabVisible && this.backendType === 'supabase') {
        console.log('[HybridSyncEngine] Background recovery: Attempting WebSocket reconnect...');
        this.attemptWebSocketRecovery();
      }
    }, this.reconnectIntervalMs);
  }

  private attemptWebSocketRecovery(): void {
    const testChannel = supabase.channel(`test-recovery-${Date.now()}`);
    testChannel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        console.log('[HybridSyncEngine] WebSocket Recovery SUCCESS -> Re-enabling WebSocket Mode');
        supabase.removeChannel(testChannel);
        this.stopReconnectTimer();
        this.stopPollingTimer();
        this.wsDisconnectCount = 0;
        this.mode = 'websocket';
        this.connectSupabaseWebSocket();
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        supabase.removeChannel(testChannel);
      }
    });
  }

  private cleanupWebSocket(): void {
    if (this.wsChannel) {
      supabase.removeChannel(this.wsChannel);
      this.wsChannel = null;
    }
  }

  // ============================================================================
  // ADAPTIVE SMART HTTP POLLING ENGINE
  // ============================================================================

  private switchToPolling(status: SyncStatus = 'connected'): void {
    this.cleanupWebSocket();
    this.mode = 'polling';
    this.updateStatus('polling', status);
    this.restartPollingTimer();
  }

  private restartPollingTimer(): void {
    this.stopPollingTimer();

    if (!this.isTabVisible) return;

    const interval = this.isUserActive ? this.activePollingMs : this.idlePollingMs;

    this.pollingTimer = setInterval(() => {
      this.syncNow();
    }, interval);
  }

  private stopPollingTimer(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private stopReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private stopIdleTimer(): void {
    if (this.idleTimeoutTimer) {
      clearTimeout(this.idleTimeoutTimer);
      this.idleTimeoutTimer = null;
    }
  }

  // ============================================================================
  // PAGE VISIBILITY GUARD (document.visibilityState)
  // ============================================================================

  private setupPageVisibilityGuard(): void {
    if (typeof window === 'undefined' || !window.document) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[HybridSyncEngine] Page Visibility: HIDDEN -> Pausing Polling & Heartbeat');
        this.isTabVisible = false;
        this.stopPollingTimer();
      } else {
        console.log('[HybridSyncEngine] Page Visibility: VISIBLE -> Resuming Sync & Triggering Instant Sync');
        this.isTabVisible = true;
        this.syncNow();
        if (this.mode === 'polling') {
          this.restartPollingTimer();
        } else if (this.mode === 'websocket' && this.status !== 'connected') {
          this.connectSupabaseWebSocket();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  private updateStatus(mode: SyncMode, status: SyncStatus): void {
    this.mode = mode;
    this.status = status;
    if (this.onStatusChange) {
      this.onStatusChange(mode, status);
    }
  }
}
