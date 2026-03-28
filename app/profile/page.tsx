'use client';

import { useAuth } from '../_lib/auth';
import { useLanguage } from '../_lib/i18n';
import Link from 'next/link';
import { User, LogOut, Star, Wallet, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6">
          <User size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-black dark:text-white">Your Profile</h1>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
          Sign in or create an account to unlock cloud sync, custom categories, and premium features.
        </p>
        <div className="w-full flex flex-col gap-3 max-w-sm">
          <Link href="/login" className="btn bg-black text-white dark:bg-white dark:text-black hover:opacity-90 w-full py-3">
            {t.login || 'Log In'}
          </Link>
          <Link href="/signup" className="btn bg-gray-100 text-black dark:bg-[#1a1825] dark:text-white hover:bg-gray-200 dark:hover:bg-[#252233] w-full py-3">
            {t.signup || 'Sign Up'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 md:px-0">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Profile Settings</h1>

      {/* User Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-md">
            <span className="text-2xl text-white dark:text-black font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Pro Banner */}
        <Link href="/premium" className="card flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 dark:bg-[#1a1825] dark:hover:bg-[#252233] transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.isPro ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
              <Star size={20} className={user.isPro ? 'fill-current' : ''} />
            </div>
            <div>
              <p className="font-semibold text-black dark:text-white">
                {user.isPro ? 'Pro Member' : 'Free Tier'}
              </p>
              <p className="text-xs text-gray-500">
                {user.isPro ? 'Thanks for supporting QuickExpense' : 'Upgrade for Cloud Sync & Custom Categories'}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
        </Link>
        
        {/* Settings Link (Mobile) */}
        <Link href="/settings" className="card flex items-center justify-between p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors md:hidden">
          <div className="flex items-center gap-3">
            <p className="font-semibold text-black dark:text-white">App Settings</p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>

        {/* Logout */}
        <button onClick={logout} className="card flex items-center gap-3 p-4 hover:border-red-200 hover:bg-red-50 dark:hover:border-red-900/50 dark:hover:bg-red-900/10 transition-colors text-red-500 text-left">
          <LogOut size={20} />
          <span className="font-semibold">Log out</span>
        </button>
      </div>
    </div>
  );
}
