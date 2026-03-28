"use client";

// Simple client-side i18n for QuickExpense
// Supports English (en) and French (fr)

import { createContext, useContext, useState, type ReactNode } from "react";

// ─── Dictionary ───────────────────────────────────────────────────────────────

const dictionaries = {
  en: {
    // App
    appName: "QuickExpense",
    tagline: "Track smarter, spend better.",

    // Nav
    dashboard: "Dashboard",
    transactions: "Transactions",
    reports: "Reports",
    settings: "Settings",

    // Dashboard
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    balance: "Balance",
    monthlyBudget: "Monthly Budget",
    budgetUsed: "of budget used",
    expensesByCategory: "Expenses by Category",
    spendingTrend: "Spending Trend (30 days)",
    noData: "No data yet.",
    tryDemo: "Try with sample data",
    clearDemo: "Clear sample data",

    // Transactions
    addExpense: "Add Expense",
    addIncome: "Add Income",
    addTransaction: "Add Transaction",
    editTransaction: "Edit Transaction",
    amount: "Amount",
    type: "Type",
    expense: "Expense",
    income: "Income",
    category: "Category",
    date: "Date",
    note: "Note / Description",
    expenseTitle: "Expense Title",
    tags: "Tags",
    currency: "Currency",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    confirm: "Confirm",
    confirmDelete: "Delete this transaction?",
    confirmDeleteAll: "Delete ALL data? This cannot be undone.",

    // Auth
    login: "Log In",
    signup: "Sign Up",
    logout: "Log Out",
    signInCloud: "Sign In for Cloud Sync",

    // Filters
    search: "Search…",
    filterByDate: "Filter by Date",
    filterByCategory: "Filter by Category",
    filterByType: "Filter by Type",
    sortBy: "Sort by",
    sortDate: "Date",
    sortAmount: "Amount",
    all: "All",
    newest: "Newest",
    oldest: "Oldest",
    highest: "Highest",
    lowest: "Lowest",

    // Reports
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
    exportCSV: "Export CSV",
    exportJSON: "Export JSON",
    importJSON: "Import JSON",
    shareData: "Share My Data",
    importData: "Import Data",

    // Settings
    language: "Language",
    currencySymbol: "Currency Symbol",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    clearAllData: "Clear All Data",
    setBudget: "Set Monthly Budget",
    categoryBudgets: "Category Budgets",
    installApp: "Install App",
    installHint:
      "Add QuickExpense to your home screen for the best experience.",
    debtTracking: "Debt Tracking",
    debtOutstanding: "Outstanding Debt",
    moneyLent: "Money Lent",
    debtRepaid: "Debt Repaid",
    personName: "Person Name",
    enterPersonName: "Who is this debt for?",
    personNameRequired: "Please enter the person's name for debt entries.",

    // Budget alerts
    budgetNear: "You're approaching your budget limit!",
    budgetExceeded: "Budget exceeded!",
    of: "of",
    used: "used",
    remaining: "remaining",

    // Misc
    welcome: "Welcome",
    fastEntry: "Quick Add",
    entry: "Entry",
    bulkHint: "Any empty rows will be skipped automatically.",
    addAnotherEntry: "Add Another Entry",
    thisMonth: "This Month",
    thisWeek: "This Week",
    thisYear: "This Year",
    allTime: "All Time",
    noTransactions: "No transactions found.",
    loading: "Loading…",
    optional: "optional",
    selectCategory: "Select category",
    selectType: "Select type",
    enterAmount: "Enter amount",
    enterNote: "Add a note…",
    enterExpenseTitle: "Add an optional title…",
    enterTags: "Add tags (comma separated)…",

    // Family sharing
    familyMode: "Family Sharing",
    familyDescription:
      "Share your data with family or friends without creating an account.",
    downloadJSON: "Download JSON file",
    copyBase64: "Copy as text (base64)",
    pasteOrUpload: "Paste JSON or upload a file",
    importSuccess: "Data imported successfully!",
    importError: "Invalid data format.",
    copied: "Copied!",
  },
  fr: {
    // App
    appName: "QuickExpense",
    tagline: "Tracez mieux, dépensez mieux.",

    // Nav
    dashboard: "Tableau de bord",
    transactions: "Transactions",
    reports: "Rapports",
    settings: "Paramètres",

    // Dashboard
    totalIncome: "Revenus totaux",
    totalExpenses: "Dépenses totales",
    balance: "Solde",
    monthlyBudget: "Budget mensuel",
    budgetUsed: "du budget utilisé",
    expensesByCategory: "Dépenses par catégorie",
    spendingTrend: "Tendance des dépenses (30 jours)",
    noData: "Aucune donnée.",
    tryDemo: "Essayer avec des données",
    clearDemo: "Effacer les données démo",

    // Transactions
    addExpense: "Ajouter dépense",
    addIncome: "Ajouter revenu",
    addTransaction: "Ajouter transaction",
    editTransaction: "Modifier transaction",
    amount: "Montant",
    type: "Type",
    expense: "Dépense",
    income: "Revenu",
    category: "Catégorie",
    date: "Date",
    note: "Note / Description",
    expenseTitle: "Titre de dépense",
    tags: "Tags",
    currency: "Devise",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    confirm: "Confirmer",
    confirmDelete: "Supprimer cette transaction ?",
    confirmDeleteAll:
      "Supprimer TOUTES les données ? Cette action est irréversible.",

    // Auth
    login: "Se connecter",
    signup: "S'inscrire",
    logout: "Déconnexion",
    signInCloud: "Connexion pour la synchronisation Cloud",

    // Filters
    search: "Rechercher…",
    filterByDate: "Filtrer par date",
    filterByCategory: "Filtrer par catégorie",
    filterByType: "Filtrer par type",
    sortBy: "Trier par",
    sortDate: "Date",
    sortAmount: "Montant",
    all: "Tout",
    newest: "Plus récent",
    oldest: "Plus ancien",
    highest: "Plus élevé",
    lowest: "Plus faible",

    // Reports
    daily: "Quotidien",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    yearly: "Annuel",
    exportCSV: "Exporter CSV",
    exportJSON: "Exporter JSON",
    importJSON: "Importer JSON",
    shareData: "Partager mes données",
    importData: "Importer des données",

    // Settings
    language: "Langue",
    currencySymbol: "Symbole de devise",
    theme: "Thème",
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
    clearAllData: "Effacer toutes les données",
    setBudget: "Définir le budget mensuel",
    categoryBudgets: "Budgets par catégorie",
    installApp: "Installer l'application",
    installHint:
      "Ajoutez QuickExpense à votre écran d'accueil pour la meilleure expérience.",
    debtTracking: "Mes bons / Dettes",
    debtOutstanding: "Mes bons",
    moneyLent: "Mes bons",
    debtRepaid: "Dettes",
    personName: "Nom de la personne qui a emprunté",
    enterPersonName: "Nom de la personne qui a emprunté",
    personNameRequired: "Veuillez saisir le nom de la personne pour mes bons.",

    // Budget alerts
    budgetNear: "Vous approchez de la limite de votre budget !",
    budgetExceeded: "Budget dépassé !",
    of: "de",
    used: "utilisé",
    remaining: "restant",

    // Misc
    welcome: "Bienvenue",
    fastEntry: "Ajout rapide",
    entry: "Entrée",
    bulkHint: "Les lignes vides seront ignorées automatiquement.",
    addAnotherEntry: "Ajouter une entrée",
    thisMonth: "Ce mois-ci",
    thisWeek: "Cette semaine",
    thisYear: "Cette année",
    allTime: "Tout",
    noTransactions: "Aucune transaction trouvée.",
    loading: "Chargement…",
    optional: "optionnel",
    selectCategory: "Sélectionner une catégorie",
    selectType: "Sélectionner un type",
    enterAmount: "Entrer le montant",
    enterNote: "Ajouter une note…",
    enterExpenseTitle: "Ajouter un titre (optionnel)…",
    enterTags: "Ajouter des tags (séparés par virgule)…",

    // Family sharing
    familyMode: "Partage familial",
    familyDescription:
      "Partagez vos données avec votre famille sans créer un compte.",
    downloadJSON: "Télécharger le fichier JSON",
    copyBase64: "Copier en texte (base64)",
    pasteOrUpload: "Coller le JSON ou télécharger un fichier",
    importSuccess: "Données importées avec succès !",
    importError: "Format de données invalide.",
    copied: "Copié !",
  },
} as const;

export type Language = keyof typeof dictionaries;
export type Dict = typeof dictionaries.en | typeof dictionaries.fr;

// ─── Context ──────────────────────────────────────────────────────────────────

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof dictionaries.en; // Use EN as canonical shape — all keys are present in both
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: dictionaries.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    try {
      const stored = localStorage.getItem("qe_language") as Language | null;
      if (stored && stored in dictionaries) {
        return stored;
      }
    } catch {
      // localStorage unavailable (SSR guard)
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("qe_language", lang);
    } catch {}
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: dictionaries[language] as typeof dictionaries.en,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
