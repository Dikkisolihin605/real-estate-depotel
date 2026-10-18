export interface WatermarkOptions {
  siteCode: string;
  siteName: string;
  customerId: string;
  technicianName: string;
  tokenNumber?: string;
}

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatDateTimeID(date: Date = new Date()): { formatted: string; iso: string } {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS_ID[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return {
    formatted: `${day} ${month} ${year}, ${hours}:${minutes}:${seconds} WIB`,
    iso: date.toISOString()
  };
}

export function stampPhotoWithWatermark(
  imageSource: HTMLImageElement | HTMLVideoElement,
  options: WatermarkOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const naturalWidth = (imageSource as HTMLImageElement).naturalWidth || (imageSource as HTMLVideoElement).videoWidth || 1280;
      const naturalHeight = (imageSource as HTMLImageElement).naturalHeight || (imageSource as HTMLVideoElement).videoHeight || 720;

      // Scale to max 1600px to maintain quality without overloading storage
      const maxDim = 1600;
      let width = naturalWidth;
      let height = naturalHeight;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Draw photo
      ctx.drawImage(imageSource, 0, 0, width, height);

      // Watermark Banner Configuration
      const bannerHeight = Math.max(96, Math.round(height * 0.17));
      const bannerY = height - bannerHeight;

      // Gradient overlay at bottom
      const gradient = ctx.createLinearGradient(0, bannerY - 24, 0, height);
      gradient.addColorStop(0, 'rgba(10, 25, 47, 0)');
      gradient.addColorStop(0.2, 'rgba(10, 25, 47, 0.85)');
      gradient.addColorStop(1, 'rgba(8, 18, 38, 0.96)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, bannerY - 24, width, bannerHeight + 24);

      // Accent border line (red)
      ctx.fillStyle = '#e53e3e'; // Depotel Red
      ctx.fillRect(0, bannerY, width, Math.max(3, Math.round(width * 0.003)));

      const timeInfo = formatDateTimeID();

      // Typography scale based on canvas width
      const baseFontSize = Math.max(14, Math.round(width * 0.024));
      const titleFontSize = Math.round(baseFontSize * 1.25);
      const subFontSize = Math.round(baseFontSize * 0.9);

      const paddingLeft = Math.round(width * 0.035);
      let textY = bannerY + Math.round(bannerHeight * 0.32);

      // 1. Site ID & Nama Site
      ctx.font = `bold ${titleFontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(`📍 SITE ID: ${options.siteCode || '-'} | ${options.siteName || '-'}`, paddingLeft, textY);

      // 2. Customer ID / Meter
      textY += Math.round(baseFontSize * 1.4);
      ctx.font = `${baseFontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = '#93c5fd'; // Light blue
      const idText = `🔢 ID PELANGGAN / METER: ${options.customerId || '-'}`;
      ctx.fillText(idText, paddingLeft, textY);

      // 3. Timestamp & Technician
      textY += Math.round(baseFontSize * 1.35);
      ctx.font = `${subFontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = '#e2e8f0'; // Slate 200
      ctx.fillText(`🕒 WAKTU: ${timeInfo.formatted}   •   👤 PETUGAS: ${options.technicianName || 'Teknisi Depotel'}`, paddingLeft, textY);

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Small security seal on right
      const sealX = width - Math.round(width * 0.08);
      const sealY = bannerY + Math.round(bannerHeight * 0.5);
      ctx.beginPath();
      ctx.arc(sealX, sealY, Math.round(bannerHeight * 0.28), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = `bold ${Math.round(baseFontSize * 0.75)}px system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('VERIFIED', sealX, sealY - 4);
      ctx.fillText('DEPOTEL', sealX, sealY + 10);
      ctx.textAlign = 'left';

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      resolve(dataUrl);
    } catch (err) {
      reject(err);
    }
  });
}
