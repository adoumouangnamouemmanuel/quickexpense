'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, CheckCircle2, ChevronDown, Plus, Save, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { IconRenderer } from '../_components/IconRenderer';
import { ThemeToggle } from '../_components/ThemeToggle';
import { DEFAULT_CATEGORIES } from '../_lib/categories';
import { db, type Transaction, type TransactionType } from '../_lib/db';
import { useLanguage } from '../_lib/i18n';
import { todayISO } from '../_lib/utils';

interface RowData {
  id: string;
  amount: string;
  type: TransactionType;
  categoryId: string;
  date: string;
  personName: string;
  note: string;
}

const DEBT_CATEGORY_IDS = new Set(['money-lent', 'debt-repaid']);

export default function QuickAddPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  
  const categories = useLiveQuery(
    () => db.categories.toArray(),
    [],
    DEFAULT_CATEGORIES
  );

  const settings = useLiveQuery(() => db.settings.toArray(), []) ?? [];
  const defaultCurrency = settings.find((s) => s.key === "currency")?.value ?? "$";

  const [rows, setRows] = useState<RowData[]>([]);
  const [saving, setSaving] = useState(false);
  const [pickingCategoryForRow, setPickingCategoryForRow] = useState<string | null>(null);
  
  // Initialize with 3 empty rows
  useEffect(() => {
    if (rows.length === 0) {
      const initial = Array.from({ length: 3 }).map(() => ({
        id: Math.random().toString(36).substr(2, 9),
        amount: '',
        type: 'expense' as TransactionType,
        categoryId: 'food',
        date: todayISO(),
        personName: '',
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
      date: todayISO(),
      personName: '',
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

    const missingPersonName = validRows.some(
      (r) => DEBT_CATEGORY_IDS.has(r.categoryId) && !r.personName.trim()
    );

    if (validRows.length === 0) {
      toast.error('No valid transactions to save. Enter amounts first.');
      return;
    }

    if (missingPersonName) {
      toast.error(t.personNameRequired || "Please enter the person's name for debt entries.");
      return;
    }

    setSaving(true);
    try {
      const txs = validRows.map(r => {
        const person = r.personName.trim();
        const isDebtEntry = DEBT_CATEGORY_IDS.has(r.categoryId);
        const composedNote = isDebtEntry
          ? (r.note.trim() ? `${person}: ${r.note.trim()}` : person)
          : r.note.trim();

        const composedTags = isDebtEntry
          ? [`person:${person.toLowerCase()}`]
          : [];

        return {
        amount: parseFloat(r.amount),
        type: r.type,
        categoryId: r.categoryId,
        date: r.date,
        note: composedNote,
        tags: composedTags,
        currency: defaultCurrency,
        createdAt: Date.now() + Math.random(), // slight offset for stable sorting
      };
      }) as Transaction[];

      await db.transactions.bulkAdd(txs);
      toast.success(`Successfully saved ${validRows.length} transactions!`);
      router.push('/transactions');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save multiple transactions');
    } finally {
      setSaving(false);
    }
  };

  const getCategory = (id: string) => categories?.find(c => c.id === id) || categories?.[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-900 pb-24">
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 px-4 flex items-center justify-between shadow-sm h-14">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-black dark:text-white">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-base font-bold text-black dark:text-white">{t.fastEntry}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-surface-3 bg-surface-glass backdrop-blur-xl">
            <ThemeToggle />
          </div>
          <button 
            onClick={handleSaveAll}
            disabled={saving}
            className="btn btn-primary px-3 sm:px-4 py-1.5 h-auto text-sm flex items-center gap-1.5 rounded-lg font-semibold shadow-sm transition-all"
          >
            {saving ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={15} />}
            <span className="hidden sm:inline">{t.save}</span>
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 sm:p-6 space-y-4">
        
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-900/50">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-blue-500" />
          <p className="text-sm font-medium">{t.bulkHint}</p>
        </div>

        {rows.map((row, index) => {
          const cat = getCategory(row.categoryId);
          const isDebtCategory = DEBT_CATEGORY_IDS.has(row.categoryId);
          return (
            <div 
              key={row.id} 
              className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white focus-within:border-transparent relative animate-in slide-in-from-bottom-2"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50 dark:bg-black/20">
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">{t.entry} {index + 1}</span>
                <button
                  onClick={() => removeRow(row.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:hover:text-gray-400 p-1 -mr-1 rounded-md"
                  disabled={rows.length === 1}
                  aria-label="Remove entry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Type toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-[14px]">
                  <button
                    type="button"
                    className={`flex-1 flex items-center justify-center py-2 text-xs font-bold rounded-xl transition-all ${row.type === 'expense' ? 'bg-white text-black dark:bg-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium'}`}
                    onClick={() => updateRow(row.id, 'type', 'expense')}
                  >
                    {t.expense}
                  </button>
                  <button
                    type="button"
                    className={`flex-1 flex items-center justify-center py-2 text-xs font-bold rounded-xl transition-all ${row.type === 'income' ? 'bg-white text-black dark:bg-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium'}`}
                    onClick={() => updateRow(row.id, 'type', 'income')}
                  >
                    {t.income}
                  </button>
                </div>

                {/* Amount & Category row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2">
                    <span className="text-gray-400 font-bold text-sm shrink-0 min-w-8 text-center">
                      {defaultCurrency}
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={row.amount}
                      onChange={e => updateRow(row.id, 'amount', e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-base font-bold focus:outline-none text-black dark:text-white"
                    />
                  </div>
                  
                  {/* Premium Category Picker Button */}
                  <button
                    onClick={() => setPickingCategoryForRow(row.id)}
                    className="w-full flex items-center gap-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-3 text-left transition-colors hover:border-black dark:hover:border-white group"
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat?.color}20`, color: cat?.color }}>
                      {cat && <IconRenderer name={cat.icon} size={14} />}
                    </div>
                    <span className="text-[11px] font-semibold leading-tight whitespace-normal wrap-break-word flex-1 text-black dark:text-white text-left">
                      {cat ? (language === 'fr' ? cat.nameFr : cat.nameEn) : '...'}
                    </span>
                    <ChevronDown size={14} className="text-gray-400 group-hover:text-black dark:group-hover:text-white" />
                  </button>
                </div>

                <input
                  type="date"
                  value={row.date}
                  onChange={e => updateRow(row.id, 'date', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white font-medium"
                />

                <input
                  type="text"
                  placeholder={
                    isDebtCategory
                      ? (language === 'fr' ? 'Commentaire (optionnel)' : 'Context (optional)')
                      : (t.enterExpenseTitle || t.enterNote || 'Note (optional)')
                  }
                  value={row.note}
                  onChange={e => updateRow(row.id, 'note', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white font-medium"
                />

                {isDebtCategory && (
                  <input
                    type="text"
                    placeholder={t.enterPersonName || 'Who is this debt for?'}
                    value={row.personName}
                    onChange={e => updateRow(row.id, 'personName', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white font-medium"
                  />
                )}
              </div>
            </div>
          );
        })}
        
        <button 
          onClick={addRow}
          className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white text-gray-500 hover:text-black dark:hover:text-white font-bold flex items-center justify-center gap-2 rounded-2xl py-6 transition-all outline-none"
        >
          <Plus size={20} />
          {t.addAnotherEntry}
        </button>

      </main>

      {/* Category Selection Bottom Sheet */}
      {pickingCategoryForRow && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md p-0" onClick={() => setPickingCategoryForRow(null)}>
          <div 
            className="bg-white dark:bg-neutral-900 w-full rounded-t-4xl p-6 pb-[env(safe-area-inset-bottom,24px)] animate-in slide-in-from-bottom duration-300 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6 opacity-50" />
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl">{t.category}</h3>
              <button onClick={() => setPickingCategoryForRow(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto hide-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 group active:scale-95"
                  onClick={() => {
                    updateRow(pickingCategoryForRow, 'categoryId', cat.id);
                    setPickingCategoryForRow(null);
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                    <IconRenderer name={cat.icon} size={24} />
                  </div>
                  <span className="text-[10px] leading-tight font-bold text-gray-500 dark:text-gray-400 text-center whitespace-normal wrap-break-word w-full min-h-8 group-hover:text-black dark:group-hover:text-white">
                    {language === 'fr' ? cat.nameFr : cat.nameEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
