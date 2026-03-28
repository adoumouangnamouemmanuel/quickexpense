import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './_providers/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f7ff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1825' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'QuickExpense – Simple Expense Tracker',
  description:
    'A beautiful, local-first expense tracker. Track income and expenses offline. No account needed. Works in English and French.',
  keywords: ['expense tracker', 'budget', 'finance', 'local-first', 'PWA', 'offline'],
  authors: [{ name: 'QuickExpense' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QuickExpense',
  },
  openGraph: {
    title: 'QuickExpense – Simple Expense Tracker',
    description: 'Track smarter, spend better. 100% local, bilingual, PWA.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body suppressHydrationWarning className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
