'use client';

// Floating Action Button for adding transactions
import { Plus, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../_lib/i18n';

interface FABProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
}

export function FAB({ onAddExpense, onAddIncome }: FABProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Sub-buttons */}
      {open && (
        <>
          <button
            className="btn btn-sm flex gap-2 items-center"
            style={{
              background: 'oklch(0.55 0.18 145)',
              color: 'white',
              borderRadius: '999px',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              boxShadow: '0 4px 14px oklch(0.55 0.18 145 / 0.4)',
              animation: 'slideInRight 0.15s ease',
            }}
            onClick={() => { onAddIncome(); setOpen(false); }}
            id="fab-add-income"
          >
            <TrendingUp size={15} />
            {t.addIncome}
          </button>
          <button
            className="btn btn-sm flex gap-2 items-center"
            style={{
              background: 'oklch(0.58 0.22 25)',
              color: 'white',
              borderRadius: '999px',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              boxShadow: '0 4px 14px oklch(0.58 0.22 25 / 0.4)',
              animation: 'slideInRight 0.15s ease 0.04s both',
            }}
            onClick={() => { onAddExpense(); setOpen(false); }}
            id="fab-add-expense"
          >
            <TrendingDown size={15} />
            {t.addExpense}
          </button>
        </>
      )}

      {/* Main FAB button */}
      <button
        className="fab"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Add transaction'}
        id="fab-main"
        style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'all 0.2s ease' }}
      >
        {open ? <X size={22} /> : <Plus size={22} />}
      </button>
    </div>
  );
}
