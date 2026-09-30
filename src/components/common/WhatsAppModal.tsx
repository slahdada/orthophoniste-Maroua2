import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Send, Phone, User, Calendar, DollarSign, X } from 'lucide-react';
import { generateWhatsAppMessage, TemplateType } from '../../services/whatsapp';
import { cleanPhoneNumber, getWhatsAppLink } from '../../utils/formatters';

export const WhatsAppModal: React.FC = () => {
  const { isWhatsAppModalOpen, whatsAppData, closeWhatsAppModal, config, showToast } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('rappel_rdv');
  const [customText, setCustomText] = useState('');
  const [targetPhone, setTargetPhone] = useState('');

  useEffect(() => {
    if (whatsAppData) {
      if (whatsAppData.templateType) {
        setSelectedTemplate(whatsAppData.templateType as TemplateType);
      } else {
        setSelectedTemplate('rappel_rdv');
      }
      const initialPhone =
        whatsAppData.patient.whatsapp ||
        whatsAppData.patient.telephoneParent ||
        whatsAppData.patient.telephone ||
        '';
      setTargetPhone(initialPhone);
    }
  }, [whatsAppData]);

  if (!isWhatsAppModalOpen || !whatsAppData) return null;

  const { patient, seance, montantDu } = whatsAppData;

  const generatedMessage = generateWhatsAppMessage({
    type: selectedTemplate,
    cabinet: config,
    patient,
    seance,
    montantDu,
    customMessage: customText,
  });

  const handleSend = () => {
    const { international } = cleanPhoneNumber(targetPhone);
    if (!international) {
      showToast('Veuillez renseigner un numéro de téléphone valide', 'error');
      return;
    }
    const link = getWhatsAppLink(targetPhone, generatedMessage);
    window.open(link, '_blank');
    closeWhatsAppModal();
    showToast('Redirection vers WhatsApp...', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <MessageSquare className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">Envoi Message WhatsApp</h3>
              <p className="text-xs text-emerald-100">
                Patient : <span className="font-semibold text-white">{patient.prenom} {patient.nom}</span>
              </p>
            </div>
          </div>
          <button
            onClick={closeWhatsAppModal}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Numéro de destination */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Numéro WhatsApp destinataire
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="Ex: 98112233 ou +216..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
              />
            </div>
            {/* Shortcuts for phone numbers */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {patient.whatsapp && (
                <button
                  type="button"
                  onClick={() => setTargetPhone(patient.whatsapp || '')}
                  className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  WhatsApp: {patient.whatsapp}
                </button>
              )}
              {patient.telephoneParent && (
                <button
                  type="button"
                  onClick={() => setTargetPhone(patient.telephoneParent || '')}
                  className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Parent: {patient.telephoneParent}
                </button>
              )}
            </div>
          </div>

          {/* Choix du modèle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Modèle de message
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedTemplate('rappel_rdv')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  selectedTemplate === 'rappel_rdv'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Rappel de séance</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('confirmation_rdv')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  selectedTemplate === 'confirmation_rdv'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Confirmation RDV</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('modification_rdv')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  selectedTemplate === 'modification_rdv'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Modification RDV</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('relance_paiement')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  selectedTemplate === 'relance_paiement'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Relance Paiement</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTemplate('personnalise')}
              className={`w-full mt-2 p-2 rounded-xl border text-xs text-left flex items-center gap-2 transition-all cursor-pointer ${
                selectedTemplate === 'personnalise'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Message libre & personnalisé</span>
            </button>
          </div>

          {selectedTemplate === 'personnalise' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Texte personnalisé
              </label>
              <textarea
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Rédigez votre message ici..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
              />
            </div>
          )}

          {/* Prévisualisation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Aperçu du message WhatsApp
            </label>
            <div className="p-3 bg-emerald-950 text-emerald-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-emerald-800/60 shadow-inner">
              {generatedMessage}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeWhatsAppModal}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ouvrir dans WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
