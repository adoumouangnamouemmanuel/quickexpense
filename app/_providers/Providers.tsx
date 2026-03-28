'use client';

// Root providers wrapper for QuickExpense
// Wraps all client-side context providers
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { LanguageProvider } from '../_lib/i18n';
import type { ReactNode } from 'react';
import { PWARegister } from '../_components/PWARegister';
import { AuthProvider } from '../_lib/auth';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <LanguageProvider>
          <PWARegister />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: 'inherit',
              },
            }}
            richColors
          />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
