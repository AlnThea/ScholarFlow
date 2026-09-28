'use client';

import React, { useContext, useEffect, useState } from 'react';
import { ShepherdTour, ShepherdTourContext } from 'react-shepherd';
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

function TourInstance() {
  const tour = useContext(ShepherdTourContext);
  
  useEffect(() => {
    // Check if running in browser
    if (typeof window !== 'undefined') {
      const hasSeenTour = localStorage.getItem('scholarflow.onboarding.v1.seen');
      // Adding a small delay to ensure DOM is fully rendered
      if (!hasSeenTour && tour) {
        setTimeout(() => {
          tour.start();
          localStorage.setItem('scholarflow.onboarding.v1.seen', 'true');
        }, 1500);
      }
    }
  }, [tour]);

  return null;
}

export function OnboardingTour() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
          type: 'next'
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
          type: 'back'
        },
        {
          classes: 'px-5 py-2 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm transition',
          text: isEn ? 'Next' : 'Lanjut',
          type: 'next'
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
          type: 'back'
        },
        {
          classes: 'px-5 py-2 mt-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-sm transition',
          text: isEn ? 'Finish' : 'Selesai',
          type: 'next'
        }
      ]
    }
  ];

  return (
    <ShepherdTour steps={steps as any} tourOptions={tourOptions}>
      <TourInstance />
    </ShepherdTour>
  );
}
