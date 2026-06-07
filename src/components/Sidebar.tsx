/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from './AppContext';
import { LayoutDashboard, Users, Syringe, ClipboardList, Database, ShieldAlert, Sliders, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, currentUser } = useApp();

  // Navigation Items defined dynamically based on role access levels
  const getNavItems = () => {
    switch (currentRole) {
      case 'Admin':
        return [
          { id: 'dashboard', name: 'Dashboard Reports', icon: LayoutDashboard },
          { id: 'patients', name: 'Patient Directory', icon: Users },
          { id: 'clinical', name: 'Clinical Operations', icon: Syringe },
          { id: 'inventory', name: 'Vaccine Inventory', icon: Database },
          { id: 'audits', name: 'Audit Trail Logs', icon: ClipboardList },
          { id: 'config', name: 'System Settings', icon: Sliders },
        ];
      case 'Nurse':
        return [
          { id: 'dashboard', name: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'patients', name: 'Patient Registry', icon: Users },
          { id: 'clinical', name: 'Clinical Desk', icon: Syringe },
          { id: 'inventory', name: 'Check Inventory', icon: Database },
        ];
      case 'Patient':
        return [
          { id: 'patient-portal', name: 'My Patient Portal', icon: Users },
          { id: 'clinical-scheduler', name: 'Book Appointment', icon: Syringe },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const adminGroups = [
    {
      title: 'Admin Console',
      color: 'text-indigo-600 bg-indigo-50/40 border-indigo-100',
      items: [
        { id: 'dashboard', name: 'Dashboard Reports', icon: LayoutDashboard },
        { id: 'audits', name: 'Audit Trail Logs', icon: ClipboardList },
        { id: 'config', name: 'System Settings', icon: Sliders },
      ]
    },
    {
      title: 'Nurse Console',
      color: 'text-teal-700 bg-teal-50/40 border-teal-100',
      items: [
        { id: 'patients', name: 'Patient Directory', icon: Users },
        { id: 'clinical', name: 'Clinical Desk', icon: Syringe },
        { id: 'inventory', name: 'Vaccine Inventory', icon: Database },
      ]
    },
    {
      title: 'Patient Console',
      color: 'text-sky-700 bg-sky-50/40 border-sky-100',
      items: [
        { id: 'patient-portal', name: 'My Patient Portal', icon: Users },
        { id: 'clinical-scheduler', name: 'Book Appointment', icon: Syringe },
      ]
    }
  ];

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <aside id="app-sidebar" className="flex h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Access info sticker */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
            {isAdmin ? 'ALL CONSOLES ACTIVE' : `${currentRole} SESSION ACTIVE`}
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <nav id="sidebar-nav" className="flex-1 overflow-y-auto py-3 space-y-4">
        {isAdmin ? (
          adminGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className={`px-4 py-1 mx-2 rounded-md border text-[9px] font-extrabold uppercase tracking-wider ${group.color}`}>
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      id={`sidebar-tab-${item.id}`}
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex w-full items-center space-x-3 py-2 px-6 text-xs md:text-sm font-medium transition-all border-r-3 ${
                        isActive
                          ? 'bg-blue-50/70 text-blue-600 border-blue-600 font-bold'
                          : 'text-slate-600 border-transparent hover:bg-slate-50/50 hover:text-slate-950'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`sidebar-tab-${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center space-x-3 py-2.5 px-6 text-xs md:text-sm font-medium transition-all border-r-3 ${
                    isActive
                      ? 'bg-blue-50/70 text-blue-600 border-blue-600 font-bold'
                      : 'text-slate-500 border-transparent hover:bg-slate-50/60 hover:text-slate-905'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Helpful Quick Guide Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/40 text-[11px] text-slate-500">
        <p className="font-bold text-slate-600 text-[10px] uppercase tracking-wider mb-1">Quick Tip</p>
        <p className="leading-relaxed text-slate-500">
          {currentUser?.role === 'Admin' ? 'As Admin you have simultaneous full capability access to all consoles.' : (
            <>
              {currentRole === 'Nurse' && 'Submit an AEFI incident if patient has pain or high post-vaccine fever.'}
              {currentRole === 'Patient' && 'Generate your encrypted immunization pass in QR bar below.'}
            </>
          )}
        </p>
      </div>
    </aside>
  );
};
