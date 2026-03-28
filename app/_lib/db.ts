// Dexie.js (IndexedDB) database schema for QuickExpense
import Dexie, { type Table } from 'dexie';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id?: number;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // ISO date string YYYY-MM-DD
  note: string;
  tags: string[];
  currency: string;
  createdAt: number; // timestamp ms
}

export interface Category {
  id: string;
  nameEn: string;
  nameFr: string;
  icon: string;
  color: string;
  isCustom: boolean;
}

export interface Budget {
  id?: number;
  categoryId: string | null; // null = global monthly budget
  amount: number;
  period: 'monthly';
}

export interface Settings {
  id?: number;
  key: string;
  value: string;
}

// ─── Dexie DB ─────────────────────────────────────────────────────────────────

class QuickExpenseDB extends Dexie {
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  budgets!: Table<Budget>;
  settings!: Table<Settings>;

  constructor() {
    super('QuickExpenseDB');
    this.version(1).stores({
      transactions: '++id, type, categoryId, date, createdAt',
      categories: 'id, isCustom',
      budgets: '++id, categoryId',
      settings: '++id, key',
    });
  }
}

export const db = new QuickExpenseDB();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get setting by key */
export async function getSetting(key: string): Promise<string | null> {
  const row = await db.settings.where('key').equals(key).first();
  return row?.value ?? null;
}

/** Upsert a setting */
export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.settings.where('key').equals(key).first();
  if (existing?.id !== undefined) {
    await db.settings.update(existing.id, { value });
  } else {
    await db.settings.add({ key, value });
  }
}

/** Get all transactions for a given month (YYYY-MM) */
export async function getMonthTransactions(month: string): Promise<Transaction[]> {
  return db.transactions
    .where('date')
    .startsWith(month)
    .reverse()
    .sortBy('date');
}

/** Get last N days of transactions */
export async function getRecentTransactions(days = 30): Promise<Transaction[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return db.transactions
    .where('date')
    .aboveOrEqual(cutoffStr)
    .reverse()
    .sortBy('date');
}
