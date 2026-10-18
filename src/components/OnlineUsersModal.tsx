import React from 'react';
import { X, Clock, UserCheck, Shield, CheckCircle2, Lock } from 'lucide-react';
import type { AppUser } from '../types';

interface OnlineUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  currentUser: AppUser | null;
  onSelectUser?: (user: AppUser) => void;
}

export const OnlineUsersModal: React.FC<OnlineUsersModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
}) => {
  if (!isOpen) return null;

  const onlineUsers = users.filter((u) => u.isOnline);
  const offlineUsers = users.filter((u) => !u.isOnline);

  const formatLastSeen = (timestamp: number) => {
    if (!timestamp) return 'Belum pernah aktif';
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 45) return 'Baru saja aktif';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white">Status Tim DEPOTEL</h2>
                <span className="flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400 border border-slate-700">
                  <Lock className="h-2.5 w-2.5 text-slate-400" />
                  Hanya Lihat
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {onlineUsers.length} Online • {offlineUsers.length} Offline • Status pemantauan kehadiran
              </p>
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

        {/* List Body - Strictly read-only, cannot be clicked */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5 select-none">
          {/* Online Section */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Sedang Online ({onlineUsers.length})
              </h3>
            </div>

            {onlineUsers.length === 0 ? (
              <p className="rounded-2xl bg-slate-800/40 p-3.5 text-center text-xs text-slate-500">
                Belum ada tim yang online saat ini
              </p>
            ) : (
              <div className="space-y-2">
                {onlineUsers.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  return (
                    <div
                      key={user.id}
                      className={`w-full flex items-center justify-between rounded-2xl border p-3 cursor-default transition ${
                        isCurrent
                          ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200 ring-1 ring-emerald-500/30'
                          : 'border-slate-800 bg-slate-800/50 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="h-9 w-9 rounded-xl object-cover border border-slate-700"
                            />
                          ) : (
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-white"
                              style={{ backgroundColor: user.avatarColor || '#0e2a6d' }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white">{user.name}</span>
                            {user.role === 'admin' && (
                              <span className="flex items-center gap-0.5 rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                                <Shield className="h-2.5 w-2.5" /> Admin
                              </span>
                            )}
                            {isCurrent && (
                              <span className="rounded-full bg-emerald-500/30 px-2 py-0.2 text-[9px] font-bold text-emerald-300">
                                Anda
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="h-3 w-3" /> Sedang Online
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Offline Section */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-slate-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Offline ({offlineUsers.length})
              </h3>
            </div>

            <div className="space-y-2">
              {offlineUsers.map((user) => {
                const isCurrent = currentUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    className={`w-full flex items-center justify-between rounded-2xl border p-3 cursor-default transition ${
                      isCurrent
                        ? 'border-blue-500/60 bg-blue-950/30 text-blue-200'
                        : 'border-slate-800/80 bg-slate-800/30 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="h-9 w-9 rounded-xl object-cover border border-slate-700 opacity-80"
                          />
                        ) : (
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-slate-300 opacity-80"
                            style={{ backgroundColor: user.avatarColor || '#475569' }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-slate-600 ring-2 ring-slate-900" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-200">{user.name}</span>
                          {user.role === 'admin' && (
                            <span className="flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-bold text-amber-400">
                              <Shield className="h-2.5 w-2.5" /> Admin
                            </span>
                          )}
                          {isCurrent && (
                            <span className="rounded-full bg-blue-500/30 px-2 py-0.2 text-[9px] font-bold text-blue-300">
                              Anda
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> {formatLastSeen(user.lastActive)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-850 p-3 text-center">
          <p className="text-xs text-slate-400">
            Daftar ini hanya menampilkan status online/offline tim dan tidak dapat diklik.
          </p>
        </div>
      </div>
    </div>
  );
};
