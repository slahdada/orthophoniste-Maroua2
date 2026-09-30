import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
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
  Calendar as CalendarIcon,
  User,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDateFr, getTelLink, getTodayString } from '../../utils/formatters';
import { Seance, StatutSeance } from '../../types';
import { QuickPayWidget } from '../common/QuickPayWidget';

interface DayCell {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  seances: Seance[];
}

export const MonthlyCalendarView: React.FC = () => {
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

  const todayStr = getTodayString();
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [isDayModalOpen, setIsDayModalOpen] = useState<boolean>(false);

  // Month navigation
  const handlePrevMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleGoCurrentMonth = () => {
    setViewDate(new Date());
    setSelectedDateStr(todayStr);
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0-indexed

  // Month title formatted in French (e.g., "Septembre 2026")
  const monthTitle = useMemo(() => {
    return viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }, [viewDate]);

  // Generate 35 or 42 calendar grid cells (Monday to Sunday)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Get day of week for the 1st day (0 = Sunday, 1 = Monday, etc.)
    let startDayOfWeek = firstDayOfMonth.getDay();
    // Convert so that Monday is 0 and Sunday is 6
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const daysInMonth = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    const cells: DayCell[] = [];

    // 1. Previous month leading days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const dStr = prevDate.toISOString().split('T')[0];
      const daySeances = seances.filter((s) => s.date === dStr).sort((a, b) => a.heure.localeCompare(b.heure));

      cells.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
        seances: daySeances,
      });
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const curDate = new Date(currentYear, currentMonth, dayNum);
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = `${currentYear}-${mStr}-${String(dayNum).padStart(2, '0')}`;
      const daySeances = seances.filter((s) => s.date === dStr).sort((a, b) => a.heure.localeCompare(b.heure));

      cells.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
        seances: daySeances,
      });
    }

    // 3. Next month trailing days to complete grid to 35 or 42 slots
    const totalSlots = cells.length <= 35 ? 35 : 42;
    const remainingSlots = totalSlots - cells.length;

    for (let dayNum = 1; dayNum <= remainingSlots; dayNum++) {
      const nextDate = new Date(currentYear, currentMonth + 1, dayNum);
      const mStr = String(((currentMonth + 1) % 12) + 1).padStart(2, '0');
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dStr = `${y}-${mStr}-${String(dayNum).padStart(2, '0')}`;
      const daySeances = seances.filter((s) => s.date === dStr).sort((a, b) => a.heure.localeCompare(b.heure));

      cells.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
        seances: daySeances,
      });
    }

    return cells;
  }, [currentYear, currentMonth, seances, todayStr, selectedDateStr]);

  // Monthly stats
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthSeances = seances.filter((s) => s.date.startsWith(monthPrefix));
  const monthRealisees = monthSeances.filter((s) => s.statut === 'Réalisée').length;
  const monthAbsents = monthSeances.filter((s) => s.statut === 'Patient absent').length;
  const monthRecettes = monthRealisees * config.tarifDefaut;

  // Selected Day's Sessions
  const selectedDaySeances = useMemo(() => {
    return seances
      .filter((s) => s.date === selectedDateStr)
      .sort((a, b) => a.heure.localeCompare(b.heure));
  }, [seances, selectedDateStr]);

  const selectedDayRealisees = selectedDaySeances.filter((s) => s.statut === 'Réalisée').length;
  const selectedDayHonoraires = selectedDayRealisees * config.tarifDefaut;

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Cell click handler: selects day & opens contextual modal
  const handleCellClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setIsDayModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Month Navigator & Summary Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Arrows & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
              title="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
              title="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 capitalize tracking-tight flex items-center gap-2">
              <span>{monthTitle}</span>
              {viewDate.getMonth() !== new Date().getMonth() || viewDate.getFullYear() !== new Date().getFullYear() ? (
                <button
                  onClick={handleGoCurrentMonth}
                  className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md hover:bg-teal-100 transition-colors cursor-pointer border border-teal-200"
                >
                  Ce mois-ci
                </button>
              ) : null}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {monthSeances.length} séance(s) au total • {monthRealisees} réalisée(s)
            </p>
          </div>
        </div>

        {/* Quick Month Metrics */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Réalisées : </span>
            <span className="font-extrabold text-emerald-600">{monthRealisees}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Absents : </span>
            <span className="font-extrabold text-amber-600">{monthAbsents}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
            <span className="text-teal-600 font-medium">Recettes est. : </span>
            <span className="font-extrabold">{formatCurrency(monthRecettes, config.devise)}</span>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-slate-100/80 border-b border-slate-200 text-center text-xs font-bold text-slate-600 py-2.5">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className={idx >= 5 ? 'text-teal-700 font-extrabold' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 text-xs">
          {calendarDays.map((cell) => {
            const hasSeances = cell.seances.length > 0;
            const isSelected = cell.dateStr === selectedDateStr;

            return (
              <div
                key={cell.dateStr}
                onClick={() => handleCellClick(cell.dateStr)}
                onDoubleClick={() => openSeanceModal(null, undefined, cell.dateStr)}
                className={`min-h-[75px] sm:min-h-[105px] p-1 sm:p-2 transition-all cursor-pointer flex flex-col justify-between group relative ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/50 text-slate-400 opacity-60'
                    : isSelected
                    ? 'bg-teal-50/70 ring-2 ring-teal-600 ring-inset z-10'
                    : 'bg-white hover:bg-teal-50/30'
                }`}
              >
                {/* Cell Header: Day Number & Session Count */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                      cell.isToday
                        ? 'bg-teal-600 text-white shadow-xs'
                        : isSelected
                        ? 'bg-teal-800 text-white'
                        : cell.isCurrentMonth
                        ? 'text-slate-800 group-hover:text-teal-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Add séance quick button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSeanceModal(null, undefined, cell.dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-teal-100 text-teal-700 transition-opacity hidden sm:block cursor-pointer"
                    title={`Ajouter une séance le ${cell.dateStr}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {/* Mobile count chip */}
                  {hasSeances && (
                    <span className="sm:hidden px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-teal-100 text-teal-800">
                      {cell.seances.length}
                    </span>
                  )}
                </div>

                {/* Desktop Session Pills List */}
                <div className="hidden sm:flex flex-col gap-1 mt-1 overflow-hidden">
                  {cell.seances.slice(0, 3).map((s) => {
                    let pillBg = 'bg-slate-100 text-slate-800 border-slate-200';
                    if (s.statut === 'Confirmée') pillBg = 'bg-sky-50 text-sky-800 border-sky-200 font-semibold';
                    if (s.statut === 'Réalisée') pillBg = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
                    if (s.statut === 'Annulée') pillBg = 'bg-rose-50 text-rose-800 border-rose-200 line-through';
                    if (s.statut === 'Patient absent') pillBg = 'bg-amber-50 text-amber-800 border-amber-200';

                    return (
                      <div
                        key={s.id}
                        className={`px-1.5 py-0.5 rounded-md border text-[10px] truncate leading-tight flex items-center gap-1 ${pillBg}`}
                        title={`${s.heure} - ${s.patientNom} (${s.statut})`}
                      >
                        <span className="font-bold shrink-0">{s.heure}</span>
                        <span className="truncate">{s.patientNom.split(' ')[0]}</span>
                      </div>
                    );
                  })}

                  {cell.seances.length > 3 && (
                    <span className="text-[9px] font-bold text-slate-500 pl-1">
                      +{cell.seances.length - 3} autre(s)
                    </span>
                  )}
                </div>

                {/* Mobile status dots */}
                <div className="sm:hidden flex items-center justify-center gap-1 mt-1">
                  {cell.seances.slice(0, 4).map((s) => {
                    let dotColor = 'bg-slate-400';
                    if (s.statut === 'Confirmée') dotColor = 'bg-sky-500';
                    if (s.statut === 'Réalisée') dotColor = 'bg-emerald-500';
                    if (s.statut === 'Annulée') dotColor = 'bg-rose-400';
                    if (s.statut === 'Patient absent') dotColor = 'bg-amber-500';
                    return <span key={s.id} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALE CONTEXTUELLE / VOLET DU JOUR AU CLIC SUR UNE CELLULE DU CALENDRIER */}
      {/* ========================================================================= */}
      {isDayModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsDayModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/15 rounded-2xl shrink-0">
                  <CalendarIcon className="w-5 h-5 text-teal-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg leading-tight capitalize">
                      {formatDateFr(selectedDateStr, true)}
                    </h3>
                    {selectedDateStr === todayStr && (
                      <span className="px-2 py-0.5 bg-emerald-400/25 border border-emerald-300/40 text-emerald-200 rounded-full text-[10px] font-bold">
                        Aujourd'hui
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-teal-100 mt-0.5">
                    {selectedDaySeances.length} séance(s) programmée(s) • {selectedDayRealisees} réalisée(s)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openSeanceModal(null, undefined, selectedDateStr)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-teal-800 hover:bg-teal-50 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="Ajouter une séance ce jour"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">+ Séance</span>
                </button>
                <button
                  onClick={() => setIsDayModalOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Sessions List for the selected day */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {selectedDaySeances.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">Aucune séance pour cette date</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Aucun rendez-vous d'orthophonie n'est encore programmé pour le {formatDateFr(selectedDateStr)}.
                  </p>
                  <button
                    onClick={() => openSeanceModal(null, undefined, selectedDateStr)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>Planifier une séance de 45 min</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDaySeances.map((seance) => {
                    const patient = patients.find((p) => p.id === seance.patientId);

                    let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (seance.statut === 'Confirmée') badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
                    if (seance.statut === 'Réalisée') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (seance.statut === 'Annulée') badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                    if (seance.statut === 'Patient absent') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

                    return (
                      <div
                        key={seance.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        {/* Time & Patient */}
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-16 py-2 bg-slate-100 text-slate-800 rounded-xl text-center shrink-0 font-bold group-hover:bg-teal-50 group-hover:text-teal-900 transition-colors">
                            <span className="text-xs sm:text-sm block">{seance.heure}</span>
                            <span className="text-[10px] text-slate-500 font-medium">{seance.duree} min</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                onClick={() => {
                                  if (patient) {
                                    setIsDayModalOpen(false);
                                    setSelectedPatientId(patient.id);
                                    setCurrentTab('patients');
                                  }
                                }}
                                className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-teal-700 cursor-pointer flex items-center gap-1"
                              >
                                <span>{seance.patientNom}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                              </h4>
                              {patient?.couverture && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                                  {patient.couverture}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {seance.notes || patient?.diagnostic || 'Séance de rééducation'}
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
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-hidden ${badgeColor}`}
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
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer border border-emerald-200"
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

            {/* Modal Footer Summary */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="text-slate-600 font-medium">
                <span>{selectedDaySeances.length} rendez-vous</span>
                {selectedDayRealisees > 0 && (
                  <span className="ml-2 font-bold text-emerald-700">
                    • {formatCurrency(selectedDayHonoraires, config.devise)} réalisés
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsDayModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
