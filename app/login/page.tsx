'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../_lib/auth';
import { useLanguage } from '../_lib/i18n';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, 'User');
    router.push('/');
  };

  const handleGoogleLogin = () => {
    // Fake OAuth mock
    setLoading(true);
    setTimeout(() => {
      login('user@google.com', 'Google User').then(() => router.push('/'));
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-[#0f172a] sm:bg-[#f8fafc] sm:dark:bg-[#0f172a] relative">
      
      {/* Mobile back button */}
      <div className="absolute top-4 left-4 sm:hidden z-20">
        <Link href="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-black sm:shadow-2xl sm:shadow-black/5 dark:sm:shadow-white/5 sm:rounded-2xl p-6 sm:p-10 sm:border border-gray-100 dark:border-gray-800">
          
          <h1 className="text-2xl font-bold tracking-tight text-center mb-2 text-black dark:text-white">
            {t.login} 
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">
            Access your QuickExpense account
          </p>

          <button 
            onClick={handleGoogleLogin}
            className="w-full mb-6 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            <span className="text-sm font-medium text-black dark:text-white">Continue with Google</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-800"></div>
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-black focus:border-black dark:focus:border-white focus:outline-none transition-colors text-sm"
                placeholder="you@example.com" 
                value={email}
                onChange={p => setEmail(p.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-black focus:border-black dark:focus:border-white focus:outline-none transition-colors text-sm"
                placeholder="••••••••" 
                value={password}
                onChange={p => setPassword(p.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-2.5 mt-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : t.login}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-black dark:text-white font-medium hover:underline decoration-1 underline-offset-2">
              {t.signup}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
