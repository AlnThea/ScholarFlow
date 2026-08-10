// lib/sync/index.ts
// React Context & SyncProvider for HybridSyncEngine
'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { HybridSyncEngine, SyncMode, SyncStatus } from './hybrid-sync-engine';
import { useDataService } from '@/lib/services';

export * from './hybrid-sync-engine';

type SyncContextType = {
  syncEngine: HybridSyncEngine | null;
  mode: SyncMode;
  status: SyncStatus;
  markUserActive: () => void;
  syncNow: () => Promise<void>;
};

const SyncContext = createContext<SyncContextType>({
  syncEngine: null,
  mode: 'websocket',
  status: 'disconnected',
  markUserActive: () => {},
  syncNow: async () => {},
});

export function SyncProvider({
  documentId,
  onRemoteUpdate,
  children,
}: {
  documentId?: string | null;
  onRemoteUpdate?: (payload: any) => void;
  children: React.ReactNode;
}) {
  const { backendType } = useDataService();
  const [mode, setMode] = useState<SyncMode>('websocket');
  const [status, setStatus] = useState<SyncStatus>('disconnected');

  const syncEngineRef = useRef<HybridSyncEngine | null>(null);

  useEffect(() => {
    if (!documentId || !onRemoteUpdate) {
      if (syncEngineRef.current) {
        syncEngineRef.current.disconnect();
        syncEngineRef.current = null;
      }
      return;
    }

    const engine = new HybridSyncEngine({
      documentId,
      backendType,
      onRemoteUpdate,
      onStatusChange: (newMode, newStatus) => {
        setMode(newMode);
        setStatus(newStatus);
      },
    });

    syncEngineRef.current = engine;
    engine.connect();

    // Event listener for user interaction to trigger markUserActive
    const handleUserInteraction = () => {
      engine.markUserActive();
    };

    window.addEventListener('mousemove', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      engine.disconnect();
      syncEngineRef.current = null;
    };
  }, [documentId, backendType, onRemoteUpdate]);

  const markUserActive = useCallback(() => {
    syncEngineRef.current?.markUserActive();
  }, []);

  const syncNow = useCallback(async () => {
    await syncEngineRef.current?.syncNow();
  }, []);

  return React.createElement(
    SyncContext.Provider,
    {
      value: {
        syncEngine: syncEngineRef.current,
        mode,
        status,
        markUserActive,
        syncNow,
      },
    },
    children
  );
}

export function useHybridSync() {
  return useContext(SyncContext);
}
