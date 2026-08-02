import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';
import { LanguageProvider } from '@/components/i18n/language-context';

export const metadata: Metadata = {
  title: 'ScholarFlow',
  description: 'Academic research workspace with citation management and AI writing assistance.',
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
