import React, { useState } from 'react';
import { useApp, PlusSubTab } from '../../context/AppContext';
import {
  FileText,
  Shield,
  BarChart3,
  Download,
  Settings,
  Plus,
  Upload,
  RefreshCw,
  Building,
  Phone,
  Mail,
  MapPin,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Save,
  Search,
  ExternalLink,
  Users,
  Activity,
  Calendar,
  CreditCard,
  DollarSign,
  Printer,
  Sparkles,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { PdfGenerator } from '../../services/pdfGenerator';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { formatCurrency, formatDateFr, getTelLink, getTodayString } from '../../utils/formatters';
import { Protocole, StatutProtocole, TypeDocument } from '../../types';

export const PlusView: React.FC = () => {
  const {
    plusSubTab,
    setPlusSubTab,
    config,
    updateConfig,
    patients,
    documents,
    protocoles,
    seances,
    paiements,
    stats,
    importData,
    resetData,
    loadDemoData,
    openConfirmation,
    showToast,
    addInsurance,
    openDocumentModal,
    deleteDocument,
    updateProtocole,
    deleteProtocole,
    addProtocole,
    getProtocoleProgress,
    setSelectedPatientId,
    setCurrentTab,
  } = useApp();

  // Documents state
  const [docSearch, setDocSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');

  // Assurances state
  const [newAssurance, setNewAssurance] = useState('');

  // Paramètres cabinet state
  const [nomPraticien, setNomPraticien] = useState(config.nomPraticien);
  const [titre, setTitre] = useState(config.titre);
  const [specialite, setSpecialite] = useState(config.specialite);
  const [telephone, setTelephone] = useState(config.telephone);
  const [whatsapp, setWhatsapp] = useState(config.whatsapp);
  const [email, setEmail] = useState(config.email);
  const [adresse, setAdresse] = useState(config.adresse);
  const [ville, setVille] = useState(config.ville);
  const [matriculeFiscal, setMatriculeFiscal] = useState(config.matriculeFiscal || '');
  const [conventionCnam, setConventionCnam] = useState(config.conventionCnam || '');
  const [devise, setDevise] = useState(config.devise || 'DT');
  const [tarifDefaut, setTarifDefaut] = useState(config.tarifDefaut || 45);
  const [dureeDefaut, setDureeDefaut] = useState(config.dureeDefaut || 45);

  // Protocole quick add modal
  const [isAddProtoOpen, setIsAddProtoOpen] = useState(false);
  const [protoPatId, setProtoPatId] = useState('');
  const [protoTotal, setProtoTotal] = useState(30);
  const [protoRealisees, setProtoRealisees] = useState(0);
  const [protoDiag, setProtoDiag] = useState('');
  const [protoObj, setProtoObj] = useState('Prise en charge orthophonique standard');

  // Filtered documents
  const filteredDocs = documents.filter((d) => {
    const matchSearch =
      d.nom.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.patientNom.toLowerCase().includes(docSearch.toLowerCase()) ||
      (d.notes || '').toLowerCase().includes(docSearch.toLowerCase());
    const matchType = docTypeFilter === 'all' || d.type === docTypeFilter;
    return matchSearch && matchType;
  });

  const handleSaveCabinetInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      ...config,
      nomPraticien: nomPraticien.trim(),
      titre: titre.trim(),
      specialite: specialite.trim(),
      telephone: telephone.trim(),
      whatsapp: whatsapp.trim() || telephone.trim(),
      email: email.trim(),
      adresse: adresse.trim(),
      ville: ville.trim(),
      matriculeFiscal: matriculeFiscal.trim(),
      conventionCnam: conventionCnam.trim(),
      devise: devise.trim() || 'DT',
      tarifDefaut: Number(tarifDefaut) || 45,
      dureeDefaut: Number(dureeDefaut) || 45,
    });
  };

  const handleAddAssurance = () => {
    if (!newAssurance.trim()) return;
    addInsurance(newAssurance.trim());
    setNewAssurance('');
  };

  const handleDeleteAssurance = (name: string) => {
    const updated = config.assurances.filter((a) => a !== name);
    updateConfig({ ...config, assurances: updated });
    showToast(`Assurance "${name}" retirée ✓`, 'info');
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportCompleteBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cabinet_Belgaied_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Sauvegarde JSON téléchargée avec succès ✓');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      openConfirmation(
        'Restaurer la sauvegarde JSON ?',
        'Cette opération remplacera les données actuelles par celles contenues dans le fichier sélectionné. Voulez-vous continuer ?',
        () => {
          importData(content);
        },
        false,
        'Restaurer'
      );
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    openConfirmation(
      'Remettre la base à zéro ?',
      'Cette action efface tous les patients, séances et règlements pour démarrer avec un cabinet vierge prêt pour la pratique réelle. Êtes-vous sûr(e) ?',
      () => {
        resetData();
      },
      true,
      'Vider et remettre à zéro'
    );
  };

  const handleLoadDemo = () => {
    openConfirmation(
      'Charger des patients d’exemple ?',
      'Cette action chargera un ensemble de 5 dossiers d’exemple avec séances et bilans pour tester toutes les fonctionnalités. Les données existantes seront remplacées.',
      () => {
        loadDemoData();
      },
      false,
      'Charger les exemples'
    );
  };

  const handleSaveProto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!protoPatId) return;
    const pat = patients.find((p) => p.id === protoPatId);
    const patientNom = pat ? `${pat.prenom} ${pat.nom}` : 'Patient';

    addProtocole({
      patientId: protoPatId,
      patientNom,
      totalSeances: Number(protoTotal) || 30,
      dateDebut: getTodayString(),
      diagnostic: protoDiag || pat?.diagnostic || 'Rééducation',
      objectif: protoObj,
      statut: 'En cours',
    });
    setIsAddProtoOpen(false);
  };

  const subNavItems: { id: PlusSubTab; label: string; icon: any; count?: number }[] = [
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'assurances', label: 'Assurances', icon: Shield, count: config.assurances.length },
    { id: 'statistiques', label: 'Statistiques', icon: BarChart3 },
    { id: 'sauvegarde', label: 'Sauvegarde', icon: Download },
    { id: 'parametres', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 5-Subsections Navigation Hub */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = plusSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPlusSubTab(item.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DOCUMENTS SECTION */}
      {/* ========================================================================= */}
      {plusSubTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>Gestionnaire des Documents Médicaux</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bilans orthophoniques, ordonnances, comptes rendus et accords CNAM
              </p>
            </div>

            <button
              onClick={() => openDocumentModal()}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter un Document</span>
            </button>
          </div>

          {/* Search & Type filter */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Rechercher document ou patient..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              {['all', 'Bilan', 'Compte rendu', 'Ordonnance', 'Document administratif', 'Autre'].map((t) => (
                <button
                  key={t}
                  onClick={() => setDocTypeFilter(t)}
                  className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                    docTypeFilter === t
                      ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t === 'all' ? 'Tous les types' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Table / Cards */}
          {filteredDocs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900">Aucun document trouvé</h3>
              <p className="text-xs text-slate-500 mt-1">
                {docSearch ? `Aucun document ne correspond à "${docSearch}".` : 'Aucun fichier enregistré pour le moment.'}
              </p>
              <button
                onClick={() => openDocumentModal()}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Ajouter le premier document
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Document</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocs.map((doc) => {
                      const pat = patients.find((p) => p.id === doc.patientId);

                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="truncate max-w-[200px]">{doc.nom}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              {doc.type}
                            </span>
                          </td>
                          <td
                            className="py-3.5 px-4 font-semibold text-slate-800 cursor-pointer hover:text-teal-700"
                            onClick={() => {
                              if (pat) {
                                setSelectedPatientId(pat.id);
                                setCurrentTab('patients');
                              }
                            }}
                          >
                            {doc.patientNom}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">
                            {formatDateFr(doc.date)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 truncate max-w-[180px]">
                            {doc.notes || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {doc.fileData && (
                                <a
                                  href={doc.fileData}
                                  download={doc.fileName || `${doc.nom}.pdf`}
                                  className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors"
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
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ASSURANCES SECTION */}
      {/* ========================================================================= */}
      {plusSubTab === 'assurances' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <span>Organismes d'Assurance & Prise en Charge</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Conventions CNAM, filières et mutuelles privées disponibles pour les dossiers patients
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Ajouter une nouvelle assurance
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newAssurance}
                onChange={(e) => setNewAssurance(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddAssurance();
                }}
                placeholder="Ex: Carte Assurances, Comar, Mutuelle Douane..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={handleAddAssurance}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 mb-3">
                Assurances actives ({config.assurances.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {config.assurances.map((ass) => {
                  const patCount = patients.filter((p) => p.assurance === ass || p.couverture === ass).length;

                  return (
                    <div
                      key={ass}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 flex items-center justify-between gap-2 hover:bg-teal-50/40 transition-colors"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{ass}</span>
                        <span className="text-[10px] text-slate-500">{patCount} patient(s) rattaché(s)</span>
                      </div>

                      {config.assurances.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAssurance(ass)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                          title="Supprimer cette assurance"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STATISTIQUES & PROTOCOLES SECTION */}
      {/* ========================================================================= */}
      {plusSubTab === 'statistiques' && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                <span>Statistiques & Protocoles de Soins</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Analyse de l'activité du cabinet et progression des prises en charge orthophoniques
              </p>
            </div>

            <button
              onClick={() => {
                if (patients.length > 0) {
                  setProtoPatId(patients[0].id);
                  setProtoDiag(patients[0].diagnostic || '');
                }
                setIsAddProtoOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nouveau Protocole</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Patients</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">{stats.totalPatients}</span>
              <span className="text-[10px] text-teal-600 font-semibold">{stats.patientsCnam} CNAM • {stats.patientsBridge} BRIDGE</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Séances Réalisées</span>
              <span className="text-2xl font-black text-emerald-600 block mt-1">{stats.seancesRealiseesTotal}</span>
              <span className="text-[10px] text-slate-500">Depuis l'ouverture</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Encaissé</span>
              <span className="text-xl font-black text-slate-900 block mt-1">{formatCurrency(stats.paiementsRecusTotal, config.devise)}</span>
              <span className="text-[10px] text-slate-500">{paiements.length} règlements</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Créances en cours</span>
              <span className="text-xl font-black text-amber-700 block mt-1">{formatCurrency(stats.creancesTotal, config.devise)}</span>
              <span className="text-[10px] text-amber-600 font-medium">À recouvrer</span>
            </div>
          </div>

          {/* Care Protocols Progress */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
              <span>Protocoles Thérapeutiques en Cours ({protocoles.length})</span>
            </h3>

            {protocoles.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Aucun protocole thérapeutique actif.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {protocoles.map((proto) => {
                  const pat = patients.find((p) => p.id === proto.patientId);
                  const prog = getProtocoleProgress(proto);

                  return (
                    <div
                      key={proto.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 shadow-xs transition-all space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4
                            onClick={() => {
                              if (pat) {
                                setSelectedPatientId(pat.id);
                                setCurrentTab('patients');
                              }
                            }}
                            className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-teal-700 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{proto.patientNom}</span>
                            <span className="text-slate-400 font-normal text-xs">— Protocole {proto.totalSeances} séances</span>
                          </h4>
                          <p className="text-[11px] text-teal-700 font-semibold mt-0.5">{proto.diagnostic || pat?.diagnostic || 'Rééducation orthophonique'}</p>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {proto.statut}
                        </span>
                      </div>

                      {/* Visual Bar & Stats (Calculé Automatiquement) */}
                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800 font-extrabold">
                            {prog.realisees} / {prog.total} séances
                          </span>
                          <span className="text-teal-700 font-black">{prog.pourcentage}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${prog.pourcentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold pt-0.5">
                          <span className="text-emerald-700">✓ {prog.realisees} réalisée(s)</span>
                          <span className="text-slate-500">⏳ {prog.restantes} restante(s)</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-semibold border border-teal-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          Calculé depuis les séances
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (pat) {
                                setSelectedPatientId(pat.id);
                                setCurrentTab('patients');
                              }
                            }}
                            className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                          >
                            Voir dossier →
                          </button>
                          <button
                            onClick={() => deleteProtocole(proto.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SAUVEGARDE SECTION */}
      {/* ========================================================================= */}
      {plusSubTab === 'sauvegarde' && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              <span>Sauvegardes & Exports de Données</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sauvegardez l'ensemble du cabinet en toute sécurité sur votre appareil ou restaurez un fichier
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Export JSON */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Sauvegarde Complète (JSON)</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Exporte l'intégralité des dossiers patients, rendez-vous, paiements, protocoles et documents.
                </p>
              </div>
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger Sauvegarde JSON</span>
              </button>
            </div>

            {/* Import JSON */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Restaurer Fichier JSON</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Restaure instantanément les données du cabinet depuis une sauvegarde précédente.
                </p>
              </div>
              <label className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Sélectionner Fichier JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Export CSV */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Tableur Excel (CSV)</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Exportez la liste des patients au format CSV compatible Microsoft Excel et Google Sheets.
                </p>
              </div>
              <button
                onClick={() => PdfGenerator.exportPatientsCsv(patients)}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exporter Patients CSV</span>
              </button>
            </div>
          </div>

          {/* Data Reset & Demo Load Options */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">État de la base de données</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Gérez la réinitialisation de votre cabinet ou chargez des exemples pour démonstration.
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleLoadDemo}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Charger 5 patients d’exemple pour tester"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Charger exemples</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-rose-200"
                title="Vider la base de données pour un démarrage vierge"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Vider la base (cabinet réel)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PARAMÈTRES SECTION */}
      {/* ========================================================================= */}
      {plusSubTab === 'parametres' && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-600" />
                <span>Paramètres & Coordonnées du Cabinet</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Coordonnées de Belgaied Maroua, adresse du cabinet, tarifs par défaut et conventions
              </p>
            </div>
            <PWAInstallButton />
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <form onSubmit={handleSaveCabinetInfo} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de la praticienne</label>
                  <input
                    type="text"
                    required
                    value={nomPraticien}
                    onChange={(e) => setNomPraticien(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titre professionnel</label>
                  <input
                    type="text"
                    required
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Spécialités</label>
                <input
                  type="text"
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone Cabinet</label>
                  <input
                    type="text"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse du Cabinet</label>
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">N° Convention CNAM</label>
                  <input
                    type="text"
                    value={conventionCnam}
                    onChange={(e) => setConventionCnam(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Matricule Fiscal</label>
                  <input
                    type="text"
                    value={matriculeFiscal}
                    onChange={(e) => setMatriculeFiscal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif séance ({devise})</label>
                  <input
                    type="number"
                    value={tarifDefaut}
                    onChange={(e) => setTarifDefaut(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Durée défaut (min)</label>
                  <input
                    type="number"
                    value={dureeDefaut}
                    onChange={(e) => setDureeDefaut(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Protocole */}
      {isAddProtoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Nouveau Protocole de soins</h3>
              <button onClick={() => setIsAddProtoOpen(false)} className="p-1 text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProto} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient</label>
                <select
                  required
                  value={protoPatId}
                  onChange={(e) => {
                    setProtoPatId(e.target.value);
                    const p = patients.find((pat) => pat.id === e.target.value);
                    if (p) setProtoDiag(p.diagnostic || '');
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Séances</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={protoTotal}
                    onChange={(e) => setProtoTotal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Déjà Réalisées</label>
                  <input
                    type="number"
                    min="0"
                    value={protoRealisees}
                    onChange={(e) => setProtoRealisees(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic</label>
                <input
                  type="text"
                  value={protoDiag}
                  onChange={(e) => setProtoDiag(e.target.value)}
                  placeholder="Ex: Dyslexie, Bégaiement..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Objectifs thérapeutiques</label>
                <textarea
                  rows={2}
                  value={protoObj}
                  onChange={(e) => setProtoObj(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProtoOpen(false)}
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
