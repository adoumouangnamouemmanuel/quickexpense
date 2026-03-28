'use client';

// Budget progress bars with alert indicators
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../_lib/i18n';
import { formatCurrency, clamp } from '../_lib/utils';
import type { Budget, Transaction, Category } from '../_lib/db';

interface BudgetProgressProps {
  budget: Budget;
  transactions: Transaction[];
  category?: Category | null;
  currency: string;
}

export function BudgetProgress({ budget, transactions, category, currency }: BudgetProgressProps) {
  const { t, language } = useLanguage();

  const spent = transactions
    .filter(tx =>
      tx.type === 'expense' &&
      (budget.categoryId === null || tx.categoryId === budget.categoryId)
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pct = budget.amount > 0 ? clamp((spent / budget.amount) * 100, 0, 100) : 0;
  const exceeded = spent > budget.amount;
  const near = !exceeded && pct >= 80;

  const barColor = exceeded
    ? 'oklch(0.58 0.22 25)'
    : near
      ? 'oklch(0.75 0.18 60)'
      : 'oklch(0.52 0.24 265)';

  const label = category
    ? (language === 'fr' ? category.nameFr : category.nameEn)
    : t.monthlyBudget;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <span>{label}</span>
          {(exceeded || near) && (
            <AlertTriangle
              size={14}
              style={{ color: exceeded ? 'oklch(0.58 0.22 25)' : 'oklch(0.75 0.18 60)' }}
            />
          )}
        </div>
        <span className="text-xs" style={{ color: 'oklch(0.60 0.01 265)' }}>
          {formatCurrency(spent, currency)} / {formatCurrency(budget.amount, currency)}
        </span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      {exceeded && (
        <p className="text-xs mt-1" style={{ color: 'oklch(0.58 0.22 25)' }}>
          {t.budgetExceeded} +{formatCurrency(spent - budget.amount, currency)}
        </p>
      )}
      {near && !exceeded && (
        <p className="text-xs mt-1" style={{ color: 'oklch(0.75 0.18 60)' }}>
          {t.budgetNear}
        </p>
      )}
    </div>
  );
}
