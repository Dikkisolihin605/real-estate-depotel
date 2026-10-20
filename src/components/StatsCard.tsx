import React, { useState } from 'react';
import {
  MessageSquare,
  Edit2,
  Plus,
  Search,
  ArrowLeft,
} from 'lucide-react';
import type { UpdateType, AppUser } from '../types';

interface StatsCardProps {
  updateType: UpdateType;
  currentUser: AppUser | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: 'all' | 'checked' | 'unchecked';
  onStatusFilterChange: (f: 'all' | 'checked' | 'unchecked') => void;
  onUpdateHeader: (name: string, period: string, customTotal?: number) => void;
  onOpenWhatsAppModal: () => void;
  onOpenAddSiteModal: () => void;
  onBackToDashboard: () => void;
  liveStatus?: 'connecting' | 'connected' | 'disconnected';
  lastSyncedAt?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  updateType,
  currentUser,
  liveStatus = 'connected',
  lastSyncedAt,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onUpdateHeader,
  onOpenWhatsAppModal,
  onOpenAddSiteModal,
  onBackToDashboard,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editName, setEditName] = useState(updateType.name);
  const [editPeriod, setEditPeriod] = useState(updateType.period);
  const [editTotal, setEditTotal] = useState(
    String(updateType.customTotalTarget || updateType.sites.length)
  );

  const totalSites = updateType.customTotalTarget || updateType.sites.length;
  const checkedCount = updateType.sites.filter((s) => s.checked).length;
  const uncheckedCount = Math.max(0, totalSites - checkedCount);
  const percentage =
    totalSites > 0 ? ((checkedCount / totalSites) * 100).toFixed(2).replace('.', ',') : '0,00';

  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTotal = parseInt(editTotal, 10);
    onUpdateHeader(
      editName.trim() || updateType.name,
      editPeriod.trim() || updateType.period,
      isNaN(parsedTotal) ? updateType.sites.length : parsedTotal
    );
    setIsEditingTitle(false);
  };

  const isSwacam =
    updateType.iconType === 'swacam' || updateType.name.toLowerCase().includes('swacam');

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition cursor-pointer shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Dashboard</span>
        </button>
      </div>

      {/* Real-Time Live Status Banner as requested by user */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-white border border-slate-200/90 px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          {liveStatus === 'connected' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 border border-emerald-300 shadow-2xs">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>● LIVE — Real-Time Aktif</span>
            </span>
          )}
          {liveStatus === 'connecting' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 border border-amber-300 shadow-2xs">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>◌ Menghubungkan...</span>
            </span>
          )}
          {liveStatus === 'disconnected' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700 border border-rose-300 shadow-2xs">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span>● OFFLINE / Koneksi Terputus</span>
            </span>
          )}
        </div>
        {lastSyncedAt && (
          <span className="text-xs text-slate-500 font-medium">
            Terakhir diperbarui: <strong className="text-slate-800 font-bold">{lastSyncedAt}</strong> WIB
          </span>
        )}
      </div>

      {/* Category Pill Tag */}
      <div>
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-black tracking-wider text-indigo-700 uppercase border border-indigo-200/80">
          {isSwacam ? 'SWACAM / CATAT METER' : 'TOKEN LISTRIK'}
        </span>
      </div>

      {/* Title & Period (Enlarged) */}
      {isEditingTitle ? (
        <form onSubmit={handleSaveHeader} className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Judul Update</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-2xl border border-blue-500 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Periode</label>
              <input
                type="text"
                value={editPeriod}
                onChange={(e) => setEditPeriod(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Target Jumlah Site</label>
              <input
                type="number"
                min="1"
                value={editTotal}
                onChange={(e) => setEditTotal(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsEditingTitle(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-black text-white shadow-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      ) : (
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            {updateType.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">{updateType.period}</p>
        </div>
      )}

      {/* 3 Action Buttons (Enlarged) */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Kirim WhatsApp */}
        <button
          type="button"
          onClick={onOpenWhatsAppModal}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4.5 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
        >
          <MessageSquare className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-600" />
          <span>Kirim WhatsApp</span>
        </button>

        {/* Admin Only: Edit Judul & Tambah Site */}
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() => {
                setEditName(updateType.name);
                setEditPeriod(updateType.period);
                setEditTotal(String(totalSites));
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4.5 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
              title="Edit judul & target (Khusus Admin)"
            >
              <Edit2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-600" />
              <span>Edit judul</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddSiteModal}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4.5 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-slate-800 active:scale-95 transition cursor-pointer"
              title="Tambah site baru (Khusus Admin)"
            >
              <Plus className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white" />
              <span>Tambah site</span>
            </button>
          </>
        )}
      </div>

      {/* 4 Stats Metric Cards in 2x2 Grid (Enlarged) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: JUMLAH SITE */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-black uppercase tracking-wider">
            <span className="text-slate-400">⁝≡</span>
            <span>JUMLAH SITE</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
            {totalSites}
          </div>
        </div>

        {/* Card 2: SUDAH TERCENTANG */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-black uppercase tracking-wider">
            <span>✓</span>
            <span>SUDAH TERCENTANG</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black text-emerald-600">
            {checkedCount}
          </div>
        </div>

        {/* Card 3: BELUM TERCENTANG */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-rose-700 text-xs font-black uppercase tracking-wider">
            <span>✕</span>
            <span>BELUM TERCENTANG</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black text-rose-600">
            {uncheckedCount}
          </div>
        </div>

        {/* Card 4: SUBMITTED */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-black uppercase tracking-wider">
            <span className="text-slate-400">↗</span>
            <span>SUBMITTED</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Filter Pills (Enlarged) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => onStatusFilterChange('all')}
          className={`rounded-full px-4.5 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Semua
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange('unchecked')}
          className={`rounded-full px-4.5 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            statusFilter === 'unchecked'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Belum Tercentang ({uncheckedCount})
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange('checked')}
          className={`rounded-full px-4.5 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            statusFilter === 'checked'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Sudah Tercentang ({checkedCount})
        </button>
      </div>

      {/* Search Bar (Enlarged) */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nomor pelanggan, kode site, atau nama site..."
          className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-5 text-sm font-medium text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-slate-400 hover:text-slate-700 p-1"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
