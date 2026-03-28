'use client';

// Sidebar navigation component
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ListOrdered,
  BarChart3,
  Settings,
  X,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../_lib/i18n';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', label: t.dashboard, icon: LayoutDashboard },
    { href: '/transactions', label: t.transactions, icon: ListOrdered },
    { href: '/reports', label: t.reports, icon: BarChart3 },
    { href: '/settings', label: t.settings, icon: Settings },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
          style={{ backdropFilter: 'blur(2px)' }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-2 mb-6">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, oklch(0.52 0.24 265), oklch(0.44 0.22 285))',
              }}
            >
              <Zap size={16} className="text-white" />
            </div>
            <span
              className="text-lg font-bold"
              style={{ color: 'oklch(0.52 0.24 265)' }}
            >
              QuickExpense
            </span>
          </div>
          <button
            className="btn btn-ghost btn-icon md:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--color-surface-3)' }}>
          <div className="flex items-center justify-between px-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
