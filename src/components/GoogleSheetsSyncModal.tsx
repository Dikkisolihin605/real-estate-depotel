import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  SPREADSHEET_ID,
  SPREADSHEET_URL,
  migrateAllDataToSheet,
} from '../services/googleSheets';
import { googleSignInWithSheets } from '../firebase';
import type { DatabaseSchema, AppUser } from '../types';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: DatabaseSchema;
  currentUser: AppUser | null;
  googleAccessToken: string | null;
  onTokenReceived: (token: string) => void;
  onToast: (msg: string) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  db,
  currentUser,
  googleAccessToken,
  onTokenReceived,
  onToast,
}) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [migrationSuccess, setMigrationSuccess] = useState<{
    totalRows: number;
    sheets: string[];
    timestamp: string;
  } | null>(null);

  // Mandatory Confirmation Dialog State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!isOpen) return null;

  const totalSites = (db.updateTypes || []).reduce(
    (sum, t) => sum + (t.sites?.length || 0),
    0
  );
  const totalUsers = db.users?.length || 0;
  const totalCategories = db.updateTypes?.length || 0;

  const handleSignInGoogle = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const result = await googleSignInWithSheets();
      if (result?.accessToken) {
        onTokenReceived(result.accessToken);
        onToast('✅ Berhasil terhubung dengan Google Sheets!');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Gagal masuk dengan Google. Pastikan izin Google Sheets disetujui.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const executeMigration = async () => {
    setShowConfirmDialog(false);
    if (!googleAccessToken) {
      try {
        const result = await googleSignInWithSheets();
        if (result?.accessToken) {
          onTokenReceived(result.accessToken);
          await startMigrationWithToken(result.accessToken);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Izin Google Sheets diperlukan untuk memindahkan data.');
      }
      return;
    }

    await startMigrationWithToken(googleAccessToken);
  };

  const startMigrationWithToken = async (token: string) => {
    setIsMigrating(true);
    setErrorMessage(null);
    setMigrationSuccess(null);
    try {
      const result = await migrateAllDataToSheet(token, db, (step) => {
        setProgressText(step);
      });

      setMigrationSuccess({
        totalRows: result.totalRows,
        sheets: result.sheetsUpdated,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
      onToast('🎉 Berhasil! Seluruh database telah dipindahkan ke Google Sheet.');
    } catch (err: any) {
      console.error('Migration error:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memindahkan data ke Google Sheet.');
    } finally {
      setIsMigrating(false);
      setProgressText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-emerald-300 shadow-xs">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Migrasi &amp; Sinkronisasi Google Sheet
                </h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                  Resmi
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pindahkan seluruh database depotel_db.json ke Google Sheet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Sheet Target Info Card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-950 uppercase tracking-wider">
                <Database className="h-4 w-4 text-emerald-700" />
                <span>Target Google Sheet Terhubung</span>
              </div>
              <a
                href={SPREADSHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-800 transition"
              >
                <span>Buka Sheet</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="font-mono text-xs font-bold text-emerald-900 bg-white/80 p-2.5 rounded-xl border border-emerald-200/80 break-all select-all">
              {SPREADSHEET_ID}
            </div>

            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Google Sheet ini akan diisi secara rapi dengan 5 tab: <strong>SITES_MONITORING</strong>, <strong>CATEGORIES</strong>, <strong>USERS</strong>, <strong>INVITATIONS</strong>, dan <strong>RAW_JSON_BACKUP</strong>.
            </p>
          </div>

          {/* Data Summary to be moved */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-600" />
              <span>Ringkasan Data yang Akan Dipindahkan:</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <span className="block text-xl font-black text-slate-900">{totalSites}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Site Monitoring</span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <span className="block text-xl font-black text-slate-900">{totalCategories}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Kategori Periode</span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <span className="block text-xl font-black text-slate-900">{totalUsers}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Anggota Tim</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="block font-bold">Terjadi Kesalahan:</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Success Summary */}
          {migrationSuccess && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 space-y-2 text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <h4 className="font-black text-sm">Pemindahan Data Selesai &amp; Berhasil!</h4>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Sebanyak <strong>{migrationSuccess.totalRows} baris data</strong> dan <strong>{migrationSuccess.sheets.length} tab</strong> telah berhasil ditulis ke Google Sheet pada pukul {migrationSuccess.timestamp}.
              </p>
              <div className="pt-1">
                <a
                  href={SPREADSHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-black text-white hover:bg-emerald-800 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Buka Google Sheet Hasil Pemindahan</span>
                </a>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isMigrating && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center space-y-2">
              <RefreshCw className="h-6 w-6 text-blue-700 animate-spin mx-auto" />
              <div className="text-xs font-black text-blue-900">
                Sedang memproses pemindahan database...
              </div>
              <p className="text-[11px] text-blue-700">{progressText}</p>
            </div>
          )}

          {/* Auth State Button */}
          {!googleAccessToken && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 space-y-3">
              <div className="flex items-start gap-2 text-xs text-amber-900">
                <ShieldCheck className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Diperlukan izin Google Workspace untuk menulis ke spreadsheet Anda. Klik tombol di bawah untuk menghubungkan akun Google.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignInGoogle}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xs active:scale-98 transition cursor-pointer disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.01h3.87c2.26-2.09 3.67-5.17 3.67-9.11z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.01c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11C3.33 21.36 7.39 24 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4-3.11z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.33 2.64 1.27 6.61l4 3.11c.95-2.85 3.6-4.97 6.73-4.97z" />
                </svg>
                <span>{isSigningIn ? 'Menghubungkan...' : 'Hubungkan Akun Google untuk Izin Sheet'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>Sheet: </span>
            <span className="font-mono font-bold text-slate-700">1nQEuYD9N_WbyBW0MZEUeMjEJwm4trjKEQyR01vmWe0c</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isMigrating}
              className="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isMigrating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isMigrating ? 'animate-spin' : ''}`} />
              <span>{isMigrating ? 'Memindahkan...' : 'Pindahkan ke Google Sheet Sekarang'}</span>
            </button>
          </div>
        </div>

        {/* Mandatory User Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-emerald-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm">Konfirmasi Pemindahan Data</h4>
                  <p className="text-xs text-slate-500">Google Sheet ID: 1nQEuYD9N...</p>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Tindakan ini akan menuliskan seluruh <strong>{totalSites} site monitoring</strong>, <strong>{totalCategories} kategori periode</strong>, dan <strong>{totalUsers} user</strong> dari <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">data/depotel_db.json</code> ke dalam Google Sheet target. Apakah Anda ingin melanjutkan?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeMigration}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-600 cursor-pointer"
                >
                  <span>Ya, Pindahkan Data</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
