/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Shield, Bell, HardDrive, RefreshCw, LogIn, AlertTriangle, CheckCircle, Mail, MessageSquare } from 'lucide-react';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const { currentRole, currentUser, switchRole, settings, stocks, appointments, notifications, logout } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Derive metrics
  const lowStockCount = stocks.filter(s => s.dosesAvailable <= s.lowStockThreshold).length;
  const scheduledTodayCount = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.scheduledDate === today && a.status === 'Scheduled';
  }).length;

  return (
    <header id="app-header" className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-xs">
      {/* Brand Section */}
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-100">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-slate-900 md:text-base">
            {settings.clinicName || "Vaccination Management Hub"}
          </h1>
          <p className="hidden text-xs text-slate-400 md:block font-medium">
            Clinical Operations & Inventory Monitor
          </p>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-4">
        {/* Urgent warnings */}
        {lowStockCount > 0 && (
          <div className="hidden items-center space-x-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 md:flex animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>{lowStockCount} Low Stocks!</span>
          </div>
        )}

        {/* Role Quick Switcher / Status Indicator */}
        {currentUser?.role === 'Admin' ? (
          <div className="relative">
            <button
              id="role-switcher-btn"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 transition hover:bg-blue-100"
            >
              <Shield className="h-3.5 w-3.5 text-blue-650 animate-pulse" />
              <span>Admin Role Override: <strong className="text-blue-850">{currentRole}</strong></span>
              <span className="text-[10px] text-blue-400">▼</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-slate-200/50">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400">
                  Switch Identity & Permissions
                </div>
                <div className="h-px bg-slate-100 my-1"></div>
                {(['Admin', 'Nurse', 'Patient'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setShowRoleMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition select-none cursor-pointer ${
                      currentRole === role
                        ? 'bg-blue-50 text-blue-800 font-bold'
                        : 'text-slate-705 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{role} Console</span>
                      <span className="text-[10px] text-slate-400">
                        {role === 'Admin' && 'Superuser overrides'}
                        {role === 'Nurse' && 'Records & immunizations'}
                        {role === 'Patient' && 'Self-service portal'}
                      </span>
                    </div>
                    {currentRole === role && <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Authorized Duty Role Display Badge - Read-Only for non-Admins */
          <div className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-800 select-none">
            <Shield className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
            <span>Role: <span className="text-blue-900 font-extrabold uppercase tracking-wide">{currentRole}</span></span>
          </div>
        )}

        {/* Live Notification Indicator */}
        <div className="relative">
          <button
            id="notification-hub-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <Bell className="h-4.5 w-4.5" />
            {(notifications.length > 0 || lowStockCount > 0) && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-slate-100 bg-white p-4 shadow-xl ring-1 ring-slate-200/50 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-semibold text-slate-800">
                  E-Health Communication Outbox
                </h3>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                  Transmitter Live
                </span>
              </div>
              
              <div className="mt-3 space-y-3 max-h-72 overflow-y-auto">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Recent Automations Sent (SMS & Mail)
                </p>
                {notifications.map((notif) => (
                  <div key={notif.id} className="rounded-lg border border-slate-50 bg-slate-50/50 p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1 font-semibold text-slate-700">
                        {notif.type === 'SMS' ? (
                          <MessageSquare className="h-3 w-3 text-emerald-500" />
                        ) : notif.type === 'Email' ? (
                          <Mail className="h-3 w-3 text-blue-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        )}
                        <span>{notif.type} to: {notif.recipient}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="mt-1 font-mono text-[10.5px] text-slate-600 bg-white p-1 rounded-sm border border-slate-100">
                      {notif.message}
                    </p>
                    <div className={`mt-1 flex items-center justify-end space-x-1 text-[10px] font-bold ${
                      notif.status.includes('Failed')
                        ? 'text-red-600'
                        : notif.status.includes('Initiating')
                          ? 'text-indigo-600 animate-pulse'
                          : 'text-emerald-600'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full inline-block ${
                        notif.status.includes('Failed')
                          ? 'bg-red-500'
                          : notif.status.includes('Initiating')
                            ? 'bg-indigo-500 animate-pulse'
                            : 'bg-emerald-500'
                      }`}></span>
                      <span>{notif.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 border-t border-slate-100 pt-2 flex justify-between items-center text-[10px] text-slate-500">
                <span>Active alerts: {lowStockCount} inventory items</span>
                <span className="text-blue-600 cursor-pointer hover:underline">Schedules Status: Active</span>
              </div>
            </div>
          )}
        </div>

        {/* User Identity widget */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-500 leading-none">
              {currentUser.email}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-800 font-bold text-xs select-none uppercase">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          <button
            onClick={logout}
            className="flex h-8 items-center space-x-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-rose-600 cursor-pointer"
            title="Log out of clinical session"
          >
            <LogIn className="h-3.5 w-3.5 text-slate-400 hover:text-rose-500 rotate-180" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
