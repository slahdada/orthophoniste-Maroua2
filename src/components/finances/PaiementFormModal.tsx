import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ModePaiement } from '../../types';
import { getTodayString } from '../../utils/formatters';
import { X, DollarSign, CreditCard, User, Calendar, FileText } from 'lucide-react';

export const PaiementFormModal: React.FC = () => {
  const {
    isPaiementModalOpen,
    defaultPaiementPatientId,
    closePaiementModal,
    addPaiement,
    patients,
    seances,
    paiements,
    config,
    showToast,
  } = useApp();

  const [patientId, setPatientId] = useState('');
  const [montant, setMontant] = useState<number>(45);
  const [date, setDate] = useState(getTodayString());
  const [mode, setMode] = useState<ModePaiement>('Espèces');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (defaultPaiementPatientId) {
      setPatientId(defaultPaiementPatientId);
      const pat = patients.find((p) => p.id === defaultPaiementPatientId);
      if (pat) {
        // Compute remaining balance for this patient to pre-fill
        const nbRealisees = seances.filter((s) => s.patientId === pat.id && s.statut === 'Réalisée').length;
        const totalFacture = nbRealisees * (pat.tarifSeance || config.tarifDefaut);
        const totalPaye = paiements.filter((p) => p.patientId === pat.id).reduce((acc, p) => acc + (p.montant || 0), 0);
        const resteDu = Math.max(0, totalFacture - totalPaye);
        setMontant(resteDu > 0 ? resteDu : pat.tarifSeance || config.tarifDefaut);
      }
    } else if (patients.length > 0) {
      setPatientId(patients[0].id);
      setMontant(patients[0].tarifSeance || config.tarifDefaut);
    }
    setDate(getTodayString());
    setMode('Espèces');
    setReference('');
    setNotes('');
  }, [defaultPaiementPatientId, isPaiementModalOpen, patients, seances, paiements, config]);

  if (!isPaiementModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      showToast('Veuillez choisir un patient', 'error');
      return;
    }
    if (!montant || montant <= 0) {
      showToast('Veuillez entrer un montant valide', 'error');
      return;
    }

    const patient = patients.find((p) => p.id === patientId);
    const patientNom = patient ? `${patient.prenom} ${patient.nom}` : 'Patient';

    addPaiement({
      patientId,
      patientNom,
      date,
      montant: Number(montant),
      mode,
      reference: reference.trim(),
      notes: notes.trim(),
    });

    closePaiementModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <DollarSign className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">Encaisser un Règlement</h2>
              <p className="text-xs text-emerald-100">Enregistrement comptable</p>
            </div>
          </div>
          <button
            onClick={closePaiementModal}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={patientId}
              onChange={(e) => {
                setPatientId(e.target.value);
                const pat = patients.find((p) => p.id === e.target.value);
                if (pat) setMontant(pat.tarifSeance || config.tarifDefaut);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-xs sm:text-sm font-medium"
            >
              <option value="">-- Sélectionner un patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.prenom} {p.nom} ({p.couverture})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Montant ({config.devise}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="5"
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-bold text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date du paiement <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mode de règlement
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['Espèces', 'Chèque', 'Virement', 'Autre'] as ModePaiement[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    mode === m
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {mode !== 'Espèces' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Référence / N° Chèque ou Virement
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: Chèque BIAT n°123456"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Détails (optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Règlement de 2 séances, forfait mensuel..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-xs"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closePaiementModal}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Enregistrer le paiement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
