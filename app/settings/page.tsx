"use client";

// Settings page
import { useLiveQuery } from "dexie-react-hooks";
import { Download, PlusCircle, Save, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../_components/AppShell";
import { BudgetProgress } from "../_components/BudgetProgress";
import { IconRenderer } from "../_components/IconRenderer";
import { LanguageSwitcher } from "../_components/LanguageSwitcher";
import { ThemeToggle } from "../_components/ThemeToggle";
import { useAuth } from "../_lib/auth";
import { DEFAULT_CATEGORIES, seedCategories } from "../_lib/categories";
import { db } from "../_lib/db";
import { useLanguage } from "../_lib/i18n";
import { CURRENCY_OPTIONS } from "../_lib/utils";

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  // ─── DB data ────────────────────────────────────────────────────────────────

  const settings = useLiveQuery(() => db.settings.toArray(), []) ?? [];
  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];
  const categories =
    useLiveQuery(() => db.categories.toArray(), [], DEFAULT_CATEGORIES) ??
    DEFAULT_CATEGORIES;
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) ?? [];
  const customCatsCount = categories.filter((c) => c.isCustom).length;

  const currency = settings.find((s) => s.key === "currency")?.value ?? "$";

  // ─── Local state ─────────────────────────────────────────────────────────────

  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [globalBudgetInput, setGlobalBudgetInput] = useState("");
  const [catBudgetInputs, setCatBudgetInputs] = useState<
    Record<string, string>
  >({});
  const [newCatName, setNewCatName] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [deferredInstall, setDeferredInstall] = useState<Event | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  // Populate from DB
  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  useEffect(() => {
    const gb = budgets.find((b) => b.categoryId === null);
    if (gb) setGlobalBudgetInput(String(gb.amount));
    const catInputs: Record<string, string> = {};
    for (const b of budgets.filter((b) => b.categoryId !== null)) {
      catInputs[b.categoryId!] = String(b.amount);
    }
    setCatBudgetInputs(catInputs);
  }, [budgets]);

  // PWA install prompt
  useEffect(() => {
    const standaloneMode =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(Boolean(standaloneMode));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const saveCurrency = async () => {
    const { setSetting } = await import("../_lib/db");
    await setSetting("currency", selectedCurrency);
    toast.success("Currency saved!");
  };

  const saveGlobalBudget = async () => {
    const amt = parseFloat(globalBudgetInput);
    if (isNaN(amt) || amt < 0) {
      toast.error("Invalid amount");
      return;
    }
    const existing = budgets.find((b) => b.categoryId === null);
    if (existing?.id !== undefined) {
      await db.budgets.update(existing.id, { amount: amt });
    } else {
      await db.budgets.add({
        categoryId: null,
        amount: amt,
        period: "monthly",
      });
    }
    toast.success(t.setBudget + " saved!");
  };

  const saveCatBudget = async (catId: string) => {
    const amt = parseFloat(catBudgetInputs[catId] ?? "");
    if (isNaN(amt) || amt < 0) {
      toast.error("Invalid amount");
      return;
    }
    const existing = budgets.find((b) => b.categoryId === catId);
    if (existing?.id !== undefined) {
      await db.budgets.update(existing.id, { amount: amt });
    } else {
      await db.budgets.add({
        categoryId: catId,
        amount: amt,
        period: "monthly",
      });
    }
    toast.success("Budget saved!");
  };

  const addCustomCategory = async () => {
    if (!newCatName.trim()) return;

    // Mock Freemium Check
    if (!user?.isPro && customCatsCount >= 2) {
      router.push("/premium");
      return;
    }

    await seedCategories();
    const id = newCatName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    await db.categories.put({
      id: `custom-${id}-${Date.now()}`,
      nameEn: newCatName,
      nameFr: newCatName,
      icon: "Tag",
      color: "#6366f1",
      isCustom: true,
    });
    setNewCatName("");
    toast.success("Category added!");
  };

  const deleteCustomCategory = async (id: string) => {
    await db.categories.delete(id);
    toast.success("Category deleted");
  };

  const clearAllData = async () => {
    const { clearAllData: clear } = await import("../_lib/sampleData");
    await clear();
    setConfirmClear(false);
    toast.success("All data cleared");
  };

  const installPWA = async () => {
    if (!deferredInstall) return;
    const prompt = deferredInstall as BeforeInstallPromptEvent;
    prompt.prompt?.();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") setDeferredInstall(null);
  };

  const triggerInstall = async () => {
    if (isStandalone) {
      toast.success(language === "fr" ? "Application deja installee" : "App already installed");
      return;
    }

    if (deferredInstall) {
      await installPWA();
      return;
    }

    toast.message(
      language === "fr"
        ? "Utilisez le menu du navigateur puis 'Installer l'application'."
        : "Use your browser menu and choose 'Install app'."
    );
  };

  const monthTxs = transactions.filter((tx) =>
    tx.date.startsWith(new Date().toISOString().slice(0, 7)),
  );

  const totalMoneyLent = transactions
    .filter((tx) => tx.type === "expense" && tx.categoryId === "money-lent")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebtRepaid = transactions
    .filter((tx) => tx.type === "income" && tx.categoryId === "debt-repaid")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const debtOutstanding = Math.max(totalMoneyLent - totalDebtRepaid, 0);

  return (
    <AppShell>
      <div className="mb-4 card py-4 sm:py-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
          Preferences
        </p>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white mt-1">
          {t.settings}
        </h1>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">
        {/* Language & Theme */}
        <div className="card">
          <h2 className="font-semibold mb-3 text-sm">
            {t.language} & {t.theme}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium mb-1">{t.language}</p>
              <LanguageSwitcher />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">{t.theme}</p>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="card">
          <h2 className="font-semibold mb-3 text-sm">{t.currencySymbol}</h2>
          <div className="flex gap-2">
            <select
              className="input select flex-1"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              id="currency-select"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.symbol} value={opt.symbol}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={saveCurrency}
              id="save-currency-btn"
            >
              <Save size={15} />
            </button>
          </div>
        </div>

        {/* Monthly budget */}
        <div className="card">
          <h2 className="font-semibold mb-3 text-sm">{t.monthlyBudget}</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              className="input flex-1"
              placeholder="e.g. 2000"
              value={globalBudgetInput}
              onChange={(e) => setGlobalBudgetInput(e.target.value)}
              min="0"
              id="global-budget-input"
            />
            <button
              className="btn btn-primary"
              onClick={saveGlobalBudget}
              id="save-budget-btn"
            >
              <Save size={15} />
            </button>
          </div>

          {budgets.find((b) => b.categoryId === null) && (
            <BudgetProgress
              budget={budgets.find((b) => b.categoryId === null)!}
              transactions={monthTxs}
              currency={selectedCurrency}
            />
          )}
        </div>

        {/* Category budgets */}
        <div className="card">
          <h2 className="font-semibold mb-3 text-sm">{t.categoryBudgets}</h2>
          <div className="flex flex-col gap-3">
            {categories.slice(0, 8).map((cat) => {
              const catName = language === "fr" ? cat.nameFr : cat.nameEn;
              return (
                <div key={cat.id}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: cat.color + "25",
                        color: cat.color,
                      }}
                    >
                      <IconRenderer name={cat.icon} size={14} />
                    </div>
                    <span className="text-sm font-medium flex-1 truncate">
                      {catName}
                    </span>
                    <input
                      type="number"
                      className="input"
                      style={{ width: "7rem" }}
                      placeholder="Budget"
                      value={catBudgetInputs[cat.id] ?? ""}
                      onChange={(e) =>
                        setCatBudgetInputs((prev) => ({
                          ...prev,
                          [cat.id]: e.target.value,
                        }))
                      }
                      min="0"
                      id={`cat-budget-${cat.id}`}
                    />
                    <button
                      className="btn btn-primary btn-sm btn-icon"
                      onClick={() => saveCatBudget(cat.id)}
                      id={`save-cat-budget-${cat.id}`}
                    >
                      <Save size={12} />
                    </button>
                  </div>
                  {budgets.find((b) => b.categoryId === cat.id) && (
                    <BudgetProgress
                      budget={budgets.find((b) => b.categoryId === cat.id)!}
                      transactions={monthTxs}
                      category={cat}
                      currency={selectedCurrency}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom categories */}
        <div className="card text-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm">
                {language === "fr"
                  ? "Catégories personnalisées"
                  : "Custom Categories"}
              </h2>
              {!user?.isPro && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 px-1.5 py-0.5 rounded-full">
                  PRO
                </span>
              )}
            </div>
            <span className="text-gray-400 text-xs">
              {customCatsCount} / {user?.isPro ? "∞" : "2"}
            </span>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="input flex-1"
              placeholder="New category name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
              id="new-cat-input"
            />
            <button
              className="btn btn-primary"
              onClick={addCustomCategory}
              id="add-cat-btn"
            >
              <PlusCircle size={15} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {categories
              .filter((c) => c.isCustom)
              .map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-2 bg-surface rounded-xl border border-surface-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: cat.color + "25",
                      color: cat.color,
                    }}
                  >
                    <IconRenderer name={cat.icon} size={14} />
                  </div>
                  <span className="text-sm flex-1 font-medium">
                    {cat.nameEn}
                  </span>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    style={{ color: "oklch(0.58 0.22 25)" }}
                    onClick={() => deleteCustomCategory(cat.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Debt tracking */}
        <div className="card bg-surface-2 border border-surface-3">
          <h2 className="font-semibold mb-3 text-sm">{t.debtTracking}</h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
            <div className="rounded-xl border border-surface-3 bg-surface p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t.moneyLent}
              </p>
              <p className="mt-1 text-sm font-bold text-black dark:text-white">
                {selectedCurrency}
                {totalMoneyLent.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-surface-3 bg-surface p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t.debtRepaid}
              </p>
              <p className="mt-1 text-sm font-bold text-black dark:text-white">
                {selectedCurrency}
                {totalDebtRepaid.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-surface-3 bg-surface p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t.debtOutstanding}
              </p>
              <p className="mt-1 text-sm font-bold text-amber-600 dark:text-amber-500">
                {selectedCurrency}
                {debtOutstanding.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {language === "fr"
              ? "Utilisez la categorie 'Mes bons' dans vos transactions."
              : "Use the 'Money Lent' and 'Debt Repaid' categories in transactions."}
          </p>
          <Link href="/bulk" className="btn btn-secondary btn-sm w-fit">
            {t.addTransaction}
          </Link>
        </div>

        {/* PWA Install */}
        <div className="card bg-surface-2 border border-surface-3">
          <h2 className="font-semibold mb-1 text-sm">{t.installApp}</h2>
          <p
            className="text-xs mb-3"
            style={{ color: "oklch(0.60 0.01 265)" }}
          >
            {t.installHint}
          </p>
          <button
            className="btn btn-primary flex items-center gap-1.5"
            onClick={triggerInstall}
            id="install-pwa-btn"
          >
            <Download size={15} />
            {isStandalone
              ? language === "fr"
                ? "Application installee"
                : "App Installed"
              : t.installApp}
          </button>
        </div>

        {/* Danger zone */}
        <div
          className="card"
          style={{ border: "1px solid oklch(0.58 0.22 25 / 0.3)" }}
        >
          <h2
            className="font-semibold mb-2 text-sm"
            style={{ color: "oklch(0.58 0.22 25)" }}
          >
            {language === "fr" ? "Zone dangereuse" : "Danger Zone"}
          </h2>
          {confirmClear ? (
            <div>
              <p className="text-sm mb-3">{t.confirmDeleteAll}</p>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmClear(false)}
                >
                  {t.cancel}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={clearAllData}
                  id="confirm-clear-btn"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-danger flex items-center gap-1.5"
              onClick={() => setConfirmClear(true)}
              id="clear-all-btn"
            >
              <Trash2 size={15} />
              {t.clearAllData}
            </button>
          )}
        </div>
        {/* Premium Upsell */}
        {!user?.isPro && (
          <Link
            href="/premium"
            className="card flex items-center gap-4 p-4 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 group cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Star size={20} className="text-amber-600 fill-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-black dark:text-white">
                {language === "fr" ? "Passez à Pro" : "Upgrade to Pro"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {language === "fr"
                  ? "Catégories illimitées, Cloud sync, exports"
                  : "Unlimited categories, Cloud sync, exports"}
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </Link>
        )}
      </div>
    </AppShell>
  );
}

// PWA type helper
interface BeforeInstallPromptEvent extends Event {
  prompt?: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
