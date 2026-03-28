'use client';

import { useEffect, useMemo, useState } from 'react';


// Dashboard Charts: PieChart (by category) + LineChart (daily spending)
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { Category, Transaction } from '../_lib/db';
import { useLanguage } from '../_lib/i18n';
import { CHART_COLORS, formatCurrency, shortDate } from '../_lib/utils';
// ─── Pie Chart ────────────────────────────────────────────────────────────────

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

interface ExpensePieChartProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
}

export function ExpensePieChart({ transactions, categories, currency }: ExpensePieChartProps) {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const expenses = transactions.filter(tx => tx.type === 'expense');

  // Aggregate by category
  const byCategory: Record<string, number> = {};
  for (const tx of expenses) {
    byCategory[tx.categoryId] = (byCategory[tx.categoryId] ?? 0) + tx.amount;
  }

  const data: PieDataPoint[] = Object.entries(byCategory).map(([id, value], i) => {
    const cat = categories.find(c => c.id === id);
    return {
      name: cat ? (language === 'fr' ? cat.nameFr : cat.nameEn) : id,
      value,
      color: cat?.color ?? CHART_COLORS[i % CHART_COLORS.length],
    };
  }).sort((a, b) => b.value - a.value);

  useEffect(() => {
    if (data.length === 0) {
      setSelectedCategory(null);
      return;
    }

    if (!selectedCategory || !data.some((item) => item.name === selectedCategory)) {
      setSelectedCategory(data[0].name);
    }
  }, [data, selectedCategory]);

  const selectedIndex = useMemo(
    () => data.findIndex((item) => item.name === selectedCategory),
    [data, selectedCategory],
  );

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'oklch(0.60 0.01 265)' }}>
        {t.noData}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220} className="chart-shell">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
          onClick={(_, index) => {
            const name = data[index]?.name;
            if (!name) return;
            setSelectedCategory((prev) => (prev === name ? null : name));
          }}
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.color}
              fillOpacity={selectedIndex === -1 || selectedIndex === i ? 1 : 0.28}
              stroke={selectedIndex === i ? 'oklch(0.18 0.01 265)' : 'transparent'}
              strokeWidth={selectedIndex === i ? 2 : 0}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </Pie>
        <Tooltip
          cursor={false}
          formatter={(value) => [formatCurrency(Number(value ?? 0), currency), '']}
          contentStyle={{
            borderRadius: '0.75rem',
            border: 'none',
            boxShadow: '0 8px 32px rgb(0 0 0 / 0.15)',
            fontSize: '0.875rem',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Category legend ──────────────────────────────────────────────────────────

export function CategoryLegend({
  transactions,
  categories,
  currency,
}: ExpensePieChartProps) {
  const { language } = useLanguage();
  const byCategory: Record<string, number> = {};
  for (const tx of transactions.filter(t => t.type === 'expense')) {
    byCategory[tx.categoryId] = (byCategory[tx.categoryId] ?? 0) + tx.amount;
  }
  const total = Object.values(byCategory).reduce((a, b) => a + b, 0);

  const items = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, value]) => {
      const cat = categories.find(c => c.id === id);
      return {
        name: cat ? (language === 'fr' ? cat.nameFr : cat.nameEn) : id,
        value,
        color: cat?.color ?? '#6366f1',
        pct: total > 0 ? Math.round((value / total) * 100) : 0,
      };
    });

  return (
    <div className="flex flex-col gap-2 mt-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: item.color }}
          />
          <span className="flex-1 truncate">{item.name}</span>
          <span className="font-medium">{formatCurrency(item.value, currency)}</span>
          <span style={{ color: 'oklch(0.60 0.01 265)', minWidth: '2.5rem', textAlign: 'right' }}>
            {item.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Line Chart ───────────────────────────────────────────────────────────────

interface LineDataPoint {
  date: string;
  expenses: number;
  income: number;
}

interface SpendingLineChartProps {
  transactions: Transaction[];
  currency: string;
  days?: number;
  startDate?: string;
  endDate?: string;
}

export function SpendingLineChart({ transactions, currency, days = 30, startDate, endDate }: SpendingLineChartProps) {
  const { t } = useLanguage();
  const [selectedSeries, setSelectedSeries] = useState<'all' | 'expenses' | 'income'>('all');

  // Build day-by-day aggregation
  const dayMap: Record<string, { expenses: number; income: number }> = {};

  if (startDate && endDate) {
    const from = new Date(startDate);
    const to = new Date(endDate);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      dayMap[d.toISOString().slice(0, 10)] = { expenses: 0, income: 0 };
    }
  } else {
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dayMap[d.toISOString().slice(0, 10)] = { expenses: 0, income: 0 };
    }
  }

  for (const tx of transactions) {
    if (dayMap[tx.date]) {
      if (tx.type === 'expense') {
        dayMap[tx.date].expenses += tx.amount;
      } else {
        dayMap[tx.date].income += tx.amount;
      }
    }
  }

  const data: LineDataPoint[] = Object.entries(dayMap).map(([date, vals]) => ({
    date: shortDate(date),
    expenses: vals.expenses,
    income: vals.income,
  }));

  const effectiveDays = Math.max(data.length, 1);

  const hasData = data.some(d => d.expenses > 0 || d.income > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'oklch(0.60 0.01 265)' }}>
        {t.noData}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedSeries('all')}
          className={`px-2 py-1 rounded-full text-[11px] font-semibold transition-colors ${selectedSeries === 'all' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-surface-2 text-gray-500 border border-surface-3'}`}
        >
          {t.all}
        </button>
        <button
          type="button"
          onClick={() => setSelectedSeries('expenses')}
          className={`px-2 py-1 rounded-full text-[11px] font-semibold transition-colors ${selectedSeries === 'expenses' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-surface-2 text-gray-500 border border-surface-3'}`}
        >
          {t.expense}
        </button>
        <button
          type="button"
          onClick={() => setSelectedSeries('income')}
          className={`px-2 py-1 rounded-full text-[11px] font-semibold transition-colors ${selectedSeries === 'income' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-surface-2 text-gray-500 border border-surface-3'}`}
        >
          {t.income}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={220} className="chart-shell">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.82 0.01 265 / 0.3)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(effectiveDays / 7)}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${currency}${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          />
          <Tooltip
            cursor={false}
            formatter={(value, name) => [
              formatCurrency(Number(value ?? 0), currency),
              name === 'expenses' ? t.expense : t.income,
            ]}
            contentStyle={{
              borderRadius: '0.75rem',
              border: 'none',
              boxShadow: '0 8px 32px rgb(0 0 0 / 0.15)',
              fontSize: '0.875rem',
            }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="oklch(0.58 0.22 25)"
            strokeWidth={selectedSeries === 'expenses' ? 3.4 : 2.5}
            strokeOpacity={selectedSeries === 'all' || selectedSeries === 'expenses' ? 1 : 0.2}
            dot={false}
            activeDot={{ r: selectedSeries === 'all' || selectedSeries === 'expenses' ? 4 : 0 }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="oklch(0.55 0.18 145)"
            strokeWidth={selectedSeries === 'income' ? 3.4 : 2.5}
            strokeOpacity={selectedSeries === 'all' || selectedSeries === 'income' ? 1 : 0.2}
            dot={false}
            activeDot={{ r: selectedSeries === 'all' || selectedSeries === 'income' ? 4 : 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
