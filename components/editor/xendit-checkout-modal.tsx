'use client';

import React, { useState, useEffect } from 'react';
import { 
  IconX, IconCheck, IconLoader, IconQrcode, IconExternalLink, 
  IconShieldCheck, IconClock, IconSparkles, IconPlayerPlay
} from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-context';

interface XenditCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  planPrice: number;
  onSuccess: () => void;
}

export function XenditCheckoutModal({
  isOpen,
  onClose,
  planId,
  planName,
  planPrice,
  onSuccess
}: XenditCheckoutModalProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { user, refreshProfile } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<'PENDING' | 'PAID'>('PENDING');
  const [timeLeft, setTimeLeft] = useState(86400); // 24 hours in seconds
  const [isSimulating, setIsSimulating] = useState(false);

  // 1. Generate Invoice on open
  useEffect(() => {
    if (isOpen && user?.id) {
      setIsLoading(true);
      setErrorMsg(null);
      setStatus('PENDING');

      fetch('/api/payments/xendit/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          planName,
          amount: planPrice,
          userId: user.id,
          payerEmail: user.email,
          customerName: user.user_metadata?.full_name || 'ScholarFlow Researcher'
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.invoice) {
            setInvoice(data.invoice);
          } else {
            setErrorMsg(data.error || 'Failed to initialize Xendit invoice');
          }
        })
        .catch((err) => setErrorMsg(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, planId, planPrice, user]);

  // 2. Countdown timer ticker
  useEffect(() => {
    if (!isOpen || status === 'PAID') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, status]);

  // 3. Live Polling Listener (Checks payment status every 3s)
  useEffect(() => {
    if (!isOpen || !invoice?.external_id || status === 'PAID') return;

    const pollInterval = setInterval(() => {
      fetch(`/api/payments/xendit/create-invoice?external_id=${invoice.external_id}`)
        .then((res) => res.json())
        .then(async (data) => {
          if (data.status === 'PAID') {
            setStatus('PAID');
            await refreshProfile();
            onSuccess();
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [isOpen, invoice, status, refreshProfile, onSuccess]);

  if (!isOpen) return null;

  const formatHours = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = async () => {
    if (!invoice?.external_id) return;
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/payments/xendit/create-invoice?external_id=${invoice.external_id}&action=simulate_pay`);
      const data = await res.json();
      if (data.status === 'PAID') {
        setStatus('PAID');
        await refreshProfile();
        onSuccess();
      }
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
              Xendit Hosted Checkout
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition">
            <IconX className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <IconLoader className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
                {isEn ? 'Generating official Xendit invoice...' : 'Menyiapkan invoice resmi Xendit...'}
              </span>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl">
              {errorMsg}
            </div>
          ) : status === 'PAID' ? (
            /* Stage 4: Celebration & Success Moment */
            <div className="py-8 flex flex-col items-center text-center gap-4 animate-fade-in">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 scale-100 animate-bounce">
                  <IconCheck className="h-10 w-10 stroke-[3]" />
                </div>
                <div className="absolute -top-2 -right-2 p-1.5 bg-amber-400 rounded-full text-slate-900 shadow animate-ping">
                  <IconSparkles className="h-4 w-4" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-black text-slate-800 dark:text-white">
                  {isEn ? 'Payment Successful!' : 'Pembayaran Berhasil!'}
                </h4>
                <p className="text-slate-500 dark:text-slate-400">
                  {isEn ? 'Your account has been upgraded to Pro Writer.' : 'Akun Anda telah resmi ditingkatkan ke Pro Writer.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                {isEn ? 'Start Writing in Pro' : 'Mulai Menulis Naskah Pro'}
              </button>
            </div>
          ) : (
            /* Stage 2 & 3: Active Invoice & Radar Scanner */
            <>
              {/* Order Box */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{isEn ? 'Plan' : 'Paket'}</span>
                  <div className="font-bold text-slate-800 dark:text-white text-sm">{planName}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{isEn ? 'Total' : 'Total Tagihan'}</span>
                  <div className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-base">
                    Rp {planPrice.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Pulsing Radar Detection Indicator */}
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                  </span>
                  <span className="font-medium text-amber-800 dark:text-amber-300 text-[11px]">
                    {isEn ? 'Scanning for payment confirmation...' : 'Mendeteksi pembayaran Anda secara real-time...'}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                  <IconClock className="h-3 w-3" />
                  {formatHours(timeLeft)}
                </div>
              </div>

              {/* Supported Payment Channels */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isEn ? 'Supported Channels (QRIS, VA, E-Wallet)' : 'Metode Tersedia di Lembar Xendit:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['QRIS (GoPay/ShopeePay)', 'BCA VA', 'Mandiri VA', 'BRI VA', 'BNI VA', 'OVO', 'Kartu Kredit'].map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="flex flex-col gap-2.5 pt-2">
                <a
                  href={invoice.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <IconExternalLink className="h-4 w-4" />
                  <span>{isEn ? 'Open Xendit Payment Page' : 'Buka Halaman Pembayaran Xendit'}</span>
                </a>

                {/* Instant Simulation Button (Testing Mode) */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
                >
                  <IconPlayerPlay className="h-3.5 w-3.5 text-indigo-500" />
                  <span>
                    {isSimulating 
                      ? (isEn ? 'Simulating...' : 'Mensimulasikan...') 
                      : (isEn ? '⚡ Simulate Instant Payment (Demo Testing)' : '⚡ Simulasi Bayar Instan (Demo Testing)')}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <IconShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>{isEn ? '256-Bit SSL Encrypted by Xendit' : 'Terenkripsi 256-Bit SSL oleh Xendit'}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
