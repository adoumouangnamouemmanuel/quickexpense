// Sample data seeder for QuickExpense demo mode
import type { Transaction } from './db';
import { toLocalISODate } from './utils';

/** Generates realistic sample transactions for demo */
export function generateSampleTransactions(): Omit<Transaction, 'id'>[] {
  const today = new Date();
  const mkDate = (daysAgo: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return toLocalISODate(d);
  };

  const baseTransactions: Omit<Transaction, 'id'>[] = [
    // Incomes
    { amount: 3500, type: 'income', categoryId: 'salary', date: mkDate(28), note: 'Monthly salary', tags: ['work'], currency: '$', createdAt: Date.now() - 28 * 86400000 },
    { amount: 250, type: 'income', categoryId: 'other', date: mkDate(14), note: 'Freelance project', tags: ['freelance'], currency: '$', createdAt: Date.now() - 14 * 86400000 },
    // Expenses
    { amount: 1200, type: 'expense', categoryId: 'rent', date: mkDate(27), note: 'Monthly rent', tags: [], currency: '$', createdAt: Date.now() - 27 * 86400000 },
    { amount: 85, type: 'expense', categoryId: 'utilities', date: mkDate(22), note: 'Electricity bill', tags: ['home'], currency: '$', createdAt: Date.now() - 22 * 86400000 },
    { amount: 45, type: 'expense', categoryId: 'utilities', date: mkDate(22), note: 'Internet bill', tags: ['home'], currency: '$', createdAt: Date.now() - 22 * 86400000 },
    { amount: 62, type: 'expense', categoryId: 'groceries', date: mkDate(21), note: 'Weekly groceries', tags: ['food'], currency: '$', createdAt: Date.now() - 21 * 86400000 },
    { amount: 34, type: 'expense', categoryId: 'food', date: mkDate(20), note: 'Dinner with friends', tags: ['social'], currency: '$', createdAt: Date.now() - 20 * 86400000 },
    { amount: 29, type: 'expense', categoryId: 'transport', date: mkDate(19), note: 'Gas', tags: [], currency: '$', createdAt: Date.now() - 19 * 86400000 },
    { amount: 55, type: 'expense', categoryId: 'groceries', date: mkDate(14), note: 'Groceries', tags: ['food'], currency: '$', createdAt: Date.now() - 14 * 86400000 },
    { amount: 18, type: 'expense', categoryId: 'food', date: mkDate(13), note: 'Lunch', tags: [], currency: '$', createdAt: Date.now() - 13 * 86400000 },
    { amount: 120, type: 'expense', categoryId: 'entertainment', date: mkDate(12), note: 'Netflix + Spotify', tags: ['subscriptions'], currency: '$', createdAt: Date.now() - 12 * 86400000 },
    { amount: 89, type: 'expense', categoryId: 'shopping', date: mkDate(10), note: 'Clothes', tags: [], currency: '$', createdAt: Date.now() - 10 * 86400000 },
    { amount: 22, type: 'expense', categoryId: 'transport', date: mkDate(9), note: 'Uber rides', tags: [], currency: '$', createdAt: Date.now() - 9 * 86400000 },
    { amount: 45, type: 'expense', categoryId: 'healthcare', date: mkDate(7), note: 'Pharmacy', tags: ['health'], currency: '$', createdAt: Date.now() - 7 * 86400000 },
    { amount: 58, type: 'expense', categoryId: 'groceries', date: mkDate(7), note: 'Weekly groceries', tags: ['food'], currency: '$', createdAt: Date.now() - 7 * 86400000 },
    { amount: 25, type: 'expense', categoryId: 'food', date: mkDate(5), note: 'Coffee & snacks', tags: [], currency: '$', createdAt: Date.now() - 5 * 86400000 },
    { amount: 199, type: 'expense', categoryId: 'education', date: mkDate(4), note: 'Online course', tags: ['learning'], currency: '$', createdAt: Date.now() - 4 * 86400000 },
    { amount: 15, type: 'expense', categoryId: 'transport', date: mkDate(3), note: 'Bus pass', tags: [], currency: '$', createdAt: Date.now() - 3 * 86400000 },
    { amount: 42, type: 'expense', categoryId: 'food', date: mkDate(2), note: 'Restaurant', tags: ['social'], currency: '$', createdAt: Date.now() - 2 * 86400000 },
    { amount: 30, type: 'expense', categoryId: 'groceries', date: mkDate(1), note: 'Groceries', tags: [], currency: '$', createdAt: Date.now() - 1 * 86400000 },
    { amount: 12, type: 'expense', categoryId: 'food', date: mkDate(0), note: 'Lunch today', tags: [], currency: '$', createdAt: Date.now() },
  ];

  return baseTransactions.map((tx) => ({
    ...tx,
    tags: Array.from(new Set([...(tx.tags ?? []), '__sample'])),
  }));
}

export async function seedSampleData(): Promise<void> {
  const { db } = await import('./db');
  const { setSetting } = await import('./db');
  const { seedCategories } = await import('./categories');
  await seedCategories();

  // Replace previous sample rows to avoid stacking duplicates.
  const existing = await db.transactions.toArray();
  const sampleIds = existing
    .filter((tx) => tx.tags?.includes('__sample'))
    .map((tx) => tx.id)
    .filter((id): id is number => id !== undefined);
  if (sampleIds.length > 0) {
    await db.transactions.bulkDelete(sampleIds);
  }

  const transactions = generateSampleTransactions();
  await db.transactions.bulkAdd(transactions as Transaction[]);
  await setSetting('sample_data_loaded', String(Date.now()));

  // Set a sample budget
  const existingBudget = await db.budgets.where('categoryId').equals(null as unknown as string).first();
  if (!existingBudget) {
    await db.budgets.add({ categoryId: null, amount: 2000, period: 'monthly' });
  }
}

export async function clearSampleData(): Promise<void> {
  const { db } = await import('./db');

  const all = await db.transactions.toArray();
  const sampleIds = all
    .filter((tx) => tx.tags?.includes('__sample'))
    .map((tx) => tx.id)
    .filter((id): id is number => id !== undefined);

  if (sampleIds.length > 0) {
    await db.transactions.bulkDelete(sampleIds);
  }

  const sampleSetting = await db.settings.where('key').equals('sample_data_loaded').first();
  if (sampleSetting?.id !== undefined) {
    await db.settings.delete(sampleSetting.id);
  }
}

export async function clearAllData(): Promise<void> {
  const { db } = await import('./db');
  await db.transactions.clear();
  await db.budgets.clear();
  await db.categories.clear();
  await db.settings.clear();
}
