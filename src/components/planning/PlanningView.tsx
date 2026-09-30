import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Phone,
  MessageSquare,
  Edit,
  Trash2,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  LayoutGrid,
} from 'lucide-react';
import { formatCurrency, formatDateFr, getTelLink, getTodayString } from '../../utils/formatters';
import { StatutSeance } from '../../types';
import { MonthlyCalendarView } from './MonthlyCalendarView';
import { QuickPayWidget } from '../common/QuickPayWidget';

type PlanningMode = 'month' | 'today' | 'day' | 'week' | 'list';

export const PlanningView: React.FC = () => {
  const {
    seances,
    patients,
    config,
    openSeanceModal,
    updateSeanceStatut,
    deleteSeance,
    openWhatsAppModal,
    setSelectedPatientId,
    setCurrentTab,
  } = useApp();

  // Default to 'month' for a direct full calendar experience
  const [mode, setMode] = useState<PlanningMode>('month');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Date manipulation helpers
  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (mode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (mode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleGoToday = () => {
    setSelectedDate(getTodayString());
  };

  // Filtered séances based on active mode & date
  const displayedSeances = useMemo(() => {
    if (mode === 'today') {
      const todayStr = getTodayString();
      return seances.filter((s) => s.date === todayStr).sort((a, b) => a.heure.localeCompare(b.heure));
    }
    if (mode === 'day') {
      return seances.filter((s) => s.date === selectedDate).sort((a, b) => a.heure.localeCompare(b.heure));
    }
    if (mode === 'week') {
      // Get start of week (Monday)
      const current = new Date(selectedDate);
      const day = current.getDay();
      const diff = current.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(current.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const monStr = monday.toISOString().split('T')[0];
      const sunStr = sunday.toISOString().split('T')[0];

      return seances
        .filter((s) => s.date >= monStr && s.date <= sunStr)
        .sort((a, b) => `${a.date} ${a.heure}`.localeCompare(`${b.date} ${b.heure}`));
    }
    // List mode
    return [...seances].sort((a, b) => `${b.date} ${b.heure}`.localeCompare(`${a.date} ${a.heure}`));
  }, [seances, mode, selectedDate]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Controls Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-600" />
            <span>Calendrier & Planning</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestion du planning, vue mensuelle complète et agenda des séances
          </p>
        </div>

        {/* Modes switch */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'month' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Mois</span>
            </button>
            <button
              onClick={() => {
                setMode('today');
                handleGoToday();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'today' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'day' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'week' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'list' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Journal
            </button>
          </div>

          <button
            onClick={() => openSeanceModal(null, undefined, selectedDate)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>+ Séance 45 min</span>
          </button>
        </div>
      </div>

      {/* RENDER MONTHLY CALENDAR GRID */}
      {mode === 'month' ? (
        <MonthlyCalendarView />
      ) : (
        /* RENDER DAY / TODAY / WEEK / JOURNAL LIST */
        <div className="space-y-4">
          {/* Navigation Header for Day & Week */}
          {mode !== 'list' && mode !== 'today' && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title="Précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {formatDateFr(selectedDate, true)}
                </span>
                {selectedDate !== getTodayString() && (
                  <button
                    onClick={handleGoToday}
                    className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    Aujourd'hui
                  </button>
                )}
              </div>

              <button
                onClick={handleNext}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title="Suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Sessions List */}
          {displayedSeances.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">Aucune séance planifiée</h3>
              <p className="text-xs text-slate-500 mt-1">
                Aucun rendez-vous pour la période sélectionnée.
              </p>
              <button
                onClick={() => openSeanceModal(null, undefined, selectedDate)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Planifier une séance de 45 min</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedSeances.map((seance) => {
                const patient = patients.find((p) => p.id === seance.patientId);

                let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                if (seance.statut === 'Confirmée') badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
                if (seance.statut === 'Réalisée') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (seance.statut === 'Annulée') badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                if (seance.statut === 'Patient absent') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <div
                    key={seance.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Time & Patient details */}
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-16 py-2 bg-slate-100 text-slate-800 rounded-xl text-center shrink-0 group-hover:bg-teal-50 group-hover:text-teal-900 transition-colors">
                        <span className="text-sm font-extrabold block">{seance.heure}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{seance.duree} min</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => {
                              if (patient) {
                                setSelectedPatientId(patient.id);
                                setCurrentTab('patients');
                              }
                            }}
                            className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-teal-700 transition-colors cursor-pointer"
                          >
                            {seance.patientNom}
                          </h3>
                          {mode !== 'today' && mode !== 'day' && (
                            <span className="text-xs font-semibold text-slate-500">
                              ({formatDateFr(seance.date)})
                            </span>
                          )}
                          {patient?.couverture && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                              {patient.couverture}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {seance.notes || patient?.diagnostic || 'Séance d’orthophonie'}
                          <span className="ml-2 font-semibold text-slate-700">
                            • {formatCurrency(seance.tarif || patient?.tarifSeance || config.tarifDefaut, config.devise)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Status Switcher & Contact Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      {/* 2-Click Quick Payment Widget */}
                      <QuickPayWidget seance={seance} />

                      <select
                        value={seance.statut}
                        onChange={(e) => updateSeanceStatut(seance.id, e.target.value as StatutSeance)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-hidden ${badgeColor}`}
                      >
                        <option value="Prévue">Prévue</option>
                        <option value="Confirmée">Confirmée</option>
                        <option value="Réalisée">✓ Réalisée</option>
                        <option value="Patient absent">Absent</option>
                        <option value="Annulée">Annulée</option>
                      </select>

                      {patient && (
                        <div className="flex items-center gap-1">
                          <a
                            href={getTelLink(patient.telephoneParent || patient.telephone)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Appeler"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => openWhatsAppModal(patient, seance, 'rappel_rdv')}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                            title="Rappel WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => openSeanceModal(seance)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteSeance(seance.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
