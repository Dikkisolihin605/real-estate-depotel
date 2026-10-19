import React from 'react';
import {
  Edit2,
  Trash2,
  Camera,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
import type { SiteItem, AppUser } from '../types';

interface SiteCardProps {
  site: SiteItem;
  typeId: string;
  updateTypeName: string;
  currentUser: AppUser | null;
  onToggle: (site: SiteItem) => void;
  onEdit: (site: SiteItem) => void;
  onDelete: (site: SiteItem) => void;
  onOpenTokenNote: (site: SiteItem) => void;
  onClearToken: (site: SiteItem) => void;
  onOpenCamera: (site: SiteItem) => void;
  onOpenGallery: (site: SiteItem) => void;
}

export const SiteCardComponent: React.FC<SiteCardProps> = ({
  site,
  typeId: _typeId,
  updateTypeName,
  currentUser,
  onToggle,
  onEdit,
  onDelete,
  onOpenTokenNote,
  onClearToken,
  onOpenCamera,
  onOpenGallery,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const hasPhotos = site.photos && site.photos.length > 0;
  const photoCount = site.photos?.length || 0;

  // Swacam detection
  const isSwacam =
    updateTypeName.toLowerCase().includes('swacam') ||
    updateTypeName.toLowerCase().includes('catat meter');

  // Camera display rule
  const isTokenStandard =
    updateTypeName.toLowerCase().includes('pengisian token listrik -') ||
    updateTypeName.toLowerCase().includes('token listrik swfm');
  const showCamera = !isTokenStandard;

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-4.5 sm:p-5.5 shadow-xs transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* Left: Circular status toggle button (✕ or ✓) - User & Admin can toggle */}
        <button
          type="button"
          onClick={() => onToggle(site)}
          className={`flex-shrink-0 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition active:scale-90 cursor-pointer ${
            site.checked
              ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-600 hover:bg-emerald-100'
              : 'bg-rose-50 border-2 border-rose-200 text-rose-500 hover:bg-rose-100'
          }`}
          title={site.checked ? 'Status: Sudah Tercentang' : 'Status: Belum Tercentang'}
        >
          {site.checked ? (
            <span className="text-lg sm:text-xl font-black">✓</span>
          ) : (
            <span className="text-lg sm:text-xl font-black">✕</span>
          )}
        </button>

        {/* Center Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Top Line: Customer ID + Site ID */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {site.customerId || '-'}
            </span>

            {site.siteCode && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs sm:text-sm font-black text-slate-700">
                {site.siteCode}
              </span>
            )}
          </div>

          {/* Second Line: Nama Site */}
          <p className="text-xs sm:text-sm font-medium text-slate-700 break-words leading-relaxed">
            {site.siteName || '-'}
          </p>

          {/* Live Update Metadata: Shows who last checked/updated this site */}
          {site.updatedBy && (
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${site.checked ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span>Diperbarui oleh: <strong className="text-slate-800 font-bold">{site.updatedBy}</strong></span>
              </span>
              {site.updatedAt && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400">{site.updatedAt}</span>
                </>
              )}
            </div>
          )}

          {/* Third Line: Tambah No. Token (User can input token) */}
          {!isSwacam && !site.tokenNumber && (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => onOpenTokenNote(site)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah No. Token</span>
              </button>
            </div>
          )}

          {/* Dedicated Bottom Row for No Token */}
          {!isSwacam && site.tokenNumber && (
            <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 sm:p-3.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                <span>No. Token Listrik:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTokenNote(site);
                    }}
                    className="text-emerald-700 hover:underline font-bold cursor-pointer active:scale-95 transition"
                  >
                    Ubah
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearToken(site);
                    }}
                    className="text-rose-600 hover:underline font-bold cursor-pointer active:scale-95 transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              <div className="font-mono text-sm sm:text-base font-black text-emerald-950 whitespace-pre-line break-all leading-relaxed">
                {site.tokenNumber}
              </div>
            </div>
          )}

          {/* Camera Button (User can capture & view photos) */}
          {showCamera && (
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenCamera(site)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
                title="Ambil foto dokumentasi site"
              >
                <Camera className="h-4 w-4 text-slate-600" />
                <span>Foto Site</span>
              </button>

              {hasPhotos && (
                <button
                  type="button"
                  onClick={() => onOpenGallery(site)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs sm:text-sm font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                  title="Lihat foto tersimpan"
                >
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                  <span>{photoCount} Foto</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: ✏️ Edit icon & 🗑️ Red trash icon - ONLY FOR ADMIN */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(site);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
              title="Edit data site (Hanya Admin)"
            >
              <Edit2 className="h-4.5 w-4.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(site);
              }}
              className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition active:scale-95 cursor-pointer"
              title="Hapus site ini (Hanya Admin)"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const SiteCard = React.memo(SiteCardComponent);
