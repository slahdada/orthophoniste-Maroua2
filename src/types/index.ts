export type SexeType = 'M' | 'F';

export type CouvertureType = 'CNAM' | 'BRIDGE' | 'Privé' | 'Autre' | string;

export type StatutSeance = 'Prévue' | 'Confirmée' | 'Réalisée' | 'Annulée' | 'Patient absent';

export type ModePaiement = 'Espèces' | 'Chèque' | 'Virement' | 'Autre';

export type TypeDocument = 'Bilan' | 'Compte rendu' | 'Ordonnance' | 'Justificatif' | 'Document administratif' | 'Autre';

export type StatutProtocole = 'En cours' | 'Terminé' | 'Suspendu';

export type SeancePaymentStatus = 'Payée' | 'Partiellement payée' | 'À payer';

export interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string; // YYYY-MM-DD
  sexe: SexeType;
  telephone: string;
  whatsapp?: string;
  adresse?: string;
  profession?: string;
  etablissementScolaire?: string;
  parentNom?: string;
  telephoneParent?: string;
  medecinReferent?: string;
  diagnostic?: string;
  motifConsultation?: string;
  datePremiereConsultation?: string;
  couverture: CouvertureType;
  assurance: string; // e.g. "CNAM - Filière Privée", "BRIDGE", etc.
  numeroCnam?: string;
  notes?: string;
  tarifSeance: number; // default per-session fee in DT/TND
  isArchived?: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seance {
  id: string;
  patientId: string;
  patientNom: string;
  date: string; // YYYY-MM-DD
  heure: string; // HH:mm
  duree: number; // in minutes, default 45
  statut: StatutSeance;
  tarif: number;
  paye: boolean;
  notes?: string;
  motif?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProtocoleProgress {
  realisees: number;
  total: number;
  pourcentage: number;
  restantes: number;
  isProcheFin: boolean;
  isTermine: boolean;
}

export interface Protocole {
  id: string;
  patientId: string;
  patientNom: string;
  totalSeances: number;
  seancesRealisees?: number; // Calculé dynamiquement depuis les séances effectives (statut === 'Réalisée')
  dateDebut: string;
  dateFinEstimee?: string;
  diagnostic?: string;
  objectif?: string;
  notes?: string;
  statut: StatutProtocole;
  createdAt: string;
  updatedAt: string;
}

export interface Paiement {
  id: string;
  patientId: string;
  patientNom: string;
  seanceId?: string; // Links payment directly to a specific session
  date: string; // YYYY-MM-DD
  montant: number;
  mode: ModePaiement;
  reference?: string; // N° Chèque, ref virement
  notes?: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  patientId: string;
  patientNom: string;
  nom: string;
  type: TypeDocument;
  date: string; // YYYY-MM-DD
  notes?: string;
  fileData?: string; // base64 or Data URI
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

export interface CabinetConfig {
  nomPraticien: string;
  titre: string;
  specialite: string;
  telephone: string;
  whatsapp: string;
  email: string;
  adresse: string;
  ville: string;
  matriculeFiscal?: string;
  conventionCnam?: string;
  devise: string; // "DT" or "TND"
  tarifDefaut: number; // 45
  dureeDefaut: number; // 45 min
  assurances: string[]; // List of available insurance options
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface CreanceItem {
  patient: Patient;
  totalFacture: number;
  totalPaye: number;
  resteDu: number;
  dernierPaiementDate?: string;
  joursRetard: number;
  nbSeancesRealisees: number;
}

export interface DashboardStats {
  totalPatients: number;
  patientsCnam: number;
  patientsBridge: number;
  patientsPrive: number;
  patientsAutre: number;
  seancesAujourdhui: number;
  seancesAVenir: number;
  seancesRealiseesTotal: number;
  seancesAnnulees: number;
  patientsAbsents: number;
  creancesTotal: number;
  paiementsRecusTotal: number;
  paiementsMoisCourant: number;
  totalResteAPayer: number;
}
