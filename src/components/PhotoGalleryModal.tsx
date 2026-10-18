import React, { useState } from 'react';
import {
  X,
  Download,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  Camera,
  RefreshCw,
} from 'lucide-react';
import type { SiteItem, PhotoRecord, AppUser } from '../types';

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: SiteItem | null;
  currentUser: AppUser | null;
  onDeletePhoto: (photoId: string) => Promise<void>;
  onRetakePhoto?: (site: SiteItem) => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  isOpen,
  onClose,
  site,
  currentUser,
  onDeletePhoto,
  onRetakePhoto,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen || !site || !site.photos || site.photos.length === 0) return null;

  const currentPhoto = site.photos[selectedIndex] || site.photos[0];

  const handleDownload = (photo: PhotoRecord) => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    const cleanSiteCode = photo.siteCode.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `DEPOTEL_${cleanSiteCode}_${photo.customerId}_${photo.timestamp}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerDelete = (photoId: string) => {
    // Both user and admin have access to delete and retake photos
    setConfirmDeleteId(photoId);
  };

  const handleConfirmDelete = async (photoId: string) => {
    setIsDeleting(true);
    setActionNotice(null);
    try {
      await onDeletePhoto(photoId);
      setConfirmDeleteId(null);

      // If this was the last photo, close the modal immediately or offer retake
      if (site.photos.length <= 1) {
        if (onRetakePhoto) {
          onRetakePhoto(site);
        } else {
          onClose();
        }
        return;
      }

      // Otherwise advance index smoothly
      if (selectedIndex >= site.photos.length - 1) {
        setSelectedIndex(Math.max(0, site.photos.length - 2));
      }
      setActionNotice('Foto berhasil dihapus. Anda dapat mengambil ulang foto sekarang.');
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      setActionNotice('Gagal menghapus foto dari server.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Prominent Kembali Back Button */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/90 px-3.5 sm:px-4 py-3 text-white gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Kembali (Back) Button in Header */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 px-3 py-1.5 text-xs sm:text-sm font-bold text-white border border-slate-600 active:scale-95 transition cursor-pointer flex-shrink-0"
              title="Kembali ke daftar site"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-300">
                  {site.customerId}
                </span>
                <span className="text-xs font-bold text-blue-400">{site.siteCode}</span>
                <span className="text-xs text-slate-400">
                  ({selectedIndex + 1}/{site.photos.length})
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate max-w-[180px] sm:max-w-xs mt-0.5">
                {site.siteName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Retake / Ambil Ulang Gambar Button */}
            {onRetakePhoto && (
              <button
                type="button"
                onClick={() => {
                  onRetakePhoto(site);
                }}
                className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white active:scale-95 transition cursor-pointer"
                title="Ambil foto baru / ulang untuk site ini"
              >
                <Camera className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ambil Ulang</span>
              </button>
            )}

            {/* Download Button */}
            <button
              type="button"
              onClick={() => handleDownload(currentPhoto)}
              className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-blue-600 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 active:scale-95 transition cursor-pointer"
              title="Unduh foto"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Unduh</span>
            </button>

            {/* Delete Button with In-Modal Confirmation - Accessible to all users */}
            {confirmDeleteId === currentPhoto.id ? (
              <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-600 rounded-xl p-1 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(currentPhoto.id)}
                  disabled={isDeleting}
                  className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-500 active:scale-95 transition cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{isDeleting ? 'Hapus...' : 'Ya, Hapus'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={isDeleting}
                  className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleTriggerDelete(currentPhoto.id)}
                disabled={isDeleting}
                className="flex items-center gap-1 rounded-xl bg-rose-600 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 active:scale-95 transition shadow-sm cursor-pointer"
                title="Hapus foto dan ambil ulang"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              title="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="bg-emerald-600 px-4 py-2 text-xs font-bold text-white flex items-center justify-between animate-in slide-in-from-top-2">
            <span>{actionNotice}</span>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-xs font-bold text-white hover:underline cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Photo Display */}
        <div className="relative flex-1 bg-black flex items-center justify-center p-2 min-h-[280px] sm:min-h-[340px] overflow-hidden">
          <img
            src={currentPhoto.dataUrl}
            alt={`Foto ${currentPhoto.siteCode}`}
            className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-2xl"
          />

          {site.photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteId(null);
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : site.photos.length - 1));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 active:scale-95 transition cursor-pointer"
                title="Foto sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteId(null);
                  setSelectedIndex((prev) => (prev < site.photos.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 active:scale-95 transition cursor-pointer"
                title="Foto berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Footer info & Controls */}
        <div className="border-t border-slate-800 bg-slate-850 p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              <span>{currentPhoto.capturedAt}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {currentPhoto.uploadedBy ? `Diambil oleh: ${currentPhoto.uploadedBy}` : 'Dokumentasi Site'}
            </span>
          </div>

          {/* Thumbnails if multiple photos */}
          {site.photos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {site.photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => {
                    setConfirmDeleteId(null);
                    setSelectedIndex(idx);
                  }}
                  className={`h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer ${
                    selectedIndex === idx ? 'border-blue-500 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Bottom Action Bar: Kembali & Ambil Ulang Gambar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/70">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white border border-slate-700 active:scale-95 transition cursor-pointer shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Daftar Site</span>
            </button>

            {onRetakePhoto && (
              <button
                type="button"
                onClick={() => {
                  onRetakePhoto(site);
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md active:scale-95 transition cursor-pointer"
              >
                <Camera className="h-4 w-4" />
                <span>Ambil Ulang / Foto Baru</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
