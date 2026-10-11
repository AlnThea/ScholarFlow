'use client';

import React, { useEffect, useState } from 'react';
import 'shepherd.js/dist/css/shepherd.css';
import { useLanguage } from '@/components/i18n/language-context';

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    },
    classes: 'shadow-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl p-2 font-sans',
    scrollTo: { behavior: 'smooth', block: 'center' }
  },
  useModalOverlay: true
};

export function OnboardingTour() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const hasSeenTour = localStorage.getItem('scholarflow.onboarding.v1.seen');
    if (hasSeenTour) return;

    const timer = setTimeout(async () => {
      try {
        const shepherdModule = await import('shepherd.js');
        const Shepherd = shepherdModule.default;
        if (!Shepherd || !Shepherd.Tour) return;

        const tour = new Shepherd.Tour(tourOptions as any);

        const steps = [
          {
            id: 'welcome',
            title: isEn ? 'Welcome to ScholarFlow! 👋' : 'Selamat Datang di ScholarFlow! 👋',
            text: isEn 
              ? 'Your AI-powered academic research workspace. Let us show you around briefly so you can get the most out of it.' 
              : 'Ruang kerja penelitian akademik berteknologi AI Anda. Mari ikuti tur singkat ini agar Anda bisa memanfaatkannya dengan maksimal.',
            attachTo: { element: 'body', on: 'center' },
            buttons: [
              {
                classes: 'px-5 py-2 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm transition',
                text: isEn ? 'Start Tour' : 'Mulai Tur',
                action: tour.next
              }
            ]
          },
          {
            id: 'sidebar-library',
            title: isEn ? '📚 Your Library & References' : '📚 Pustaka & Referensi Anda',
            text: isEn 
              ? 'Manage all your PDF references, citations, and folders here. We automatically extract metadata for you.' 
              : 'Kelola semua referensi PDF, sitasi, dan folder Anda di sini. Kami akan mengekstrak metadatanya secara otomatis.',
            attachTo: { element: '[data-tour="sidebar-library"]', on: 'right' },
            buttons: [
              {
                classes: 'px-4 py-2 mt-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm mr-2 transition',
                text: isEn ? 'Back' : 'Kembali',
                action: tour.back
              },
              {
                classes: 'px-5 py-2 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm transition',
                text: isEn ? 'Next' : 'Lanjut',
                action: tour.next
              }
            ]
          },
          {
            id: 'create-document',
            title: isEn ? '✍️ Start Writing' : '✍️ Mulai Menulis',
            text: isEn 
              ? 'Create a new blank document or open an existing draft to start your AI-assisted academic writing.' 
              : 'Buat dokumen kosong baru atau buka draf yang ada untuk mulai menulis karya ilmiah berbantuan AI.',
            attachTo: { element: '[data-tour="create-document"]', on: 'bottom' },
            buttons: [
              {
                classes: 'px-4 py-2 mt-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm mr-2 transition',
                text: isEn ? 'Back' : 'Kembali',
                action: tour.back
              },
              {
                classes: 'px-5 py-2 mt-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-sm transition',
                text: isEn ? 'Finish' : 'Selesai',
                action: () => {
                  tour.complete();
                  localStorage.setItem('scholarflow.onboarding.v1.seen', 'true');
                }
              }
            ]
          }
        ];

        steps.forEach(s => tour.addStep(s as any));
        tour.start();
        localStorage.setItem('scholarflow.onboarding.v1.seen', 'true');
      } catch (err) {
        console.warn('Failed to start Shepherd tour:', err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [mounted, isEn]);

  return null;
}
