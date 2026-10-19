import React, { useState } from 'react';
import {
  UserPlus,
  Plus,
  Edit2,
  Trash2,
  ArrowUpRight,
  Check,
  X,
  Copy,
  Send,
  Share2,
} from 'lucide-react';
import type { UpdateType, AppUser } from '../types';

interface DashboardOverviewProps {
  updateTypes: UpdateType[];
  currentUser: AppUser | null;
  onSelectUpdateType: (id: string) => void;
  onOpenInviteModal: () => void;
  onOpenNewPeriodModal: () => void;
  onOpenPublishModal?: () => void;
  onEditPeriod: (updateType: UpdateType) => void;
  onDeletePeriod: (id: string, name: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  updateTypes,
  currentUser,
  onSelectUpdateType,
  onOpenInviteModal,
  onOpenNewPeriodModal,
  onEditPeriod,
  onDeletePeriod,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  const OFFICIAL_VERCEL_LINK = 'https://real-estate-depotel.vercel.app';

  const handleCopyVercelLink = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_VERCEL_LINK);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = OFFICIAL_VERCEL_LINK;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const getCategoryBadge = (iconType: string, name: string) => {
    const isSwacam = iconType === 'swacam' || name.toLowerCase().includes('swacam');
    if (isSwacam) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 uppercase border border-blue-200">
          SWACAM / CATAT METER
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 uppercase border border-indigo-200">
        TOKEN LISTRIK
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Banner - Enlarged Mobile Phone Scale */}
      <div className="flex items-start gap-3.5 sm:gap-4.5 rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-1 border border-slate-200 shadow-xs overflow-hidden">
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
            alt="DEPOTEL GROUP Logo"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] sm:text-xs font-black tracking-wider text-slate-500 uppercase">
              DEPOTEL · MONITORING
            </span>
            <span className="inline-block h-1 w-1 rounded-full bg-slate-300" />
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] sm:text-xs font-black text-blue-700 uppercase border border-blue-200">
              STRIKER kWh
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">
            Update Token &amp; Swacam
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Tandai site dengan centang bila sudah diisi dan silang bila belum. Persentase terhitung otomatis.
          </p>

          {/* Action Buttons: Only Admin Buttons (Undang user, New Period). Publish Link removed as requested */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onOpenInviteModal}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                title="Undang teknisi baru (Khusus Admin)"
              >
                <UserPlus className="h-4 w-4 text-slate-600" />
                <span>Undang user</span>
              </button>

              <button
                type="button"
                onClick={onOpenNewPeriodModal}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition cursor-pointer"
                title="Buat kategori / periode baru (Khusus Admin)"
              >
                <Plus className="h-4 w-4 text-white" />
                <span>Periode baru</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Official Link DEPOTEL for Users (https://real-estate-depotel.vercel.app) */}
      <div className="rounded-3xl border border-blue-200/90 bg-gradient-to-r from-blue-50 via-indigo-50/60 to-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider text-blue-950">
                Link Aplikasi DEPOTEL Resmi (Untuk Dibagikan ke User):
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs sm:text-sm font-black text-blue-800 bg-white/90 px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs select-all truncate">
                {OFFICIAL_VERCEL_LINK}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Bagikan link ini ke rekan teknisi / admin agar dapat membuka dashboard dari HP manapun tanpa login ulang saat refresh.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyVercelLink}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-black text-white shadow-xs hover:bg-slate-800 active:scale-95 transition cursor-pointer"
              title="Salin Link ke Clipboard"
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Salin Link</span>
                </>
              )}
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Halo rekan tim DEPOTEL! Silakan buka aplikasi monitoring Update Token & Swacam melalui link resmi berikut:\n\n${OFFICIAL_VERCEL_LINK}\n\nLink ini dapat diakses langsung dari HP manapun.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-black text-white shadow-xs hover:bg-emerald-500 active:scale-95 transition cursor-pointer"
              title="Bagikan Link ke WhatsApp"
            >
              <Send className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* User Status Banner (Enlarged and Clear on Mobile Phone) */}
      {currentUser && (
        <div className="flex items-center justify-between rounded-2xl border border-blue-200/80 bg-blue-50/70 p-3.5 sm:p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl text-sm font-black text-white shadow-xs"
              style={{ backgroundColor: currentUser.avatarColor || '#0e2a6d' }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-slate-900">{currentUser.name}</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-black uppercase text-blue-800 border border-blue-200">
                  {isAdmin ? 'Admin' : 'Teknisi'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                {isAdmin ? 'Mode Administrator Aktif' : 'Siap melakukan update checklist & kWh token'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards List - Enlarged Mobile Dimensions */}
      <div className="space-y-4">
        {updateTypes.map((ut) => {
          const totalSites = ut.customTotalTarget || ut.sites.length;
          const checkedCount = ut.sites.filter((s) => s.checked).length;
          const uncheckedCount = Math.max(0, totalSites - checkedCount);
          const percentage =
            totalSites > 0
              ? ((checkedCount / totalSites) * 100).toFixed(2).replace('.', ',')
              : '0,00';

          return (
            <div
              key={ut.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition hover:border-slate-300"
            >
              {/* Top Row: Category Badge & Action Icons */}
              <div className="flex items-center justify-between">
                <div>{getCategoryBadge(ut.iconType, ut.name)}</div>

                <div className="flex items-center gap-2">
                  {/* Admin Only: Edit and Delete Period */}
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPeriod(ut);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                        title="Edit Periode & Target Site (Hanya Admin)"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePeriod(ut.id, ut.name);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="Hapus Kategori Update (Hanya Admin)"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectUpdateType(ut.id)}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    title="Buka Update"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div
                className="mt-3.5 cursor-pointer"
                onClick={() => onSelectUpdateType(ut.id)}
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition tracking-tight">
                  {ut.name}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                  {ut.period}
                </p>
              </div>

              {/* Percentage Metric */}
              <div
                className="mt-4 cursor-pointer"
                onClick={() => onSelectUpdateType(ut.id)}
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    {percentage}%
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                    submitted
                  </span>
                </div>
              </div>

              {/* Progress & Counts */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                  <span>
                    <strong className="text-slate-900 font-extrabold">{checkedCount}</strong> dari{' '}
                    <strong className="text-slate-900 font-extrabold">{totalSites} site</strong>
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onEditPeriod(ut)}
                      className="text-slate-400 hover:text-blue-600 transition"
                      title="Edit jumlah target site (Hanya Admin)"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <span className="text-slate-400">tercentang</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Green badge: ✓ count */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs sm:text-sm font-bold text-emerald-800 border border-emerald-200">
                    <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                    <span>{checkedCount}</span>
                  </span>

                  {/* Red badge: ✕ count */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs sm:text-sm font-bold text-rose-800 border border-rose-200">
                    <X className="h-3.5 w-3.5 text-rose-600" strokeWidth={2.5} />
                    <span>{uncheckedCount}</span>
                  </span>
                </div>
              </div>

              {/* Big Prominent Action Button: Buka Update */}
              <button
                type="button"
                onClick={() => onSelectUpdateType(ut.id)}
                className="mt-4.5 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 px-4.5 py-3.5 text-xs sm:text-sm font-black text-white shadow-sm hover:from-blue-600 hover:to-indigo-600 active:scale-[0.99] transition cursor-pointer"
              >
                <span>Buka update checklist &amp; token</span>
                <ArrowUpRight className="h-4.5 w-4.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
