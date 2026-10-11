'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  const activeTourRef = useRef<any>(null);
  const userCheckedDontShowRef = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startTour = async () => {
    try {
      const shepherdModule = await import('shepherd.js');
      const Shepherd = shepherdModule.default;
      if (!Shepherd || !Shepherd.Tour) return;

      if (activeTourRef.current) {
        try { activeTourRef.current.complete(); } catch (e) {}
      }

      // Reset ref for each tour session
      userCheckedDontShowRef.current = false;

      const tour = new Shepherd.Tour(tourOptions as any);
      activeTourRef.current = tour;

      const checkboxId = 'sf-dont-show-tour-checkbox';
      const checkboxHtml = `
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" id="${checkboxId}" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-3.5 w-3.5" />
            <span>${isEn ? "Don't show this guide again automatically" : 'Jangan tampilkan panduan ini lagi secara otomatis'}</span>
          </label>
        </div>
      `;

      const syncCheckboxState = () => {
        const checkbox = document.getElementById(checkboxId) as HTMLInputElement | null;
        if (checkbox) {
          userCheckedDontShowRef.current = checkbox.checked;
        }
      };

      const finalizeUserPreference = () => {
        syncCheckboxState();
        if (userCheckedDontShowRef.current) {
          localStorage.setItem('scholarflow.onboarding.v1.seen', 'true');
        } else {
          // If NOT checked, ensure the seen flag is removed so it shows again next time
          localStorage.removeItem('scholarflow.onboarding.v1.seen');
        }
      };

      const steps = [
        {
          id: 'welcome',
          title: isEn ? 'Welcome to ScholarFlow! 👋' : 'Selamat Datang di ScholarFlow! 👋',
          text: `<div><p class="leading-relaxed">${
            isEn 
              ? 'Your AI-powered academic research workspace. Let us show you around briefly so you can get the most out of it.' 
              : 'Ruang kerja penelitian akademik berteknologi AI Anda. Mari ikuti tur singkat ini agar Anda bisa memanfaatkannya dengan maksimal.'
          }</p>${checkboxHtml}</div>`,
          attachTo: { element: 'body', on: 'center' },
          buttons: [
            {
              classes: 'px-3 py-1.5 mt-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold mr-2 transition',
              text: isEn ? 'Skip' : 'Lewati',
              action: () => {
                finalizeUserPreference();
                tour.complete();
              }
            },
            {
              classes: 'px-5 py-2 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm transition',
              text: isEn ? 'Start Tour' : 'Mulai Tur',
              action: () => {
                syncCheckboxState();
                tour.next();
              }
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
              classes: 'px-4 py-2 mt-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 font-semibold text-sm mr-2 transition',
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
              classes: 'px-4 py-2 mt-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 font-semibold text-sm mr-2 transition',
              text: isEn ? 'Back' : 'Kembali',
              action: tour.back
            },
            {
              classes: 'px-5 py-2 mt-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-sm transition',
              text: isEn ? 'Finish' : 'Selesai',
              action: () => {
                finalizeUserPreference();
                tour.complete();
              }
            }
          ]
        }
      ];

      steps.forEach(s => tour.addStep(s as any));

      // Bind dynamic change listener when the first step is shown
      tour.on('show', (e: any) => {
        if (e && e.step && e.step.id === 'welcome') {
          setTimeout(() => {
            const checkbox = document.getElementById(checkboxId) as HTMLInputElement | null;
            if (checkbox) {
              checkbox.checked = userCheckedDontShowRef.current;
              checkbox.onchange = () => {
                userCheckedDontShowRef.current = checkbox.checked;
              };
            }
          }, 50);
        }
      });

      // Handle cancel event (clicking X button on header)
      tour.on('cancel', () => {
        finalizeUserPreference();
      });

      // Handle complete event
      tour.on('complete', () => {
        finalizeUserPreference();
      });

      tour.start();
    } catch (err) {
      console.warn('Failed to start Shepherd tour:', err);
    }
  };

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Listen to manual restart trigger (e.g. from Help modal or button)
    const handleManualRestart = () => {
      startTour();
    };
    window.addEventListener('sf-start-onboarding-tour', handleManualRestart);

    // Check automatic start: ONLY skip if user explicitly set seen flag
    const hasSeenTour = localStorage.getItem('scholarflow.onboarding.v1.seen');
    let timer: NodeJS.Timeout | null = null;
    if (hasSeenTour !== 'true') {
      timer = setTimeout(() => {
        startTour();
      }, 1500);
    }

    return () => {
      window.removeEventListener('sf-start-onboarding-tour', handleManualRestart);
      if (timer) clearTimeout(timer);
    };
  }, [mounted, isEn]);

  return null;
}
