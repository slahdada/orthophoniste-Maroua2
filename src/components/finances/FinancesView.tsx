import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Phone,
  MessageSquare,
  Printer,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  User,
  ArrowDownRight,
  Receipt,
} from 'lucide-react';
import { formatCurrency, formatDateFr, getTelLink } from '../../utils/formatters';
import { PdfGenerator } from '../../services/pdfGenerator';

export const FinancesView: React.FC = () => {
  const {
    creances,
    paiements,
    patients,
    stats,
    config,
    openPaiementModal,
    openWhatsAppModal,
    deletePaiement,
    setSelectedPatientId,
    setCurrentTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'creances' | 'paiements' | 'stats'>('creances');
  const [searchPay, setSearchPay] = useState('');

  const filteredPaiements = paiements.filter((p) => {
    if (!searchPay.trim()) return true;
    const q = searchPay.toLowerCase();
    return (
      p.patientNom.toLowerCase().includes(q) ||
      p.mode.toLowerCase().includes(q) ||
      (p.reference || '').toLowerCase().includes(q)
    );
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Compute breakdown by payment mode
  const modeStats = paiements.reduce((acc, p) => {
    acc[p.mode] = (acc[p.mode] || 0) + (p.montant || 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Header & Financial Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-600" />
            <span>Gestion Financière & Créances</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des encaissements, soldes débiteurs et relances
          </p>
        </div>

        <button
          onClick={() => openPaiementModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Encaisser un Règlement</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Encaissements */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Encaissé</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {formatCurrency(stats.paiementsRecusTotal, config.devise)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {paiements.length} règlements enregistrés
          </p>
        </div>

        {/* Mois Courant */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recettes ce mois</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-teal-700">
            {formatCurrency(stats.paiementsMoisCourant, config.devise)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Mois en cours</p>
        </div>

        {/* Créances Totales */}
        <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs ${stats.creancesTotal > 0 ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Créances à Recouvrer</span>
            <div className={`p-2 rounded-xl ${stats.creancesTotal > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className={`mt-2 text-2xl font-extrabold ${stats.creancesTotal > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {formatCurrency(stats.creancesTotal, config.devise)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {creances.length} dossier(s) en attente
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 rounded-2xl">
        <button
          onClick={() => setActiveTab('creances')}
          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'creances'
              ? 'bg-amber-100 text-amber-900 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Créances & Relances ({creances.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('paiements')}
          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'paiements'
              ? 'bg-teal-50 text-teal-700 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4 text-teal-600" />
          <span>Journal des Règlements ({paiements.length})</span>
        </button>
      </div>

      {/* TAB 1: CRÉANCES */}
      {activeTab === 'creances' && (
        <div className="space-y-3">
          {creances.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900">Aucune créance en retard</h3>
              <p className="text-xs text-slate-500 mt-1">Tous les patients sont à jour de paiement !</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4 text-center">Séances Réalisées</th>
                      <th className="py-3 px-4 text-right">Facturé</th>
                      <th className="py-3 px-4 text-right">Déjà Réglé</th>
                      <th className="py-3 px-4 text-right">Reste Dû</th>
                      <th className="py-3 px-4 text-center">Retard</th>
                      <th className="py-3 px-4 text-center">Actions & Relances</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {creances.map((item) => (
                      <tr
                        key={item.patient.id}
                        className="hover:bg-amber-50/30 transition-colors"
                      >
                        <td
                          className="py-3.5 px-4 font-bold text-slate-900 cursor-pointer hover:text-teal-700"
                          onClick={() => {
                            setSelectedPatientId(item.patient.id);
                            setCurrentTab('patients');
                          }}
                        >
                          {item.patient.prenom} {item.patient.nom}
                          <span className="block text-[10px] font-medium text-slate-500">
                            {item.patient.couverture}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.patient.telephoneParent || item.patient.telephone || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                          {item.nbSeancesRealisees}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                          {formatCurrency(item.totalFacture, config.devise)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                          {formatCurrency(item.totalPaye, config.devise)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-amber-700 text-sm">
                          {formatCurrency(item.resteDu, config.devise)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {item.joursRetard} jours
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <a
                              href={getTelLink(item.patient.telephoneParent || item.patient.telephone)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Appeler"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => openWhatsAppModal(item.patient, undefined, 'relance_paiement', item.resteDu)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                              title="Relance WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openPaiementModal(item.patient.id)}
                              className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="Encaisser"
                            >
                              Encaisser
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JOURNAL DES PAIEMENTS */}
      {activeTab === 'paiements' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPay}
                onChange={(e) => setSearchPay(e.target.value)}
                placeholder="Rechercher patient, mode, référence..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Référence</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                    <th className="py-3 px-4 text-center">Reçu PDF</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPaiements.map((pay) => {
                    const pat = patients.find((p) => p.id === pay.patientId);

                    return (
                      <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {formatDateFr(pay.date)}
                        </td>
                        <td
                          className="py-3 px-4 font-bold text-slate-900 cursor-pointer hover:text-teal-700"
                          onClick={() => {
                            if (pat) {
                              setSelectedPatientId(pat.id);
                              setCurrentTab('patients');
                            }
                          }}
                        >
                          {pay.patientNom}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {pay.mode}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {pay.reference || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-emerald-700 text-sm">
                          {formatCurrency(pay.montant, config.devise)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {pat && (
                            <button
                              onClick={() => PdfGenerator.generateRecuPaiementPdf(pay, pat, config)}
                              className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                              title="Télécharger le reçu PDF"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deletePaiement(pay.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
