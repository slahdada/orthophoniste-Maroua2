import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Seance, StatutSeance } from '../../types';
import { getTodayString, getCurrentTimeString } from '../../utils/formatters';
import { X, Calendar, Clock, User, DollarSign, FileText, Check } from 'lucide-react';

export const SeanceFormModal: React.FC = () => {
  const {
    isSeanceModalOpen,
    seanceToEdit,
    defaultSeancePatientId,
    defaultSeanceDate,
    closeSeanceModal,
    addSeance,
    updateSeance,
    patients,
    config,
    showToast,
  } = useApp();

  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [heure, setHeure] = useState('09:00');
  const [duree, setDuree] = useState(45);
  const [statut, setStatut] = useState<StatutSeance>('Prévue');
  const [tarif, setTarif] = useState(config.tarifDefaut);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (seanceToEdit) {
      setPatientId(seanceToEdit.patientId || '');
      setDate(seanceToEdit.date || getTodayString());
      setHeure(seanceToEdit.heure || '09:00');
      setDuree(seanceToEdit.duree || 45);
      setStatut(seanceToEdit.statut || 'Prévue');
      setTarif(seanceToEdit.tarif || config.tarifDefaut);
      setNotes(seanceToEdit.notes || '');
    } else {
      setPatientId(defaultSeancePatientId || (patients[0]?.id || ''));
      setDate(defaultSeanceDate || getTodayString());
      setHeure(getCurrentTimeString());
      setDuree(45);
      setStatut('Prévue');
      const pat = patients.find((p) => p.id === defaultSeancePatientId);
      setTarif(pat?.tarifSeance || config.tarifDefaut);
      setNotes('');
    }
  }, [seanceToEdit, defaultSeancePatientId, defaultSeanceDate, isSeanceModalOpen, patients, config]);

  if (!isSeanceModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      showToast('Veuillez sélectionner un patient', 'error');
      return;
    }

    const patient = patients.find((p) => p.id === patientId);
    const patientNom = patient ? `${patient.prenom} ${patient.nom}` : 'Patient';

    if (seanceToEdit) {
      updateSeance(seanceToEdit.id, {
        patientId,
        patientNom,
        date,
        heure,
        duree: Number(duree) || 45,
        statut,
        tarif: Number(tarif) || config.tarifDefaut,
        notes: notes.trim(),
      });
    } else {
      addSeance({
        patientId,
        patientNom,
        date,
        heure,
        duree: Number(duree) || 45,
        statut,
        tarif: Number(tarif) || config.tarifDefaut,
        paye: false,
        notes: notes.trim(),
      });
    }

    closeSeanceModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Calendar className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">
                {seanceToEdit ? 'Modifier la séance' : 'Nouvelle Séance d’orthophonie'}
              </h2>
              <p className="text-xs text-teal-100">
                Planning du Cabinet Belgaied Maroua
              </p>
            </div>
          </div>
          <button
            onClick={closeSeanceModal}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Patient Selector */}
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
                if (pat) setTarif(pat.tarifSeance || config.tarifDefaut);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 text-xs sm:text-sm font-medium"
            >
              <option value="">-- Choisir un patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.prenom} {p.nom} ({p.couverture})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date de la séance <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Heure (HH:MM) <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Durée Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Durée de la séance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 45, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuree(d)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    duree === d
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d} minutes
                </button>
              ))}
            </div>
          </div>

          {/* Statut & Tarif */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statut de la séance
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as StatutSeance)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 text-xs sm:text-sm"
              >
                <option value="Prévue">Prévue</option>
                <option value="Confirmée">Confirmée</option>
                <option value="Réalisée">Réalisée</option>
                <option value="Patient absent">Patient absent</option>
                <option value="Annulée">Annulée</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tarif ({config.devise})
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={tarif}
                onChange={(e) => setTarif(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Notes / Objectif de la séance */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Objectifs ou notes de séance
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Exercices de fluence, phonologie ch/j, bilan intermédiaire..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 text-xs sm:text-sm"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeSeanceModal}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {seanceToEdit ? 'Enregistrer la séance' : 'Valider la séance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
