import { jsPDF } from 'jspdf';
import { CabinetConfig, Paiement, Patient, Protocole, Seance } from '../types';
import { calculateAge, formatCurrency, formatDateFr } from '../utils/formatters';

export class PdfGenerator {
  /**
   * Génère une fiche patient complète en PDF
   */
  static generateFichePatientPdf(patient: Patient, cabinet: CabinetConfig, seances: Seance[] = [], protocoles: Protocole[] = [], paiements: Paiement[] = []): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const ageStr = calculateAge(patient.dateNaissance);

    // En-tête Cabinet
    doc.setFillColor(13, 148, 136); // Teal 600
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`CABINET D'ORTHOPHONIE - ${cabinet.nomPraticien.toUpperCase()}`, 14, 12);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${cabinet.titre} | Tél : ${cabinet.telephone} | ${cabinet.ville}`, 14, 19);
    doc.text(`Adresse : ${cabinet.adresse}`, 14, 24);

    // Titre Document
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('DOSSIER MÉDICO-ADMINISTRATIF DU PATIENT', 14, 38);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Édité le : ${formatDateFr(new Date().toISOString(), true)}`, 150, 38);

    // Ligne de séparation
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, 41, 196, 41);

    // Cadre Informations Patient
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 46, 182, 54, 2, 2, 'F');
    doc.rect(14, 46, 182, 54, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. IDENTIFICATION DU PATIENT', 18, 53);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nom & Prénom : ${patient.prenom} ${patient.nom}`, 18, 60);
    doc.text(`Date de naissance : ${formatDateFr(patient.dateNaissance)} (${ageStr})`, 18, 66);
    doc.text(`Sexe : ${patient.sexe === 'M' ? 'Masculin' : 'Féminin'}`, 18, 72);
    doc.text(`Téléphone / WhatsApp : ${patient.telephone || '—'}`, 18, 78);
    doc.text(`Adresse : ${patient.adresse || '—'}`, 18, 84);

    doc.text(`Couverture : ${patient.couverture || '—'}`, 110, 60);
    doc.text(`Assurance : ${patient.assurance || '—'}`, 110, 66);
    doc.text(`N° CNAM : ${patient.numeroCnam || '—'}`, 110, 72);
    doc.text(`Parent / Tuteur : ${patient.parentNom || '—'}`, 110, 78);
    doc.text(`Établissement : ${patient.etablissementScolaire || patient.profession || '—'}`, 110, 84);

    // Cadre Clinique & Diagnostic
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 105, 182, 45, 2, 2, 'F');
    doc.rect(14, 105, 182, 45, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. INFORMATIONS CLINIQUES & DIAGNOSTIC', 18, 112);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Médecin Référent / Prescripteur : ${patient.medecinReferent || 'Non spécifié'}`, 18, 119);
    doc.text(`Motif de consultation : ${patient.motifConsultation || '—'}`, 18, 126);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Diagnostic Orthophonique :`, 18, 133);
    doc.setFont('helvetica', 'normal');
    const diagLines = doc.splitTextToSize(patient.diagnostic || 'Non renseigné', 165);
    doc.text(diagLines, 18, 138);

    // Cadre Protocole & Suivi
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 155, 182, 42, 2, 2, 'F');
    doc.rect(14, 155, 182, 42, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. PROTOCOLE DE SOINS & HISTORIQUE DES SÉANCES', 18, 162);

    const proto = protocoles.find(p => p.patientId === patient.id);
    const patSeances = seances.filter(s => s.patientId === patient.id);
    const effectuees = patSeances.filter(s => s.statut === 'Réalisée').length;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    if (proto) {
      const pct = Math.round((effectuees / (proto.totalSeances || 1)) * 100);
      doc.text(`Protocole : ${effectuees} / ${proto.totalSeances} séances (${pct}%)`, 18, 169);
      doc.text(`Objectifs : ${proto.objectif || '—'}`, 18, 175);
    } else {
      doc.text(`Séances enregistrées : ${effectuees} séance(s) réalisée(s)`, 18, 169);
    }
    doc.text(`Tarif conventionnel unitaire : ${formatCurrency(patient.tarifSeance || cabinet.tarifDefaut, cabinet.devise)}`, 18, 181);
    doc.text(`Total séances dans le dossier : ${patSeances.length} séance(s)`, 18, 187);

    // Cadre Situation Financière
    const patPaiements = paiements.filter(p => p.patientId === patient.id);
    const totalPaye = patPaiements.reduce((acc, p) => acc + p.montant, 0);
    const totalFacture = effectuees * (patient.tarifSeance || cabinet.tarifDefaut);
    const resteDu = Math.max(0, totalFacture - totalPaye);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 202, 182, 35, 2, 2, 'F');
    doc.rect(14, 202, 182, 35, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('4. SITUATION FINANCIÈRE & RÈGLEMENTS', 18, 209);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total facturé (${effectuees} séances) : ${formatCurrency(totalFacture, cabinet.devise)}`, 18, 217);
    doc.text(`Total des règlements reçus : ${formatCurrency(totalPaye, cabinet.devise)}`, 18, 224);
    
    doc.setFont('helvetica', 'bold');
    if (resteDu > 0) {
      doc.setTextColor(185, 28, 28);
      doc.text(`Solde restant à régler : ${formatCurrency(resteDu, cabinet.devise)}`, 18, 231);
    } else {
      doc.setTextColor(21, 128, 61);
      doc.text(`Solde à jour : Aucun impayé`, 18, 231);
    }

    // Bas de page & Signature
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.text('Cachet et signature de l’orthophoniste :', 130, 255);
    doc.text(`Dr/Orthophoniste ${cabinet.nomPraticien}`, 130, 260);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Document confidentiel généré par Cabinet d'orthophonie ${cabinet.nomPraticien}`, 14, 285);
    doc.text(`Page 1 / 1`, 185, 285);

    doc.save(`Fiche_Patient_${patient.nom}_${patient.prenom}.pdf`);
  }

  /**
   * Génère un reçu d'honoraires / attestation de paiement
   */
  static generateRecuPaiementPdf(paiement: Paiement, patient: Patient, cabinet: CabinetConfig): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5',
    });

    // En-tête
    doc.setFillColor(13, 148, 136);
    doc.rect(0, 0, 148, 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`CABINET D'ORTHOPHONIE`, 10, 9);
    doc.setFontSize(10);
    doc.text(cabinet.nomPraticien.toUpperCase(), 10, 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tél : ${cabinet.telephone} | ${cabinet.ville}`, 85, 12);

    // Titre
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text("REÇU DE RÈGLEMENT D'HONORAIRES", 10, 32);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Réf : ${paiement.reference || paiement.id}`, 10, 38);
    doc.text(`Date : ${formatDateFr(paiement.date)}`, 95, 38);

    // Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(10, 43, 128, 65, 2, 2, 'F');
    doc.rect(10, 43, 128, 65, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.text(`Reçu de : M./Mme/Enfant ${patient.prenom} ${patient.nom}`, 14, 52);
    doc.text(`Couverture médicale : ${patient.couverture} (${patient.assurance})`, 14, 60);
    if (patient.numeroCnam) {
      doc.text(`N° Affiliation CNAM : ${patient.numeroCnam}`, 14, 68);
    }
    doc.text(`Mode de paiement : ${paiement.mode}`, 14, 76);
    if (paiement.notes) {
      doc.text(`Objet : ${paiement.notes}`, 14, 84);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(13, 148, 136);
    doc.text(`MONTANT REÇU : ${formatCurrency(paiement.montant, cabinet.devise)}`, 14, 98);

    // Signature
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.text(`Signature et Cachet :`, 80, 120);
    doc.text(`${cabinet.nomPraticien}`, 80, 125);

    doc.save(`Recu_${patient.nom}_${paiement.id}.pdf`);
  }

  /**
   * Export CSV des patients
   */
  static exportPatientsCsv(patients: Patient[]): void {
    const headers = ['Nom', 'Prénom', 'Date Naissance', 'Sexe', 'Téléphone', 'Couverture', 'Assurance', 'N° CNAM', 'Diagnostic', 'Médecin'];
    const rows = patients.map(p => [
      `"${p.nom}"`,
      `"${p.prenom}"`,
      `"${p.dateNaissance}"`,
      `"${p.sexe}"`,
      `"${p.telephone}"`,
      `"${p.couverture}"`,
      `"${p.assurance}"`,
      `"${p.numeroCnam || ''}"`,
      `"${(p.diagnostic || '').replace(/"/g, '""')}"`,
      `"${(p.medecinReferent || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Patients_Cabinet_Belgaied_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
