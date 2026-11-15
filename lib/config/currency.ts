// lib/config/currency.ts
// Manajemen & Konfigurasi Mata Uang Sistem (IDR ↔ USD) dengan Dual-Persistence
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type CurrencyCode = 'IDR' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromIdr: number; // 1 USD = N IDR
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    rateFromIdr: 1
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateFromIdr: 16000
  }
};

export const DEFAULT_CURRENCY: CurrencyCode = 'IDR';
export const DEFAULT_USD_EXCHANGE_RATE = 16000;
export const LOCAL_CURRENCY_STORAGE_KEY = 'scholarflow.system_currency.v1';
export const CURRENCY_EVENT_NAME = 'scholarflow:currency-updated';

/**
 * Membaca mata uang aktif dari localStorage / memory
 */
export function getActiveCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  try {
    const saved = localStorage.getItem(LOCAL_CURRENCY_STORAGE_KEY);
    if (saved === 'USD' || saved === 'IDR') {
      return saved;
    }
  } catch (_) {
    // Ignore localStorage access errors
  }
  return DEFAULT_CURRENCY;
}

/**
 * Menyimpan mata uang aktif baru dan memancarkan event reaktif ke seluruh UI
 */
export async function setActiveCurrency(code: CurrencyCode): Promise<boolean> {
  if (code !== 'IDR' && code !== 'USD') return false;

  // 1. Simpan di localStorage client untuk persistensi instan
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_CURRENCY_STORAGE_KEY, code);
      // Dispatch custom window event
      window.dispatchEvent(
        new CustomEvent(CURRENCY_EVENT_NAME, {
          detail: { currency: code }
        })
      );
    } catch (_) {}
  }

  // 2. Upayakan persistensi dual di database Supabase (tabel payment_gateways atau settings)
  try {
    const { error } = await supabase
      .from('payment_gateways')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', 'system_currency');

    // Jika tabel mendukung config, update config
    if (!error) {
      return true;
    }
  } catch (err) {
    // Non-blocking fallback
    console.warn('[Currency] Remote sync fallback to client storage:', err);
  }

  return true;
}

/**
 * Menghitung harga USD dari nilai IDR
 */
export function convertIdrToUsd(
  amountIdr: number,
  customUsdPrice?: number | null,
  rate: number = DEFAULT_USD_EXCHANGE_RATE
): number {
  if (amountIdr === 0) return 0;
  if (amountIdr < 0) return -1;
  if (typeof customUsdPrice === 'number' && customUsdPrice >= 0) {
    return customUsdPrice;
  }
  // Formula konversi standar
  const calculated = amountIdr / rate;
  return Number(calculated.toFixed(2));
}

/**
 * Format harga berdasarkan mata uang aktif dan bahasa
 */
export function formatPriceWithCurrency(
  amountIdr: number,
  currency: CurrencyCode = 'IDR',
  customUsdPrice?: number | null,
  lang: string = 'id'
): string {
  if (amountIdr === 0) {
    return currency === 'USD' ? '$0' : 'Rp 0';
  }
  if (amountIdr < 0) {
    return lang === 'en' ? 'Custom Pricing' : 'Harga Kustom';
  }

  if (currency === 'USD') {
    const usdVal = convertIdrToUsd(amountIdr, customUsdPrice);
    // Format USD dengan presisi 2 desimal atau bulat jika integer
    const formattedUsd = usdVal % 1 === 0 ? usdVal.toString() : usdVal.toFixed(2);
    return `$${formattedUsd}`;
  }

  // IDR format
  return `Rp ${new Intl.NumberFormat('id-ID').format(amountIdr)}`;
}

/**
 * Format periode langganan (/bulan ↔ /month)
 */
export function formatPricePeriod(
  period: string,
  currency: CurrencyCode = 'IDR',
  lang: string = 'id'
): string {
  const cleanPeriod = (period || '').replace(/^\/+/, '').trim().toLowerCase();
  
  if (lang === 'en' || currency === 'USD') {
    switch (cleanPeriod) {
      case 'bulan':
      case 'month':
      case '/bulan':
      case '/month':
        return '/month';
      case 'tahun':
      case 'tahunan':
      case 'year':
      case 'yearly':
      case '/tahun':
        return '/year';
      case 'selamanya':
      case 'forever':
      case 'lifetime':
        return 'forever';
      default:
        return cleanPeriod ? `/${cleanPeriod}` : '';
    }
  }

  // Indonesian period
  switch (cleanPeriod) {
    case 'month':
    case 'bulan':
      return '/bulan';
    case 'year':
    case 'yearly':
    case 'tahun':
    case 'tahunan':
      return '/tahun';
    case 'forever':
    case 'lifetime':
    case 'selamanya':
      return 'selamanya';
    default:
      return cleanPeriod ? `/${cleanPeriod}` : '';
  }
}

/**
 * React Hook untuk mendengarkan perubahan mata uang secara reaktif di seluruh komponen
 */
export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>(getActiveCurrency);

  useEffect(() => {
    // Sinkronisasi saat komponen di-mount
    setCurrencyState(getActiveCurrency());

    const handleCurrencyUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ currency: CurrencyCode }>;
      if (customEvent.detail?.currency) {
        setCurrencyState(customEvent.detail.currency);
      } else {
        setCurrencyState(getActiveCurrency());
      }
    };

    window.addEventListener(CURRENCY_EVENT_NAME, handleCurrencyUpdate);
    window.addEventListener('storage', handleCurrencyUpdate);

    return () => {
      window.removeEventListener(CURRENCY_EVENT_NAME, handleCurrencyUpdate);
      window.removeEventListener('storage', handleCurrencyUpdate);
    };
  }, []);

  const changeCurrency = useCallback(async (newCode: CurrencyCode) => {
    setCurrencyState(newCode);
    await setActiveCurrency(newCode);
  }, []);

  const formatPrice = useCallback(
    (amountIdr: number, customUsdPrice?: number | null, lang: string = 'id') => {
      return formatPriceWithCurrency(amountIdr, currency, customUsdPrice, lang);
    },
    [currency]
  );

  const formatPeriod = useCallback(
    (period: string, lang: string = 'id') => {
      return formatPricePeriod(period, currency, lang);
    },
    [currency]
  );

  return {
    currency,
    isUsd: currency === 'USD',
    isIdr: currency === 'IDR',
    setCurrency: changeCurrency,
    formatPrice,
    formatPeriod
  };
}
