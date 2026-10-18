import React, { useState, useEffect } from 'react';
import { X, Check, Edit3, ShieldAlert } from 'lucide-react';
import type { SiteItem } from '../types';

interface EditSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: SiteItem | null;
  onSave: (customerId: string, siteCode: string, siteName: string, checked: boolean) => void;
}

export const EditSiteModal: React.FC<EditSiteModalProps> = ({
  isOpen,
  onClose,
  site,
  onSave,
}) => {
  const [customerId, setCustomerId] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [siteName, setSiteName] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (site) {
      setCustomerId(site.customerId || '');
      setSiteCode(site.siteCode || '');
      setSiteName(site.siteName || '');
      setChecked(site.checked || false);
    }
  }, [site, isOpen]);

  if (!isOpen || !site) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(customerId.trim(), siteCode.trim(), siteName.trim(), checked);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Edit Data Site</h2>
              <p className="text-[11px] text-slate-400">
                Ubah ID Pelanggan, Site ID, atau Nama Site
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 1. No. ID Pelanggan / Meter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
              No. ID Pelanggan / Meter
            </label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Contoh: 547402150841"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 font-mono text-sm font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Nomor 11-12 digit ID meter listrik PLN dari PLN/tiket.
            </p>
          </div>

          {/* 2. Site ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-1.5">
              Site ID
            </label>
            <input
              type="text"
              value={siteCode}
              onChange={(e) => setSiteCode(e.target.value.toUpperCase())}
              placeholder="Contoh: EPE134, JKT763, JSX400"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 font-mono text-sm font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Kode pengenal site telekomunikasi DEPOTEL.
            </p>
          </div>

          {/* 3. Nama Site */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Nama Site
            </label>
            <textarea
              rows={2}
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Contoh: GGLANGGARKEBAGUSANEMRSSIAGARAYAEASYMACRO"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* 4. Status Checkbox */}
          <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-400"
              />
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {checked ? '✅ Status: Sudah Tercentang (Selesai)' : '❌ Status: Belum Tercentang'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {checked ? 'Site ini telah selesai diisi/dicatat meter.' : 'Site ini masih belum selesai.'}
                </span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/30 hover:bg-blue-500 active:scale-95 transition"
            >
              <Check className="h-4 w-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
