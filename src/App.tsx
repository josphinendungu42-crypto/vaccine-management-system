/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './components/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { PatientManagement } from './components/PatientManagement';
import { ClinicalOperations } from './components/ClinicalOperations';
import { InventoryManagement } from './components/InventoryManagement';
import { AuditTrail } from './components/AuditTrail';
import { SystemConfiguration } from './components/SystemConfiguration';
import { LoginScreen } from './components/LoginScreen';
import { motion, AnimatePresence } from 'motion/react';
import { Syringe, HelpCircle, HardDriveDownload } from 'lucide-react';

function MainLayout() {
  const { currentRole, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Strict Tab access redirects upon Role switches
  useEffect(() => {
    if (currentUser?.role === 'Admin') {
      // Admin has absolute privilege to view any and all consoles/tabs all at once
      return;
    }
    if (currentRole === 'Patient') {
      if (activeTab !== 'patient-portal' && activeTab !== 'clinical-scheduler') {
        setActiveTab('patient-portal');
      }
    } else if (currentRole === 'Nurse') {
      if (!['dashboard', 'patients', 'clinical', 'inventory'].includes(activeTab)) {
        setActiveTab('dashboard');
      }
    } else {
      // Default fallback
      if (!['dashboard', 'patients', 'clinical', 'inventory', 'audits', 'config'].includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [currentRole, activeTab, currentUser]);

  // Dynamic component pick
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'patients':
        return <PatientManagement />;
      case 'patient-portal':
        return <PatientManagement forcePortalView={true} />;
      case 'clinical':
        return <ClinicalOperations />;
      case 'clinical-scheduler':
        return <ClinicalOperations defaultSubTab="appointments" />;
      case 'inventory':
        return <InventoryManagement />;
      case 'audits':
        return <AuditTrail />;
      case 'config':
        return <SystemConfiguration />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div id="main-layout-root" className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">
      {/* Clinician Top Bar */}
      <Header />

      {/* Main viewport */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Action Panel viewport */}
        <main id="app-viewport" className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + '-' + currentRole}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Persistent mini-footer status bar */}
      <footer className="h-6 shrink-0 bg-slate-100 border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center space-x-2">
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
          <span>Security Level: SHA-256 Signatures Active</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Facility Code: KE-MHK-02</span>
          <span>User: {currentUser.name} ({currentRole})</span>
        </div>
      </footer>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
