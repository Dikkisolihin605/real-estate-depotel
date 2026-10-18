import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Users,
  ShieldCheck,
  Mail,
  KeyRound,
  AlertCircle,
  LogIn,
  Lock,
} from 'lucide-react';
import type { AppUser } from '../types';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  currentUser: AppUser | null;
  onSelectUser: (user: AppUser) => void;
  onRegisterUser: (name: string) => Promise<void>;
  onGoogleLogin: (email: string, name: string, avatarUrl?: string) => Promise<void>;
  onOpenActivationModal?: () => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
  onGoogleLogin,
  onOpenActivationModal,
}) => {
  const [typedName, setTypedName] = useState('');
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setTypedName('');
      setErrorMessage(null);
      setShowGoogleLogin(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Real-time filtered users based on typed name for reference list
  const filteredUsers = useMemo(() => {
    const q = typedName.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
  }, [users, typedName]);

  // Check if typed name matches a registered user
  const matchedUser = useMemo(() => {
    const q = typedName.toLowerCase().trim();
    if (!q) return null;
    // 1. Exact case-insensitive match
    const exact = users.find((u) => u.name.trim().toLowerCase() === q);
    if (exact) return exact;

    // 2. Single unique partial match if at least 3 chars
    if (q.length >= 3 && filteredUsers.length === 1) {
      return filteredUsers[0];
    }
    return null;
  }, [users, typedName, filteredUsers]);

  if (!isOpen) return null;

  // Handle direct login submission ONLY from typing name (Cannot click names directly)
  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const q = typedName.trim();
    if (!q) {
      setErrorMessage('Silakan ketikkan nama Anda pada kolom di atas.');
      return;
    }

    if (matchedUser) {
      onSelectUser(matchedUser);
      onClose();
      return;
    }

    // Check if partial matches exist
    if (filteredUsers.length > 0) {
      setErrorMessage(
        `Ketikkan nama lengkap Anda secara spesifik sesuai daftar (misal: "${filteredUsers[0].name}").`
      );
      return;
    }

    // Not found
    setErrorMessage(
      `Nama "${q}" belum terdaftar di sistem DEPOTEL. Silakan periksa ejaan nama Anda pada daftar referensi di bawah atau hubungi Admin.`
    );
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;
    setIsSubmittingGoogle(true);
    setErrorMessage(null);
    try {
      const email = googleEmail.trim().toLowerCase();
      const name = googleName.trim() || email.split('@')[0];
      await onGoogleLogin(email, name);
      onClose();
    } catch {
      setErrorMessage('Gagal masuk dengan akun Google. Silakan coba lagi.');
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with DEPOTEL Logo */}
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
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-blue-300 border border-blue-400/30">
                  Login Teknisi
                </span>
                <span className="text-[10px] text-slate-400">DEPOTEL Monitoring</span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white mt-0.5">
                Ketikkan Nama Anda Untuk Masuk
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Quick Google Sign-In Banner */}
          <div className="rounded-2xl border-2 border-blue-500/40 bg-gradient-to-r from-blue-950/60 to-slate-900 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-blue-400" />
                Masuk Lewat Akun Google / Gmail di HP Anda
              </span>
              <span className="text-[10px] text-blue-300 font-bold bg-blue-500/20 px-2 py-0.5 rounded-full">
                1-Klik
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleLogin(true)}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-850 hover:bg-slate-100 active:scale-98 transition cursor-pointer shadow-md"
            >
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Masuk dengan Akun Google / Gmail</span>
            </button>
          </div>

          {!showGoogleLogin ? (
            <>
              {/* Form Input: Ketik Nama Anda */}
              <form onSubmit={handleTypedSubmit} className="space-y-2.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Atau Ketik Nama Anda Yang Terdaftar:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={typedName}
                      onChange={(e) => {
                        setTypedName(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Ketik nama Anda (contoh: Kusnaedi, Budiman, Diki, dll)..."
                      className="w-full rounded-2xl border-2 border-blue-500/60 bg-slate-800 py-3 pl-11 pr-4 text-sm font-bold text-white placeholder-slate-400 focus:border-blue-400 focus:bg-slate-750 focus:outline-none transition shadow-inner"
                    />
                    {typedName && (
                      <button
                        type="button"
                        onClick={() => {
                          setTypedName('');
                          setErrorMessage(null);
                        }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition cursor-pointer flex-shrink-0"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Masuk</span>
                  </button>
                </div>

                {/* Match hint if typing matches */}
                {matchedUser && (
                  <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <span>✓ Ditemukan: {matchedUser.name}</span>
                    <span className="text-slate-400 font-normal">
                      ({matchedUser.role === 'admin' ? 'Admin' : 'Teknisi'}) — Tekan Enter atau tombol Masuk
                    </span>
                  </p>
                )}
              </form>

              {/* Error Notice */}
              {errorMessage && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* List of Registered Names - Clickable for instant login */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-blue-400" />
                    <span>
                      Daftar Anggota Tim Terdaftar ({filteredUsers.length} dari {users.length})
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Klik nama Anda untuk masuk
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[36vh] overflow-y-auto pr-1">
                  {filteredUsers.map((user) => {
                    const isSelected = currentUser?.id === user.id;
                    const isMatched = matchedUser?.id === user.id;

                    return (
                      <div
                        key={user.id}
                        onClick={() => {
                          onSelectUser(user);
                          onClose();
                        }}
                        className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition active:scale-98 ${
                          isMatched
                            ? 'border-blue-400 bg-blue-900/40 text-white ring-2 ring-blue-400'
                            : isSelected
                            ? 'border-blue-500/60 bg-blue-950/30 text-blue-200'
                            : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                        title={`Klik untuk masuk sebagai ${user.name}`}
                      >
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="h-9 w-9 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow-xs"
                            style={{ backgroundColor: user.avatarColor || '#0e2a6d' }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs sm:text-sm font-bold text-white flex items-center justify-between gap-1">
                            <span className="truncate">{user.name}</span>
                            <div className="flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-slate-200 border border-white/10 flex-shrink-0">
                              <svg className="h-2.5 w-2.5 flex-shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                              </svg>
                              <span>Google</span>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center justify-between gap-1.5 mt-0.5">
                            <span className="font-mono text-blue-300 truncate text-[10px]">
                              {user.email || `${user.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`}
                            </span>
                            {user.isOnline ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold flex-shrink-0 text-[9px]">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Online
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-500 capitalize flex-shrink-0">
                                {user.role === 'admin' ? 'Admin' : 'Teknisi'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alternative Options */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowGoogleLogin(true)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                  <span>Ingin masuk dengan Akun Google / Gmail?</span>
                </button>

                {onOpenActivationModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenActivationModal();
                    }}
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition cursor-pointer"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Kode Undangan</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Google / Gmail Login Option */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Login Menggunakan Akun Google</span>
                <button
                  type="button"
                  onClick={() => setShowGoogleLogin(false)}
                  className="text-xs text-blue-400 hover:underline cursor-pointer"
                >
                  ← Kembali ke Ketik Nama
                </button>
              </div>

              <form onSubmit={handleGoogleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Google / Gmail <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="nama.teknisi@gmail.com"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Panggilan Anda
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Nama panggilan (opsional)"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingGoogle || !googleEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-xs font-black text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{isSubmittingGoogle ? 'Memverifikasi...' : 'Masuk dengan Akun Google'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-850 px-5 py-3 text-center">
          <p className="text-[10px] sm:text-xs text-slate-400">
            Masuk dengan Akun Google / Gmail atau klik nama Anda pada daftar di atas untuk langsung membuka Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
