import React from 'react';
import { Globe, User, FileSpreadsheet } from 'lucide-react';
import type { AppUser } from '../types';

interface HeaderProps {
  currentUser: AppUser | null;
  users: AppUser[];
  onOpenOnlineModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenLoginModal: () => void;
  onOpenPublishModal: () => void;
  onOpenSheetsModal?: () => void;
  liveStatus?: 'connecting' | 'connected' | 'disconnected';
  lastSyncedAt?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onOpenOnlineModal,
  onOpenSettingsModal,
  onOpenLoginModal,
  onOpenPublishModal,
  onOpenSheetsModal,
  liveStatus = 'connected',
  lastSyncedAt,
}) => {
  const onlineCount = users.filter((u) => u.isOnline).length;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Brand: Circular DEPOTEL Logo Emblem + title (Enlarged Mobile Scale) */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 p-0.5 overflow-hidden">
            <img
              src="/namafile.jpg"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.triedScreenshot) {
                  target.dataset.triedScreenshot = 'true';
                  target.src = '/Screenshot_20261015_210044_WhatsApp.jpg';
                } else if (!target.dataset.triedSvg) {
                  target.dataset.triedSvg = 'true';
                  target.src = '/depotel-logo.svg';
                }
              }}
              alt="DEPOTEL GROUP"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                DEPOTEL
              </h1>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] sm:text-xs font-black text-blue-700 tracking-wider border border-blue-200 uppercase">
                kWh
              </span>
            </div>
            
            {/* Real-time connection status badge */}
            <div className="flex items-center gap-2 pt-0.5">
              {liveStatus === 'connected' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-emerald-700 border border-emerald-200 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>● LIVE — Real-Time Aktif</span>
                </span>
              )}
              {liveStatus === 'connecting' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-amber-700 border border-amber-200 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  <span>◌ Menghubungkan...</span>
                </span>
              )}
              {liveStatus === 'disconnected' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-rose-700 border border-rose-200 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>● OFFLINE / Terputus</span>
                </span>
              )}
              {lastSyncedAt && (
                <span className="hidden sm:inline text-[10px] text-slate-400 font-medium">
                  • {lastSyncedAt}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Publish icon & button: Admin ONLY */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenPublishModal}
              className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-black text-blue-800 shadow-xs hover:border-blue-400 hover:bg-blue-100 active:scale-95 transition cursor-pointer"
              title="Publikasikan & Bagikan Link Aplikasi (Khusus Admin)"
            >
              <Globe className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="hidden xs:inline sm:inline">Publish</span>
            </button>
          )}

          {/* Google Sheets Sync & Migration Button */}
          {onOpenSheetsModal && (
            <button
              type="button"
              onClick={onOpenSheetsModal}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-black text-emerald-800 shadow-xs hover:border-emerald-400 hover:bg-emerald-100 active:scale-95 transition cursor-pointer"
              title="Pindahkan / Sinkronkan Database ke Google Sheet"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span className="hidden xs:inline sm:inline">Sheets</span>
            </button>
          )}

          {/* Online count pill */}
          <button
            type="button"
            onClick={onOpenOnlineModal}
            className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
            title="Lihat status tim online"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>{onlineCount} Online</span>
          </button>

          {/* User profile / login button */}
          {currentUser ? (
            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-2.5 hover:bg-slate-100 transition cursor-pointer"
              title="Pengaturan Akun"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-7 w-7 rounded-lg object-cover border border-slate-300"
                />
              ) : (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white shadow-xs"
                  style={{ backgroundColor: currentUser.avatarColor || '#0e2a6d' }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs sm:text-sm font-bold text-slate-800 hidden sm:inline">
                {currentUser.name}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black text-white shadow-xs hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition cursor-pointer"
              title="Pilih nama Anda untuk masuk"
            >
              <User className="h-4 w-4 text-amber-300" />
              <span>Pilih Nama</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
