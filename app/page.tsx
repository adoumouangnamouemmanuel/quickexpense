'use client';

// Dashboard – Home Page
import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { TrendingUp, TrendingDown, Wallet, Sparkles, Trash2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { db } from './_lib/db';
import { useLanguage } from './_lib/i18n';
import { formatCurrency, currentMonthISO } from './_lib/utils';
import { DEFAULT_CATEGORIES, seedCategories } from './_lib/categories';
import { AppShell } from './_components/AppShell';
import Link from 'next/link';
import { AddTransactionModal } from './_components/AddTransactionModal';
import { FAB } from './_components/FAB';
import { BudgetProgress } from './_components/BudgetProgress';
import { ExpensePieChart, CategoryLegend, SpendingLineChart } from './_components/Charts';
import { TransactionList } from './_components/TransactionList';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'income'>('expense');

  // ─── Live data ───────────────────────────────────────────────────────────────

  const month = currentMonthISO();

  const allTransactions = useLiveQuery(() =>
    db.transactions.orderBy('date').reverse().toArray(), []
  ) ?? [];

  const monthTransactions = useLiveQuery(() =>
    db.transactions.where('date').startsWith(month).toArray(), [month]
  ) ?? [];

  const categories = useLiveQuery(() => db.categories.toArray(), [], DEFAULT_CATEGORIES) ?? DEFAULT_CATEGORIES;

  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];

  const settings = useLiveQuery(() => db.settings.toArray(), []) ?? [];
  const currency = settings.find(s => s.key === 'currency')?.value ?? '$';

  // ─── Stats ────────────────────────────────────────────────────────────────────

  const totalIncome = monthTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = monthTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpenses;

  const globalBudget = budgets.find(b => b.categoryId === null);

  // ─── Demo data ────────────────────────────────────────────────────────────────

  const loadDemo = useCallback(async () => {
    const { seedSampleData } = await import('./_lib/sampleData');
    await seedSampleData();
    toast.success('Sample data loaded!');
  }, []);

  const clearDemo = useCallback(async () => {
    const { clearAllData } = await import('./_lib/sampleData');
    await clearAllData();
    toast.success('Data cleared');
  }, []);

  // ─── Open modal ────────────────────────────────────────────────────────────────

  const openModal = (type: 'expense' | 'income') => {
    seedCategories(); // ensure categories seeded
    setModalType(type);
    setModalOpen(true);
  };

  const hasData = allTransactions.length > 0;

  return (
    <AppShell>
      {/* Welcome / empty state */}
      {!hasData && (
        <div
          className="card mb-6 text-center py-10 border border-gray-100 dark:border-gray-800/60"
          style={{ background: 'var(--color-surface)' }}
        >
          <div className="w-16 h-16 rounded-3xl mx-auto mb-5 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Wallet size={28} strokeWidth={2} className="text-black dark:text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-black dark:text-white">Welcome</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-[250px] mx-auto leading-relaxed">
            {t.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              className="btn btn-primary px-6"
              onClick={() => openModal('expense')}
              id="start-tracking-btn"
            >
              {t.addExpense}
            </button>
            <button
              className="btn btn-secondary px-6"
              onClick={loadDemo}
              id="try-demo-btn"
            >
              <Activity size={16} />
              {t.tryDemo}
            </button>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Income */}
        <div className="card stat-income">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'oklch(0.55 0.18 145)' }}>{t.totalIncome}</span>
            <TrendingUp size={16} style={{ color: 'oklch(0.55 0.18 145)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'oklch(0.45 0.18 145)' }}>
            {formatCurrency(totalIncome, currency)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'oklch(0.60 0.01 265)' }}>{t.thisMonth}</p>
        </div>

        {/* Expenses */}
        <div className="card stat-expense">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'oklch(0.58 0.22 25)' }}>{t.totalExpenses}</span>
            <TrendingDown size={16} style={{ color: 'oklch(0.58 0.22 25)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'oklch(0.48 0.22 25)' }}>
            {formatCurrency(totalExpenses, currency)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'oklch(0.60 0.01 265)' }}>{t.thisMonth}</p>
        </div>

        {/* Balance */}
        <div className="card stat-balance">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'oklch(0.52 0.24 265)' }}>{t.balance}</span>
            <Wallet size={16} style={{ color: 'oklch(0.52 0.24 265)' }} />
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: balance >= 0 ? 'oklch(0.45 0.18 145)' : 'oklch(0.48 0.22 25)' }}
          >
            {balance >= 0 ? '' : '-'}{formatCurrency(Math.abs(balance), currency)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'oklch(0.60 0.01 265)' }}>{t.thisMonth}</p>
        </div>
      </div>

      {/* Budget progress */}
      {globalBudget && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-3 text-sm">{t.monthlyBudget}</h2>
          <BudgetProgress
            budget={globalBudget}
            transactions={monthTransactions}
            category={null}
            currency={currency}
          />
        </div>
      )}

      {/* Charts row */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Pie chart */}
          <div className="card">
            <h2 className="font-semibold mb-3 text-sm">{t.expensesByCategory}</h2>
            <ExpensePieChart
              transactions={monthTransactions}
              categories={categories}
              currency={currency}
            />
            <CategoryLegend
              transactions={monthTransactions}
              categories={categories}
              currency={currency}
            />
          </div>

          {/* Line chart */}
          <div className="card">
            <h2 className="font-semibold mb-3 text-sm">{t.spendingTrend}</h2>
            <SpendingLineChart transactions={allTransactions} currency={currency} />
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {hasData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">{t.transactions}</h2>
            <div className="flex items-center gap-3">
              <Link 
                href="/bulk"
                className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:opacity-80 transition-opacity bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20 px-2 py-1 rounded"
              >
                + Bulk Add
              </Link>
              <Link
                href="/transactions"
                className="text-xs font-medium text-black dark:text-white underline decoration-1 underline-offset-2 hover:opacity-70 transition-opacity"
              >
                View all →
              </Link>
            </div>
          </div>
          <TransactionList
            transactions={allTransactions}
            categories={categories}
            currency={currency}
            showFilters={false}
            limit={8}
          />
        </div>
      )}

      {/* Demo clear */}
      {hasData && (
        <div className="mt-4 flex justify-end">
          <button
            className="btn btn-ghost btn-sm text-xs flex items-center gap-1"
            style={{ color: 'oklch(0.60 0.01 265)' }}
            onClick={clearDemo}
            id="clear-data-btn"
          >
            <Trash2 size={12} />
            {t.clearDemo}
          </button>
        </div>
      )}

      {/* FAB */}
      <FAB
        onAddExpense={() => openModal('expense')}
        onAddIncome={() => openModal('income')}
      />

      {/* Add modal */}
      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
        defaultCurrency={currency}
      />
    </AppShell>
  );
}
