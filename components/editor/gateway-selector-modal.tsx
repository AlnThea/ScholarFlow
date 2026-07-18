// components/editor/gateway-selector-modal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { IconX, IconCreditCard, IconWallet, IconLoader, IconArrowRight } from '@tabler/icons-react';
import { fetchPaymentGateways, type PaymentGateway } from '@/lib/api/payment-gateways';

interface GatewaySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGateway: (gatewayId: 'stripe' | 'midtrans') => void;
}

export function GatewaySelectorModal({
  isOpen,
  onClose,
  onSelectGateway
}: GatewaySelectorModalProps) {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchPaymentGateways()
        .then((data) => {
          // Filter only enabled gateways
          const enabled = data.filter((g) => g.is_enabled);
          setGateways(enabled);
          
          // Auto-select if only 1 is active
          if (enabled.length === 1) {
            onSelectGateway(enabled[0].id as 'stripe' | 'midtrans');
            onClose();
          }
        })
        .catch((err) => {
          console.error('Error fetching gateways in selector:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen || gateways.length <= 1) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xs font-bold text-slate-800">Pilih Jalur Pembayaran</h3>
            <p className="text-[10px] text-slate-400">Pilih gerbang pembayaran yang sesuai dengan lokasi Anda.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <IconX className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 flex flex-col gap-3">
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <IconLoader className="h-6 w-6 text-indigo-600 animate-spin" />
              <span className="text-[10px] text-slate-400">Memeriksa metode aktif...</span>
            </div>
          ) : (
            gateways.map((g) => {
              const isStripe = g.id === 'stripe';
              
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    onSelectGateway(g.id as any);
                    onClose();
                  }}
                  className="w-full border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10 p-4 rounded-xl text-left flex items-start gap-4 transition group cursor-pointer"
                >
                  <div className={`p-2.5 rounded-lg transition ${
                    isStripe 
                      ? 'bg-indigo-50 text-indigo-600 group-hover:scale-105' 
                      : 'bg-emerald-50 text-emerald-600 group-hover:scale-105'
                  }`}>
                    {isStripe ? <IconCreditCard className="h-5 w-5" /> : <IconWallet className="h-5 w-5" />}
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      {isStripe ? 'Kartu Kredit Global (Stripe)' : 'E-Wallet & Bank Lokal (Midtrans)'}
                      <IconArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition text-indigo-600" />
                    </span>
                    <span className="text-[10px] text-slate-400 leading-normal">
                      {isStripe 
                        ? 'Cocok untuk pembayaran internasional dengan kartu kredit/debit global.' 
                        : 'Cocok untuk Indonesia. Bayar dengan GoPay, QRIS, atau Virtual Account Bank lokal.'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
