'use client';

// Desktop Sidebar navigation component
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  Settings,
  Zap,
  Star,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useLanguage } from '../_lib/i18n';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../_lib/auth';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  // Hide entirely on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null;
  }

  const navItems = [
    { href: '/', label: t.dashboard, icon: LayoutDashboard },
    { href: '/transactions', label: t.transactions, icon: ReceiptText },
    { href: '/reports', label: t.reports, icon: BarChart3 },
    { href: '/settings', label: t.settings, icon: Settings },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-[var(--color-surface-2)] border-r border-[var(--color-surface-3)] p-5 hidden md:flex flex-col z-30 transition-transform">
      {/* Logo */}
      <div className="flex items-center gap-2 px-1 mb-8">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-black dark:bg-white shadow-sm">
          <Zap size={16} className="text-white dark:text-black fill-current" />
        </div>
        <span className="text-lg font-bold tracking-tight text-black dark:text-white">
          QuickExpense
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Premium CTA / User Profile */}
      <div className="mb-4">
        {user ? (
          <div className="p-3 rounded-xl bg-[var(--color-surface-3)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 text-black dark:text-white flex justify-center items-center shrink-0">
              <UserIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-black dark:text-white">{user.name}</p>
              {user.isPro ? (
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] font-bold flex items-center gap-1">
                  <Star size={10} className="fill-current" /> Pro Member
                </span>
              ) : (
                <Link href="/premium" className="text-[10px] uppercase font-bold text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors">
                  Free Tier <Star size={10} />
                </Link>
              )}
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link href="/login" className="block text-center w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium text-sm hover:opacity-90 transition-opacity">
            Sign In for Cloud Sync
          </Link>
        )}
      </div>

      {/* Bottom controls */}
      <div className="pt-4 border-t border-[var(--color-surface-3)] flex items-center justify-between">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </aside>
  );
}
