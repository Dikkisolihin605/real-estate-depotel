import React, { useState, useRef } from 'react';
import {
  X,
  Users,
  UserPlus,
  LogOut,
  Shield,
  Trash2,
  Camera,
  RotateCcw,
  Pencil,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import type { AppUser } from '../types';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  users: AppUser[];
  onAddUser: (name: string, role: 'admin' | 'user') => Promise<void>;
  onUpdateUserRole: (userId: string, role: 'admin' | 'user') => Promise<void>;
  onUpdateUserAvatar: (userId: string, avatarUrl: string) => Promise<void>;
  onUpdateUser?: (userId: string, data: { name?: string; role?: 'admin' | 'user'; email?: string }) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onLogout: () => void;
  onOpenSheetsModal?: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onAddUser,
  onUpdateUserRole,
  onUpdateUserAvatar,
  onUpdateUser,
  onDeleteUser,
  onLogout,
  onOpenSheetsModal,
}) => {
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // In-app modal states (replaces blocked window.confirm)
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  if (!isOpen) return null;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rawUrl = reader.result as string;

        // Resize down to max 256x256 for light profile picture
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, size, size);
            const optimized = canvas.toDataURL('image/jpeg', 0.82);
            await onUpdateUserAvatar(currentUser.id, optimized);
          }
          setIsUploadingAvatar(false);
        };
        img.src = rawUrl;
      } catch (err) {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = async () => {
    if (!currentUser) return;
    setIsUploadingAvatar(true);
    try {
      await onUpdateUserAvatar(currentUser.id, '');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddUser(newUserName.trim(), newUserRole);
      setNewUserName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditUser = (user: AppUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email || '');
    setEditRole(user.role);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim()) return;

    setIsSavingEdit(true);
    try {
      if (onUpdateUser) {
        await onUpdateUser(editingUser.id, {
          name: editName.trim(),
          role: editRole,
          email: editEmail.trim() || undefined,
        });
      } else {
        await onUpdateUserRole(editingUser.id, editRole);
      }
      setEditingUser(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-white p-1 shadow-xs border border-red-500/80 flex items-center justify-center">
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
              <h2 className="text-sm font-black text-slate-900">
                Pengaturan Akun &amp; Tim
              </h2>
              <p className="text-[11px] text-slate-500">
                Kelola profil, link undangan, dan daftar anggota
              </p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Current User Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Profil Pengguna Aktif
              </h4>
              {currentUser && (
                <button
                  type="button"
                  onClick={() => setIsConfirmingLogout(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar Akun</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Profile Image with Camera badge */}
              <div className="relative group flex-shrink-0">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-300 shadow-sm"
                  />
                ) : (
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-sm"
                    style={{ backgroundColor: currentUser?.avatarColor || '#0e2a6d' }}
                  >
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                {/* Upload overlay button */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/60 cursor-pointer"
                  title="Klik untuk ganti foto profil"
                >
                  <Camera className="h-5 w-5" />
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>

              {/* User details & Avatar actions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {currentUser?.name || 'Tamu'}
                  </h3>
                  {currentUser?.role === 'admin' ? (
                    <span className="flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                      <Shield className="h-2.5 w-2.5" /> Admin
                    </span>
                  ) : (
                    <span className="rounded-md bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-800">
                      Teknisi
                    </span>
                  )}
                </div>

                {currentUser?.email && (
                  <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                    {currentUser.email}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition cursor-pointer"
                  >
                    <Camera className="h-3 w-3" />
                    <span>{currentUser?.avatarUrl ? 'Ganti Foto' : 'Pasang Foto'}</span>
                  </button>

                  {currentUser?.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleResetAvatar}
                      disabled={isUploadingAvatar}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                      title="Kembalikan ke avatar inisial"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Google Sheets Database Migration (Admin ONLY) */}
          {isAdmin && onOpenSheetsModal && (
            <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                    Database Google Sheet (Resmi)
                  </h4>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-300">
                  Terhubung
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Pindahkan atau sinkronkan seluruh database dari <code className="bg-white/80 px-1 py-0.5 rounded text-emerald-950 font-bold border border-emerald-200">data/depotel_db.json</code> ke Google Sheet:
                <br />
                <span className="font-mono font-bold text-[11px] text-emerald-800 break-all">1nQEuYD9N_WbyBW0MZEUeMjEJwm4trjKEQyR01vmWe0c</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onOpenSheetsModal}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-black text-white shadow-xs hover:bg-emerald-600 active:scale-95 transition cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Pindahkan / Sinkronkan Data</span>
                </button>
                <a
                  href="https://docs.google.com/spreadsheets/d/1nQEuYD9N_WbyBW0MZEUeMjEJwm4trjKEQyR01vmWe0c/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <span>Buka Sheet</span>
                </a>
              </div>
            </div>
          )}

          {/* Registered Users List & Add User Form (Admin ONLY - Hidden for User Account) */}
          {isAdmin && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Kelola Pengguna ({users.length} Terdaftar)
                  </h4>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                  <Shield className="h-3 w-3 text-amber-600" />
                  Akses Admin
                </span>
              </div>

              {/* Form Tambah Pengguna Baru (Khusus Admin) */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-3 space-y-2">
                <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5 text-blue-700" />
                  <span>Tambah User / Anggota Tim Baru (Hanya Admin)</span>
                </div>
                <form onSubmit={handleCreateUser} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Ketik nama anggota baru..."
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-900 focus:outline-none"
                    >
                      <option value="user">Teknisi</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newUserName.trim()}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer flex-shrink-0 active:scale-95 transition"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>+ Tambah User</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Daftar Pengguna Terdaftar (Hanya Admin) */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto shadow-xs">
                {users.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  return (
                    <div key={user.id} className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50/70 transition">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="h-8 w-8 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black text-white flex-shrink-0"
                            style={{ backgroundColor: user.avatarColor || '#3b82f6' }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-900 truncate">{user.name}</span>
                            {isCurrent && (
                              <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-bold text-blue-800 flex-shrink-0">
                                (Anda)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 capitalize block truncate">
                            {user.role === 'admin' ? 'Administrator' : 'Teknisi Update'}
                            {user.email ? ` · ${user.email}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold cursor-pointer transition active:scale-95 ${
                            user.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                          }`}
                          title="Klik untuk ubah role (Admin / Teknisi)"
                        >
                          {user.role === 'admin' ? 'Admin' : 'Teknisi'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(user)}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title="Edit nama pengguna"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Hapus pengguna"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Hak Akses Teknisi</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Akun Anda berstatus sebagai <strong>Teknisi</strong>. Anda dapat mencentang site, mengisi nomor token listrik, serta mengambil foto meteran dan swacam. Pengelolaan anggota tim dan master data dikelola oleh Administrator.
              </p>
            </div>
          )}
      </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            DEPOTEL GROUP Monitoring Sistem
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* IN-APP MODAL: Delete User Confirmation (replaces blocked window.confirm) */}
      {userToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Hapus Anggota Tim?</h3>
                <p className="text-xs text-slate-500">Tindakan ini permanen</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>{userToDelete.name}</strong> dari daftar anggota tim DEPOTEL?
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-500 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP MODAL: Edit User Data */}
      {editingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">Edit Data Anggota</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Anggota <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email / Gmail (Opsional)
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Role / Hak Akses
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'admin' | 'user')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="user">Teknisi Lapangan</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || !editName.trim()}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-500 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP MODAL: Logout Confirmation */}
      {isConfirmingLogout && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Keluar dari Akun?</h3>
                <p className="text-xs text-slate-500">Anda dapat login kembali kapan saja</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin keluar dari akun <strong>{currentUser?.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmingLogout(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingLogout(false);
                  onLogout();
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
