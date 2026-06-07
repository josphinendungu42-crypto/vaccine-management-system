/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Sliders, CheckCircle, Save, BellRing, Database, Settings2, UserPlus, Users, Key, Eye, EyeOff, Lock, ShieldCheck, ShieldAlert, Check } from 'lucide-react';
import { UserRole, User } from '../types';

export const SystemConfiguration: React.FC = () => {
  const { settings, updateSettings, auditLogs, patients, stocks, allUsers, addUserAccount, changePassword, toggleUserActivation, currentUser } = useApp();
  const [success, setSuccess] = useState(false);

  // Form states copied from context
  const [clinicName, setClinicName] = useState(settings.clinicName);
  const [address, setAddress] = useState(settings.address);
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(settings.allowSelfRegistration);
  const [lowStockAlertEmail, setLowStockAlertEmail] = useState(settings.lowStockAlertEmail);
  const [enableSmsNotifications, setEnableSmsNotifications] = useState(settings.enableSmsNotifications);
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(settings.enableEmailNotifications);

  // Africa's Talking Credentials
  const [atUsername, setAtUsername] = useState(settings.atUsername || '');
  const [atApiKey, setAtApiKey] = useState(settings.atApiKey || '');
  const [atSenderId, setAtSenderId] = useState(settings.atSenderId || '');

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState(settings.smtpHost || '');
  const [smtpPort, setSmtpPort] = useState(settings.smtpPort || '587');
  const [smtpSecure, setSmtpSecure] = useState(settings.smtpSecure || false);
  const [smtpUser, setSmtpUser] = useState(settings.smtpUser || '');
  const [smtpPass, setSmtpPass] = useState(settings.smtpPass || '');
  const [smtpFromEmail, setSmtpFromEmail] = useState(settings.smtpFromEmail || 'noreply@clinichub.org');

  // New User Account form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Nurse');
  const [newUserQuestion, setNewUserQuestion] = useState('What is your clinical specialty?');
  const [newUserAnswer, setNewUserAnswer] = useState('');
  const [linkedPatientId, setLinkedPatientId] = useState('');
  const [userCreatedMessage, setUserCreatedMessage] = useState<string | null>(null);
  const [userErrorMessage, setUserErrorMessage] = useState<string | null>(null);

  // Admin password override state
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [overridingUserId, setOverridingUserId] = useState<string | null>(null);
  const [overridePassword, setOverridePassword] = useState('');
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null);

  if (currentUser?.role !== 'Admin') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-xl mx-auto my-8 font-sans">
        <ShieldAlert className="h-10 w-10 text-red-650 mx-auto mb-3 animate-bounce" />
        <h3 className="text-sm font-bold text-red-950">Privileged Administration Access Violation</h3>
        <p className="text-xs text-red-700 mt-1 leading-normal">
          Security protocols dictate restricted duty segregation. Your account ({currentUser?.name || 'Unknown Operator'}, role: {currentUser?.role}) has insufficient privileges to access facility-wide variables or credential overrides.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    updateSettings({
      clinicName,
      address,
      allowSelfRegistration,
      lowStockAlertEmail,
      enableSmsNotifications,
      enableEmailNotifications,
      atUsername,
      atApiKey,
      atSenderId,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      smtpFromEmail
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3050);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserCreatedMessage(null);
    setUserErrorMessage(null);

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserUsername.trim() || !newUserPassword.trim() || !newUserAnswer.trim()) {
      setUserErrorMessage('All credentials fields including security questions must be filled.');
      return;
    }

    const payload = {
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      username: newUserUsername.trim().toLowerCase(),
      password: newUserPassword.trim(),
      securityQuestion: newUserQuestion,
      securityAnswer: newUserAnswer.trim().toLowerCase(),
      patientId: newUserRole === 'Patient' ? (linkedPatientId || undefined) : undefined
    };

    const result = addUserAccount(payload);
    if (result.success) {
      setUserCreatedMessage(`Successfully instantiated security account for: ${payload.name}`);
      // clear fields
      setNewUserName('');
      setNewUserEmail('');
      setNewUserUsername('');
      setNewUserPassword('');
      setNewUserAnswer('');
      setLinkedPatientId('');
    } else if (result.error) {
      setUserErrorMessage(result.error);
    }
  };

  const handleAdminResetPassword = (user: User) => {
    if (!overridePassword.trim()) {
      alert("Please provide a new non-empty password.");
      return;
    }

    // Since Admin is superuser, bypass current password checks inside context by triggering a targeted password change.
    // Or we reset via simulated superuser action. Let's use clean function flow.
    // Admin directly overrides security parameters.
    const result = changePassword(user.id, user.password || 'password', overridePassword);
    if (result.success) {
      setOverrideSuccess(`Successfully synchronized override password for ${user.name}`);
      setOverridePassword('');
      setOverridingUserId(null);
      setTimeout(() => setOverrideSuccess(null), 3000);
    } else {
      alert(result.error);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div id="system-configuration-workspace" className="space-y-6">
      {/* Configuration Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
          System Administration & Clinic Setup
        </h2>
        <p className="text-xs text-slate-500">
          Reconfigure administrative defaults, SMS triggers, notifications, and review system storage parameters.
        </p>
      </div>

      {success && (
        <div className="flex items-center space-x-2 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs font-medium text-emerald-850 animate-in fade-in duration-100">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Clinic settings successfully committed! Audit Log written.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Core Settings Form (Col Spans 2) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Settings2 className="h-5 w-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-950">Clinical Center Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">Facility Branding Name</label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800"
                placeholder="Vaccination Tracking System"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">Facility Physical Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800"
                placeholder="Section 4, near school"
              />
            </div>
          </div>

          {/* Boundaries switches */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-dashed pb-1">
              Patient Portal Self-Service Permissions
            </h4>
            <div className="flex items-start space-x-3">
              <input
                id="conf-allow-self-reg"
                type="checkbox"
                checked={allowSelfRegistration}
                onChange={(e) => setAllowSelfRegistration(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mt-0.5"
              />
              <div>
                <label htmlFor="conf-allow-self-reg" className="text-xs font-semibold text-slate-800 block cursor-pointer">
                  Allow Self-Service Citizen Registration
                </label>
                <span className="text-[10.5px] text-slate-500 block mt-0.5 leading-normal">
                  When enabled, individuals can login and create new healthcare profiles directly without clinician intervention.
                </span>
              </div>
            </div>
          </div>

          {/* Notifications setup */}
          <div className="space-y-4">
            <div className="flex items-center space-x-1 border-b border-dashed pb-1">
              <BellRing className="h-4 w-4 text-slate-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Automated Calendar Dispatchers
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start space-x-3">
                <input
                  id="conf-sms"
                  type="checkbox"
                  checked={enableSmsNotifications}
                  onChange={(e) => setEnableSmsNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <label htmlFor="conf-sms" className="text-xs font-semibold text-slate-800 block cursor-pointer">
                    Enable SMS Reminders Queue
                  </label>
                  <span className="text-[10.5px] text-slate-400 block mt-0.5 leading-tight">
                    Dispatches scheduled messages for booster recommendations.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="conf-email"
                  type="checkbox"
                  checked={enableEmailNotifications}
                  onChange={(e) => setEnableEmailNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mt-0.5"
                />
                <div>
                  <label htmlFor="conf-email" className="text-xs font-semibold text-slate-800 block cursor-pointer">
                    Enable Email Reminders
                  </label>
                  <span className="text-[10.5px] text-slate-400 block mt-0.5 leading-tight">
                    Delivers PDF immunization passports automatically to emails.
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Low Stock Escalation Email
              </label>
              <input
                type="email"
                required
                value={lowStockAlertEmail}
                onChange={(e) => setLowStockAlertEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800"
                placeholder="pharmacy-alerts@clinic.org"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                The centralized server logs dispatch warnings to this address immediately if any vaccine inventory drops below its alert threshold.
              </span>
            </div>
          </div>

          {/* Real-world Broadcast Gateways Setup */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center space-x-1.5">
              <span>🌐</span>
              <span>Africa's Talking & SMTP Broadcast Gateway Credentials</span>
            </h4>
            <p className="text-[10.5px] text-slate-500 leading-normal">
              Enter your live service credentials below to enable physical transmission. When configured, real-time reminders and immunization passports are pushed immediately to patient phones and mailboxes. If left blank, notifications remain simulated.
            </p>

            {/* Africa's Talking Credentials Row */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-205 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs">📱</span>
                <span className="text-xs font-bold text-slate-800">Africa's Talking Configuration</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">AT Username</label>
                  <input
                    type="text"
                    value={atUsername}
                    onChange={(e) => setAtUsername(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                    placeholder="sandbox or your_at_username"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">AT API Key</label>
                  <input
                    type="password"
                    value={atApiKey}
                    onChange={(e) => setAtApiKey(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                    placeholder="••••••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">AT Sender ID (Optional)</label>
                  <input
                    type="text"
                    value={atSenderId}
                    onChange={(e) => setAtSenderId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                    placeholder="e.g. MyShortcode"
                  />
                </div>
              </div>
              <p className="text-[9.5px] text-slate-400 font-mono">
                💡 Tip: Set AT Username to <strong>sandbox</strong> for trial development testing with simulated devices.
              </p>
            </div>

            {/* SMTP Configuration Row */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-205 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs">✉️</span>
                <span className="text-xs font-bold text-slate-800">SMTP Email Relay Server</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                    placeholder="smtp.mail.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">SMTP Port</label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sender From-Email</label>
                  <input
                    type="email"
                    value={smtpFromEmail}
                    onChange={(e) => setSmtpFromEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                    placeholder="noreply@yourclinic.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">SMTP Username</label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                    placeholder="user@mail.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">SMTP Password</label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                    placeholder="••••••••••••"
                  />
                </div>
                <div className="flex items-center pt-4">
                  <input
                    id="conf-smtp-secure"
                    type="checkbox"
                    checked={smtpSecure}
                    onChange={(e) => setSmtpSecure(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="conf-smtp-secure" className="ml-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    Force SSL/TLS Secure
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center space-x-1.5 border border-transparent bg-teal-600 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition hover:bg-teal-700 shadow-xs cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Commit Configuration Settings</span>
          </button>
        </form>

        {/* System Diagnostics stats list sidebar */}
        <div className="space-y-4 h-fit">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5 mb-3">
              <Database className="h-4.5 w-4.5 text-slate-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                System Storage Diagnostics
              </h4>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Local DB Status:</span>
                <span className="font-bold text-emerald-600">Online (LocalStorage)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Demographic Records:</span>
                <span className="font-bold">{patients.length} Patient Profiles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Supply Formulas:</span>
                <span className="font-bold">{stocks.length} Vaccine Lines</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Audit Logs Count:</span>
                <span className="font-bold">{auditLogs.length} events logged</span>
              </div>
              
              <div className="pt-2 border-t text-[11px] text-slate-400 leading-snug">
                This client browser sandbox operates persistent schemas. Leaving the page does not wipe records unless the clear/purge button is clicked.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPONENT SECTION: User Accounts, Directory & Security Override */}
      <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 bg-blue-105 rounded-xl text-blue-700 flex items-center justify-center border border-blue-200 shadow-2xs">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Directory & Duty Segregation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure clinical credentials, link demographic roles, or perform security checks.</p>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 text-xs max-w-md">
            <p className="font-bold text-yellow-800 flex items-center space-x-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Strict Privileged Duty Segregation</span>
            </p>
            <p className="text-yellow-700 text-[10.5px] mt-0.5 leading-normal">
              Users with the <strong>Nurse</strong> role have read/write clinical records but cannot reset stocks or view security hashes. <strong>Patients</strong> can only view personal timelines.
            </p>
          </div>
        </div>

        <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create User Form - Left Col (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-2">
              <UserPlus className="h-4.5 w-4.5 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Secure Account</h4>
            </div>

            {userCreatedMessage && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-medium text-emerald-850 flex items-center space-x-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{userCreatedMessage}</span>
              </div>
            )}

            {userErrorMessage && (
              <div className="rounded-xl bg-rose-50 border border-rose-150 p-3 text-xs font-medium text-rose-850 flex items-center space-x-2.5">
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{userErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Display Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                    placeholder="e.g. Dr. Silas Mwangi"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                    placeholder="silas@mwihokoclinic.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username Handle</label>
                  <input
                    type="text"
                    required
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-1000 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                    placeholder="e.g. silas12"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Set Initial Password</label>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                    placeholder="••••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Duty Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => {
                      setNewUserRole(e.target.value as UserRole);
                      if (e.target.value !== 'Patient') setLinkedPatientId('');
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                  >
                    <option value="Nurse">Nurse (Clinical Staff)</option>
                    <option value="Admin">Admin (Superuser)</option>
                    <option value="Patient">Patient (Self-Service)</option>
                  </select>
                </div>

                {newUserRole === 'Patient' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Link Demographic Co-Id</label>
                    <select
                      value={linkedPatientId}
                      onChange={(e) => setLinkedPatientId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                    >
                      <option value="">-- No Link / Create Virtual --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Link Demographic Co-Id</label>
                    <input
                      disabled
                      className="mt-1 w-full rounded-lg border border-slate-100 px-3 py-1.5 text-xs text-slate-400 bg-slate-100 cursor-not-allowed"
                      placeholder="Not applicable to staff"
                    />
                  </div>
                )}
              </div>

              {/* Challenge question setup */}
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/30 space-y-2.5">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Forgotten Password Recovery Configuration</span>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Recovery Secret Question</label>
                  <select
                    value={newUserQuestion}
                    onChange={(e) => setNewUserQuestion(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 bg-white text-xs text-slate-700"
                  >
                    <option value="What is your clinical specialty?">What is your clinical specialty?</option>
                    <option value="What is the name of this clinic facility?">What is the name of this clinic facility?</option>
                    <option value="What is your home town?">What is your home town?</option>
                    <option value="What was the color of your first bike?">What was the color of your first bike?</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Security Answer (Strictly Private)</label>
                  <input
                    type="text"
                    required
                    value={newUserAnswer}
                    onChange={(e) => setNewUserAnswer(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800 bg-white"
                    placeholder="Case-insensitive recovery key"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-xs font-semibold select-none cursor-pointer mt-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Instantiate Security Account</span>
              </button>
            </form>
          </div>

          {/* Roster & Override Table - Right Col (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-2">
              <Users className="h-4.5 w-4.5 text-teal-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Active Credentials Directory</h4>
            </div>

            {overrideSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-xs text-emerald-800 font-medium">
                {overrideSuccess}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-150 bg-slate-50/20 overflow-hidden">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200 text-[11px]">
                    <th className="px-3.5 py-2.5">Clinic User</th>
                    <th className="px-3.5 py-2.5">Account Role</th>
                    <th className="px-3.5 py-2.5">Login Handles</th>
                    <th className="px-3.5 py-2.5">Security Password</th>
                    <th className="px-3.5 py-2.5">Access Status</th>
                    <th className="px-3.5 py-2.5 text-right font-sans">Reset Lock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 bg-white text-[11px] text-slate-700">
                  {allUsers.map((u) => {
                    const isMasked = !showPasswords[u.id];
                    const questionStr = u.securityQuestion || "None set";
                    const isOverriding = overridingUserId === u.id;
                    const isActive = u.isActive !== false;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="px-3.5 py-2.5">
                          <div className={`font-semibold ${isActive ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                            u.role === 'Admin' ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                            u.role === 'Nurse' ? 'bg-teal-50 text-teal-800 border border-teal-100' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-[10.5px]">
                          <div>usr: <span className="text-slate-905 font-bold">{u.username || 'N/A'}</span></div>
                          <div className="text-[9px] text-slate-400 capitalize" title={`Answer: ${u.id === currentUser.id ? (u.securityAnswer || 'N/A') : '[Private]'}`}>Q: {questionStr.substring(0, 15)}...</div>
                        </td>
                        <td className="px-3.5 py-2.5 font-mono">
                          {u.id === currentUser.id ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-800 font-semibold">
                                {isMasked ? '••••••••' : (u.password || 'password')}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(u.id)}
                                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                title="Toggle password view"
                              >
                                {isMasked ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-slate-500 select-none bg-slate-50 border border-slate-100/70 px-1.5 py-0.5 rounded max-w-fit" title="Password strictly private">
                              <Lock className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                              <span className="text-[10px] font-sans font-medium text-slate-500">Private</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              if (u.id === currentUser.id) {
                                alert("Security constraint: You cannot deactivate your own active session!");
                                return;
                              }
                              toggleUserActivation(u.id);
                            }}
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold select-none cursor-pointer transition-all ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/80 shadow-2xs'
                                : 'bg-slate-105 text-slate-500 border border-slate-205 hover:bg-slate-200 line-through'
                            }`}
                            title={isActive ? "Deactivate operator" : "Activate operator"}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            <span>{isActive ? 'ACTIVE' : 'SUSPENDED'}</span>
                          </button>
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-sans">
                          {isOverriding ? (
                            <div className="flex flex-col space-y-1 items-end min-w-[120px]">
                              <input
                                type="text"
                                value={overridePassword}
                                onChange={(e) => setOverridePassword(e.target.value)}
                                className="border rounded px-1.5 py-0.5 text-[10px] text-slate-800 w-24 font-mono focus:outline-none"
                                placeholder="New password"
                                autoFocus
                              />
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleAdminResetPassword(u)}
                                  className="bg-emerald-600 text-white rounded px-1.5 py-0.5 text-[9px] font-bold hover:bg-emerald-700 cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => { setOverridingUserId(null); setOverridePassword(''); }}
                                  className="bg-slate-200 text-slate-700 rounded px-1.5 py-0.5 text-[9px] font-bold hover:bg-slate-300 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setOverridingUserId(u.id);
                                setOverridePassword('');
                              }}
                              className="inline-flex items-center space-x-1 border border-slate-200 rounded px-2 py-1 text-[10px] font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50/50 cursor-pointer transition select-none"
                            >
                              <Key className="h-2.5 w-2.5" />
                              <span>Override</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
