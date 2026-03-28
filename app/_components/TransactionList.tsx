'use client';

// Transaction list with search, filter, sort, edit, delete
import { useState, useMemo, useCallback } from 'react';
import { Search, Pencil, Trash2, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { db, type Transaction, type Category } from '../_lib/db';
import { useLanguage } from '../_lib/i18n';
import { formatCurrency, formatDate } from '../_lib/utils';
import { AddTransactionModal } from './AddTransactionModal';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  showFilters?: boolean;
  limit?: number;
}

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export function TransactionList({
  transactions,
  categories,
  currency,
  showFilters = true,
  limit,
}: TransactionListProps) {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [catFilter, setCatFilter] = useState('all');
  const [sort, setSort] = useState<SortKey>('date-desc');
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const getCategoryName = useCallback((id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return id;
    return language === 'fr' ? cat.nameFr : cat.nameEn;
  }, [categories, language]);

  const getCategoryColor = useCallback((id: string) => {
    return categories.find(c => c.id === id)?.color ?? '#6366f1';
  }, [categories]);

  const getCategoryIcon = useCallback((id: string) => {
    return categories.find(c => c.id === id)?.icon ?? '📦';
  }, [categories]);

  const filtered = useMemo(() => {
    let list = [...transactions];

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(tx =>
        tx.note?.toLowerCase().includes(q) ||
        tx.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        getCategoryName(tx.categoryId).toLowerCase().includes(q) ||
        String(tx.amount).includes(q)
      );
    }

    // Type filter
    if (typeFilter !== 'all') list = list.filter(tx => tx.type === typeFilter);

    // Category filter
    if (catFilter !== 'all') list = list.filter(tx => tx.categoryId === catFilter);

    // Sort
    list.sort((a, b) => {
      switch (sort) {
        case 'date-desc': return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        case 'date-asc': return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc': return a.amount - b.amount;
      }
    });

    if (limit) list = list.slice(0, limit);
    return list;
  }, [transactions, search, typeFilter, catFilter, sort, limit, getCategoryName]);

  const handleDelete = async (id: number) => {
    await db.transactions.delete(id);
    toast.success('Transaction deleted');
    setDeleteConfirmId(null);
  };

  return (
    <div>
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Search */}
          <div className="flex items-center gap-2 input flex-1 min-w-48" style={{ padding: '0.5rem 0.875rem' }}>
            <Search size={15} style={{ color: 'oklch(0.60 0.01 265)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1, fontSize: '0.9rem', color: 'inherit' }}
              id="tx-search-input"
            />
          </div>

          {/* Type */}
          <select
            className="input select"
            style={{ width: 'auto' }}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as typeof typeFilter)}
            id="tx-type-filter"
          >
            <option value="all">{t.all}</option>
            <option value="expense">{t.expense}</option>
            <option value="income">{t.income}</option>
          </select>

          {/* Category */}
          <select
            className="input select"
            style={{ width: 'auto' }}
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            id="tx-cat-filter"
          >
            <option value="all">{t.all}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {language === 'fr' ? cat.nameFr : cat.nameEn}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="input select"
            style={{ width: 'auto' }}
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            id="tx-sort-select"
          >
            <option value="date-desc">{t.newest}</option>
            <option value="date-asc">{t.oldest}</option>
            <option value="amount-desc">{t.highest}</option>
            <option value="amount-asc">{t.lowest}</option>
          </select>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'oklch(0.60 0.01 265)' }}>
          {t.noTransactions}
        </div>
      ) : (
        <div className="flex flex-col">
          {filtered.map(tx => (
            <div key={tx.id} className="transaction-row group">
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${getCategoryColor(tx.categoryId)}18` }}
              >
                {getCategoryIcon(tx.categoryId)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {tx.note || getCategoryName(tx.categoryId)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'oklch(0.60 0.01 265)' }}>
                  {formatDate(tx.date)} · {getCategoryName(tx.categoryId)}
                </p>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2 ml-2">
                <span
                  className="font-semibold text-sm"
                  style={{ color: tx.type === 'income' ? 'oklch(0.55 0.18 145)' : 'oklch(0.58 0.22 25)' }}
                >
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || currency)}
                </span>

                {/* Actions (visible on hover) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setEditTx(tx)}
                    aria-label="Edit"
                    id={`edit-tx-${tx.id}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    style={{ color: 'oklch(0.58 0.22 25)' }}
                    onClick={() => setDeleteConfirmId(tx.id!)}
                    aria-label="Delete"
                    id={`delete-tx-${tx.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editTx && (
        <AddTransactionModal
          open={!!editTx}
          onClose={() => setEditTx(null)}
          editTx={editTx}
          defaultCurrency={currency}
        />
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirmId !== null && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 340 }}>
            <h3 className="text-base font-semibold mb-2">{t.confirmDelete}</h3>
            <p className="text-sm mb-4" style={{ color: 'oklch(0.60 0.01 265)' }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>{t.cancel}</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirmId!)}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
