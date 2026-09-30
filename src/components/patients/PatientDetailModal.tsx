import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Phone,
  MessageSquare,
  CalendarPlus,
  DollarSign,
  FilePlus,
  Printer,
  Trash2,
  Edit,
  X,
  Shield,
  Clock,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  CreditCard,
  Building,
  School,
  Save,
  Plus,
  ChevronRight,
  Sparkles,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { calculateAge, formatCurrency, formatDateFr, getTelLink, getTodayString } from '../../utils/formatters';
import { PdfGenerator } from '../../services/pdfGenerator';
import { StatutSeance } from '../../types';
import { QuickPayWidget } from '../common/QuickPayWidget';

type DossierTab = 'resume' | 'seances' | 'protocole' | 'paiements' | 'documents' | 'notes';

export const PatientDetailModal: React.FC = () => {
  const {
    selectedPatient,
    setSelectedPatientId,
    openPatientModal,
    openSeanceModal,
    openPaiementModal,
    openDocumentModal,
    openWhatsAppModal,
    openConfirmation,
    deletePatient,
    archivePatient,
    restorePatient,
    permanentlyDeletePatient,
    updatePatient,
    updateSeanceStatut,
    deleteSeance,
    deletePaiement,
    deleteDocument,
    seances,
    protocoles,
    paiements,
    documents,
    config,
    updateProtocole,
    getProtocoleProgress,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<DossierTab>('resume');
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  if (!selectedPatient) return null;

  const patient = selectedPatient;
  const ageStr = calculateAge(patient.dateNaissance);

  // Filter linked records
  const patSeances = seances
    .filter((s) => s.patientId === patient.id)
    .sort((a, b) => `${b.date} ${b.heure}`.localeCompare(`${a.date} ${a.heure}`));

  const patProto =
    protocoles.find((p) => p.patientId === patient.id && p.statut === 'En cours') ||
    protocoles.find((p) => p.patientId === patient.id);

  const protoProgress = patProto ? getProtocoleProgress(patProto) : null;

  const patPaiements = paiements
    .filter((p) => p.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const patDocs = documents
    .filter((d) => d.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Financial calculations
  const nbSeancesRealisees = patSeances.filter((s) => s.statut === 'Réalisée').length;
  const totalFacture = nbSeancesRealisees * (patient.tarifSeance || config.tarifDefaut);
  const totalPaye = patPaiements.reduce((acc, p) => acc + (p.montant || 0), 0);
  const resteDu = Math.max(0, totalFacture - totalPaye);

  // Next upcoming session
  const todayStr = getTodayString();
  const nextSeance = patSeances
    .filter((s) => s.date >= todayStr && s.statut !== 'Annulée' && s.statut !== 'Réalisée')
    .sort((a, b) => `${a.date} ${a.heure}`.localeCompare(`${b.date} ${b.heure}`))[0];

  const handleExportPdf = () => {
    PdfGenerator.generateFichePatientPdf(patient, config, patSeances, protocoles, patPaiements);
  };

  const handleSaveNotes = () => {
    updatePatient(patient.id, { notes: editingNotes });
    setIsEditingNotes(false);
  };

  const handleArchivePatient = () => {
    openConfirmation(
      'Archiver ce dossier patient ?',
      `Le dossier de ${patient.prenom} ${patient.nom} sera placé dans la corbeille. Ses rendez-vous et historiques restent conservés et vous pourrez récupérer le dossier à tout moment depuis la corbeille.`,
      () => {
        archivePatient(patient.id);
      },
      false,
      'Archiver le dossier'
    );
  };

  const handleRestorePatient = () => {
    restorePatient(patient.id);
  };

  const handlePermanentDeletePatient = () => {
    openConfirmation(
      'Supprimer définitivement ce dossier ?',
      `Attention : Cette action effacera de façon irréversible le dossier de ${patient.prenom} ${patient.nom} ainsi que toutes ses séances, protocoles, paiements et documents associés.`,
      () => {
        permanentlyDeletePatient(patient.id);
      },
      true,
      'Supprimer définitivement'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* ========================================================================= */}
        {/* HEADER COCKPIT PATIENT (LE CŒUR DE L'APPLICATION) */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white flex flex-col gap-3 sm:gap-4 shrink-0 shadow-md">
          {/* Top Line: Name — Age & Close button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{patient.prenom} {patient.nom}</span>
                <span className="text-teal-200 font-bold">—</span>
                <span className="text-teal-100 text-lg sm:text-xl font-bold">{ageStr}</span>
              </h1>

              {patient.couverture && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs border border-white/20">
                  {patient.couverture} {patient.assurance && patient.assurance !== patient.couverture ? `(${patient.assurance})` : ''}
                </span>
              )}

              {patient.isArchived && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-400 text-amber-950 border border-amber-300 flex items-center gap-1">
                  <Archive className="w-3 h-3" />
                  <span>Dossier en Corbeille</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => openPatientModal(patient)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Modifier les coordonnées du dossier"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedPatientId(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Fermer le dossier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Cockpit Bar: Appeler | WhatsApp | + Séance | + Paiement */}
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-white/10">
            {/* 📞 Appeler */}
            <a
              href={getTelLink(patient.telephoneParent || patient.telephone)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-teal-900 hover:bg-teal-50 text-xs font-extrabold shadow-sm transition-all active:scale-95"
              title="Appeler le patient ou son parent"
            >
              <Phone className="w-3.5 h-3.5 text-teal-700" />
              <span>📞 Appeler</span>
            </a>

            {/* 💬 WhatsApp */}
            <button
              onClick={() => openWhatsAppModal(patient, undefined, 'rappel_rdv', resteDu)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Envoyer un message WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>💬 WhatsApp</span>
            </button>

            {/* ➕ + Séance */}
            <button
              onClick={() => openSeanceModal(null, patient.id, getTodayString())}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Programmer une nouvelle séance de 45 min"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>+ Séance</span>
            </button>

            {/* 💳 + Paiement */}
            <button
              onClick={() => openPaiementModal(patient.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              title="Encaisser un paiement"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Paiement</span>
            </button>

            {/* 🖨️ PDF */}
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer hidden sm:flex"
              title="Télécharger la fiche patient A4 PDF"
            >
              <Printer className="w-3.5 h-3.5 text-teal-200" />
              <span>Dossier PDF</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6 ONGLETS DU DOSSIER PATIENT */}
        {/* Résumé | Séances | Protocole | Paiements | Documents | Notes */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 border-b border-slate-200 overflow-x-auto bg-slate-50 shrink-0 text-xs sm:text-sm font-bold text-slate-600 no-scrollbar">
          <button
            onClick={() => setActiveTab('resume')}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'resume'
                ? 'border-teal-600 text-teal-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Résumé</span>
          </button>

          <button
            onClick={() => setActiveTab('seances')}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'seances'
                ? 'border-teal-600 text-teal-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Séances ({patSeances.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('protocole')}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'protocole'
                ? 'border-teal-600 text-teal-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Protocole</span>
          </button>

          <button
            onClick={() => setActiveTab('paiements')}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'paiements'
                ? 'border-teal-600 text-teal-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Paiements {resteDu > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />}</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-teal-600 text-teal-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents ({patDocs.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('notes');
              setEditingNotes(patient.notes || '');
            }}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-teal-600 text-teal-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CORPS DES ONGLETS */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
          
          {/* ========================================== */}
          {/* TAB 1: RÉSUMÉ (VUE GLOBALE 360°) */}
          {/* ========================================== */}
          {activeTab === 'resume' && (
            <div className="space-y-5 text-xs sm:text-sm">
              {/* Quick Status Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Prochaine séance */}
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80">
                  <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
                    Prochaine Séance
                  </span>
                  {nextSeance ? (
                    <div className="mt-1">
                      <p className="font-extrabold text-slate-900 text-sm">
                        {formatDateFr(nextSeance.date, true)} à {nextSeance.heure}
                      </p>
                      <span className="text-[11px] text-teal-800 font-medium">{nextSeance.duree} min ({nextSeance.statut})</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500 font-medium">Aucune séance planifiée</p>
                  )}
                </div>

                {/* Quota protocole */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Protocole de Soins
                  </span>
                  {patProto && protoProgress ? (
                    <div className="mt-1">
                      <p className="font-extrabold text-slate-900 text-sm">
                        {protoProgress.realisees} / {protoProgress.total} séances
                      </p>
                      <div className="w-full h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full transition-all"
                          style={{ width: `${protoProgress.pourcentage}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500 font-medium">{nbSeancesRealisees} séances réalisées</p>
                  )}
                </div>

                {/* Situation financière */}
                <div className={`p-3.5 rounded-2xl border ${resteDu > 0 ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50/60 border-emerald-200'}`}>
                  <span className={`text-[11px] font-bold uppercase tracking-wider block ${resteDu > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                    Solde du Dossier
                  </span>
                  <p className={`mt-1 font-extrabold text-sm ${resteDu > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {resteDu > 0 ? `Reste dû : ${formatCurrency(resteDu, config.devise)}` : 'À jour de paiement ✓'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Total réglé : {formatCurrency(totalPaye, config.devise)}
                  </p>
                </div>
              </div>

              {/* Grid 2 colonnes avec tous les détails */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* État Civil & Identité */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-teal-700">
                    <User className="w-4 h-4" />
                    <span>État Civil & Scolarité</span>
                  </h3>
                  <div className="space-y-1 text-slate-700 text-xs">
                    <p><span className="text-slate-500 font-medium">Nom complet :</span> <span className="font-bold">{patient.prenom} {patient.nom}</span></p>
                    <p><span className="text-slate-500 font-medium">Date de naissance :</span> {formatDateFr(patient.dateNaissance)} ({ageStr})</p>
                    <p><span className="text-slate-500 font-medium">Sexe :</span> {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                    <p><span className="text-slate-500 font-medium">Établissement / Profession :</span> {patient.etablissementScolaire || patient.profession || '—'}</p>
                    <p><span className="text-slate-500 font-medium">Adresse :</span> {patient.adresse || '—'}</p>
                  </div>
                </div>

                {/* Prise en Charge & CNAM */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-teal-700">
                    <Shield className="w-4 h-4" />
                    <span>Assurance & Prise en Charge</span>
                  </h3>
                  <div className="space-y-1 text-slate-700 text-xs">
                    <p><span className="text-slate-500 font-medium">Couverture :</span> <span className="font-bold text-teal-700">{patient.couverture}</span></p>
                    <p><span className="text-slate-500 font-medium">Organisme :</span> {patient.assurance || '—'}</p>
                    <p><span className="text-slate-500 font-medium">N° Affiliation CNAM :</span> <span className="font-mono font-semibold">{patient.numeroCnam || '—'}</span></p>
                    <p><span className="text-slate-500 font-medium">Tarif unitaire :</span> <span className="font-bold">{formatCurrency(patient.tarifSeance || config.tarifDefaut, config.devise)}</span></p>
                  </div>
                </div>

                {/* Contacts & Entourage */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-teal-700">
                    <Phone className="w-4 h-4" />
                    <span>Contacts & Parents</span>
                  </h3>
                  <div className="space-y-1 text-slate-700 text-xs">
                    <p><span className="text-slate-500 font-medium">Téléphone Patient :</span> {patient.telephone || '—'}</p>
                    <p><span className="text-slate-500 font-medium">WhatsApp :</span> {patient.whatsapp || patient.telephone || '—'}</p>
                    <p><span className="text-slate-500 font-medium">Parent / Tuteur :</span> {patient.parentNom || '—'}</p>
                    <p><span className="text-slate-500 font-medium">Téléphone Parent :</span> {patient.telephoneParent || '—'}</p>
                  </div>
                </div>

                {/* Clinique & Diagnostic */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-teal-700">
                    <Activity className="w-4 h-4" />
                    <span>Clinique & Diagnostic</span>
                  </h3>
                  <div className="space-y-1 text-slate-700 text-xs">
                    <p><span className="text-slate-500 font-medium">Médecin Prescripteur :</span> {patient.medecinReferent || 'Non spécifié'}</p>
                    <p><span className="text-slate-500 font-medium">1ère consultation :</span> {formatDateFr(patient.datePremiereConsultation)}</p>
                    <p><span className="text-slate-500 font-medium">Diagnostic :</span> <span className="font-bold text-slate-900">{patient.diagnostic || '—'}</span></p>
                  </div>
                </div>
              </div>

              {/* Archive / Corbeille Zone */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                <span className="text-xs text-slate-400">
                  Dossier créé le {formatDateFr(patient.createdAt)}
                  {patient.isArchived && patient.archivedAt && (
                    <span className="text-amber-600 font-semibold ml-2">
                      • Archivé le {formatDateFr(patient.archivedAt)}
                    </span>
                  )}
                </span>

                {patient.isArchived ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRestorePatient}
                      className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurer le dossier</span>
                    </button>
                    <button
                      onClick={handlePermanentDeletePatient}
                      className="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer définitivement</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleArchivePatient}
                    className="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-amber-200 shadow-2xs"
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-700" />
                    <span>Archiver le patient (déplacer dans la corbeille)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: SÉANCES (PLANNING & HISTORIQUE) */}
          {/* ========================================== */}
          {activeTab === 'seances' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Séances de {patient.prenom} {patient.nom}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {patSeances.length} séance(s) au total ({nbSeancesRealisees} réalisée(s))
                  </p>
                </div>
                <button
                  onClick={() => openSeanceModal(null, patient.id, getTodayString())}
                  className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>+ Séance 45 min</span>
                </button>
              </div>

              {patSeances.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-medium">Aucune séance enregistrée pour ce patient.</p>
                  <button
                    onClick={() => openSeanceModal(null, patient.id, getTodayString())}
                    className="mt-3 px-3.5 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Programmer une séance
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {patSeances.map((seance) => {
                    let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (seance.statut === 'Confirmée') badgeClass = 'bg-sky-50 text-sky-700 border-sky-200';
                    if (seance.statut === 'Réalisée') badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
                    if (seance.statut === 'Annulée') badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                    if (seance.statut === 'Patient absent') badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';

                    return (
                      <div
                        key={seance.id}
                        className="p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-teal-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 py-1.5 bg-slate-100 rounded-xl text-center shrink-0">
                            <span className="text-xs font-bold text-slate-900 block">{seance.heure}</span>
                            <span className="text-[10px] text-slate-500">{seance.duree} min</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                {formatDateFr(seance.date, true)}
                              </span>
                              {seance.statut === 'Réalisée' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                                  ✓ Terminée
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {seance.notes || 'Séance standard de rééducation'}
                            </p>
                          </div>
                        </div>

                        {/* Action controls & 2-click payment widget */}
                        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                          {/* 2-Click Quick Payment Widget */}
                          <QuickPayWidget seance={seance} />

                          {/* Statut Selector */}
                          <select
                            value={seance.statut}
                            onChange={(e) => updateSeanceStatut(seance.id, e.target.value as StatutSeance)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-hidden ${badgeClass}`}
                          >
                            <option value="Prévue">Prévue</option>
                            <option value="Confirmée">Confirmée</option>
                            <option value="Réalisée">✓ Réalisée</option>
                            <option value="Patient absent">Absent</option>
                            <option value="Annulée">Annulée</option>
                          </select>

                          <button
                            onClick={() => openWhatsAppModal(patient, seance, 'rappel_rdv')}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                            title="Rappel WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openSeanceModal(seance)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Modifier séance"
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

          {/* ========================================== */}
          {/* TAB 3: PROTOCOLE (QUOTA VISUEL & HISTORIQUE) */}
          {/* ========================================== */}
          {activeTab === 'protocole' && (
            <div className="space-y-6">
              {patProto ? (
                <div className="space-y-6">
                  {/* Visuel Impactant du Protocole */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white shadow-xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
                          Prise en charge orthophonique
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                          Protocole — {patProto.totalSeances} séances
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5 font-medium">
                          Diagnostic : {patProto.diagnostic || patient.diagnostic || 'Rééducation orthophonique'}
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 self-start sm:self-auto">
                        {patProto.statut}
                      </span>
                    </div>

                    {/* Barre de Progression Visuelle & Chiffres Clés (Calculés Automatiquement) */}
                    {protoProgress && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold">
                          <span className="text-slate-200">
                            {protoProgress.realisees} / {protoProgress.total} séances
                          </span>
                          <span className="text-teal-400 text-base font-black">
                            {protoProgress.pourcentage} %
                          </span>
                        </div>

                        {/* Visual High-Contrast Bar */}
                        <div className="w-full h-4 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/80 shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 rounded-full transition-all duration-500 shadow-md shadow-teal-500/50"
                            style={{
                              width: `${protoProgress.pourcentage}%`,
                            }}
                          />
                        </div>

                        {/* 14 réalisées · 26 restantes */}
                        <div className="flex items-center justify-between text-xs font-bold pt-0.5">
                          <span className="text-emerald-400">
                            ✓ {protoProgress.realisees} réalisée(s)
                          </span>
                          <span className="text-slate-400">
                            ⏳ {protoProgress.restantes} restante(s)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Directe & Information Calcul Automatique */}
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => openSeanceModal(null, patient.id, getTodayString())}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <CalendarPlus className="w-4 h-4" />
                        <span>+ Planifier Séance</span>
                      </button>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950/60 border border-teal-500/30 text-teal-300 text-[11px] font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>Calculé en temps réel depuis les séances</span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* HISTORIQUE DES SÉANCES DU PROTOCOLE JUSTE DESSOUS */}
                  {/* ========================================================================= */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span>Historique des Séances ({patSeances.length})</span>
                      </h4>
                      <span className="text-xs text-slate-500">
                        {nbSeancesRealisees} effectuée(s)
                      </span>
                    </div>

                    {patSeances.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-500">Aucune séance enregistrée pour ce protocole.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {patSeances.map((seance) => (
                          <div
                            key={seance.id}
                            className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-teal-300 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-12 py-1 bg-slate-100 rounded-lg text-center font-bold text-slate-800 text-xs">
                                {seance.heure}
                              </div>
                              <div>
                                <p className="font-bold text-xs text-slate-900">
                                  {formatDateFr(seance.date, true)}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {seance.notes || 'Séance d’orthophonie'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {/* 2-Click Payment Widget */}
                              <QuickPayWidget seance={seance} />

                              <select
                                value={seance.statut}
                                onChange={(e) => updateSeanceStatut(seance.id, e.target.value as StatutSeance)}
                                className="text-xs font-semibold px-2 py-1 rounded-lg border bg-slate-50 text-slate-700 cursor-pointer"
                              >
                                <option value="Prévue">Prévue</option>
                                <option value="Confirmée">Confirmée</option>
                                <option value="Réalisée">✓ Réalisée</option>
                                <option value="Patient absent">Absent</option>
                                <option value="Annulée">Annulée</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">Aucun protocole thérapeutique actif</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Activez un protocole de prise en charge pour suivre le quota de séances et le renouvellement CNAM.
                  </p>
                  <button
                    onClick={() => {
                      updatePatient(patient.id, {});
                      // Add default protocol
                    }}
                    className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    + Créer un protocole (30 séances)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 4: PAIEMENTS (FINANCES & CRÉANCES) */}
          {/* ========================================== */}
          {activeTab === 'paiements' && (
            <div className="space-y-4">
              {/* Financial KPI Header */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Facturé</span>
                  <span className="text-base sm:text-lg font-extrabold text-slate-900 block mt-0.5">
                    {formatCurrency(totalFacture, config.devise)}
                  </span>
                  <span className="text-[10px] text-slate-400">{nbSeancesRealisees} séances</span>
                </div>

                <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 text-center">
                  <span className="text-[11px] text-emerald-700 font-medium block">Total Réglé</span>
                  <span className="text-base sm:text-lg font-extrabold text-emerald-700 block mt-0.5">
                    {formatCurrency(totalPaye, config.devise)}
                  </span>
                  <span className="text-[10px] text-emerald-600/80">{patPaiements.length} paiements</span>
                </div>

                <div className={`p-3.5 rounded-2xl border text-center ${resteDu > 0 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[11px] font-medium block ${resteDu > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                    Solde Dû
                  </span>
                  <span className={`text-base sm:text-lg font-extrabold block mt-0.5 ${resteDu > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                    {formatCurrency(resteDu, config.devise)}
                  </span>
                  <span className={`text-[10px] ${resteDu > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {resteDu > 0 ? 'À régulariser' : 'À jour'}
                  </span>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between pt-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Historique des Règlements
                </h4>
                <div className="flex items-center gap-2">
                  {resteDu > 0 && (
                    <button
                      onClick={() => openWhatsAppModal(patient, undefined, 'relance_paiement', resteDu)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Relancer WhatsApp</span>
                    </button>
                  )}
                  <button
                    onClick={() => openPaiementModal(patient.id)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>+ Encaisser</span>
                  </button>
                </div>
              </div>

              {/* Payments List */}
              {patPaiements.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200">
                  <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-500 font-medium">Aucun règlement enregistré pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {patPaiements.map((pay) => (
                    <div
                      key={pay.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {formatCurrency(pay.montant, config.devise)}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                            {pay.mode}
                          </span>
                          {pay.reference && (
                            <span className="text-[11px] text-slate-500 font-mono">
                              ({pay.reference})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Date : {formatDateFr(pay.date)} {pay.notes ? `• ${pay.notes}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => PdfGenerator.generateRecuPaiementPdf(pay, patient, config)}
                          className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                          title="Générer reçu d'honoraires PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deletePaiement(pay.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 5: DOCUMENTS (BILANS & COMPTES RENDUS) */}
          {/* ========================================== */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Documents de {patient.prenom}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bilans orthophoniques, ordonnances et comptes rendus
                  </p>
                </div>
                <button
                  onClick={() => openDocumentModal(patient.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>+ Ajouter document</span>
                </button>
              </div>

              {patDocs.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-500 font-medium">Aucun document joint à ce dossier.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {patDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">{doc.nom}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                              {doc.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Ajouté le {formatDateFr(doc.date)} {doc.notes ? `• ${doc.notes}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {doc.fileData && (
                          <a
                            href={doc.fileData}
                            download={doc.fileName || `${doc.nom}.pdf`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Télécharger"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 6: NOTES (OBSERVATIONS CLINIQUES) */}
          {/* ========================================== */}
          {activeTab === 'notes' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider text-teal-700">
                    Notes Cliniques & Observations Thérapeutiques
                  </h4>
                  {!isEditingNotes && (
                    <button
                      onClick={() => {
                        setEditingNotes(patient.notes || '');
                        setIsEditingNotes(true);
                      }}
                      className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modifier les notes</span>
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      rows={5}
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      placeholder="Notez ici les progrès, difficultés, consignes pour les parents ou observations d'évolution..."
                      className="w-full p-3 text-xs border border-teal-300 rounded-xl bg-white focus:ring-2 focus:ring-teal-500 text-slate-800"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingNotes(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Enregistrer les notes</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
                    {patient.notes || 'Aucune note clinique enregistrée pour le moment. Cliquez sur "Modifier les notes" pour en rédiger.'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
