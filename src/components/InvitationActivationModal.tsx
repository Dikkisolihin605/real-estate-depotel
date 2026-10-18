import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  UserCheck,
  ArrowRight,
  KeyRound,
  RefreshCw,
  Mail,
  User,
  ShieldAlert,
} from 'lucide-react';
import type { AppUser, TeamInvitation } from '../types';

interface InvitationActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string | null;
  initialCode?: string | null;
  onActivated: (user: AppUser) => void;
}

export const InvitationActivationModal: React.FC<InvitationActivationModalProps> = ({
  isOpen,
  onClose,
  initialToken,
  initialCode,
  onActivated,
}) => {
  const [inputCode, setInputCode] = useState(initialCode || '');
  const [isValidating, setIsValidating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [invitationData, setInvitationData] = useState<TeamInvitation | null>(null);
  const [validationError, setValidationError] = useState<{
    reason: string;
    message: string;
  } | null>(null);

  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialToken) {
        validateWithParam({ token: initialToken });
      } else if (initialCode) {
        validateWithParam({ code: initialCode });
      } else {
        setInvitationData(null);
        setValidationError(null);
      }
    }
  }, [isOpen, initialToken, initialCode]);

  if (!isOpen) return null;

  const validateWithParam = async (params: { token?: string; code?: string }) => {
    setIsValidating(true);
    setValidationError(null);
    setInvitationData(null);

    const query = new URLSearchParams();
    if (params.token) query.set('token', params.token);
    if (params.code) query.set('code', params.code);

    try {
      const res = await fetch(`/api/invitations/validate?${query.toString()}`);
      const json = await res.json();

      if (res.ok && json.valid) {
        setInvitationData(json.invitation);
        setCustomGoogleEmail(json.invitation.email || '');
      } else {
        setValidationError({
          reason: json.reason || 'invalid',
          message: json.message || 'Tautan atau kode aktivasi tidak valid.',
        });
      }
    } catch (err) {
      setValidationError({
        reason: 'network_error',
        message: 'Gagal menghubungi server. Pastikan koneksi internet Anda aktif.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    validateWithParam({ code: inputCode.trim() });
  };

  const handleAcceptActivation = async (selectedEmail?: string) => {
    if (!invitationData) return;
    setIsActivating(true);

    const finalEmail = (selectedEmail || customGoogleEmail || invitationData.email || '').trim().toLowerCase();

    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: initialToken || undefined,
          code: invitationData.code,
          googleEmail: finalEmail,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.user) {
        onActivated(json.user);
        onClose();
      } else {
        setValidationError({
          reason: 'accept_failed',
          message: json.error || 'Aktivasi gagal. Silakan coba lagi.',
        });
      }
    } catch (err) {
      setValidationError({
        reason: 'network_error',
        message: 'Koneksi gagal saat aktivasi akun.',
      });
    } finally {
      setIsActivating(false);
    }
  };

  const formatExpiryTime = (ms: number) => {
    const diff = ms - Date.now();
    if (diff <= 0) return 'Kedaluwarsa';
    const hours = Math.floor(diff / (3600 * 1000));
    const mins = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    return `Sisa ${hours} jam ${mins} menit`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-850 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white p-1 shadow-md border-2 border-red-500/80 flex items-center justify-center flex-shrink-0">
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
            <div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[9px] font-black uppercase text-emerald-300 border border-emerald-400/30">
                  Login Link Undangan
                </span>
              </div>
              <h2 className="text-sm font-black text-white mt-0.5">
                Aktivasi &amp; Masuk ke Dashboard
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 1. Loading State */}
          {isValidating && (
            <div className="py-8 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-300">
                Memverifikasi tautan undangan Google Anda...
              </p>
              <p className="text-[11px] text-slate-500">
                Menghubungkan akun ke server resmi DEPOTEL
              </p>
            </div>
          )}

          {/* 2. Valid Invitation Presentation with Google 1-Click Login */}
          {!isValidating && invitationData && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/25 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Undangan Resmi Terverifikasi
                    </span>
                  </div>
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30 capitalize">
                    {invitationData.role === 'admin' ? 'Admin' : 'Teknisi'}
                  </span>
                </div>

                {/* User Card */}
                <div className="rounded-xl bg-slate-850 border border-slate-700/80 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-750 pb-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      Nama Anggota:
                    </span>
                    <span className="font-bold text-white text-sm text-right">{invitationData.name}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-750 pb-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      Email Google / Gmail:
                    </span>
                    <span className="font-mono text-emerald-300 text-right font-bold truncate max-w-[190px]">
                      {customGoogleEmail || invitationData.email}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      Masa Berlaku Link:
                    </span>
                    <span className="font-semibold text-amber-400">
                      {formatExpiryTime(invitationData.expiresAt)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed text-center">
                  Halo <strong>{invitationData.name}</strong>, undangan dikirim oleh <strong>{invitationData.invitedBy}</strong>. Klik tombol di bawah untuk langsung masuk menggunakan akun Google Anda.
                </p>
              </div>

              {/* PRIMARY 1-CLICK GOOGLE / GMAIL LOGIN BUTTON */}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isActivating}
                  onClick={() => handleAcceptActivation()}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-xs sm:text-sm font-black text-slate-850 shadow-xl hover:bg-slate-100 active:scale-[0.98] transition cursor-pointer border border-slate-200"
                >
                  <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>
                    {isActivating ? 'Sedang Masuk ke Dashboard...' : `Masuk dengan Google (${customGoogleEmail || invitationData.email})`}
                  </span>
                </button>

                {/* Option to change Google email if different on phone */}
                <div className="text-center pt-1">
                  {!showCustomGoogle ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogle(true)}
                      className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                    >
                      Menggunakan akun Google/Gmail lain di HP Anda? Klik di sini
                    </button>
                  ) : (
                    <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-3 text-left space-y-2 mt-2">
                      <label className="block text-[11px] font-bold text-slate-300">
                        Ketikkan Alamat Gmail Anda di HP:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          placeholder="nama.anda@gmail.com"
                          className="flex-1 rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleAcceptActivation(customGoogleEmail)}
                          disabled={!customGoogleEmail.trim() || isActivating}
                          className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 active:scale-95 transition cursor-pointer disabled:opacity-50"
                        >
                          Masuk
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Validation Error State */}
          {!isValidating && validationError && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                  <span>
                    {validationError.reason === 'expired'
                      ? 'Undangan Telah Kedaluwarsa'
                      : validationError.reason === 'already_used'
                      ? 'Undangan Sudah Digunakan'
                      : validationError.reason === 'revoked'
                      ? 'Undangan Dibatalkan Admin'
                      : 'Tautan / Kode Tidak Valid'}
                  </span>
                </div>
                <p className="text-xs text-rose-200 leading-relaxed">
                  {validationError.message}
                </p>
              </div>
            </div>
          )}

          {/* 4. Alternative: Manual 6-Digit Code Input Form */}
          {!isValidating && (!invitationData || validationError) && (
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <KeyRound className="h-4 w-4 text-blue-400" />
                <span>Punya Kode Undangan (OTP 6-Digit)?</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Jika link terpotong atau tidak bisa diklik di WhatsApp, Anda dapat memasukkan kode undangan 6-digit secara manual:
              </p>

              <form onSubmit={handleManualCodeSubmit} className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Contoh: DEP-849201 atau 849201"
                    className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 uppercase focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputCode.trim()}
                    className="rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 disabled:opacity-50 cursor-pointer transition active:scale-95 flex-shrink-0"
                  >
                    Verifikasi
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-850 px-5 py-3 text-center">
          <p className="text-[10px] text-slate-500">
            DEPOTEL GROUP · Sistem Keamanan Aktivasi Anggota Tim Terenkripsi
          </p>
        </div>
      </div>
    </div>
  );
};
