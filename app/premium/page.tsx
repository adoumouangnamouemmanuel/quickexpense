'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Star, Cloud, Grid, ArrowLeft, ShieldCheck, Loader2, X } from 'lucide-react';
import { useAuth } from '../_lib/auth';
import Link from 'next/link';

export default function PremiumPage() {
  const { user, upgradeToPro } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(true);
    await upgradeToPro();
    router.push('/settings');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] sm:bg-gray-50/50 sm:dark:bg-[#0f172a]/90 pb-24 relative">
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 relative z-10">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors mb-10">
          <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 mb-6 text-xs font-bold uppercase tracking-wider">
            <Star size={14} className="fill-current" /> QuickExpense Pro
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-black dark:text-white">
            Track without limits.
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Choose the plan that fits your financial goals. Sync your data across devices, unlock advanced reports, and more.
          </p>
        </motion.div>

        {/* Pricing Table */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col"
          >
            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Free</h2>
            <div className="text-4xl font-extrabold text-black dark:text-white mb-2">$0 <span className="text-base font-normal text-gray-500">/ forever</span></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 h-10">Perfect for individuals starting their budgeting journey offline.</p>
            
            <div className="space-y-4 mb-8 flex-1">
              {[
                { i: Check, t: 'Unlimited Local Transactions', active: true },
                { i: Check, t: 'Built-in Basic Categories', active: true },
                { i: Check, t: 'Basic Charts & Analytics', active: true },
                { i: X, t: 'No Cloud Sync (Data lost if phone breaks)', active: false },
                { i: X, t: 'No Custom Categories', active: false },
                { i: X, t: 'No Premium Icons', active: false },
              ].map((feat, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${feat.active ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                  <feat.i size={18} className={`shrink-0 mt-0.5 ${feat.active ? 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]' : 'text-gray-300 dark:text-gray-700'}`} />
                  <span className="text-sm font-medium">{feat.t}</span>
                </div>
              ))}
            </div>

            <Link href="/" className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 text-black dark:text-white font-bold text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              Continue with Free
            </Link>
          </motion.div>

          {/* Pro Tier */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Star size={120} className="fill-current" />
            </div>

            <div className="inline-block px-3 py-1 bg-white/10 dark:bg-black/10 text-white dark:text-black rounded-full text-xs font-bold uppercase tracking-wider w-fit mb-4">
              Most Popular
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Pro</h2>
            <div className="text-4xl font-extrabold mb-2">$4.99 <span className="text-base font-normal opacity-70">/ month</span></div>
            <p className="text-sm opacity-80 mb-8 h-10">Advanced tools, complete peace of mind, and unlimited flexibility.</p>
            
            <div className="space-y-4 mb-8 flex-1">
              {[
                { i: Check, t: 'Everything in Free', active: true },
                { i: Cloud, t: 'Secure Cloud Sync Across Devices', active: true },
                { i: Grid, t: 'Create Unlimited Custom Categories', active: true },
                { i: Star, t: 'Premium iOS/Android App Icons', active: true },
                { i: ShieldCheck, t: 'Automated Daily Backups', active: true },
                { i: Check, t: 'Priority Customer Support', active: true },
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 text-white dark:text-black">
                  <feat.i size={18} className="shrink-0 mt-0.5 opacity-80" />
                  <span className="text-sm font-medium">{feat.t}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={handleUpgrade}
              disabled={user?.isPro || loading}
              className="w-full py-3 px-4 rounded-xl bg-white text-black dark:bg-black dark:text-white font-bold text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : user?.isPro ? 'You are already Pro' : (user ? 'Upgrade to Pro' : 'Sign in to Upgrade')}
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
