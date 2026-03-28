'use client';

// Add / Edit Transaction Modal
import { useLiveQuery } from 'dexie-react-hooks';
import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DEFAULT_CATEGORIES } from '../_lib/categories';
import { db, type Transaction, type TransactionType } from '../_lib/db';
import { useLanguage } from '../_lib/i18n';
import { CURRENCY_OPTIONS, todayISO } from '../_lib/utils';
import { IconRenderer } from './IconRenderer';

interface Props {
  open: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
  defaultType?: TransactionType;
  defaultCurrency?: string;
}

const DEBT_CATEGORY_IDS = new Set(['money-lent', 'debt-repaid']);

export function AddTransactionModal({ open, onClose, editTx, defaultType = 'expense', defaultCurrency = '$' }: Props) {
  const { t, language } = useLanguage();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [categoryId, setCategoryId] = useState('food');
  const [date, setDate] = useState(todayISO());
  const [personName, setPersonName] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [saving, setSaving] = useState(false);

  const categories = useLiveQuery(
    () => db.categories.toArray(),
    [],
    DEFAULT_CATEGORIES
  );

  // Populate fields when editing
  useEffect(() => {
    if (editTx) {
      setAmount(String(editTx.amount));
      setType(editTx.type);
      setCategoryId(editTx.categoryId);
      setDate(editTx.date);
      setNote(editTx.note ?? '');
      const personTag = editTx.tags?.find((tag) => tag.startsWith('person:'));
      setPersonName(personTag ? personTag.replace(/^person:/, '') : '');
      setTags(editTx.tags?.join(', ') ?? '');
      setCurrency(editTx.currency ?? defaultCurrency);
    } else {
      setAmount('');
      setType(defaultType);
      setCategoryId('food');
      setDate(todayISO());
      setPersonName('');
      setNote('');
      setTags('');
      setCurrency(defaultCurrency);
    }
  }, [editTx, defaultType, defaultCurrency, open]);

  const handleSave = useCallback(async (addAnother = false) => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const isDebtEntry = DEBT_CATEGORY_IDS.has(categoryId);
    const normalizedPerson = personName.trim();
    if (isDebtEntry && !normalizedPerson) {
      toast.error(t.personNameRequired || "Please enter the person's name for debt entries.");
      return;
    }

    setSaving(true);
    try {
      const baseTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      const mergedTags = isDebtEntry
        ? Array.from(new Set([...baseTags, `person:${normalizedPerson.toLowerCase()}`]))
        : baseTags;

      const composedNote = isDebtEntry
        ? (note.trim() ? `${normalizedPerson}: ${note.trim()}` : normalizedPerson)
        : note.trim();

      const tx: Omit<Transaction, 'id'> = {
        amount: amt,
        type,
        categoryId,
        date,
        note: composedNote,
        tags: mergedTags,
        currency,
        createdAt: editTx?.createdAt ?? Date.now(),
      };

      if (editTx?.id !== undefined) {
        await db.transactions.update(editTx.id, tx);
        toast.success('Transaction updated!');
        onClose();
      } else {
        await db.transactions.add(tx as Transaction);
        toast.success('Transaction saved!');
        if (addAnother) {
          // Reset fields for another entry
          setAmount('');
          setNote('');
          setTags('');
          // Keep type, cat, date, currency as they might be doing batch entries
        } else {
          onClose();
        }
      }
    } catch (err) {
      toast.error('Failed to save transaction');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [amount, type, categoryId, date, personName, note, tags, currency, editTx, onClose, t.personNameRequired]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const getCategoryName = (cat: typeof DEFAULT_CATEGORIES[number]) =>
    language === 'fr' ? cat.nameFr : cat.nameEn;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label={editTx ? t.editTransaction : t.addTransaction}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{editTx ? t.editTransaction : t.addTransaction}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label={t.cancel}><X size={18} /></button>
        </div>

        {/* Type switch */}
        <div
          className="flex rounded-lg mb-5 p-1"
          style={{ background: 'var(--color-surface-3)' }}
        >
          {(['expense', 'income'] as TransactionType[]).map((tp) => (
            <button
              key={tp}
              className="flex-1 btn btn-sm"
              style={{
                borderRadius: '0.5rem',
                background: type === tp
                  ? tp === 'expense'
                    ? 'oklch(0.58 0.22 25)'
                    : 'oklch(0.55 0.18 145)'
                  : 'transparent',
                color: type === tp ? 'white' : 'inherit',
                fontWeight: type === tp ? 600 : 400,
              }}
              onClick={() => setType(tp)}
              id={`type-switch-${tp}`}
            >
              {tp === 'expense' ? t.expense : t.income}
            </button>
          ))}
        </div>

        {/* Amount + Currency row */}
        <div className="flex gap-2 mb-5">
          <div className="flex-1">
            <label className="label">{t.amount}</label>
            <input
              type="number"
              className="input"
              placeholder={t.enterAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              autoFocus
              id="tx-amount-input"
            />
          </div>
          <div className="w-24">
            <label className="label">{t.currency}</label>
            <select
              className="input select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              id="tx-currency-select"
            >
              {CURRENCY_OPTIONS.map(opt => (
                <option key={opt.symbol} value={opt.symbol}>{opt.symbol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="label" style={{ marginBottom: '0.75rem' }}>{t.category}</label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {(categories ?? DEFAULT_CATEGORIES).map((cat) => (
              <button
                key={cat.id}
                className="flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-medium transition-all"
                style={{
                  border: categoryId === cat.id ? `2px solid ${cat.color}` : '2px solid transparent',
                  background: categoryId === cat.id ? `${cat.color}18` : 'var(--color-surface-3)',
                  color: categoryId === cat.id ? cat.color : 'inherit',
                }}
                onClick={() => setCategoryId(cat.id)}
                id={`cat-btn-${cat.id}`}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-surface shadow-sm">
                  <IconRenderer name={cat.icon} size={16} />
                </div>
                <span className="text-center leading-tight truncate w-full px-0.5">{getCategoryName(cat)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="mb-5">
          <label className="label">{t.date}</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            id="tx-date-input"
          />
        </div>

        {/* Note */}
        {DEBT_CATEGORY_IDS.has(categoryId) && (
          <div className="mb-5">
            <label className="label">{t.personName}</label>
            <input
              type="text"
              className="input"
              placeholder={t.enterPersonName || 'Who is this debt for?'}
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              id="tx-person-name-input"
            />
          </div>
        )}

        <div className="mb-5">
          <label className="label">{t.expenseTitle || t.note} <span style={{ color: 'oklch(0.60 0.01 265)', fontWeight: 400 }}>({t.optional})</span></label>
          <input
            type="text"
            className="input"
            placeholder={t.enterExpenseTitle || t.enterNote}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            id="tx-note-input"
          />
        </div>

        {/* Tags */}
        <div className="mb-5">
          <label className="label">{t.tags} <span style={{ color: 'oklch(0.60 0.01 265)', fontWeight: 400 }}>({t.optional})</span></label>
          <input
            type="text"
            className="input"
            placeholder={t.enterTags}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            id="tx-tags-input"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:justify-end mt-6">
          <button className="btn btn-secondary w-full sm:w-auto" onClick={onClose} id="tx-cancel-btn">{t.cancel}</button>
          <button
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => handleSave(false)}
            disabled={saving}
            id="tx-save-btn"
          >
            {saving ? '…' : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
