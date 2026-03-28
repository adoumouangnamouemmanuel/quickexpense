"use client";

// Root providers wrapper for QuickExpense
// Wraps all client-side context providers
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { PWARegister } from "../_components/PWARegister";
import { AuthProvider } from "../_lib/auth";
import { LanguageProvider } from "../_lib/i18n";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
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
