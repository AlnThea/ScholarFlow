'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useLanguage } from '@/components/i18n/language-context';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  isEn?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { isEn } = this.props;

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 m-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-4 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {isEn ? 'Something went wrong' : 'Terjadi kesalahan sistem'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {isEn 
              ? 'A component failed to render. Please try refreshing the page or contact support if the issue persists.' 
              : 'Komponen gagal dimuat. Silakan muat ulang halaman ini atau hubungi dukungan jika masalah berlanjut.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2 mt-4 text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-offset-slate-900"
          >
            {isEn ? 'Try Again' : 'Coba Lagi'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children, fallback }: { children?: ReactNode, fallback?: ReactNode }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  
  return (
    <ErrorBoundaryClass isEn={isEn} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}
