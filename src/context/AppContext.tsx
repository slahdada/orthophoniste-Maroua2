import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StorageService } from '../services/storage';
import {
  CabinetConfig,
  CreanceItem,
  DashboardStats,
  DocumentItem,
  ModePaiement,
  Paiement,
  Patient,
  Protocole,
  ProtocoleProgress,
  Seance,
  SeancePaymentStatus,
  StatutSeance,
  ToastMessage,
} from '../types';
import { getTodayString } from '../utils/formatters';

export type NavigationTab = 'dashboard' | 'patients' | 'planning' | 'finances' | 'plus';

export type PlusSubTab = 'documents' | 'assurances' | 'statistiques' | 'sauvegarde' | 'parametres';

interface AppContextType {
  // Navigation & UI
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  plusSubTab: PlusSubTab;
  setPlusSubTab: (tab: PlusSubTab) => void;
  openPlusTab: (tab: PlusSubTab) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  globalSearch: string;
  setGlobalSearch: (query: string) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;

  // Selected Patient
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  selectedPatient: Patient | null;

  // Modals state
  isPatientModalOpen: boolean;
  patientToEdit: Patient | null;
  openPatientModal: (patient?: Patient | null) => void;
  closePatientModal: () => void;

  isSeanceModalOpen: boolean;
  seanceToEdit: Seance | null;
  defaultSeancePatientId?: string;
  defaultSeanceDate?: string;
  openSeanceModal: (seance?: Seance | null, patientId?: string, date?: string) => void;
  closeSeanceModal: () => void;

  isPaiementModalOpen: boolean;
  defaultPaiementPatientId?: string;
  openPaiementModal: (patientId?: string) => void;
  closePaiementModal: () => void;

  isDocumentModalOpen: boolean;
  defaultDocumentPatientId?: string;
  openDocumentModal: (patientId?: string) => void;
  closeDocumentModal: () => void;

  isWhatsAppModalOpen: boolean;
  whatsAppData: { patient: Patient; seance?: Seance; templateType?: string; montantDu?: number } | null;
  openWhatsAppModal: (patient: Patient, seance?: Seance, templateType?: string, montantDu?: number) => void;
  closeWhatsAppModal: () => void;

  confirmationState: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  };
  openConfirmation: (title: string, message: string, onConfirm: () => void, isDanger?: boolean, confirmText?: string) => void;
  closeConfirmation: () => void;

  // Data & Mutators
  patients: Patient[];
  seances: Seance[];
  protocoles: Protocole[];
  paiements: Paiement[];
  documents: DocumentItem[];
  config: CabinetConfig;

  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  archivePatient: (id: string) => void;
  restorePatient: (id: string) => void;
  permanentlyDeletePatient: (id: string) => void;

  addSeance: (seance: Omit<Seance, 'id' | 'createdAt' | 'updatedAt'>) => Seance;
  updateSeance: (id: string, updates: Partial<Seance>) => void;
  updateSeanceStatut: (id: string, newStatut: StatutSeance) => void;
  deleteSeance: (id: string) => void;

  addProtocole: (protocole: Omit<Protocole, 'id' | 'createdAt' | 'updatedAt'>) => Protocole;
  updateProtocole: (id: string, updates: Partial<Protocole>) => void;
  deleteProtocole: (id: string) => void;
  getProtocoleRealisees: (protocole: Protocole) => number;
  getProtocoleProgress: (protocole: Protocole) => ProtocoleProgress;

  addPaiement: (paiement: Omit<Paiement, 'id' | 'createdAt'>) => Paiement;
  deletePaiement: (id: string) => void;
  quickPaySeance: (seanceId: string, mode?: ModePaiement, amount?: number) => void;
  quickUnpaySeance: (seanceId: string) => void;
  getSeancePaymentStatus: (seanceId: string) => {
    status: SeancePaymentStatus;
    paidAmount: number;
    tarif: number;
    remainingAmount: number;
  };

  addDocument: (doc: Omit<DocumentItem, 'id' | 'createdAt'>) => DocumentItem;
  deleteDocument: (id: string) => void;

  updateConfig: (newConfig: CabinetConfig) => void;
  addInsurance: (insuranceName: string) => string[];
  importData: (jsonStr: string) => { success: boolean; message: string };
  resetData: () => void;
  loadDemoData: () => void;

  // Computed
  stats: DashboardStats;
  creances: CreanceItem[];

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [plusSubTab, setPlusSubTab] = useState<PlusSubTab>('documents');
  const [viewMode, setViewModeState] = useState<'grid' | 'list'>(StorageService.getViewMode());
  const [globalSearch, setGlobalSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openPlusTab = (tab: PlusSubTab) => {
    setPlusSubTab(tab);
    setCurrentTab('plus');
  };

  // Entities
  const [patients, setPatients] = useState<Patient[]>(() => StorageService.getPatients());
  const [seances, setSeances] = useState<Seance[]>(() => StorageService.getSeances());
  const [protocoles, setProtocoles] = useState<Protocole[]>(() => StorageService.getProtocoles());
  const [paiements, setPaiements] = useState<Paiement[]>(() => StorageService.getPaiements());
  const [documents, setDocuments] = useState<DocumentItem[]>(() => StorageService.getDocuments());
  const [config, setConfig] = useState<CabinetConfig>(() => StorageService.getConfig());

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Modals
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const [isSeanceModalOpen, setIsSeanceModalOpen] = useState(false);
  const [seanceToEdit, setSeanceToEdit] = useState<Seance | null>(null);
  const [defaultSeancePatientId, setDefaultSeancePatientId] = useState<string | undefined>();
  const [defaultSeanceDate, setDefaultSeanceDate] = useState<string | undefined>();

  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);
  const [defaultPaiementPatientId, setDefaultPaiementPatientId] = useState<string | undefined>();

  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [defaultDocumentPatientId, setDefaultDocumentPatientId] = useState<string | undefined>();

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState<{ patient: Patient; seance?: Seance; templateType?: string; montantDu?: number } | null>(null);

  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setViewMode = (mode: 'grid' | 'list') => {
    setViewModeState(mode);
    StorageService.saveViewMode(mode);
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        }
      }
    } catch {
      // Safe fallback
    }
  };

  // Synchronize fullscreen state on changes
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Selected patient object
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [selectedPatientId, patients]);

  // Modal Openers
  const openPatientModal = (patient?: Patient | null) => {
    setPatientToEdit(patient || null);
    setIsPatientModalOpen(true);
  };
  const closePatientModal = () => {
    setPatientToEdit(null);
    setIsPatientModalOpen(false);
  };

  const openSeanceModal = (seance?: Seance | null, patientId?: string, date?: string) => {
    setSeanceToEdit(seance || null);
    setDefaultSeancePatientId(patientId);
    setDefaultSeanceDate(date);
    setIsSeanceModalOpen(true);
  };
  const closeSeanceModal = () => {
    setSeanceToEdit(null);
    setDefaultSeancePatientId(undefined);
    setDefaultSeanceDate(undefined);
    setIsSeanceModalOpen(false);
  };

  const openPaiementModal = (patientId?: string) => {
    setDefaultPaiementPatientId(patientId);
    setIsPaiementModalOpen(true);
  };
  const closePaiementModal = () => {
    setDefaultPaiementPatientId(undefined);
    setIsPaiementModalOpen(false);
  };

  const openDocumentModal = (patientId?: string) => {
    setDefaultDocumentPatientId(patientId);
    setIsDocumentModalOpen(true);
  };
  const closeDocumentModal = () => {
    setDefaultDocumentPatientId(undefined);
    setIsDocumentModalOpen(false);
  };

  const openWhatsAppModal = (patient: Patient, seance?: Seance, templateType?: string, montantDu?: number) => {
    setWhatsAppData({ patient, seance, templateType, montantDu });
    setIsWhatsAppModalOpen(true);
  };
  const closeWhatsAppModal = () => {
    setWhatsAppData(null);
    setIsWhatsAppModalOpen(false);
  };

  const openConfirmation = (title: string, message: string, onConfirm: () => void, isDanger = false, confirmText = 'Confirmer') => {
    setConfirmationState({
      isOpen: true,
      title,
      message,
      confirmText,
      isDanger,
      onConfirm: () => {
        onConfirm();
        closeConfirmation();
      },
    });
  };
  const closeConfirmation = () => {
    setConfirmationState((prev) => ({ ...prev, isOpen: false }));
  };

  // Mutator Actions
  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient => {
    const now = new Date().toISOString();
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newPatient, ...patients];
    setPatients(updated);
    StorageService.savePatients(updated);

    // Auto-create initial care protocol if needed
    const defaultProto: Protocole = {
      id: `proto-${Date.now()}`,
      patientId: newPatient.id,
      patientNom: `${newPatient.prenom} ${newPatient.nom}`,
      totalSeances: 30,
      dateDebut: newPatient.datePremiereConsultation || getTodayString(),
      diagnostic: newPatient.diagnostic || 'Bilan initial',
      objectif: 'Prise en charge orthophonique standard',
      statut: 'En cours',
      createdAt: now,
      updatedAt: now,
    };
    const updatedProtos = [defaultProto, ...protocoles];
    setProtocoles(updatedProtos);
    StorageService.saveProtocoles(updatedProtos);

    showToast(`Patient ${newPatient.prenom} ${newPatient.nom} enregistré ✓`);
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    const now = new Date().toISOString();
    const updated = patients.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p));
    setPatients(updated);
    StorageService.savePatients(updated);

    // Update denormalized names in séances and protocoles
    if (updates.nom || updates.prenom) {
      const patient = updated.find((p) => p.id === id);
      if (patient) {
        const fullNom = `${patient.prenom} ${patient.nom}`;
        const updatedSeances = seances.map((s) => (s.patientId === id ? { ...s, patientNom: fullNom } : s));
        setSeances(updatedSeances);
        StorageService.saveSeances(updatedSeances);

        const updatedProtos = protocoles.map((pr) => (pr.patientId === id ? { ...pr, patientNom: fullNom } : pr));
        setProtocoles(updatedProtos);
        StorageService.saveProtocoles(updatedProtos);

        const updatedPays = paiements.map((py) => (py.patientId === id ? { ...py, patientNom: fullNom } : py));
        setPaiements(updatedPays);
        StorageService.savePaiements(updatedPays);
      }
    }
    showToast('Dossier patient mis à jour ✓');
  };

  const archivePatient = (id: string) => {
    const now = new Date().toISOString();
    const updatedPatients = patients.map((p) =>
      p.id === id ? { ...p, isArchived: true, archivedAt: now, updatedAt: now } : p
    );
    setPatients(updatedPatients);
    StorageService.savePatients(updatedPatients);

    if (selectedPatientId === id) setSelectedPatientId(null);
    showToast('Dossier patient déplacé dans la corbeille ✓', 'info');
  };

  const restorePatient = (id: string) => {
    const now = new Date().toISOString();
    const updatedPatients = patients.map((p) =>
      p.id === id ? { ...p, isArchived: false, archivedAt: undefined, updatedAt: now } : p
    );
    setPatients(updatedPatients);
    StorageService.savePatients(updatedPatients);
    showToast('Dossier patient restauré ✓', 'success');
  };

  const permanentlyDeletePatient = (id: string) => {
    const updatedPatients = patients.filter((p) => p.id !== id);
    const updatedSeances = seances.filter((s) => s.patientId !== id);
    const updatedProtos = protocoles.filter((p) => p.patientId !== id);
    const updatedPays = paiements.filter((p) => p.patientId !== id);
    const updatedDocs = documents.filter((d) => d.patientId !== id);

    setPatients(updatedPatients);
    setSeances(updatedSeances);
    setProtocoles(updatedProtos);
    setPaiements(updatedPays);
    setDocuments(updatedDocs);

    StorageService.savePatients(updatedPatients);
    StorageService.saveSeances(updatedSeances);
    StorageService.saveProtocoles(updatedProtos);
    StorageService.savePaiements(updatedPays);
    StorageService.saveDocuments(updatedDocs);

    if (selectedPatientId === id) setSelectedPatientId(null);
    showToast('Patient et dossier supprimés définitivement', 'info');
  };

  // Safe delete defaults to archiving in trash
  const deletePatient = (id: string) => {
    archivePatient(id);
  };

  const getSeancePaymentStatus = (seanceId: string): {
    status: SeancePaymentStatus;
    paidAmount: number;
    tarif: number;
    remainingAmount: number;
  } => {
    const seance = seances.find((s) => s.id === seanceId);
    if (!seance) {
      return { status: 'À payer', paidAmount: 0, tarif: config.tarifDefaut, remainingAmount: config.tarifDefaut };
    }
    const patientObj = patients.find((p) => p.id === seance.patientId);
    const tarif = Number(seance.tarif) || Number(patientObj?.tarifSeance) || config.tarifDefaut;

    // Check direct payments linked to this session
    const linkedPayments = paiements.filter((p) => p.seanceId === seance.id);
    let paidAmount = linkedPayments.reduce((acc, p) => acc + (Number(p.montant) || 0), 0);

    // Fallback: If legacy seance has paye === true and no linked payment tracked with seanceId
    if (linkedPayments.length === 0 && seance.paye) {
      paidAmount = tarif;
    }

    const remainingAmount = Math.max(0, tarif - paidAmount);
    let status: SeancePaymentStatus = 'À payer';
    if (paidAmount >= tarif && tarif > 0) {
      status = 'Payée';
    } else if (paidAmount > 0) {
      status = 'Partiellement payée';
    }

    return {
      status,
      paidAmount,
      tarif,
      remainingAmount,
    };
  };

  const addSeance = (seanceData: Omit<Seance, 'id' | 'createdAt' | 'updatedAt'>): Seance => {
    const now = new Date().toISOString();
    const newSeance: Seance = {
      ...seanceData,
      id: `sea-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newSeance, ...seances];
    setSeances(updated);
    StorageService.saveSeances(updated);

    showToast('Séance planifiée ✓');
    return newSeance;
  };

  const updateSeance = (id: string, updates: Partial<Seance>) => {
    const now = new Date().toISOString();
    const updated = seances.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: now } : s));
    setSeances(updated);
    StorageService.saveSeances(updated);
    showToast('Séance mise à jour ✓');
  };

  const updateSeanceStatut = (id: string, newStatut: StatutSeance) => {
    updateSeance(id, { statut: newStatut });
  };

  const quickPaySeance = (seanceId: string, mode: ModePaiement = 'Espèces', customAmount?: number) => {
    const target = seances.find((s) => s.id === seanceId);
    if (!target) return;
    const now = new Date().toISOString();

    // 1. Update seance to paye = true and statut = 'Réalisée'
    const updatedSeances = seances.map((s) =>
      s.id === seanceId
        ? { ...s, paye: true, statut: 'Réalisée' as StatutSeance, updatedAt: now }
        : s
    );
    setSeances(updatedSeances);
    StorageService.saveSeances(updatedSeances);

    // 2. Create payment transaction record directly bound to seanceId
    const patientObj = patients.find((p) => p.id === target.patientId);
    const fullTarif = Number(target.tarif) || Number(patientObj?.tarifSeance) || config.tarifDefaut;
    const alreadyPaid = paiements
      .filter((p) => p.seanceId === target.id)
      .reduce((sum, p) => sum + (Number(p.montant) || 0), 0);
    const amountToPay = customAmount !== undefined ? customAmount : Math.max(0, fullTarif - alreadyPaid);

    const newPaiement: Paiement = {
      id: `pay-${Date.now()}`,
      seanceId: target.id,
      patientId: target.patientId,
      patientNom: target.patientNom,
      montant: amountToPay > 0 ? amountToPay : fullTarif,
      date: target.date,
      mode,
      notes: `Règlement séance du ${target.date} (${target.heure})`,
      createdAt: now,
    };
    const updatedPays = [newPaiement, ...paiements];
    setPaiements(updatedPays);
    StorageService.savePaiements(updatedPays);

    showToast(`Paiement de ${newPaiement.montant} ${config.devise} enregistré (${mode}) ✓`);
  };

  const quickUnpaySeance = (seanceId: string) => {
    const target = seances.find((s) => s.id === seanceId);
    if (!target) return;
    const now = new Date().toISOString();

    // 1. Mark seance paye = false
    const updatedSeances = seances.map((s) =>
      s.id === seanceId ? { ...s, paye: false, updatedAt: now } : s
    );
    setSeances(updatedSeances);
    StorageService.saveSeances(updatedSeances);

    // 2. Remove any payments directly linked to this seanceId
    const updatedPays = paiements.filter((p) => p.seanceId !== seanceId);
    setPaiements(updatedPays);
    StorageService.savePaiements(updatedPays);

    showToast('Séance marquée "À payer" ✓', 'info');
  };

  const deleteSeance = (id: string) => {
    const updated = seances.filter((s) => s.id !== id);
    setSeances(updated);
    StorageService.saveSeances(updated);
    showToast('Séance supprimée ✓', 'info');
  };

  const addProtocole = (protoData: Omit<Protocole, 'id' | 'createdAt' | 'updatedAt'>): Protocole => {
    const now = new Date().toISOString();
    const newProto: Protocole = {
      ...protoData,
      id: `proto-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newProto, ...protocoles];
    setProtocoles(updated);
    StorageService.saveProtocoles(updated);
    showToast('Protocole de soins enregistré ✓');
    return newProto;
  };

  const updateProtocole = (id: string, updates: Partial<Protocole>) => {
    const now = new Date().toISOString();
    const updated = protocoles.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p));
    setProtocoles(updated);
    StorageService.saveProtocoles(updated);
  };

  const deleteProtocole = (id: string) => {
    const updated = protocoles.filter((p) => p.id !== id);
    setProtocoles(updated);
    StorageService.saveProtocoles(updated);
    showToast('Protocole supprimé ✓', 'info');
  };

  /**
   * Calcul automatique et infaillible du nombre de séances réalisées pour un protocole
   * Source de vérité : les séances effectives ayant statut === 'Réalisée'
   */
  const getProtocoleRealisees = (proto: Protocole): number => {
    return seances.filter((s) => s.patientId === proto.patientId && s.statut === 'Réalisée').length;
  };

  const getProtocoleProgress = (proto: Protocole): ProtocoleProgress => {
    const realisees = getProtocoleRealisees(proto);
    const total = proto.totalSeances || 1;
    const pourcentage = Math.min(100, Math.round((realisees / total) * 100));
    const restantes = Math.max(0, (proto.totalSeances || 0) - realisees);
    const isProcheFin = proto.statut === 'En cours' && pourcentage >= 80;
    const isTermine = realisees >= (proto.totalSeances || 0) && (proto.totalSeances || 0) > 0;
    return {
      realisees,
      total: proto.totalSeances,
      pourcentage,
      restantes,
      isProcheFin,
      isTermine,
    };
  };

  const addPaiement = (paiementData: Omit<Paiement, 'id' | 'createdAt'>): Paiement => {
    const now = new Date().toISOString();
    const newPaiement: Paiement = {
      ...paiementData,
      id: `pay-${Date.now()}`,
      createdAt: now,
    };
    const updated = [newPaiement, ...paiements];
    setPaiements(updated);
    StorageService.savePaiements(updated);
    showToast(`Paiement de ${newPaiement.montant} ${config.devise} enregistré ✓`);
    return newPaiement;
  };

  const deletePaiement = (id: string) => {
    const updated = paiements.filter((p) => p.id !== id);
    setPaiements(updated);
    StorageService.savePaiements(updated);
    showToast('Paiement supprimé ✓', 'info');
  };

  const addDocument = (docData: Omit<DocumentItem, 'id' | 'createdAt'>): DocumentItem => {
    const now = new Date().toISOString();
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc-${Date.now()}`,
      createdAt: now,
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    StorageService.saveDocuments(updated);
    showToast('Document ajouté au dossier ✓');
    return newDoc;
  };

  const deleteDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    StorageService.saveDocuments(updated);
    showToast('Document supprimé ✓', 'info');
  };

  const updateConfig = (newConfig: CabinetConfig) => {
    setConfig(newConfig);
    StorageService.saveConfig(newConfig);
    showToast('Paramètres du cabinet mis à jour ✓');
  };

  const addInsurance = (insuranceName: string): string[] => {
    const list = StorageService.addInsuranceOption(insuranceName);
    const updatedConfig = { ...config, assurances: list };
    setConfig(updatedConfig);
    showToast(`Assurance "${insuranceName}" ajoutée ✓`);
    return list;
  };

  const importData = (jsonStr: string) => {
    const result = StorageService.importBackup(jsonStr);
    if (result.success) {
      setPatients(StorageService.getPatients());
      setSeances(StorageService.getSeances());
      setProtocoles(StorageService.getProtocoles());
      setPaiements(StorageService.getPaiements());
      setDocuments(StorageService.getDocuments());
      setConfig(StorageService.getConfig());
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
    return result;
  };

  const resetData = () => {
    StorageService.resetToDefaultData();
    setPatients(StorageService.getPatients());
    setSeances(StorageService.getSeances());
    setProtocoles(StorageService.getProtocoles());
    setPaiements(StorageService.getPaiements());
    setDocuments(StorageService.getDocuments());
    setConfig(StorageService.getConfig());
    showToast('Base remise à zéro (cabinet vierge) ✓', 'info');
  };

  const loadDemoData = () => {
    StorageService.loadDemoData();
    setPatients(StorageService.getPatients());
    setSeances(StorageService.getSeances());
    setProtocoles(StorageService.getProtocoles());
    setPaiements(StorageService.getPaiements());
    setDocuments(StorageService.getDocuments());
    showToast('Données de démonstration chargées ✓', 'success');
  };

  // Computations
  const today = getTodayString();
  const currentMonth = today.slice(0, 7); // YYYY-MM

  // Dashboard Stats
  const stats: DashboardStats = useMemo(() => {
    const totalPatients = patients.length;
    let patientsCnam = 0;
    let patientsBridge = 0;
    let patientsPrive = 0;
    let patientsAutre = 0;

    patients.forEach((p) => {
      const c = (p.couverture || '').toUpperCase();
      if (c.includes('CNAM')) patientsCnam++;
      else if (c.includes('BRIDGE')) patientsBridge++;
      else if (c.includes('PRIV') || c.includes('SANS')) patientsPrive++;
      else patientsAutre++;
    });

    const seancesAujourdhui = seances.filter((s) => s.date === today).length;
    const seancesAVenir = seances.filter((s) => s.date > today || (s.date === today && s.statut === 'Prévue')).length;
    const seancesRealiseesTotal = seances.filter((s) => s.statut === 'Réalisée').length;
    const seancesAnnulees = seances.filter((s) => s.statut === 'Annulée').length;
    const patientsAbsents = seances.filter((s) => s.statut === 'Patient absent').length;

    // Financial tallies
    const paiementsRecusTotal = paiements.reduce((acc, p) => acc + (p.montant || 0), 0);
    const paiementsMoisCourant = paiements
      .filter((p) => p.date && p.date.startsWith(currentMonth))
      .reduce((acc, p) => acc + (p.montant || 0), 0);

    // Calculate total invoiced (realized sessions * patient tariff)
    let totalFactureGlobal = 0;
    patients.forEach((pat) => {
      const effectuees = seances.filter((s) => s.patientId === pat.id && s.statut === 'Réalisée').length;
      totalFactureGlobal += effectuees * (pat.tarifSeance || config.tarifDefaut);
    });

    const totalResteAPayer = Math.max(0, totalFactureGlobal - paiementsRecusTotal);
    const creancesTotal = totalResteAPayer;

    return {
      totalPatients,
      patientsCnam,
      patientsBridge,
      patientsPrive,
      patientsAutre,
      seancesAujourdhui,
      seancesAVenir,
      seancesRealiseesTotal,
      seancesAnnulees,
      patientsAbsents,
      creancesTotal,
      paiementsRecusTotal,
      paiementsMoisCourant,
      totalResteAPayer,
    };
  }, [patients, seances, paiements, config, today, currentMonth]);

  // Creance items calculation
  const creances: CreanceItem[] = useMemo(() => {
    return patients
      .map((pat) => {
        const patSeances = seances.filter((s) => s.patientId === pat.id && s.statut === 'Réalisée');
        const nbSeancesRealisees = patSeances.length;
        const totalFacture = nbSeancesRealisees * (pat.tarifSeance || config.tarifDefaut);
        const patPaiements = paiements.filter((p) => p.patientId === pat.id);
        const totalPaye = patPaiements.reduce((acc, p) => acc + (p.montant || 0), 0);
        const resteDu = Math.max(0, totalFacture - totalPaye);

        // Sort payments by date descending
        const sortedPays = [...patPaiements].sort((a, b) => b.date.localeCompare(a.date));
        const dernierPaiementDate = sortedPays[0]?.date;

        let joursRetard = 0;
        if (resteDu > 0) {
          const refDateStr = dernierPaiementDate || pat.datePremiereConsultation || pat.createdAt.split('T')[0];
          const diffMs = new Date().getTime() - new Date(refDateStr).getTime();
          joursRetard = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }

        return {
          patient: pat,
          totalFacture,
          totalPaye,
          resteDu,
          dernierPaiementDate,
          joursRetard,
          nbSeancesRealisees,
        };
      })
      .filter((item) => item.resteDu > 0)
      .sort((a, b) => b.resteDu - a.resteDu);
  }, [patients, seances, paiements, config]);

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        plusSubTab,
        setPlusSubTab,
        openPlusTab,
        viewMode,
        setViewMode,
        globalSearch,
        setGlobalSearch,
        isFullscreen,
        toggleFullscreen,

        selectedPatientId,
        setSelectedPatientId,
        selectedPatient,

        isPatientModalOpen,
        patientToEdit,
        openPatientModal,
        closePatientModal,

        isSeanceModalOpen,
        seanceToEdit,
        defaultSeancePatientId,
        defaultSeanceDate,
        openSeanceModal,
        closeSeanceModal,

        isPaiementModalOpen,
        defaultPaiementPatientId,
        openPaiementModal,
        closePaiementModal,

        isDocumentModalOpen,
        defaultDocumentPatientId,
        openDocumentModal,
        closeDocumentModal,

        isWhatsAppModalOpen,
        whatsAppData,
        openWhatsAppModal,
        closeWhatsAppModal,

        confirmationState,
        openConfirmation,
        closeConfirmation,

        patients,
        seances,
        protocoles,
        paiements,
        documents,
        config,

        addPatient,
        updatePatient,
        deletePatient,
        archivePatient,
        restorePatient,
        permanentlyDeletePatient,
        addSeance,
        updateSeance,
        updateSeanceStatut,
        deleteSeance,
        addProtocole,
        updateProtocole,
        deleteProtocole,
        getProtocoleRealisees,
        getProtocoleProgress,
        addPaiement,
        deletePaiement,
        quickPaySeance,
        quickUnpaySeance,
        getSeancePaymentStatus,
        addDocument,
        deleteDocument,
        updateConfig,
        addInsurance,
        importData,
        resetData,
        loadDemoData,

        stats,
        creances,

        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
