import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, X, UserPlus, CalendarPlus, DollarSign } from 'lucide-react';
import { getTodayString } from '../../utils/formatters';

export const GlobalActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openPatientModal, openSeanceModal, openPaiementModal } = useApp();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAction = (callback: () => void) => {
    setIsOpen(false);
    callback();
  };

  return (
    <>
      {/* Dimmed Backdrop when menu is active */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Action Menu Container */}
      <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40 flex flex-col items-end gap-3 select-none">
        
        {/* Speed-dial action items */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-1 animate-in slide-in-from-bottom-5 fade-in duration-200">
            
            {/* 1. + Patient */}
            <button
              onClick={() => handleAction(() => openPatientModal())}
              className="flex items-center gap-3 bg-white hover:bg-teal-50/90 text-slate-800 pl-4 pr-3.5 py-2.5 rounded-2xl shadow-xl border border-teal-100 hover:border-teal-300 transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <div className="text-right">
                <span className="block text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-teal-700">
                  + Patient
                </span>
                <span className="block text-[10px] text-slate-500">
                  Nouveau dossier médical
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30 group-hover:bg-teal-700 transition-colors shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
            </button>

            {/* 2. + Séance */}
            <button
              onClick={() => handleAction(() => openSeanceModal(null, undefined, getTodayString()))}
              className="flex items-center gap-3 bg-white hover:bg-emerald-50/90 text-slate-800 pl-4 pr-3.5 py-2.5 rounded-2xl shadow-xl border border-emerald-100 hover:border-emerald-300 transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <div className="text-right">
                <span className="block text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-700">
                  + Séance
                </span>
                <span className="block text-[10px] text-slate-500">
                  Planifier 45 min
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:bg-emerald-700 transition-colors shrink-0">
                <CalendarPlus className="w-5 h-5" />
              </div>
            </button>

            {/* 3. + Paiement */}
            <button
              onClick={() => handleAction(() => openPaiementModal())}
              className="flex items-center gap-3 bg-white hover:bg-amber-50/90 text-slate-800 pl-4 pr-3.5 py-2.5 rounded-2xl shadow-xl border border-amber-100 hover:border-amber-300 transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <div className="text-right">
                <span className="block text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-700">
                  + Paiement
                </span>
                <span className="block text-[10px] text-slate-500">
                  Encaisser honoraires
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/30 group-hover:bg-amber-700 transition-colors shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
            </button>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 sm:w-15 sm:h-15 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
            isOpen
              ? 'bg-slate-800 hover:bg-slate-900 rotate-90 scale-105 shadow-slate-900/40 ring-4 ring-white'
              : 'bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 shadow-teal-600/40 ring-4 ring-white/80 hover:scale-105 animate-subtle-bounce'
          }`}
          aria-label={isOpen ? 'Fermer le menu des actions rapides' : 'Ajouter un patient, une séance ou un paiement'}
          title={isOpen ? 'Fermer' : 'Actions rapides (+)'}
        >
          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <Plus className="w-7 h-7 stroke-[2.5]" />
          )}
        </button>
      </div>
    </>
  );
};
