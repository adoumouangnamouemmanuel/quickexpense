"use client";

import {
    ChevronDown,
    HandCoins,
    Pencil,
    Plus,
    Search,
    Trash2,
    TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { db, type Category, type Transaction } from "../_lib/db";
import { useLanguage } from "../_lib/i18n";
import { formatCurrency, formatDate } from "../_lib/utils";
import { AddTransactionModal } from "./AddTransactionModal";
import { IconRenderer } from "./IconRenderer";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  showFilters?: boolean;
  limit?: number;
  initialCategoryFilter?: string;
}

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
type TxTypeFilter = "all" | "expense" | "income";

const TYPE_FILTERS: TxTypeFilter[] = ["all", "expense", "income"];

export function TransactionList({
  transactions,
  categories,
  currency,
  showFilters = true,
  limit,
  initialCategoryFilter = "all",
}: TransactionListProps) {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TxTypeFilter>("all");
  const [catFilter, setCatFilter] = useState(initialCategoryFilter);
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [activeMenu, setActiveMenu] = useState<"sort" | "cat" | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 176,
  });
  const sortBtnRef = useRef<HTMLButtonElement | null>(null);
  const catBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setCatFilter(initialCategoryFilter);
  }, [initialCategoryFilter]);

  const DEBT_CATEGORY_IDS = useMemo(
    () => new Set(["money-lent", "debt-repaid"]),
    [],
  );

  const getDebtDisplay = useCallback(
    (tx: Transaction) => {
      const personTag = tx.tags?.find((tag) => tag.startsWith("person:"));
      const rawNote = tx.note?.trim() ?? "";
      const notePrefix = rawNote.includes(":")
        ? rawNote.split(":", 1)[0].trim()
        : "";
      const personFromTag = personTag?.replace(/^person:/, "").trim() ?? "";
      const person = notePrefix || personFromTag;
      const noteWithoutPrefix =
        person && rawNote.toLowerCase().startsWith(`${person.toLowerCase()}:`)
          ? rawNote.slice(person.length + 1).trim()
          : rawNote;

      return {
        person,
        note: noteWithoutPrefix,
      };
    },
    [],
  );

  const getCategoryName = useCallback(
    (id: string) => {
      const cat = categories.find((c) => c.id === id);
      if (!cat) return id;
      return language === "fr" ? cat.nameFr : cat.nameEn;
    },
    [categories, language],
  );

  const getCategoryColor = useCallback(
    (id: string) => {
      return categories.find((c) => c.id === id)?.color ?? "#6366f1";
    },
    [categories],
  );

  const getCategoryIcon = useCallback(
    (id: string) => {
      return categories.find((c) => c.id === id)?.icon ?? "📦";
    },
    [categories],
  );

  const filtered = useMemo(() => {
    let list = [...transactions];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (tx) =>
          tx.note?.toLowerCase().includes(q) ||
          tx.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
          getCategoryName(tx.categoryId).toLowerCase().includes(q) ||
          String(tx.amount).includes(q),
      );
    }

    if (typeFilter !== "all")
      list = list.filter((tx) => tx.type === typeFilter);
    if (catFilter === "debt") {
      list = list.filter((tx) => DEBT_CATEGORY_IDS.has(tx.categoryId));
    } else if (catFilter !== "all") {
      list = list.filter((tx) => tx.categoryId === catFilter);
    }

    list.sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        case "date-asc":
          return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
      }
    });

    if (limit) list = list.slice(0, limit);
    return list;
  }, [
    transactions,
    search,
    typeFilter,
    catFilter,
    sort,
    limit,
    getCategoryName,
    DEBT_CATEGORY_IDS,
  ]);

  const handleDelete = async (id: number) => {
    await db.transactions.delete(id);
    toast.success("Transaction deleted");
    setDeleteConfirmId(null);
  };

  const openMenu = useCallback((menu: "sort" | "cat") => {
    const trigger = menu === "sort" ? sortBtnRef.current : catBtnRef.current;
    if (!trigger) {
      setActiveMenu(menu);
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const width = Math.min(menu === "sort" ? 176 : 352, viewportWidth - 16);
    const left = Math.max(8, Math.min(rect.left, viewportWidth - width - 8));

    setMenuPos({ top: rect.bottom + 8, left, width });
    setActiveMenu(menu);
  }, []);

  useEffect(() => {
    if (!activeMenu) return;

    const onResize = () => openMenu(activeMenu);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeMenu, openMenu]);

  return (
    <div>
      {showFilters && (
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border relative bg-surface-2 border-surface-3 shadow-sm">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-sm text-black dark:text-white placeholder:text-gray-400"
              id="tx-search-input"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-1 rounded-xl border bg-surface border-surface-3">
                {TYPE_FILTERS.map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${typeFilter === type ? "bg-black text-white dark:bg-white dark:text-black shadow-sm" : "text-gray-500 hover:text-black dark:hover:text-white"}`}
                  >
                    {type === "all"
                      ? t.all
                      : type === "expense"
                        ? t.expense
                        : t.income}
                  </button>
                ))}
              </div>

              <div className="relative group">
                <button
                  ref={sortBtnRef}
                  onClick={() => {
                    if (activeMenu === "sort") {
                      setActiveMenu(null);
                    } else {
                      openMenu("sort");
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-[11px] font-bold ${activeMenu === "sort" ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md" : "bg-surface-2 border-surface-3 text-gray-500"}`}
                >
                  <TrendingUp
                    size={12}
                    className={
                      activeMenu === "sort"
                        ? "text-white dark:text-black"
                        : "text-gray-400"
                    }
                  />
                  {sort === "date-desc"
                    ? t.newest
                    : sort === "date-asc"
                      ? t.oldest
                      : sort === "amount-desc"
                        ? t.highest
                        : t.lowest}
                  <ChevronDown size={10} className="opacity-50" />
                </button>
                {activeMenu === "sort" && (
                  <div
                    className="fixed z-120 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 bg-surface-2 border border-surface-3"
                    style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
                  >
                    {[
                      { id: "date-desc", label: t.newest },
                      { id: "date-asc", label: t.oldest },
                      { id: "amount-desc", label: t.highest },
                      { id: "amount-asc", label: t.lowest },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSort(opt.id as SortKey);
                          setActiveMenu(null);
                        }}
                        className={`w-full text-left px-3 py-2 text-[11px] font-bold rounded-lg transition-colors ${sort === opt.id ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  ref={catBtnRef}
                  onClick={() => {
                    if (activeMenu === "cat") {
                      setActiveMenu(null);
                    } else {
                      openMenu("cat");
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-[11px] font-bold ${activeMenu === "cat" ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md" : "bg-surface-2 border-surface-3 text-gray-500"}`}
                >
                  <Search
                    size={12}
                    className={
                      activeMenu === "cat"
                        ? "text-white dark:text-black"
                        : "text-gray-400"
                    }
                  />
                  {catFilter === "all"
                    ? t.category
                    : catFilter === "debt"
                      ? t.debtOutstanding
                    : language === "fr"
                      ? categories.find((c) => c.id === catFilter)?.nameFr
                      : categories.find((c) => c.id === catFilter)?.nameEn}
                  <ChevronDown size={10} className="opacity-50" />
                </button>
                {activeMenu === "cat" && (
                  <div
                    className="fixed z-120 rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-200 bg-surface-2 border border-surface-3"
                    style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
                  >
                    <div className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-3 px-1">
                      {t.category}
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                      <button
                        onClick={() => {
                          setCatFilter("debt");
                          setActiveMenu(null);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all ${catFilter === "debt" ? "bg-black text-white dark:bg-white dark:text-black border-transparent" : "bg-surface border-surface-3 text-gray-600 dark:text-gray-300"}`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100/80 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                          <HandCoins size={14} />
                        </div>
                        <span className="text-xs font-semibold truncate">
                          {t.debtOutstanding}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setCatFilter("all");
                          setActiveMenu(null);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all ${catFilter === "all" ? "bg-black text-white dark:bg-white dark:text-black border-transparent" : "bg-surface border-surface-3 text-gray-600 dark:text-gray-300"}`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-200/50 dark:bg-gray-700/50 shrink-0">
                          <Plus size={14} />
                        </div>
                        <span className="text-xs font-semibold truncate">
                          {t.all}
                        </span>
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setCatFilter(cat.id);
                            setActiveMenu(null);
                          }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all ${catFilter === cat.id ? "bg-white dark:bg-black border-black dark:border-white shadow-md" : "bg-transparent border-surface-3 text-gray-600 dark:text-gray-300"}`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                            }}
                          >
                            <IconRenderer name={cat.icon} size={14} />
                          </div>
                          <span className="text-xs font-semibold truncate text-left w-full">
                            {language === "fr" ? cat.nameFr : cat.nameEn}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(typeFilter !== "all" || catFilter !== "all" || search !== "") && (
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-gray-400">
                  {filtered.length}{" "}
                  {language === "fr" ? "résultats" : "results"}
                </span>
                <button
                  onClick={() => {
                    setTypeFilter("all");
                    setCatFilter("all");
                    setSearch("");
                  }}
                  className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  {language === "fr" ? "Effacer" : "Clear"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div
          className="text-center py-12"
          style={{ color: "oklch(0.60 0.01 265)" }}
        >
          {t.noTransactions}
        </div>
      ) : (
        <div className="flex flex-col">
          {filtered.map((tx) => (
            <div key={tx.id} className="transaction-row group items-start gap-3">
              <div className="w-24 shrink-0 pt-0.5">
                <span
                  className="font-semibold text-sm block text-left"
                  style={{
                    color:
                      tx.type === "income"
                        ? "oklch(0.55 0.18 145)"
                        : "oklch(0.58 0.22 25)",
                  }}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount, tx.currency || currency)}
                </span>
              </div>

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `${getCategoryColor(tx.categoryId)}20`,
                  color: getCategoryColor(tx.categoryId),
                }}
              >
                <IconRenderer name={getCategoryIcon(tx.categoryId)} size={20} />
              </div>

              <div className="flex-1 min-w-0">
                {DEBT_CATEGORY_IDS.has(tx.categoryId) ? (
                  (() => {
                    const debtDisplay = getDebtDisplay(tx);
                    return (
                      <>
                        <p className="font-medium text-sm line-clamp-1">
                          {debtDisplay.person || getCategoryName(tx.categoryId)}
                        </p>
                        <p
                          className="text-xs mt-0.5 line-clamp-2 wrap-break-word"
                          style={{ color: "oklch(0.60 0.01 265)" }}
                        >
                          {formatDate(tx.date)} · {getCategoryName(tx.categoryId)}
                          {debtDisplay.note ? ` · ${debtDisplay.note}` : ""}
                        </p>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <p className="font-medium text-sm line-clamp-1 wrap-break-word">
                      {tx.note || getCategoryName(tx.categoryId)}
                    </p>
                    <p
                      className="text-xs mt-0.5 line-clamp-2 wrap-break-word"
                      style={{ color: "oklch(0.60 0.01 265)" }}
                    >
                      {formatDate(tx.date)} · {getCategoryName(tx.categoryId)}
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setEditTx(tx)}
                    aria-label="Edit"
                    id={`edit-tx-${tx.id}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    style={{ color: "oklch(0.58 0.22 25)" }}
                    onClick={() => setDeleteConfirmId(tx.id!)}
                    aria-label="Delete"
                    id={`delete-tx-${tx.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTx && (
        <AddTransactionModal
          open={!!editTx}
          onClose={() => setEditTx(null)}
          editTx={editTx}
          defaultCurrency={currency}
        />
      )}

      {deleteConfirmId !== null && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 340 }}>
            <h3 className="text-base font-semibold mb-2">{t.confirmDelete}</h3>
            <p
              className="text-sm mb-4"
              style={{ color: "oklch(0.60 0.01 265)" }}
            >
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmId(null)}
              >
                {t.cancel}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirmId!)}
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
