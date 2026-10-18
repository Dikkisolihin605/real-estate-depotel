import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import type { SiteItem, AppUser } from '../types';
import { stampPhotoWithWatermark, formatDateTimeID } from '../utils/watermark';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: SiteItem | null;
  currentUser: AppUser | null;
  onSavePhoto: (dataUrl: string, capturedAt: string) => Promise<void>;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  site,
  currentUser,
  onSavePhoto,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useFilePicker, setUseFilePicker] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera stream when modal opens
  useEffect(() => {
    if (isOpen && site && !useFilePicker && !capturedDataUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, site, useFilePicker, capturedDataUrl]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera stream error, falling back to file picker:', err);
      setCameraError('Kamera langsung tidak dapat diakses (gunakan tombol upload/kamera HP)');
      setUseFilePicker(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCaptureFromVideo = async () => {
    if (!videoRef.current || !site) return;
    setIsProcessing(true);
    try {
      const technicianName = currentUser?.name || 'Teknisi DEPOTEL';
      const stampedUrl = await stampPhotoWithWatermark(videoRef.current, {
        siteCode: site.siteCode,
        siteName: site.siteName,
        customerId: site.customerId,
        technicianName,
        tokenNumber: site.tokenNumber,
      });
      setCapturedDataUrl(stampedUrl);
      stopCamera();
    } catch (err) {
      console.error('Error stamping photo:', err);
      alert('Gagal memproses foto. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !site) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const img = new Image();
        img.onload = async () => {
          const technicianName = currentUser?.name || 'Teknisi DEPOTEL';
          const stampedUrl = await stampPhotoWithWatermark(img, {
            siteCode: site.siteCode,
            siteName: site.siteName,
            customerId: site.customerId,
            technicianName,
            tokenNumber: site.tokenNumber,
          });
          setCapturedDataUrl(stampedUrl);
          setIsProcessing(false);
        };
        img.src = reader.result as string;
      } catch (err) {
        console.error('Error stamping uploaded file:', err);
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!capturedDataUrl || !site) return;
    setIsProcessing(true);
    try {
      const timeInfo = formatDateTimeID();
      await onSavePhoto(capturedDataUrl, timeInfo.formatted);
      setCapturedDataUrl(null);
      onClose();
    } catch (err) {
      alert('Gagal menyimpan foto. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    if (!useFilePicker) {
      startCamera();
    }
  };

  if (!isOpen || !site) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Prominent Kembali Back Button */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/80 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-white border border-slate-600 active:scale-95 transition cursor-pointer"
              title="Kembali ke daftar site"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>
            <div>
              <h2 className="text-sm font-bold text-white">Dokumentasi Foto Site</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {site.siteCode} • {site.customerId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center bg-black/40">
          {capturedDataUrl ? (
            /* Stamped Photo Preview */
            <div className="w-full space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 shadow-xl bg-slate-950">
                <img
                  src={capturedDataUrl}
                  alt="Hasil Foto Watermark"
                  className="w-full max-h-[55vh] object-contain mx-auto"
                />
                <span className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40">
                  <Check className="h-3 w-3" /> Watermark Terpasang
                </span>
              </div>
              <p className="text-center text-xs text-slate-300">
                Foto siap disimpan permanen ke server. Site ID, Nama Site, ID Pelanggan, dan Waktu tercantum resmi.
              </p>
            </div>
          ) : useFilePicker ? (
            /* File Upload / Camera Trigger via Input */
            <div className="w-full rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/40 p-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                <Camera className="h-7 w-7" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">Ambil Foto / Pilih dari Galeri HP</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Foto akan langsung diberi watermark resmi DEPOTEL (Site ID, Nama, ID Meter, Tanggal &amp; Jam).
                </p>
              </div>

              {cameraError && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-950/40 border border-amber-800/50 p-2.5 text-xs text-amber-300 text-left">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 active:scale-95"
                >
                  <Camera className="h-4 w-4" /> Buka Kamera HP / Galeri
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUseFilePicker(false);
                    startCamera();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Coba Viewfinder Kamera
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Viewfinder */
            <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-black flex flex-col items-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[50vh] object-cover rounded-xl"
              />

              {/* Viewfinder Overlay Guidelines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-slate-200 border border-slate-700">
                    DEPOTEL CAMERA
                  </span>
                  <span className="rounded bg-red-600/80 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                    LIVE
                  </span>
                </div>

                <div className="rounded-lg bg-black/75 p-2 text-center text-[10px] text-slate-300 border border-slate-700">
                  Arahkan ke KWH Meter / MCB / Site Box
                </div>
              </div>

              {/* Action Controls */}
              <div className="w-full bg-slate-900/90 p-3 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setUseFilePicker(true);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload File
                </button>

                {/* Big Shutter Button */}
                <button
                  type="button"
                  onClick={handleCaptureFromVideo}
                  disabled={isProcessing}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-4 ring-white/20 hover:bg-red-500 active:scale-95 transition cursor-pointer"
                  title="Jepret Foto"
                >
                  <Camera className="h-6 w-6" />
                </button>

                <div className="w-16" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 bg-slate-850 p-3.5 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400">
            {site.photos?.length || 0} foto tersimpan untuk site ini
          </div>

          <div className="flex items-center gap-2">
            {capturedDataUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  disabled={isProcessing}
                  className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isProcessing}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer active:scale-95"
                >
                  Foto Ulang
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500 active:scale-95 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  {isProcessing ? 'Menyimpan...' : 'Simpan Foto'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer active:scale-95"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
