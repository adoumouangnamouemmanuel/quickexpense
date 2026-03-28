// Predefined bilingual categories for QuickExpense
import type { Category } from './db';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'food',
    nameEn: 'Food & Drink',
    nameFr: 'Alimentation',
    icon: '🍽️',
    color: '#f97316',
    isCustom: false,
  },
  {
    id: 'transport',
    nameEn: 'Transport',
    nameFr: 'Transport',
    icon: '🚌',
    color: '#3b82f6',
    isCustom: false,
  },
  {
    id: 'rent',
    nameEn: 'Rent',
    nameFr: 'Loyer',
    icon: '🏠',
    color: '#8b5cf6',
    isCustom: false,
  },
  {
    id: 'utilities',
    nameEn: 'Utilities',
    nameFr: 'Factures',
    icon: '💡',
    color: '#eab308',
    isCustom: false,
  },
  {
    id: 'groceries',
    nameEn: 'Groceries',
    nameFr: 'Courses',
    icon: '🛒',
    color: '#22c55e',
    isCustom: false,
  },
  {
    id: 'entertainment',
    nameEn: 'Entertainment',
    nameFr: 'Divertissement',
    icon: '🎬',
    color: '#ec4899',
    isCustom: false,
  },
  {
    id: 'healthcare',
    nameEn: 'Healthcare',
    nameFr: 'Santé',
    icon: '🏥',
    color: '#ef4444',
    isCustom: false,
  },
  {
    id: 'shopping',
    nameEn: 'Shopping',
    nameFr: 'Shopping',
    icon: '🛍️',
    color: '#f43f5e',
    isCustom: false,
  },
  {
    id: 'travel',
    nameEn: 'Travel',
    nameFr: 'Voyage',
    icon: '✈️',
    color: '#06b6d4',
    isCustom: false,
  },
  {
    id: 'education',
    nameEn: 'Education',
    nameFr: 'Éducation',
    icon: '📚',
    color: '#6366f1',
    isCustom: false,
  },
  {
    id: 'salary',
    nameEn: 'Salary',
    nameFr: 'Salaire',
    icon: '💼',
    color: '#10b981',
    isCustom: false,
  },
  {
    id: 'other',
    nameEn: 'Other',
    nameFr: 'Autre',
    icon: '📦',
    color: '#6b7280',
    isCustom: false,
  },
];

/** Seed default categories into the DB if not present */
export async function seedCategories(): Promise<void> {
  // Import here to avoid circular issues at module level
  const { db } = await import('./db');
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkPut(DEFAULT_CATEGORIES);
  }
}
