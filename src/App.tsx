import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  WifiOff,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import type { DatabaseSchema, UpdateType, SiteItem, AppUser } from './types';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { BottomNav } from './components/BottomNav';
import { StatsCard } from './components/StatsCard';
import { SiteCard } from './components/SiteCard';
import { TeamStatusDashboard } from './components/TeamStatusDashboard';
import { PullToRefresh } from './components/PullToRefresh';
import { EditSiteModal } from './components/EditSiteModal';
import { EditPeriodModal } from './components/EditPeriodModal';
import { TokenNoteModal } from './components/TokenNoteModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { PhotoGalleryModal } from './components/PhotoGalleryModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { OnlineUsersModal } from './components/OnlineUsersModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { NewUpdateTypeModal } from './components/NewUpdateTypeModal';
import { UserLoginModal } from './components/UserLoginModal';
import { AddSiteModal } from './components/AddSiteModal';
import { InviteTeamModal } from './components/InviteTeamModal';
import { InvitationActivationModal } from './components/InvitationActivationModal';
import { PublishModal } from './components/PublishModal';
import { OFFICIAL_TEAM_USERS, getDefaultClientDB } from './initialData';

interface OfflineAction {
  id: string;
  type: 'toggle' | 'token';
  typeId: string;
  siteId: string;
  payload: any;
  timestamp: number;
}

const getOfflineQueue = (): OfflineAction[] => {
  try {
    const raw = localStorage.getItem('depotel_offline_queue');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveOfflineQueue = (queue: OfflineAction[]) => {
  try {
    localStorage.setItem('depotel_offline_queue', JSON.stringify(queue));
  } catch {}
};

export default function App() {
  const [data, setData] = useState<DatabaseSchema>(() => {
    try {
      const cached = localStorage.getItem('depotel_cached_db');
      if (cached) {
        const parsed: DatabaseSchema = JSON.parse(cached);
        if (parsed.users && parsed.users.length > 0) {
          for (const offUser of OFFICIAL_TEAM_USERS) {
            if (!parsed.users.some((u) => u.id === offUser.id || u.name.toLowerCase() === offUser.name.toLowerCase())) {
              parsed.users.push({ ...offUser });
            }
          }
          return parsed;
        }
      }
    } catch (_) {}
    return getDefaultClientDB();
  });
  const [activeTypeId, setActiveTypeId] = useState<string>('type_token');
  const [currentView, setCurrentView] = useState<'dashboard' | 'monitoring'>('dashboard');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(() => getOfflineQueue().length);

  // Search & Filters inside monitoring view
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked' | 'unchecked'>('all');

  // Modals state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isInviteTeamModalOpen, setIsInviteTeamModalOpen] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationToken, setActivationToken] = useState<string | null>(null);
  const [activationCode, setActivationCode] = useState<string | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [isNewUpdateTypeModalOpen, setIsNewUpdateTypeModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<UpdateType | null>(null);

  // In-app deletion confirmation states (eliminates iframe-blocked window.confirm)
  const [siteToDelete, setSiteToDelete] = useState<{ site: SiteItem; typeId: string } | null>(null);
  const [updateTypeToDelete, setUpdateTypeToDelete] = useState<{ id: string; name: string } | null>(null);

  // Active site for modals
  const [activeEditSite, setActiveEditSite] = useState<SiteItem | null>(null);
  const [activeTokenSite, setActiveTokenSite] = useState<SiteItem | null>(null);
  const [activeCameraSite, setActiveCameraSite] = useState<SiteItem | null>(null);
  const [activeGallerySite, setActiveGallerySite] = useState<SiteItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Performance cache ref to eliminate unnecessary re-renders
  const lastDataStringRef = useRef<string>('');

  // PWA update handler
  const [pwaUpdateAction, setPwaUpdateAction] = useState<(() => void) | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync offline queue to backend
  const syncOfflineQueue = useCallback(async () => {
    const queue = getOfflineQueue();
    if (!queue.length) return;
    setIsSyncing(true);
    let successCount = 0;
    const remaining: OfflineAction[] = [];

    for (const item of queue) {
      try {
        if (item.type === 'toggle') {
          const res = await fetch(`/api/sites/${item.typeId}/${item.siteId}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
          });
          if (res.ok) successCount++;
          else remaining.push(item);
        } else if (item.type === 'token') {
          const res = await fetch(`/api/sites/${item.typeId}/${item.siteId}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
          });
          if (res.ok) successCount++;
          else remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    saveOfflineQueue(remaining);
    setOfflineQueueCount(remaining.length);
    setIsSyncing(false);

    if (successCount > 0) {
      showToast(`✅ Sinkronisasi berhasil: ${successCount} laporan tersimpan di server!`);
    }
  }, []);

  // Fetch full data from backend (with zero-lag comparison for background polls & offline storage)
  const fetchData = useCallback(async (quiet = false) => {
    if (!quiet) setIsSyncing(true);
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json: DatabaseSchema = await res.json();
        const jsonStr = JSON.stringify(json);
        if (quiet && jsonStr === lastDataStringRef.current) {
          // Data is identical, skip re-render to keep UI responsive
          return;
        }
        lastDataStringRef.current = jsonStr;
        setData(json);

        // Cache safe data copy for offline access
        try {
          localStorage.setItem('depotel_cached_db', jsonStr);
        } catch (_) {}

        if (json.updateTypes.length > 0) {
          setActiveTypeId((prev) => {
            const exists = json.updateTypes.some((t) => t.id === prev);
            return exists ? prev : json.updateTypes[0].id;
          });
        }

        const savedUserId = localStorage.getItem('depotel_user_id');
        if (savedUserId) {
          const found = json.users.find((u) => u.id === savedUserId);
          if (found) {
            setCurrentUser(found);
          } else {
            setCurrentUser(null);
            setIsLoginModalOpen(true);
          }
        } else {
          // When no user is stored, do NOT auto-login. Prompt the user to select their name.
          setCurrentUser(null);
          setIsLoginModalOpen(true);
        }
      } else {
        throw new Error('Server returned error status');
      }
    } catch (err) {
      console.warn('Network request failed, ensuring default database with 9 official team members:', err);
      // Fallback to local offline cache or default initial database with 9 users
      setData((prev) => {
        let db = prev;
        if (!db || !db.users || db.users.length === 0) {
          try {
            const cached = localStorage.getItem('depotel_cached_db');
            if (cached) {
              db = JSON.parse(cached);
            }
          } catch (_) {}
        }
        if (!db || !db.users || db.users.length === 0) {
          db = getDefaultClientDB();
        }
        // Ensure all 9 official users exist in fallback
        for (const offUser of OFFICIAL_TEAM_USERS) {
          if (!db.users.some((u) => u.id === offUser.id || u.name.toLowerCase() === offUser.name.toLowerCase())) {
            db.users.push({ ...offUser });
          }
        }
        try {
          localStorage.setItem('depotel_cached_db', JSON.stringify(db));
        } catch (_) {}
        return { ...db };
      });
    } finally {
      setIsLoading(false);
      if (!quiet) setIsSyncing(false);
    }
  }, []);

  // Listen to network status & PWA update events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Koneksi internet kembali online. Menyinkronkan data...');
      syncOfflineQueue();
      fetchData(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Koneksi offline: Menampilkan data tersimpan di perangkat.');
    };
    const handlePWAUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ updateSW: (reload?: boolean) => Promise<void> }>;
      if (custom.detail?.updateSW) {
        setPwaUpdateAction(() => () => custom.detail.updateSW(true));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-update-available', handlePWAUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-update-available', handlePWAUpdate);
    };
  }, [syncOfflineQueue, fetchData]);

  // Initial load & invite / activation link handling
  useEffect(() => {
    fetchData();

    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const codeParam = urlParams.get('code');
    const userParam = urlParams.get('user');
    const emailParam = urlParams.get('email');
    const isInvite = urlParams.get('invite') === 'true' || window.location.pathname.startsWith('/invite');

    if (tokenParam || codeParam || userParam || emailParam) {
      // 1-Click Instant Auto-Login from Invitation Link
      setCurrentView('dashboard');
      fetch('/api/invitations/auto-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenParam || undefined,
          code: codeParam || undefined,
          userId: userParam || undefined,
          email: emailParam || undefined,
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.user) {
            setCurrentUser(json.user);
            try {
              localStorage.setItem('depotel_user', JSON.stringify(json.user));
            } catch (_) {}
            setIsActivationModalOpen(false);
            setIsLoginModalOpen(false);
            showToast(`✅ Berhasil Masuk! Selamat datang, ${json.user.name} (${json.user.email || 'Akun Google'}).`);
            try {
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (_) {}
          } else {
            // Fallback: If not automatically resolved, show activation modal
            setActivationToken(tokenParam);
            setActivationCode(codeParam);
            setIsActivationModalOpen(true);
          }
        })
        .catch(() => {
          setActivationToken(tokenParam);
          setActivationCode(codeParam);
          setIsActivationModalOpen(true);
        });
    } else if (isInvite) {
      // Direct landing with Google sign-in prompt
      setCurrentView('dashboard');
      setIsLoginModalOpen(true);
      showToast('Selamat Datang di DEPOTEL! Silakan masuk dengan Akun Google Anda.');
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (_) {}
    }
  }, [fetchData]);

  // Periodic heartbeat & data sync (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser) {
        fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, userName: currentUser.name }),
        }).catch(() => {});
      }
      fetchData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser, fetchData]);

  // Pull to refresh handler
  const handlePullRefresh = async () => {
    await fetchData(false);
    showToast('Data berhasil diperbarui!');
  };

  // Active Update Type
  const currentUpdateType = useMemo(() => {
    if (!data || !data.updateTypes.length) return null;
    return data.updateTypes.find((t) => t.id === activeTypeId) || data.updateTypes[0];
  }, [data, activeTypeId]);

  // Filtered Sites for monitoring view
  const filteredSites = useMemo(() => {
    if (!currentUpdateType) return [];
    return currentUpdateType.sites.filter((site) => {
      if (statusFilter === 'checked' && !site.checked) return false;
      if (statusFilter === 'unchecked' && site.checked) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = site.siteCode.toLowerCase().includes(q);
        const matchName = site.siteName.toLowerCase().includes(q);
        const matchCustomer = site.customerId.toLowerCase().includes(q);
        const matchToken = (site.tokenNumber || '').toLowerCase().includes(q);
        return matchCode || matchName || matchCustomer || matchToken;
      }
      return true;
    });
  }, [currentUpdateType, statusFilter, searchQuery]);

  // 1. Toggle site checked status
  const handleToggleSite = async (site: SiteItem) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      showToast('Silakan pilih nama Anda terlebih dahulu sebelum mencentang site.');
      return;
    }
    if (!currentUpdateType) return;
    const previousState = site.checked;

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updateTypes: prev.updateTypes.map((ut) => {
          if (ut.id !== currentUpdateType.id) return ut;
          return {
            ...ut,
            sites: ut.sites.map((s) => (s.id === site.id ? { ...s, checked: !s.checked } : s)),
          };
        }),
      };
    });

    try {
      const res = await fetch(`/api/sites/${currentUpdateType.id}/${site.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedBy: currentUser?.name || 'Petugas' }),
      });
      if (!res.ok) throw new Error('Toggle failed');
      showToast(!previousState ? `✅ ${site.siteCode} ditandai Sudah Tercentang!` : `❌ ${site.siteCode} ditandai Belum Tercentang!`);
    } catch (err) {
      // Offline fallback: queue action
      const queue = getOfflineQueue();
      const newAction: OfflineAction = {
        id: `act_${Date.now()}_${Math.random()}`,
        type: 'toggle',
        typeId: currentUpdateType.id,
        siteId: site.id,
        payload: { updatedBy: currentUser?.name || 'Petugas' },
        timestamp: Date.now(),
      };
      queue.push(newAction);
      saveOfflineQueue(queue);
      setOfflineQueueCount(queue.length);
      showToast(`Tersimpan di antrean draft lokal (Offline). Menunggu internet untuk disinkronkan ke server.`);
    }
  };

  // 2. Save edited site (Admin Only)
  const handleSaveEditSite = async (
    customerId: string,
    siteCode: string,
    siteName: string,
    checked: boolean
  ) => {
    if (currentUser?.role !== 'admin') {
      showToast('Hak akses ditolak: Hanya Admin yang dapat mengedit data site.');
      return;
    }
    if (!currentUpdateType || !activeEditSite) return;

    try {
      const res = await fetch(`/api/sites/${currentUpdateType.id}/${activeEditSite.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, siteCode, siteName, checked }),
      });
      if (res.ok) {
        showToast('Data site berhasil diperbarui');
        fetchData(true);
      }
    } catch (err) {
      showToast('Gagal mengedit site');
    }
  };

  // 3. Delete site with in-app confirmation modal (Admin Only)
  const handleDeleteSite = (site: SiteItem) => {
    if (currentUser?.role !== 'admin') {
      showToast('Hak akses ditolak: Hanya Admin yang dapat menghapus site.');
      return;
    }
    if (!currentUpdateType) return;
    setSiteToDelete({ site, typeId: currentUpdateType.id });
  };

  const confirmDeleteSiteAction = async () => {
    if (!siteToDelete) return;
    const { site, typeId } = siteToDelete;
    setSiteToDelete(null);

    // Optimistically remove from state immediately
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updateTypes: prev.updateTypes.map((ut) => {
          if (ut.id !== typeId) return ut;
          return {
            ...ut,
            sites: ut.sites.filter((s) => s.id !== site.id),
          };
        }),
      };
    });

    showToast(`Site ${site.siteCode} berhasil dihapus`);

    try {
      const res = await fetch(`/api/sites/${typeId}/${site.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchData(true);
    } catch (err) {
      showToast('Gagal menghapus site dari server');
      fetchData(true);
    }
  };

  // 4. Clear Token (Instant optimistic update without refresh)
  const handleClearToken = async (site: SiteItem) => {
    if (!currentUpdateType) return;

    // Optimistically clear the token immediately so the UI updates instantly
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updateTypes: prev.updateTypes.map((ut) => {
          if (ut.id !== currentUpdateType.id) return ut;
          return {
            ...ut,
            sites: ut.sites.map((s) => (s.id === site.id ? { ...s, tokenNumber: '' } : s)),
          };
        }),
      };
    });

    showToast(`Nomor token site ${site.siteCode} berhasil dihapus`);

    try {
      const res = await fetch(`/api/sites/${currentUpdateType.id}/${site.id}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenNumber: '',
          notes: '',
          updatedBy: currentUser?.name || 'Petugas',
        }),
      });
      if (!res.ok) throw new Error('Clear token failed');
    } catch (err) {
      const queue = getOfflineQueue();
      const newAction: OfflineAction = {
        id: `act_${Date.now()}_${Math.random()}`,
        type: 'token',
        typeId: currentUpdateType.id,
        siteId: site.id,
        payload: {
          tokenNumber: '',
          notes: '',
          updatedBy: currentUser?.name || 'Petugas',
        },
        timestamp: Date.now(),
      };
      queue.push(newAction);
      saveOfflineQueue(queue);
      setOfflineQueueCount(queue.length);
      showToast('Penghapusan token disimpan di draft lokal (Offline).');
    }
  };

  // 5. Save Token (Instant optimistic update without refresh)
  const handleSaveToken = async (tokenNumber: string, _notes: string) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      showToast('Silakan pilih nama Anda terlebih dahulu sebelum mengisi token.');
      return;
    }
    if (!currentUpdateType || !activeTokenSite) return;
    const cleanToken = tokenNumber.trim();

    // Optimistically update immediately so the user sees the token with zero lag
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updateTypes: prev.updateTypes.map((ut) => {
          if (ut.id !== currentUpdateType.id) return ut;
          return {
            ...ut,
            sites: ut.sites.map((s) =>
              s.id === activeTokenSite.id
                ? {
                    ...s,
                    tokenNumber: cleanToken,
                    checked: cleanToken ? true : s.checked,
                  }
                : s
            ),
          };
        }),
      };
    });

    try {
      const res = await fetch(`/api/sites/${currentUpdateType.id}/${activeTokenSite.id}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenNumber: cleanToken,
          notes: '',
          updatedBy: currentUser?.name || 'Petugas',
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      showToast(cleanToken ? 'Nomor token berhasil disimpan di server!' : 'Nomor token dihapus');
    } catch (err) {
      const queue = getOfflineQueue();
      const newAction: OfflineAction = {
        id: `act_${Date.now()}_${Math.random()}`,
        type: 'token',
        typeId: currentUpdateType.id,
        siteId: activeTokenSite.id,
        payload: {
          tokenNumber: cleanToken,
          notes: '',
          updatedBy: currentUser?.name || 'Petugas',
        },
        timestamp: Date.now(),
      };
      queue.push(newAction);
      saveOfflineQueue(queue);
      setOfflineQueueCount(queue.length);
      showToast('Nomor token disimpan di draft lokal (Offline). Menunggu internet untuk sinkronisasi ke server.');
    }
  };

  // 6. Save Stamped Photo
  const handleSavePhoto = async (dataUrl: string, capturedAt: string) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      showToast('Silakan pilih nama Anda terlebih dahulu sebelum mengunggah foto.');
      return;
    }
    if (!currentUpdateType || !activeCameraSite) return;

    if (!navigator.onLine) {
      showToast('Koneksi sedang offline: Foto belum dapat diunggah. Mohon sambungkan internet.');
      return;
    }

    try {
      const res = await fetch(`/api/sites/${currentUpdateType.id}/${activeCameraSite.id}/photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl,
          capturedAt,
          uploadedBy: currentUser?.name || 'Petugas',
        }),
      });
      if (res.ok) {
        showToast('Foto dokumentasi site berhasil disimpan permanen!');
        fetchData(true);
      } else {
        throw new Error('Upload error');
      }
    } catch (err) {
      showToast('Gagal menyimpan foto ke server.');
    }
  };

  // 7. Delete Photo (Specifically Diki Solihin / Admin only)
  const handleDeletePhoto = async (photoId: string) => {
    if (!currentUpdateType || !activeGallerySite) return;

    if (!navigator.onLine) {
      showToast('Koneksi sedang offline: Tindakan ini memerlukan koneksi internet.');
      return;
    }

    try {
      const res = await fetch(
        `/api/sites/${currentUpdateType.id}/${activeGallerySite.id}/photo/${photoId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        showToast('Foto berhasil dihapus.');
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            updateTypes: prev.updateTypes.map((ut) => ({
              ...ut,
              sites: ut.sites.map((s) => {
                if (s.id !== activeGallerySite.id) return s;
                return {
                  ...s,
                  photos: (s.photos || []).filter((p) => p.id !== photoId),
                };
              }),
            })),
          };
        });
        setActiveGallerySite((prev) => {
          if (!prev) return null;
          const remaining = (prev.photos || []).filter((p) => p.id !== photoId);
          if (remaining.length === 0) {
            return null;
          }
          return {
            ...prev,
            photos: remaining,
          };
        });
        fetchData(true);
      }
    } catch (err) {
      showToast('Gagal menghapus foto');
    }
  };

  // 8. Update Period & Target Sites (Admin Only)
  const handleUpdatePeriod = async (name: string, period: string, customTotal?: number) => {
    if (currentUser?.role !== 'admin') {
      showToast('Hak akses ditolak: Hanya Admin yang dapat mengubah periode.');
      return;
    }
    const targetId = editingPeriod ? editingPeriod.id : currentUpdateType?.id;
    if (!targetId) return;

    try {
      const res = await fetch(`/api/update-types/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, period, customTotalTarget: customTotal }),
      });
      if (res.ok) {
        showToast('Kategori update & target site berhasil diperbarui');
        fetchData(true);
      }
    } catch (err) {
      showToast('Gagal memperbarui info update');
    }
  };

  // 9. Add New Site (Admin Only)
  const handleAddSite = async (
    customerId: string,
    siteCode: string,
    siteName: string,
    checked: boolean,
    tokenNumber?: string
  ) => {
    if (currentUser?.role !== 'admin') {
      showToast('Hak akses ditolak: Hanya Admin yang dapat menambah site.');
      return;
    }
    if (!currentUpdateType) return;

    try {
      const res = await fetch(`/api/sites/${currentUpdateType.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, siteCode, siteName, checked, tokenNumber }),
      });
      if (res.ok) {
        showToast(`Site ${siteCode} berhasil ditambahkan!`);
        fetchData(true);
      }
    } catch (err) {
      showToast('Gagal menambah site');
    }
  };

  // 10. Create New Update Type (Admin Only)
  const handleAddUpdateType = async (
    name: string,
    period: string,
    customTotalTarget: number,
    iconType: 'token' | 'swacam' | 'manual' | 'custom'
  ) => {
    if (currentUser?.role !== 'admin') {
      showToast('Hak akses ditolak: Hanya Admin yang dapat membuat kategori baru.');
      return;
    }
    try {
      const res = await fetch('/api/update-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, period, customTotalTarget, iconType }),
      });
      if (res.ok) {
        const json = await res.json();
        showToast(`Kategori "${name}" berhasil dibuat!`);
        await fetchData(true);
        if (json.updateType) {
          setActiveTypeId(json.updateType.id);
        }
      }
    } catch (err) {
      showToast('Gagal membuat kategori update');
    }
  };

  // 11. Delete Update Type with in-app confirmation (Admin Only)
  const handleDeleteUpdateType = (typeId: string, name: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Hak akses ditolak: Hanya Admin yang dapat menghapus kategori update.');
      return;
    }
    setUpdateTypeToDelete({ id: typeId, name });
  };

  const confirmDeleteUpdateTypeAction = async () => {
    if (!updateTypeToDelete) return;
    const { id, name } = updateTypeToDelete;
    setUpdateTypeToDelete(null);

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updateTypes: prev.updateTypes.filter((ut) => ut.id !== id),
      };
    });

    showToast(`Kategori "${name}" berhasil dihapus`);

    try {
      const res = await fetch(`/api/update-types/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchData(true);
    } catch (err) {
      showToast('Gagal menghapus kategori');
      fetchData(true);
    }
  };

  // 12. User Management
  const handleSelectUser = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('depotel_user_id', user.id);
    setCurrentView('dashboard');
    showToast(`✅ Masuk sebagai: ${user.name}`);
    fetch('/api/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, userName: user.name }),
    }).catch(() => {});
  };

  const handleRegisterUser = async (name: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role: 'user' }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.user) {
          handleSelectUser(json.user);
        }
        fetchData(true);
      }
    } catch (err) {
      showToast('Gagal mendaftar');
    }
  };

  const handleGoogleLogin = async (email: string, name: string, avatarUrl?: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, avatarUrl }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.user) {
          handleSelectUser(json.user);
        }
        fetchData(true);
      } else {
        throw new Error('Google auth failed');
      }
    } catch (err) {
      showToast('Gagal masuk dengan Google. Silakan coba lagi.');
    }
  };

  const handleAddUserAdmin = async (name: string, role: 'admin' | 'user') => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role }),
      });
      if (res.ok) {
        showToast(`Anggota ${name} berhasil ditambahkan`);
        fetchData(true);
      }
    } catch (err) {
      showToast('Gagal menambah pengguna');
    }
  };

  const handleUpdateUserRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        showToast('Role pengguna berhasil diperbarui');
        fetchData(true);
      }
    } catch (err) {
      showToast('Gagal memperbarui role');
    }
  };

  const handleUpdateUser = async (
    userId: string,
    updateData: { name?: string; role?: 'admin' | 'user'; email?: string }
  ) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        showToast('Data anggota berhasil diperbarui!');
        fetchData(true);
      } else {
        throw new Error('Update user failed');
      }
    } catch (err) {
      showToast('Gagal memperbarui data anggota');
    }
  };

  const handleInvitationActivated = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('depotel_user_id', user.id);
    setCurrentView('dashboard');
    fetchData(true);
    showToast(`🎉 Selamat datang, ${user.name}! Akun Anda telah aktif.`);
  };

  // 13. Update User Avatar / Profile Picture
  const handleUpdateUserAvatar = async (userId: string, avatarUrl: string) => {
    setCurrentUser((prev) => (prev && prev.id === userId ? { ...prev, avatarUrl } : prev));
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, avatarUrl } : u)),
      };
    });

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl }),
      });
      if (res.ok) {
        showToast(avatarUrl ? 'Foto profil berhasil diperbarui!' : 'Foto profil direset');
        fetchData(true);
      }
    } catch (err) {
      showToast('Gagal memperbarui foto profil');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Pengguna berhasil dihapus');
        fetchData(true);
      }
    } catch (err) {
      showToast('Gagal menghapus pengguna');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('depotel_user_id');
    setCurrentUser(null);
    setIsLoginModalOpen(true);
    showToast('Anda telah keluar.');
  };

  if (isLoading && !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 p-4">
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
          className="h-24 w-24 animate-bounce rounded-3xl border-2 border-slate-200 bg-white p-1.5 shadow-md"
        />
        <h2 className="mt-4 text-lg font-black text-slate-900 tracking-tight">
          DEPOTEL GROUP · MONITORING
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handlePullRefresh}>
      <div className="min-h-screen bg-slate-100/90 text-slate-900 flex justify-center font-sans antialiased">
        <div className="w-full max-w-3xl bg-slate-50 min-h-screen shadow-xl border-x border-slate-200/70 flex flex-col relative pb-24">
          {/* Top Header - Enlarged HP Screen Scale */}
          <Header
            currentUser={currentUser}
            users={data?.users || []}
            onOpenOnlineModal={() => setIsOnlineModalOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
          />

          {/* PWA Update Banner */}
          {pwaUpdateAction && (
            <div className="bg-blue-600 px-4 py-2.5 text-center text-xs sm:text-sm font-bold text-white flex items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Versi baru aplikasi DEPOTEL telah tersedia!</span>
              </div>
              <button
                type="button"
                onClick={() => pwaUpdateAction()}
                className="rounded-xl bg-white px-3 py-1.5 text-xs font-black text-blue-700 hover:bg-blue-50 active:scale-95 transition cursor-pointer"
              >
                Perbarui
              </button>
            </div>
          )}

          {/* Offline Alert & Sync Queue Notification */}
          {!isOnline && (
            <div className="bg-amber-600 px-4 py-2.5 text-center text-xs sm:text-sm font-bold text-white flex flex-wrap items-center justify-center gap-2 shadow-sm">
              <WifiOff className="h-4 w-4 flex-shrink-0 animate-pulse" />
              <span>Koneksi Offline: Membuka data lokal. Laporan baru tersimpan di antrean perangkat.</span>
              {offlineQueueCount > 0 && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  {offlineQueueCount} Draft
                </span>
              )}
            </div>
          )}

          {/* Pending Sync Queue Banner (When internet is active and drafts exist) */}
          {isOnline && offlineQueueCount > 0 && (
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-2.5 text-center text-xs sm:text-sm font-bold text-white flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2 text-left min-w-0">
                <RefreshCw className={`h-4 w-4 flex-shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="truncate">{offlineQueueCount} draft laporan siap dikirim ke server.</span>
              </div>
              <button
                type="button"
                onClick={syncOfflineQueue}
                disabled={isSyncing}
                className="rounded-xl bg-white px-3 py-1 text-xs font-black text-blue-800 hover:bg-blue-50 active:scale-95 transition cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                {isSyncing ? 'Sinkron...' : 'Kirim'}
              </button>
            </div>
          )}

          {/* Main Content Area - Enlarged Mobile Phone Scale */}
          <main className="w-full flex-1 px-4 sm:px-6 py-4 space-y-4 sm:space-y-5">
          {currentView === 'dashboard' ? (
            /* Dashboard Overview Screen */
            <div className="space-y-4">
              <DashboardOverview
                updateTypes={data?.updateTypes || []}
                currentUser={currentUser}
                onSelectUpdateType={(id) => {
                  setActiveTypeId(id);
                  setCurrentView('monitoring');
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                onOpenInviteModal={() => setIsInviteTeamModalOpen(true)}
                onOpenNewPeriodModal={() => setIsNewUpdateTypeModalOpen(true)}
                onOpenPublishModal={() => setIsPublishModalOpen(true)}
                onEditPeriod={(ut) => setEditingPeriod(ut)}
                onDeletePeriod={handleDeleteUpdateType}
              />

              {/* Registered Team Online / Offline Status widget on dashboard - Admin ONLY */}
              {currentUser?.role === 'admin' && (
                <TeamStatusDashboard
                  users={data?.users || []}
                  currentUser={currentUser}
                />
              )}
            </div>
          ) : (
            /* Monitoring Detail Checklist View matching screenshot */
            <div className="space-y-4">
              {currentUpdateType && (
                <StatsCard
                  updateType={currentUpdateType}
                  currentUser={currentUser}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onUpdateHeader={handleUpdatePeriod}
                  onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
                  onOpenAddSiteModal={() => setIsAddSiteModalOpen(true)}
                  onBackToDashboard={() => setCurrentView('dashboard')}
                />
              )}

              {/* Sites List */}
              <div className="space-y-3">
                {filteredSites.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <AlertTriangle className="mx-auto h-8 w-8 text-slate-400" />
                    <h3 className="mt-2 text-sm font-bold text-slate-800">Tidak ada site</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {searchQuery
                        ? `Tidak ada hasil untuk "${searchQuery}".`
                        : 'Belum ada data site dalam update ini.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                      className="mt-4 rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSites.map((site) => (
                      <SiteCard
                        key={site.id}
                        site={site}
                        typeId={currentUpdateType?.id || ''}
                        updateTypeName={currentUpdateType?.name || ''}
                        currentUser={currentUser}
                        onToggle={handleToggleSite}
                        onEdit={(s) => setActiveEditSite(s)}
                        onDelete={handleDeleteSite}
                        onOpenTokenNote={(s) => setActiveTokenSite(s)}
                        onClearToken={handleClearToken}
                        onOpenCamera={(s) => setActiveCameraSite(s)}
                        onOpenGallery={(s) => setActiveGallerySite(s)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav
          currentView={currentView}
          onNavigateDashboard={() => setCurrentView('dashboard')}
          onNavigateMonitoring={() => setCurrentView('monitoring')}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          hasActivePeriod={!!currentUpdateType}
          activePeriodName={currentUpdateType?.name}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 right-5 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* In-App Delete Site Confirmation Modal (Fixes iframe blocked window.confirm) */}
        {siteToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-3">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hapus Site?</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus site{' '}
                <strong className="text-slate-900">{siteToDelete.site.siteCode}</strong> (
                {siteToDelete.site.customerId})? Data site akan terhapus dari daftar ini.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSiteToDelete(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteSiteAction}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-500 active:scale-95 transition cursor-pointer"
                >
                  Ya, Hapus Site
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-App Delete Update Type Confirmation Modal */}
        {updateTypeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-3">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hapus Kategori Update?</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus kategori{' '}
                <strong className="text-slate-900">"{updateTypeToDelete.name}"</strong> beserta seluruh data di dalamnya?
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUpdateTypeToDelete(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUpdateTypeAction}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-500 active:scale-95 transition cursor-pointer"
                >
                  Ya, Hapus Kategori
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <OnlineUsersModal
          isOpen={isOnlineModalOpen}
          onClose={() => setIsOnlineModalOpen(false)}
          users={data?.users || []}
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
        />

        <AccountSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentUser={currentUser}
          users={data?.users || []}
          onAddUser={handleAddUserAdmin}
          onUpdateUserRole={handleUpdateUserRole}
          onUpdateUserAvatar={handleUpdateUserAvatar}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onLogout={handleLogout}
        />

        <InviteTeamModal
          isOpen={isInviteTeamModalOpen}
          onClose={() => setIsInviteTeamModalOpen(false)}
          registeredUsersCount={data?.users?.length || 0}
          users={data?.users || []}
          currentUserRole={currentUser?.role}
          currentUserName={currentUser?.name}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenActivationModal={() => setIsActivationModalOpen(true)}
        />

        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          registeredUsersCount={data?.users?.length || 0}
        />

        <UserLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          users={data?.users || []}
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
          onRegisterUser={handleRegisterUser}
          onGoogleLogin={handleGoogleLogin}
          onOpenActivationModal={() => setIsActivationModalOpen(true)}
        />

        <InvitationActivationModal
          isOpen={isActivationModalOpen}
          onClose={() => setIsActivationModalOpen(false)}
          initialToken={activationToken}
          initialCode={activationCode}
          onActivated={handleInvitationActivated}
        />

        {currentUpdateType && (
          <WhatsAppModal
            isOpen={isWhatsAppModalOpen}
            onClose={() => setIsWhatsAppModalOpen(false)}
            updateType={currentUpdateType}
          />
        )}

        <EditSiteModal
          isOpen={!!activeEditSite}
          onClose={() => setActiveEditSite(null)}
          site={activeEditSite}
          onSave={handleSaveEditSite}
        />

        <EditPeriodModal
          isOpen={!!editingPeriod}
          onClose={() => setEditingPeriod(null)}
          updateType={editingPeriod}
          onSave={handleUpdatePeriod}
        />

        <TokenNoteModal
          isOpen={!!activeTokenSite}
          onClose={() => setActiveTokenSite(null)}
          site={activeTokenSite}
          onSave={handleSaveToken}
        />

        <CameraCaptureModal
          isOpen={!!activeCameraSite}
          onClose={() => setActiveCameraSite(null)}
          site={activeCameraSite}
          currentUser={currentUser}
          onSavePhoto={handleSavePhoto}
        />

        <PhotoGalleryModal
          isOpen={!!activeGallerySite}
          onClose={() => setActiveGallerySite(null)}
          site={activeGallerySite}
          currentUser={currentUser}
          onDeletePhoto={handleDeletePhoto}
          onRetakePhoto={(site) => {
            setActiveGallerySite(null);
            setActiveCameraSite(site);
          }}
        />

        {currentUpdateType && (
          <AddSiteModal
            isOpen={isAddSiteModalOpen}
            onClose={() => setIsAddSiteModalOpen(false)}
            updateTypeName={currentUpdateType.name}
            onAddSite={handleAddSite}
          />
        )}

        <NewUpdateTypeModal
          isOpen={isNewUpdateTypeModalOpen}
          onClose={() => setIsNewUpdateTypeModalOpen(false)}
          onAddUpdateType={handleAddUpdateType}
        />
        </div>
      </div>
    </PullToRefresh>
  );
}
