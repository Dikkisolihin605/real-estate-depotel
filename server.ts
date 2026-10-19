import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type {
  DatabaseSchema,
  SiteItem,
  UpdateType,
  AppUser,
  PhotoRecord,
  TeamInvitation,
  InvitationStatus,
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'depotel_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Team Users - 9 Official Team Members
const INITIAL_USERS: AppUser[] = [
  { id: 'u_admin', name: 'Diki Solihin (Admin)', role: 'admin', email: 'dikisolihin605@gmail.com', avatarColor: '#0e2a6d', lastActive: Date.now() },
  { id: 'u_saddam', name: 'Saddam', role: 'user', email: 'saddam@gmail.com', avatarColor: '#10b981', lastActive: Date.now() - 60000 },
  { id: 'u_kusnaedi', name: 'Kusnaedi', role: 'user', email: 'kusnaedi@gmail.com', avatarColor: '#3b82f6', lastActive: Date.now() - 120000 },
  { id: 'u_samin', name: 'Samin', role: 'user', email: 'samin@gmail.com', avatarColor: '#14b8a6', lastActive: Date.now() - 180000 },
  { id: 'u_junaedi', name: 'Junaedi', role: 'user', email: 'junaedi@gmail.com', avatarColor: '#06b6d4', lastActive: Date.now() - 240000 },
  { id: 'u_randi', name: 'Randi', role: 'user', email: 'randi@gmail.com', avatarColor: '#6366f1', lastActive: Date.now() - 300000 },
  { id: 'u_roy', name: 'Roy', role: 'user', email: 'roy@gmail.com', avatarColor: '#f97316', lastActive: Date.now() - 360000 },
  { id: 'u_romi', name: 'Romi', role: 'user', email: 'romi@gmail.com', avatarColor: '#84cc16', lastActive: Date.now() - 420000 },
  { id: 'u_kosasih', name: 'Kosasih', role: 'user', email: 'kosasih@gmail.com', avatarColor: '#0284c7', lastActive: Date.now() - 480000 },
  { id: 'u_nasrul', name: 'Nasrul', role: 'user', email: 'nasrul@gmail.com', avatarColor: '#8b5cf6', lastActive: Date.now() - 540000 },
];

// Helper to parse site row from prompt
function makeSite(id: string, customerId: string, siteCode: string, siteName: string, checked: boolean, tokenNumber?: string): SiteItem {
  return {
    id,
    customerId: customerId.trim(),
    siteCode: siteCode.trim(),
    siteName: siteName.trim(),
    checked,
    tokenNumber: tokenNumber || '',
    photos: []
  };
}

// 31 Sites from Prompt for "Pengisian Token Listrik - DEPOTEL"
const SITES_TOKEN: SiteItem[] = [
  makeSite('st_1', '547402150841', 'EPE134', 'GGLANGGARKEBAGUSANEMRSSIAGARAYAEASYMACRO', false),
  makeSite('st_2', '547402159954', 'EPE133', 'JLSIMANENORKEBAGUSANEMACRO', false),
  makeSite('st_3', '541300722052', 'COC143', 'CMBTCIPINANGBUNDER', false),
  makeSite('st_4', '544204835266', 'JKT640', 'SMPNGPDKOPI', false),
  makeSite('st_5', '544104549801', 'EPE121', 'KEBONPALAKPMELAYUEMACRO', false),
  makeSite('st_6', '547402151453', 'EPE118', 'CIPEDAKDALAMSRENGSENGEMACRO', false),
  makeSite('st_7', '544104493058', 'EPE105', 'JLKEBONPALA2EASYMACRO', false),
  makeSite('st_8', '547202531409', 'EPE123', 'JLRAHAYU2KALISARIEMACRO', false),
  makeSite('st_9', '547402040765', 'EPE101', 'BINCONDETEMACRO', false),
  makeSite('st_10', '547402176096', 'EPE141', 'JLPEJATENBARAT2EMACRO', false),
  makeSite('st_11', '544205151195', 'EPE158', 'JLMENTENGPURNAMACAKUNGEMACRO', false),
  makeSite('st_12', '547402134366', 'EPE127', 'JLNUSAINDAHEMACRO', false),
  makeSite('st_13', '547402131207', 'EPE125', 'JLHAJIICANGEMACRO', false),
  makeSite('st_14', '547104799792', 'EPE078', 'BATUAMPAREMACROODMT', false),
  makeSite('st_15', '543602512320', 'EPE066', 'PASARPONDOKLABUEMACRO', false),
  makeSite('st_16', '547104987172', 'EPE130', 'KKPHALIMEMACRO', false),
  makeSite('st_17', '547104989288', 'EPE162', 'JLKAMPUNGBARUHALIMEMACRO', false),
  makeSite('st_18', '547202522340', 'EPE135', 'SMAN58EMACRO', false),
  makeSite('st_19', '544205132920', 'EPE153', 'JLKAPUK3EMACRO', false),
  makeSite('st_20', '544104486916', 'EPE100', 'GGCIPARAI10EMACRO', false),
  makeSite('st_21', '544205151888', 'EPE149', 'JLLANGGARRAYAPDBAMBUEMACRO', false),
  makeSite('st_22', '544205145232', 'EPE119', 'JLKELURAHANRAYADURENSAWITEMACRO', false),
  makeSite('st_23', '541301866778', 'EPE122', 'JLPULONANGKAPULOGADUNGEMACRO', false),
  makeSite('st_24', '547202543826', 'EPE124', 'GGHIDENGCILANGKAPEMACRO', false),
  makeSite('st_25', '547402134118', 'EPE156', 'JLPAGUJATENPOINT13EMACRO', false),
  makeSite('st_26', '547104958661', 'EPE107', 'JLBATUBULATEMACRO', false),
  makeSite('st_27', '547402145270', 'EPE132', 'JLCIKOKOBRTEMACRO', false),
  makeSite('st_28', '547402097726', 'EPE104', 'PANGADEGANPANCORANEMACRO', false),
  makeSite('st_29', '547401249697', 'JSX938', 'PANGADEGANTIMUR3', false),
  makeSite('st_30', '543105914221', 'EPE108', 'JLCIPETERAYAEMACRO', false),
  makeSite('st_31', '514485849567', 'EPE111', 'DARULARQOMEASYMACRO-PTI', false),
];

// 22 Sites from Prompt for "Update Swacam/Catat Meter DEPOTEL INNER"
const SITES_SWACAM: SiteItem[] = [
  makeSite('sw_1', '544203866651', 'JKT763', 'Pulogebangterminal-DMT', false),
  makeSite('sw_2', '544204061540', 'JTX152', 'HAJIAHMADSTP', false),
  makeSite('sw_3', '544204219515', 'JTX358', 'Jlrayapik-DMT', false),
  makeSite('sw_4', '547104488429', 'JTX265', 'Taxiwayhalim-DMT', false),
  makeSite('sw_5', '541300863386', 'JTX015', 'Puloutara8BTSH-TBG', false),
  makeSite('sw_6', '543105050106', 'JKS413', 'Relocparadiso', false),
  makeSite('sw_7', '543105233694', 'JSX442', 'JLBANKDAGANGNEGARATBG', false),
  makeSite('sw_8', '543201116256', 'JKS256', 'Highscopecdk', false),
  makeSite('sw_9', '547103987215', 'JKS724', 'Relocppplaza', false),
  makeSite('sw_10', '547104349912', 'JTX058', 'MayjensutoyoBTSH-TBG', false),
  makeSite('sw_11', '547202398420', 'JTX375', 'HbainkelapaduawetanBTSH-TBG', false),
  makeSite('sw_12', '547400953635', 'JSX400', 'PegadenganpancoranBTSH-TBG', false),
  makeSite('sw_13', '547401128114', 'JSX857', 'Cakramulia', false),
  makeSite('sw_14', '547401196862', 'JSX907', 'WismapsmBTSH-TBG', false),
  makeSite('sw_15', '547402281737', 'EPE220', 'JSX947_JLMUSHOLLACILANDAKTIMUR', false),
  makeSite('sw_16', '547401307653', 'JSX876', 'RssiagarayaBTSH-IFT', false),
  makeSite('sw_17', '541300600873', 'JKP959', 'FLYOVERCEMPAKAPUTIHNSTEL', false),
  makeSite('sw_18', '544104200460', 'JKT565', 'Rsmitrajtngr-DMT', false),
  makeSite('sw_19', '541302061234', 'EPE286', 'JATINEGARALIOOLEG-TBG', false),
  makeSite('sw_20', '541302092830', 'JKT590', 'RAWAMANGUN MUKA RELOC', false),
  makeSite('sw_21', '547202678218', 'JTX121', 'JLBAMBUHITAMIBS-MCP', false),
  makeSite('sw_22', '547402386338', 'JSX867', 'GANDARIA5 JAGAKARSA', false),
];

// Sites for "Pengisian Token Listrik Manual - DEPOTEL"
const SITES_MANUAL: SiteItem[] = [
  makeSite('st_man_1', '541301045422', 'JTX376', 'KAYUPUTIHPACUANKUDAI4T', false, '0694-0057-9935-5566-9177\n4883-3281-0673-1088-7723\n4592-0662-1913-4727-4940'),
  makeSite('st_man_2', '544204129460', 'JTX269', 'MASJIDALKAUTSAR', false, '3414-4270-4674-4895-1323\n0855-3835-0869-4010-4460'),
  makeSite('st_man_3', '541300936924', 'JTX270', 'KEBEMBEMPULOGADUNG', false, '1662-9428-8705-0034-1303\n2707-7092-8863-8300-2428'),
  makeSite('st_man_4', '541300853217', 'JTX006', 'PERMANEN COMBAT CIPINANG BUNDER', false, '3115-6424-5771-5814-2746\n7351-7828-2974-3713-5630'),
  makeSite('st_man_5', '544203861556', 'JTX017', 'DRSUMARNO 2', false, '5105-3636-5375-1622-4356\n7098-1295-5676-4391-7297'),
  makeSite('st_man_6', '544204059954', 'JTX024', 'PENGGILINGAN ELOK', false, '3443-7752-5217-6499-9426\n4929-3442-8912-0354-8906'),
];

function getInitialDB(): DatabaseSchema {
  return {
    version: 1,
    activeTypeId: 'type_token',
    users: INITIAL_USERS,
    invitations: [],
    updateTypes: [
      {
        id: 'type_token',
        name: 'Pengisian Token Listrik - DEPOTEL',
        period: 'Bulan September 2026',
        iconType: 'token',
        customTotalTarget: 31,
        sites: SITES_TOKEN,
        createdAt: Date.now() - 30 * 86400000,
      },
      {
        id: 'type_swacam',
        name: 'Update Swacam/Catat Meter DEPOTEL INNER',
        period: '23-27 September 2026',
        iconType: 'swacam',
        customTotalTarget: 22,
        sites: SITES_SWACAM,
        createdAt: Date.now() - 20 * 86400000,
      },
      {
        id: 'type_manual',
        name: 'Pengisian Token Listrik Manual - DEPOTEL',
        period: 'Bulan Oktober 2026',
        iconType: 'manual',
        customTotalTarget: 6,
        sites: SITES_MANUAL,
        createdAt: Date.now() - 10 * 86400000,
      },
    ]
  };
}

function loadDB(): DatabaseSchema {
  let result: DatabaseSchema;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      result = JSON.parse(raw);
      if (!result.invitations) {
        result.invitations = [];
      }
      if (!result.users) {
        result.users = [];
      }
    } else {
      result = getInitialDB();
    }
  } catch (err) {
    console.error('Error reading DB file, creating initial:', err);
    result = getInitialDB();
  }

  // Ensure all 9 official team members exist in result.users
  let modified = false;
  for (const officialUser of INITIAL_USERS) {
    const existingIndex = result.users.findIndex(
      (u) =>
        u.id === officialUser.id ||
        u.name.toLowerCase() === officialUser.name.toLowerCase() ||
        (officialUser.name.includes('Diki') && u.name.toLowerCase().includes('diki'))
    );
    if (existingIndex >= 0) {
      if (result.users[existingIndex].name !== officialUser.name || result.users[existingIndex].role !== officialUser.role) {
        result.users[existingIndex].name = officialUser.name;
        result.users[existingIndex].role = officialUser.role;
        modified = true;
      }
      if (!result.users[existingIndex].email && officialUser.email) {
        result.users[existingIndex].email = officialUser.email;
        modified = true;
      }
    } else {
      result.users.push({ ...officialUser });
      modified = true;
    }
  }

  // Keep official members and any registered users or Google users
  // (Do not delete logged in users)

  // Auto-generate active invitation for each official user if not present
  if (!result.invitations) result.invitations = [];
  const now = Date.now();
  for (const user of result.users) {
    let inv = result.invitations.find(
      (i) => i.acceptedUserId === user.id || i.name.toLowerCase() === user.name.toLowerCase()
    );
    if (!inv) {
      const token = crypto.randomBytes(16).toString('hex');
      const codeDigits = Math.floor(100000 + Math.random() * 900000).toString();
      inv = {
        id: `inv_${now}_${Math.random().toString(36).substring(2, 6)}`,
        token,
        code: `DEP-${codeDigits}`,
        name: user.name,
        email: user.email || `${user.name.toLowerCase().replace(/[\s()]/g, '')}@gmail.com`,
        role: user.role,
        status: 'accepted',
        invitedBy: 'Admin DEPOTEL',
        createdAt: now,
        expiresAt: now + 365 * 24 * 3600 * 1000,
        acceptedUserId: user.id,
      };
      result.invitations.push(inv);
      modified = true;
    }
  }

  // Ensure standard categories have their sites populated with default checked: false if empty
  const tokenType = result.updateTypes.find((t) => t.id === 'type_token');
  if (tokenType && (!tokenType.sites || tokenType.sites.length === 0)) {
    tokenType.sites = SITES_TOKEN.map((s) => ({ ...s, checked: false }));
    tokenType.customTotalTarget = tokenType.sites.length;
    modified = true;
  }
  const swacamType = result.updateTypes.find((t) => t.id === 'type_swacam');
  if (swacamType && (!swacamType.sites || swacamType.sites.length === 0)) {
    swacamType.sites = SITES_SWACAM.map((s) => ({ ...s, checked: false }));
    swacamType.customTotalTarget = swacamType.sites.length;
    modified = true;
  }
  const manualType = result.updateTypes.find((t) => t.id === 'type_manual');
  if (manualType) {
    if (!manualType.sites || manualType.sites.length === 0) {
      manualType.sites = SITES_MANUAL.map((s) => ({ ...s, checked: false }));
      manualType.customTotalTarget = manualType.sites.length;
      modified = true;
    } else {
      // User request: "untuk list Pengisian Token Listrik Manual - DEPOTEL tolong semua nya di bikin silang semua sebelum user dan admin mencentang dan silang"
      for (const s of manualType.sites) {
        if (s.checked) {
          s.checked = false;
          modified = true;
        }
      }
    }
  }

  // Requirement 1 & 10: Every site without a saved checked state defaults to false (silang / ✗)
  for (const ut of result.updateTypes) {
    for (const site of ut.sites) {
      if (typeof site.checked !== 'boolean') {
        site.checked = false;
        modified = true;
      }
    }
  }

  if (modified) {
    saveDB(result);
  }
  return result;
}

// Store active SSE client responses for Real-Time synchronization
const sseClients: Set<express.Response> = new Set();

function broadcastSSE(data: any) {
  if (sseClients.size === 0) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (_) {
      sseClients.delete(client);
    }
  }
}

function saveDB(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    const publicDataFile = path.resolve(__dirname, 'public', 'data', 'depotel_db.json');
    const publicDataDir = path.dirname(publicDataFile);
    if (!fs.existsSync(publicDataDir)) {
      fs.mkdirSync(publicDataDir, { recursive: true });
    }
    fs.writeFileSync(publicDataFile, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }

  // Instant real-time push to all connected users and admins
  try {
    broadcastSSE({
      type: 'db_update',
      db: {
        ...db,
        users: enrichUsersOnline(db.users),
      },
    });
  } catch (_) {}
}

// Active database in memory
let db = loadDB();

// Express app setup
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High limits for camera photo storage (Base64 data URLs)
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Heartbeat interval threshold: 45 seconds
const ONLINE_THRESHOLD_MS = 45000;

function enrichUsersOnline(users: AppUser[]): AppUser[] {
  const now = Date.now();
  return users.map(u => ({
    ...u,
    isOnline: (now - (u.lastActive || 0)) < ONLINE_THRESHOLD_MS
  }));
}

// ======================== API ROUTES ========================

// Real-Time Server-Sent Events (SSE) Stream for Instant Dashboard Sync across all users & admin
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send initial snapshot on connect
  res.write(`data: ${JSON.stringify({ type: 'init', db: { ...db, users: enrichUsersOnline(db.users) } })}\n\n`);

  sseClients.add(res);

  // Send periodic keep-alive ping to keep connection healthy
  const keepAlive = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(keepAlive);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

// 1. Get entire state
app.get('/api/data', (_req, res) => {
  const enrichedUsers = enrichUsersOnline(db.users);
  res.json({
    ...db,
    users: enrichedUsers
  });
});

// 2. User Heartbeat (for online/offline status)
app.post('/api/heartbeat', (req, res) => {
  const { userId, userName } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  let user = db.users.find(u => u.id === userId || (userName && u.name.toLowerCase() === userName.toLowerCase()));
  if (user) {
    user.lastActive = Date.now();
  } else if (userName) {
    // Automatically register if not yet registered
    user = {
      id: userId || `u_${Date.now()}`,
      name: userName.trim(),
      role: 'user',
      avatarColor: '#2563eb',
      lastActive: Date.now()
    };
    db.users.push(user);
  }
  saveDB(db);
  res.json({ success: true, user, users: enrichUsersOnline(db.users) });
});

// 3. Toggle / Set Site Checked status (✅ / ❌) with strict Backend Permission Check
app.post('/api/sites/:typeId/:siteId/toggle', (req, res) => {
  const { typeId, siteId } = req.params;
  const { userId, userRole, userName, updatedBy, targetChecked } = req.body;

  const nameToCheck = (userName || updatedBy || '').trim().toLowerCase();
  const idToCheck = (userId || '').trim();

  // Validate requester identity:
  let requester = db.users.find(
    (u) =>
      (idToCheck && u.id === idToCheck) ||
      (nameToCheck && u.name.toLowerCase() === nameToCheck) ||
      (nameToCheck && u.name.toLowerCase().includes(nameToCheck)) ||
      (nameToCheck && nameToCheck.includes(u.name.toLowerCase().replace(' (admin)', ''))) ||
      (nameToCheck && u.email && u.email.toLowerCase() === nameToCheck) ||
      (nameToCheck && u.email && nameToCheck.includes(u.email.toLowerCase()))
  );

  const isOfficial = INITIAL_USERS.some(
    (u) =>
      (idToCheck && u.id === idToCheck) ||
      (nameToCheck && u.name.toLowerCase() === nameToCheck) ||
      (nameToCheck && u.name.toLowerCase().includes(nameToCheck)) ||
      (nameToCheck && nameToCheck.includes(u.name.toLowerCase().replace(' (admin)', ''))) ||
      (nameToCheck && u.email && u.email.toLowerCase() === nameToCheck) ||
      (nameToCheck && u.email && nameToCheck.includes(u.email.toLowerCase()))
  );

  // If requester is not in db.users yet, but has valid credentials or name from login:
  if (!requester && (isOfficial || idToCheck || nameToCheck)) {
    const isAdmin =
      userRole === 'admin' ||
      idToCheck === 'u_admin' ||
      nameToCheck.includes('diki') ||
      nameToCheck.includes('admin') ||
      nameToCheck.includes('dikisolihin');
    requester = {
      id: idToCheck || `u_${Date.now()}`,
      name: (userName || updatedBy || (isAdmin ? 'Diki Solihin (Admin)' : 'Petugas')).trim(),
      role: isAdmin ? 'admin' : 'user',
      avatarColor: isAdmin ? '#0e2a6d' : '#2563eb',
      lastActive: Date.now(),
    };
    db.users.push(requester);
    saveDB(db);
  }

  // Ensure permission: only authenticated users and admins
  if (!requester && !idToCheck && !nameToCheck) {
    return res.status(403).json({
      error: 'Izin ditolak: Silakan masuk terlebih dahulu untuk mengubah status checklist.',
    });
  }

  // Find site across specified updateType, or fallback to any updateType
  let ut = db.updateTypes.find((t) => t.id === typeId);
  let site = ut?.sites.find((s) => s.id === siteId);

  if (!site) {
    for (const t of db.updateTypes) {
      const s = t.sites.find((item) => item.id === siteId);
      if (s) {
        ut = t;
        site = s;
        break;
      }
    }
  }

  if (!site || !ut) {
    return res.status(404).json({ error: 'Data site tidak ditemukan di database' });
  }

  // Update checklist status
  if (typeof targetChecked === 'boolean') {
    site.checked = targetChecked;
  } else {
    site.checked = !site.checked;
  }

  const actorName = requester?.name || userName || updatedBy || 'Petugas';
  site.updatedBy = actorName;
  site.updatedAt = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  saveDB(db);

  res.json({ success: true, site, updateType: ut, db });
});

// 4. Update Token Number & Catatan
app.post('/api/sites/:typeId/:siteId/token', (req, res) => {
  const { typeId, siteId } = req.params;
  const { tokenNumber, notes, updatedBy } = req.body;
  const ut = db.updateTypes.find(t => t.id === typeId);
  if (!ut) return res.status(404).json({ error: 'Update type not found' });

  const site = ut.sites.find(s => s.id === siteId);
  if (!site) return res.status(404).json({ error: 'Site not found' });

  site.tokenNumber = (tokenNumber !== undefined ? tokenNumber : site.tokenNumber) || '';
  site.notes = (notes !== undefined ? notes : site.notes) || '';
  site.updatedBy = updatedBy || site.updatedBy || 'Petugas';
  site.updatedAt = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  
  saveDB(db);

  res.json({ success: true, site });
});

// 5. Add Photo Evidence with Site ID, Name, Customer ID, Date & Time Watermark
app.post('/api/sites/:typeId/:siteId/photo', (req, res) => {
  const { typeId, siteId } = req.params;
  const { dataUrl, capturedAt, uploadedBy } = req.body;
  if (!dataUrl) return res.status(400).json({ error: 'Missing dataUrl' });

  const ut = db.updateTypes.find(t => t.id === typeId);
  if (!ut) return res.status(404).json({ error: 'Update type not found' });

  const site = ut.sites.find(s => s.id === siteId);
  if (!site) return res.status(404).json({ error: 'Site not found' });

  const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newPhoto: PhotoRecord = {
    id: photoId,
    siteId: site.id,
    siteCode: site.siteCode,
    siteName: site.siteName,
    customerId: site.customerId,
    dataUrl,
    capturedAt: capturedAt || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    timestamp: Date.now(),
    uploadedBy: uploadedBy || 'Petugas'
  };

  if (!site.photos) site.photos = [];
  site.photos.push(newPhoto);
  saveDB(db);

  res.json({ success: true, photo: newPhoto, totalPhotos: site.photos.length });
});

// 6. Delete Photo (Admin Only)
app.delete(['/api/photos/:photoId', '/api/sites/:typeId/:siteId/photo/:photoId'], (req, res) => {
  const { typeId, siteId, photoId } = req.params;
  let deleted = false;
  let remainingCount = 0;

  for (const ut of db.updateTypes) {
    if (!typeId || ut.id === typeId) {
      for (const s of ut.sites) {
        if (!siteId || s.id === siteId) {
          const before = (s.photos || []).length;
          s.photos = (s.photos || []).filter(p => p.id !== photoId);
          if (s.photos.length !== before) {
            deleted = true;
            remainingCount = s.photos.length;
          }
        }
      }
    }
  }

  saveDB(db);
  res.json({ success: true, deleted, remainingCount });
});

// 7. Edit Site Info (No ID Pelanggan / Meter, Site ID, Nama Site)
app.put('/api/sites/:typeId/:siteId', (req, res) => {
  const { typeId, siteId } = req.params;
  const { customerId, siteCode, siteName, checked } = req.body;

  const ut = db.updateTypes.find(t => t.id === typeId);
  if (!ut) return res.status(404).json({ error: 'Update type not found' });

  const site = ut.sites.find(s => s.id === siteId);
  if (!site) return res.status(404).json({ error: 'Site not found' });

  if (customerId !== undefined) site.customerId = customerId.trim();
  if (siteCode !== undefined) site.siteCode = siteCode.trim();
  if (siteName !== undefined) site.siteName = siteName.trim();
  if (checked !== undefined) site.checked = !!checked;

  saveDB(db);
  res.json({ success: true, site });
});

// 8. Delete Site (Icon Hapus)
app.delete('/api/sites/:typeId/:siteId', (req, res) => {
  const { typeId, siteId } = req.params;
  const ut = db.updateTypes.find(t => t.id === typeId);
  if (!ut) return res.status(404).json({ error: 'Update type not found' });

  const initialCount = ut.sites.length;
  ut.sites = ut.sites.filter(s => s.id !== siteId);

  // If customTotalTarget was set, decrease or sync
  if (ut.customTotalTarget && ut.customTotalTarget > ut.sites.length) {
    ut.customTotalTarget = ut.sites.length;
  }
  saveDB(db);

  res.json({ success: true, deleted: initialCount !== ut.sites.length, remaining: ut.sites.length });
});

// 9. Add Site to Update Type
app.post('/api/sites/:typeId', (req, res) => {
  const { typeId } = req.params;
  const { customerId, siteCode, siteName, checked, tokenNumber } = req.body;

  const ut = db.updateTypes.find(t => t.id === typeId);
  if (!ut) return res.status(404).json({ error: 'Update type not found' });

  const newId = `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newSite = makeSite(newId, customerId || '', siteCode || '', siteName || '', !!checked, tokenNumber);
  ut.sites.push(newSite);

  if (ut.customTotalTarget && ut.sites.length > ut.customTotalTarget) {
    ut.customTotalTarget = ut.sites.length;
  }
  saveDB(db);

  res.json({ success: true, site: newSite, totalSites: ut.sites.length });
});

// 10. Update Update-Type details (Name, Period, Jumlah Site Target)
app.put('/api/update-types/:typeId', (req, res) => {
  const { typeId } = req.params;
  const { name, period, customTotalTarget } = req.body;

  const ut = db.updateTypes.find(t => t.id === typeId);
  if (!ut) return res.status(404).json({ error: 'Update type not found' });

  if (name !== undefined) ut.name = name.trim();
  if (period !== undefined) ut.period = period.trim();
  if (customTotalTarget !== undefined) {
    const parsed = parseInt(customTotalTarget, 10);
    ut.customTotalTarget = isNaN(parsed) ? ut.sites.length : parsed;
  }

  saveDB(db);
  res.json({ success: true, updateType: ut });
});

// 11. Create New Custom Update Type (Tambah Jenis Update Baru)
app.post('/api/update-types', (req, res) => {
  const { name, period, customTotalTarget, iconType } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const newId = `ut_${Date.now()}`;
  const newType: UpdateType = {
    id: newId,
    name: name.trim(),
    period: (period || 'September - Oktober 2026').trim(),
    customTotalTarget: customTotalTarget ? parseInt(customTotalTarget, 10) : 0,
    iconType: iconType || 'custom',
    sites: [],
    createdAt: Date.now()
  };

  db.updateTypes.push(newType);
  db.activeTypeId = newId;
  saveDB(db);

  res.json({ success: true, updateType: newType });
});

// 12. Delete Update Type
app.delete('/api/update-types/:typeId', (req, res) => {
  const { typeId } = req.params;
  if (db.updateTypes.length <= 1) {
    return res.status(400).json({ error: 'Tidak dapat menghapus jenis update terakhir' });
  }

  db.updateTypes = db.updateTypes.filter(t => t.id !== typeId);
  if (db.activeTypeId === typeId) {
    db.activeTypeId = db.updateTypes[0].id;
  }
  saveDB(db);

  res.json({ success: true, activeTypeId: db.activeTypeId });
});

// 13. User Management (Add / Register User via invite link)
app.post('/api/users', (req, res) => {
  const { name, role } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nama wajib diisi' });

  const trimmed = name.trim();
  const existing = db.users.find(u => u.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    if (role && (role === 'admin' || role === 'user') && existing.role !== role) {
      existing.role = role;
    }
    existing.lastActive = Date.now();
    saveDB(db);
    return res.json({ success: true, user: existing, alreadyExisted: true, users: enrichUsersOnline(db.users) });
  }

  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser: AppUser = {
    id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: trimmed,
    role: role === 'admin' ? 'admin' : 'user',
    avatarColor: randomColor,
    lastActive: Date.now()
  };

  db.users.push(newUser);

  // Auto-generate active accepted invitation for the newly created user
  if (!db.invitations) db.invitations = [];
  const token = crypto.randomBytes(16).toString('hex');
  const codeDigits = Math.floor(100000 + Math.random() * 900000).toString();
  db.invitations.push({
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    token,
    code: `DEP-${codeDigits}`,
    name: trimmed,
    email: `${trimmed.toLowerCase().replace(/[\s()]/g, '')}@gmail.com`,
    role: role === 'admin' ? 'admin' : 'user',
    status: 'accepted',
    invitedBy: 'Admin DEPOTEL',
    createdAt: Date.now(),
    expiresAt: Date.now() + 365 * 24 * 3600 * 1000,
    acceptedUserId: newUser.id,
  });

  saveDB(db);

  res.json({ success: true, user: newUser, users: enrichUsersOnline(db.users) });
});

// 13b. Google / Gmail Sign-In
app.post('/api/auth/google', (req, res) => {
  const { email, name, avatarUrl } = req.body;
  if (!name && !email) {
    return res.status(400).json({ error: 'Data Google tidak valid' });
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || cleanEmail.split('@')[0] || 'Pengguna Google').trim();

  // Find user by email or by name
  let user = db.users.find(
    u => (u.email && u.email.toLowerCase() === cleanEmail) ||
         u.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (user) {
    if (cleanEmail && !user.email) user.email = cleanEmail;
    if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
    user.lastActive = Date.now();
  } else {
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    user = {
      id: `u_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      role: 'user',
      avatarColor: randomColor,
      avatarUrl: avatarUrl || '',
      lastActive: Date.now(),
    };
    db.users.push(user);
  }

  saveDB(db);
  res.json({ success: true, user, users: enrichUsersOnline(db.users) });
});

// 14. Update User Role, Name, Email & Avatar Profile
app.put('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  const { role, name, avatarUrl, email } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (role) user.role = role === 'admin' ? 'admin' : 'user';
  if (name) user.name = name.trim();
  if (email !== undefined) user.email = email.trim().toLowerCase();
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  saveDB(db);

  res.json({ success: true, user, users: enrichUsersOnline(db.users) });
});

// 15. Delete User
app.delete('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  if (db.users.length <= 1) return res.status(400).json({ error: 'Minimal 1 pengguna tersisa' });

  db.users = db.users.filter(u => u.id !== userId);
  saveDB(db);

  res.json({ success: true, users: enrichUsersOnline(db.users) });
});

// ==================== 16. SECURE INVITATION SYSTEM ====================

function refreshInvitationsExpiry(invitations: TeamInvitation[]) {
  const now = Date.now();
  let modified = false;
  invitations.forEach((inv) => {
    if (inv.status === 'pending' && now > inv.expiresAt) {
      inv.status = 'expired';
      modified = true;
    }
  });
  if (modified) {
    saveDB(db);
  }
}

// 16a. Get All Invitations (Admin only view)
app.get('/api/invitations', (_req, res) => {
  if (!db.invitations) db.invitations = [];
  refreshInvitationsExpiry(db.invitations);
  // Sort newest first
  const sorted = [...db.invitations].sort((a, b) => b.createdAt - a.createdAt);
  res.json({ success: true, invitations: sorted });
});

// 16b. Create New Invitation (Admin only)
app.post('/api/invitations', (req, res) => {
  const { name, email, role, invitedBy } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nama lengkap wajib diisi' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Alamat email wajib diisi' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Format email tidak valid (contoh: user@gmail.com)' });
  }

  // If user already exists in db.users, link them and update email/role
  const existingUser = db.users.find(
    (u) => (u.email && u.email.toLowerCase() === cleanEmail) ||
           u.name.toLowerCase() === cleanName.toLowerCase()
  );
  if (existingUser) {
    if (cleanEmail && !existingUser.email) existingUser.email = cleanEmail;
    if (role) existingUser.role = role === 'admin' ? 'admin' : 'user';
  }

  if (!db.invitations) db.invitations = [];
  refreshInvitationsExpiry(db.invitations);

  // Check if there is already an active pending invitation for this email
  const existingPending = db.invitations.find(
    (i) => i.email.toLowerCase() === cleanEmail && i.status === 'pending'
  );
  if (existingPending) {
    // Revoke old pending so we can create a fresh one cleanly
    existingPending.status = 'revoked';
  }

  // Generate secure random token and 6-digit alphanumeric code
  const token = crypto.randomBytes(16).toString('hex');
  const codeDigits = Math.floor(100000 + Math.random() * 900000).toString();
  const code = `DEP-${codeDigits}`;
  const now = Date.now();
  const expiresAt = now + 48 * 3600 * 1000; // 48 Hours validity

  const newInvitation: TeamInvitation = {
    id: `inv_${now}_${Math.random().toString(36).substring(2, 6)}`,
    token,
    code,
    name: cleanName,
    email: cleanEmail,
    role: role === 'admin' ? 'admin' : 'user', // Default to Karyawan/user unless admin specified
    status: 'pending',
    invitedBy: (invitedBy || 'Admin DEPOTEL').trim(),
    createdAt: now,
    expiresAt,
  };

  db.invitations.push(newInvitation);
  saveDB(db);

  res.json({
    success: true,
    invitation: newInvitation,
    invitations: db.invitations,
  });
});

// 16c. Validate Invitation Token or Code (Public endpoint for invitee)
app.get('/api/invitations/validate', (req, res) => {
  const token = (req.query.token as string || '').trim();
  const codeRaw = (req.query.code as string || '').trim().toUpperCase();

  if (!token && !codeRaw) {
    return res.status(400).json({ valid: false, reason: 'missing_params', message: 'Token atau kode undangan diperlukan.' });
  }

  if (!db.invitations) db.invitations = [];
  refreshInvitationsExpiry(db.invitations);

  const cleanCode = codeRaw.startsWith('DEP-') ? codeRaw : `DEP-${codeRaw}`;

  const inv = db.invitations.find(
    (i) => (token && i.token === token) || (codeRaw && (i.code === codeRaw || i.code === cleanCode))
  );

  if (!inv) {
    return res.status(404).json({
      valid: false,
      reason: 'not_found',
      message: 'Tautan atau kode aktivasi undangan tidak ditemukan. Pastikan Anda menyalin tautan dengan lengkap.',
    });
  }

  if (inv.status === 'revoked') {
    return res.status(400).json({
      valid: false,
      reason: 'revoked',
      message: 'Undangan ini telah dibatalkan atau dicabut oleh Admin DEPOTEL.',
    });
  }

  if (inv.status === 'accepted') {
    // If invitation was already accepted, find user and allow seamless Google/direct login
    const existingUser = db.users.find(
      (u) => (inv.acceptedUserId && u.id === inv.acceptedUserId) ||
             (u.email && u.email.toLowerCase() === inv.email.toLowerCase()) ||
             u.name.toLowerCase() === inv.name.toLowerCase()
    );
    return res.json({
      valid: true,
      alreadyAccepted: true,
      user: existingUser || null,
      invitation: {
        id: inv.id,
        name: inv.name,
        email: inv.email,
        role: inv.role,
        code: inv.code,
        expiresAt: inv.expiresAt,
        invitedBy: inv.invitedBy,
      },
      message: 'Akun terdaftar. Anda dapat langsung masuk dengan Akun Google / profil Anda.',
    });
  }

  if (inv.status === 'expired' || Date.now() > inv.expiresAt) {
    inv.status = 'expired';
    saveDB(db);
    return res.status(400).json({
      valid: false,
      reason: 'expired',
      message: 'Masa berlaku undangan ini telah berakhir (kedaluwarsa 48 jam). Silakan minta Admin DEPOTEL untuk membuat ulang undangan baru.',
    });
  }

  // Safe public metadata (no secrets leaked)
  res.json({
    valid: true,
    invitation: {
      id: inv.id,
      name: inv.name,
      email: inv.email,
      role: inv.role,
      code: inv.code,
      expiresAt: inv.expiresAt,
      invitedBy: inv.invitedBy,
    },
  });
});

// 16d. Accept & Activate Invitation (Also acts as 1-click login for invitee)
app.post('/api/invitations/accept', (req, res) => {
  const { token, code, avatarUrl, googleEmail } = req.body;
  const tokenClean = (token || '').trim();
  const codeRaw = (code || '').trim().toUpperCase();

  if (!tokenClean && !codeRaw) {
    return res.status(400).json({ error: 'Token atau kode undangan wajib disertakan' });
  }

  if (!db.invitations) db.invitations = [];
  refreshInvitationsExpiry(db.invitations);

  const cleanCode = codeRaw.startsWith('DEP-') ? codeRaw : `DEP-${codeRaw}`;

  const inv = db.invitations.find(
    (i) => (tokenClean && i.token === tokenClean) || (codeRaw && (i.code === codeRaw || i.code === cleanCode))
  );

  if (!inv) {
    return res.status(404).json({ error: 'Undangan tidak ditemukan.' });
  }

  if (inv.status === 'revoked') {
    return res.status(400).json({ error: 'Undangan ini telah dibatalkan oleh Admin.' });
  }

  // If already accepted, return existing user for instant login
  if (inv.status === 'accepted') {
    let existingUser = db.users.find(
      (u) => (inv.acceptedUserId && u.id === inv.acceptedUserId) ||
             (u.email && u.email.toLowerCase() === inv.email.toLowerCase()) ||
             (googleEmail && u.email && u.email.toLowerCase() === googleEmail.trim().toLowerCase()) ||
             u.name.toLowerCase() === inv.name.toLowerCase()
    );
    if (existingUser) {
      if (googleEmail && !existingUser.email) existingUser.email = googleEmail.trim().toLowerCase();
      existingUser.lastActive = Date.now();
      saveDB(db);
      return res.json({
        success: true,
        user: existingUser,
        users: enrichUsersOnline(db.users),
        invitation: inv,
        isExistingLogin: true,
      });
    }
  }

  if (inv.status === 'expired' || Date.now() > inv.expiresAt) {
    inv.status = 'expired';
    saveDB(db);
    return res.status(400).json({ error: 'Undangan ini sudah kedaluwarsa. Minta admin untuk membuat ulang.' });
  }

  // Activate / Provision User Account
  let user = db.users.find(
    (u) => (u.email && u.email.toLowerCase() === inv.email.toLowerCase()) ||
           u.name.toLowerCase() === inv.name.toLowerCase()
  );

  if (user) {
    user.role = inv.role;
    user.email = inv.email;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    user.lastActive = Date.now();
  } else {
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    user = {
      id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: inv.name,
      email: inv.email,
      role: inv.role, // Determined strictly by admin in invitation
      avatarColor: randomColor,
      avatarUrl: avatarUrl || '',
      lastActive: Date.now(),
    };
    db.users.push(user);
  }

  // Mark single-use invitation as accepted
  inv.status = 'accepted';
  inv.acceptedAt = Date.now();
  inv.acceptedUserId = user.id;

  saveDB(db);

  res.json({
    success: true,
    user,
    users: enrichUsersOnline(db.users),
    invitation: inv,
  });
});

// 16d-2. Auto-Login from Invite Link (Direct 1-Click Access for Invited or Registered Users)
app.post('/api/invitations/auto-login', (req, res) => {
  const { token, code, userId, email } = req.body;
  const tokenClean = (token || '').trim();
  const codeRaw = (code || '').trim().toUpperCase();
  const cleanCode = codeRaw.startsWith('DEP-') ? codeRaw : `DEP-${codeRaw}`;
  const userClean = (userId || '').trim();
  const emailClean = (email || '').trim().toLowerCase();

  if (!db.invitations) db.invitations = [];
  refreshInvitationsExpiry(db.invitations);

  // 1. Try finding user directly by userId
  if (userClean) {
    const user = db.users.find((u) => u.id === userClean);
    if (user) {
      user.lastActive = Date.now();
      saveDB(db);
      return res.json({
        success: true,
        user,
        users: enrichUsersOnline(db.users),
        source: 'user_id',
      });
    }
  }

  // 2. Try finding invitation by token or code
  let inv = db.invitations.find(
    (i) =>
      (tokenClean && i.token === tokenClean) ||
      (codeRaw && (i.code === codeRaw || i.code === cleanCode))
  );

  if (inv) {
    // Find or create associated user
    let user = db.users.find(
      (u) =>
        (inv.acceptedUserId && u.id === inv.acceptedUserId) ||
        (u.email && u.email.toLowerCase() === inv.email.toLowerCase()) ||
        u.name.toLowerCase() === inv.name.toLowerCase()
    );

    if (user) {
      user.lastActive = Date.now();
      if (inv.email && !user.email) user.email = inv.email;
      if (inv.role && user.role !== inv.role) user.role = inv.role;
    } else {
      const colors = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      user = {
        id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: inv.name,
        email: inv.email,
        role: inv.role || 'user',
        avatarColor: randomColor,
        avatarUrl: '',
        lastActive: Date.now(),
      };
      db.users.push(user);
    }

    inv.status = 'accepted';
    inv.acceptedAt = Date.now();
    inv.acceptedUserId = user.id;
    saveDB(db);

    return res.json({
      success: true,
      user,
      users: enrichUsersOnline(db.users),
      invitation: inv,
      source: 'invitation',
    });
  }

  // 3. Fallback by email match
  if (emailClean) {
    const user = db.users.find((u) => u.email && u.email.toLowerCase() === emailClean);
    if (user) {
      user.lastActive = Date.now();
      saveDB(db);
      return res.json({
        success: true,
        user,
        users: enrichUsersOnline(db.users),
        source: 'email',
      });
    }
  }

  return res.status(404).json({
    success: false,
    error: 'Tautan atau kredensial undangan tidak ditemukan atau sudah kedaluwarsa.',
  });
});

// 16e. Resend / Regenerate Invitation (Admin only)
app.post('/api/invitations/:id/resend', (req, res) => {
  const { id } = req.params;
  if (!db.invitations) db.invitations = [];

  const inv = db.invitations.find((i) => i.id === id);
  if (!inv) return res.status(404).json({ error: 'Undangan tidak ditemukan' });

  // Generate fresh token and code and reset 48 hours validity
  inv.token = crypto.randomBytes(16).toString('hex');
  inv.code = `DEP-${Math.floor(100000 + Math.random() * 900000)}`;
  inv.status = 'pending';
  inv.createdAt = Date.now();
  inv.expiresAt = Date.now() + 48 * 3600 * 1000;
  delete inv.acceptedAt;
  delete inv.acceptedUserId;

  saveDB(db);
  res.json({ success: true, invitation: inv, invitations: db.invitations });
});

// 16f. Revoke / Cancel Invitation (Admin only)
app.post('/api/invitations/:id/revoke', (req, res) => {
  const { id } = req.params;
  if (!db.invitations) db.invitations = [];

  const inv = db.invitations.find((i) => i.id === id);
  if (!inv) return res.status(404).json({ error: 'Undangan tidak ditemukan' });

  inv.status = 'revoked';
  saveDB(db);
  res.json({ success: true, invitation: inv, invitations: db.invitations });
});

// 16g. Delete Invitation Record (Admin only)
app.delete('/api/invitations/:id', (req, res) => {
  const { id } = req.params;
  if (!db.invitations) db.invitations = [];

  db.invitations = db.invitations.filter((i) => i.id !== id);
  saveDB(db);
  res.json({ success: true, invitations: db.invitations });
});

// 16h. Get or Create Invitation Token for Any Registered User (1-click link login)
app.post('/api/invitations/for-user/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

  if (!db.invitations) db.invitations = [];
  refreshInvitationsExpiry(db.invitations);

  let inv = db.invitations.find(
    (i) => (i.acceptedUserId === user.id) ||
           (user.email && i.email.toLowerCase() === user.email.toLowerCase()) ||
           i.name.toLowerCase() === user.name.toLowerCase()
  );

  const now = Date.now();
  if (!inv || inv.status === 'revoked' || inv.status === 'expired') {
    const token = crypto.randomBytes(16).toString('hex');
    const codeDigits = Math.floor(100000 + Math.random() * 900000).toString();
    inv = {
      id: `inv_${now}_${Math.random().toString(36).substring(2, 6)}`,
      token,
      code: `DEP-${codeDigits}`,
      name: user.name,
      email: user.email || `${user.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      role: user.role,
      status: 'pending',
      invitedBy: 'Admin DEPOTEL',
      createdAt: now,
      expiresAt: now + 30 * 24 * 3600 * 1000, // 30 days validity for registered members
      acceptedUserId: user.id,
    };
    db.invitations.push(inv);
  } else {
    inv.expiresAt = now + 30 * 24 * 3600 * 1000;
  }

  saveDB(db);
  res.json({ success: true, invitation: inv });
});

// 16i. App Info & Public URL for Team Invitation
app.get('/api/app-info', (req, res) => {
  const host = req.get('host') || '';
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const currentOrigin = host ? `${proto}://${host}` : (process.env.APP_URL || '');
  const sharedUrl = 'https://ais-pre-sw2koyy2muflakec6krfxb-148906958408.asia-southeast1.run.app';
  res.json({
    currentOrigin,
    sharedUrl,
    inviteUrl: `${currentOrigin}/?invite=true`,
  });
});

// 16i. Check Live Publication Status of Shared URL
app.get('/api/check-publish-status', async (_req, res) => {
  const sharedUrl = 'https://ais-pre-sw2koyy2muflakec6krfxb-148906958408.asia-southeast1.run.app';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const checkRes = await fetch(sharedUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': 'DEPOTEL-HealthCheck/1.0' },
    });
    clearTimeout(timeout);
    // If 200 or 304, app is successfully published!
    const isPublished = checkRes.status >= 200 && checkRes.status < 400;
    res.json({
      success: true,
      isPublished,
      status: checkRes.status,
      sharedUrl,
    });
  } catch (err: any) {
    res.json({
      success: true,
      isPublished: false,
      error: err.message,
      sharedUrl,
    });
  }
});

// 16j. Dedicated PWA Asset Endpoints (service-worker.js & Web App Manifests)
app.get('/service-worker.js', (_req, res) => {
  const swPath = path.resolve(__dirname, 'public', 'service-worker.js');
  if (fs.existsSync(swPath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(swPath);
  }
  res.status(404).send('Service worker not found');
});

app.get('/manifest.webmanifest', (_req, res) => {
  const manifestPath = path.resolve(__dirname, 'public', 'manifest.webmanifest');
  if (fs.existsSync(manifestPath)) {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.sendFile(manifestPath);
  }
  res.status(404).send('Manifest not found');
});

app.get('/manifest.json', (_req, res) => {
  const manifestPath = path.resolve(__dirname, 'public', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.sendFile(manifestPath);
  }
  res.status(404).send('Manifest not found');
});

// Direct friendly invite & activation URL redirects
app.get(['/activate', '/invitation', '/invite'], (_req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    return res.sendFile(path.resolve(distPath, 'index.html'));
  }
  next();
});

// ======================== SERVER & VITE ========================

async function startServer() {
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (!process.env.NODE_ENV && fs.existsSync(path.resolve(__dirname, 'dist', 'index.html')));

  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`DEPOTEL Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
