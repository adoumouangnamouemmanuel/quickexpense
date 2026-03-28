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
    id: 'money-lent',
    nameEn: 'Money Lent',
    nameFr: 'Mes bons',
    icon: 'HandCoins',
    color: '#0ea5a4',
    isCustom: false,
  },
  {
    id: 'debt-repaid',
    nameEn: 'Debt Repaid',
    nameFr: 'Dettes',
    icon: 'CircleDollarSign',
    color: '#14b8a6',
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

/** Seed default categories into the DB if not present, and migrate old emojis */
export async function seedCategories(): Promise<void> {
  // Import here to avoid circular issues at module level
  const { db } = await import('./db');
  
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkPut(DEFAULT_CATEGORIES);
  } else {
    const defaultById = new Map(DEFAULT_CATEGORIES.map((cat) => [cat.id, cat]));

    // Migration: Update any existing categories that still use old emojis instead of Lucide strings
    const existing = await db.categories.toArray();
    const toUpdate: Category[] = [];
    const existingIds = new Set(existing.map((cat) => cat.id));
    
    // Map between old emojis and new Lucide strings
    const emojiMap: Record<string, string> = {
      '🍽️': 'Utensils',
      '🚌': 'Car',
      '🏠': 'Home',
      '💡': 'Lightbulb',
      '🛒': 'ShoppingCart',
      '🎬': 'Music',
      '🏥': 'HeartPulse',
      '🛍️': 'Shirt',
      '✈️': 'Plane',
      '📚': 'GraduationCap',
      '💼': 'Wallet',
      '📦': 'HelpCircle',
      '🏷️': 'Tag', // Custom category default icon
      '🤝': 'HandCoins',
      '💸': 'CircleDollarSign',
    };

    for (const cat of existing) {
      let updated: Category | null = null;

      if (emojiMap[cat.icon]) {
        updated = { ...(updated ?? cat), icon: emojiMap[cat.icon] };
      }
      // Handle the case where the user had a custom string but it's not a valid Lucide icon name
      // This is trickier, but anything containing a non-ASCII char is likely an emoji
      else if (/[\u1000-\uFFFF]/.test(cat.icon)) {
        updated = { ...(updated ?? cat), icon: 'HelpCircle' };
      }

      // Keep debt labels consistent in French across upgrades.
      if (cat.id === 'money-lent' && cat.nameFr !== 'Mes bons') {
        updated = { ...(updated ?? cat), nameFr: 'Mes bons' };
      }
      if (cat.id === 'debt-repaid' && cat.nameFr !== 'Dettes') {
        updated = { ...(updated ?? cat), nameFr: 'Dettes' };
      }

      if (updated) {
        toUpdate.push(updated);
      }
    }

    if (toUpdate.length > 0) {
      await db.categories.bulkPut(toUpdate);
    }

    // Backfill any newly added default categories for existing users.
    const missingDefaults = DEFAULT_CATEGORIES.filter((cat) => !existingIds.has(cat.id));
    if (missingDefaults.length > 0) {
      await db.categories.bulkPut(
        missingDefaults.map((cat) => ({
          ...defaultById.get(cat.id)!,
          isCustom: false,
        }))
      );
    }
  }
}
