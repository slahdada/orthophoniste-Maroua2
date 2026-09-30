import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Calendar,
  CreditCard,
  AlertCircle,
  Clock,
  Phone,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserX,
  FileCheck2,
  CalendarPlus,
  UserPlus,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatDateFr, getTodayString, getTelLink } from '../../utils/formatters';
import { StatutSeance } from '../../types';
import { QuickPayWidget } from '../common/QuickPayWidget';

export const DashboardView: React.FC = () => {
  const {
    stats,
    creances,
    seances,
    patients,
    protocoles,
    config,
    setCurrentTab,
    setSelectedPatientId,
    openSeanceModal,
    openPatientModal,
    openPaiementModal,
    updateSeanceStatut,
    openWhatsAppModal,
    getProtocoleProgress,
  } = useApp();

  const todayStr = getTodayString();
  const seancesAujourdhuiList = seances
    .filter((s) => s.date === todayStr)
    .sort((a, b) => a.heure.localeCompare(b.heure));

  const seancesRealiseesAujourdhui = seancesAujourdhuiList.filter((s) => s.statut === 'Réalisée').length;

  // Calculs dynamiques de la section "À traiter"
  // 1. Paiements en retard
  const paiementsEnRetard = creances.slice(0, 3);

  // 2. Séances à venir non confirmées (statut 'Prévue')
  const seancesNonConfirmees = seances
    .filter((s) => s.date >= todayStr && s.statut === 'Prévue')
    .sort((a, b) => `${a.date} ${a.heure}`.localeCompare(`${b.date} ${b.heure}`))
    .slice(0, 3);

  // 3. Dossiers à compléter ou renouvellements CNAM proches de la fin (>80% calculé dynamiquement)
  const protocolesProchesFin = protocoles.filter((p) => {
    return getProtocoleProgress(p).isProcheFin;
  });

  const patientsSansCnam = patients.filter((p) => {
    return (p.couverture || '').toUpperCase().includes('CNAM') && !p.numeroCnam;
  });

  const totalActionsATraiter =
    paiementsEnRetard.length +
    seancesNonConfirmees.length +
    protocolesProchesFin.length +
    patientsSansCnam.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ========================================================================= */}
      {/* EN-TÊTE : ACCUEIL OPÉRATIONNEL DU JOUR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-bold backdrop-blur-xs mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="capitalize">{formatDateFr(todayStr, true)}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Bonjour, {config.nomPraticien} 👋
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl">
            {seancesAujourdhuiList.length > 0
              ? `${seancesAujourdhuiList.length} séance(s) au planning aujourd’hui (${seancesRealiseesAujourdhui} effectuée(s)).`
              : 'Aucune séance programmée pour aujourd’hui.'}
          </p>
        </div>

        {/* Boutons d'action rapide */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={() => openSeanceModal(null, undefined, todayStr)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-teal-900 hover:bg-teal-50 text-xs font-extrabold shadow-md transition-all cursor-pointer active:scale-95"
          >
            <CalendarPlus className="w-4 h-4 text-teal-700" />
            <span>+ Séance 45 min</span>
          </button>
          <button
            onClick={() => openPatientModal()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Patient</span>
          </button>
          <button
            onClick={() => openPaiementModal()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
          >
            <DollarSign className="w-4 h-4 text-amber-300" />
            <span>+ Paiement</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 COMPTEURS CLÉS INDISPENSABLES */}
      {/* Patients · Séances aujourd'hui · Créances · Paiements du mois */}
      {/* ========================================================================= */}
      {stats.totalPatients === 0 && (
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50/50 to-teal-50 rounded-3xl p-6 sm:p-8 border border-teal-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-teal-600/30">
              <UserPlus className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Bienvenue dans votre cabinet
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg">
                Votre base est prête pour vos consultations réelles. Commencez par créer votre premier dossier patient pour démarrer la planification.
              </p>
            </div>
          </div>
          <button
            onClick={() => openPatientModal()}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-teal-600/20 hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Commencer par créer mon premier dossier</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Patients */}
        <div
          onClick={() => setCurrentTab('patients')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Patients</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalPatients}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {stats.patientsCnam} CNAM • {stats.patientsBridge} BRIDGE
          </p>
        </div>

        {/* 2. Séances aujourd'hui */}
        <div
          onClick={() => setCurrentTab('planning')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Séances Aujourd'hui</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
            {stats.seancesAujourdhui}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {seancesRealiseesAujourdhui} réalisée(s) • {stats.seancesAVenir} à venir
          </p>
        </div>

        {/* 3. Créances */}
        <div
          onClick={() => setCurrentTab('finances')}
          className={`rounded-2xl p-4 sm:p-5 border shadow-xs hover:shadow-md transition-all cursor-pointer group ${
            stats.creancesTotal > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Créances en attente</span>
            <div className={`p-2 rounded-xl ${stats.creancesTotal > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className={`mt-2 text-xl sm:text-2xl font-black ${stats.creancesTotal > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {formatCurrency(stats.creancesTotal, config.devise)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {creances.length} dossier(s) à relancer
          </p>
        </div>

        {/* 4. Paiements du mois */}
        <div
          onClick={() => setCurrentTab('finances')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Paiements du mois</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
            {formatCurrency(stats.paiementsMoisCourant, config.devise)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Total : {formatCurrency(stats.paiementsRecusTotal, config.devise)}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COCKPIT DU TRAVAIL DU JOUR : AUJOURD'HUI vs À TRAITER */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNE 1 & 2 : AUJOURD'HUI (SÉANCES DU JOUR EN DÉTAILS) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700 font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Aujourd’hui
                  </h2>
                  <p className="text-xs text-slate-500">
                    {seancesAujourdhuiList.length} séance(s) au programme
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('planning')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Agenda complet</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {seancesAujourdhuiList.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">Aucune séance aujourd’hui</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Votre planning est libre pour aujourd'hui. Vous pouvez programmer un nouveau rendez-vous en un clic.
                </p>
                <button
                  onClick={() => openSeanceModal(null, undefined, todayStr)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>+ Programmer une séance aujourd'hui</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {seancesAujourdhuiList.map((seance) => {
                  const patient = patients.find((p) => p.id === seance.patientId);

                  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (seance.statut === 'Confirmée') badgeColor = 'bg-sky-50 text-sky-800 border-sky-200';
                  if (seance.statut === 'Réalisée') badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  if (seance.statut === 'Annulée') badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
                  if (seance.statut === 'Patient absent') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';

                  return (
                    <div
                      key={seance.id}
                      className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-teal-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white group"
                    >
                      {/* Heure — Patient & Diagnostic */}
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-16 py-2 bg-slate-100 text-slate-900 rounded-xl text-center shrink-0 font-bold group-hover:bg-teal-50 group-hover:text-teal-900 transition-colors">
                          <span className="text-xs sm:text-sm block">{seance.heure}</span>
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
                            {patient?.couverture && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                                {patient.couverture}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {seance.notes || patient?.diagnostic || 'Séance d’orthophonie'}
                            <span className="ml-2 font-semibold text-slate-700">
                              • {formatCurrency(seance.tarif || patient?.tarifSeance || config.tarifDefaut, config.devise)}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Statut & Actions de contact direct */}
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
                              title="Message WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLONNE 3 : "À TRAITER" (URGENCES, PAIEMENTS EN RETARD & ACTIONS) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">À traiter</h2>
                  <p className="text-[11px] text-slate-500">Actions prioritaires du cabinet</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full">
                {totalActionsATraiter} action(s)
              </span>
            </div>

            {/* 1. Paiements en retard */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                <span className="flex items-center gap-1.5 text-amber-800">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  <span>{creances.length} paiement(s) en retard</span>
                </span>
                {creances.length > 0 && (
                  <button
                    onClick={() => setCurrentTab('finances')}
                    className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
                  >
                    Voir tout
                  </button>
                )}
              </div>

              {creances.length === 0 ? (
                <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Tous les paiements sont à jour.</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {paiementsEnRetard.map((item) => (
                    <div
                      key={item.patient.id}
                      className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-2 text-xs"
                    >
                      <div
                        className="cursor-pointer truncate"
                        onClick={() => {
                          setSelectedPatientId(item.patient.id);
                          setCurrentTab('patients');
                        }}
                      >
                        <p className="font-bold text-slate-900 truncate hover:text-teal-700">
                          {item.patient.prenom} {item.patient.nom}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Retard: {item.joursRetard}j • Dû: {formatCurrency(item.resteDu, config.devise)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openWhatsAppModal(item.patient, undefined, 'relance_paiement', item.resteDu)}
                          className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors cursor-pointer"
                          title="Relancer WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openPaiementModal(item.patient.id)}
                          className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Encaisser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Séances non confirmées */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                <span className="flex items-center gap-1.5 text-sky-800">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>{seancesNonConfirmees.length} séance(s) à confirmer</span>
                </span>
                {seancesNonConfirmees.length > 0 && (
                  <button
                    onClick={() => setCurrentTab('planning')}
                    className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
                  >
                    Planning
                  </button>
                )}
              </div>

              {seancesNonConfirmees.length === 0 ? (
                <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Toutes les séances sont confirmées.</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {seancesNonConfirmees.map((s) => {
                    const pat = patients.find((p) => p.id === s.patientId);
                    return (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-200/80 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate">{s.patientNom}</p>
                          <p className="text-[10px] text-slate-500">
                            {formatDateFr(s.date)} à {s.heure}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {pat && (
                            <button
                              onClick={() => openWhatsAppModal(pat, s, 'confirmation_rdv')}
                              className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg cursor-pointer"
                              title="Demander confirmation WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => updateSeanceStatut(s.id, 'Confirmée')}
                            className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Confirmer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Dossiers à compléter / Quotas de renouvellement CNAM */}
            {(protocolesProchesFin.length > 0 || patientsSansCnam.length > 0) && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <span className="block text-xs font-bold text-slate-800">
                  📋 Dossiers & Protocoles à surveiller
                </span>

                {protocolesProchesFin.map((pr) => (
                  <div
                    key={pr.id}
                    onClick={() => {
                      setSelectedPatientId(pr.patientId);
                      setCurrentTab('patients');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{pr.patientNom}</p>
                      <p className="text-[10px] text-teal-700 font-semibold">
                        Renouvellement : {getProtocoleProgress(pr).realisees}/{pr.totalSeances} séances ({getProtocoleProgress(pr).pourcentage}%)
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}

                {patientsSansCnam.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPatientId(p.id);
                      setCurrentTab('patients');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{p.prenom} {p.nom}</p>
                      <p className="text-[10px] text-amber-700 font-semibold">N° CNAM manquant dans le dossier</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coordonnées du Cabinet */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-400">
              Cabinet {config.nomPraticien}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {config.specialite}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-750 text-[11px] text-slate-300 space-y-1">
              <p className="flex items-start gap-1.5">
                <span className="text-rose-400 shrink-0">📍</span>
                <span>{config.adresse}, {config.ville}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-teal-400 shrink-0">📞</span>
                <a href={getTelLink(config.telephone)} className="hover:text-teal-300 font-semibold">
                  {config.telephone}
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-sky-400 shrink-0">✉️</span>
                <a href={`mailto:${config.email}`} className="hover:text-sky-300">
                  {config.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
