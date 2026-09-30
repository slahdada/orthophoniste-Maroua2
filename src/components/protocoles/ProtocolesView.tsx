import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Plus,
  Calendar,
  Trash2,
  X,
  Sparkles,
  CalendarPlus,
} from 'lucide-react';
import { formatDateFr, getTodayString } from '../../utils/formatters';
import { StatutProtocole } from '../../types';

export const ProtocolesView: React.FC = () => {
  const {
    protocoles,
    patients,
    addProtocole,
    updateProtocole,
    deleteProtocole,
    getProtocoleProgress,
    setSelectedPatientId,
    openSeanceModal,
    setCurrentTab,
    showToast,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [totalSeances, setTotalSeances] = useState(30);
  const [dateDebut, setDateDebut] = useState(getTodayString());
  const [dateFinEstimee, setDateFinEstimee] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [objectif, setObjectif] = useState('');
  const [statut, setStatut] = useState<StatutProtocole>('En cours');

  const handleOpenAdd = () => {
    if (patients.length > 0) {
      setPatientId(patients[0].id);
      setDiagnostic(patients[0].diagnostic || '');
    }
    setTotalSeances(30);
    setDateDebut(getTodayString());
    setDateFinEstimee('');
    setObjectif('Rééducation et automatisation des compétences orthophoniques');
    setStatut('En cours');
    setIsAddModalOpen(true);
  };

  const handleSaveProtocole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      showToast('Veuillez sélectionner un patient', 'error');
      return;
    }

    const pat = patients.find((p) => p.id === patientId);
    const patientNom = pat ? `${pat.prenom} ${pat.nom}` : 'Patient';

    addProtocole({
      patientId,
      patientNom,
      totalSeances: Number(totalSeances) || 30,
      dateDebut,
      dateFinEstimee,
      diagnostic,
      objectif,
      statut,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <span>Protocoles de Soins & Prises en Charge</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi automatique des quotas calculés en temps réel d'après les séances réelles
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouveau Protocole</span>
        </button>
      </div>

      {/* Protocoles Grid */}
      {protocoles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">Aucun protocole enregistré</h3>
          <p className="text-xs text-slate-500 mt-1">Créez un protocole pour suivre automatiquement l'évolution d'un patient.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {protocoles.map((proto) => {
            const pat = patients.find((p) => p.id === proto.patientId);
            const prog = getProtocoleProgress(proto);

            return (
              <div
                key={proto.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        if (pat) {
                          setSelectedPatientId(pat.id);
                          setCurrentTab('patients');
                        }
                      }}
                    >
                      <h3 className="text-sm font-extrabold text-slate-900 hover:text-teal-700 transition-colors">
                        {proto.patientNom}
                      </h3>
                      <p className="text-xs text-teal-700 font-semibold mt-0.5">
                        {proto.diagnostic || pat?.diagnostic || 'Rééducation Orthophonique'}
                      </p>
                    </div>

                    <select
                      value={proto.statut}
                      onChange={(e) => updateProtocole(proto.id, { statut: e.target.value as StatutProtocole })}
                      className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 cursor-pointer focus:outline-hidden"
                    >
                      <option value="En cours">En cours</option>
                      <option value="Terminé">✓ Terminé</option>
                      <option value="Suspendu">Suspendu</option>
                    </select>
                  </div>

                  {/* Progress bar calculated automatically */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">
                        {prog.realisees} / {prog.total} séances
                      </span>
                      <span className="text-teal-700 font-extrabold">{prog.pourcentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${prog.pourcentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>✓ {prog.realisees} réalisée(s)</span>
                      <span>{prog.restantes > 0 ? `⏳ ${prog.restantes} restante(s)` : 'Protocole complété ✓'}</span>
                    </div>
                  </div>

                  {/* Dates & Goal */}
                  <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Début : {formatDateFr(proto.dateDebut)}</span>
                    {proto.dateFinEstimee && <span>• Fin estimée : {formatDateFr(proto.dateFinEstimee)}</span>}
                  </div>

                  {proto.objectif && (
                    <p className="mt-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 line-clamp-2">
                      <span className="font-semibold text-slate-700">Objectif :</span> {proto.objectif}
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    onClick={() => openSeanceModal(null, proto.patientId, getTodayString())}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold border border-teal-200 transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-teal-600" />
                    <span>+ Séance</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-semibold border border-teal-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      Calcul auto
                    </span>
                    <button
                      onClick={() => deleteProtocole(proto.id)}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer ce protocole"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Protocole */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Nouveau Protocole de Soins</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProtocole} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => {
                    setPatientId(e.target.value);
                    const p = patients.find((pat) => pat.id === e.target.value);
                    if (p) setDiagnostic(p.diagnostic || '');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs sm:text-sm font-medium"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.prenom} {p.nom} ({p.couverture})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre prévu de séances</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalSeances}
                    onChange={(e) => setTotalSeances(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Statut initial</label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as StatutProtocole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold"
                  >
                    <option value="En cours">En cours</option>
                    <option value="Suspendu">Suspendu</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>
              </div>

              {/* Notice calculation auto */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  <strong>Calcul automatique :</strong> Le nombre de séances réalisées est calculé en temps réel d'après les séances réelles marquées « Réalisée ».
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    required
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date fin estimée</label>
                  <input
                    type="date"
                    value={dateFinEstimee}
                    onChange={(e) => setDateFinEstimee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic</label>
                <input
                  type="text"
                  value={diagnostic}
                  onChange={(e) => setDiagnostic(e.target.value)}
                  placeholder="Ex: Dyslexie, Retard de parole..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Objectifs thérapeutiques</label>
                <textarea
                  rows={2}
                  value={objectif}
                  onChange={(e) => setObjectif(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md"
                >
                  Créer le protocole
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
