'use client';

import React, { useEffect, useState, useRef } from 'react';
import 'shepherd.js/dist/css/shepherd.css';
import { useLanguage } from '@/components/i18n/language-context';

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    },
    classes: 'shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl p-3 font-sans max-w-sm',
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
          localStorage.removeItem('scholarflow.onboarding.v1.seen');
        }
      };

      const steps = [
        // 1. Welcome
        {
          id: 'welcome',
          title: isEn ? 'Welcome to ScholarFlow! 👋' : 'Selamat Datang di ScholarFlow! 👋',
          text: `<div><p class="leading-relaxed text-xs text-slate-600 dark:text-slate-300">${
            isEn 
              ? 'Your all-in-one AI Academic Writing Co-Pilot. Let us show you around every toolbar and feature briefly!' 
              : 'Ruang kerja penelitian akademik berteknologi AI Anda. Mari jelajahi setiap toolbar dan fiturnya secara singkat!'
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
              classes: 'px-5 py-2 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-xs transition shadow-sm',
              text: isEn ? 'Start Tour' : 'Mulai Tur',
              action: () => {
                syncCheckboxState();
                tour.next();
              }
            }
          ]
        },

        // 2. Toolbar: Edit Mode vs Suggesting Mode
        {
          id: 'toolbar-modes',
          title: isEn ? '✍️ Editing & Suggesting Modes' : '✍️ Mode Edit & Mode Sugesti',
          text: isEn
            ? 'Switch between **Direct Edit** (write directly onto manuscript) and **Suggesting** (track changes / revisions like Google Docs & Word).'
            : 'Pilih antara **Edit Langsung** (menulis langsung di draf) atau **Mode Sugesti** (track changes / usulan revisi kolaboratif).',
          attachTo: { element: '[data-tour="toolbar-modes"]', on: 'bottom' },
          buttons: [
            {
              classes: 'px-3 py-1.5 mt-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 text-xs font-semibold mr-2 transition',
              text: isEn ? 'Back' : 'Kembali',
              action: tour.back
            },
            {
              classes: 'px-4 py-1.5 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-semibold transition',
              text: isEn ? 'Next' : 'Lanjut',
              action: tour.next
            }
          ]
        },

        // 3. Toolbar: Undo / Redo
        {
          id: 'toolbar-undo-redo',
          title: isEn ? '↩️ Undo & Redo History' : '↩️ Riwayat Undo & Redo',
          text: isEn
            ? 'Full block-level history manager. Easily revert mistakes or restore changes while editing.'
            : 'Pengelola riwayat ketikan berbasis blok. Kembalikan atau ulangi perubahan tulisan Anda dengan aman.',
          attachTo: { element: '[data-tour="toolbar-undo-redo"]', on: 'bottom' },
          buttons: [
            {
              classes: 'px-3 py-1.5 mt-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 text-xs font-semibold mr-2 transition',
              text: isEn ? 'Back' : 'Kembali',
              action: tour.back
            },
            {
              classes: 'px-4 py-1.5 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-semibold transition',
              text: isEn ? 'Next' : 'Lanjut',
              action: tour.next
            }
          ]
        },

        // 4. Toolbar: Inline Academic Citation
        {
          id: 'toolbar-citation',
          title: isEn ? '🏷️ Inline Academic Citation' : '🏷️ Sisipkan Sitasi Ilmiah',
          text: isEn
            ? 'Quickly insert citations (e.g. APA, IEEE, Harvard) connected directly to your reference library with one click.'
            : 'Sisipkan sitasi akademik instan (gaya APA, IEEE, Harvard) yang otomatis terhubung ke daftar pustaka Anda.',
          attachTo: { element: '[data-tour="toolbar-citation"]', on: 'bottom' },
          buttons: [
            {
              classes: 'px-3 py-1.5 mt-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 text-xs font-semibold mr-2 transition',
              text: isEn ? 'Back' : 'Kembali',
              action: tour.back
            },
            {
              classes: 'px-4 py-1.5 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-semibold transition',
              text: isEn ? 'Next' : 'Lanjut',
              action: tour.next
            }
          ]
        },

        // 5. Header: Realtime Sync & WS
        {
          id: 'header-sync-status',
          title: isEn ? '⚡ Realtime Sync Status' : '⚡ Status Sinkronisasi Realtime',
          text: isEn
            ? 'Indicates live WebSocket connection status and cloud auto-save. Your writing is continuously backed up locally & to cloud.'
            : 'Menunjukkan status koneksi WebSocket dan auto-save cloud. Ketikan Anda selalu tersimpan otomatis baik lokal maupun cloud.',
          attachTo: { element: '[data-tour="header-sync-status"]', on: 'bottom' },
          buttons: [
            {
              classes: 'px-3 py-1.5 mt-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 text-xs font-semibold mr-2 transition',
              text: isEn ? 'Back' : 'Kembali',
              action: tour.back
            },
            {
              classes: 'px-4 py-1.5 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-semibold transition',
              text: isEn ? 'Next' : 'Lanjut',
              action: tour.next
            }
          ]
        },

        // 6. Header: Export
        {
          id: 'header-export',
          title: isEn ? '📥 High-Fidelity Export' : '📥 Ekspor Naskah & Sitasi',
          text: isEn
            ? 'Export your complete manuscript to MS Word (.docx/.doc MHTML) with embedded images and formulas, PDF, or export bibliography to BibTeX, RIS, & JSON.'
            : 'Ekspor naskah Anda ke Microsoft Word (.doc) lengkap dengan gambar & rumus, cetak PDF, atau unduh daftar pustaka ke format BibTeX, RIS, & JSON.',
          attachTo: { element: '[data-tour="header-export"]', on: 'bottom' },
          buttons: [
            {
              classes: 'px-3 py-1.5 mt-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 text-xs font-semibold mr-2 transition',
              text: isEn ? 'Back' : 'Kembali',
              action: tour.back
            },
            {
              classes: 'px-4 py-1.5 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-semibold transition',
              text: isEn ? 'Next' : 'Lanjut',
              action: tour.next
            }
          ]
        },

        // 7. Header: Notifications & Collaboration
        {
          id: 'header-notifications',
          title: isEn ? '🔔 Collaborative Notifications' : '🔔 Notifikasi & Kolaborasi',
          text: isEn
            ? 'Receive live notifications when co-authors review comments, approve suggestions, or propose revisions on your manuscript.'
            : 'Terima notifikasi instan saat rekan peneliti membalas komentar, menyetujui usulan teks, atau merevisi naskah Anda.',
          attachTo: { element: '[data-tour="header-notifications"]', on: 'bottom' },
          buttons: [
            {
              classes: 'px-3 py-1.5 mt-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 text-xs font-semibold mr-2 transition',
              text: isEn ? 'Back' : 'Kembali',
              action: tour.back
            },
            {
              classes: 'px-4 py-1.5 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-semibold transition',
              text: isEn ? 'Next' : 'Lanjut',
              action: tour.next
            }
          ]
        },

        // 8. Right Sidebar: Burstiness & AI Co-Pilot
        {
          id: 'sidebar-burstiness',
          title: isEn ? '📊 AI Burstiness & Anti-AI Score' : '📊 Skor AI Burstiness & Ritme',
          text: isEn
            ? 'Analyze sentence variation and vocabulary diversity. A higher burstiness score ensures your academic manuscript sounds natural and bypasses AI detection.'
            : 'Analisis variasi panjang kalimat dan kosakata. Skor burstiness yang tinggi memastikan gaya penulisan alami menyerupai tulisan manusia dan lolos deteksi AI.',
          attachTo: { element: '[data-tour="sidebar-tab-burstiness"]', on: 'left' },
          buttons: [
            {
              classes: 'px-3 py-1.5 mt-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 text-xs font-semibold mr-2 transition',
              text: isEn ? 'Back' : 'Kembali',
              action: tour.back
            },
            {
              classes: 'px-4 py-1.5 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-semibold transition',
              text: isEn ? 'Next' : 'Lanjut',
              action: tour.next
            }
          ]
        },

        // 9. Right Sidebar: Research Assistant Toggle
        {
          id: 'header-research-assistant',
          title: isEn ? '✨ Research Assistant Panel' : '✨ Bilah Asisten Riset',
          text: isEn
            ? 'Toggle this panel anytime to access Literature Review synthesizer, AI Paraphrase Studio, Citation Library, and Plagiarism checks.'
            : 'Buka atau tutup bilah ini kapan saja untuk mengakses asisten sintesis pustaka, parafrase AI, perpustakaan PDF, dan pengecekan plagiasi.',
          attachTo: { element: '[data-tour="header-research-assistant"]', on: 'bottom' },
          buttons: [
            {
              classes: 'px-3 py-1.5 mt-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 text-xs font-semibold mr-2 transition',
              text: isEn ? 'Back' : 'Kembali',
              action: tour.back
            },
            {
              classes: 'px-5 py-2 mt-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-semibold transition shadow-sm',
              text: isEn ? 'Finish Tour 🚀' : 'Selesai 🚀',
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
