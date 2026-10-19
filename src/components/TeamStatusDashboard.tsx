import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Shield, Lock } from 'lucide-react';
import type { AppUser } from '../types';

interface TeamStatusDashboardProps {
  users: AppUser[];
  currentUser?: AppUser | null;
}

export const TeamStatusDashboard: React.FC<TeamStatusDashboardProps> = ({
  users,
  currentUser,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const onlineUsers = users.filter((u) => u.isOnline);
  const offlineUsers = users.filter((u) => !u.isOnline);

  const formatLastSeen = (timestamp: number) => {
    if (!timestamp) return 'Offline';
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 45) return 'Aktif';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  };

  // Split users into 2 equal parts / side-by-side columns (Bagian 1 & Bagian 2)
  const midpoint = Math.ceil(users.length / 2);
  const part1 = users.slice(0, midpoint);
  const part2 = users.slice(midpoint);

  const renderUserCard = (user: AppUser) => {
    const isCurrent = currentUser?.id === user.id;
    const isOnline = !!user.isOnline;
    const isAdmin = user.role === 'admin' || user.name.toLowerCase().includes('diki');

    return (
      <div
        key={user.id}
        className={`flex items-center justify-between rounded-2xl border p-3 cursor-default transition ${
          isCurrent
            ? 'border-blue-400 bg-blue-50/70 ring-1 ring-blue-300'
            : 'border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/60'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover border border-slate-300"
              />
            ) : (
              <div
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-xs sm:text-sm font-black text-white shadow-xs"
                style={{ backgroundColor: user.avatarColor || '#0e2a6d' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Status Dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                {user.name}
              </span>
              {isAdmin && (
                <Shield className="h-3 w-3 text-amber-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[10px] sm:text-xs font-semibold truncate ${
                  isOnline ? 'text-emerald-600 font-extrabold' : 'text-slate-400'
                }`}
              >
                {isOnline ? 'Online' : formatLastSeen(user.lastActive)}
              </span>
              {isCurrent && (
                <span className="rounded-full bg-blue-200/70 px-1.5 py-0.2 text-[9px] font-black text-blue-800">
                  Aktif
                </span>
              )}
            </div>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-lg bg-white border border-slate-200 flex-shrink-0">
          {user.role === 'admin' ? 'Admin' : 'Teknisi'}
        </span>
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 md:p-7 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 shadow-xs">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight">
                Status Anggota Tim ({users.length} Teknisi)
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                <Lock className="h-3 w-3 text-slate-400" />
                Hanya Lihat
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="text-emerald-600 font-extrabold">{onlineUsers.length} Online</span> •{' '}
              <span>{offlineUsers.length} Offline</span> •{' '}
              <span className="text-slate-400 font-medium">Ditampilkan dalam 2 bagian sebelahan</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition"
        >
          <span>{isExpanded ? 'Sembunyikan' : 'Lihat Semua'}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Grid of registered members - 2 Bagian / Kolom Sebelahan (Strictly read-only) */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 select-none">
          {/* Bagian 1 (Kolom Kiri) */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-3 sm:p-3.5 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Bagian 1
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {part1.length} Anggota
              </span>
            </div>
            <div className="space-y-2">
              {part1.map((user) => renderUserCard(user))}
            </div>
          </div>

          {/* Bagian 2 (Kolom Kanan) */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-3 sm:p-3.5 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Bagian 2
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {part2.length} Anggota
              </span>
            </div>
            <div className="space-y-2">
              {part2.map((user) => renderUserCard(user))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
