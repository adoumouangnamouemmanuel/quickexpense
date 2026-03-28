'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../_lib/auth';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signup(email, name);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color-surface)]">
      {/* Background Orbs */}
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-[oklch(0.52_0.24_265_/_0.25)] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-[oklch(0.65_0.20_145_/_0.15)] rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="card glass p-8 sm:p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.52_0.24_265)] to-[oklch(0.44_0.22_285)] text-white flex items-center justify-center shadow-lg transform rotate-3">
              <Sparkles size={24} />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight mb-2">Join QuickExpense</h1>
          <p className="text-[oklch(0.60_0.01_265)] text-sm mb-8">
            Create an account to unlock advanced tracking.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="label">Full Name</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Jane Doe" 
                value={name}
                onChange={p => setName(p.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input 
                type="email" 
                className="input" 
                placeholder="you@example.com" 
                value={email}
                onChange={p => setEmail(p.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password (Mock)</label>
              <input 
                type="password" 
                className="input" 
                placeholder="••••••••" 
                value={password}
                onChange={p => setPassword(p.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full py-2.5 mt-4 text-[0.9375rem]"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-[oklch(0.60_0.01_265)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[oklch(0.52_0.24_265)] font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
