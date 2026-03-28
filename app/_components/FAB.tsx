'use client';

import { Plus, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../_lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';

interface FABProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
}

export function FAB({ onAddExpense, onAddIncome }: FABProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      {/* Blurred background overlay when open */}
      <AnimatePresence>
        {open && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-40 bg-[var(--color-surface)]/60 backdrop-blur-md"
             onClick={() => setOpen(false)}
           />
        )}
      </AnimatePresence>
      
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+70px)] md:bottom-8 right-1/2 md:right-8 translate-x-1/2 md:translate-x-0 z-50 flex flex-col items-center md:items-end gap-3">
        {/* Floating Actions */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="flex flex-col gap-3 mb-2"
            >
              <button
                className="btn glass flex gap-3 items-center justify-center font-semibold text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
                style={{
                  background: 'oklch(0.65 0.20 145 / 0.95)',
                }}
                onClick={() => { onAddIncome(); setOpen(false); }}
                id="fab-add-income"
              >
                <TrendingUp size={18} />
                {t.addIncome}
              </button>
              
              <button
                className="btn glass flex gap-3 items-center justify-center font-semibold text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
                style={{
                  background: 'oklch(0.62 0.24 25 / 0.95)',
                }}
                onClick={() => { onAddExpense(); setOpen(false); }}
                id="fab-add-expense"
              >
                <TrendingDown size={18} />
                {t.addExpense}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Trigger */}
        <motion.button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close' : 'Add transaction'}
          id="fab-main"
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-[oklch(0.52_0.24_265_/_0.3)] bg-gradient-to-tr from-[oklch(0.52_0.24_265)] to-[oklch(0.44_0.22_285)] relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: open ? 135 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Plus size={28} strokeWidth={2.5} />
        </motion.button>
      </div>
    </>
  );
}
