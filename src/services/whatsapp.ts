import { CabinetConfig, Patient, Seance } from '../types';
import { formatDateFr, getWhatsAppLink } from '../utils/formatters';

export type TemplateType = 'rappel_rdv' | 'confirmation_rdv' | 'modification_rdv' | 'relance_paiement' | 'personnalise';

export interface WhatsAppTemplateOptions {
  type: TemplateType;
  cabinet: CabinetConfig;
  patient: Patient;
  seance?: Seance;
  montantDu?: number;
  customMessage?: string;
}

export function generateWhatsAppMessage(options: WhatsAppTemplateOptions): string {
  const { type, cabinet, patient, seance, montantDu, customMessage } = options;
  const nomComplet = `${patient.prenom} ${patient.nom}`;
  const nomDestinataire = patient.parentNom ? `${patient.parentNom} (Parent de ${patient.prenom})` : nomComplet;

  switch (type) {
    case 'rappel_rdv': {
      const dateStr = seance ? formatDateFr(seance.date, true) : "prochainement";
      const heureStr = seance ? seance.heure : "";
      return `Bonjour ${nomDestinataire},\n\n` +
        `Le Cabinet d'orthophonie ${cabinet.nomPraticien} vous rappelle la séance d'orthophonie de ${patient.prenom} prévue le *${dateStr}* à *${heureStr}*.\n\n` +
        `Merci de bien vouloir confirmer votre présence ou nous prévenir au moins 24h à l'avance en cas d'empêchement.\n\n` +
        `Bien cordialement,\n*Cabinet ${cabinet.nomPraticien}*\nTél : ${cabinet.telephone}`;
    }

    case 'confirmation_rdv': {
      const dateStr = seance ? formatDateFr(seance.date, true) : "";
      const heureStr = seance ? seance.heure : "";
      return `Bonjour ${nomDestinataire},\n\n` +
        `Nous vous confirmons la séance d'orthophonie de ${patient.prenom} pour le *${dateStr}* à *${heureStr}* au cabinet.\n\n` +
        `Adresse : ${cabinet.adresse}, ${cabinet.ville}\n` +
        `À très bientôt !\n\n*${cabinet.nomPraticien} - ${cabinet.titre}*`;
    }

    case 'modification_rdv': {
      const dateStr = seance ? formatDateFr(seance.date, true) : "";
      const heureStr = seance ? seance.heure : "";
      return `Bonjour ${nomDestinataire},\n\n` +
        `Votre séance d'orthophonie pour ${patient.prenom} a été replanifiée au *${dateStr}* à *${heureStr}*.\n\n` +
        `N'hésitez pas à nous contacter si cet horaire ne vous convient pas.\n\n` +
        `Bien à vous,\n*Cabinet ${cabinet.nomPraticien}*`;
    }

    case 'relance_paiement': {
      const du = montantDu !== undefined ? `${montantDu.toLocaleString('fr-FR')} ${cabinet.devise}` : "le solde en cours";
      return `Bonjour ${nomDestinataire},\n\n` +
        `Sauf erreur de notre part, le solde des séances d'orthophonie de ${patient.prenom} présente un reste à régler de *${du}*.\n\n` +
        `Nous vous remercions de bien vouloir régulariser ce montant lors de votre prochaine visite ou par virement bancaire.\n\n` +
        `Restant à votre disposition pour tout renseignement.\n\n*Cabinet ${cabinet.nomPraticien}*\nTél : ${cabinet.telephone}`;
    }

    case 'personnalise':
    default:
      return customMessage || `Bonjour ${nomDestinataire},\n\nMessage du Cabinet d'orthophonie ${cabinet.nomPraticien}.`;
  }
}

export function openWhatsApp(options: WhatsAppTemplateOptions): void {
  const phone = options.patient.whatsapp || options.patient.telephoneParent || options.patient.telephone;
  const message = generateWhatsAppMessage(options);
  const link = getWhatsAppLink(phone, message);
  if (link) {
    window.open(link, '_blank');
  }
}
