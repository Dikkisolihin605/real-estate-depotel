import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Send,
  Users,
  Sparkles,
  Mail,
  Shield,
  KeyRound,
  RotateCcw,
  Ban,
  Trash2,
  Clock,
  UserCheck,
  AlertTriangle,
  UserPlus,
  LogIn,
  Globe,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import type { TeamInvitation, UserRole, AppUser } from '../types';

export const PUBLIC_SHARED_URL =
  'https://ais-pre-sw2koyy2muflakec6krfxb-148906958408.asia-southeast1.run.app';

export const getWorkingOrigin = (): string => {
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin;
    if (!origin.includes('localhost') && !origin.includes('webcontainer')) {
      return origin;
    }
  }
  return 'https://ais-dev-sw2koyy2muflakec6krfxb-148906958408.asia-southeast1.run.app';
};

interface InviteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredUsersCount: number;
  users?: AppUser[];
  currentUserRole?: UserRole;
  currentUserName?: string;
  onOpenLoginModal?: () => void;
  onOpenActivationModal?: () => void;
}

export const getLatestInviteUrl = (token?: string, userId?: string, email?: string): string => {
  // Always use the public shared URL so other devices / phones won't get HTTP 403 Forbidden!
  const base = PUBLIC_SHARED_URL;
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  if (userId) params.set('user', userId);
  if (email) params.set('email', email);

  const qs = params.toString();
  return qs ? `${base}/?${qs}` : `${base}/?invite=true`;
};

export const InviteTeamModal: React.FC<InviteTeamModalProps> = ({
  isOpen,
  onClose,
  registeredUsersCount,
  users = [],
  currentUserRole,
  currentUserName,
  onOpenLoginModal,
  onOpenActivationModal,
}) => {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [generatingUserId, setGeneratingUserId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // New invitation form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const checkProductionStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await fetch('/api/check-publish-status');
      if (res.ok) {
        const json = await res.json();
        setIsPublished(json.isPublished);
      } else {
        setIsPublished(false);
      }
    } catch {
      setIsPublished(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Fetch invitations and check status when opened
  useEffect(() => {
    if (isOpen) {
      fetchInvitations();
      checkProductionStatus();
    }
  }, [isOpen]);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/invitations');
      if (res.ok) {
        const json = await res.json();
        setInvitations(json.invitations || []);
      }
    } catch (_) {
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          invitedBy: currentUserName || 'Admin DEPOTEL',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setName('');
        setEmail('');
        setRole('user');
        setFormSuccess(`Undangan resmi berhasil dibuat untuk ${json.invitation.name} (${json.invitation.email})!`);
        fetchInvitations();
      } else {
        setFormError(json.error || 'Gagal membuat undangan.');
      }
    } catch (err) {
      setFormError('Koneksi bermasalah saat membuat undangan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (id: string) => {
    try {
      const res = await fetch(`/api/invitations/${id}/resend`, { method: 'POST' });
      if (res.ok) {
        fetchInvitations();
      }
    } catch (_) {}
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch(`/api/invitations/${id}/revoke`, { method: 'POST' });
      if (res.ok) {
        fetchInvitations();
      }
    } catch (_) {}
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInvitations();
      }
    } catch (_) {}
  };

  const copyToClipboard = (text: string, id: string, isCode = false) => {
    navigator.clipboard.writeText(text);
    if (isCode) {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2500);
    } else {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const formatRemainingTime = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Kedaluwarsa';
    const hours = Math.floor(diff / (3600 * 1000));
    const mins = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    return `Sisa ${hours}j ${mins}m`;
  };

  const handleGenerateLinkForUser = async (user: AppUser, launchWhatsApp = false) => {
    setGeneratingUserId(user.id);
    try {
      const res = await fetch(`/api/invitations/for-user/${user.id}`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        const inviteUrl = getLatestInviteUrl(json.invitation.token, user.id, user.email);
        if (launchWhatsApp) {
          const msg = `Halo rekan *${user.name}*! 👷‍♂️⚡\n\nSilakan masuk ke aplikasi monitoring *DEPOTEL GROUP (Update Token & Swacam)* melalui tautan resmi Google berikut:\n${inviteUrl}\n\n📲 *Sekali Klik Langsung Masuk*: Tautan ini akan otomatis menghubungkan akun Google/Gmail di HP Anda dan langsung masuk ke dashboard monitoring.\n\nKode Akses Cepat: *${json.invitation.code}*\nTerima kasih!`;
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
        } else {
          copyToClipboard(inviteUrl, `user_${user.id}`, false);
        }
        fetchInvitations();
      }
    } catch (_) {
    } finally {
      setGeneratingUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-xs">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[9px] font-black uppercase text-blue-700 border border-blue-200">
                  Manajemen Undangan Tim
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Publik &amp; Terhubung Google</span>
              </div>
              <h2 className="text-sm font-black text-slate-900 mt-0.5">
                Undang Anggota &amp; Teknisi DEPOTEL
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status & Panduan Anti-403 / 404 Untuk Admin */}
          <div
            className={`rounded-2xl border-2 p-4 space-y-2.5 transition shadow-xs ${
              isPublished
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-amber-50 border-amber-400 text-amber-950'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`h-5 w-5 ${isPublished ? 'text-emerald-600' : 'text-amber-600'} flex-shrink-0`}
                />
                <span className="text-xs font-black uppercase tracking-wider">
                  {isPublished
                    ? 'Status: Link Publik Resmi Aktif (Bebas Error 403 & 404 di Semua HP)'
                    : 'PENTING: Agar Link Tidak Error 403 / 404 Saat Dibuka di HP Teknisi'}
                </span>
              </div>
              <button
                type="button"
                onClick={checkProductionStatus}
                disabled={checkingStatus}
                className="flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-300 hover:bg-slate-50 transition cursor-pointer flex-shrink-0"
              >
                <RefreshCw className={`h-3 w-3 ${checkingStatus ? 'animate-spin text-blue-600' : ''}`} />
                <span>{checkingStatus ? 'Memeriksa...' : 'Cek Status'}</span>
              </button>
            </div>

            {!isPublished ? (
              <div className="text-xs space-y-2 leading-relaxed text-amber-900">
                <p>
                  Link pengembang (<strong>ais-dev-</strong>) akan selalu menghasilkan <strong>Error 403 (Forbidden)</strong> jika dibuka di HP lain karena Google membatasi akses hanya untuk akun developer Anda.
                </p>
                <div className="rounded-xl bg-amber-100/90 border border-amber-300 p-3 space-y-1 text-amber-950 font-medium">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <span>👉 Langkah 1-Klik Untuk Mengaktifkan Link Publik:</span>
                  </div>
                  <p>
                    1. Lihat ke <strong>Pojok Kanan Atas Layar Google AI Studio</strong> (di atas bilah obrolan ini).
                  </p>
                  <p>
                    2. Klik tombol <strong className="rounded bg-blue-600 px-1.5 py-0.5 text-white font-black">Share</strong> (atau <em>Bagikan</em>).
                  </p>
                  <p>
                    3. Setelah diklik sekali, Google langsung mengaktifkan link publik (<strong>ais-pre-</strong>) sehingga <strong>langsung bisa dibuka di SEMUA jenis HP (Android, iPhone, tablet)</strong> tanpa error 403 maupun 404!
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-emerald-900 leading-relaxed">
                ✅ <strong>Link Publik Sudah Live!</strong> Seluruh tautan undangan yang Anda salin atau kirim ke WhatsApp di bawah ini siap dibuka oleh semua anggota tim di semua jenis HP secara langsung.
              </p>
            )}
          </div>

          {/* Section 0: Link Publik Aplikasi - Terbuka di Google Sekali Klik */}
          <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900">
                <Globe className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Link Undangan Publik (Buka di Google Chrome Sekali Klik)
                </span>
              </div>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[9px] font-black uppercase text-white shadow-xs">
                {isPublished ? 'Live & Bebas 403' : 'Link Publik Resmi'}
              </span>
            </div>

            <p className="text-xs text-emerald-950 leading-relaxed">
              Tautan resmi ini dapat dibuka langsung di Google / Chrome HP seluruh teknisi tanpa error 403, dan langsung mengarahkan mereka login dengan akun Google / Gmail masing-masing:
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="flex-1 rounded-xl bg-white border border-emerald-300 px-3 py-2 text-xs font-mono text-emerald-950 truncate select-all shadow-inner">
                {PUBLIC_SHARED_URL}/?invite=true
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${PUBLIC_SHARED_URL}/?invite=true`, 'public_general', false)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition cursor-pointer"
                >
                  {copiedId === 'public_general' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-300" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Halo rekan tim DEPOTEL GROUP! Silakan masuk ke aplikasi monitoring Update Token & Swacam melalui tautan resmi berikut:\n\n${PUBLIC_SHARED_URL}/?invite=true\n\nKlik tautan tersebut di Google Chrome HP Anda untuk langsung masuk menggunakan Akun Google/Gmail masing-masing (Bebas error 403).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Section 1: Form Undang Anggota Baru */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Buat Undangan Anggota Baru
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Masa Berlaku: 48 Jam (Token Sekali Pakai)
              </span>
            </div>

            <form onSubmit={handleCreateInvitation} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama calon anggota..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email / Gmail <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Role / Hak Akses <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="user">Karyawan / Teknisi Lapangan</option>
                    <option value="admin">Administrator (Penuh)</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p className="text-[11px] text-rose-600 font-bold bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                  {formError}
                </p>
              )}

              {formSuccess && (
                <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                  {formSuccess}
                </p>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !email.trim()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-2.5 text-xs font-black text-white shadow-md hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Membuat Undangan...' : 'Generate Tautan & Kode Undangan'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 1.5: Tautan Khusus Anggota Terdaftar */}
          {users.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Kirim Link Undangan / Login untuk Anggota Terdaftar ({users.length})
                  </h4>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Login Google 1-Klik
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Pilih anggota yang sudah terdaftar di bawah untuk menyalin atau mengirimkan link login Google langsung via WhatsApp ke HP mereka:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[28vh] overflow-y-auto pr-1">
                {users.map((u) => {
                  const isUserGenerating = generatingUserId === u.id;
                  const isUserCopied = copiedId === `user_${u.id}`;

                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">
                          {u.role === 'admin' ? 'Admin' : 'Teknisi'} {u.email ? `· ${u.email}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          disabled={isUserGenerating}
                          onClick={() => handleGenerateLinkForUser(u, false)}
                          className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-800 active:scale-95 transition cursor-pointer"
                          title="Salin tautan login Google untuk anggota ini"
                        >
                          {isUserCopied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>{isUserGenerating ? '...' : 'Salin'}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isUserGenerating}
                          onClick={() => handleGenerateLinkForUser(u, true)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 active:scale-95 transition cursor-pointer"
                          title="Kirim ke WhatsApp anggota ini"
                        >
                          <Send className="h-3 w-3" />
                          <span>WA</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Daftar Undangan & Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-slate-500" />
                <span>Daftar Undangan Anggota ({invitations.length})</span>
              </h4>
              <button
                type="button"
                onClick={fetchInvitations}
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Segarkan
              </button>
            </div>

            {invitations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                Belum ada undangan yang dibuat. Silakan gunakan formulir di atas untuk mengundang anggota tim baru.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1">
                {invitations.map((inv) => {
                  const inviteUrl = getLatestInviteUrl(inv.token, inv.acceptedUserId, inv.email);
                  const isCopied = copiedId === inv.id;
                  const isCodeCopied = copiedCodeId === inv.id;

                  const waMessage = `Halo rekan *${inv.name}*! 👷‍♂️⚡\n\nAnda telah diundang untuk bergabung ke aplikasi monitoring *DEPOTEL GROUP (Update Token & Swacam)* sebagai *${
                    inv.role === 'admin' ? 'Administrator' : 'Karyawan / Teknisi Lapangan'
                  }*.\n\n📲 *Klik tautan resmi Google berikut di HP Anda untuk langsung masuk otomatis:*\n${inviteUrl}\n\n*Alternatif Kode Aktivasi 6-Digit:*\n*${inv.code}*\n\n(Tautan & Kode berlaku untuk Akun Google/Gmail Anda. Terima kasih!)`;
                  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;

                  return (
                    <div
                      key={inv.id}
                      className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5 transition hover:border-slate-300"
                    >
                      {/* Top Row: User info & Status badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {inv.name}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.2 text-[9px] font-black uppercase tracking-wider border ${
                                inv.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : inv.status === 'accepted'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : inv.status === 'expired'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {inv.status === 'pending'
                                ? 'Pending'
                                : inv.status === 'accepted'
                                ? 'Aktif / Digunakan'
                                : inv.status === 'expired'
                                ? 'Kedaluwarsa'
                                : 'Dibatalkan'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                            {inv.email} · <span className="font-sans font-bold capitalize text-blue-700">{inv.role === 'admin' ? 'Admin' : 'Karyawan'}</span>
                          </div>
                        </div>

                        {/* Timing info */}
                        <div className="text-right text-[10px] text-slate-400 flex-shrink-0">
                          {inv.status === 'pending' && (
                            <span className="font-semibold text-amber-600 flex items-center gap-1 justify-end">
                              <Clock className="h-3 w-3" />
                              {formatRemainingTime(inv.expiresAt)}
                            </span>
                          )}
                          {inv.status === 'accepted' && (
                            <span className="font-semibold text-emerald-600 flex items-center gap-1 justify-end">
                              <UserCheck className="h-3 w-3" />
                              Sudah Aktif
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Code and URL */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
                          <span className="text-[11px] text-slate-500">Kode Aktivasi:</span>
                          <span className="font-mono font-black text-slate-900 tracking-wider">
                            {inv.code}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(inv.code, inv.id, true)}
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                            title="Salin Kode 6-Digit"
                          >
                            {isCodeCopied ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-600">Kode Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <KeyRound className="h-3 w-3 text-slate-500" />
                                <span>Salin Kode</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(inviteUrl, inv.id, false)}
                            className="flex items-center gap-1 rounded-xl bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-800 active:scale-95 transition cursor-pointer"
                            title="Salin Tautan Aktivasi"
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-slate-300" />
                                <span>Salin Link</span>
                              </>
                            )}
                          </button>

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 active:scale-95 transition cursor-pointer"
                            title="Kirim ke WhatsApp"
                          >
                            <Send className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      {/* Bottom Actions for pending / expired / revoked */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
                        <span>Diundang oleh: {inv.invitedBy}</span>
                        <div className="flex items-center gap-2">
                          {(inv.status === 'expired' || inv.status === 'revoked') && (
                            <button
                              type="button"
                              onClick={() => handleResend(inv.id)}
                              className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Buat Ulang (Regenerate)
                            </button>
                          )}

                          {inv.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleRevoke(inv.id)}
                              className="font-bold text-amber-600 hover:underline flex items-center gap-1"
                            >
                              <Ban className="h-3 w-3" />
                              Batalkan
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(inv.id)}
                            className="text-slate-400 hover:text-rose-600"
                            title="Hapus Rekaman"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex items-center justify-between">
          <p className="text-[10px] text-slate-500">
            Tautan aktivasi terenkripsi &amp; hanya dapat digunakan satu kali.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 transition cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
