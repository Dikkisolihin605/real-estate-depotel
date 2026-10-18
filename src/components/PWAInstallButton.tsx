import React, { useState } from 'react';
import { Download, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'settings' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running in standalone mode
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs font-bold text-emerald-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <div className="leading-tight">Aplikasi DEPOTEL Terpasang</div>
            <div className="text-[10px] font-normal text-emerald-700">
              Berjalan dalam mode Standalone PWA
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {variant === 'banner' && (
        <div className={`relative overflow-hidden rounded-3xl border border-blue-200/90 bg-gradient-to-r from-[#0e2a6d] via-[#12368c] to-[#0a2052] p-4 text-white shadow-md ${className}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-1 shadow-sm ring-2 ring-white/20">
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
                  alt="DEPOTEL Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-blue-400/30 px-2 py-0.2 text-[9px] font-extrabold tracking-wide uppercase text-blue-200 border border-blue-300/30">
                    Aplikasi PWA
                  </span>
                  <span className="text-[10px] text-blue-200 font-semibold">
                    Android &bull; iPhone &bull; Laptop
                  </span>
                </div>
                <h3 className="text-sm font-black text-white mt-0.5">
                  Pasang Aplikasi DEPOTEL ke Layar Utama HP
                </h3>
                <p className="text-[11px] text-blue-100/80 leading-snug">
                  Buka langsung tanpa buka browser, loading super cepat &amp; hemat kuota.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              <button
                type="button"
                onClick={handleClick}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md hover:from-amber-300 hover:to-amber-400 active:scale-95 transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>INSTALL APLIKASI DEPOTEL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {variant === 'header' && (
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:from-blue-600 hover:to-blue-500 active:scale-95 transition cursor-pointer ${className}`}
          title="Pasang aplikasi DEPOTEL ke layar HP"
        >
          <Download className="h-3.5 w-3.5 text-amber-300" />
          <span className="hidden sm:inline">Install Aplikasi</span>
          <span className="sm:hidden text-[11px]">Install</span>
        </button>
      )}

      {variant === 'settings' && (
        <button
          type="button"
          onClick={handleClick}
          className={`flex w-full items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 text-left transition hover:bg-blue-100/70 active:scale-[0.99] cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-900">
                INSTALL APLIKASI DEPOTEL
              </div>
              <div className="text-[11px] text-blue-700">
                Pasang di Android, iPhone, iPad, atau Laptop
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Pasang</span>
          </div>
        </button>
      )}

      {variant === 'compact' && (
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer ${className}`}
        >
          <Download className="h-3.5 w-3.5" />
          <span>Install</span>
        </button>
      )}

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
