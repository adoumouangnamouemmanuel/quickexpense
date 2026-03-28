"use client";

// Reports page – period views + premium export
import { eachWeekOfInterval, endOfWeek, format, subMonths } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "../_components/AppShell";
import { ExportImport } from "../_components/ExportImport";
import { useAuth } from "../_lib/auth";
import { db } from "../_lib/db";
import { useLanguage } from "../_lib/i18n";
import { formatCurrency } from "../_lib/utils";

type Period = "daily" | "weekly" | "monthly" | "yearly";

export default function ReportsPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("monthly");

  const transactions =
    useLiveQuery(() => db.transactions.orderBy("date").toArray(), []) ?? [];

  const settings = useLiveQuery(() => db.settings.toArray(), []) ?? [];
  const currency = settings.find((s) => s.key === "currency")?.value ?? "$";

  // ─── Chart data by period ─────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    if (period === "daily") {
      const days: Record<
        string,
        { date: string; income: number; expenses: number }
      > = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days[key] = { date: format(d, "MMM d"), income: 0, expenses: 0 };
      }
      for (const tx of transactions) {
        if (days[tx.date]) {
          if (tx.type === "income") days[tx.date].income += tx.amount;
          else days[tx.date].expenses += tx.amount;
        }
      }
      return Object.values(days);
    }

    if (period === "weekly") {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 83);
      const weeks = eachWeekOfInterval(
        { start, end: now },
        { weekStartsOn: 1 },
      );
      return weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const startStr = weekStart.toISOString().slice(0, 10);
        const endStr = weekEnd.toISOString().slice(0, 10);
        let income = 0,
          expenses = 0;
        for (const tx of transactions) {
          if (tx.date >= startStr && tx.date <= endStr) {
            if (tx.type === "income") income += tx.amount;
            else expenses += tx.amount;
          }
        }
        return { date: format(weekStart, "MMM d"), income, expenses };
      });
    }

    if (period === "monthly") {
      const months: { date: string; income: number; expenses: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const key = d.toISOString().slice(0, 7);
        const label = format(d, "MMM yy");
        let income = 0,
          expenses = 0;
        for (const tx of transactions) {
          if (tx.date.startsWith(key)) {
            if (tx.type === "income") income += tx.amount;
            else expenses += tx.amount;
          }
        }
        months.push({ date: label, income, expenses });
      }
      return months;
    }

    // yearly
    const years: { date: string; income: number; expenses: number }[] = [];
    const thisYear = new Date().getFullYear();
    for (let y = thisYear - 3; y <= thisYear; y++) {
      let income = 0,
        expenses = 0;
      for (const tx of transactions) {
        if (tx.date.startsWith(String(y))) {
          if (tx.type === "income") income += tx.amount;
          else expenses += tx.amount;
        }
      }
      years.push({ date: String(y), income, expenses });
    }
    return years;
  }, [transactions, period]);

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
      <div className="mb-4 card py-4 sm:py-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
          Insights
        </p>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white mt-1">
          {t.reports}
        </h1>
      </div>

      {/* Period tabs */}
      <div className="mb-4 overflow-x-auto hide-scrollbar">
        <div className="inline-flex rounded-xl p-1.5 bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] min-w-max">
          {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
            <button
              key={p}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors font-semibold ${
                period === p
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                  : "text-gray-500 hover:text-black dark:hover:text-white"
              }`}
              onClick={() => setPeriod(p)}
              id={`period-tab-${p}`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="card stat-income py-3">
          <p className="text-xs mb-1" style={{ color: "oklch(0.55 0.18 145)" }}>
            {t.totalIncome}
          </p>
          <p
            className="text-lg font-bold"
            style={{ color: "oklch(0.45 0.18 145)" }}
          >
            {formatCurrency(totalIncome, currency)}
          </p>
        </div>
        <div className="card stat-expense py-3">
          <p className="text-xs mb-1" style={{ color: "oklch(0.58 0.22 25)" }}>
            {t.totalExpenses}
          </p>
          <p
            className="text-lg font-bold"
            style={{ color: "oklch(0.48 0.22 25)" }}
          >
            {formatCurrency(totalExpenses, currency)}
          </p>
        </div>
        <div className="card stat-balance py-3 col-span-2 sm:col-span-1">
          <p className="text-xs mb-1 text-gray-500">{t.balance}</p>
          <p
            className="text-lg font-bold"
            style={{
              color:
                totalIncome - totalExpenses >= 0
                  ? "oklch(0.45 0.18 145)"
                  : "oklch(0.48 0.22 25)",
            }}
          >
            {formatCurrency(Math.abs(totalIncome - totalExpenses), currency)}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">{t.reports}</h2>
          {/* Yearly/Weekly reports are "premium" badge */}
          {(period === "yearly" || period === "weekly") && !user?.isPro && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star size={10} className="fill-current" /> PRO
            </span>
          )}
        </div>
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-gray-400">
            {t.noData}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 5, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.82 0.01 265 / 0.3)"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  `${currency}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                }
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value ?? 0), currency),
                  name === "income" ? t.income : t.expense,
                ]}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 8px 32px rgb(0 0 0 / 0.15)",
                  fontSize: "0.875rem",
                }}
              />
              <Bar
                dataKey="income"
                fill="oklch(0.55 0.18 145)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="expenses"
                fill="oklch(0.58 0.22 25)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Export (premium-gated) */}
      <ExportImport transactions={transactions} currency={currency} />

      {/* Premium upsell – if user not pro */}
      {!user?.isPro && (
        <Link
          href="/premium"
          className="card mt-4 flex items-center gap-4 p-4 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 group cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Star size={20} className="text-amber-600 fill-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              {language === "fr"
                ? "Débloquez les rapports avancés"
                : "Unlock Advanced Reports"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {language === "fr"
                ? "Exports PDF, analyses IA, rapports hebdomadaires"
                : "PDF exports, AI insights, weekly reports"}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </Link>
      )}
    </AppShell>
  );
}
