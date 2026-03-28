'use client';

// CSV and JSON export – Premium-gated with upsell
import { useState } from 'react';
import { Download, Copy, CheckCircle, Lock, Star } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { type Transaction } from '../_lib/db';
import { useLanguage } from '../_lib/i18n';
import { useAuth } from '../_lib/auth';
import { DEFAULT_CATEGORIES } from '../_lib/categories';
import Link from 'next/link';

interface ExportImportProps {
  transactions: Transaction[];
  currency: string;
}

export function ExportImport({ transactions, currency }: ExportImportProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const isPro = user?.isPro === true;

  // ─── Export CSV ─────────────────────────────────────────────

  const exportCSV = () => {
    if (!isPro) return;
    const data = transactions.map(tx => {
      const cat = DEFAULT_CATEGORIES.find(c => c.id === tx.categoryId);
      return {
        Date: tx.date,
        Type: tx.type,
        Category: language === 'fr' ? (cat?.nameFr ?? tx.categoryId) : (cat?.nameEn ?? tx.categoryId),
        Amount: tx.amount,
        Currency: tx.currency || currency,
        Note: tx.note,
        Tags: tx.tags?.join(', ') ?? '',
      };
    });
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `quickexpense_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('CSV exported!');
  };

  // ─── Export JSON ─────────────────────────────────────────────

  const exportJSON = () => {
    if (!isPro) return;
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions,
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadFile(blob, `quickexpense_backup_${new Date().toISOString().slice(0, 10)}.json`);
    toast.success('JSON exported!');
  };

  // ─── Copy Base64 for sharing ──────────────────────────────────

  const copyBase64 = async () => {
    if (!isPro) return;
    const payload = { version: 1, exportedAt: new Date().toISOString(), transactions };
    const b64 = btoa(JSON.stringify(payload));
    try {
      await navigator.clipboard.writeText(b64);
      setCopied(true);
      toast.success(t.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  if (!isPro) {
    return (
      <div className="card relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={16} className="text-gray-400" />
          <h3 className="font-semibold text-sm text-gray-500">{t.exportCSV} / {t.exportJSON}</h3>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star size={10} className="fill-current" /> PRO
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {language === 'fr' 
            ? "Exportez vos données en CSV ou JSON. Disponible avec QuickExpense Pro." 
            : "Export your transaction data as CSV or JSON backups. Available with QuickExpense Pro."}
        </p>
        <div className="flex flex-wrap gap-2 mb-4 opacity-40 pointer-events-none select-none">
          <button className="btn btn-secondary flex gap-1.5 items-center">
            <Download size={15} /> {t.exportCSV}
          </button>
          <button className="btn btn-secondary flex gap-1.5 items-center">
            <Download size={15} /> {t.exportJSON}
          </button>
          <button className="btn btn-secondary flex gap-1.5 items-center">
            <Copy size={15} /> {t.copyBase64}
          </button>
        </div>
        <Link 
          href="/premium" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Star size={14} className="fill-current" />
          {language === 'fr' ? "Passer à Pro" : "Upgrade to Pro"}
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold mb-3 text-sm">{language === 'fr' ? 'Exporter les données' : 'Export Data'}</h3>
      <div className="flex flex-wrap gap-2">
        <button
          className="btn btn-secondary flex gap-1.5 items-center"
          onClick={exportCSV}
          id="export-csv-btn"
        >
          <Download size={15} />
          {t.exportCSV}
        </button>
        <button
          className="btn btn-secondary flex gap-1.5 items-center"
          onClick={exportJSON}
          id="export-json-btn"
        >
          <Download size={15} />
          {t.exportJSON}
        </button>
        <button
          className="btn btn-secondary flex gap-1.5 items-center"
          onClick={copyBase64}
          id="copy-base64-btn"
        >
          {copied ? <CheckCircle size={15} className="text-green-500" /> : <Copy size={15} />}
          {t.copyBase64}
        </button>
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
