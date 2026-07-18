// components/editor/stripe-checkout-modal.tsx
'use client';

import React, { useState } from 'react';
import { 
  IconX, 
  IconCreditCard, 
  IconLock, 
  IconCheck, 
  IconLoader,
  IconArrowRight
} from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  planPrice: number;
  planPeriod: string;
  onSuccess: () => void;
}

export function StripeCheckoutModal({
  isOpen,
  onClose,
  planId,
  planName,
  planPrice,
  planPeriod,
  onSuccess
}: StripeCheckoutModalProps) {
  const { user, refreshProfile } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [zip, setZip] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCardNumberChange = (value: string) => {
    // Format card number with spaces every 4 digits
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(cleaned);
    }
  };

  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (cleaned.length >= 2) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!cardNumber || !expiry || !cvc || !cardName) {
      setErrorMsg('Silakan lengkapi informasi kartu kredit Anda.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Simulate Stripe Network processing delay (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update user subscription details in Supabase
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: planId,
          subscription_status: 'active',
          subscription_end: nextMonth.toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setSuccess(true);
    } catch (err: any) {
      console.error('Error simulating stripe payment:', err);
      setErrorMsg(err.message || 'Terjadi kegagalan koneksi Stripe.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-all animate-fade-in font-sans">
      <div className="bg-slate-50 border border-slate-200 rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-3xl overflow-hidden max-h-[90vh]">
        
        {/* Left Side: Summary Panel */}
        <div className="md:w-5/12 bg-indigo-900 text-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <button 
              onClick={onClose}
              className="md:hidden absolute top-0 right-0 p-1 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <IconX className="h-4 w-4" />
            </button>

            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">ScholarFlow Checkout</span>
            <div className="mt-6 flex flex-col gap-1.5">
              <span className="text-xs text-indigo-200 font-medium">Berlangganan</span>
              <h3 className="text-xl font-bold">{planName}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold">{formatPrice(planPrice)}</span>
                <span className="text-xs text-indigo-300">/ {planPeriod}</span>
              </div>
            </div>

            <div className="h-px bg-white/15 my-6" />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-indigo-200">
                <span>Paket Langganan</span>
                <span>{formatPrice(planPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-indigo-200">
                <span>Pajak & Biaya Admin</span>
                <span>Rp 0</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold border-t border-white/10 pt-3">
                <span>Total Hari Ini</span>
                <span>{formatPrice(planPrice)}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 flex items-center gap-1.5 text-[10px] text-indigo-300">
            <IconLock className="h-3.5 w-3.5" />
            <span>Koneksi terenkripsi SSL 256-bit</span>
          </div>

          {/* Background shapes */}
          <div className="absolute top-0 right-0 opacity-10 translate-x-1/3 -translate-y-1/3 h-56 w-56 rounded-full bg-white" />
        </div>

        {/* Right Side: Stripe Form Panel */}
        <div className="flex-1 bg-white p-6 md:p-8 overflow-y-auto relative">
          
          {/* Close button for desktop */}
          <button 
            onClick={onClose}
            className="hidden md:block absolute top-6 right-6 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <IconX className="h-5 w-5" />
          </button>

          {success ? (
            /* Success Screen */
            <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-fade-in gap-5">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-500 text-emerald-600 animate-scale-in">
                <IconCheck className="h-10 w-10 stroke-[3]" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-slate-800">Pembayaran Berhasil!</h3>
                <p className="text-xs text-slate-500 leading-normal max-w-sm">
                  Selamat, akun Anda telah berhasil ditingkatkan ke **{planName}**. Semua fitur pro kini aktif di ruang kerja Anda.
                </p>
              </div>
              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Kembali ke Workspace
                <IconArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Stripe Form */
            <form onSubmit={handlePay} className="flex flex-col gap-5">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-800">Bayar dengan Kartu</span>
                <span className="text-[10px] text-slate-400">Masukkan detail kartu kredit internasional Anda secara aman di bawah ini.</span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 transition"
                  placeholder="name@email.com"
                />
              </div>

              {/* Card Details */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Informasi Kartu</label>
                <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 transition bg-white flex flex-col">
                  {/* Card Number */}
                  <div className="flex items-center px-3 py-2.5 border-b border-slate-100">
                    <IconCreditCard className="h-4.5 w-4.5 text-slate-400 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="1234 5678 1234 5678"
                      maxLength={19}
                      className="w-full text-xs text-slate-700 placeholder-slate-400 outline-none bg-transparent"
                    />
                  </div>
                  {/* Expiry and CVC */}
                  <div className="flex border-t border-slate-50">
                    <div className="w-1/2 px-3 py-2.5 border-r border-slate-100">
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full text-xs text-slate-700 placeholder-slate-400 outline-none bg-transparent"
                      />
                    </div>
                    <div className="w-1/2 px-3 py-2.5">
                      <input
                        type="text"
                        required
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="CVC"
                        maxLength={4}
                        className="w-full text-xs text-slate-700 placeholder-slate-400 outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 italic">Gunakan kartu uji Stripe: 4242 4242 4242 4242</span>
              </div>

              {/* Cardholder Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama di Kartu</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 transition"
                  placeholder="Nama Lengkap Pemilik Kartu"
                />
              </div>

              {/* Country & ZIP */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Negara / Wilayah</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 bg-white outline-none focus:border-indigo-500 transition"
                  >
                    <option>Indonesia</option>
                    <option>Singapore</option>
                    <option>United States</option>
                    <option>Australia</option>
                    <option>Malaysia</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kode Pos</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-500 transition"
                    placeholder="12345"
                  />
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <IconLoader className="h-4 w-4 animate-spin" />
                    Memproses Pembayaran...
                  </>
                ) : (
                  `Bayar ${formatPrice(planPrice)}`
                )}
              </button>

              {/* Info transparan Beli Putus */}
              <div className="mt-4 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center text-[10px] text-slate-500 leading-normal">
                Beli sekali untuk 30 hari. Tanpa perpanjangan otomatis. Anda memegang kendali penuh.
              </div>

              {/* Stripe Brand Badge */}
              <div className="flex items-center justify-center gap-1 mt-2 text-[9px] text-slate-400 font-semibold tracking-wide uppercase">
                <span>Powered by</span>
                <span className="text-indigo-500 font-bold tracking-tight">stripe</span>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
