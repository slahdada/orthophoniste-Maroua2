import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { WhatsAppModal } from './components/common/WhatsAppModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientsView } from './components/patients/PatientsView';
import { PatientFormModal } from './components/patients/PatientFormModal';
import { PatientDetailModal } from './components/patients/PatientDetailModal';
import { PlanningView } from './components/planning/PlanningView';
import { SeanceFormModal } from './components/planning/SeanceFormModal';
import { FinancesView } from './components/finances/FinancesView';
import { PaiementFormModal } from './components/finances/PaiementFormModal';
import { PlusView } from './components/plus/PlusView';
import { DocumentModal } from './components/documents/DocumentModal';
import { GlobalActionButton } from './components/common/GlobalActionButton';

const MainAppContent: React.FC = () => {
  const { currentTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white pb-16 lg:pb-6">
      {/* Header with Navigation & Global Search */}
      <Header />

      {/* Main Container View: 5 Primary Sections */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {currentTab === 'dashboard' && <DashboardView />}
        {currentTab === 'patients' && <PatientsView />}
        {currentTab === 'planning' && <PlanningView />}
        {currentTab === 'finances' && <FinancesView />}
        {currentTab === 'plus' && <PlusView />}
      </main>

      {/* Floating Global Action Button (+ Patient, + Séance, + Paiement) */}
      <GlobalActionButton />

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Modals & Dialogs */}
      <PatientFormModal />
      <PatientDetailModal />
      <SeanceFormModal />
      <PaiementFormModal />
      <DocumentModal />
      <WhatsAppModal />
      <ConfirmationModal />

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
