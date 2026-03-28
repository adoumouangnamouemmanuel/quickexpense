'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, type Transaction, type TransactionType } from '../_lib/db';
import { useLanguage } from '../_lib/i18n';
import { todayISO } from '../_lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { DEFAULT_CATEGORIES } from '../_lib/categories';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface RowData {
  id: string;
  amount: string;
  type: TransactionType;
  categoryId: string;
  note: string;
}

export default function BulkAddPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  
  const categories = useLiveQuery(
    () => db.categories.toArray(),
    [],
    DEFAULT_CATEGORIES
  );

  const [rows, setRows] = useState<RowData[]>([]);
  const [saving, setSaving] = useState(false);
  
  // Initialize with 5 empty rows
  useEffect(() => {
    if (rows.length === 0) {
      const initial = Array.from({ length: 5 }).map(() => ({
        id: Math.random().toString(36).substr(2, 9),
        amount: '',
        type: 'expense' as TransactionType,
        categoryId: 'food',
        note: ''
      }));
      setRows(initial);
    }
  }, [rows.length]);

  const updateRow = (id: string, field: keyof RowData, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addRow = () => {
    setRows(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      amount: '',
      type: 'expense',
      categoryId: 'food',
      note: ''
    }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSaveAll = async () => {
    const validRows = rows.filter(r => {
      const amt = parseFloat(r.amount);
      return !isNaN(amt) && amt > 0;
    });

    if (validRows.length === 0) {
      toast.error('No valid transactions to save. Enter amounts first.');
      return;
    }

    setSaving(true);
    try {
      const txs = validRows.map(r => ({
        amount: parseFloat(r.amount),
        type: r.type,
        categoryId: r.categoryId,
        date: todayISO(),
        note: r.note.trim(),
        tags: [],
        currency: '$', // Simplified for bulk, assume default
        createdAt: Date.now() + Math.random(), // slight offset for stable sorting
      })) as Transaction[];

      await db.transactions.bulkAdd(txs);
      toast.success(`Successfully saved ${validRows.length} transactions!`);
      router.push('/transactions');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save bulk transactions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] pb-20">
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold">Fast Bulk Entry</h1>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={saving}
          className="btn bg-[var(--color-brand-800)] text-white hover:bg-[var(--color-brand-900)] px-4 py-2 text-sm flex items-center gap-2 rounded-lg font-medium shadow-sm transition-all"
        >
          {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={16} />}
          Save Active Rows
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="bg-white dark:bg-[#1a1825] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-[100px_1fr_1.5fr_2fr_50px] gap-4 p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <div>Type</div>
            <div>Amount</div>
            <div>Category</div>
            <div>Note (Optional)</div>
            <div className="text-center">Action</div>
          </div>

          <div className="flex flex-col">
            {rows.map((row, index) => (
              <div 
                key={row.id} 
                className="grid grid-cols-1 md:grid-cols-[100px_1fr_1.5fr_2fr_50px] gap-3 md:gap-4 p-4 border-b border-gray-100 dark:border-gray-800/60 last:border-0 hover:bg-gray-50/50 dark:hover:bg-black/10 transition-colors relative"
              >
                {/* Mobile Row Label */}
                <div className="md:hidden text-xs font-bold text-gray-400 mb-[-4px]">Row {index + 1}</div>
                
                {/* Type */}
                <select
                  value={row.type}
                  onChange={e => updateRow(row.id, 'type', e.target.value)}
                  className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 text-sm focus:border-black dark:focus:border-white outline-none appearance-none"
                >
                  <option value="expense">{t.expense}</option>
                  <option value="income">{t.income}</option>
                </select>

                {/* Amount */}
                <input
                  type="number"
                  placeholder="0.00"
                  value={row.amount}
                  onChange={e => updateRow(row.id, 'amount', e.target.value)}
                  className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-black dark:focus:border-white outline-none"
                />

                {/* Category */}
                <select
                  value={row.categoryId}
                  onChange={e => updateRow(row.id, 'categoryId', e.target.value)}
                  className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 text-sm focus:border-black dark:focus:border-white outline-none appearance-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{language === 'fr' ? c.nameFr : c.nameEn}</option>
                  ))}
                </select>

                {/* Note */}
                <input
                  type="text"
                  placeholder="What was this for?"
                  value={row.note}
                  onChange={e => updateRow(row.id, 'note', e.target.value)}
                  className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-black dark:focus:border-white outline-none"
                />

                {/* Remove button */}
                <button
                  onClick={() => removeRow(row.id)}
                  className="h-9 w-9 md:h-auto md:w-auto flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors absolute md:relative top-4 right-4 md:top-0 md:right-0"
                  disabled={rows.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-gray-50/50 dark:bg-black/20 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={addRow}
              className="flex items-center gap-2 text-sm font-medium text-[var(--color-brand-800)] dark:text-[var(--color-brand-400)] hover:underline"
            >
              <Plus size={16} /> Add Another Row
            </button>
          </div>

        </div>
        
        <div className="mt-8 flex items-start gap-3 p-4 bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20 text-[var(--color-brand-800)] dark:text-[var(--color-brand-300)] rounded-xl">
          <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">
            <strong>Spreadsheet Mode:</strong> Any row without an Amount will be automatically skipped. You can rapidly TAB through these inputs to enter data instantly.
          </p>
        </div>

      </main>
    </div>
  );
}
