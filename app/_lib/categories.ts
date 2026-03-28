// Predefined bilingual categories for QuickExpense
import type { Category } from './db';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'food',
    nameEn: 'Food & Drink',
    nameFr: 'Alimentation',
    icon: 'Utensils',
    color: '#f97316',
    isCustom: false,
  },
  {
    id: 'transport',
    nameEn: 'Transport',
    nameFr: 'Transport',
    icon: 'Car',
    color: '#3b82f6',
    isCustom: false,
  },
  {
    id: 'rent',
    nameEn: 'Housing',
    nameFr: 'Logement',
    icon: 'Home',
    color: '#8b5cf6',
    isCustom: false,
  },
  {
    id: 'utilities',
    nameEn: 'Utilities',
    nameFr: 'Factures',
    icon: 'Lightbulb',
    color: '#eab308',
    isCustom: false,
  },
  {
    id: 'groceries',
    nameEn: 'Groceries',
    nameFr: 'Courses',
    icon: 'ShoppingCart',
    color: '#22c55e',
    isCustom: false,
  },
  {
    id: 'entertainment',
    nameEn: 'Entertainment',
    nameFr: 'Divertissement',
    icon: 'Music',
    color: '#ec4899',
    isCustom: false,
  },
  {
    id: 'healthcare',
    nameEn: 'Healthcare',
    nameFr: 'Santé',
    icon: 'HeartPulse',
    color: '#ef4444',
    isCustom: false,
  },
  {
    id: 'shopping',
    nameEn: 'Shopping',
    nameFr: 'Shopping',
    icon: 'Shirt',
    color: '#f43f5e',
    isCustom: false,
  },
  {
    id: 'travel',
    nameEn: 'Travel',
    nameFr: 'Voyage',
    icon: 'Plane',
    color: '#06b6d4',
    isCustom: false,
  },
  {
    id: 'education',
    nameEn: 'Education',
    nameFr: 'Éducation',
    icon: 'GraduationCap',
    color: '#6366f1',
    isCustom: false,
  },
  {
    id: 'salary',
    nameEn: 'Salary',
    nameFr: 'Salaire',
    icon: 'Wallet',
    color: '#10b981',
    isCustom: false,
  },
  {
    id: 'other',
    nameEn: 'Other',
    nameFr: 'Autre',
    icon: 'HelpCircle',
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
