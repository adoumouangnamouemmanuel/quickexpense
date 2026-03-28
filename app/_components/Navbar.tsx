'use client';

// Top navigation bar (mobile hamburger + page title)
import { Menu } from 'lucide-react';
import { useLanguage } from '../_lib/i18n';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { t } = useLanguage();
  const pathname = usePathname();

  const titles: Record<string, string> = {
    '/': t.dashboard,
    '/transactions': t.transactions,
    '/reports': t.reports,
    '/settings': t.settings,
  };

  const title = titles[pathname] ?? 'QuickExpense';

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-3 px-4 h-14"
      style={{
        background: 'var(--color-surface-2)',
        borderBottom: '1px solid var(--color-surface-3)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <button
        className="btn btn-ghost btn-icon md:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
        id="menu-toggle-btn"
      >
        <Menu size={20} />
      </button>
      <h1 className="text-base font-semibold">{title}</h1>
    </header>
  );
}
