'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, BarChart3, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ReceiptText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 glass md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 min-w-[4rem] group"
            >
              <div
                className={`flex items-center justify-center p-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'text-[oklch(0.52_0.24_265)] bg-[oklch(0.52_0.24_265_/_0.15)] dark:text-[oklch(0.75_0.18_265)]'
                    : 'text-[oklch(0.60_0.01_265)] group-hover:text-[oklch(0.15_0.01_265)] dark:group-hover:text-white'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium transition-all ${
                  isActive
                    ? 'text-[oklch(0.52_0.24_265)] dark:text-[oklch(0.75_0.18_265)]'
                    : 'text-[oklch(0.60_0.01_265)]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
