import React, { useState } from 'react';
import { X, Plus, Building2 } from 'lucide-react';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateTypeName: string;
  onAddSite: (customerId: string, siteCode: string, siteName: string, checked: boolean, tokenNumber?: string) => Promise<void>;
}

export const AddSiteModal: React.FC<AddSiteModalProps> = ({
  isOpen,
  onClose,
  updateTypeName,
  onAddSite,
}) => {
  const [customerId, setCustomerId] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [siteName, setSiteName] = useState('');
  const [tokenNumber, setTokenNumber] = useState('');
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId.trim() && !siteCode.trim()) {
      alert('Harap isi No ID Pelanggan atau Site ID');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddSite(customerId.trim(), siteCode.trim(), siteName.trim(), checked, tokenNumber.trim());
      setCustomerId('');
      setSiteCode('');
      setSiteName('');
      setTokenNumber('');
      setChecked(false);
      onClose();
    } catch (err) {
      alert('Gagal menambah site baru');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-850 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Tambah Site Baru</h2>
              <p className="text-[11px] text-slate-400 truncate max-w-[260px]">
                Ke: {updateTypeName}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              No. ID Pelanggan / Meter
            </label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Contoh: 547402150841"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 font-mono text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              Site ID
            </label>
            <input
              type="text"
              value={siteCode}
              onChange={(e) => setSiteCode(e.target.value.toUpperCase())}
              placeholder="Contoh: EPE134, JKT763, JSX400"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 font-mono text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Nama Site
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Contoh: GGLANGGARKEBAGUSANEMRSSIAGARAYAEASYMACRO"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              No. Token Listrik (Opsional)
            </label>
            <input
              type="text"
              value={tokenNumber}
              onChange={(e) => setTokenNumber(e.target.value)}
              placeholder="Contoh: 4321-8765-1234-9876-5432"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 font-mono text-xs text-emerald-300 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500"
              />
              <span className="text-xs font-semibold text-white">
                {checked ? '✅ Tandai langsung Sudah Tercentang' : '❌ Status Belum Tercentang'}
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-500 active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Simpan Site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
