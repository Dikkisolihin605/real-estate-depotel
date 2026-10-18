import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Zap, CornerDownLeft, Sparkles, Trash2 } from 'lucide-react';
import type { SiteItem } from '../types';

interface TokenNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: SiteItem | null;
  onSave: (tokenNumber: string, notes: string) => void;
}

export const TokenNoteModal: React.FC<TokenNoteModalProps> = ({
  isOpen,
  onClose,
  site,
  onSave,
}) => {
  const [tokenNumber, setTokenNumber] = useState('');
  const tokenTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (site) {
      setTokenNumber(site.tokenNumber || '');
    }
  }, [site, isOpen]);

  if (!isOpen || !site) return null;

  // Dedicated return button to move lines down in the token input
  const handleReturnPress = () => {
    const textarea = tokenTextareaRef.current;
    if (!textarea) {
      setTokenNumber((prev) => prev + '\n');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const newVal = currentVal.substring(0, start) + '\n' + currentVal.substring(end);
    setTokenNumber(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1);
    }, 10);
  };

  const formatAutoGroup = () => {
    const lines = tokenNumber.split('\n');
    const formattedLines = lines.map((line) => {
      const raw = line.replace(/\D/g, '');
      if (!raw) return line;
      const parts = raw.match(/.{1,4}/g);
      return parts ? parts.join('-') : line;
    });
    setTokenNumber(formattedLines.join('\n'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(tokenNumber.trim(), '');
    onClose();
  };

  const handleClearToken = () => {
    onSave('', '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Input No. Token Listrik</h2>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                {site.siteCode} - {site.siteName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body: ONLY No Token Listrik and Return button */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Site reference summary */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>No. ID Pelanggan / Meter:</span>
              <span className="font-mono font-bold text-slate-900">{site.customerId}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-slate-600">
              <span>Site ID:</span>
              <span className="font-bold text-blue-700">{site.siteCode}</span>
            </div>
          </div>

          {/* No Token Listrik with Return Button */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Nomor Token Listrik (20 Digit)
              </label>

              <div className="flex items-center gap-2">
                {/* Dedicated Return Button */}
                <button
                  type="button"
                  onClick={handleReturnPress}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800 hover:bg-slate-200 active:scale-95 transition"
                  title="Pindah barisan ke bawah"
                >
                  <CornerDownLeft className="h-3 w-3" />
                  <span>Tombol Return ↵ (Pindah Baris)</span>
                </button>

                {/* Auto Format */}
                <button
                  type="button"
                  onClick={formatAutoGroup}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                  title="Rapikan format 4-4-4-4-4"
                >
                  <Sparkles className="h-3 w-3" /> Rapikan Format
                </button>
              </div>
            </div>

            {/* Token Input Textarea */}
            <textarea
              ref={tokenTextareaRef}
              rows={3}
              value={tokenNumber}
              onChange={(e) => setTokenNumber(e.target.value)}
              placeholder="Contoh: 4321-8765-1234-9876-5432"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-base font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none leading-relaxed"
              autoFocus
            />

            <p className="text-[10px] text-slate-500">
              Gunakan tombol return di atas untuk memindahkan barisan ke bawah. Nomor token akan tampil langsung di list tanpa tanda catatan.
            </p>
          </div>

          {/* Actions: with direct Hapus Token button */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            {site.tokenNumber ? (
              <button
                type="button"
                onClick={handleClearToken}
                className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition active:scale-95"
                title="Hapus nomor token site ini langsung"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Token</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition"
              >
                <Check className="h-4 w-4" />
                Simpan Token
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
