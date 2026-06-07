/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Calendar, Syringe, ShieldAlert, CheckCircle, Plus, AlertCircle, Clock, Check, RefreshCw } from 'lucide-react';
import { Appointment, AdministeredVaccine } from '../types';

export const ClinicalOperations: React.FC<{ defaultSubTab?: 'administer' | 'appointments' | 'aefi' }> = ({ defaultSubTab }) => {
  const { 
    patients, 
    stocks, 
    appointments, 
    addAppointment, 
    updateAppointmentStatus, 
    administerVaccine, 
    reportAEFI, 
    aefiReports, 
    administrations,
    currentUser,
    appendLog
  } = useApp();

  // Selected workspace sub-tab
  const [subTab, setSubTab] = useState<'administer' | 'appointments' | 'aefi'>(defaultSubTab || 'administer');

  useEffect(() => {
    if (defaultSubTab) {
      setSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);

  // Notification success / error messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Administration Form State
  const [adminPatientId, setAdminPatientId] = useState('');
  const [adminVaccineType, setAdminVaccineType] = useState('');
  const [adminDoseNumber, setAdminDoseNumber] = useState('1st Dose');
  const [adminSite, setAdminSite] = useState('Left Deltoid');
  const [adminNotes, setAdminNotes] = useState('');

  // 2. Appointment Form State
  const [isBooking, setIsBooking] = useState(false);
  const [aptPatientId, setAptPatientId] = useState('');
  const [aptVaccineType, setAptVaccineType] = useState('');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('09:00');
  const [aptNotes, setAptNotes] = useState('');

  // 3. AEFI Form State
  const [aefiPatientId, setAefiPatientId] = useState('');
  const [aefiVaccineId, setAefiVaccineId] = useState('');
  const [aefiSeverity, setAefiSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [aefiSymptoms, setAefiSymptoms] = useState('');
  const [aefiActions, setAefiActions] = useState('');

  // Quick select vaccine changes corresponding manufacturers and batches matching inventory
  const selectedVaccineStock = stocks.find(s => s.name === adminVaccineType);

  const handleAdministerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!adminPatientId || !adminVaccineType) {
      setErrorMsg('Please select both a Patient and a Vaccine.');
      return;
    }

    const patient = patients.find(p => p.id === adminPatientId);
    if (!patient) {
      setErrorMsg('Patient profile not found.');
      return;
    }

    const targetStock = stocks.find(s => s.name === adminVaccineType);
    if (!targetStock) {
      setErrorMsg('Vaccine configuration missing in inventory catalog.');
      return;
    }

    // Attempt administration mutation
    const result = administerVaccine({
      patientId: adminPatientId,
      patientName: patient.name,
      vaccineType: adminVaccineType,
      doseNumber: adminDoseNumber,
      batchNumber: targetStock.batchNumber,
      manufacturer: targetStock.manufacturer,
      siteOfInjection: adminSite,
      notes: adminNotes
    });

    if (result.success) {
      setSuccessMsg(`Dose of ${adminVaccineType} successfully administered to ${patient.name}! Stock updated.`);
      // Reset administer inputs
      setAdminPatientId('');
      setAdminVaccineType('');
      setAdminNotes('');
    } else {
      setErrorMsg(result.error || 'Server rejected vaccine administration.');
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!aptPatientId || !aptVaccineType || !aptDate || !aptTime) {
      setErrorMsg('Please satisfy all required scheduler values.');
      return;
    }

    const patient = patients.find(p => p.id === aptPatientId);
    if (!patient) {
      setErrorMsg('Invalid patient reference.');
      return;
    }

    addAppointment({
      patientId: aptPatientId,
      patientName: patient.name,
      vaccineType: aptVaccineType,
      scheduledDate: aptDate,
      scheduledTime: aptTime,
      notes: aptNotes
    });

    setSuccessMsg(`Appointment booked for ${patient.name} on ${aptDate} at ${aptTime}`);
    setIsBooking(false);
    setAptPatientId('');
    setAptVaccineType('');
    setAptNotes('');
  };

  const handleAefiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!aefiPatientId || !aefiSymptoms) {
      setErrorMsg('Patient classification and symptoms description required.');
      return;
    }

    const patient = patients.find(p => p.id === aefiPatientId);
    if (!patient) return;

    // Use reported vaccine parameter or mock placeholder based on past doses
    const matchedDoses = administrations.filter(a => a.patientId === aefiPatientId);
    const vaccineType = matchedDoses[0]?.vaccineType || 'Unknown Vaccine Formulation';
    const originalAdmId = matchedDoses[0]?.id || 'adm-fallback';

    reportAEFI({
      administeredVaccineId: originalAdmId,
      patientId: aefiPatientId,
      patientName: patient.name,
      vaccineType,
      symptomSeverity: aefiSeverity,
      onsetTimestamp: new Date().toISOString(),
      symptoms: aefiSymptoms,
      actionsTaken: aefiActions
    });

    setSuccessMsg(`AEFI Incident record logged for ${patient.name}. Safety officer alerted.`);
    setAefiPatientId('');
    setAefiSymptoms('');
    setAefiActions('');
  };

  return (
    <div id="clinical-operations-view" className="space-y-6">
      <div className="flex flex-col justify-between space-y-3 md:flex-row md:items-center md:space-y-0">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
            Clinical Operations Workspace
          </h2>
          <p className="text-xs text-slate-500">
            Book patient appointments, record vaccinations, and monitor post-immunization safety indicators.
          </p>
        </div>

        {/* Workspace tabs switcher */}
        <div className="flex space-x-1 rounded-lg bg-slate-100 p-1">
          <button
            id="subtab-administer"
            onClick={() => { setSubTab('administer'); setSuccessMsg(''); setErrorMsg(''); }}
            className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              subTab === 'administer'
                ? 'bg-white text-teal-800 shadow-3xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Syringe className="h-3.5 w-3.5" />
            <span>Administer Dose</span>
          </button>
          <button
            id="subtab-appointments"
            onClick={() => { setSubTab('appointments'); setSuccessMsg(''); setErrorMsg(''); }}
            className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              subTab === 'appointments'
                ? 'bg-white text-teal-800 shadow-3xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Appointments Desk</span>
          </button>
          <button
            id="subtab-aefi"
            onClick={() => { setSubTab('aefi'); setSuccessMsg(''); setErrorMsg(''); }}
            className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              subTab === 'aefi'
                ? 'bg-white text-teal-800 shadow-3xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Report AEFI</span>
          </button>
        </div>
      </div>

      {/* Global Clinical Status Banners */}
      {successMsg && (
        <div className="flex items-center space-x-2 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs font-medium text-emerald-800 animate-in fade-in duration-100">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 border border-red-100 p-3 text-xs font-medium text-red-800 animate-in fade-in duration-100">
          <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* WORKSPACE 1: Vaccination Administration */}
      {subTab === 'administer' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Action form */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-950 mb-4 border-b border-slate-100 pb-3">
              Log Active Vaccine Dosing Event
            </h3>

            <form onSubmit={handleAdministerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Select Patient *
                  </label>
                  <select
                    id="admin-patient-select"
                    value={adminPatientId}
                    onChange={(e) => setAdminPatientId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 bg-white text-slate-700 font-medium"
                  >
                    <option value="">-- Choose Patient Demographics Roll --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Contact: {p.contactNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Vaccine Formulation *
                  </label>
                  <select
                    id="admin-vaccine-select"
                    value={adminVaccineType}
                    onChange={(e) => setAdminVaccineType(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 bg-white text-slate-700 font-medium"
                  >
                    <option value="">-- Choose Vaccine Category From Inventory --</option>
                    {stocks.map(s => (
                      <option key={s.id} value={s.name} disabled={s.dosesAvailable === 0}>
                        {s.name} ({s.manufacturer}) - Stock available: {s.dosesAvailable} {s.dosesAvailable === 0 ? '[OUT OF STOCK]' : 'doses'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic stock feedback sidebar inside form */}
              {selectedVaccineStock && (
                <div className="rounded-lg bg-teal-50/50 border border-teal-100 p-3 text-xs grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Manufacturer:</span>
                    <strong className="text-slate-800">{selectedVaccineStock.manufacturer}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Batch Assigned:</span>
                    <code className="text-slate-800 font-bold font-mono">{selectedVaccineStock.batchNumber}</code>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Expiry Limit:</span>
                    <strong className="text-slate-800">{selectedVaccineStock.expiryDate}</strong>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Dose Sequence
                  </label>
                  <select
                    value={adminDoseNumber}
                    onChange={(e) => setAdminDoseNumber(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 bg-white text-slate-700"
                  >
                    <option>1st Dose</option>
                    <option>2nd Dose</option>
                    <option>Booster</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Anatomical Site of Injection
                  </label>
                  <select
                    value={adminSite}
                    onChange={(e) => setAdminSite(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 bg-white text-slate-700"
                  >
                    <option>Left Deltoid</option>
                    <option>Right Deltoid</option>
                    <option>Left Thigh</option>
                    <option>Right Thigh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Post-Administration Remarks / Clinician Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 text-slate-800"
                  placeholder="Injected successfully, patient handled and vital observations normal."
                />
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-500">
                <span>Authorized clinician: <strong>{currentUser.name} ({currentUser.role})</strong></span>
                <span>System date auto-logged: {new Date().toISOString().split('T')[0]}</span>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center space-x-1.5 border border-transparent bg-teal-600 px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:bg-teal-700 shadow-xs cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Confirm Administration & Update Stock ledger</span>
              </button>
            </form>
          </div>

          {/* Quick Stats sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b pb-2">
                Doses Verified This Session
              </h4>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {administrations.length > 0 ? (
                  administrations.map((adm) => (
                    <div key={adm.id} className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
                      <div className="flex justify-between items-start">
                        <strong className="text-slate-800">{adm.patientName}</strong>
                        <span className="text-[10px] text-teal-700 font-bold bg-teal-100 px-1.5 py-0.2 rounded">Given</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">{adm.vaccineType} - {adm.doseNumber}</p>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                        <span>Batch: {adm.batchNumber}</span>
                        <span>{adm.dateAdministered}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4 italic">
                    No immunisation reports completed in this browser session.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE 2: Appointment Scheduling & Calendar */}
      {subTab === 'appointments' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-999">Appointments & Scheduled Immunization Ledger</h3>
              <p className="text-xs text-slate-400">Track user schedules, reschedule missed visits, or map upcoming dosage appointments.</p>
            </div>
            
            <button
              id="btn-trigger-appointment-modal"
              onClick={() => setIsBooking(!isBooking)}
              className="mt-2 sm:mt-0 inline-flex items-center space-x-1 border border-transparent bg-indigo-600 px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Appointment</span>
            </button>
          </div>

          {/* Scheduling form inside collapsible drawer */}
          {isBooking && (
            <div className="rounded-xl border border-indigo-150 bg-indigo-50/20 p-4 space-y-4 animate-in slide-in-from-top duration-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Configure Scheduled Session</h4>
              <form onSubmit={handleBookAppointment} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Select Patient *</label>
                  <select
                    required
                    value={aptPatientId}
                    onChange={(e) => setAptPatientId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white text-slate-700"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Vaccine Class Formulation *</label>
                  <select
                    required
                    value={aptVaccineType}
                    onChange={(e) => setAptVaccineType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white text-slate-700"
                  >
                    <option value="">-- Choose Variant --</option>
                    {stocks.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.manufacturer})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Date *</label>
                    <input
                      required
                      type="date"
                      value={aptDate}
                      onChange={(e) => setAptDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Time *</label>
                    <input
                      required
                      type="time"
                      value={aptTime}
                      onChange={(e) => setAptTime(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="text-[11px] font-semibold text-slate-600">Scheduler Context / Notes</label>
                  <input
                    type="text"
                    value={aptNotes}
                    onChange={(e) => setAptNotes(e.target.value)}
                    placeholder="Dosing tracking notes, follow ups context."
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-850"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsBooking(false)}
                    className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-250 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-indigo-600 px-4 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                  >
                    Save Slot & Dispatch Simulated Reminders
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Scheduled appointments */}
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold">
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Scheduled Formulation</th>
                  <th className="px-4 py-3">Session Date & Hour</th>
                  <th className="px-4 py-3">Dose State</th>
                  <th className="px-4 py-3 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800">{apt.patientName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {apt.patientId}</span>
                    </td>
                    <td className="px-4 py-3.5 font-medium">{apt.vaccineType}</td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{apt.scheduledDate} at {apt.scheduledTime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10.5px] font-bold ${
                        apt.status === 'Scheduled' ? 'bg-indigo-50 text-indigo-800' :
                        apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-800' :
                        apt.status === 'Missed' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-50 text-red-800'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      {apt.status === 'Scheduled' && (
                        <div className="inline-flex space-x-1">
                          <button
                            id={`apt-complete-${apt.id}`}
                            onClick={() => {
                              // Auto admin trigger mockup setup
                              setSubTab('administer');
                              setAdminPatientId(apt.patientId);
                              setAdminVaccineType(apt.vaccineType);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded px-2.5 py-1 transition"
                          >
                            Administer
                          </button>
                          <button
                            id={`apt-miss-${apt.id}`}
                            onClick={() => updateAppointmentStatus(apt.id, 'Missed')}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] rounded px-2.5 py-1 transition font-medium"
                          >
                            Mark Missed
                          </button>
                          <button
                            id={`apt-cancel-${apt.id}`}
                            onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-[11px] rounded px-2.5 py-1 transition font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {apt.status !== 'Scheduled' && (
                        <span className="text-slate-400 italic text-[11px]">Workflow Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WORKSPACE 3: Adversity Reporting (AEFI) */}
      {subTab === 'aefi' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Reporter form */}
          <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 h-fit">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
              Log Adverse Clinical Event
            </h3>

            <p className="text-[11.5px] text-slate-500 leading-normal">
              An AEFI is any untoward medical occurrence which follows immunization and which does not necessarily have a causal relationship.
            </p>

            <form onSubmit={handleAefiSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Select Patient *
                </label>
                <select
                  required
                  value={aefiPatientId}
                  onChange={(e) => setAefiPatientId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-700"
                >
                  <option value="">-- Choose Patient Demographics --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Symptom Severity Metric
                </label>
                <div className="mt-1.5 flex rounded-md overflow-hidden border border-slate-200">
                  {(['Mild', 'Moderate', 'Severe'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setAefiSeverity(sev)}
                      className={`flex-1 text-center py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        aefiSeverity === sev
                          ? sev === 'Mild' ? 'bg-orange-50 text-orange-700' :
                            sev === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-600 text-white font-bold'
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Symptoms Exhibited *
                </label>
                <textarea
                  required
                  value={aefiSymptoms}
                  onChange={(e) => setAefiSymptoms(e.target.value)}
                  rows={2}
                  placeholder="e.g.: Severe pain, fever of 39.5°C, redness, stiffness in joints."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Emergency Medical Actions Taken
                </label>
                <textarea
                  value={aefiActions}
                  onChange={(e) => setAefiActions(e.target.value)}
                  rows={2}
                  placeholder="e.g.: Administered hydrocortisone injection. Scheduled follow up checks."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white hover:text-white font-semibold text-xs rounded-lg py-2 cursor-pointer shadow-sm transition"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Submit Clinical Safety Event</span>
              </button>
            </form>
          </div>

          {/* AEFI logs list */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
              National Active Safety Surveillance Registry ({aefiReports.length})
            </h3>

            {aefiReports.length > 0 ? (
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                {aefiReports.map((report) => (
                  <div 
                    key={report.id} 
                    className={`rounded-xl border p-4 transition ${
                      report.symptomSeverity === 'Mild' ? 'border-indigo-100 bg-teal-50/10' :
                      report.symptomSeverity === 'Moderate' ? 'border-amber-100 bg-amber-50/10' :
                      'border-red-200 bg-red-50/5'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-slate-900 text-sm">{report.patientName}</strong>
                        <p className="text-[11px] text-slate-500 font-medium">Vaccine Class: {report.vaccineType}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        report.symptomSeverity === 'Mild' ? 'bg-indigo-100 text-indigo-800' :
                        report.symptomSeverity === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-600 text-white'
                      }`}>
                        {report.symptomSeverity} Severity
                      </span>
                    </div>

                    <div className="mt-3.5 space-y-2 text-xs text-slate-700 border-t border-slate-100/60 pt-2">
                      <div>
                        <strong>Symptoms Logged:</strong>
                        <p className="text-slate-600 mt-1 leading-relaxed">{report.symptoms}</p>
                      </div>
                      {report.actionsTaken && (
                        <div>
                          <strong>Clinical Responses:</strong>
                          <p className="text-slate-600 mt-1 leading-relaxed bg-white p-2 rounded border border-slate-100 italic">
                            {report.actionsTaken}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col md:flex-row justify-between text-[10px] text-slate-400 border-t border-slate-50 pt-2">
                      <span>Report Officer: {report.reportedBy}</span>
                      <span>Recorded on: {new Date(report.reportedAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed text-slate-500 italic text-xs">
                Perfect immunization safety logs. No clinical reactions reported yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
