"use client";

import {
  BarChart3,
  LayoutDashboard,
  LogIn,
  ReceiptText,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../_lib/auth";
import { useLanguage } from "../_lib/i18n";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = user
    ? NAV_ITEMS
    : [
        ...NAV_ITEMS,
        { href: "/login", label: t.login, icon: LogIn },
      ];

  const labels: Record<string, string> = {
    "/": t.dashboard,
    "/transactions": t.transactions,
    "/reports": t.reports,
    "/settings": t.settings,
    "/login": t.login,
  };

  // Hide on auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 md:hidden pb-[env(safe-area-inset-bottom)] border-t border-surface-3 bg-surface-glass backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-2.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 min-w-16 group"
            >
              <div
                className={`flex items-center justify-center transition-colors duration-200 ${
                  isActive
                    ? "text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white"
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {labels[item.href] ?? item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
