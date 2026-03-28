"use client";

// Transactions page – full list with filters
import { useLiveQuery } from "dexie-react-hooks";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "../_components/AppShell";
import { FAB } from "../_components/FAB";
import { TransactionList } from "../_components/TransactionList";
import { DEFAULT_CATEGORIES } from "../_lib/categories";
import { db } from "../_lib/db";
import { useLanguage } from "../_lib/i18n";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsLoadingShell />}>
      <TransactionsPageContent />
    </Suspense>
  );
}

function TransactionsPageContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialCategoryFilter =
    searchParams.get("scope") === "mes-bons" ? "debt" : "all";

  const transactions =
    useLiveQuery(
      () => db.transactions.orderBy("createdAt").reverse().toArray(),
      [],
    ) ?? [];

  const categories =
    useLiveQuery(() => db.categories.toArray(), [], DEFAULT_CATEGORIES) ??
    DEFAULT_CATEGORIES;

  const settings = useLiveQuery(() => db.settings.toArray(), []) ?? [];
  const currency = settings.find((s) => s.key === "currency")?.value ?? "$";

  return (
    <AppShell>
      <div className="mb-4 card py-4 sm:py-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
          Activity
        </p>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white mt-1">
          {t.transactions}
        </h1>
      </div>

      <div className="card p-4 sm:p-6">
        <TransactionList
          transactions={transactions}
          categories={categories}
          currency={currency}
          showFilters={true}
          initialCategoryFilter={initialCategoryFilter}
        />
      </div>

      <FAB />
    </AppShell>
  );
}

function TransactionsLoadingShell() {
  return (
    <AppShell>
      <div className="mb-4 card py-4 sm:py-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
          Activity
        </p>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white mt-1">
          Transactions
        </h1>
      </div>
      <div className="card p-6 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
      <FAB />
    </AppShell>
  );
}
