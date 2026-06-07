/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Patient, AdministeredVaccine } from '../types';
import { Users, Search, Plus, Calendar, Mail, Phone, MapPin, UserCheck, ShieldAlert, Award, FileSpreadsheet, Send, MessageSquare, Smartphone, Wifi, Battery, Inbox, Info, HelpCircle, X } from 'lucide-react';

interface PatientDeviceSimulatorProps {
  patient: any;
  onClose?: () => void;
}

export const PatientDeviceSimulator: React.FC<PatientDeviceSimulatorProps> = ({ patient, onClose }) => {
  const { notifications, settings } = useApp();
  const [activeDeviceTab, setActiveDeviceTab] = useState<'sms' | 'email'>('sms');
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);

  // Filter messages specifically for this patient
  const mySmsList = notifications.filter(n => 
    n.type === 'SMS' && 
    (n.recipient.toLowerCase().includes(patient.name.toLowerCase()) || 
     n.recipient.includes(patient.contactNumber))
  );

  const myEmailList = notifications.filter(n => 
    n.type === 'Email' && 
    (n.recipient.toLowerCase().includes(patient.name.toLowerCase()) || 
     n.recipient.toLowerCase().includes(patient.email.toLowerCase()))
  );

  return (
    <div className="bg-slate-55 rounded-2xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto w-full">
      {/* Informational Header explaining Sandbox status */}
      <div className="rounded-xl border border-indigo-150 bg-indigo-50/40 p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Info className="mt-0.5 h-4.5 w-4.5 text-indigo-600 shrink-0" />
          <div className="text-xs text-left">
            <h4 className="font-extrabold text-indigo-950 mb-1 leading-normal">
              🌐 Real-time Africa's Talking & SMTP Email Broadcast Gateway
            </h4>
            <p className="text-indigo-800 leading-normal mb-2.5">
              This clinic is equipped with live <strong>Africa's Talking</strong> SMS routing and <strong>SMTP Email</strong> transmission. When credentials (API keys & Host addresses) are configured in the system's environment secrets, real alerts are immediately dispatched to your physical phone and official mailbox! If not configured, messages are saved in this simulated sandbox viewer.
            </p>
            <div className="flex flex-wrap gap-2 text-[10.5px] font-bold text-indigo-950">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-100 border border-indigo-200">
                👤 Patient: {patient.name}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-100 border border-indigo-200">
                📱 Contact Tel: {patient.contactNumber}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-100 border border-indigo-200">
                ✉️ Email Address: {patient.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveDeviceTab('sms')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeDeviceTab === 'sms'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>📱 SmartPhone SMS ({mySmsList.length})</span>
          </button>
          <button
            onClick={() => setActiveDeviceTab('email')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeDeviceTab === 'email'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>💻 WebMail Inbox ({myEmailList.length})</span>
          </button>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-sans font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer border border-slate-200 hover:border-slate-300"
          >
            <X className="h-3.5 w-3.5" />
            <span>Exit Sandbox</span>
          </button>
        )}
      </div>

      {/* Content Rendering based on Device Tab */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 min-h-[350px] flex items-center justify-center">
        {activeDeviceTab === 'sms' ? (
          /* Phone Mockup Screen */
          <div className="mx-auto w-full max-w-[285px] rounded-[36px] bg-slate-900 p-3 shadow-xl ring-8 ring-slate-800">
            <div className="relative aspect-[9/18] w-full overflow-hidden rounded-[28px] bg-slate-950 text-slate-100 flex flex-col justify-between">
              {/* Status Bar */}
              <div className="flex h-6 items-center justify-between px-4 text-[9px] font-sans text-slate-300">
                <span className="font-bold">09:41</span>
                {/* Speaker or Dynamic Island */}
                <div className="h-2 w-12 rounded-full bg-slate-950 absolute top-1 left-24 transform -translate-x-1/2"></div>
                <div className="flex items-center space-x-1">
                  <Wifi className="h-2.5 w-2.5" />
                  <span className="text-[7.5px] font-bold">5G</span>
                  <Battery className="h-3 w-3 text-slate-300" />
                </div>
              </div>

              {/* Chat App Header */}
              <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 text-center">
                <p className="text-[10px] font-extrabold text-slate-100">Africa's Talking SMS</p>
                <p className="text-[7.5px] text-slate-400 font-mono">Gateway Active</p>
              </div>

              {/* SMS Bubble Logs Stream */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 text-left">
                {/* Default Welcome Message */}
                <div className="flex flex-col items-start max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-xs bg-slate-800 px-2.5 py-1.5 text-[9.5px] leading-normal text-slate-300 font-sans">
                    Secure clinical alerts initialized. Future immunization schedules and appointment bookings will be routed here.
                  </div>
                  <span className="text-[7.5px] text-slate-500 ml-1 mt-0.5">System Hub</span>
                </div>

                {mySmsList.length > 0 ? (
                  mySmsList.map((sms) => (
                    <div key={sms.id} className="flex flex-col items-start max-w-[85%] animate-in fade-in duration-100">
                      <div className="rounded-2xl rounded-tl-xs bg-teal-600 px-2.5 py-1.5 text-[9.5px] leading-normal text-slate-100 border border-teal-500/30 font-sans">
                        {sms.message}
                      </div>
                      <span className="text-[7px] text-teal-400 ml-1 mt-0.5 font-sans font-medium flex items-center space-x-1 uppercase tracking-wide">
                        <span>Delivered</span>
                        <span className="h-1 w-1 bg-teal-400 rounded-full"></span>
                        <span>{sms.time}</span>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-3 mt-4">
                    <MessageSquare className="h-5 w-5 text-slate-700 mb-1" />
                    <p className="text-[9px] text-slate-500 italic font-sans">No SMS received on simulated phone line.</p>
                    <p className="text-[8px] text-slate-600 mt-1 leading-normal font-sans">Triggered bookings instantly appear here for instant preview verification!</p>
                  </div>
                )}
              </div>

              {/* Messages Input Box */}
              <div className="bg-slate-900 border-t border-slate-800 p-1.5 flex items-center space-x-1.5">
                <div className="flex-1 rounded-full bg-slate-800/60 px-2.5 py-1 text-[8.5px] text-slate-500 text-left">
                  Type text message...
                </div>
                <div className="h-4.5 w-4.5 rounded-full bg-teal-600 flex items-center justify-center">
                  <Send className="h-2 w-2 text-white" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Mail Desktop Client */
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col md:flex-row h-[320px] w-full animate-in fade-in duration-200">
            {/* Mailbox Sidebar folders */}
            <div className="w-full md:w-36 bg-slate-50 border-r border-slate-150 p-2.5 flex md:flex-col justify-between md:justify-start gap-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-2 hidden md:block text-left">
                Inbox Hub
              </span>
              <button className="flex items-center space-x-1.5 w-full text-left px-2 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10.5px] font-bold cursor-pointer">
                <Inbox className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate text-[11px]">Inbox ({myEmailList.length})</span>
              </button>
              <div className="text-[9.5px] text-slate-450 px-2 py-1 hidden md:block leading-relaxed mt-auto border-t border-slate-150 pt-2 text-left">
                <span className="font-extrabold block text-slate-500">Virtual Host IP</span>
                10.154.22.9
              </div>
            </div>

            {/* Email list & Reader screen split */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-150">
              {/* Mini stream scroll */}
              <div className="w-full md:w-48 overflow-y-auto divide-y divide-slate-100 h-1/3 md:h-full">
                {myEmailList.length > 0 ? (
                  myEmailList.map((email) => (
                    <div 
                      key={email.id} 
                      onClick={() => setSelectedMailId(email.id)}
                      className={`p-2.5 cursor-pointer transition text-left ${
                        selectedMailId === email.id || (!selectedMailId && myEmailList[0]?.id === email.id)
                          ? 'bg-indigo-50/30 border-l-2 border-indigo-600' 
                          : 'hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-[9.5px] truncate max-w-[100px]">
                          {settings.clinicName || 'Clinic Manager'}
                        </span>
                        <span className="text-[8px] text-slate-400 font-mono">{email.time}</span>
                      </div>
                      <p className="text-[9.5px] font-bold text-slate-700 truncate mt-0.5">Vaccination Letter</p>
                      <p className="text-[8.5px] text-slate-450 line-clamp-1 truncate mt-0.5">{email.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-[10.5px] italic">
                    Inbox Empty
                  </div>
                )}
              </div>

              {/* Reader Window */}
              <div className="flex-1 bg-slate-50 p-4 overflow-y-auto flex flex-col h-2/3 md:h-full text-left">
                {(() => {
                  const activeMail = myEmailList.find(e => e.id === selectedMailId) || myEmailList[0];
                  if (!activeMail) {
                    return (
                      <div className="m-auto text-center py-8 text-slate-400 text-[10.5px] italic max-w-[180px]">
                        Inbox empty. Fill your scheduler to write e-mail confirmations.
                      </div>
                    );
                  }
                  return (
                    <div className="bg-white rounded-lg border border-slate-150 p-4 shadow-3xs text-[10.5px] leading-relaxed">
                      <div className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
                        <div>
                          <p className="font-extrabold text-slate-900 text-[11px]">{settings.clinicName || 'mwihoko Clinic'} Alert Gateway</p>
                          <p className="text-[9px] text-slate-400 font-mono">Recipient: {activeMail.recipient}</p>
                        </div>
                        <span className="text-[9.5px] font-extrabold bg-green-50 border border-green-200 text-green-800 px-2 py-0.5 rounded-full shrink-0">
                          ✓ SSL Confirmed
                        </span>
                      </div>
                      <div className="space-y-3 py-1 text-slate-700">
                        <div className="rounded-xl border border-indigo-50 bg-indigo-50/20 p-3.5 text-indigo-950 font-sans leading-normal">
                          {activeMail.message}
                        </div>
                        <div className="text-[9px] text-slate-400 leading-normal border-t border-dashed border-slate-150 pt-2 mt-4 space-y-0.5">
                          <p>🏥 <strong>Provider:</strong> {settings.clinicName || 'M-Uri Healthcare Center'}</p>
                          <p>📞 <strong>Hotline:</strong> {settings.clinicPhone || '+254 799 000000'}</p>
                          <p>📍 <strong>Primary Post:</strong> {settings.clinicAddress || 'Mawingo Road, Nairobi'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PatientManagement: React.FC<{ forcePortalView?: boolean }> = ({ forcePortalView }) => {
  const { patients, addPatient, updatePatient, currentRole, currentUser, administrations, appointments, notifications } = useApp();
  const [showDeviceSimForPatient, setShowDeviceSimForPatient] = useState<Patient | null>(null);

  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: 'Male',
    contactNumber: '',
    email: '',
    address: '',
    medicalHistory: '',
    isChild: false,
    guardianName: '',
    guardianContact: '',
    guardianRelation: 'Parent'
  });

  // Check if role is Patient -> Render Self-Service Portal
  if (currentRole === 'Patient' || forcePortalView) {
    // Locate active patient record linked to current mock user
    const patientRecord = patients.find(p => p.id === currentUser.patientId) || patients[0];
    const myDoses = administrations.filter(a => a.patientId === (patientRecord?.id || ''));
    const myAppointments = appointments.filter(a => a.patientId === (patientRecord?.id || '') && a.status === 'Scheduled');

    return (
      <div id="patient-portal-view" className="space-y-6">
        {/* Portal Jumbotron banner */}
        <div className="rounded-2xl bg-slate-900 p-6 text-white md:p-8 relative overflow-hidden shadow-lg shadow-slate-950/20">
          <div className="relative z-10 max-w-2xl">
            <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/30">
              NHS/WHO Standard Compliant
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
              Welcome to Your Health Portal, {patientRecord?.name || currentUser.name}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Access your digital vaccine passport, scheduled appointments calendar, diagnostic checklists, and sign up for booster notifications.
            </p>
          </div>
          {/* Subtle decoration lines */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Digital Vaccine Passport Badge (Component 2: Records Portal) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-950">Vaccination Credentials</h3>
                <Award className="h-5 w-5 text-teal-600" />
              </div>
              
              <div className="flex flex-col items-center bg-teal-50/50 p-4 rounded-xl border border-teal-100 text-center">
                {/* Simulated QR Code for vaccination confirmation */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="h-32 w-32 flex flex-col items-center justify-center space-y-1 text-slate-400 bg-slate-100 border border-dashed rounded font-mono text-[9px]">
                    <span className="text-slate-800 font-bold tracking-wider">[QR DE-CRYPT]</span>
                    <span className="text-slate-500">WHO_ID: {patientRecord?.id || "pat_test"}</span>
                    <span className="text-slate-500">DOSES_VALID: {myDoses.length}</span>
                    <div className="grid grid-cols-5 gap-0.5 h-6 w-16 bg-slate-800 p-0.5 rounded-xs">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className={`h-1.5 w-full ${i % 3 === 0 ? 'bg-white' : 'bg-slate-950'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
                <h4 className="mt-3 text-sm font-bold text-slate-900">Clinically Authenticated Profile</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{patientRecord?.email}</p>
              </div>

              {/* Patient Basic Profile Details */}
              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between border-b border-slate-50 py-1">
                  <span className="font-medium">Patient Reference:</span>
                  <span className="font-bold text-slate-800">{patientRecord?.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 py-1">
                  <span className="font-medium">Date of Birth:</span>
                  <span className="font-bold text-slate-800">{patientRecord?.birthDate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 py-1">
                  <span className="font-medium">Contact Number:</span>
                  <span className="font-bold text-slate-800">{patientRecord?.contactNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 py-1">
                  <span className="font-medium">Physical Address:</span>
                  <span className="font-bold text-slate-800 text-right truncate max-w-[150px]">{patientRecord?.address}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-[10px] text-slate-400 block text-center italic">
                Verified with digital healthcare ledger. Fully compliant with guidelines.
              </span>
            </div>
          </div>

          {/* Immunization logs list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 mb-4 border-b border-slate-100 pb-3">
                Your Administered Immunizations ({myDoses.length})
              </h3>
              
              {myDoses.length > 0 ? (
                <div className="space-y-4">
                  {myDoses.map((dose) => (
                    <div key={dose.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                      <div className="flex flex-col md:flex-row justify-between md:items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{dose.vaccineType}</p>
                          <p className="text-xs text-indigo-700 font-semibold mt-0.5">{dose.doseNumber}</p>
                        </div>
                        <div className="mt-2 md:mt-0 text-right">
                          <span className="inline-flex rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                            Verified Given
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">Given on {dose.dateAdministered}</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2 lg:grid-cols-4">
                        <div>
                          <p className="font-medium">Manufacturer:</p>
                          <p className="font-bold text-slate-700">{dose.manufacturer}</p>
                        </div>
                        <div>
                          <p className="font-medium">Batch Number:</p>
                          <p className="font-bold text-slate-700">{dose.batchNumber}</p>
                        </div>
                        <div>
                          <p className="font-medium">Site of Inj:</p>
                          <p className="font-bold text-slate-700">{dose.siteOfInjection}</p>
                        </div>
                        <div>
                          <p className="font-medium">Admin By:</p>
                          <p className="font-bold text-slate-700">{dose.administeredBy}</p>
                        </div>
                      </div>

                      {dose.notes && (
                        <div className="mt-2 text-[11px] text-slate-500 bg-white p-2 border rounded-sm">
                          <strong>Clinician Note:</strong> {dose.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
                  <p className="mt-2 text-xs font-semibold text-slate-700">No Administration Records Found</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                    You have not registered any administered doses in this session. Ask the Nurse console to administer a dose.
                  </p>
                </div>
              )}
            </div>

            {/* Scheduled appointments */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 mb-3 border-b border-slate-100 pb-2">
                Your Upcoming Vaccinations Scheduler
              </h3>
              {myAppointments.length > 0 ? (
                <div className="space-y-3">
                  {myAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between border-l-4 border-indigo-600 bg-slate-50 p-3 rounded-r-lg">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{apt.vaccineType}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {apt.scheduledDate} at {apt.scheduledTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
                          Confirmed Slot
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-3 italic">
                  No active upcoming vaccine calendars booked for you. Select 'Book Appointment' in the sidebar tab to book.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Simulated Device Inbox Viewer for Patient self-testing */}
        {patientRecord && (
          <div className="mt-8 border-t border-slate-200 pt-8 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="flex-1 h-px bg-slate-200"></span>
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 font-sans px-3">
                📱 Interactive personal incoming device simulator
              </span>
              <span className="flex-1 h-px bg-slate-200"></span>
            </div>
            <PatientDeviceSimulator patient={patientRecord} />
          </div>
        )}
      </div>
    );
  }

  // Handle nurse or administrator view:
  const handleAddNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations:
    const requiresEmail = !formData.isChild;
    const requiresContact = !formData.isChild;
    
    if (!formData.name || !formData.birthDate) {
      alert("Please enter the patient's name and date of birth.");
      return;
    }
    
    if (requiresEmail && !formData.email) {
      alert("Please enter the patient's email address.");
      return;
    }
    
    if (requiresContact && !formData.contactNumber) {
      alert("Please enter the patient's contact number.");
      return;
    }

    if (formData.isChild) {
      if (!formData.guardianName || !formData.guardianContact) {
        alert("Please provide the parent or guardian's name and contact number for pediatric patients.");
        return;
      }
    }

    // Default missing child values to guardian values for SMS routing
    const cleanContact = formData.contactNumber || formData.guardianContact;
    const cleanEmail = formData.email || (formData.guardianName ? `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@guardian-mwihoko.org` : '');

    const patientSubmission = {
      ...formData,
      contactNumber: cleanContact,
      email: cleanEmail
    };

    const newPat = addPatient(patientSubmission);
    // Select the newly registered patient profile instantly for detail viewing
    setSelectedPatient(newPat);
    setIsAdding(false);
    // Reset form
    setFormData({
      name: '',
      birthDate: '',
      gender: 'Male',
      contactNumber: '',
      email: '',
      address: '',
      medicalHistory: '',
      isChild: false,
      guardianName: '',
      guardianContact: '',
      guardianRelation: 'Parent'
    });
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.guardianName && p.guardianName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGender = genderFilter === 'All' || p.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div id="patient-management-tab" className="space-y-6">
      <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-950 md:text-xl">
            Unified Patient Demographics & Records
          </h2>
          <p className="text-xs text-slate-500">
            Search clinical files, register demographic details, and audit past immunization logs.
          </p>
        </div>
        
        <button
          id="btn-register-new-patient"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center space-x-1 border border-transparent bg-teal-600 px-4 py-2 rounded-lg text-xs font-semibold text-white transition hover:bg-teal-700 shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Adding profile Modal Overlay Form */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-950 mb-1">
              Add Demographic Patient Profile
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Submit digital file. Form values instantly synced and committed.
            </p>

            <form onSubmit={handleAddNewPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 text-slate-800"
                    placeholder="Samuel Omondi"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 text-slate-800"
                  />
                </div>
              </div>

              {/* Patient Category Toggle: Adult vs Child */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between space-x-4">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">Patient Category</span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Select if the patient is registration category of an adult or a child/minor.
                  </p>
                </div>
                <div className="flex bg-slate-200 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isChild: false })}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition duration-150 ${!formData.isChild ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-650 hover:text-slate-900'}`}
                  >
                    Adult
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isChild: true })}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition duration-150 ${formData.isChild ? 'bg-teal-600 text-white shadow-3xs' : 'text-slate-650 hover:text-slate-900'}`}
                  >
                    Child / Minor
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                    Contact Number {formData.isChild ? '(Optional for Children)' : '*'}
                  </label>
                  <input
                    type="tel"
                    required={!formData.isChild}
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 text-slate-800 bg-white"
                    placeholder={formData.isChild ? "e.g., child's phone (optional)" : "+254 712..."}
                  />
                </div>
              </div>

              {/* Dynamic Child/Guardian block */}
              {formData.isChild && (
                <div className="bg-amber-50/20 border border-amber-200/80 rounded-xl p-4 space-y-3.5 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center space-x-1.5 text-amber-900">
                    <span className="text-xs font-bold uppercase tracking-wider">👪 Parent / Legal Guardian Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Guardian Name *</label>
                      <input
                        type="text"
                        required={formData.isChild}
                        value={formData.guardianName}
                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 text-slate-800 bg-white"
                        placeholder="Father / Mother / Guardian full name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Guardian Contact *</label>
                      <input
                        type="tel"
                        required={formData.isChild}
                        value={formData.guardianContact}
                        onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 text-slate-800 bg-white"
                        placeholder="Contact number for SMS notices"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Relationship to Minor *</label>
                    <select
                      value={formData.guardianRelation}
                      onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 text-slate-800 bg-white"
                    >
                      <option value="Parent">Parent (Mother / Father)</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Sibling">Sibling / Adult Brother / Sister</option>
                      <option value="Aunt / Uncle">Aunt / Uncle</option>
                      <option value="Other">Other Family Relation</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Email Address {formData.isChild ? '(Optional for Children)' : '*'}
                </label>
                <input
                  type="email"
                  required={!formData.isChild}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 text-slate-800 bg-white"
                  placeholder={formData.isChild ? "Optional for children (parent's email can be used)" : "samuel.o@outlook.com"}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 text-slate-800 bg-white"
                  placeholder="Apartment B4, Valley View, Nairobi"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide">Known Allergies / Medical Notes</label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 text-slate-800 bg-white"
                  placeholder="e.g. History of asthma. Penicillin sensitivity."
                />
              </div>

              <div className="flex justify-end space-x-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition"
                >
                  Register Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Filter Tools and Layout split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Patient Index list (Col spans 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col space-y-2 bg-white rounded-xl border border-slate-150 p-4 shadow-3xs md:flex-row md:items-center md:space-x-4 md:space-y-0">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient name, reference number, or email..."
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-4 text-xs focus:ring-1 focus:ring-teal-500 text-slate-800 bg-slate-50/50"
              />
            </div>
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-semibold">Gender:</span>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-700 focus:ring-1 focus:ring-teal-500"
              >
                <option>All</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Patients Listing Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500">
                    <th className="px-5 py-3.5">Reference / Name</th>
                    <th className="px-5 py-3.5">Contact Profile</th>
                    <th className="px-5 py-3.5">Age / Sex</th>
                    <th className="px-5 py-3.5">Doses Given</th>
                    <th className="px-5 py-3.5 text-right">Records Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => {
                      const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
                      const patientDosesCount = administrations.filter(a => a.patientId === patient.id).length;
                      const isSelected = selectedPatient?.id === patient.id;

                      return (
                        <tr 
                          key={patient.id} 
                          onClick={() => setSelectedPatient(patient)}
                          className={`hover:bg-teal-50/30 cursor-pointer transition-colors ${
                            isSelected ? 'bg-teal-50/50' : ''
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-slate-900">{patient.name}</span>
                                {patient.isChild && (
                                  <span className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800 ring-1 ring-inset ring-amber-600/20 uppercase tracking-wider">
                                    Child
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 mt-0.5">{patient.id}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col space-y-0.5">
                              <span className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>{patient.contactNumber}</span>
                              </span>
                              {patient.isChild && patient.guardianName ? (
                                <span className="flex items-center space-x-1 text-teal-700 text-[10.5px] font-semibold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100/50 w-fit">
                                  <span>👪 {patient.guardianRelation || 'Guardian'}: {patient.guardianName}</span>
                                </span>
                              ) : (
                                <span className="flex items-center space-x-1 text-slate-400 text-[10.5px]">
                                  <Mail className="h-3 w-3 shrink-0" />
                                  <span>{patient.email}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold">{age} yrs old</span>
                              <span className="text-slate-400 capitalize">{patient.gender}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              patientDosesCount > 0 
                                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/10'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {patientDosesCount} {patientDosesCount === 1 ? 'dose' : 'doses'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              id={`select-patient-${patient.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatient(patient);
                              }}
                              className="text-xs font-semibold text-teal-600 hover:text-teal-800 hover:underline"
                            >
                              Expand File →
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                        No demographics match search terms.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Clinical File Detail pane */}
        <div id="patient-details-card" className="space-y-4">
          {selectedPatient ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Patient Clinical File</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {selectedPatient.id}</p>
                </div>
                <Users className="h-4.5 w-4.5 text-slate-400" />
              </div>

              {/* Bio details list */}
              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Biological Parameters</p>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Age & Gender</p>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        {new Date().getFullYear() - new Date(selectedPatient.birthDate).getFullYear()} Yrs ({selectedPatient.gender})
                        {selectedPatient.isChild && (
                          <span className="inline-flex items-center rounded bg-amber-50 px-1 py-0.2 text-[8.5px] font-extrabold text-amber-800 ring-1 ring-inset ring-amber-600/10 uppercase tracking-widest leading-none">
                            Minor
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Born On</p>
                      <p className="font-bold text-slate-800">{selectedPatient.birthDate}</p>
                    </div>
                  </div>
                </div>

                {selectedPatient.isChild && (
                  <div className="space-y-1 animate-in fade-in duration-150">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Parent / Guardian Legal Info</p>
                    <div className="bg-amber-50/40 p-2.5 rounded-lg border border-amber-100/70 space-y-1.5 text-[11px] text-amber-950">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-600">Full Name</span>
                        <span className="font-bold text-slate-800">{selectedPatient.guardianName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-600">Contact Number</span>
                        <span className="font-mono font-bold text-slate-800">{selectedPatient.guardianContact || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-600">Relationship</span>
                        <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-amber-800 uppercase tracking-wider">
                          {selectedPatient.guardianRelation || 'Parent'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Primary Residence</p>
                  <p className="flex items-center space-x-1.5 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="line-clamp-2 leading-tight">{selectedPatient.address || 'Not Specified'}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Allergies & Contraindications</p>
                  <div className="rounded-lg border border-amber-100 bg-amber-50/30 p-2.5 text-amber-900 leading-normal">
                    {selectedPatient.medicalHistory || 'No warnings registered on patient file.'}
                  </div>
                </div>

                {/* Subscribed immunization history */}
                <div id="patient-doses-history" className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Immunization Ledger</p>
                  {administrations.filter(a => a.patientId === selectedPatient.id).length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {administrations
                        .filter(a => a.patientId === selectedPatient.id)
                        .map((adm) => (
                          <div key={adm.id} className="rounded border border-slate-100 bg-slate-50 p-2 text-[11px]">
                            <p className="font-bold text-slate-800">{adm.vaccineType}</p>
                            <div className="flex justify-between text-slate-500 mt-1">
                              <span>{adm.doseNumber}</span>
                              <span>Administered: {adm.dateAdministered}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">Admin: {adm.administeredBy}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                      No immunization events on database for this patient.
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 space-y-1 leading-normal mb-3">
                <p><strong>Registered By:</strong> {selectedPatient.registeredBy}</p>
                <p><strong>Registered At:</strong> {new Date(selectedPatient.registeredAt).toLocaleString()}</p>
              </div>

              <div className="border-t border-slate-150 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeviceSimForPatient(selectedPatient)}
                  className="w-full inline-flex items-center justify-center space-x-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100/75 py-2.5 text-xs font-bold text-teal-800 transition shadow-3xs cursor-pointer"
                >
                  <Smartphone className="h-3.5 w-3.5 text-teal-700" />
                  <span>Verify Outbox Delivery Sandbox</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center flex flex-col items-center justify-center h-80">
              <UserCheck className="h-8 w-8 text-slate-400" />
              <p className="mt-2 text-xs font-semibold text-slate-800">No Patient File Open</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                Select a row from the demographic index table to expand vaccination logs, addresses, allergies, and logistics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clinician / Nurse sandbox verification slideover modal */}
      {showDeviceSimForPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-sidebar-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4.5 w-4.5 text-teal-600" />
                <h3 className="text-sm font-extrabold text-slate-950">
                  Patient Communication Channel verification (Clinician Desk)
                </h3>
              </div>
              <button
                onClick={() => setShowDeviceSimForPatient(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <PatientDeviceSimulator 
              patient={showDeviceSimForPatient} 
              onClose={() => setShowDeviceSimForPatient(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
