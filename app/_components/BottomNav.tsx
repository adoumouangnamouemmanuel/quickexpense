'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, BarChart3, Settings, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ReceiptText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-white dark:bg-[#1a1825] border-t border-gray-200 dark:border-gray-800/60 md:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-around px-2 py-2">
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
                className={`flex items-center justify-center transition-colors duration-200 ${
                  isActive
                    ? 'text-black dark:text-white'
                    : 'text-[#94a3b8] group-hover:text-black dark:group-hover:text-white'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-black dark:text-white'
                    : 'text-[#94a3b8]'
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
