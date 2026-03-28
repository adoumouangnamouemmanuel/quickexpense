"use client";

// Root providers wrapper for QuickExpense
// Wraps all client-side context providers
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { PWARegister } from "../_components/PWARegister";
import { AuthProvider } from "../_lib/auth";
import { LanguageProvider } from "../_lib/i18n";
import { ThemeProvider } from "../_lib/theme";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <PWARegister />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: "inherit",
              },
            }}
            richColors
          />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
