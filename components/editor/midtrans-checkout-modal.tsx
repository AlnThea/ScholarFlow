// components/editor/midtrans-checkout-modal.tsx
'use client';

import React, { useState } from 'react';
import { 
  IconX, 
  IconQrcode, 
  IconBuildingBank, 
  IconCreditCard, 
  IconLoader, 
  IconCheck, 
  IconCopy,
  IconClock
} from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';

interface MidtransCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  planPrice: number;
  planPeriod: string;
  onSuccess: () => void;
}

type PaymentMethodType = 'qris' | 'va' | 'card';

export function MidtransCheckoutModal({
  isOpen,
  onClose,
  planId,
  planName,
  planPrice,
  planPeriod,
  onSuccess
}: MidtransCheckoutModalProps) {
  const { user, refreshProfile } = useAuth();
  
  const [activeMethod, setActiveMethod] = useState<PaymentMethodType>('qris');
  const [selectedBank, setSelectedBank] = useState<'bca' | 'mandiri' | 'bni'>('bca');
  
  // Card inputs
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getVANumber = () => {
    switch (selectedBank) {
      case 'bca':
        return '3901 0812 3456 7890';
      case 'mandiri':
        return '89608 0812 3456 7890';
      case 'bni':
        return '8810 0812 3456 7890';
      default:
        return '3901 0812 3456 7890';
    }
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText(getVANumber().replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processPayment = async () => {
    if (!user?.id) {
      alert('Silakan login terlebih dahulu.');
      return;
    }
    
    setLoading(true);
    try {
      // Simulate Midtrans notification callback delay (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
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
      console.error('Error simulating Midtrans payment:', err);
      alert('Gagal mensimulasikan pembayaran Midtrans: ' + err.message);
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
      {/* Midtrans Snap Modal Frame */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col w-full max-w-2xl overflow-hidden max-h-[85vh]">
        
        {/* Top Header */}
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-sky-500"></div>
            <span className="text-xs font-bold text-slate-700 tracking-wider">M-Snap Pembayaran</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">Order ID: SF-{Date.now().toString().slice(-6)}</span>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
            >
              <IconX className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="px-6 py-4 bg-sky-50/40 border-b border-slate-100 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merchant</span>
            <span className="text-xs font-bold text-slate-800">ScholarFlow Indonesia</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tagihan</span>
            <span className="text-sm font-extrabold text-indigo-700">{formatPrice(planPrice)}</span>
          </div>
        </div>

        {success ? (
          /* Success Screen */
          <div className="p-10 flex flex-col items-center justify-center text-center gap-4 animate-scale-in">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-500 text-emerald-600">
              <IconCheck className="h-8 w-8 stroke-[3]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-bold text-slate-800">Pembayaran Berhasil!</h3>
              <p className="text-xs text-slate-500 leading-normal max-w-sm">
                Terima kasih. Pembayaran via Midtrans sukses diverifikasi. Akun **{planName}** Anda sudah aktif selama 30 hari ke depan.
              </p>
            </div>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              Kembali ke Workspace
            </button>
          </div>
        ) : (
          /* Payment Interface Split */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[380px]">
            
            {/* Left Column: Menu Methods */}
            <div className="md:w-1/3 bg-slate-50/50 border-r border-slate-100 flex flex-col p-3 gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Pilih Cara Bayar</span>
              
              <button
                onClick={() => setActiveMethod('qris')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition cursor-pointer ${
                  activeMethod === 'qris'
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <IconQrcode className="h-4.5 w-4.5" />
                <span>GoPay / QRIS</span>
              </button>

              <button
                onClick={() => setActiveMethod('va')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition cursor-pointer ${
                  activeMethod === 'va'
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <IconBuildingBank className="h-4.5 w-4.5" />
                <span>Virtual Account</span>
              </button>

              <button
                onClick={() => setActiveMethod('card')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition cursor-pointer ${
                  activeMethod === 'card'
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <IconCreditCard className="h-4.5 w-4.5" />
                <span>Kartu Kredit/Debit</span>
              </button>
            </div>

            {/* Right Column: Checkout Detail Form */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
              
              {activeMethod === 'qris' && (
                /* QRIS payment */
                <div className="flex flex-col items-center text-center gap-4 animate-fade-in">
                  <span className="text-xs font-bold text-slate-700">Bayar dengan GoPay / ShopeePay / e-Wallet</span>
                  
                  {/* Mock QR Code */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm flex flex-col items-center gap-2">
                    <div className="w-36 h-36 bg-slate-100 border border-slate-200/80 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {/* Stylized QR patterns */}
                      <div className="absolute top-2 left-2 w-8 h-8 border-[4px] border-slate-800 rounded"></div>
                      <div className="absolute top-2 right-2 w-8 h-8 border-[4px] border-slate-800 rounded"></div>
                      <div className="absolute bottom-2 left-2 w-8 h-8 border-[4px] border-slate-800 rounded"></div>
                      <div className="w-20 h-20 border-[3px] border-slate-800 border-dashed rounded flex items-center justify-center">
                        <IconQrcode className="h-10 w-10 text-slate-700 animate-pulse" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">NMID: ID10203040506</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <IconClock className="h-4 w-4 text-amber-500" />
                    <span>Masa berlaku kueri bayar: 15 menit</span>
                  </div>

                  <button
                    onClick={processPayment}
                    disabled={loading}
                    className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {loading ? (
                      <IconLoader className="h-4 w-4 animate-spin" />
                    ) : (
                      'Simulasi Konfirmasi Bayar (Scan Sukses)'
                    )}
                  </button>
                </div>
              )}

              {activeMethod === 'va' && (
                /* Virtual Account payment */
                <div className="flex flex-col gap-4 animate-fade-in">
                  <span className="text-xs font-bold text-slate-700">Pilih Virtual Account Bank</span>
                  
                  {/* Bank buttons selection */}
                  <div className="grid grid-cols-3 gap-2">
                    {['bca', 'mandiri', 'bni'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank as any)}
                        className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition cursor-pointer ${
                          selectedBank === bank
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nomor Virtual Account</span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700 tracking-wider">{getVANumber()}</span>
                      <button
                        onClick={handleCopyVA}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
                        title="Salin nomor"
                      >
                        {copied ? (
                          <span className="text-[9px] font-bold text-emerald-600">Tersalin!</span>
                        ) : (
                          <IconCopy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 leading-normal flex flex-col gap-1">
                    <span>1. Salin nomor Virtual Account di atas.</span>
                    <span>2. Transfer nominal tepat via Mobile Banking / ATM.</span>
                    <span>3. Sistem akan memverifikasi pembayaran secara otomatis.</span>
                  </div>

                  <button
                    onClick={processPayment}
                    disabled={loading}
                    className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {loading ? (
                      <IconLoader className="h-4 w-4 animate-spin" />
                    ) : (
                      'Simulasi Transfer Bank (Bayar VA)'
                    )}
                  </button>
                </div>
              )}

              {activeMethod === 'card' && (
                /* Card payment */
                <div className="flex flex-col gap-4 animate-fade-in">
                  <span className="text-xs font-bold text-slate-700">Kartu Kredit / Debit Online</span>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nomor Kartu</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 16))}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500 transition"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Masa Berlaku</label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                          className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500 transition"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">CVV</label>
                        <input
                          type="password"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                          className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500 transition"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={processPayment}
                    disabled={loading}
                    className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {loading ? (
                      <IconLoader className="h-4 w-4 animate-spin" />
                    ) : (
                      `Bayar Sekarang (${formatPrice(planPrice)})`
                    )}
                  </button>
                </div>
              )}

              {/* Info transparan Beli Putus */}
              <div className="mt-4 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center text-[10px] text-slate-500 leading-normal">
                Beli sekali untuk 30 hari. Tanpa perpanjangan otomatis. Anda memegang kendali penuh.
              </div>

              {/* Secure footer badge */}
              <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-[8px] text-slate-400 font-semibold tracking-wider">
                <span>DILINDUNGI OLEH MIDTRANS INTEGRITY</span>
                <span>SECURE PAYMENT GATEWAY</span>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
