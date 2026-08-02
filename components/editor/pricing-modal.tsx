// components/editor/pricing-modal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { IconX, IconCheck, IconStar, IconBuildingBank, IconUser, IconLoader } from '@tabler/icons-react';
import { fetchPricingPlans, type PricingPlan } from '@/lib/api/pricing';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '../i18n/language-context';
import { StripeCheckoutModal } from './stripe-checkout-modal';
import { MidtransCheckoutModal } from './midtrans-checkout-modal';
import { GatewaySelectorModal } from './gateway-selector-modal';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const { language, t } = useLanguage();
  const { profile } = useAuth();
  const activePlanId = profile?.subscription_plan || 'free';
  const planPeriodEnd = profile?.subscription_end;

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);

  // Selector and Payment Checkout States
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [isMidtransOpen, setIsMidtransOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchPricingPlans()
        .then((data) => {
          setPlans(data);
        })
        .catch((err) => {
          console.error('Error fetching plans in modal:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(price)}`;
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <IconUser className="h-4 w-4" />;
      case 'pro':
        return <IconStar className="h-4 w-4" />;
      case 'institution':
        return <IconBuildingBank className="h-4 w-4" />;
      default:
        return <IconUser className="h-4 w-4" />;
    }
  };

  const getPlanIconClass = (planId: string) => {
    if (planId === 'pro') return 'p-1.5 bg-indigo-55 text-indigo-600 rounded-lg bg-indigo-50';
    return 'p-1.5 bg-slate-100 text-slate-500 rounded-lg';
  };

  const handleSubscribe = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsSelectorOpen(true);
  };

  const handleSelectGateway = (gatewayId: 'stripe' | 'midtrans') => {
    if (gatewayId === 'stripe') {
      setIsStripeOpen(true);
    } else {
      setIsMidtransOpen(true);
    }
  };

  const getLocalizedPlan = (plan: PricingPlan) => {
    if (language === 'id') return plan;
    
    const planTranslations: Record<string, {
      name: string;
      description: string;
      price_period: string;
      features: string[];
    }> = {
      free: {
        name: 'Free Starter',
        description: 'Basic access for single writers starting out.',
        price_period: 'month',
        features: [
          '1 Active document',
          'Limit of 3 Chapters per Project',
          'Limit of 500 words per AI polish',
          'Auto-save draft drafts',
          'Basic citation styles'
        ]
      },
      pro: {
        name: 'Pro Writer',
        description: 'The best solution for professional researchers and thesis students.',
        price_period: 'month',
        features: [
          'Unlimited Documents & Projects',
          'No word limit on AI polishing',
          'Automated AI Citation Suggestion',
          'Export to MS Word (.docx)',
          'Priority technical support'
        ]
      },
      institution: {
        name: 'Institutional / Campus',
        description: 'For universities, libraries, or large research groups.',
        price_period: 'year',
        features: [
          'Team management & collaboration',
          'Bulk institutional licensing',
          'Campus repository integration',
          'Dedicated onboarding training',
          '24/7 SLA Technical Support'
        ]
      }
    };

    const trans = planTranslations[plan.id];
    if (!trans) return plan;

    return {
      ...plan,
      name: trans.name,
      description: trans.description,
      price_period: trans.price_period,
      features: trans.features,
      promo_text: plan.promo_text ? (plan.promo_text === 'Hemat 20%' ? 'Save 20%' : plan.promo_text) : undefined
    };
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all animate-fade-in font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-bold text-slate-800">{t('pricing.title')}</h2>
              <p className="text-xs text-slate-400">{t('pricing.subtitle')}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          {/* Loading Spinner */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <IconLoader className="h-8 w-8 text-indigo-600 animate-spin" />
              <span className="text-xs text-slate-400 font-semibold">
                {language === 'en' ? 'Loading subscription plans...' : 'Memuat paket langganan...'}
              </span>
            </div>
          ) : (
            /* Pricing Cards Grid */
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((p) => {
                const plan = getLocalizedPlan(p);
                const isPro = plan.id === 'pro';
                const isUserPlan = activePlanId === plan.id;
                
                return (
                  <div
                    key={plan.id}
                    className={`border rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition relative ${
                      isPro 
                        ? 'border-2 border-indigo-500 bg-white shadow-lg transform hover:scale-[1.02]' 
                        : 'border-slate-200 bg-slate-50/30'
                    }`}
                  >
                    {/* Promo Badge */}
                    {plan.promo_text && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
                        {plan.promo_text}
                      </div>
                    )}

                    {/* Popular Badge fallback if no promo */}
                    {!plan.promo_text && plan.is_popular && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm flex items-center gap-1">
                        <IconStar className="h-3 w-3 fill-white" />
                        {language === 'en' ? 'Popular' : 'Terpopuler'}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={getPlanIconClass(plan.id)}>
                          {getPlanIcon(plan.id)}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          isPro ? 'text-indigo-600' : 'text-slate-500'
                        }`}>
                          {plan.name}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        {plan.id === 'institution' ? (
                          <span className="text-2xl font-bold text-slate-800">
                            {language === 'en' ? 'Contact Us' : 'Hubungi Kami'}
                          </span>
                        ) : (
                          <span className="text-2xl font-bold text-slate-800">
                            {formatPrice(plan.price)}
                          </span>
                        )}
                        <span className="text-xs text-slate-400"> / {plan.price_period}</span>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 leading-normal mb-6">
                        {plan.description}
                      </p>
                      
                      <div className="h-px bg-slate-200/60 mb-6" />
                      
                      <ul className="flex flex-col gap-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[11px] text-slate-600">
                            <IconCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className={isPro ? 'font-medium text-slate-700' : ''}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isUserPlan ? (
                      <button 
                        disabled
                        className="mt-8 w-full py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <IconCheck className="h-4 w-4" />
                        {plan.id === 'free' 
                          ? (language === 'en' ? 'Active (Default Plan)' : 'Aktif (Paket Bawaan)') 
                          : planPeriodEnd 
                            ? (language === 'en' ? `Active Plan (until ${new Date(planPeriodEnd).toLocaleDateString()})` : `Paket Aktif (s/d ${new Date(planPeriodEnd).toLocaleDateString()})`)
                            : (language === 'en' ? 'Active Plan' : 'Paket Aktif')
                        }
                      </button>
                    ) : plan.id === 'free' ? (
                      <button 
                        onClick={onClose}
                        className="mt-8 w-full py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        {language === 'en' ? 'Back to Workspace' : 'Kembali ke Workspace'}
                      </button>
                    ) : plan.id === 'pro' ? (
                      <button 
                        onClick={() => handleSubscribe(p)}
                        className="mt-8 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
                      >
                        {language === 'en' ? 'Subscribe Now' : 'Berlangganan Sekarang'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => alert(language === 'en' ? "Contact our team at support@scholarflow.app for custom institutional proposals." : "Hubungi tim kami di support@scholarflow.app untuk proposal institusi khusus.")}
                        className="mt-8 w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        {language === 'en' ? 'Contact Sales' : 'Hubungi Tim Sales'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Gateway Selector Modal */}
      <GatewaySelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelectGateway={handleSelectGateway}
      />

      {/* Stripe Checkout Modal popup */}
      {selectedPlan && (
        <StripeCheckoutModal
          isOpen={isStripeOpen}
          onClose={() => setIsStripeOpen(false)}
          planId={selectedPlan.id}
          planName={getLocalizedPlan(selectedPlan).name}
          planPrice={selectedPlan.price}
          planPeriod={getLocalizedPlan(selectedPlan).price_period}
          onSuccess={() => {
            alert(language === 'en' 
              ? `Congratulations! You have successfully subscribed to ${getLocalizedPlan(selectedPlan).name} via Stripe.`
              : `Selamat! Anda telah berhasil berlangganan ${selectedPlan.name} via Stripe.`
            );
          }}
        />
      )}

      {/* Midtrans Checkout Modal popup */}
      {selectedPlan && (
        <MidtransCheckoutModal
          isOpen={isMidtransOpen}
          onClose={() => setIsMidtransOpen(false)}
          planId={selectedPlan.id}
          planName={getLocalizedPlan(selectedPlan).name}
          planPrice={selectedPlan.price}
          planPeriod={getLocalizedPlan(selectedPlan).price_period}
          onSuccess={() => {
            alert(language === 'en'
              ? `Congratulations! You have successfully subscribed to ${getLocalizedPlan(selectedPlan).name} via Midtrans.`
              : `Selamat! Anda telah berhasil berlangganan ${selectedPlan.name} via Midtrans.`
            );
          }}
        />
      )}
    </>
  );
}
