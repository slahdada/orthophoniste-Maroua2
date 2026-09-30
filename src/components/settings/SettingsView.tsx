import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Building,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  Plus,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { PdfGenerator } from '../../services/pdfGenerator';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const {
    config,
    updateConfig,
    patients,
    importData,
    resetData,
    openConfirmation,
    showToast,
    addInsurance,
  } = useApp();

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

  const [newAssurance, setNewAssurance] = useState('');

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
  };

  // Export JSON Backup
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

  // Import JSON Backup
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
      'Réinitialiser toutes les données ?',
      'Attention : cette action restaurera les données initiales du cabinet. Toutes les modifications non sauvegardées seront écrasées.',
      () => {
        resetData();
      },
      true,
      'Réinitialiser aux valeurs d’origine'
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            <span>Paramètres & Sauvegardes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuration du cabinet Belgaied Maroua, conventions, exports et sécurité
          </p>
        </div>

        <PWAInstallButton />
      </div>

      {/* Section 1 : Cabinet Identity & Contact */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-600" />
            <span>Informations du Cabinet & Praticienne</span>
          </h2>
        </div>

        <form onSubmit={handleSaveCabinetInfo} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom de la praticienne
              </label>
              <input
                type="text"
                required
                value={nomPraticien}
                onChange={(e) => setNomPraticien(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Titre professionnel
              </label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Spécialités / Domaines d'intervention
            </label>
            <input
              type="text"
              value={specialite}
              onChange={(e) => setSpecialite(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Téléphone Cabinet
              </label>
              <input
                type="text"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp professionnel
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email professionnel
              </label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse du Cabinet
              </label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ville / Gouvernorat
              </label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                N° Convention CNAM
              </label>
              <input
                type="text"
                value={conventionCnam}
                onChange={(e) => setConventionCnam(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Matricule Fiscal
              </label>
              <input
                type="text"
                value={matriculeFiscal}
                onChange={(e) => setMatriculeFiscal(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tarif séance par défaut ({devise})
              </label>
              <input
                type="number"
                value={tarifDefaut}
                onChange={(e) => setTarifDefaut(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Durée par défaut (min)
              </label>
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
              <span>Enregistrer les coordonnées</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2 : Assurances & Organismes */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>Liste des Organismes d'Assurance & Prise en Charge</span>
        </h2>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newAssurance}
            onChange={(e) => setNewAssurance(e.target.value)}
            placeholder="Nouvelle assurance (ex: Carte Assurances, Comar...)"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs"
          />
          <button
            type="button"
            onClick={handleAddAssurance}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {config.assurances.map((ass) => (
            <div
              key={ass}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-medium border border-slate-200"
            >
              <span>{ass}</span>
              {config.assurances.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteAssurance(ass)}
                  className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 : Sauvegarde & Exportation Complète */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Download className="w-4 h-4 text-teal-600" />
          <span>Sauvegarde, Restauration & Exportations</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Sauvegarde Complète (JSON)</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Téléchargez l'intégralité des patients, séances, paiements et protocoles en un seul fichier.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger Sauvegarde</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Restaurer Sauvegarde (JSON)</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Restaurez vos données depuis un fichier JSON précédemment exporté.
              </p>
            </div>
            <label className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Restaurer Fichier</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="sr-only"
              />
            </label>
          </div>

          {/* Export CSV */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Export Tableur (CSV)</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Exportez tous les dossiers au format CSV compatible Excel et Google Sheets.
              </p>
            </div>
            <button
              onClick={() => PdfGenerator.exportPatientsCsv(patients)}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exporter Patients CSV</span>
            </button>
          </div>
        </div>

        {/* Reset */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>Données de démonstration du cabinet Belgaied Maroua</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser les données de test</span>
          </button>
        </div>
      </div>
    </div>
  );
};
