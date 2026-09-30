import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, SexeType } from '../../types';
import { calculateAge, getTodayString } from '../../utils/formatters';
import { X, Plus, User, Phone, Shield, FileText, Calendar, ChevronDown, ChevronUp, Check, Sparkles } from 'lucide-react';

export const PatientFormModal: React.FC = () => {
  const {
    isPatientModalOpen,
    patientToEdit,
    closePatientModal,
    addPatient,
    updatePatient,
    config,
    addInsurance,
    showToast,
  } = useApp();

  // 5 Essential Fields
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [telephone, setTelephone] = useState('');
  const [couverture, setCouverture] = useState('CNAM');
  const [assurance, setAssurance] = useState('CNAM - Filière Privée');
  const [notes, setNotes] = useState('');

  // Secondary Optional Fields (Collapsible)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sexe, setSexe] = useState<SexeType>('M');
  const [whatsapp, setWhatsapp] = useState('');
  const [parentNom, setParentNom] = useState('');
  const [telephoneParent, setTelephoneParent] = useState('');
  const [adresse, setAdresse] = useState('');
  const [profession, setProfession] = useState('');
  const [etablissementScolaire, setEtablissementScolaire] = useState('');
  const [medecinReferent, setMedecinReferent] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [motifConsultation, setMotifConsultation] = useState('');
  const [numeroCnam, setNumeroCnam] = useState('');
  const [datePremiereConsultation, setDatePremiereConsultation] = useState(getTodayString());
  const [tarifSeance, setTarifSeance] = useState(config.tarifDefaut);

  // "+ NOUVEAU" interactive insurance input
  const [isAddingNewInsurance, setIsAddingNewInsurance] = useState(false);
  const [newInsuranceName, setNewInsuranceName] = useState('');

  useEffect(() => {
    if (patientToEdit) {
      setNom(patientToEdit.nom || '');
      setPrenom(patientToEdit.prenom || '');
      setDateNaissance(patientToEdit.dateNaissance || '');
      setTelephone(patientToEdit.telephone || '');
      setCouverture(patientToEdit.couverture || 'CNAM');
      setAssurance(patientToEdit.assurance || 'CNAM - Filière Privée');
      setNotes(patientToEdit.notes || '');

      // Secondary
      setSexe(patientToEdit.sexe || 'M');
      setWhatsapp(patientToEdit.whatsapp || '');
      setParentNom(patientToEdit.parentNom || '');
      setTelephoneParent(patientToEdit.telephoneParent || '');
      setAdresse(patientToEdit.adresse || '');
      setProfession(patientToEdit.profession || '');
      setEtablissementScolaire(patientToEdit.etablissementScolaire || '');
      setMedecinReferent(patientToEdit.medecinReferent || '');
      setDiagnostic(patientToEdit.diagnostic || '');
      setMotifConsultation(patientToEdit.motifConsultation || '');
      setNumeroCnam(patientToEdit.numeroCnam || '');
      setDatePremiereConsultation(patientToEdit.datePremiereConsultation || getTodayString());
      setTarifSeance(patientToEdit.tarifSeance || config.tarifDefaut);

      // If existing patient has secondary fields filled, expand advanced
      if (
        patientToEdit.adresse ||
        patientToEdit.parentNom ||
        patientToEdit.medecinReferent ||
        patientToEdit.etablissementScolaire
      ) {
        setShowAdvanced(true);
      } else {
        setShowAdvanced(false);
      }
    } else {
      // New patient defaults (Clean & Empty)
      setNom('');
      setPrenom('');
      setDateNaissance('');
      setTelephone('');
      setCouverture('CNAM');
      setAssurance('CNAM - Filière Privée');
      setNotes('');

      // Secondary defaults
      setSexe('M');
      setWhatsapp('');
      setParentNom('');
      setTelephoneParent('');
      setAdresse('');
      setProfession('');
      setEtablissementScolaire('');
      setMedecinReferent('');
      setDiagnostic('');
      setMotifConsultation('');
      setNumeroCnam('');
      setDatePremiereConsultation(getTodayString());
      setTarifSeance(config.tarifDefaut);
      setShowAdvanced(false);
    }
    setIsAddingNewInsurance(false);
    setNewInsuranceName('');
  }, [patientToEdit, isPatientModalOpen, config]);

  if (!isPatientModalOpen) return null;

  const currentCalculatedAge = calculateAge(dateNaissance);

  const handleAddNewInsuranceSubmit = () => {
    if (!newInsuranceName.trim()) return;
    const cleanName = newInsuranceName.trim();
    addInsurance(cleanName);
    setAssurance(cleanName);
    setIsAddingNewInsurance(false);
    setNewInsuranceName('');
    showToast(`Assurance "${cleanName}" ajoutée avec succès ✓`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) {
      showToast('Veuillez renseigner le nom et le prénom du patient', 'error');
      return;
    }

    const patientData = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      dateNaissance,
      sexe,
      telephone: telephone.trim(),
      whatsapp: whatsapp.trim() || telephone.trim(),
      adresse: adresse.trim(),
      profession: profession.trim(),
      etablissementScolaire: etablissementScolaire.trim(),
      parentNom: parentNom.trim(),
      telephoneParent: telephoneParent.trim(),
      medecinReferent: medecinReferent.trim(),
      diagnostic: diagnostic.trim() || notes.trim() || 'Bilan / Rééducation orthophonique',
      motifConsultation: motifConsultation.trim() || notes.trim(),
      datePremiereConsultation,
      couverture,
      assurance,
      numeroCnam: numeroCnam.trim(),
      notes: notes.trim(),
      tarifSeance: Number(tarifSeance) || config.tarifDefaut,
    };

    if (patientToEdit) {
      updatePatient(patientToEdit.id, patientData);
    } else {
      addPatient(patientData);
    }
    closePatientModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* En-tête de la modale */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl shrink-0 shadow-xs">
              <User className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg leading-tight">
                {patientToEdit ? `Modifier : ${patientToEdit.prenom} ${patientToEdit.nom}` : 'Nouveau Patient'}
              </h2>
              <p className="text-xs text-teal-100/90 mt-0.5">
                {patientToEdit ? 'Mise à jour du dossier' : 'Création simplifiée et rapide'}
              </p>
            </div>
          </div>
          <button
            onClick={closePatientModal}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du Formulaire Simplifié */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          {/* 1. NOM ET PRÉNOM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Ben Salem"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Prénom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ex: Youssef"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 2. DATE DE NAISSANCE AVEC ÂGE AUTOMATIQUE */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Date de naissance
              </label>
              {dateNaissance && (
                <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 rounded-full border border-teal-200 text-[11px] font-bold">
                  🎂 {currentCalculatedAge}
                </span>
              )}
            </div>
            <input
              type="date"
              value={dateNaissance}
              onChange={(e) => setDateNaissance(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 text-slate-900"
            />
          </div>

          {/* 3. TÉLÉPHONE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Téléphone <span className="text-slate-400 font-normal">(patient ou parent)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="Ex: 29 123 456"
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* 4. COUVERTURE & ASSURANCE */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Couverture
            </label>

            {/* Quick Pill Selector */}
            <div className="grid grid-cols-4 gap-1.5">
              {['CNAM', 'BRIDGE', 'Privé', 'Autre'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCouverture(c);
                    if (c === 'CNAM') setAssurance('CNAM - Filière Privée');
                    if (c === 'BRIDGE') setAssurance('BRIDGE');
                    if (c === 'Privé') setAssurance('Privé / Sans assurance');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    couverture === c
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Detailed formula & "+ NOUVEAU" */}
            <div className="mt-2">
              {!isAddingNewInsurance ? (
                <div className="flex items-center gap-2">
                  <select
                    value={assurance}
                    onChange={(e) => setAssurance(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs font-medium text-slate-800"
                  >
                    {config.assurances.map((ass) => (
                      <option key={ass} value={ass}>
                        {ass}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewInsurance(true)}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-teal-50 text-teal-700 border border-slate-300 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    title="Ajouter un nouvel organisme"
                  >
                    + NOUVEAU
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-teal-50/70 border border-teal-200 rounded-xl">
                  <input
                    type="text"
                    autoFocus
                    value={newInsuranceName}
                    onChange={(e) => setNewInsuranceName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewInsuranceSubmit();
                      }
                    }}
                    placeholder="Nom de l'assurance..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewInsuranceSubmit}
                    className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewInsurance(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 5. NOTES ÉVENTUELLES */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notes éventuelles <span className="text-slate-400 font-normal">(motif, diagnostic ou observation)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Retard de parole, dyslalie, bégaiement ou première consultation..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 text-slate-900 placeholder:text-slate-400 resize-none text-xs leading-relaxed"
            />
          </div>

          {/* ========================================================================= */}
          {/* SECTION OPTIONNELLE DÉPLIABLE (INFORMATIONS SECONDAIRES) */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2 px-3 flex items-center justify-between text-xs font-bold text-teal-800 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
            >
              <span>{showAdvanced ? '− Masquer les détails secondaires' : '+ Informations secondaires (optionnel)'}</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sexe</label>
                    <select
                      value={sexe}
                      onChange={(e) => setSexe(e.target.value as SexeType)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="M">Masculin (Garçon / Homme)</option>
                      <option value="F">Féminin (Fille / Femme)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Numéro CNAM</label>
                    <input
                      type="text"
                      value={numeroCnam}
                      onChange={(e) => setNumeroCnam(e.target.value)}
                      placeholder="Ex: 12345678/01"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nom Parent / Tuteur</label>
                    <input
                      type="text"
                      value={parentNom}
                      onChange={(e) => setParentNom(e.target.value)}
                      placeholder="Ex: Mère / Père"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tél. Parent</label>
                    <input
                      type="tel"
                      value={telephoneParent}
                      onChange={(e) => setTelephoneParent(e.target.value)}
                      placeholder="Ex: 98 111 222"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">École / Profession</label>
                    <input
                      type="text"
                      value={etablissementScolaire}
                      onChange={(e) => setEtablissementScolaire(e.target.value)}
                      placeholder="Ex: École Hannibal, CE1"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Médecin référent</label>
                    <input
                      type="text"
                      value={medecinReferent}
                      onChange={(e) => setMedecinReferent(e.target.value)}
                      placeholder="Ex: Dr. Ben Amor (ORL/Pédiatre)"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    placeholder="Ex: Bab Saadoun, Tunis"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
            💡 Vous pourrez compléter ou modifier toutes les informations médicales et administratives à tout moment depuis la fiche du patient.
          </p>

          {/* Bouton de Soumission Principal */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closePatientModal}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer text-xs"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-extrabold shadow-lg shadow-teal-600/25 active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{patientToEdit ? 'Enregistrer les modifications' : 'Créer le dossier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
