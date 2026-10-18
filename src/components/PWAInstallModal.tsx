import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Laptop,
  Share,
  PlusSquare,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  MoreVertical,
  Check,
} from 'lucide-react';
import { usePWAInstall, DeviceType } from '../usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, deviceType, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<DeviceType>(deviceType);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header with DEPOTEL theme */}
        <div className="relative bg-gradient-to-br from-[#0e2a6d] via-[#103387] to-[#071536] p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
            title="Tutup"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-1 shadow-lg ring-2 ring-white/20">
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
                alt="DEPOTEL GROUP"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-500/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-200 border border-blue-400/30">
                  Aplikasi Resmi PWA
                </span>
                {isInstalled && (
                  <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-extrabold text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Terpasang
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-lg sm:text-xl font-black tracking-tight text-white">
                INSTALL APLIKASI DEPOTEL
              </h2>
              <p className="text-xs text-blue-100/90">
                Pasang langsung di layar utama HP &amp; laptop tanpa Play Store
              </p>
            </div>
          </div>

          {/* Quick Highlight Points */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-[11px] text-white/90">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-300 flex-shrink-0" />
              <span>Sangat Cepat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-300 flex-shrink-0" />
              <span>Ringan &lt; 2 MB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-emerald-300 flex-shrink-0" />
              <span>Offline Ready</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'android'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'ios'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="font-bold text-sm leading-none"></span>
            <span>iPhone / iPad</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'desktop'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Laptop / PC</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
          {/* Quick Install Prompt Button if browser supports it */}
          {isInstallable && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">
                      Pemasangan Cepat Tersedia
                    </h4>
                    <p className="text-[11px] text-blue-700">
                      Browser Anda mendukung instalasi 1-klik langsung.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-blue-700 active:scale-95 transition cursor-pointer flex-shrink-0"
                >
                  Pasang Sekarang
                </button>
              </div>
            </div>
          )}

          {installSuccess && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span>Aplikasi DEPOTEL berhasil dipasang di perangkat Anda!</span>
            </div>
          )}

          {/* Guide for iPhone / iPad */}
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                <strong>Catatan iOS:</strong> Apple mewajibkan pemasangan PWA melalui peramban <strong>Safari</strong>.
              </div>

              <ol className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900">Buka link aplikasi di Safari</strong>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Pastikan Anda membuka URL DEPOTEL ini langsung di aplikasi <strong>Safari</strong> pada iPhone/iPad Anda.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 flex items-center gap-1.5">
                      Ketuk tombol Bagikan / Share <Share className="h-3.5 w-3.5 text-blue-600 inline" />
                    </strong>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Ikon berupa kotak dengan tanda panah mengarah ke atas di bilah menu bawah Safari.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 flex items-center gap-1.5">
                      Pilih "Tambah ke Layar Utama" <PlusSquare className="h-3.5 w-3.5 text-blue-600 inline" />
                    </strong>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Scroll menu opsi ke bawah, lalu tekan <em>Add to Home Screen</em> (Tambah ke Layar Utama).
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-900">Tekan "Tambah" di kanan atas</strong>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Ikon resmi <strong>DEPOTEL</strong> akan langsung muncul di halaman muka HP Anda layaknya aplikasi App Store!
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Guide for Android */}
          {activeTab === 'android' && (
            <div className="space-y-3">
              <ol className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 flex items-center gap-1.5">
                      Buka Menu Titik Tiga <MoreVertical className="h-3.5 w-3.5 text-slate-700 inline" />
                    </strong>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Di Google Chrome / Samsung Internet, ketuk ikon titik tiga (⋮) di pojok kanan atas browser.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 flex items-center gap-1.5">
                      Pilih "Install aplikasi" atau "Tambahkan ke Layar Utama"
                    </strong>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Menu bertuliskan <em>Install app</em> atau <em>Add to Home Screen</em>.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900">Konfirmasi Install</strong>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Tekan tombol <strong>Install</strong>. Google Chrome akan mengunduh paket WebAPK secara otomatis dan membuat ikon aplikasi DEPOTEL di daftar aplikasi Android Anda.
                    </p>
                  </div>
                </li>
              </ol>

              {/* Action Buttons for Android */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Pasang Sekarang via Google Chrome</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const launcherHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DEPOTEL Mobile App</title>
  <meta http-equiv="refresh" content="0; url=${window.location.origin}">
  <script>
    window.location.replace("${window.location.origin}");
  </script>
</head>
<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0e2a6d;color:#fff;font-family:sans-serif;text-align:center;">
  <div>
    <h2>Membuka Aplikasi DEPOTEL...</h2>
    <p>Jika tidak terbuka otomatis, <a href="${window.location.origin}" style="color:#fde047;">klik di sini</a></p>
  </div>
</body>
</html>`;
                    const blob = new Blob([launcherHtml], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'DEPOTEL-Aplikasi-Mobile.html';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                >
                  <Download className="h-4 w-4 text-blue-600" />
                  <span>Unduh File Launcher APK PWA (.html)</span>
                </button>
              </div>
            </div>
          )}

          {/* Guide for Desktop / Laptop */}
          {activeTab === 'desktop' && (
            <div className="space-y-3">
              <ol className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900">
                      Klik Ikon Install di Bilah Alamat (Address Bar)
                    </strong>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Pada Google Chrome atau Microsoft Edge, perhatikan ujung kanan bar URL (ikon komputer kecil dengan tanda panah ke bawah).
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900">Atau lewat Menu Browser (⋮)</strong>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Klik tombol menu titik tiga (⋮) di kanan atas browser &gt; pilih <strong>"Simpan dan Bagikan"</strong> (Cast, Save &amp; Share) &gt; <strong>"Install DEPOTEL"</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900">Buka Seperti Aplikasi Desktop Mandiri</strong>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      DEPOTEL akan muncul di Start Menu (Windows) atau Launchpad (Mac) dan dapat dibuka tanpa antarmuka tab browser.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>PWA Standalone &middot; DEPOTEL GROUP</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Mengerti, Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
