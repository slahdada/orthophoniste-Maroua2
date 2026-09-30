import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TypeDocument } from '../../types';
import { getTodayString } from '../../utils/formatters';
import { X, FileText, Upload, User, Calendar } from 'lucide-react';

export const DocumentModal: React.FC = () => {
  const {
    isDocumentModalOpen,
    defaultDocumentPatientId,
    closeDocumentModal,
    addDocument,
    patients,
    showToast,
  } = useApp();

  const [patientId, setPatientId] = useState('');
  const [nom, setNom] = useState('');
  const [type, setType] = useState<TypeDocument>('Bilan');
  const [date, setDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<string | undefined>();
  const [fileSize, setFileSize] = useState<number | undefined>();

  useEffect(() => {
    if (defaultDocumentPatientId) {
      setPatientId(defaultDocumentPatientId);
    } else if (patients.length > 0) {
      setPatientId(patients[0].id);
    }
    setNom('');
    setType('Bilan');
    setDate(getTodayString());
    setNotes('');
    setFileName('');
    setFileData(undefined);
    setFileSize(undefined);
  }, [defaultDocumentPatientId, isDocumentModalOpen, patients]);

  if (!isDocumentModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Fichier trop volumineux (maximum 5 Mo)', 'error');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    if (!nom) {
      setNom(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      showToast('Veuillez sélectionner un patient', 'error');
      return;
    }
    if (!nom.trim()) {
      showToast('Veuillez entrer un titre de document', 'error');
      return;
    }

    const patient = patients.find((p) => p.id === patientId);
    const patientNom = patient ? `${patient.prenom} ${patient.nom}` : 'Patient';

    addDocument({
      patientId,
      patientNom,
      nom: nom.trim(),
      type,
      date,
      notes: notes.trim(),
      fileName,
      fileData,
      fileSize,
    });

    closeDocumentModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">Ajouter un Document</h2>
              <p className="text-xs text-teal-100">Bilan, ordonnance ou compte rendu</p>
            </div>
          </div>
          <button
            onClick={closeDocumentModal}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-slate-50 text-xs sm:text-sm font-medium"
            >
              <option value="">-- Choisir un patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.prenom} {p.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type de document
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TypeDocument)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-slate-50 text-xs sm:text-sm"
              >
                <option value="Bilan">Bilan</option>
                <option value="Compte rendu">Compte rendu</option>
                <option value="Ordonnance">Ordonnance</option>
                <option value="Justificatif">Justificatif</option>
                <option value="Document administratif">Document administratif</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date du document
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-slate-50 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nom / Titre du document <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Bilan Initial Langage Oral 2026"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-slate-50 text-xs sm:text-sm"
            />
          </div>

          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fichier joint (PDF, Image, Scan)
            </label>
            <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-slate-300 border-dashed rounded-xl hover:border-teal-400 transition-colors bg-slate-50">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-7 w-7 text-slate-400" />
                <div className="text-xs text-slate-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-bold text-teal-600 hover:text-teal-500"
                  >
                    <span>Sélectionner un fichier</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG jusqu'à 5 Mo</p>
                </div>
                {fileName && (
                  <p className="text-xs font-semibold text-emerald-600 mt-1">
                    ✓ {fileName}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observations / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Test ELO effectué, score 85%"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 bg-slate-50 text-xs"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeDocumentModal}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Ajouter au dossier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
