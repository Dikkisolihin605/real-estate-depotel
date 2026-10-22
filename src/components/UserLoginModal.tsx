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
  // Selected login tab: 'name' | 'google'
  const [activeTab, setActiveTab] = useState<'name' | 'google'>('name');
  const [typedName, setTypedName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('dikisolihin605@gmail.com');
  const [googleName, setGoogleName] = useState('');
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setTypedName('');
      setErrorMessage(null);
      setTimeout(() => {
        if (activeTab === 'name') {
          inputRef.current?.focus();
        }
      }, 150);
    }
  }, [isOpen, activeTab]);

  // Merge any custom users added by admin to ensure newly registered members are immediately available
  const allAvailableUsers = useMemo(() => {
    const list = [...users];
    try {
      const customRaw = localStorage.getItem('depotel_custom_users');
      if (customRaw) {
        const customUsers: AppUser[] = JSON.parse(customRaw);
        for (const cu of customUsers) {
          if (!list.some((u) => u.id === cu.id || u.name.toLowerCase() === cu.name.toLowerCase())) {
            list.push(cu);
          }
        }
      }
    } catch (_) {}
    return list;
  }, [users]);

  // Real-time filtered users based on typed name for reference list
  const filteredUsers = useMemo(() => {
    const q = typedName.toLowerCase().trim();
    if (!q) return allAvailableUsers;
    return allAvailableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
  }, [allAvailableUsers, typedName]);

  // Check if typed name matches a registered user (case-insensitive exact or clean match)
  const matchedUser = useMemo(() => {
    const q = typedName.toLowerCase().trim();
    if (!q) return null;
    // 1. Exact case-insensitive match
    const exact = allAvailableUsers.find((u) => u.name.trim().toLowerCase() === q);
    if (exact) return exact;

    // 2. Partial match if typing prefix matches name words (e.g. "Diki" matches "Diki Solihin (Admin)")
    const cleanExact = allAvailableUsers.find((u) => {
      const uName = u.name.toLowerCase().replace(/\s*\(admin\)/g, '').trim();
      return uName === q;
    });
    if (cleanExact) return cleanExact;

    // 3. Match if user's name starts with or includes query
    const prefixMatch = allAvailableUsers.find((u) => {
      const uName = u.name.toLowerCase().replace(/\s*\(admin\)/g, '').trim();
      return uName.startsWith(q) || q.startsWith(uName);
    });
    if (prefixMatch) return prefixMatch;

    // 4. Single unambiguous match if query is at least 2 chars
    if (q.length >= 2 && filteredUsers.length === 1) {
      return filteredUsers[0];
    }
    return null;
  }, [allAvailableUsers, typedName, filteredUsers]);

  if (!isOpen) return null;

  // Handle direct login submission ONLY from typing registered name (Cannot click names directly)
  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const q = typedName.trim();
    if (!q) {
      setErrorMessage('Silakan ketikkan nama Anda pada kolom di bawah.');
      return;
    }

    // Try matchedUser first, or find any user containing the typed name
    const foundUser =
      matchedUser ||
      allAvailableUsers.find((u) => {
        const uClean = u.name.toLowerCase().replace(/\s*\(admin\)/g, '').trim();
        const qClean = q.toLowerCase();
        return (
          uClean === qClean ||
          u.name.toLowerCase().trim() === qClean ||
          uClean.includes(qClean) ||
          qClean.includes(uClean)
        );
      });

    if (foundUser) {
      onSelectUser(foundUser);
      onClose();
      return;
    }

    // If typed name does not match any registered user
    setErrorMessage(
      `Nama "${q}" tidak terdaftar di sistem DEPOTEL. Hanya nama yang sudah didaftarkan oleh Admin yang dapat masuk. Silakan hubungi Admin untuk mendaftarkan nama Anda.`
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
                  Login DEPOTEL
                </span>
                <span className="text-[10px] text-slate-400">Monitoring &amp; Checklist</span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white mt-0.5">
                Pilih Opsi Masuk ke Aplikasi
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

        {/* 2 Opsi Login: Google/Gmail vs Masukkan Nama Terdaftar */}
        <div className="p-4 bg-slate-850 border-b border-slate-800">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
            {/* Opsi 1: Google / Gmail */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('google');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'google'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>1. Google / Gmail</span>
            </button>

            {/* Opsi 2: Masukkan Nama Terdaftar */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('name');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === 'name'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>2. Masukkan Nama</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: Login dengan GOOGLE / GMAIL */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-500/40 bg-blue-950/40 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-blue-300">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>Akun Utama Terhubung: dikisolihin605@gmail.com</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Semua akun Admin dan User kini terhubung menggunakan database bersama via <strong>dikisolihin605@gmail.com</strong> agar seluruh tim termonitor langsung saat mengisi token dan swacam.
                </p>
              </div>

              {/* Quick Select Petugas / Anggota Tim */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Pilih Nama Petugas / Teknisi:
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800">
                  {allAvailableUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setGoogleName(u.name);
                        setGoogleEmail('dikisolihin605@gmail.com');
                        onSelectUser({ ...u, email: 'dikisolihin605@gmail.com' });
                        onClose();
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 border border-slate-700/60 text-left transition cursor-pointer group"
                    >
                      <div
                        className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                        style={{ backgroundColor: u.avatarColor || '#3b82f6' }}
                      >
                        {u.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-black text-white truncate group-hover:text-blue-300">
                          {u.name}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {u.role === 'admin' ? '⭐ Admin' : 'Teknisi'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleGoogleSubmit} className="space-y-3 pt-1">
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
                      placeholder="dikisolihin605@gmail.com"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Atau Ketik Nama Panggilan Anda
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Contoh: Diki, Saddam, Kusnaedi, Samin, dll..."
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-3.5 py-3 text-xs font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingGoogle || !googleEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-xs sm:text-sm font-black text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{isSubmittingGoogle ? 'Memverifikasi...' : 'Masuk dengan Akun Google'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Masukkan Nama Yang Terdaftar (Hanya nama terdaftar yang bisa masuk) */}
          {activeTab === 'name' && (
            <div className="space-y-4">
              <form onSubmit={handleTypedSubmit} className="space-y-2.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Masukkan Nama Anda Yang Sudah Didaftarkan:
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
                      placeholder="Ketik nama terdaftar (contoh: Saddam, Kusnaedi, Diki, dll)..."
                      className="w-full rounded-2xl border-2 border-blue-500/60 bg-slate-800 py-3 pl-11 pr-4 text-xs sm:text-sm font-bold text-white placeholder-slate-400 focus:border-blue-400 focus:bg-slate-750 focus:outline-none transition shadow-inner"
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

                {/* Match indicator when typed name matches */}
                {matchedUser && (
                  <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/40 p-2.5 text-xs text-emerald-300 font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>✓ Nama Terdaftar: <strong>{matchedUser.name}</strong> ({matchedUser.role === 'admin' ? 'Admin' : 'Teknisi'})</span>
                  </div>
                )}
              </form>

              {/* Error Notice */}
              {errorMessage && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* List of Registered Names - STRICTLY READ-ONLY (TIDAK BISA DI-KLIK OLEH SIAPAPUN) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-blue-400" />
                    <span>
                      Daftar Anggota Tim Terdaftar ({allAvailableUsers.length} Teknisi)
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-slate-700">
                    <Lock className="h-3 w-3 text-amber-400" />
                    Tidak Bisa Diklik (Ketik Nama di Atas)
                  </span>
                </div>

                {/* Non-clickable card grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[34vh] overflow-y-auto pr-1 select-none">
                  {allAvailableUsers.map((user) => {
                    const isMatched = matchedUser?.id === user.id;

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 rounded-2xl border p-2.5 cursor-default transition ${
                          isMatched
                            ? 'border-emerald-500/70 bg-emerald-950/30 text-white ring-1 ring-emerald-500'
                            : 'border-slate-800 bg-slate-800/40 text-slate-300'
                        }`}
                        title="Daftar nama terdaftar (Hanya bisa masuk dengan mengetikkan nama di kolom di atas)"
                      >
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="h-8 w-8 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow-xs"
                            style={{ backgroundColor: user.avatarColor || '#0e2a6d' }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-bold text-white flex items-center justify-between gap-1">
                            <span className="truncate">{user.name}</span>
                            {user.role === 'admin' ? (
                              <span className="rounded-md bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-black text-amber-300 border border-amber-500/30">
                                Admin
                              </span>
                            ) : (
                              <span className="rounded-md bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-blue-300">
                                Teknisi
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center justify-between gap-1.5 mt-0.5">
                            <span className="font-mono text-slate-400 truncate text-[10px]">
                              {user.email || `${user.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`}
                            </span>
                            <span className="text-[9px] text-slate-500 flex-shrink-0">
                              Terdaftar
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-850 px-5 py-3 text-center">
          <p className="text-[11px] text-slate-400">
            Masuk dengan Akun Google / Gmail atau ketikkan nama Anda yang telah didaftarkan oleh admin.
          </p>
        </div>
      </div>
    </div>
  );
};
