"use client";

// Dashboard – Home Page
import { useLiveQuery } from "dexie-react-hooks";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "./_components/AppShell";
import { BudgetProgress } from "./_components/BudgetProgress";
import {
  CategoryLegend,
  ExpensePieChart,
  SpendingLineChart,
} from "./_components/Charts";
import { FAB } from "./_components/FAB";
import { TransactionList } from "./_components/TransactionList";
import { useAuth } from "./_lib/auth";
import { DEFAULT_CATEGORIES } from "./_lib/categories";
import { db } from "./_lib/db";
import { useLanguage } from "./_lib/i18n";
import { currentMonthISO, formatCurrency, todayISO } from "./_lib/utils";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [periodScope, setPeriodScope] = useState<"week" | "month" | "year" | "all">("month");
  const [chartScope, setChartScope] = useState<"week" | "month">("week");
  const [chartAnchorDate, setChartAnchorDate] = useState(todayISO());

  // ─── Live data ───────────────────────────────────────────────────────────────

  const month = currentMonthISO();

  const allTransactions =
    useLiveQuery(
      () => db.transactions.orderBy("date").reverse().toArray(),
      [],
    ) ?? [];

  const monthTransactions =
    useLiveQuery(
      () => db.transactions.where("date").startsWith(month).toArray(),
      [month],
    ) ?? [];

  const categories =
    useLiveQuery(() => db.categories.toArray(), [], DEFAULT_CATEGORIES) ??
    DEFAULT_CATEGORIES;

  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];

  const settings = useLiveQuery(() => db.settings.toArray(), []) ?? [];
  const currency = settings.find((s) => s.key === "currency")?.value ?? "$";

  // ─── Stats ────────────────────────────────────────────────────────────────────

  const scopedTransactions = useMemo(() => {
    if (periodScope === "all") return allTransactions;

    const now = new Date();
    if (periodScope === "year") {
      const yearPrefix = String(now.getFullYear());
      return allTransactions.filter((tx) => tx.date.startsWith(yearPrefix));
    }

    if (periodScope === "month") {
      const monthPrefix = currentMonthISO();
      return allTransactions.filter((tx) => tx.date.startsWith(monthPrefix));
    }

    const monday = new Date(now);
    const day = monday.getDay() || 7;
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - day + 1);
    const mondayISO = monday.toISOString().slice(0, 10);
    return allTransactions.filter((tx) => tx.date >= mondayISO);
  }, [allTransactions, periodScope]);

  const totalIncome = scopedTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = scopedTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpenses;
  const totalMoneyLent = scopedTransactions
    .filter((tx) => tx.type === "expense" && tx.categoryId === "money-lent")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebtRepaid = scopedTransactions
    .filter((tx) => tx.type === "income" && tx.categoryId === "debt-repaid")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const debtOutstanding = Math.max(totalMoneyLent - totalDebtRepaid, 0);

  const globalBudget = budgets.find((b) => b.categoryId === null);

  // ─── Demo data ────────────────────────────────────────────────────────────────

  const loadDemo = useCallback(async () => {
    const { seedSampleData } = await import("./_lib/sampleData");
    await seedSampleData();
    toast.success("Sample data loaded!");
  }, []);

  const clearSampleOnly = useCallback(async () => {
    const { clearSampleData } = await import("./_lib/sampleData");
    await clearSampleData();
    toast.success("Sample data cleared");
  }, []);

  const hasData = allTransactions.length > 0;
  const hasSampleData = allTransactions.some((tx) => tx.tags?.includes("__sample"));
  const hasUserData = allTransactions.some((tx) => !tx.tags?.includes("__sample"));
  const showClearSample = hasSampleData && !hasUserData;

  const periodLabel =
    periodScope === "week"
      ? t.thisWeek
      : periodScope === "month"
        ? t.thisMonth
        : periodScope === "year"
          ? t.thisYear
          : t.allTime;

  const chartRange = useMemo(() => {
    const anchor = new Date(chartAnchorDate);
    if (Number.isNaN(anchor.getTime())) {
      return { start: todayISO(), end: todayISO(), label: "" };
    }

    if (chartScope === "week") {
      const start = new Date(anchor);
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        label:
          language === "fr"
            ? `${start.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}`
            : `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      };
    }

    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      label: start.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [chartAnchorDate, chartScope, language]);

  const chartTransactions = useMemo(
    () => allTransactions.filter((tx) => tx.date >= chartRange.start && tx.date <= chartRange.end),
    [allTransactions, chartRange.end, chartRange.start],
  );

  const shiftChartRange = useCallback(
    (direction: -1 | 1) => {
      const base = new Date(chartAnchorDate);
      if (Number.isNaN(base.getTime())) return;

      if (chartScope === "week") {
        base.setDate(base.getDate() + 7 * direction);
      } else {
        base.setMonth(base.getMonth() + direction);
      }
      setChartAnchorDate(base.toISOString().slice(0, 10));
    },
    [chartAnchorDate, chartScope],
  );

  return (
    <AppShell>
      {hasData && (
        <div className="mb-4 card py-4 sm:py-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString(
              language === "fr" ? "fr-FR" : "en-US",
              {
                month: "long",
                year: "numeric",
              },
            )}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white mt-1">
            {t.dashboard}
          </h1>
        </div>
      )}

      {/* Welcome / empty state */}
      {!hasData && (
        <div
          className="card mb-6 text-center py-10 border border-gray-100 dark:border-gray-800/60"
          style={{ background: "var(--color-surface)" }}
        >
          <div className="w-16 h-16 rounded-3xl mx-auto mb-5 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Wallet
              size={28}
              strokeWidth={2}
              className="text-black dark:text-white"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-black dark:text-white">
            {t.welcome}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-64 mx-auto leading-relaxed">
            {t.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              className="btn btn-primary px-6"
              onClick={() => router.push("/bulk")}
              id="start-tracking-btn"
            >
              {t.addExpense}
            </button>
            <button
              className="btn btn-secondary px-6"
              onClick={loadDemo}
              id="try-demo-btn-empty"
            >
              <Activity size={16} />
              {t.tryDemo}
            </button>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="mb-3 overflow-x-auto hide-scrollbar">
        <div className="inline-flex rounded-xl p-1 bg-surface-2 border border-surface-3 min-w-max">
          {([
            { id: "week", label: t.thisWeek },
            { id: "month", label: t.thisMonth },
            { id: "year", label: t.thisYear },
            { id: "all", label: t.allTime },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-semibold ${
                periodScope === opt.id
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                  : "text-gray-500 hover:text-black dark:hover:text-white"
              }`}
              onClick={() => setPeriodScope(opt.id)}
              id={`dashboard-scope-${opt.id}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Income */}
        <div className="card stat-income">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium"
              style={{ color: "oklch(0.55 0.18 145)" }}
            >
              {t.totalIncome}
            </span>
            <TrendingUp size={16} style={{ color: "oklch(0.55 0.18 145)" }} />
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: "oklch(0.45 0.18 145)" }}
          >
            {formatCurrency(totalIncome, currency)}
          </p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.60 0.01 265)" }}>
            {periodLabel}
          </p>
        </div>

        {/* Expenses */}
        <div className="card stat-expense">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium"
              style={{ color: "oklch(0.58 0.22 25)" }}
            >
              {t.totalExpenses}
            </span>
            <TrendingDown size={16} style={{ color: "oklch(0.58 0.22 25)" }} />
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: "oklch(0.48 0.22 25)" }}
          >
            {formatCurrency(totalExpenses, currency)}
          </p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.60 0.01 265)" }}>
            {periodLabel}
          </p>
        </div>

        {/* Balance */}
        <div className="card stat-balance">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium"
              style={{ color: "oklch(0.52 0.24 265)" }}
            >
              {t.balance}
            </span>
            <Wallet size={16} style={{ color: "oklch(0.52 0.24 265)" }} />
          </div>
          <p
            className="text-2xl font-bold"
            style={{
              color:
                balance >= 0 ? "oklch(0.45 0.18 145)" : "oklch(0.48 0.22 25)",
            }}
          >
            {balance >= 0 ? "" : "-"}
            {formatCurrency(Math.abs(balance), currency)}
          </p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.60 0.01 265)" }}>
            {periodLabel}
          </p>
        </div>

        {/* Total debt */}
        <Link href="/transactions?scope=mes-bons" className="card block">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium"
              style={{ color: "oklch(0.58 0.22 25)" }}
            >
              {t.debtOutstanding}
            </span>
            <HandCoins size={16} style={{ color: "oklch(0.58 0.22 25)" }} />
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: "oklch(0.58 0.22 25)" }}
          >
            {formatCurrency(debtOutstanding, currency)}
          </p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.60 0.01 265)" }}>
            {periodLabel}
          </p>
        </Link>
      </div>

      {(totalMoneyLent > 0 || totalDebtRepaid > 0) && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">{t.debtTracking}</h2>
            <HandCoins size={16} className="text-gray-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-xl border border-surface-3 bg-surface-2 p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t.moneyLent}
              </p>
              <p className="mt-1 text-sm sm:text-base font-bold text-black dark:text-white">
                {formatCurrency(totalMoneyLent, currency)}
              </p>
            </div>
            <div className="rounded-xl border border-surface-3 bg-surface-2 p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t.debtRepaid}
              </p>
              <p className="mt-1 text-sm sm:text-base font-bold text-black dark:text-white">
                {formatCurrency(totalDebtRepaid, currency)}
              </p>
            </div>
            <div className="rounded-xl border border-surface-3 bg-surface-2 p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t.debtOutstanding}
              </p>
              <p className="mt-1 text-sm sm:text-base font-bold text-amber-600 dark:text-amber-500">
                {formatCurrency(debtOutstanding, currency)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Budget progress */}
      {globalBudget && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-3 text-sm">{t.monthlyBudget}</h2>
          <BudgetProgress
            budget={globalBudget}
            transactions={monthTransactions}
            category={null}
            currency={currency}
          />
        </div>
      )}

      {/* Charts row */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Pie chart */}
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="font-semibold text-sm">{t.expensesByCategory}</h2>
              <div className="inline-flex rounded-xl p-1 bg-surface-2 border border-surface-3">
                <button
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold ${chartScope === "week" ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500"}`}
                  onClick={() => setChartScope("week")}
                >
                  {t.thisWeek}
                </button>
                <button
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold ${chartScope === "month" ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500"}`}
                  onClick={() => setChartScope("month")}
                >
                  {t.thisMonth}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button className="btn btn-ghost btn-sm" onClick={() => shiftChartRange(-1)}>
                <ChevronLeft size={14} />
              </button>
              <input
                type="date"
                value={chartAnchorDate}
                onChange={(e) => setChartAnchorDate(e.target.value)}
                className="input max-w-44 h-8 text-xs"
              />
              <button className="btn btn-ghost btn-sm" onClick={() => shiftChartRange(1)}>
                <ChevronRight size={14} />
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">{chartRange.label}</span>
            </div>
            <ExpensePieChart
              transactions={chartTransactions}
              categories={categories}
              currency={currency}
            />
            <CategoryLegend
              transactions={chartTransactions}
              categories={categories}
              currency={currency}
            />
          </div>

          {/* Line chart */}
          <div className="card">
            <h2 className="font-semibold mb-3 text-sm">{t.spendingTrend}</h2>
            <SpendingLineChart
              transactions={chartTransactions}
              currency={currency}
              startDate={chartRange.start}
              endDate={chartRange.end}
            />
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {hasData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">{t.transactions}</h2>
            <Link
              href="/transactions"
              className="text-xs font-medium text-black dark:text-white underline decoration-1 underline-offset-2 hover:opacity-70 transition-opacity"
            >
              View all →
            </Link>
          </div>
          <TransactionList
            transactions={allTransactions}
            categories={categories}
            currency={currency}
            showFilters={false}
            limit={8}
          />
        </div>
      )}

      {showClearSample && (
        <div className="mt-4 flex justify-end">
          <button
            className="btn btn-ghost btn-sm text-xs"
            style={{ color: "oklch(0.60 0.01 265)" }}
            onClick={clearSampleOnly}
            id="clear-sample-data-btn"
          >
            {t.clearDemo}
          </button>
        </div>
      )}

      {/* Demo clear */}
      {/* Premium Upsell Banner – visible when not signed in */}
      {!user && hasData && (
        <Link
          href="/premium"
          className="card mt-6 flex items-center gap-4 p-4 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 group cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Star size={20} className="text-amber-600 fill-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-black dark:text-white">
              {language === "fr"
                ? "Passez à QuickExpense Pro"
                : "Upgrade to QuickExpense Pro"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {language === "fr"
                ? "Cloud sync, exports CSV, catégories illimitées"
                : "Cloud sync, CSV exports, unlimited categories"}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </Link>
      )}

      <FAB />
    </AppShell>
  );
}
