'use client';

// App shell: sidebar + main content area
import { Download } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { seedCategories } from '../_lib/categories';
import { useLanguage } from '../_lib/i18n';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [deferredInstall, setDeferredInstall] = useState<Event | null>(null);
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // Background migration
  useEffect(() => {
    seedCategories().catch(console.error);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredInstall(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPWA = async () => {
    if (!deferredInstall) return;
    const prompt = deferredInstall as BeforeInstallPromptEvent;
    prompt.prompt?.();
    const result = await prompt.userChoice;
    if (result.outcome === 'accepted') setDeferredInstall(null);
  };

  if (isAuthPage) {
    return <main className="min-h-screen bg-surface">{children}</main>;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Desktop Sidebar hidden on md:down */}
      <Sidebar />

      <div className="main-with-sidebar relative">
        <div className="fixed top-3 right-3 z-50 md:hidden flex items-center gap-2">
          {deferredInstall && (
            <button
              onClick={installPWA}
              className="btn btn-secondary btn-sm h-9 px-3 rounded-xl border border-surface-3 bg-surface-glass backdrop-blur-xl"
              id="mobile-install-btn"
            >
              <Download size={14} />
              {t.installApp}
            </button>
          )}
        </div>

        <main className="max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt?: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
