export type UserRole = 'admin' | 'user';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface TeamInvitation {
  id: string;
  token: string;          // Cryptographically secure token for URL activation
  code: string;           // 6-digit alphanumeric code for manual activation (e.g. DEP-849201)
  name: string;           // Full name of invitee
  email: string;          // Target email
  role: UserRole;         // 'admin' (Admin) or 'user' (Karyawan)
  status: InvitationStatus;
  invitedBy: string;      // Admin's name
  createdAt: number;      // Timestamp ms
  expiresAt: number;      // Timestamp ms (48 hours validity)
  acceptedAt?: number;
  acceptedUserId?: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email?: string; // Gmail address
  avatarColor?: string;
  avatarUrl?: string; // Custom profile image / logo
  lastActive: number; // Unix timestamp ms
  isOnline?: boolean;
}

export interface PhotoRecord {
  id: string;
  siteId: string;
  siteCode: string;
  siteName: string;
  customerId: string;
  dataUrl: string; // Base64 or URL
  capturedAt: string; // Formatted date string
  timestamp: number;
  uploadedBy: string;
}

export interface SiteItem {
  id: string;
  customerId: string; // No. ID Pelanggan / Meter
  siteCode: string;   // Site ID (e.g. EPE134, JKT763)
  siteName: string;   // Nama Site
  checked: boolean;   // Sudah Tercentang (true) / Belum (false)
  tokenNumber?: string; // No Token (e.g. 1234-5678-9012-3456-7890)
  notes?: string;
  updatedBy?: string;
  updatedAt?: string;
  photos: PhotoRecord[];
}

export interface UpdateType {
  id: string;
  name: string; // e.g. "Pengisian Token Listrik - DEPOTEL"
  period: string; // e.g. "Bulan September 2026"
  customTotalTarget?: number; // editable target count if manually set
  iconType: 'token' | 'swacam' | 'manual' | 'custom';
  sites: SiteItem[];
  createdAt: number;
}

export interface DatabaseSchema {
  updateTypes: UpdateType[];
  users: AppUser[];
  invitations?: TeamInvitation[];
  activeTypeId: string;
  version: number;
}
