import React from 'react';
import { Home, Settings, Layers } from 'lucide-react';

interface BottomNavProps {
  currentView: 'dashboard' | 'monitoring';
  onNavigateDashboard: () => void;
  onNavigateMonitoring: () => void;
  onOpenSettings: () => void;
  hasActivePeriod: boolean;
  activePeriodName?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigateDashboard,
  onNavigateMonitoring,
  onOpenSettings,
  hasActivePeriod,
  activePeriodName: _activePeriodName,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
      <div className="w-full max-w-3xl pointer-events-auto border-t border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xl py-3 px-6 flex items-center justify-around">
        {/* Dashboard Button */}
        <button
          type="button"
          onClick={onNavigateDashboard}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            currentView === 'dashboard'
              ? 'text-slate-950 font-black'
              : 'text-slate-400 hover:text-slate-600 font-semibold'
          }`}
        >
          <Home className={`h-6 w-6 ${currentView === 'dashboard' ? 'stroke-[2.5] text-blue-700' : ''}`} />
          <span className="text-xs sm:text-sm tracking-tight">Dashboard</span>
        </button>

        {/* Monitoring Site Button */}
        {hasActivePeriod && (
          <button
            type="button"
            onClick={onNavigateMonitoring}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              currentView === 'monitoring'
                ? 'text-blue-700 font-black'
                : 'text-slate-400 hover:text-slate-600 font-semibold'
            }`}
          >
            <Layers className={`h-6 w-6 ${currentView === 'monitoring' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs sm:text-sm tracking-tight truncate max-w-[150px]">
              {currentView === 'monitoring' ? 'Monitoring' : 'Buka Site'}
            </span>
          </button>
        )}

        {/* Pengaturan Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 font-semibold transition cursor-pointer"
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs sm:text-sm tracking-tight">Pengaturan</span>
        </button>
      </div>
    </nav>
  );
};
