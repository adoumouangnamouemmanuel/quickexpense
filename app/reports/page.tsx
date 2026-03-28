'use client';

// Reports page – period views + export/import
import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, subMonths } from 'date-fns';
import { db } from '../_lib/db';
import { useLanguage } from '../_lib/i18n';
import { DEFAULT_CATEGORIES } from '../_lib/categories';
import { formatCurrency } from '../_lib/utils';
import { AppShell } from '../_components/AppShell';
import { ExportImport } from '../_components/ExportImport';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function ReportsPage() {
  const { t, language } = useLanguage();
  const [period, setPeriod] = useState<Period>('monthly');

  const transactions = useLiveQuery(() =>
    db.transactions.orderBy('date').toArray(), []
  ) ?? [];

  const categories = useLiveQuery(() => db.categories.toArray(), [], DEFAULT_CATEGORIES) ?? DEFAULT_CATEGORIES;

  const settings = useLiveQuery(() => db.settings.toArray(), []) ?? [];
  const currency = settings.find(s => s.key === 'currency')?.value ?? '$';

  // ─── Chart data by period ─────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    if (period === 'daily') {
      // Last 30 days
      const days: Record<string, { date: string; income: number; expenses: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days[key] = { date: format(d, 'MMM d'), income: 0, expenses: 0 };
      }
      for (const tx of transactions) {
        if (days[tx.date]) {
          if (tx.type === 'income') days[tx.date].income += tx.amount;
          else days[tx.date].expenses += tx.amount;
        }
      }
      return Object.values(days);
    }

    if (period === 'weekly') {
      // Last 12 weeks
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 83);
      const weeks = eachWeekOfInterval({ start, end: now }, { weekStartsOn: 1 });
      return weeks.map(weekStart => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const startStr = weekStart.toISOString().slice(0, 10);
        const endStr = weekEnd.toISOString().slice(0, 10);
        let income = 0, expenses = 0;
        for (const tx of transactions) {
          if (tx.date >= startStr && tx.date <= endStr) {
            if (tx.type === 'income') income += tx.amount;
            else expenses += tx.amount;
          }
        }
        return { date: format(weekStart, 'MMM d'), income, expenses };
      });
    }

    if (period === 'monthly') {
      // Last 12 months
      const months: { date: string; income: number; expenses: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const key = d.toISOString().slice(0, 7);
        const label = format(d, 'MMM yy');
        let income = 0, expenses = 0;
        for (const tx of transactions) {
          if (tx.date.startsWith(key)) {
            if (tx.type === 'income') income += tx.amount;
            else expenses += tx.amount;
          }
        }
        months.push({ date: label, income, expenses });
      }
      return months;
    }

    // yearly – last 4 years
    const years: { date: string; income: number; expenses: number }[] = [];
    const thisYear = new Date().getFullYear();
    for (let y = thisYear - 3; y <= thisYear; y++) {
      let income = 0, expenses = 0;
      for (const tx of transactions) {
        if (tx.date.startsWith(String(y))) {
          if (tx.type === 'income') income += tx.amount;
          else expenses += tx.amount;
        }
      }
      years.push({ date: String(y), income, expenses });
    }
    return years;
  }, [transactions, period]);

  // ─── Summary stats for current view ────────────────────────────────────────────

  const totalIncome = chartData.reduce((s, d) => s + d.income, 0);
  const totalExpenses = chartData.reduce((s, d) => s + d.expenses, 0);

  const periodLabels: Record<Period, string> = {
    daily: t.daily,
    weekly: t.weekly,
    monthly: t.monthly,
    yearly: t.yearly,
  };

  return (
    <AppShell>
      <div className="mb-4 hidden md:block">
        <h1 className="text-xl font-bold">{t.reports}</h1>
      </div>

      {/* Period tabs */}
      <div
        className="flex rounded-lg mb-4 p-1 w-fit"
        style={{ background: 'var(--color-surface-2)' }}
      >
        {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
          <button
            key={p}
            className="btn btn-sm"
            style={{
              borderRadius: '0.5rem',
              background: period === p ? 'oklch(0.52 0.24 265)' : 'transparent',
              color: period === p ? 'white' : 'inherit',
              fontWeight: period === p ? 600 : 400,
            }}
            onClick={() => setPeriod(p)}
            id={`period-tab-${p}`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="card stat-income py-3">
          <p className="text-xs mb-1" style={{ color: 'oklch(0.55 0.18 145)' }}>{t.totalIncome}</p>
          <p className="text-lg font-bold" style={{ color: 'oklch(0.45 0.18 145)' }}>
            {formatCurrency(totalIncome, currency)}
          </p>
        </div>
        <div className="card stat-expense py-3">
          <p className="text-xs mb-1" style={{ color: 'oklch(0.58 0.22 25)' }}>{t.totalExpenses}</p>
          <p className="text-lg font-bold" style={{ color: 'oklch(0.48 0.22 25)' }}>
            {formatCurrency(totalExpenses, currency)}
          </p>
        </div>
        <div className="card stat-balance py-3 col-span-2 sm:col-span-1">
          <p className="text-xs mb-1" style={{ color: 'oklch(0.52 0.24 265)' }}>{t.balance}</p>
          <p
            className="text-lg font-bold"
            style={{ color: totalIncome - totalExpenses >= 0 ? 'oklch(0.45 0.18 145)' : 'oklch(0.48 0.22 25)' }}
          >
            {formatCurrency(Math.abs(totalIncome - totalExpenses), currency)}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card mb-4">
        <h2 className="font-semibold mb-3 text-sm">{t.reports}</h2>
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'oklch(0.60 0.01 265)' }}>
            {t.noData}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.82 0.01 265 / 0.3)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${currency}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value ?? 0), currency),
                  name === 'income' ? t.income : t.expense,
                ]}
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: 'none',
                  boxShadow: '0 8px 32px rgb(0 0 0 / 0.15)',
                  fontSize: '0.875rem',
                }}
              />
              <Bar dataKey="income" fill="oklch(0.55 0.18 145)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="expenses" fill="oklch(0.58 0.22 25)" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Export / Import */}
      <ExportImport transactions={transactions} currency={currency} />
    </AppShell>
  );
}
