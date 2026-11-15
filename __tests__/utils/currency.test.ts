import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getActiveCurrency,
  setActiveCurrency,
  convertIdrToUsd,
  formatPriceWithCurrency,
  formatPricePeriod,
  DEFAULT_CURRENCY,
  DEFAULT_USD_EXCHANGE_RATE,
  LOCAL_CURRENCY_STORAGE_KEY,
  CURRENCY_EVENT_NAME
} from '@/lib/config/currency';

describe('Currency Management & Multi-Currency Switcher Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Currency Storage & State Management', () => {
    it('returns default currency IDR when storage is empty', () => {
      expect(getActiveCurrency()).toBe('IDR');
    });

    it('sets and gets active currency in localStorage', async () => {
      const res = await setActiveCurrency('USD');
      expect(res).toBe(true);
      expect(localStorage.getItem(LOCAL_CURRENCY_STORAGE_KEY)).toBe('USD');
      expect(getActiveCurrency()).toBe('USD');
    });

    it('dispatches custom window event when currency changes', async () => {
      const listener = vi.fn();
      window.addEventListener(CURRENCY_EVENT_NAME, listener);

      await setActiveCurrency('USD');

      expect(listener).toHaveBeenCalled();
      const event = listener.mock.calls[0][0] as CustomEvent;
      expect(event.detail?.currency).toBe('USD');

      window.removeEventListener(CURRENCY_EVENT_NAME, listener);
    });

    it('rejects invalid currency code', async () => {
      // @ts-expect-error invalid code test
      const res = await setActiveCurrency('EUR');
      expect(res).toBe(false);
      expect(getActiveCurrency()).toBe('IDR');
    });
  });

  describe('IDR to USD Conversion (convertIdrToUsd)', () => {
    it('returns 0 for 0 IDR', () => {
      expect(convertIdrToUsd(0)).toBe(0);
    });

    it('returns -1 for negative IDR (custom pricing)', () => {
      expect(convertIdrToUsd(-1)).toBe(-1);
    });

    it('uses custom USD price when explicitly provided', () => {
      expect(convertIdrToUsd(149000, 9.99)).toBe(9.99);
      expect(convertIdrToUsd(0, 0)).toBe(0);
    });

    it('calculates USD amount with default exchange rate (16,000 IDR)', () => {
      // 160,000 IDR / 16,000 = 10.00 USD
      expect(convertIdrToUsd(160000)).toBe(10);
      // 149,000 IDR / 16,000 = 9.3125 -> 9.31 USD
      expect(convertIdrToUsd(149000)).toBe(9.31);
    });
  });

  describe('Price Formatting (formatPriceWithCurrency)', () => {
    it('formats IDR price with Indonesian locale correctly', () => {
      expect(formatPriceWithCurrency(149000, 'IDR')).toMatch(/Rp\s*149\.000/);
      expect(formatPriceWithCurrency(0, 'IDR')).toBe('Rp 0');
      expect(formatPriceWithCurrency(-1, 'IDR', null, 'id')).toBe('Harga Kustom');
      expect(formatPriceWithCurrency(-1, 'IDR', null, 'en')).toBe('Custom Pricing');
    });

    it('formats USD price with dollar symbol correctly', () => {
      expect(formatPriceWithCurrency(149000, 'USD', 9.99)).toBe('$9.99');
      expect(formatPriceWithCurrency(160000, 'USD')).toBe('$10');
      expect(formatPriceWithCurrency(0, 'USD')).toBe('$0');
      expect(formatPriceWithCurrency(-1, 'USD', null, 'en')).toBe('Custom Pricing');
    });
  });

  describe('Period Formatting (formatPricePeriod)', () => {
    it('formats period for IDR in Indonesian', () => {
      expect(formatPricePeriod('bulan', 'IDR', 'id')).toBe('/bulan');
      expect(formatPricePeriod('tahun', 'IDR', 'id')).toBe('/tahun');
      expect(formatPricePeriod('selamanya', 'IDR', 'id')).toBe('selamanya');
    });

    it('formats period for USD or English', () => {
      expect(formatPricePeriod('bulan', 'USD', 'en')).toBe('/month');
      expect(formatPricePeriod('month', 'USD', 'id')).toBe('/month');
      expect(formatPricePeriod('tahun', 'USD', 'en')).toBe('/year');
      expect(formatPricePeriod('selamanya', 'USD', 'en')).toBe('forever');
    });
  });
});
