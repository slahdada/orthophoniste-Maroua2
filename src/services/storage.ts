import { CabinetConfig, DocumentItem, Paiement, Patient, Protocole, Seance } from '../types';

const STORAGE_KEYS = {
  PATIENTS: 'belgaied_ortho_patients',
  SEANCES: 'belgaied_ortho_seances',
  PROTOCOLES: 'belgaied_ortho_protocoles',
  PAIEMENTS: 'belgaied_ortho_paiements',
  DOCUMENTS: 'belgaied_ortho_documents',
  CONFIG: 'belgaied_ortho_config',
  VIEW_MODE: 'belgaied_ortho_view_mode',
};

export const DEFAULT_CONFIG: CabinetConfig = {
  nomPraticien: 'Belgaied Maroua',
  titre: 'Orthophoniste Diplômée d’État',
  specialite: 'Troubles du langage oral et écrit, bégaiement, déglutition atypique, dysphagie',
  telephone: '+216 29 569 493',
  whatsapp: '+216 29 569 493',
  email: 'belgaied.maroua2020@gmail.com',
  adresse: '005 PANORAMA, AV 20mars, beb saadoun',
  ville: '1006 Tunis',
  matriculeFiscal: '1458920/A/P/000',
  conventionCnam: 'CONV-ORTHO-2024-88',
  devise: 'DT',
  tarifDefaut: 45,
  dureeDefaut: 45,
  assurances: [
    'CNAM - Filière Privée',
    'CNAM - Filière Publique',
    'CNAM - Remboursement',
    'BRIDGE',
    'GAT Assurances',
    'Maghrebia',
    'Star Assurances',
    'Privé / Sans assurance',
  ],
};

const SEED_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    nom: 'Ben Salem',
    prenom: 'Youssef',
    dateNaissance: '2019-04-12',
    sexe: 'M',
    telephone: '98112233',
    whatsapp: '98112233',
    adresse: 'Ennasr 2, Ariana',
    etablissementScolaire: 'École Primaire Hannibal, CP',
    parentNom: 'Amira Ben Salem (Mère)',
    telephoneParent: '98112233',
    medecinReferent: 'Dr. Karim Trabelsi (Pédiatre)',
    diagnostic: 'Retard de langage expressif & Trouble articulatoire (ch/j)',
    motifConsultation: 'Difficulté à prononcer certains sons et retard du vocabulaire',
    datePremiereConsultation: '2025-10-15',
    couverture: 'CNAM',
    assurance: 'CNAM - Filière Privée',
    numeroCnam: '1245789632/01',
    notes: 'Enfant très coopératif, apprécie le travail ludique avec les cartes imagées.',
    tarifSeance: 45,
    createdAt: '2025-10-15T09:00:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
  },
  {
    id: 'pat-2',
    nom: 'Khelifi',
    prenom: 'Nour',
    dateNaissance: '2016-08-25',
    sexe: 'F',
    telephone: '22334455',
    whatsapp: '22334455',
    adresse: 'Menzah 6, Tunis',
    etablissementScolaire: 'Collège Pilote Menzah',
    parentNom: 'Mohamed Khelifi (Père)',
    telephoneParent: '22334455',
    medecinReferent: 'Dr. Souad Gharbi (Neurologue)',
    diagnostic: 'Dyslexie mixte & Dysorthographie développementale',
    motifConsultation: 'Lenteur de lecture et fautes phonologiques récurrentes',
    datePremiereConsultation: '2025-11-04',
    couverture: 'BRIDGE',
    assurance: 'BRIDGE',
    numeroCnam: '',
    notes: 'Plan de rééducation personnalisé avec renforcement de la voie phonologique.',
    tarifSeance: 50,
    createdAt: '2025-11-04T11:00:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
  },
  {
    id: 'pat-3',
    nom: 'Bouazizi',
    prenom: 'Adam',
    dateNaissance: '2020-11-03',
    sexe: 'M',
    telephone: '50667788',
    whatsapp: '50667788',
    adresse: 'La Marsa, Tunis',
    etablissementScolaire: 'Jardin d’enfants Les Petits Génies',
    parentNom: 'Rym Bouazizi',
    telephoneParent: '50667788',
    medecinReferent: 'Dr. Hedi Mansour (ORL)',
    diagnostic: 'Bégaiement développemental tonico-clonique',
    motifConsultation: 'Blocages fréquents et répétition de syllabes depuis 6 mois',
    datePremiereConsultation: '2026-01-10',
    couverture: 'Privé',
    assurance: 'Privé / Sans assurance',
    numeroCnam: '',
    notes: 'Approche indirecte avec guidage parental et travail du souffle.',
    tarifSeance: 45,
    createdAt: '2026-01-10T14:30:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
  },
  {
    id: 'pat-4',
    nom: 'Mejri',
    prenom: 'Sarra',
    dateNaissance: '2014-02-18',
    sexe: 'F',
    telephone: '29887766',
    whatsapp: '29887766',
    adresse: 'Ariana Centre',
    etablissementScolaire: 'Lycée Pierre Mendès France',
    parentNom: 'Tarek Mejri',
    telephoneParent: '29887766',
    medecinReferent: 'Dr. Sonia Jaziri (Orthodontiste)',
    diagnostic: 'Déglutition atypique avec interposition linguale & Respiration buccale',
    motifConsultation: 'Poussée linguale avant traitement multi-bagues',
    datePremiereConsultation: '2026-02-01',
    couverture: 'GAT Assurances',
    assurance: 'GAT Assurances',
    notes: 'Excellente progression motrice buccale.',
    tarifSeance: 45,
    createdAt: '2026-02-01T15:00:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
  },
  {
    id: 'pat-5',
    nom: 'Ayari',
    prenom: 'Mustapha',
    dateNaissance: '1962-06-14',
    sexe: 'M',
    telephone: '97441122',
    whatsapp: '97441122',
    adresse: 'Carthage Byrsa',
    profession: 'Retraité Enseignement',
    medecinReferent: 'Dr. Sami Belhadj (Neurologue Hôpital Razi)',
    diagnostic: 'Aphasie motrice de Broca post-AVC ischémique',
    motifConsultation: 'Récupération de l’expression verbale et fluence',
    datePremiereConsultation: '2026-03-01',
    couverture: 'CNAM',
    assurance: 'CNAM - Filière Privée',
    numeroCnam: '0854216977/00',
    notes: 'Prise en charge prise en charge CNAM 100% accordée (40 séances renouvelables).',
    tarifSeance: 45,
    createdAt: '2026-03-01T09:30:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
  }
];

// Helper to compute today date formatted
function getTodayIso() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

const todayStr = getTodayIso();

const SEED_SEANCES: Seance[] = [
  {
    id: 'sea-1',
    patientId: 'pat-1',
    patientNom: 'Youssef Ben Salem',
    date: todayStr,
    heure: '09:00',
    duree: 45,
    statut: 'Confirmée',
    tarif: 45,
    paye: false,
    notes: 'Séance d’automatisation des fricatives ch / j en phrases complexes.',
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-09-30T08:00:00.000Z',
  },
  {
    id: 'sea-2',
    patientId: 'pat-2',
    patientNom: 'Nour Khelifi',
    date: todayStr,
    heure: '10:00',
    duree: 45,
    statut: 'Prévue',
    tarif: 50,
    paye: false,
    notes: 'Lecture chronométrée et segmentation syllabique.',
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-09-30T08:00:00.000Z',
  },
  {
    id: 'sea-3',
    patientId: 'pat-3',
    patientNom: 'Adam Bouazizi',
    date: todayStr,
    heure: '14:30',
    duree: 45,
    statut: 'Prévue',
    tarif: 45,
    paye: false,
    notes: 'Exercices de fluence et désensibilisation au bégaiement.',
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-09-30T08:00:00.000Z',
  },
  {
    id: 'sea-4',
    patientId: 'pat-5',
    patientNom: 'Mustapha Ayari',
    date: todayStr,
    heure: '16:00',
    duree: 45,
    statut: 'Prévue',
    tarif: 45,
    paye: true,
    notes: 'Dénomination d’images et répétition de syntagmes.',
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-09-30T08:00:00.000Z',
  },
  {
    id: 'sea-5',
    patientId: 'pat-4',
    patientNom: 'Sarra Mejri',
    date: '2026-09-29',
    heure: '15:00',
    duree: 45,
    statut: 'Réalisée',
    tarif: 45,
    paye: true,
    notes: 'Position de repos lingual au palais validée.',
    createdAt: '2026-09-25T10:00:00.000Z',
    updatedAt: '2026-09-29T16:00:00.000Z',
  },
  {
    id: 'sea-6',
    patientId: 'pat-1',
    patientNom: 'Youssef Ben Salem',
    date: '2026-09-25',
    heure: '09:00',
    duree: 45,
    statut: 'Réalisée',
    tarif: 45,
    paye: false,
    notes: 'Très bonne attention.',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-25T10:00:00.000Z',
  },
  {
    id: 'sea-7',
    patientId: 'pat-2',
    patientNom: 'Nour Khelifi',
    date: '2026-09-24',
    heure: '10:00',
    duree: 45,
    statut: 'Réalisée',
    tarif: 50,
    paye: false,
    notes: 'Bilan d’étape satisfaisant.',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-24T11:00:00.000Z',
  },
  {
    id: 'sea-8',
    patientId: 'pat-3',
    patientNom: 'Adam Bouazizi',
    date: '2026-09-23',
    heure: '14:30',
    duree: 45,
    statut: 'Patient absent',
    tarif: 45,
    paye: false,
    notes: 'Absence pour fièvre signalée le matin.',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-23T15:00:00.000Z',
  }
];

const SEED_PROTOCOLES: Protocole[] = [
  {
    id: 'proto-1',
    patientId: 'pat-1',
    patientNom: 'Youssef Ben Salem',
    totalSeances: 30,
    seancesRealisees: 14,
    dateDebut: '2025-10-15',
    dateFinEstimee: '2026-11-30',
    diagnostic: 'Retard de langage & troubles articulatoires',
    objectif: 'Automatiser les phonèmes cibles et enrichir la morphosyntaxe',
    notes: 'Prise en charge CNAM accordée pour 30 séances.',
    statut: 'En cours',
    createdAt: '2025-10-15T09:30:00.000Z',
    updatedAt: '2026-09-25T10:00:00.000Z',
  },
  {
    id: 'proto-2',
    patientId: 'pat-2',
    patientNom: 'Nour Khelifi',
    totalSeances: 40,
    seancesRealisees: 22,
    dateDebut: '2025-11-04',
    dateFinEstimee: '2026-12-15',
    diagnostic: 'Dyslexie / Dysorthographie',
    objectif: 'Vitesse de lecture > 90 mots/min et réduction des confusions auditivo-visuelles',
    notes: 'Prise en charge BRIDGE active.',
    statut: 'En cours',
    createdAt: '2025-11-04T11:30:00.000Z',
    updatedAt: '2026-09-24T11:00:00.000Z',
  },
  {
    id: 'proto-3',
    patientId: 'pat-3',
    patientNom: 'Adam Bouazizi',
    totalSeances: 20,
    seancesRealisees: 8,
    dateDebut: '2026-01-10',
    dateFinEstimee: '2026-10-30',
    diagnostic: 'Bégaiement',
    objectif: 'Amélioration de la fluence verbale et réduction de la tension corporelle',
    notes: 'Suivi régulier 1 fois par semaine.',
    statut: 'En cours',
    createdAt: '2026-01-10T15:00:00.000Z',
    updatedAt: '2026-09-23T15:00:00.000Z',
  },
  {
    id: 'proto-4',
    patientId: 'pat-4',
    patientNom: 'Sarra Mejri',
    totalSeances: 15,
    seancesRealisees: 12,
    dateDebut: '2026-02-01',
    dateFinEstimee: '2026-10-15',
    diagnostic: 'Déglutition atypique',
    objectif: 'Automatisation de la déglutition secondaire adulte',
    notes: 'Protocole presque terminé.',
    statut: 'En cours',
    createdAt: '2026-02-01T15:30:00.000Z',
    updatedAt: '2026-09-29T16:00:00.000Z',
  },
  {
    id: 'proto-5',
    patientId: 'pat-5',
    patientNom: 'Mustapha Ayari',
    totalSeances: 40,
    seancesRealisees: 28,
    dateDebut: '2026-03-01',
    dateFinEstimee: '2026-12-30',
    diagnostic: 'Aphasie de Broca',
    objectif: 'Réactivation du stock lexical et communication fonctionnelle',
    notes: 'Renouvellement CNAM prévu au terme des 40 séances.',
    statut: 'En cours',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-09-30T08:00:00.000Z',
  }
];

const SEED_PAIEMENTS: Paiement[] = [
  {
    id: 'pay-1',
    patientId: 'pat-1',
    patientNom: 'Youssef Ben Salem',
    date: '2026-09-10',
    montant: 180,
    mode: 'Espèces',
    reference: 'Reçu N° 2026-104',
    notes: 'Règlement de 4 séances antérieures.',
    createdAt: '2026-09-10T11:00:00.000Z',
  },
  {
    id: 'pay-2',
    patientId: 'pat-2',
    patientNom: 'Nour Khelifi',
    date: '2026-09-02',
    montant: 200,
    mode: 'Chèque',
    reference: 'Chèque BIAT 882190',
    notes: 'Acompte début septembre.',
    createdAt: '2026-09-02T10:30:00.000Z',
  },
  {
    id: 'pay-3',
    patientId: 'pat-4',
    patientNom: 'Sarra Mejri',
    date: '2026-09-29',
    montant: 90,
    mode: 'Espèces',
    reference: 'Reçu N° 2026-128',
    notes: 'Règlement séance du jour + précédente.',
    createdAt: '2026-09-29T15:45:00.000Z',
  },
  {
    id: 'pay-4',
    patientId: 'pat-5',
    patientNom: 'Mustapha Ayari',
    date: '2026-09-15',
    montant: 225,
    mode: 'Virement',
    reference: 'VIR-STB-99120',
    notes: 'Forfait 5 séances.',
    createdAt: '2026-09-15T14:00:00.000Z',
  }
];

const SEED_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    patientId: 'pat-1',
    patientNom: 'Youssef Ben Salem',
    nom: 'Bilan Orthophonique Initial Youssef',
    type: 'Bilan',
    date: '2025-10-15',
    notes: 'Évaluation complète langage oral (ELO & N-EEL). Retard moyen de 14 mois.',
    fileName: 'Bilan_Initial_Youssef_BenSalem.pdf',
    createdAt: '2025-10-15T10:00:00.000Z',
  },
  {
    id: 'doc-2',
    patientId: 'pat-1',
    patientNom: 'Youssef Ben Salem',
    nom: 'Prise en charge Accordée CNAM',
    type: 'Document administratif',
    date: '2025-10-22',
    notes: 'Accord CNAM 30 séances n° AP-2025-9921',
    fileName: 'Accord_CNAM_Youssef.pdf',
    createdAt: '2025-10-22T14:00:00.000Z',
  },
  {
    id: 'doc-3',
    patientId: 'pat-2',
    patientNom: 'Nour Khelifi',
    nom: 'Bilan de Langage Écrit (BALE & ODEDYS)',
    type: 'Bilan',
    date: '2025-11-04',
    notes: 'Diagnostic de dyslexie-dysorthographie mixte.',
    fileName: 'Bilan_Dyslexie_Nour_Khelifi.pdf',
    createdAt: '2025-11-04T12:00:00.000Z',
  },
  {
    id: 'doc-4',
    patientId: 'pat-5',
    patientNom: 'Mustapha Ayari',
    nom: 'Compte Rendu Neurologique Hôpital Razi',
    type: 'Compte rendu',
    date: '2026-02-20',
    notes: 'IRM cérébrale et rapport Dr. Belhadj.',
    fileName: 'CR_Neurologie_Mustapha_Ayari.pdf',
    createdAt: '2026-03-01T09:30:00.000Z',
  }
];

export class StorageService {
  /**
   * Assure que pour la version réelle du cabinet, la base démarre totalement vide (sans patients de démo)
   */
  static ensureRealCabinetState(): void {
    try {
      const isClean = localStorage.getItem('belgaied_ortho_clean_v1');
      if (isClean !== 'true') {
        localStorage.removeItem(STORAGE_KEYS.PATIENTS);
        localStorage.removeItem(STORAGE_KEYS.SEANCES);
        localStorage.removeItem(STORAGE_KEYS.PROTOCOLES);
        localStorage.removeItem(STORAGE_KEYS.PAIEMENTS);
        localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
        localStorage.setItem('belgaied_ortho_clean_v1', 'true');
      }
    } catch {
      // Safe fallback
    }
  }

  static getPatients(): Patient[] {
    this.ensureRealCabinetState();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static savePatients(patients: Patient[]): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }

  static getSeances(): Seance[] {
    this.ensureRealCabinetState();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEANCES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveSeances(seances: Seance[]): void {
    localStorage.setItem(STORAGE_KEYS.SEANCES, JSON.stringify(seances));
  }

  static getProtocoles(): Protocole[] {
    this.ensureRealCabinetState();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROTOCOLES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveProtocoles(protocoles: Protocole[]): void {
    localStorage.setItem(STORAGE_KEYS.PROTOCOLES, JSON.stringify(protocoles));
  }

  static getPaiements(): Paiement[] {
    this.ensureRealCabinetState();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAIEMENTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static savePaiements(paiements: Paiement[]): void {
    localStorage.setItem(STORAGE_KEYS.PAIEMENTS, JSON.stringify(paiements));
  }

  static getDocuments(): DocumentItem[] {
    this.ensureRealCabinetState();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveDocuments(documents: DocumentItem[]): void {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }

  static getConfig(): CabinetConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
        return DEFAULT_CONFIG;
      }
      const parsed = JSON.parse(data);
      // If previous default placeholder was stored, update to real clinic contact details
      if (parsed.telephone === '+216 98 456 789' || parsed.email === 'maroua.belgaied.ortho@gmail.com') {
        const updated = {
          ...parsed,
          telephone: DEFAULT_CONFIG.telephone,
          whatsapp: DEFAULT_CONFIG.whatsapp,
          email: DEFAULT_CONFIG.email,
          adresse: DEFAULT_CONFIG.adresse,
          ville: DEFAULT_CONFIG.ville,
        };
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
        return updated;
      }
      // Merge with defaults in case of missing keys
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  static saveConfig(config: CabinetConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  static getViewMode(): 'grid' | 'list' {
    return (localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as 'grid' | 'list') || 'list';
  }

  static saveViewMode(mode: 'grid' | 'list'): void {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  }

  /**
   * Ajoute une nouvelle assurance dans les paramètres du cabinet et la persiste
   */
  static addInsuranceOption(newInsurance: string): string[] {
    const config = this.getConfig();
    const clean = newInsurance.trim();
    if (!clean) return config.assurances;
    
    if (!config.assurances.includes(clean)) {
      config.assurances.push(clean);
      this.saveConfig(config);
    }
    return config.assurances;
  }

  /**
   * Export JSON complet de toutes les données du cabinet
   */
  static exportCompleteBackup(): string {
    const backup = {
      app: 'Cabinet d’orthophonie Belgaied Maroua',
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      config: this.getConfig(),
      patients: this.getPatients(),
      seances: this.getSeances(),
      protocoles: this.getProtocoles(),
      paiements: this.getPaiements(),
      documents: this.getDocuments(),
    };
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Import et restauration complète avec validation
   */
  static importBackup(jsonString: string): { success: boolean; message: string; data?: any } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Le fichier sélectionné n’est pas un JSON valide.' };
      }

      if (!Array.isArray(data.patients) || !Array.isArray(data.seances)) {
        return { success: false, message: 'Structure de sauvegarde invalide (patients ou séances manquants).' };
      }

      if (data.patients) this.savePatients(data.patients);
      if (data.seances) this.saveSeances(data.seances);
      if (data.protocoles) this.saveProtocoles(data.protocoles);
      if (data.paiements) this.savePaiements(data.paiements);
      if (data.documents) this.saveDocuments(data.documents);
      if (data.config) this.saveConfig({ ...DEFAULT_CONFIG, ...data.config });

      return {
        success: true,
        message: `Restauration réussie : ${data.patients.length} patients, ${data.seances.length} séances restaurés.`,
        data,
      };
    } catch (err: any) {
      return { success: false, message: `Erreur lors de la lecture du fichier : ${err?.message || 'Format invalide'}` };
    }
  }

  /**
   * Réinitialisation de la base du cabinet (base vierge propre)
   */
  static resetToDefaultData(): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SEANCES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PROTOCOLES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PAIEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    localStorage.setItem('belgaied_ortho_clean_v1', 'true');
  }

  /**
   * Permet de charger un jeu d'exemples de démonstration sur demande explicite
   */
  static loadDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(SEED_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.SEANCES, JSON.stringify(SEED_SEANCES));
    localStorage.setItem(STORAGE_KEYS.PROTOCOLES, JSON.stringify(SEED_PROTOCOLES));
    localStorage.setItem(STORAGE_KEYS.PAIEMENTS, JSON.stringify(SEED_PAIEMENTS));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(SEED_DOCUMENTS));
    localStorage.setItem('belgaied_ortho_clean_v1', 'true');
  }
}
