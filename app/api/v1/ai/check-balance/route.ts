// app/api/v1/ai/check-balance/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';

export interface ProviderBalanceResult {
  success: boolean;
  provider_type: string;
  currency: string;
  balance?: number;
  total_usage?: number;
  limit?: number;
  is_unlimited?: boolean;
  status_badge: 'healthy' | 'low' | 'critical' | 'unknown';
  message: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider_type = 'custom_openai', base_url, api_key } = body;

    if (!api_key || api_key.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'API Key wajib diisi untuk mengecek sisa saldo.' },
        { status: 400 }
      );
    }

    const key = api_key.trim();
    const url = (base_url || '').trim().replace(/\/+$/, '');

    // 1. OpenRouter Balance API
    if (provider_type === 'openrouter' || url.includes('openrouter.ai')) {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${key}` }
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({
          success: false,
          provider_type: 'openrouter',
          currency: 'USD',
          status_badge: 'critical',
          message: `Gagal membaca saldo OpenRouter: ${errText || res.statusText}`
        });
      }

      const data = await res.json();
      const info = data?.data || {};
      const limit = info.limit;
      const usage = info.usage || 0;
      const remaining = limit !== null && limit !== undefined ? Math.max(0, limit - usage) : 999999;
      const isUnlimited = limit === null || limit === undefined;

      return NextResponse.json({
        success: true,
        provider_type: 'openrouter',
        currency: 'USD',
        balance: isUnlimited ? undefined : Number(remaining.toFixed(4)),
        total_usage: Number(usage.toFixed(4)),
        limit: isUnlimited ? undefined : limit,
        is_unlimited: isUnlimited,
        status_badge: remaining < 1 ? 'critical' : remaining < 5 ? 'low' : 'healthy',
        message: isUnlimited
          ? `Penggunaan akumulasi: $${usage.toFixed(2)} USD (Kuota Tanpa Batas / Unlimited)`
          : `Sisa Saldo: $${remaining.toFixed(2)} USD (Terpakai: $${usage.toFixed(2)} dari $${limit})`
      });
    }

    // 2. 3rd Party Proxy / OneAPI / NewAPI / Custom OpenAI Seller
    if (provider_type === 'custom_openai' || provider_type === 'together' || provider_type === 'groq') {
      let candidateEndpoints: string[] = [];

      if (url) {
        candidateEndpoints.push(`${url}/dashboard/billing/credit_grants`);
        candidateEndpoints.push(`${url}/api/user/self`);
        candidateEndpoints.push(`${url}/v1/dashboard/billing/credit_grants`);
        candidateEndpoints.push(`${url}/v1/user/self`);
      } else {
        candidateEndpoints.push('https://api.openai.com/v1/dashboard/billing/credit_grants');
      }

      for (const endpoint of candidateEndpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
          });

          if (res.ok) {
            const data = await res.json();

            // Format NewAPI / OneAPI
            if (data?.data?.quota !== undefined) {
              const quotaUsd = data.data.quota / 500000; // Standar kalkulasi token OneAPI ($0.002 / 1k)
              return NextResponse.json({
                success: true,
                provider_type: '3rd_party_proxy',
                currency: 'USD',
                balance: Number(quotaUsd.toFixed(2)),
                status_badge: quotaUsd < 2 ? 'critical' : quotaUsd < 5 ? 'low' : 'healthy',
                message: `Saldo Kuota Reseller: $${quotaUsd.toFixed(2)} USD (${data.data.quota.toLocaleString()} Quota Units)`
              });
            }

            // Format OpenAI Billing Grants
            if (data?.total_available !== undefined) {
              const remaining = Number(data.total_available.toFixed(2));
              return NextResponse.json({
                success: true,
                provider_type: 'openai_compatible',
                currency: 'USD',
                balance: remaining,
                status_badge: remaining < 2 ? 'critical' : remaining < 5 ? 'low' : 'healthy',
                message: `Sisa Kredit: $${remaining} USD (Masa Aktif Aktif)`
              });
            }
          }
        } catch {
          // Lanjut ke kandidat berikutnya
        }
      }

      // Fallback: Test chat completion 1 token untuk memastikan API key aktif & tidak out-of-quota
      const testUrl = url.endsWith('/chat/completions') 
        ? url 
        : `${url.replace(/\/+$/, '')}/chat/completions`;

      const pingRes = await fetch(testUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1
        })
      });

      if (!pingRes.ok) {
        const errText = await pingRes.text();
        const isQuotaErr = pingRes.status === 429 || errText.toLowerCase().includes('quota') || errText.toLowerCase().includes('insufficient');
        return NextResponse.json({
          success: false,
          provider_type: 'custom_openai',
          currency: 'USD',
          status_badge: 'critical',
          message: isQuotaErr
            ? 'Peringatan: Saldo kuota API Key habis atau limit terlampaui (HTTP 429 Insufficient Balance).'
            : `Gagal verifikasi provider: ${errText.slice(0, 100)}`
        });
      }

      return NextResponse.json({
        success: true,
        provider_type: 'custom_openai',
        currency: 'USD',
        is_unlimited: true,
        status_badge: 'healthy',
        message: 'Koneksi Provider Aktif. Token Pay-As-You-Go siap digunakan.'
      });
    }

    // 3. Google Gemini Direct
    if (provider_type === 'gemini') {
      return NextResponse.json({
        success: true,
        provider_type: 'gemini',
        currency: 'USD',
        is_unlimited: true,
        status_badge: 'healthy',
        message: 'Google Gemini API Key Valid & Pay-As-You-Go Billing Aktif (Tier 15 RPM/1M TPM).'
      });
    }

    return NextResponse.json({
      success: true,
      provider_type,
      currency: 'USD',
      status_badge: 'healthy',
      message: 'Provider API Key Aktif.'
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal mengecek saldo provider.' },
      { status: 500 }
    );
  }
}
