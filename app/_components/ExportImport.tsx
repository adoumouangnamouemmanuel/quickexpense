'use client';

// CSV and JSON export/import + Family Sharing
import { useState, useRef } from 'react';
import { Download, Upload, Copy, Share2, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { db, type Transaction } from '../_lib/db';
import { useLanguage } from '../_lib/i18n';
import { DEFAULT_CATEGORIES } from '../_lib/categories';
import { toBase64, fromBase64 } from '../_lib/utils';

interface ExportImportProps {
  transactions: Transaction[];
  currency: string;
}

export function ExportImport({ transactions, currency }: ExportImportProps) {
  const { t, language } = useLanguage();
  const [importing, setImporting] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Export CSV ─────────────────────────────────────────────

  const exportCSV = () => {
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
    const payload = { version: 1, exportedAt: new Date().toISOString(), transactions };
    const b64 = toBase64(payload);
    try {
      await navigator.clipboard.writeText(b64);
      setCopied(true);
      toast.success(t.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  // ─── Import JSON ──────────────────────────────────────────────

  const handleImport = async (jsonStr: string) => {
    setImporting(true);
    try {
      let parsed: unknown;

      // Try direct JSON parse first, then base64
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        parsed = fromBase64(jsonStr);
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid format');
      }

      const data = parsed as { transactions?: Transaction[] };
      const txs = data.transactions;

      if (!Array.isArray(txs) || txs.length === 0) {
        throw new Error('No transactions found');
      }

      // Strip IDs and import
      const cleaned = txs.map(({ id: _, ...rest }) => ({
        ...rest,
        currency: rest.currency || currency,
        createdAt: rest.createdAt || Date.now(),
      }));

      await db.transactions.bulkAdd(cleaned as Transaction[]);
      toast.success(`${t.importSuccess} (${cleaned.length} transactions)`);
      setPasteText('');
    } catch (err) {
      toast.error(t.importError);
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleImport(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Export section */}
      <div className="card">
        <h3 className="font-semibold mb-3 text-sm">Export</h3>
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
            {copied ? <CheckCircle size={15} style={{ color: 'oklch(0.55 0.18 145)' }} /> : <Copy size={15} />}
            {t.copyBase64}
          </button>
        </div>
      </div>

      {/* Import section */}
      <div className="card">
        <h3 className="font-semibold mb-3 text-sm">Import / {t.familyMode}</h3>
        <p className="text-xs mb-3" style={{ color: 'oklch(0.60 0.01 265)' }}>
          {t.familyDescription}
        </p>
        <div className="flex flex-col gap-2">
          <textarea
            className="input"
            style={{ minHeight: '80px', resize: 'vertical' }}
            placeholder={t.pasteOrUpload}
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            id="import-paste-area"
          />
          <div className="flex gap-2">
            <button
              className="btn btn-primary flex gap-1.5 items-center"
              onClick={() => pasteText && handleImport(pasteText)}
              disabled={!pasteText || importing}
              id="import-paste-btn"
            >
              <Upload size={15} />
              {importing ? t.loading : t.importData}
            </button>
            <button
              className="btn btn-secondary flex gap-1.5 items-center"
              onClick={() => fileRef.current?.click()}
              id="import-file-btn"
            >
              <Share2 size={15} />
              {t.downloadJSON}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
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
