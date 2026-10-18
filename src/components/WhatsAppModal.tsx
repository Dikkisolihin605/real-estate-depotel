import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, MessageCircle, Send } from 'lucide-react';
import type { UpdateType } from '../types';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateType: UpdateType;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  updateType,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalSites = updateType.customTotalTarget || updateType.sites.length;
  const checkedCount = updateType.sites.filter((s) => s.checked).length;
  const uncheckedCount = Math.max(0, totalSites - checkedCount);
  const percentage =
    totalSites > 0 ? ((checkedCount / totalSites) * 100).toFixed(2).replace('.', ',') : '0,00';

  // Build exact WhatsApp format
  const lines: string[] = [];
  lines.push(`${updateType.name}`);
  lines.push(`${updateType.period}`);
  lines.push(`Jumlah Tiket Site : ${totalSites} Site`);
  lines.push(`✅ Sudah Tercentang : ${checkedCount} Site`);
  lines.push(`❌ Belum Tercentang : ${uncheckedCount} Site`);
  lines.push(`📊 Submitted : ${percentage}%`);
  lines.push(`===============================================`);
  lines.push(``);

  updateType.sites.forEach((site) => {
    const icon = site.checked ? '✅' : '❌';
    lines.push(`${icon} ${site.customerId} | ${site.siteCode}_${site.siteName}`);
    if (site.tokenNumber && site.tokenNumber.trim()) {
      const tokenLines = site.tokenNumber.trim().split('\n');
      tokenLines.forEach((tLine) => {
        if (tLine.trim()) {
          lines.push(`   ${tLine.trim()}`);
        }
      });
    }
  });

  const fullText = lines.join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-emerald-950/40 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Sandingkan dengan WhatsApp</h2>
              <p className="text-[11px] text-emerald-300">
                Format resmi pesan update DEPOTEL siap kirim ke grup WA
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Text Preview Box */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/90 font-mono text-xs text-slate-200">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 whitespace-pre-wrap select-all leading-relaxed">
            {fullText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 bg-slate-850 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            No Token ditampilkan langsung tanpa ikon catatan di daftar WA.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-blue-400" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:from-emerald-500 hover:to-green-500 active:scale-95 transition cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Buka WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
