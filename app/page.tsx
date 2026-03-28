"use client";

// Dashboard – Home Page
import { useLiveQuery } from "dexie-react-hooks";
import {
  Activity,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
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
import { currentMonthISO, formatCurrency } from "./_lib/utils";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

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

  const totalIncome = monthTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = monthTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpenses;

  const globalBudget = budgets.find((b) => b.categoryId === null);

  // ─── Demo data ────────────────────────────────────────────────────────────────

  const loadDemo = useCallback(async () => {
    const { seedSampleData } = await import("./_lib/sampleData");
    await seedSampleData();
    toast.success("Sample data loaded!");
  }, []);

  const clearDemo = useCallback(async () => {
    const { clearAllData } = await import("./_lib/sampleData");
    await clearAllData();
    toast.success("Data cleared");
  }, []);

  const hasData = allTransactions.length > 0;

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
          <div className="flex items-end justify-between mt-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
              {t.dashboard}
            </h1>
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadDemo}
              id="try-demo-btn-top"
            >
              <Activity size={14} />
              {t.tryDemo}
            </button>
          </div>
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
            Welcome
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
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
            {t.thisMonth}
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
            {t.thisMonth}
          </p>
        </div>

        {/* Balance */}
        <div className="card stat-balance col-span-2 sm:col-span-1">
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
            {t.thisMonth}
          </p>
        </div>
      </div>

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
            <h2 className="font-semibold mb-3 text-sm">
              {t.expensesByCategory}
            </h2>
            <ExpensePieChart
              transactions={monthTransactions}
              categories={categories}
              currency={currency}
            />
            <CategoryLegend
              transactions={monthTransactions}
              categories={categories}
              currency={currency}
            />
          </div>

          {/* Line chart */}
          <div className="card">
            <h2 className="font-semibold mb-3 text-sm">{t.spendingTrend}</h2>
            <SpendingLineChart
              transactions={allTransactions}
              currency={currency}
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

      {/* Demo clear */}
      {hasData && (
        <div className="mt-4 flex justify-end">
          <button
            className="btn btn-ghost btn-sm text-xs flex items-center gap-1"
            style={{ color: "oklch(0.60 0.01 265)" }}
            onClick={clearDemo}
            id="clear-data-btn"
          >
            <Trash2 size={12} />
            {t.clearDemo}
          </button>
        </div>
      )}

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
