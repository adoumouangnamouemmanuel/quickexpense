'use client';

// Registers the PWA service worker on mount
import { useEffect } from 'react';

type QEInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

declare global {
  interface Window {
    __qeDeferredInstallPrompt?: QEInstallPromptEvent | null;
  }
}

export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__qeDeferredInstallPrompt = e as QEInstallPromptEvent;
      window.dispatchEvent(new CustomEvent('qe:installprompt-available'));
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    // In dev, unregister stale workers to prevent chunk/version skew issues.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((reg) => reg.unregister())))
        .then(async () => {
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
          }
        })
        .catch((err) => {
          console.warn('[SW] Dev cleanup failed:', err);
        });
      return () => {
        window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      };
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[SW] Registered:', reg.scope);
      })
      .catch((err) => {
        console.error('[SW] Registration failed:', err);
      });

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  return null;
}
