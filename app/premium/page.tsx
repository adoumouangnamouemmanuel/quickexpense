'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Star, Cloud, Grid, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
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

  const featureVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-24 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-br from-[oklch(0.52_0.24_265_/_0.15)] to-transparent pointer-events-none" />
      
      <div className="max-w-2xl mx-auto px-6 pt-12 relative z-10">
        <Link href="/settings" className="inline-flex items-center text-[oklch(0.60_0.01_265)] hover:text-[oklch(0.15_0.01_265)] dark:hover:text-white transition-colors mb-8">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.52_0.24_265_/_0.15)] text-[oklch(0.52_0.24_265)] mb-6 text-sm font-semibold uppercase tracking-wider">
            <Star size={16} className="fill-[oklch(0.52_0.24_265)]" /> QuickExpense Pro
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Unlock your financial potential.
          </h1>
          <p className="text-lg text-[oklch(0.50_0.01_265)] dark:text-[oklch(0.70_0.01_265)] mb-10 max-w-lg mx-auto">
            Upgrade to Pro to remove limits, sync your data across devices securely, and access advanced analytics.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {[
            { icon: Grid, title: 'Unlimited Categories', desc: 'Create as many custom categories as you need.' },
            { icon: Cloud, title: 'Cloud Sync', desc: 'Securely sync your transactions across multiple devices.' },
            { icon: Star, title: 'Advanced Reports', desc: 'Detailed PDF exports and AI-driven insights.' },
            { icon: ShieldCheck, title: 'Bank Grade Security', desc: 'Your data belongs to you, encrypted end-to-end.' },
          ].map((feat, i) => (
            <motion.div
              key={i}
              className="card glass flex gap-4 items-start border-[oklch(0.52_0.24_265_/_0.2)]"
              custom={i}
              initial="hidden"
              animate="visible"
              variants={featureVariants}
            >
               <div className="p-2 rounded-xl bg-[oklch(0.52_0.24_265_/_0.1)] text-[oklch(0.52_0.24_265)] shrink-0">
                 <feat.icon size={24} />
               </div>
               <div>
                 <h3 className="font-semibold">{feat.title}</h3>
                 <p className="text-sm text-[oklch(0.50_0.01_265)] dark:text-[oklch(0.65_0.01_265)] mt-1 leading-relaxed">
                   {feat.desc}
                 </p>
               </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="card text-center p-8 bg-gradient-to-br from-[oklch(0.52_0.24_265)] to-[oklch(0.44_0.22_285)] text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Star size={120} className="fill-white" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">$4.99 <span className="text-sm font-normal text-white/80">/ month</span></h2>
          <p className="text-white/90 mb-6 max-w-sm mx-auto">Cancel anytime. Try it free for 14 days and supercharge your budgeting.</p>
          
          <button 
            onClick={handleUpgrade}
            disabled={user?.isPro || loading}
            className="w-full sm:w-auto px-8 py-3 bg-white text-[oklch(0.52_0.24_265)] font-bold rounded-full shadow hover:bg-white/90 transition-transform active:scale-95 disabled:opacity-50 inline-flex justify-center items-center h-[52px]"
          >
            {loading ? <Loader2 className="animate-spin text-[oklch(0.52_0.24_265)]" /> : user?.isPro ? 'You are already Pro' : (user ? 'Upgrade Now' : 'Sign in to Upgrade')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
