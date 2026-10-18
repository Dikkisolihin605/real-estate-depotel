import React, { useState } from 'react';
import { X, Plus, Layers, Zap, Camera, FileText } from 'lucide-react';

interface NewUpdateTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUpdateType: (name: string, period: string, customTotalTarget: number, iconType: 'token' | 'swacam' | 'manual' | 'custom') => Promise<void>;
}

export const NewUpdateTypeModal: React.FC<NewUpdateTypeModalProps> = ({
  isOpen,
  onClose,
  onAddUpdateType,
}) => {
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('Bulan Oktober 2026');
  const [targetSites, setTargetSites] = useState('10');
  const [iconType, setIconType] = useState<'token' | 'swacam' | 'manual' | 'custom'>('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddUpdateType(
        name.trim(),
        period.trim(),
        parseInt(targetSites, 10) || 0,
        iconType
      );
      onClose();
    } catch (err) {
      alert('Gagal menambah jenis update baru');
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
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Tambah Jenis Update Baru</h2>
              <p className="text-[11px] text-slate-400">
                Buat kategori update baru selain Token dan Swacam
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
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Nama Jenis Update
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Maintenance Genset DEPOTEL, Cek Baterai..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Periode / Bulan Pelaksanaan
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Contoh: Bulan Oktober 2026, Minggu ke-1..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Target Jumlah Site
            </label>
            <input
              type="number"
              min="0"
              value={targetSites}
              onChange={(e) => setTargetSites(e.target.value)}
              placeholder="Jumlah target site..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Tipe / Ikon Kategori
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'token', label: 'Token', icon: Zap },
                { type: 'swacam', label: 'Swacam', icon: Camera },
                { type: 'manual', label: 'Manual', icon: FileText },
                { type: 'custom', label: 'Lainnya', icon: Layers },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = iconType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setIconType(item.type as any)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
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
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-blue-500 active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Buat Kategori Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
