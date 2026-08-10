// lib/services/index.ts
// Service Factory & React DataProvider Injector for ScholarFlow
'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { IDataService } from './types';
import { SupabaseDataService } from './supabase-service';
import { ExpressDataService } from './express-service';

export * from './types';
export { SupabaseDataService } from './supabase-service';
export { ExpressDataService } from './express-service';

export type BackendType = 'supabase' | 'express';

const LOCAL_STORAGE_BACKEND_KEY = 'scholarflow.backend_type';

let cachedDataService: IDataService | null = null;
let cachedBackendType: BackendType | null = null;

/**
 * Helper to get saved backend type from localStorage or process.env
 */
export function getSavedBackendType(): BackendType {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_STORAGE_BACKEND_KEY);
    if (saved === 'supabase' || saved === 'express') {
      return saved;
    }
  }
  return ((process.env.NEXT_PUBLIC_BACKEND_TYPE || 'supabase').toLowerCase()) as BackendType;
}

/**
 * Factory Function to create or get the active DataService singleton instance
 */
export function getDataService(overrideType?: BackendType): IDataService {
  const targetType = overrideType || getSavedBackendType();

  if (cachedDataService && cachedBackendType === targetType) {
    return cachedDataService;
  }

  if (targetType === 'express') {
    console.log('[ServiceFactory] Injecting ExpressDataService REST Adapter');
    cachedDataService = new ExpressDataService();
  } else {
    console.log('[ServiceFactory] Injecting SupabaseDataService SDK Adapter');
    cachedDataService = new SupabaseDataService();
  }

  cachedBackendType = targetType;
  return cachedDataService;
}

// React Context for DataProvider Injection
type DataContextType = {
  dataService: IDataService;
  backendType: BackendType;
  setBackendType: (type: BackendType) => void;
};

const DataContext = createContext<DataContextType>({
  dataService: getDataService(),
  backendType: 'supabase',
  setBackendType: () => {},
});

export function DataProvider({
  children,
  backendType: initialTypeProp,
}: {
  children: React.ReactNode;
  backendType?: BackendType;
}) {
  const [activeBackendType, setActiveBackendState] = useState<BackendType>(() => {
    return initialTypeProp || getSavedBackendType();
  });

  useEffect(() => {
    const saved = getSavedBackendType();
    if (saved !== activeBackendType && !initialTypeProp) {
      setActiveBackendState(saved);
    }
  }, [initialTypeProp, activeBackendType]);

  const setBackendType = (newType: BackendType) => {
    setActiveBackendState(newType);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_BACKEND_KEY, newType);
    }
  };

  const serviceInstance = useMemo(() => {
    return getDataService(activeBackendType);
  }, [activeBackendType]);

  return React.createElement(
    DataContext.Provider,
    {
      value: {
        dataService: serviceInstance,
        backendType: activeBackendType,
        setBackendType,
      },
    },
    children
  );
}

/**
 * Hook to access the injected DataService in any React Component
 */
export function useDataService() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataService must be used within a <DataProvider>');
  }
  return context;
}
