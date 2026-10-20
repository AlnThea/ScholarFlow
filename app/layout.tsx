import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';
import { LanguageProvider } from '@/components/i18n/language-context';

export const metadata: Metadata = {
  title: 'ScholarFlow',
  description: 'Academic research workspace with citation management and AI writing assistance.',
  icons: {
    icon: [
      { url: '/assets/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'ScholarFlow - Academic Research Workspace',
    description: 'Academic research workspace with citation management and AI writing assistance.',
    images: [
      {
        url: '/assets/og-social-share-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'ScholarFlow Workspace',
      },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-surface text-text antialiased">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
