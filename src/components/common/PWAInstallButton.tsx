import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '../../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, WifiOff } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Chromium / Android install prompt button */}
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer animate-pulse"
          title="Installer l'application sur votre écran d'accueil"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Installer l'App</span>
        </button>
      )}

      {/* iOS Safari manual install guide */}
      {isIOS && (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 text-xs font-medium transition-colors cursor-pointer"
            title="Installer sur iPhone / iPad"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Installer sur iOS</span>
            <span className="sm:hidden">Installer</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                      <Download className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Installer sur iPhone / iPad</h3>
                  </div>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl">
                    <div className="p-1.5 bg-white shadow-xs rounded-lg text-teal-600 shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">1. Touchez le bouton Partager</p>
                      <p className="text-slate-500 mt-0.5">En bas de l'écran dans le navigateur Safari.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl">
                    <div className="p-1.5 bg-white shadow-xs rounded-lg text-teal-600 shrink-0">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">2. Sélectionnez "Sur l'écran d'accueil"</p>
                      <p className="text-slate-500 mt-0.5">Faites défiler le menu vers le bas puis confirmez l'ajout.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-5 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  J'ai compris
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white text-xs font-medium px-4 py-1.5 flex items-center justify-center gap-2 shadow-xs">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>Mode hors ligne actif — Toutes vos modifications sont enregistrées localement.</span>
    </div>
  );
};
