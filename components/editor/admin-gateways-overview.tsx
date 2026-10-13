import React, { useState } from 'react';
import {
  IconCheck,
  IconCopy,
  IconServer,
  IconShieldCheck,
  IconCreditCard,
  IconWallet,
  IconBuildingBank,
  IconExternalLink,
} from '@tabler/icons-react';
import type { PaymentGateway } from '@/lib/api/payment-gateways';

interface AdminGatewaysOverviewProps {
  isEn: boolean;
  gatewaysList: PaymentGateway[];
  onOpenSimulator: (gatewayId: 'xendit' | 'midtrans' | 'stripe') => void;
}

export function AdminGatewaysOverview({
  isEn,
  gatewaysList,
  onOpenSimulator,
}: AdminGatewaysOverviewProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const activeCount = gatewaysList.filter((g) => g.is_enabled).length;

  const handleCopyWebhook = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getWebhookUrl = (gatewayId: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/payments/${gatewayId}/webhook`;
    }
    return `https://scholarflow.id/api/payments/${gatewayId}/webhook`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isEn ? 'Registered Gateways' : 'Total Saluran Terdaftar'}
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {gatewaysList.length}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold">
            <IconServer className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isEn ? 'Active Gateways' : 'Saluran Aktif'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeCount}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                {Math.round((activeCount / (gatewaysList.length || 1)) * 100)}% Live
              </span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold">
            <IconCheck className="h-5 w-5 stroke-[2.5]" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isEn ? 'Payment Methods' : 'Metode Pembayaran'}
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              10+
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400 font-bold">
            <IconCreditCard className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isEn ? 'Webhook Security' : 'Keamanan Callback'}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 mt-1 self-start">
              Token Signature Verified
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400 font-bold">
            <IconShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Admin Simulator & Webhook Banner */}
      <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-col gap-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded">
              {isEn ? 'Admin Sandbox Simulator' : 'Simulator Checkout (Hanya Admin)'}
            </span>
            <span className="text-[10px] text-slate-400">
              {isEn ? 'Safely test modal popups' : 'Uji tampilan popup tanpa transaksi riil'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {isEn
              ? 'Launch the student/user checkout modal directly from this panel to verify logos, instructions, and responsive styling.'
              : 'Jalankan modal pembayaran pengguna langsung dari panel ini untuk memastikan tampilan logo, instruksi transfer, dan tata letak responsif sudah sempurna.'}
          </p>
        </div>

        {/* Action simulator buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onOpenSimulator('xendit')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer"
          >
            <IconWallet className="h-4 w-4" />
            {isEn ? 'Simulate Xendit' : 'Simulasi Xendit'}
          </button>
          <button
            type="button"
            onClick={() => onOpenSimulator('midtrans')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer"
          >
            <IconBuildingBank className="h-4 w-4" />
            {isEn ? 'Simulate Midtrans' : 'Simulasi Midtrans'}
          </button>
          <button
            type="button"
            onClick={() => onOpenSimulator('stripe')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer"
          >
            <IconCreditCard className="h-4 w-4" />
            {isEn ? 'Simulate Stripe' : 'Simulasi Stripe'}
          </button>
        </div>
      </div>

      {/* Webhook URLs Copier Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {isEn ? 'Official Webhook Callback Endpoints' : 'URL Endpoint Webhook Callback Resmi'}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isEn
              ? 'Copy and register these endpoint URLs into your respective payment gateway developer dashboards to receive automated payment confirmation.'
              : 'Salin dan daftarkan URL endpoint ini ke dashboard developer masing-masing gateway untuk menerima konfirmasi pelunasan akun secara otomatis.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['xendit', 'midtrans', 'stripe'].map((gw) => {
            const url = getWebhookUrl(gw);
            const isCopied = copiedUrl === url;

            return (
              <div
                key={gw}
                className="flex flex-col gap-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-200">
                    {gw === 'xendit' ? 'Xendit Callback' : gw === 'midtrans' ? 'Midtrans Notification' : 'Stripe Webhook'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyWebhook(url)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <IconCheck className="h-3 w-3 stroke-[3] text-emerald-500" />
                        <span className="text-emerald-500">{isEn ? 'Copied' : 'Tersalin'}</span>
                      </>
                    ) : (
                      <>
                        <IconCopy className="h-3 w-3" />
                        <span>{isEn ? 'Copy URL' : 'Salin URL'}</span>
                      </>
                    )}
                  </button>
                </div>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 break-all select-all">
                  {url}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
