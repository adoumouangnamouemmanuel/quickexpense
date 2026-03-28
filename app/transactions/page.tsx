'use client';

// Transactions page – full list with filters
import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../_lib/db';
import { useLanguage } from '../_lib/i18n';
import { DEFAULT_CATEGORIES } from '../_lib/categories';
import { AppShell } from '../_components/AppShell';
import { AddTransactionModal } from '../_components/AddTransactionModal';
import { FAB } from '../_components/FAB';
import { TransactionList } from '../_components/TransactionList';
import { seedCategories } from '../_lib/categories';

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'income'>('expense');

  const transactions = useLiveQuery(() =>
    db.transactions.orderBy('createdAt').reverse().toArray(), []
  ) ?? [];

  const categories = useLiveQuery(() => db.categories.toArray(), [], DEFAULT_CATEGORIES) ?? DEFAULT_CATEGORIES;

  const settings = useLiveQuery(() => db.settings.toArray(), []) ?? [];
  const currency = settings.find(s => s.key === 'currency')?.value ?? '$';

  const openModal = (type: 'expense' | 'income') => {
    seedCategories();
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <AppShell>
      <div className="mb-4 hidden md:block">
        <h1 className="text-xl font-bold">{t.transactions}</h1>
      </div>

      <div className="card">
        <TransactionList
          transactions={transactions}
          categories={categories}
          currency={currency}
          showFilters={true}
        />
      </div>

      <FAB
        onAddExpense={() => openModal('expense')}
        onAddIncome={() => openModal('income')}
      />

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
        defaultCurrency={currency}
      />
    </AppShell>
  );
}
