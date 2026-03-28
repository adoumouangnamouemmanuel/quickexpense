"use client";

// Desktop Sidebar navigation component
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings,
  Star,
  User as UserIcon,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../_lib/auth";
import { useLanguage } from "../_lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  // Hide entirely on auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return null;
  }

  const navItems = [
    { href: "/", label: t.dashboard, icon: LayoutDashboard },
    { href: "/transactions", label: t.transactions, icon: ReceiptText },
    { href: "/reports", label: t.reports, icon: BarChart3 },
    { href: "/settings", label: t.settings, icon: Settings },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-[var(--color-surface-2)] border-r border-[var(--color-surface-3)] p-5 hidden md:flex flex-col z-30 transition-transform">
      {/* Logo */}
      <div className="flex items-center gap-2 px-1 mb-8">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-brand-900 dark:bg-brand-100 shadow-sm">
          <Zap
            size={16}
            className="text-white dark:text-brand-900 fill-current"
          />
        </div>
        <span className="text-lg font-bold tracking-tight text-[var(--color-brand-900)] dark:text-white">
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
              className={`nav-item ${isActive ? "active" : ""}`}
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
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1c1c1e] border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 text-black dark:text-white flex justify-center items-center shrink-0">
                <UserIcon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-black dark:text-white">
                  {user.name}
                </p>
                {user.isPro ? (
                  <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-500 font-bold flex items-center gap-1">
                    <Star size={10} className="fill-current" /> Pro Member
                  </span>
                ) : (
                  <Link
                    href="/premium"
                    className="text-[10px] uppercase font-bold text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    Free Tier <Star size={10} />
                  </Link>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md z-10 relative"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
            {!user.isPro && (
              <Link
                href="/premium"
                className="absolute inset-0 z-0 bg-transparent hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
              />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/premium"
              className="flex items-center gap-2 w-full p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/50 text-amber-800 dark:text-amber-400 hover:shadow-md transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/60 dark:bg-black/40 flex items-center justify-center shrink-0 shadow-sm border border-amber-100 dark:border-amber-800/50">
                <Star size={14} className="fill-current text-amber-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-0.5">
                  QuickExpense Pro
                </p>
                <p className="text-[10px] font-medium leading-tight opacity-80 group-hover:opacity-100 transition-opacity">
                  Unlock cloud sync & unlimited tracking
                </p>
              </div>
            </Link>
            <Link
              href="/login"
              className="block text-center w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-medium text-sm hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white transition-all"
            >
              {t.signInCloud}
            </Link>
          </div>
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
