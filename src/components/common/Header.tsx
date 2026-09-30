import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  Search,
  Plus,
  Maximize2,
  Minimize2,
  UserPlus,
  CalendarPlus,
  DollarSign,
  Activity,
  X,
  Stethoscope,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Settings,
} from 'lucide-react';
import { PWAInstallButton, OfflineBanner } from './PWAInstallButton';
import { getTodayString } from '../../utils/formatters';

export const Header: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    globalSearch,
    setGlobalSearch,
    isFullscreen,
    toggleFullscreen,
    openPatientModal,
    openSeanceModal,
    openPaiementModal,
    stats,
    config,
  } = useApp();

  const [isQuickMenuOpen, setIsQuickMenuOpen] = React.useState(false);

  const navItems: { id: NavigationTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Accueil', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users, badge: stats.totalPatients },
    { id: 'planning', label: 'Agenda', icon: Calendar, badge: stats.seancesAujourdhui },
    { id: 'finances', label: 'Paiements', icon: CreditCard, badge: stats.creancesTotal > 0 ? 1 : undefined },
    { id: 'plus', label: 'Plus', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <OfflineBanner />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900">
                  {config.nomPraticien}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase bg-teal-50 text-teal-700 rounded-md border border-teal-200/60">
                  Pro
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate max-w-[170px] sm:max-w-[240px]">
                Cabinet d'orthophonie
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 shadow-xs border border-teal-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Global Search & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 lg:flex-initial justify-end">
            {/* Realtime Search Bar */}
            <div className="relative w-full max-w-[160px] sm:max-w-[240px] md:max-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (e.target.value && currentTab !== 'patients') {
                    setCurrentTab('patients');
                  }
                }}
                placeholder="Rechercher patient, tel, CNAM..."
                className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-teal-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-all placeholder:text-slate-400"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Quick Action Add Button */}
            <div className="relative">
              <button
                onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouveau</span>
              </button>

              {isQuickMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsQuickMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        openPatientModal();
                      }}
                      className="w-full px-4 py-2.5 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2.5 font-medium transition-colors"
                    >
                      <UserPlus className="w-4 h-4 text-teal-600" />
                      <span>Nouveau Patient</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        openSeanceModal(null, undefined, getTodayString());
                      }}
                      className="w-full px-4 py-2.5 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2.5 font-medium transition-colors border-t border-slate-100"
                    >
                      <CalendarPlus className="w-4 h-4 text-emerald-600" />
                      <span>+ Séance 45 min</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        openPaiementModal();
                      }}
                      className="w-full px-4 py-2.5 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2.5 font-medium transition-colors border-t border-slate-100"
                    >
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      <span>Encaisser un Paiement</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
