import React, { useState } from 'react';
import {
  IconLoader,
  IconCheck,
  IconX,
  IconCreditCard,
  IconWallet,
  IconBuildingBank,
  IconShieldLock,
  IconInfoCircle,
} from '@tabler/icons-react';
import { Switch } from './editor-switch';
import type { PaymentGateway } from '@/lib/api/payment-gateways';
import { AdminGatewaysOverview } from './admin-gateways-overview';
import { XenditCheckoutModal } from './xendit-checkout-modal';
import { MidtransCheckoutModal } from './midtrans-checkout-modal';
import { StripeCheckoutModal } from './stripe-checkout-modal';

interface AdminGatewaysTabProps {
  isEn: boolean;
  gatewaysList: PaymentGateway[];
  handleToggleGateway: (id: string, isEnabled: boolean) => void;
  togglingGatewayId: string | null;
  loadingGateways?: boolean;
}

export function AdminGatewaysTab({
  isEn,
  gatewaysList,
  handleToggleGateway,
  togglingGatewayId,
  loadingGateways = false,
}: AdminGatewaysTabProps) {
  // Modal Simulator States (Khusus Akun Admin)
  const [simulatedGateway, setSimulatedGateway] = useState<'xendit' | 'midtrans' | 'stripe' | null>(null);

  const getGatewayMeta = (id: string) => {
    switch (id) {
      case 'xendit':
        return {
          icon: <IconWallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          providerName: 'Xendit Invoice Indonesia',
          supportedMethods: 'QRIS (Semua Bank & E-Wallet), BCA/Mandiri/BRI/BNI/Permata Virtual Account, OVO, Dana, ShopeePay',
          supportedMethodsEn: 'QRIS (All Banks & E-Wallets), BCA/Mandiri/BRI/BNI/Permata Virtual Accounts, OVO, Dana, ShopeePay',
          envDocs: 'XENDIT_SECRET_KEY, XENDIT_WEBHOOK_VERIFICATION_TOKEN',
          statusNote: isEn ? 'Official automated invoicing & webhook verification' : 'Sistem invoice otomatis resmi & verifikasi webhook langsung',
          recommended: true,
        };
      case 'midtrans':
        return {
          icon: <IconBuildingBank className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
          providerName: 'Midtrans Snap',
          supportedMethods: 'GoPay, QRIS, BCA/BNI/BRI/Mandiri Bill Virtual Account, Indomaret / Alfamart',
          supportedMethodsEn: 'GoPay, QRIS, BCA/BNI/BRI/Mandiri Bill Virtual Accounts, Convenience Stores',
          envDocs: 'MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY',
          statusNote: isEn ? 'Integrated Snap popup for Indonesian payment methods' : 'Popup snap terintegrasi untuk metode pembayaran Indonesia',
          recommended: false,
        };
      case 'stripe':
        return {
          icon: <IconCreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          providerName: 'Stripe Global Card',
          supportedMethods: 'Visa, MasterCard, American Express, JCB, Apple Pay, Google Pay',
          supportedMethodsEn: 'Visa, MasterCard, American Express, JCB, Apple Pay, Google Pay',
          envDocs: 'STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
          statusNote: isEn ? 'Worldwide credit & debit card processing' : 'Pemrosesan kartu kredit & debit internasional global',
          recommended: false,
        };
      default:
        return {
          icon: <IconCreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />,
          providerName: id,
          supportedMethods: 'Custom payment processing',
          supportedMethodsEn: 'Custom payment processing',
          envDocs: 'PAYMENT_GATEWAY_CONFIG',
          statusNote: isEn ? 'Third-party gateway' : 'Gateway pihak ketiga',
          recommended: false,
        };
    }
  };

  const activeCount = gatewaysList.filter((g) => g.is_enabled).length;

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in px-4 md:px-8 py-2">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-7 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col gap-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md">
              Payment Gateway Control Panel
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
              {activeCount} / {gatewaysList.length} {isEn ? 'Active' : 'Aktif'}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold leading-tight text-slate-100">
            {isEn ? 'Payment Gateways & Checkout Channels' : 'Saluran & Gateway Pembayaran'}
          </h1>
          <p className="text-xs text-slate-300 leading-normal font-normal">
            {isEn
              ? 'Enable or disable checkout channels for subscription billing. Active gateways will appear in the checkout modal when users purchase Pro or Team plans.'
              : 'Aktifkan atau nonaktifkan saluran pembayaran untuk langganan. Gateway yang aktif akan langsung muncul di modal checkout saat pengguna membeli paket Pro atau Tim.'}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs bg-slate-800/80 border border-slate-700/80 px-4 py-3 rounded-xl text-slate-300">
          <IconShieldLock className="h-5 w-5 text-indigo-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-200">
              {isEn ? 'Encrypted Environment' : 'Tersimpan Aman di .env'}
            </span>
            <span className="text-[10px] text-slate-400">
              {isEn ? 'API keys & webhook secrets are read from server environment' : 'API key & secret webhook dibaca aman dari server'}
            </span>
          </div>
        </div>
      </div>

      {/* Overview Analytics, Simulator & Webhook Endpoints */}
      <AdminGatewaysOverview
        isEn={isEn}
        gatewaysList={gatewaysList}
        onOpenSimulator={(gw) => setSimulatedGateway(gw)}
      />

      {/* Main Table Card */}
      {loadingGateways ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-sm">
          <IconLoader className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">
            {isEn ? 'Loading payment gateways...' : 'Memuat data saluran pembayaran...'}
          </span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-3.5 font-semibold min-w-[220px]">{isEn ? 'Gateway Provider' : 'Saluran Pembayaran'}</th>
                  <th className="px-6 py-3.5 font-semibold min-w-[260px]">{isEn ? 'Supported Methods' : 'Metode Pembayaran Didukung'}</th>
                  <th className="px-6 py-3.5 font-semibold min-w-[220px]">{isEn ? 'Config Keys (.env)' : 'Kunci Konfigurasi (.env)'}</th>
                  <th className="px-6 py-3.5 font-semibold min-w-[130px] text-center">{isEn ? 'Status' : 'Status'}</th>
                  <th className="px-6 py-3.5 font-semibold min-w-[110px] text-center">{isEn ? 'Toggle' : 'Aksi'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {gatewaysList.map((gateway) => {
                  const meta = getGatewayMeta(gateway.id);
                  const isToggling = togglingGatewayId === gateway.id;

                  return (
                    <tr
                      key={gateway.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Provider info */}
                      <td className="px-6 py-4.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                            {meta.icon}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {meta.providerName}
                              </span>
                              {meta.recommended && (
                                <span className="text-[9px] font-extrabold uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.2 rounded">
                                  {isEn ? 'Primary' : 'Utama'}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">
                              id: {gateway.id}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {meta.statusNote}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Supported methods */}
                      <td className="px-6 py-4.5 align-middle">
                        <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                          {isEn ? meta.supportedMethodsEn : meta.supportedMethods}
                        </span>
                      </td>

                      {/* Env config keys */}
                      <td className="px-6 py-4.5 align-middle">
                        <div className="flex flex-col gap-1">
                          {meta.envDocs.split(', ').map((envVar) => (
                            <span
                              key={envVar}
                              className="inline-block font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200/70 dark:border-slate-700 max-w-fit"
                            >
                              {envVar}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4.5 align-middle text-center">
                        {gateway.is_enabled ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800">
                            <IconCheck className="h-3 w-3 stroke-[3]" />
                            {isEn ? 'Enabled' : 'Aktif'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <IconX className="h-3 w-3 stroke-[3]" />
                            {isEn ? 'Disabled' : 'Nonaktif'}
                          </span>
                        )}
                      </td>

                      {/* Switch Toggle */}
                      <td className="px-6 py-4.5 align-middle text-center">
                        <div className="flex items-center justify-center">
                          {isToggling ? (
                            <IconLoader className="h-5 w-5 text-indigo-600 animate-spin" />
                          ) : (
                            <Switch
                              checked={gateway.is_enabled}
                              onChange={() => handleToggleGateway(gateway.id, !gateway.is_enabled)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer notice */}
          <div className="px-6 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <IconInfoCircle className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>
              {isEn
                ? 'When a gateway is enabled, users will see it as an option in the checkout modal. Make sure the corresponding API keys are set in your .env before enabling.'
                : 'Ketika gateway diaktifkan, opsi tersebut akan muncul bagi pengguna di modal checkout. Pastikan API key terkait telah disetel pada file .env sebelum mengaktifkan.'}
            </span>
          </div>
        </div>
      )}

      {/* Simulator Modals (Khusus Admin Testing) */}
      <XenditCheckoutModal
        isOpen={simulatedGateway === 'xendit'}
        onClose={() => setSimulatedGateway(null)}
        planId="pro"
        planName="Pro Writer Plan (Demo)"
        planPrice={99000}
        onSuccess={() => setSimulatedGateway(null)}
      />

      <MidtransCheckoutModal
        isOpen={simulatedGateway === 'midtrans'}
        onClose={() => setSimulatedGateway(null)}
        planId="pro"
        planName="Pro Writer Plan (Demo)"
        planPrice={99000}
        planPeriod="month"
        onSuccess={() => setSimulatedGateway(null)}
      />

      <StripeCheckoutModal
        isOpen={simulatedGateway === 'stripe'}
        onClose={() => setSimulatedGateway(null)}
        planId="pro"
        planName="Pro Writer Plan (Demo)"
        planPrice={99000}
        planPeriod="month"
        onSuccess={() => setSimulatedGateway(null)}
      />
    </div>
  );
}
