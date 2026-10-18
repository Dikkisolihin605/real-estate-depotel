import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Send,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredUsersCount: number;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  registeredUsersCount,
}) => {
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isPublished, setIsPublished] = useState<boolean | null>(null);
  const [selectedUrlType, setSelectedUrlType] = useState<'shared' | 'current'>('current');

  const sharedProductionUrl =
    'https://ais-pre-sw2koyy2muflakec6krfxb-148906958408.asia-southeast1.run.app';
  const currentOrigin =
    typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';

  const activeUrl =
    selectedUrlType === 'shared' ? sharedProductionUrl : `${currentOrigin}/?invite=true`;

  const checkProductionStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await fetch('/api/check-publish-status');
      if (res.ok) {
        const json = await res.json();
        setIsPublished(json.isPublished);
        if (json.isPublished) {
          setSelectedUrlType('shared');
        } else {
          setSelectedUrlType('current');
        }
      } else {
        // Fallback test
        setIsPublished(false);
        setSelectedUrlType('current');
      }
    } catch {
      setIsPublished(false);
      setSelectedUrlType('current');
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkProductionStatus();
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(activeUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = activeUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Halo Rekan Tim DEPOTEL GROUP, berikut link resmi aplikasi Monitoring Update Token & Swacam:\n\n🔗 ${activeUrl}\n\nSilakan klik link tersebut untuk membuka dashboard dan masuk menggunakan Akun Google/Gmail masing-masing atau pilih nama teknisi Anda.`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Publikasikan &amp; Bagikan Link DEPOTEL
              </h2>
              <p className="text-xs text-slate-500">
                Akses link resmi untuk seluruh HP tim &amp; teknisi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            title="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Status Banner */}
        <div
          className={`rounded-2xl p-4 border transition ${
            isPublished === true
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : isPublished === false
              ? 'bg-amber-50/90 border-amber-200 text-amber-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {isPublished === true ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : isPublished === false ? (
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Globe className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                    {isPublished === true
                      ? 'Link Publik Siap Digunakan'
                      : isPublished === false
                      ? 'Status: Perlu Dipublikasikan di Google AI Studio'
                      : 'Memeriksa Status Link Publik...'}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed opacity-90">
                  {isPublished === true
                    ? 'Aplikasi telah berhasil dipublikasikan. Link produksi publik di bawah ini dapat dibuka oleh semua rekan tim di HP Android, iPhone, tablet, dan PC tanpa error izin akun.'
                    : 'Untuk membuat link dapat diakses oleh semua orang tanpa error 404, klik tombol "Share" atau "Publish" di pojok kanan atas bilah Google AI Studio.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={checkProductionStatus}
              disabled={checkingStatus}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/5 transition cursor-pointer flex-shrink-0"
              title="Cek ulang status"
            >
              <RefreshCw
                className={`h-4 w-4 ${checkingStatus ? 'animate-spin text-blue-600' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* URL Selector Tabs */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Pilih Format Link:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedUrlType('current')}
              className={`rounded-xl p-3 text-left border transition cursor-pointer ${
                selectedUrlType === 'current'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 text-emerald-950'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Link Aktif Langsung</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                  Siap Dibuka
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                Langsung terbuka di HP tanpa error 404
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedUrlType('shared')}
              className={`rounded-xl p-3 text-left border transition cursor-pointer ${
                selectedUrlType === 'shared'
                  ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500 text-blue-950'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Link Publik Resmi (ais-pre)</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isPublished ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isPublished ? 'Aktif' : 'Perlu Publish'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                {isPublished ? 'Bisa dibuka oleh semua HP' : 'Error 404 jika belum klik Share'}
              </p>
            </button>
          </div>
        </div>

        {/* Link Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Tautan Aplikasi DEPOTEL</span>
            <span className="text-slate-400 font-normal text-[11px]">
              {registeredUsersCount} teknisi terdaftar
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-2 sm:p-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <Globe className="h-4 w-4 text-slate-400 flex-shrink-0 ml-1" />
            <input
              type="text"
              readOnly
              value={activeUrl}
              className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm font-mono font-bold text-slate-900 outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer flex-shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: WhatsApp & Open Tab */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Kirim Link ke WhatsApp Tim</span>
          </button>

          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 text-slate-600" />
            <span>Uji Buka di Tab Baru</span>
          </a>
        </div>

        {/* 3 Step Publishing Guide */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>3 Langkah Mudah Mempublikasikan Aplikasi:</span>
          </div>

          <ol className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                1
              </span>
              <span>
                Lihat di sudut kanan atas antarmuka <strong>Google AI Studio</strong>, lalu klik
                tombol <strong>&quot;Share&quot;</strong> atau <strong>&quot;Publish&quot;</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                2
              </span>
              <span>
                Pilih opsi <strong>&quot;Public&quot;</strong> agar siapa pun yang memiliki link
                dapat mengakses aplikasi.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                3
              </span>
              <span>
                Salin link resmi di atas lalu bagikan ke grup WhatsApp teknisi. Rekan tim dapat
                langsung masuk dengan <strong>Akun Google</strong> atau memilih nama mereka!
              </span>
            </li>
          </ol>
        </div>

        {/* Security & Feature Badges */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5 text-slate-400" />
            <span>Kompatibel Android &amp; iPhone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Login Google &amp; Data Aman</span>
          </div>
        </div>
      </div>
    </div>
  );
};
