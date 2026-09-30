import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Phone,
  MessageSquare,
  ChevronRight,
  FileSpreadsheet,
  AlertCircle,
  Shield,
  Calendar,
  DollarSign,
  Archive,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { calculateAge, formatCurrency, formatDateFr, getTelLink, getTodayString } from '../../utils/formatters';
import { PdfGenerator } from '../../services/pdfGenerator';

type FilterCategory = 'all' | 'cnam' | 'bridge' | 'prive' | 'creance' | 'rdv_today' | 'corbeille';

export const PatientsView: React.FC = () => {
  const {
    patients,
    seances,
    paiements,
    config,
    viewMode,
    setViewMode,
    globalSearch,
    setGlobalSearch,
    setSelectedPatientId,
    openPatientModal,
    openWhatsAppModal,
    restorePatient,
    permanentlyDeletePatient,
    openConfirmation,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const todayStr = getTodayString();

  // Active vs Archived counts
  const activeCount = useMemo(() => patients.filter((p) => !p.isArchived).length, [patients]);
  const archivedCount = useMemo(() => patients.filter((p) => !!p.isArchived).length, [patients]);

  // Computed filtered list
  const filteredPatients = useMemo(() => {
    const query = globalSearch.toLowerCase().trim();

    return patients.filter((pat) => {
      // 1. Separate Active vs Corbeille
      if (activeFilter === 'corbeille') {
        if (!pat.isArchived) return false;
      } else {
        if (pat.isArchived) return false;
      }

      // 2. Text Search matching across all relevant fields
      if (query) {
        const matchNom = pat.nom.toLowerCase().includes(query);
        const matchPrenom = pat.prenom.toLowerCase().includes(query);
        const matchTel = (pat.telephone || '').includes(query) || (pat.telephoneParent || '').includes(query);
        const matchCnam = (pat.numeroCnam || '').toLowerCase().includes(query);
        const matchAssurance = (pat.assurance || '').toLowerCase().includes(query);
        const matchDiag = (pat.diagnostic || '').toLowerCase().includes(query);
        const matchNotes = (pat.notes || '').toLowerCase().includes(query);

        if (!matchNom && !matchPrenom && !matchTel && !matchCnam && !matchAssurance && !matchDiag && !matchNotes) {
          return false;
        }
      }

      // 3. Category Filter
      if (activeFilter === 'all' || activeFilter === 'corbeille') return true;

      if (activeFilter === 'cnam') {
        return (pat.couverture || '').toUpperCase().includes('CNAM');
      }
      if (activeFilter === 'bridge') {
        return (pat.couverture || '').toUpperCase().includes('BRIDGE');
      }
      if (activeFilter === 'prive') {
        const c = (pat.couverture || '').toUpperCase();
        return c.includes('PRIV') || c.includes('SANS');
      }
      if (activeFilter === 'rdv_today') {
        return seances.some((s) => s.patientId === pat.id && s.date === todayStr);
      }
      if (activeFilter === 'creance') {
        const nbRealisees = seances.filter((s) => s.patientId === pat.id && s.statut === 'Réalisée').length;
        const totalFacture = nbRealisees * (pat.tarifSeance || config.tarifDefaut);
        const totalPaye = paiements.filter((p) => p.patientId === pat.id).reduce((acc, p) => acc + (p.montant || 0), 0);
        return totalFacture > totalPaye;
      }

      return true;
    });
  }, [patients, seances, paiements, config, globalSearch, activeFilter, todayStr]);

  const handleExportCsv = () => {
    PdfGenerator.exportPatientsCsv(filteredPatients);
  };

  const handlePermanentDelete = (pat: any) => {
    openConfirmation(
      'Supprimer définitivement ce dossier ?',
      `Attention : Cette action effacera de façon irréversible le dossier de ${pat.prenom} ${pat.nom} ainsi que toutes ses séances, protocoles et paiements associés.`,
      () => {
        permanentlyDeletePatient(pat.id);
      },
      true,
      'Supprimer définitivement'
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>{activeFilter === 'corbeille' ? 'Corbeille des Patients' : 'Dossiers Patients'}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {filteredPatients.length} dossier(s)
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeFilter === 'corbeille'
              ? 'Dossiers archivés. Vous pouvez les restaurer ou les purger définitivement.'
              : 'Gestion complète des dossiers, prises en charge et coordonnées'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* List / Grid Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vue Liste / Tableau"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vue Grille / Cartes"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Exporter la liste au format Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => openPatientModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouveau Patient</span>
          </button>
        </div>
      </div>

      {/* Filter Category Pills & Corbeille Button */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            activeFilter === 'all'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-bold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tous les actifs ({activeCount})
        </button>

        <button
          onClick={() => setActiveFilter('cnam')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            activeFilter === 'cnam'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-bold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          CNAM
        </button>

        <button
          onClick={() => setActiveFilter('bridge')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            activeFilter === 'bridge'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-bold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          BRIDGE
        </button>

        <button
          onClick={() => setActiveFilter('prive')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            activeFilter === 'prive'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-bold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Privé
        </button>

        <button
          onClick={() => setActiveFilter('creance')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            activeFilter === 'creance'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold'
              : 'bg-amber-50/60 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          Avec créance
        </button>

        <button
          onClick={() => setActiveFilter('rdv_today')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            activeFilter === 'rdv_today'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold'
              : 'bg-emerald-50/60 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          RDV Aujourd'hui
        </button>

        {/* Bouton Corbeille Distinct */}
        <button
          onClick={() => setActiveFilter('corbeille')}
          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'corbeille'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold'
              : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
          }`}
          title="Consulter et restaurer les dossiers archivés"
        >
          <Archive className="w-3.5 h-3.5 text-amber-700" />
          <span>Corbeille ({archivedCount})</span>
        </button>
      </div>

      {/* Corbeille Alert Banner */}
      {activeFilter === 'corbeille' && (
        <div className="p-3.5 bg-amber-50 border border-amber-300/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Corbeille de sécurité :</strong> Les dossiers archivés conservent toutes leurs séances et documents. Vous pouvez les restaurer en 1 clic.
            </span>
          </div>
          <button
            onClick={() => setActiveFilter('all')}
            className="text-amber-800 hover:underline font-bold shrink-0 cursor-pointer"
          >
            ← Retour aux actifs
          </button>
        </div>
      )}

      {/* Patients Display (Grid or List or Empty First State) */}
      {patients.length === 0 ? (
        <div className="text-center py-20 px-6 bg-gradient-to-b from-teal-50/70 via-white to-slate-50 rounded-3xl border border-teal-200/80 shadow-md max-w-xl mx-auto space-y-5 animate-in fade-in duration-200 my-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-teal-600/30">
            <UserPlus className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Aucun patient enregistré
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Votre base de données est prête pour votre cabinet réel. Commencez par créer votre premier dossier patient.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => openPatientModal()}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-teal-600/30 hover:shadow-xl hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              <span>Commencez par créer mon premier dossier</span>
            </button>
          </div>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          {activeFilter === 'corbeille' ? (
            <Archive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          ) : (
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          )}
          <h3 className="text-sm font-bold text-slate-900">
            {activeFilter === 'corbeille' ? 'La corbeille est vide' : 'Aucun patient trouvé'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeFilter === 'corbeille'
              ? 'Aucun dossier patient archivé pour le moment.'
              : globalSearch
              ? `Aucun dossier ne correspond à la recherche "${globalSearch}".`
              : 'Aucun patient ne correspond aux critères sélectionnés.'}
          </p>
          <button
            onClick={() => {
              setGlobalSearch('');
              setActiveFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Cards) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((pat) => {
            const age = calculateAge(pat.dateNaissance);
            const patSeances = seances.filter((s) => s.patientId === pat.id);
            const nbRealisees = patSeances.filter((s) => s.statut === 'Réalisée').length;
            const totalFacture = nbRealisees * (pat.tarifSeance || config.tarifDefaut);
            const totalPaye = paiements.filter((p) => p.patientId === pat.id).reduce((acc, p) => acc + (p.montant || 0), 0);
            const resteDu = Math.max(0, totalFacture - totalPaye);

            return (
              <div
                key={pat.id}
                onClick={() => setSelectedPatientId(pat.id)}
                className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between group ${
                  pat.isArchived
                    ? 'bg-amber-50/30 border-amber-200 hover:border-amber-400'
                    : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-teal-700 transition-colors">
                        {pat.prenom} {pat.nom}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {age} • {pat.sexe === 'M' ? 'Masculin' : 'Féminin'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {pat.isArchived ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                          Corbeille
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {pat.couverture}
                        </span>
                      )}
                    </div>
                  </div>

                  {pat.diagnostic && (
                    <p className="text-xs text-slate-700 mt-2.5 font-medium line-clamp-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      {pat.diagnostic}
                    </p>
                  )}

                  {pat.isArchived && pat.archivedAt && (
                    <p className="text-[11px] text-amber-700 font-semibold mt-2">
                      Archivé le {formatDateFr(pat.archivedAt)}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500">
                    <span>{nbRealisees} séance(s)</span>
                    {resteDu > 0 && !pat.isArchived && (
                      <span className="ml-2 font-bold text-amber-700">
                        • Dû: {formatCurrency(resteDu, config.devise)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {pat.isArchived ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => restorePatient(pat.id)}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Restaurer le dossier"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restaurer</span>
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(pat)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <a
                          href={getTelLink(pat.telephoneParent || pat.telephone)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Appeler"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => openWhatsAppModal(pat, undefined, 'rappel_rdv', resteDu)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW (Desktop Table / Responsive Rows) */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Âge</th>
                  <th className="py-3 px-4">Couverture / Statut</th>
                  <th className="py-3 px-4">Diagnostic</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-right">Solde Dû</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((pat) => {
                  const age = calculateAge(pat.dateNaissance);
                  const nbRealisees = seances.filter((s) => s.patientId === pat.id && s.statut === 'Réalisée').length;
                  const totalFacture = nbRealisees * (pat.tarifSeance || config.tarifDefaut);
                  const totalPaye = paiements.filter((p) => p.patientId === pat.id).reduce((acc, p) => acc + (p.montant || 0), 0);
                  const resteDu = Math.max(0, totalFacture - totalPaye);

                  return (
                    <tr
                      key={pat.id}
                      onClick={() => setSelectedPatientId(pat.id)}
                      className="hover:bg-teal-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-teal-700">
                        {pat.prenom} {pat.nom}
                        {pat.parentNom && (
                          <span className="block text-[10px] font-normal text-slate-400">
                            {pat.parentNom}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {age}
                      </td>
                      <td className="py-3.5 px-4">
                        {pat.isArchived ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                            Corbeille
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {pat.couverture}
                          </span>
                        )}
                        {pat.numeroCnam && (
                          <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                            {pat.numeroCnam}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-[200px] truncate">
                        {pat.diagnostic || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {pat.telephoneParent || pat.telephone || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {resteDu > 0 && !pat.isArchived ? (
                          <span className="font-extrabold text-amber-700">
                            {formatCurrency(resteDu, config.devise)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">À jour</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {pat.isArchived ? (
                            <>
                              <button
                                onClick={() => restorePatient(pat.id)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Restaurer le dossier"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restaurer</span>
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(pat)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Supprimer définitivement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <a
                                href={getTelLink(pat.telephoneParent || pat.telephone)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                title="Appeler"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => openWhatsAppModal(pat, undefined, 'rappel_rdv', resteDu)}
                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors cursor-pointer"
                                title="WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
