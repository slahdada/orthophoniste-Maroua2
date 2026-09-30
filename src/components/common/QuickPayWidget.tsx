import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Seance, ModePaiement } from '../../types';
import { CheckCircle2, DollarSign, Clock, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface QuickPayWidgetProps {
  seance: Seance;
  compact?: boolean;
}

export const QuickPayWidget: React.FC<QuickPayWidgetProps> = ({ seance }) => {
  const { quickPaySeance, quickUnpaySeance, getSeancePaymentStatus, config } = useApp();
  const [isSelectingMode, setIsSelectingMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ModePaiement>('Espèces');

  // Single source of truth calculation
  const paymentInfo = getSeancePaymentStatus(seance.id);
  const { status, paidAmount, tarif, remainingAmount } = paymentInfo;

  const handlePayConfirm = (modeToUse: ModePaiement = selectedMode) => {
    quickPaySeance(seance.id, modeToUse, remainingAmount > 0 ? remainingAmount : tarif);
    setIsSelectingMode(false);
  };

  // If already completely paid
  if (status === 'Payée') {
    return (
      <button
        onClick={() => quickUnpaySeance(seance.id)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs group"
        title="Paiement intégral validé. Cliquer pour annuler le règlement"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Payée</span>
        <span className="text-[10px] text-emerald-600 font-medium">({formatCurrency(paidAmount, config.devise)})</span>
      </button>
    );
  }

  // If mode selector is open (2-click payment)
  if (isSelectingMode) {
    return (
      <div className="inline-flex items-center gap-1.5 p-1 bg-amber-50/95 border border-amber-300 rounded-xl animate-in fade-in duration-150 shadow-sm text-xs">
        <span className="text-[10px] font-extrabold text-amber-900 px-1">
          {remainingAmount > 0 ? `Reste ${formatCurrency(remainingAmount, config.devise)} :` : 'Régler :'}
        </span>
        
        {(['Espèces', 'Chèque', 'Virement'] as ModePaiement[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handlePayConfirm(mode)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedMode === mode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-amber-200'
            }`}
          >
            {mode}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setIsSelectingMode(false)}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
          title="Annuler"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // If partially paid
  if (status === 'Partiellement payée') {
    return (
      <button
        onClick={() => setIsSelectingMode(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
        title="Partiellement réglée. Cliquer pour encaisser le solde"
      >
        <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        <span>Partiellement payée</span>
        <span className="text-[10px] text-sky-700 font-semibold">({formatCurrency(paidAmount, config.devise)}/{formatCurrency(tarif, config.devise)})</span>
      </button>
    );
  }

  // Default unpaid state: [ À payer ]
  return (
    <button
      onClick={() => setIsSelectingMode(true)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
      title="Cliquer pour encaisser en 2 clics"
    >
      <DollarSign className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span>À payer</span>
      <span className="text-[10px] text-amber-700 font-semibold">({formatCurrency(tarif, config.devise)})</span>
    </button>
  );
};
