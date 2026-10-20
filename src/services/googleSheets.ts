import type { DatabaseSchema, SiteItem } from '../types';

export const SPREADSHEET_ID = '1nQEuYD9N_WbyBW0MZEUeMjEJwm4trjKEQyR01vmWe0c';
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

export interface SheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: { id: number; title: string; index: number }[];
}

/**
 * Fetch spreadsheet metadata to check available tabs
 */
export async function getSpreadsheetMetadata(accessToken: string): Promise<SheetMetadata> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gagal membuka Google Sheet (${res.status}): ${errText || res.statusText}`);
  }

  const json = await res.json();
  const sheets = (json.sheets || []).map((s: any) => ({
    id: s.properties?.sheetId,
    title: s.properties?.title,
    index: s.properties?.index,
  }));

  return {
    spreadsheetId: json.spreadsheetId,
    title: json.properties?.title || 'DEPOTEL Spreadsheet',
    sheets,
  };
}

/**
 * Migrate all data from depotel_db.json into Google Sheet 1nQEuYD9N_WbyBW0MZEUeMjEJwm4trjKEQyR01vmWe0c
 */
export async function migrateAllDataToSheet(
  accessToken: string,
  db: DatabaseSchema,
  onProgress?: (step: string) => void
): Promise<{ success: boolean; totalRows: number; sheetsUpdated: string[] }> {
  onProgress?.('Membaca struktur Google Sheet...');
  const metadata = await getSpreadsheetMetadata(accessToken);
  const existingSheetTitles = new Set(metadata.sheets.map((s) => s.title));

  const REQUIRED_SHEETS = [
    'SITES_MONITORING',
    'CATEGORIES',
    'USERS',
    'INVITATIONS',
    'RAW_JSON_BACKUP',
  ];

  // 1. Create missing sheets via batchUpdate
  const addRequests: any[] = [];
  for (const title of REQUIRED_SHEETS) {
    if (!existingSheetTitles.has(title)) {
      addRequests.push({
        addSheet: {
          properties: {
            title,
            gridProperties: { rowCount: 1000, columnCount: 15 },
          },
        },
      });
    }
  }

  if (addRequests.length > 0) {
    onProgress?.(`Membuat ${addRequests.length} tab baru di Google Sheet...`);
    const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests: addRequests }),
    });

    if (!batchRes.ok) {
      console.warn('Batch add sheet notice:', await batchRes.text().catch(() => ''));
    }
  }

  // 2. Prepare tabular data for each sheet
  onProgress?.('Menyiapkan data checklist & monitoring...');

  // A. SITES_MONITORING Data
  const sitesRows: any[][] = [
    [
      'NO',
      'KATEGORI ID',
      'NAMA KATEGORI',
      'SITE ID',
      'ID PELANGGAN (CUSTOMER ID)',
      'KODE SITE',
      'NAMA SITE',
      'STATUS CHECKLIST',
      'STATUS BOOLEAN',
      'NOMOR TOKEN LISTRIK',
      'JUMLAH FOTO',
      'TERAKHIR DIUBAH OLEH',
      'WAKTU PEMBARUAN',
    ],
  ];

  let siteIndex = 1;
  for (const ut of db.updateTypes || []) {
    for (const site of ut.sites || []) {
      sitesRows.push([
        siteIndex++,
        ut.id,
        ut.name,
        site.id,
        site.customerId,
        site.siteCode,
        site.siteName,
        site.checked ? 'SELESAI (✓)' : 'BELUM (✗)',
        site.checked ? 'TRUE' : 'FALSE',
        site.tokenNumber || '',
        site.photos?.length || 0,
        site.updatedBy || '',
        site.updatedAt || '',
      ]);
    }
  }

  // B. CATEGORIES Data
  const categoryRows: any[][] = [
    [
      'NO',
      'KATEGORI ID',
      'NAMA KATEGORI',
      'PERIODE',
      'TIPE IKON',
      'TARGET TOTAL SITE',
      'SITE TERDAFTAR',
      'SELESAI (✓)',
      'BELUM SELESAI (✗)',
      'PERSENTASE PROGRES',
    ],
  ];

  let catIndex = 1;
  for (const ut of db.updateTypes || []) {
    const total = ut.customTotalTarget || ut.sites?.length || 0;
    const checked = (ut.sites || []).filter((s) => s.checked).length;
    const unchecked = Math.max(0, total - checked);
    const pct = total > 0 ? `${((checked / total) * 100).toFixed(2).replace('.', ',')}%` : '0%';

    categoryRows.push([
      catIndex++,
      ut.id,
      ut.name,
      ut.period || '',
      ut.iconType || '',
      total,
      ut.sites?.length || 0,
      checked,
      unchecked,
      pct,
    ]);
  }

  // C. USERS Data
  const userRows: any[][] = [
    [
      'NO',
      'USER ID',
      'NAMA PENGGUNA',
      'ROLE / HAK AKSES',
      'EMAIL RESMI',
      'WARNA AVATAR',
      'STATUS ONLINE',
      'TERAKHIR AKTIF',
    ],
  ];

  let userIndex = 1;
  for (const u of db.users || []) {
    userRows.push([
      userIndex++,
      u.id,
      u.name,
      u.role === 'admin' ? 'Admin' : 'Teknisi (User)',
      u.email || '',
      u.avatarColor || '',
      u.isOnline ? 'Online' : 'Offline',
      u.lastActive ? new Date(u.lastActive).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '',
    ]);
  }

  // D. INVITATIONS Data
  const invRows: any[][] = [
    [
      'NO',
      'ID UNDANGAN',
      'KODE AKTIVASI',
      'NAMA ANGGOTA',
      'EMAIL ANGGOTA',
      'ROLE',
      'STATUS UNDANGAN',
      'DIUNDANG OLEH',
      'TANGGAL DIBUAT',
      'TANGGAL KADALUARSA',
      'USER ID TERHUBUNG',
    ],
  ];

  let invIndex = 1;
  for (const inv of db.invitations || []) {
    invRows.push([
      invIndex++,
      inv.id,
      inv.code || '',
      inv.name,
      inv.email || '',
      inv.role,
      inv.status,
      inv.invitedBy || '',
      inv.createdAt ? new Date(inv.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '',
      inv.expiresAt ? new Date(inv.expiresAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '',
      inv.acceptedUserId || '',
    ]);
  }

  // E. RAW_JSON_BACKUP Data
  const backupRows: any[][] = [
    ['TIMESTAMP EXPORT', 'WAKTU LOKAL (WIB)', 'TOTAL SITE', 'TOTAL USER', 'PAYLOAD JSON DATABASE LENGKAP'],
    [
      new Date().toISOString(),
      new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      sitesRows.length - 1,
      userRows.length - 1,
      JSON.stringify(db),
    ],
  ];

  // 3. Clear and update all sheets in one batch
  onProgress?.('Menulis seluruh data ke Google Sheet...');

  const dataValuesPayload = [
    { range: 'SITES_MONITORING!A1:M1000', values: sitesRows },
    { range: 'CATEGORIES!A1:J100', values: categoryRows },
    { range: 'USERS!A1:H100', values: userRows },
    { range: 'INVITATIONS!A1:K100', values: invRows },
    { range: 'RAW_JSON_BACKUP!A1:E2', values: backupRows },
  ];

  // Clear existing ranges first for clean overwrite
  for (const item of dataValuesPayload) {
    try {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
          item.range
        )}:clear`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (_) {}
  }

  // Batch update values
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: dataValuesPayload,
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text().catch(() => '');
    throw new Error(`Gagal menulis data ke Google Sheet (${updateRes.status}): ${errText}`);
  }

  // 4. Polish format (Header styling: Dark blue #0E2A6D, white text, bold, frozen row 1)
  onProgress?.('Meratakan dan memberi format header...');
  try {
    const updatedMeta = await getSpreadsheetMetadata(accessToken);
    const formatRequests: any[] = [];

    for (const sheet of updatedMeta.sheets) {
      if (REQUIRED_SHEETS.includes(sheet.title)) {
        // Freeze top row
        formatRequests.push({
          updateSheetProperties: {
            properties: {
              sheetId: sheet.id,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
            fields: 'gridProperties.frozenRowCount',
          },
        });

        // Header style: dark blue background, bold white text
        formatRequests.push({
          repeatCell: {
            range: {
              sheetId: sheet.id,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 14 / 255, green: 42 / 255, blue: 109 / 255 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 10,
                },
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
          },
        });
      }
    }

    if (formatRequests.length > 0) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: formatRequests }),
      });
    }
  } catch (err) {
    console.warn('Formatting warning (non-fatal):', err);
  }

  onProgress?.('Selesai!');
  return {
    success: true,
    totalRows: sitesRows.length - 1,
    sheetsUpdated: REQUIRED_SHEETS,
  };
}

/**
 * Real-time update single site status in Google Sheet SITES_MONITORING
 */
export async function updateSingleSiteInSheet(
  accessToken: string,
  site: SiteItem
): Promise<boolean> {
  try {
    // Read SITES_MONITORING column D (Site ID) to find row index
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/SITES_MONITORING!D:D`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return false;
    const json = await res.json();
    const rows = json.values || [];
    const rowIndex = rows.findIndex((r: any[]) => r[0] === site.id);
    if (rowIndex < 0) return false;

    const sheetRowNumber = rowIndex + 1;
    // Update columns H (Status), I (Boolean), J (Token), L (UpdatedBy), M (UpdatedAt)
    const updateRange = `SITES_MONITORING!H${sheetRowNumber}:M${sheetRowNumber}`;
    const updateValues = [
      [
        site.checked ? 'SELESAI (✓)' : 'BELUM (✗)',
        site.checked ? 'TRUE' : 'FALSE',
        site.tokenNumber || '',
        site.photos?.length || 0,
        site.updatedBy || '',
        site.updatedAt || '',
      ],
    ];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
        updateRange
      )}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: updateValues }),
      }
    );
    return true;
  } catch (err) {
    console.error('Error updating single site in Google Sheet:', err);
    return false;
  }
}
