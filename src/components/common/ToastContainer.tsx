import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        let bgClass = 'bg-slate-900/95 text-white border-slate-700/60';
        let IconComponent = CheckCircle2;
        let iconColor = 'text-teal-400';

        if (toast.type === 'error') {
          bgClass = 'bg-rose-950/95 text-rose-100 border-rose-800/80';
          IconComponent = XCircle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          bgClass = 'bg-amber-950/95 text-amber-100 border-amber-800/80';
          IconComponent = AlertTriangle;
          iconColor = 'text-amber-400';
        } else if (toast.type === 'info') {
          bgClass = 'bg-sky-950/95 text-sky-100 border-sky-800/80';
          IconComponent = Info;
          iconColor = 'text-sky-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md border text-sm font-medium transition-all transform animate-in slide-in-from-top-2 duration-200 ${bgClass}`}
          >
            <div className="flex items-center gap-2.5">
              <IconComponent className={`w-5 h-5 shrink-0 ${iconColor}`} />
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
