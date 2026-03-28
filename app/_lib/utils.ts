// Utility helpers for QuickExpense
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number, symbol = '$'): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export const CURRENCY_OPTIONS = [
  { symbol: '$', label: 'USD ($)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: '¥', label: 'JPY (¥)' },
  { symbol: 'CFA', label: 'CFA' },
  { symbol: '₦', label: 'NGN (₦)' },
  { symbol: 'C$', label: 'CAD (C$)' },
  { symbol: 'CHF', label: 'CHF' },
] as const;

// ─── Date ─────────────────────────────────────────────────────────────────────

/** Format ISO date string to readable format */
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/** Today's date as YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Current month as YYYY-MM */
export function currentMonthISO(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Get array of last N days as YYYY-MM-DD strings */
export function lastNDays(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = subDays(today, n - 1 - i);
    return d.toISOString().slice(0, 10);
  });
}

/** Get array of days in month */
export function daysInMonth(month: string): string[] {
  const date = parseISO(`${month}-01`);
  const days = eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
  return days.map(d => d.toISOString().slice(0, 10));
}

/** Format YYYY-MM-DD to "Mar 28" */
export function shortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
}

// ─── Colors ───────────────────────────────────────────────────────────────────

export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
  '#a855f7', '#14b8a6',
];

// ─── Misc ─────────────────────────────────────────────────────────────────────

/** Generate a unique string ID */
export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Convert object to base64 */
export function toBase64(obj: unknown): string {
  return btoa(JSON.stringify(obj));
}

/** Parse base64 back to object */
export function fromBase64(str: string): unknown {
  try {
    return JSON.parse(atob(str));
  } catch {
    return null;
  }
}

/** Clamp number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** cn utility - merge class strings */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
