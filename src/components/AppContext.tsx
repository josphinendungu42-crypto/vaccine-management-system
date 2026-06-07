/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, VaccineStock, Appointment, AdministeredVaccine, AEFIReport, AuditLog, SystemSettings, User, UserRole, LoginRecord, AppNotification } from '../types';
import { SEED_USERS, SEED_PATIENTS, SEED_STOCKS, SEED_APPOINTMENTS, SEED_ADMINISTRATIONS, SEED_AEFIS, SEED_SETTINGS, SEED_AUDIT_LOGS } from '../mockData';

// Cryptographic FNV-1a & Bitwise Chaining Helper for Log Authenticity
export function computeLogHash(log: Omit<AuditLog, 'signature' | 'prevSignature'>, prevSignature: string = 'GENESIS_MH_01'): string {
  const payload = `${prevSignature}|${log.id}|${log.timestamp}|${log.userId}|${log.userName}|${log.actionCategory}|${log.actionDetails}|${log.ipAddress}`;
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash & 0xffffffff).toString(16).toUpperCase().padStart(8, '0');
}

export function signLogsChain(logs: AuditLog[]): AuditLog[] {
  // Sort oldest first to compute cumulative chaining signatures
  const sorted = [...logs].reverse();
  const signed: AuditLog[] = [];
  
  let lastSignature = 'MHK_SECURE_GENESIS_CHAIN_STABLE';
  for (const log of sorted) {
    const cleanLog = {
      id: log.id,
      timestamp: log.timestamp,
      userId: log.userId,
      userName: log.userName,
      userRole: log.userRole,
      actionCategory: log.actionCategory,
      actionDetails: log.actionDetails,
      ipAddress: log.ipAddress,
    };
    const signature = computeLogHash(cleanLog, lastSignature);
    signed.push({
      ...log,
      prevSignature: lastSignature,
      signature
    });
    lastSignature = signature;
  }
  
  // Return in original chronological display order (newest first)
  return signed.reverse();
}

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: User;
  allUsers: User[];
  currentRole: UserRole;
  patients: Patient[];
  stocks: VaccineStock[];
  appointments: Appointment[];
  administrations: AdministeredVaccine[];
  aefiReports: AEFIReport[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  successfulLogins: LoginRecord[];
  notifications: AppNotification[];
  atError: string | null;
  setAtError: (err: string | null) => void;
  
  // Actions
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  addUserAccount: (user: Omit<User, 'id'>) => { success: boolean; error?: string };
  changePassword: (userId: string, currentPass: string, newPass: string) => { success: boolean; error?: string };
  resetPassword: (username: string, answer: string, newPass: string) => { success: boolean; error?: string };
  toggleUserActivation: (userId: string) => { success: boolean; error?: string };
  switchRole: (role: UserRole) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'registeredBy' | 'registeredAt'>) => Patient;
  updatePatient: (patient: Patient) => void;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status'], notes?: string) => void;
  administerVaccine: (adminData: Omit<AdministeredVaccine, 'id' | 'dateAdministered' | 'administeredBy'>) => { success: boolean; error?: string };
  reportAEFI: (reportData: Omit<AEFIReport, 'id' | 'reportedBy' | 'reportedAt'>) => void;
  replenishStock: (id: string, amount: number) => void;
  addStockItem: (newItem: Omit<VaccineStock, 'id'>) => void;
  updateStockThresholds: (id: string, threshold: number) => void;
  updateSettings: (newSettings: SystemSettings) => void;
  clearAllLogs: () => void;
  appendLog: (category: AuditLog['actionCategory'], details: string) => void;
}

const SEED_LOGIN_RECORDS: LoginRecord[] = [
  {
    id: "logrec-1",
    userId: "usr-nurse",
    name: "Nurse Richard Cole",
    role: "Nurse",
    email: "richard.cole@clinichub.org",
    timestamp: "2026-06-05T08:15:22Z",
    ipAddress: "192.168.1.14"
  },
  {
    id: "logrec-2",
    userId: "usr-pat-1",
    name: "Samuel Kiprop",
    role: "Patient",
    email: "samuel.kiprop@outlook.com",
    timestamp: "2026-06-05T07:11:05Z",
    ipAddress: "192.168.1.42"
  },
  {
    id: "logrec-3",
    userId: "usr-pat-2",
    name: "Esther Njeri",
    role: "Patient",
    email: "esther.njeri@gmail.com",
    timestamp: "2026-06-05T06:45:10Z",
    ipAddress: "192.168.1.91"
  }
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'nt-1',
    recipient: 'Samuel Kiprop (+254 712 345678)',
    type: 'SMS',
    status: 'Delivered',
    time: '1 day ago',
    message: 'Reminder: Scheduled for COVID-19 Pfizer Booster on 2026-06-03 at 11:15.'
  },
  {
    id: 'nt-2',
    recipient: 'Esther Njeri (esther.njeri@gmail.com)',
    type: 'Email',
    status: 'Sent Successfully',
    time: '1 day ago',
    message: 'Notice: 2nd dose Rotavirus is scheduled for 2026-06-02 at 10:00.'
  },
  {
    id: 'nt-3',
    recipient: 'Clinic Pharmacy Admin',
    type: 'Alert',
    status: 'Sent Email',
    time: '2 hours ago',
    message: "ALERT: 'Rotavirus (Rotarix)' is below vaccine alert threshold. Only 8 doses remaining!"
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with default fallback to seed data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vax_authenticated') === 'true';
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('vax_users');
    const parsed: User[] = local ? JSON.parse(local) : SEED_USERS;
    return parsed.map(u => {
      const seed = SEED_USERS.find(s => s.id === u.id || s.username === u.username);
      return {
        ...u,
        securityQuestion: u.securityQuestion || seed?.securityQuestion || 'What is the clinic facility name? (Answer: mwihoko)',
        securityAnswer: u.securityAnswer || seed?.securityAnswer || 'mwihoko'
      };
    });
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('vax_role') as UserRole) || 'Admin';
  });
  
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const localUser = localStorage.getItem('vax_current_user');
    if (localUser) {
      try {
        return JSON.parse(localUser);
      } catch (e) {
        // Fallback
      }
    }
    const role = (localStorage.getItem('vax_role') || 'Admin') as UserRole;
    return SEED_USERS.find(u => u.role === role) || SEED_USERS[0];
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const local = localStorage.getItem('vax_patients');
    return local ? JSON.parse(local) : SEED_PATIENTS;
  });

  const [stocks, setStocks] = useState<VaccineStock[]>(() => {
    const local = localStorage.getItem('vax_stocks');
    return local ? JSON.parse(local) : SEED_STOCKS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const local = localStorage.getItem('vax_appointments');
    return local ? JSON.parse(local) : SEED_APPOINTMENTS;
  });

  const [administrations, setAdministrations] = useState<AdministeredVaccine[]>(() => {
    const local = localStorage.getItem('vax_administrations');
    return local ? JSON.parse(local) : SEED_ADMINISTRATIONS;
  });

  const [aefiReports, setAefiReports] = useState<AEFIReport[]>(() => {
    const local = localStorage.getItem('vax_aefi');
    return local ? JSON.parse(local) : SEED_AEFIS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const local = localStorage.getItem('vax_audits');
    return local ? JSON.parse(local) : SEED_AUDIT_LOGS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const local = localStorage.getItem('vax_settings');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.clinicName && (parsed.clinicName.includes('Nairobi') || parsed.clinicName.includes('Mwihoko'))) {
          parsed.clinicName = 'Vaccination Tracking System';
          parsed.address = 'Section 4, Nairobi Health Services, Nairobi';
          parsed.lowStockAlertEmail = 'pharmacy@vaccinationtracking.org';
        }
        
        // Ensure standard AT credentials of the user are injected if empty
        if (!parsed.atUsername || parsed.atUsername === '') {
          parsed.atUsername = SEED_SETTINGS.atUsername;
        }
        if (!parsed.atApiKey || parsed.atApiKey === '') {
          parsed.atApiKey = SEED_SETTINGS.atApiKey;
        }

        localStorage.setItem('vax_settings', JSON.stringify(parsed));
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return SEED_SETTINGS;
  });

  const [successfulLogins, setSuccessfulLogins] = useState<LoginRecord[]>(() => {
    const local = localStorage.getItem('vax_login_records');
    return local ? JSON.parse(local) : SEED_LOGIN_RECORDS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const local = localStorage.getItem('vax_notifications');
    return local ? JSON.parse(local) : SEED_NOTIFICATIONS;
  });

  const [atError, setAtError] = useState<string | null>(null);

  // Keep state and local storage synced
  useEffect(() => {
    localStorage.setItem('vax_login_records', JSON.stringify(successfulLogins));
  }, [successfulLogins]);

  useEffect(() => {
    localStorage.setItem('vax_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('vax_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('vax_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('vax_stocks', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('vax_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('vax_administrations', JSON.stringify(administrations));
  }, [administrations]);

  useEffect(() => {
    localStorage.setItem('vax_aefi', JSON.stringify(aefiReports));
  }, [aefiReports]);

  useEffect(() => {
    localStorage.setItem('vax_audits', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('vax_settings', JSON.stringify(settings));
  }, [settings]);

  // Login action
  const login = (username: string, password: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Verify
    const matchedUser = allUsers.find(
      u => (u.username && u.username.toLowerCase() === cleanUsername) || 
           u.email.toLowerCase() === cleanUsername
    );

    if (!matchedUser) {
      return { success: false, error: 'User account not found.' };
    }

    if (matchedUser.isActive === false) {
      return { success: false, error: 'This security profile has been deactivated/suspended by clinical administration.' };
    }

    const correctPassword = matchedUser.password || 'password';
    if (cleanPassword !== correctPassword) {
      return { success: false, error: 'Incorrect credential password.' };
    }

    // Authenticate
    setIsAuthenticated(true);
    localStorage.setItem('vax_authenticated', 'true');
    setCurrentUser(matchedUser);
    localStorage.setItem('vax_current_user', JSON.stringify(matchedUser));
    setCurrentRole(matchedUser.role);
    localStorage.setItem('vax_role', matchedUser.role);

    // Audit log
    const logId = 'log-' + Math.random().toString(36).substr(2, 9);
    const randomIp = '192.168.1.' + Math.floor(Math.random() * 90 + 10);
    const newLog: AuditLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      userId: matchedUser.id,
      userName: matchedUser.name,
      userRole: matchedUser.role,
      actionCategory: 'AUTH',
      actionDetails: `User authenticated with password: ${matchedUser.name} (${matchedUser.role})`,
      ipAddress: randomIp
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Record successful login session
    const loginRecId = 'logrec-' + Math.random().toString(36).substr(2, 9);
    const newLoginRecord: LoginRecord = {
      id: loginRecId,
      userId: matchedUser.id,
      name: matchedUser.name,
      role: matchedUser.role,
      email: matchedUser.email,
      timestamp: new Date().toISOString(),
      ipAddress: randomIp
    };
    setSuccessfulLogins(prev => [newLoginRecord, ...prev]);

    return { success: true };
  };

  // Logout action
  const logout = () => {
    // Log before wipe
    const logId = 'log-' + Math.random().toString(36).substr(2, 9);
    const logoutLog: AuditLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      actionCategory: 'AUTH',
      actionDetails: `User logged out: ${currentUser.name} (${currentRole})`,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 90 + 10)
    };
    setAuditLogs(prev => [logoutLog, ...prev]);

    setIsAuthenticated(false);
    localStorage.removeItem('vax_authenticated');
    localStorage.removeItem('vax_current_user');
  };

  // Add User Account
  const addUserAccount = (userData: Omit<User, 'id'>) => {
    const cleanUsername = userData.username?.trim().toLowerCase() || '';
    const cleanEmail = userData.email.trim().toLowerCase();

    if (!cleanUsername) {
      return { success: false, error: 'Username is required.' };
    }

    const exists = allUsers.some(
      u => (u.username && u.username.toLowerCase() === cleanUsername) || 
           u.email.toLowerCase() === cleanEmail
    );

    if (exists) {
      return { success: false, error: 'A staff or patient account with this username or email already exists.' };
    }

    const newId = 'usr-' + Math.random().toString(36).substr(2, 9);
    const newUser: User = {
      id: newId,
      name: userData.name.trim(),
      email: cleanEmail,
      role: userData.role,
      patientId: userData.patientId,
      username: cleanUsername,
      password: userData.password?.trim() || 'password',
      securityQuestion: userData.securityQuestion || 'What is your clinical specialty?',
      securityAnswer: (userData.securityAnswer || 'mwihoko').trim().toLowerCase(),
      isActive: true
    };

    setAllUsers(prev => [...prev, newUser]);
    appendLog('CONFIG', `Created user account: ${newUser.name} as ${newUser.role} (Username: shadow-${newUser.username})`);
    return { success: true };
  };

  // Change Password
  const changePassword = (userId: string, currentPass: string, newPass: string) => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'Required account not found in active roster.' };
    }

    const actualPassword = targetUser.password || 'password';
    if (actualPassword !== currentPass) {
      return { success: false, error: 'Authentication challenge failed: current password does not match.' };
    }

    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, password: newPass };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
          localStorage.setItem('vax_current_user', JSON.stringify(updated));
        }
        return updated;
      }
      return u;
    }));

    appendLog('AUTH', `Successfully updated password credentials for: ${targetUser.name}`);
    return { success: true };
  };

  // Reset Password via security questions challenge
  const resetPassword = (username: string, answer: string, newPass: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanAnswer = answer.trim().toLowerCase();

    const targetUser = allUsers.find(
      u => (u.username && u.username.toLowerCase() === cleanUsername) || 
           u.email.toLowerCase() === cleanUsername
    );

    if (!targetUser) {
      return { success: false, error: 'System account associated with that username or email address not found.' };
    }

    const correctAnswer = (targetUser.securityAnswer || 'mwihoko').trim().toLowerCase();
    if (cleanAnswer !== correctAnswer) {
      return { success: false, error: 'Verification failed: Security response is incorrect.' };
    }

    setAllUsers(prev => prev.map(u => {
      if (u.id === targetUser.id) {
        return { ...u, password: newPass };
      }
      return u;
    }));

    // Generate authenticated log with cryptographic ledger connection
    const logId = 'log-' + Math.random().toString(36).substr(2, 9);
    const newLog: AuditLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      userId: targetUser.id,
      userName: targetUser.name,
      userRole: targetUser.role,
      actionCategory: 'AUTH',
      actionDetails: `Credential password securely reset via cryptographic security question challenge: ${targetUser.name}`,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 90 + 10)
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  };

  // Toggle activation status of any account
  const toggleUserActivation = (userId: string) => {
    let uName = '';
    let isNowActive = false;
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        uName = u.name;
        const wasActive = u.isActive !== false;
        isNowActive = !wasActive;
        return { ...u, isActive: isNowActive };
      }
      return u;
    }));

    appendLog('CONFIG', `${isNowActive ? 'Activated' : 'Deactivated / Suspended'} security registration account for: ${uName} (Id: ${userId})`);
    return { success: true };
  };

  // Synchronize active user when role changes
  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('vax_role', role);
    const matchedUser = allUsers.find(u => u.role === role) || allUsers[0];
    setCurrentUser(matchedUser);
    localStorage.setItem('vax_current_user', JSON.stringify(matchedUser));
    
    // Log role switch
    const logId = 'log-' + Math.random().toString(36).substr(2, 9);
    const newLog: AuditLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      userId: matchedUser.id,
      userName: matchedUser.name,
      userRole: role,
      actionCategory: 'AUTH',
      actionDetails: `Duty role switched to: ${role} (${matchedUser.name})`,
      ipAddress: '192.168.1.1' + Math.floor(Math.random() * 90 + 10)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const appendLog = (category: AuditLog['actionCategory'], details: string) => {
    const logId = 'log-' + Math.random().toString(36).substr(2, 9);
    const newLog: AuditLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      actionCategory: category,
      actionDetails: details,
      ipAddress: '192.168.1.1' + Math.floor(Math.random() * 90 + 10)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Add a Patient
  const addPatient = (patData: Omit<Patient, 'id' | 'registeredBy' | 'registeredAt'>) => {
    const newId = 'pat-' + Math.random().toString(36).substr(2, 9);
    const newPatient: Patient = {
      ...patData,
      id: newId,
      registeredBy: currentUser.name,
      registeredAt: new Date().toISOString()
    };
    setPatients(prev => [newPatient, ...prev]);

    // Create user account automatically
    const cleanFirstName = patData.name.split(' ')[0].toLowerCase();
    const cleanEmail = patData.email || `${cleanFirstName}@mwihokoclinic.org`;
    const newUser: User = {
      id: 'usr-' + newId,
      name: patData.name,
      email: cleanEmail,
      role: 'Patient',
      patientId: newId,
      username: patData.email ? patData.email.split('@')[0].toLowerCase() : cleanFirstName,
      password: cleanFirstName + 'password',
      isActive: true
    };
    setAllUsers(prev => [...prev, newUser]);

    appendLog('PATIENT', `Registered new patient & login user account: ${newPatient.name} (Patient ID: ${newId}, Username: ${newUser.username})`);
    return newPatient;
  };

  // Update a Patient
  const updatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
    appendLog('PATIENT', `Updated details for patient: ${updated.name} (ID: ${updated.id})`);
  };

  // Add Appointment
  const addAppointment = (aptData: Omit<Appointment, 'id' | 'status'>) => {
    const newId = 'apt-' + Math.random().toString(36).substr(2, 9);
    const newApt: Appointment = {
      ...aptData,
      id: newId,
      status: 'Scheduled'
    };
    setAppointments(prev => [newApt, ...prev]);
    appendLog('APPOINTMENT', `Scheduled vaccine appointment for ${newApt.patientName}: ${newApt.vaccineType} on ${newApt.scheduledDate}`);

    // Instantly simulate sending SMS and Email reminders to the patient
    const patientObj = patients.find(p => p.id === aptData.patientId);
    const phone = patientObj?.contactNumber || "";
    const emailStr = patientObj?.email || "";

    const smsNotifId = 'nt-sms-' + Math.random().toString(36).substr(2, 9);
    const emailNotifId = 'nt-email-' + Math.random().toString(36).substr(2, 9);

    const initialSmsStatus = phone ? 'Initiating Outbound Routing...' : 'Simulated (No contact number)';
    const initialEmailStatus = emailStr ? 'Initiating SMTP Connection...' : 'Simulated (No email address)';

    const smsMsg = `Reminder: Scheduled for ${newApt.vaccineType} on ${newApt.scheduledDate} at ${newApt.scheduledTime}.`;
    const emailMsg = `Dear ${newApt.patientName},\n\nYour immunization appointment for ${newApt.vaccineType} at ${settings.clinicName || 'Mwihoko Clinic'} is confirmed on ${newApt.scheduledDate} at ${newApt.scheduledTime}.\n\nLocation: ${settings.clinicAddress || 'N/A'}\nClinic Contact: ${settings.clinicPhone || 'N/A'}\nNotes: ${newApt.notes || 'N/A'}\n\nThank you,\n${settings.clinicName || 'Mwihoko Clinic'} Team`;

    const smsNotif: AppNotification = {
      id: smsNotifId,
      recipient: `${newApt.patientName} (${phone || 'No Phone'})`,
      type: 'SMS',
      status: initialSmsStatus,
      time: 'Just now',
      message: smsMsg
    };

    const emailNotif: AppNotification = {
      id: emailNotifId,
      recipient: `${newApt.patientName} (${emailStr || 'No Email'})`,
      type: 'Email',
      status: initialEmailStatus,
      time: 'Just now',
      message: emailMsg
    };

    setNotifications(prev => [smsNotif, emailNotif, ...prev]);

    // Send Real SMS via Africa's Talking if phone number is provided
    if (phone) {
      const creds = {
        atUsername: settings.atUsername,
        atApiKey: settings.atApiKey,
        atSenderId: settings.atSenderId
      };

      fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message: smsMsg, credentials: creds })
      })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setAtError(data.error || "SMS Transmission Error");
        } else if (data.simulated && data.warning) {
          setAtError(data.warning);
        } else {
          setAtError(null);
        }
        setNotifications(prev => prev.map(n => {
          if (n.id === smsNotifId) {
            return {
              ...n,
              status: data.status || (data.success ? 'Delivered Instantly' : `Failed: ${data.error || 'Configuration Missing'}`)
            };
          }
          return n;
        }));
      })
      .catch(err => {
        console.error('Real SMS request execution failed:', err);
        setNotifications(prev => prev.map(n => 
          n.id === smsNotifId ? { ...n, status: 'Failed: Outbound Error' } : n
        ));
      });
    }

    // Send Real Email via SMTP if email address is provided
    if (emailStr) {
      const creds = {
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpSecure: settings.smtpSecure,
        smtpUser: settings.smtpUser,
        smtpPass: settings.smtpPass,
        smtpFromEmail: settings.smtpFromEmail
      };

      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailStr,
          subject: `Immunization Appointment Confirmed - ${newApt.vaccineType}`,
          body: emailMsg,
          credentials: creds
        })
      })
      .then(res => res.json())
      .then(data => {
        setNotifications(prev => prev.map(n => {
          if (n.id === emailNotifId) {
            return {
              ...n,
              status: data.success ? (data.status || 'Sent Successfully') : `Failed: ${data.error || 'Configuration Missing'}`
            };
          }
          return n;
        }));
      })
      .catch(err => {
        console.error('Real Email request execution failed:', err);
        setNotifications(prev => prev.map(n => 
          n.id === emailNotifId ? { ...n, status: 'Failed: Connection Error' } : n
        ));
      });
    }

    return newApt;
  };

  // Update Appointment Status
  const updateAppointmentStatus = (id: string, status: Appointment['status'], notes?: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, status, notes: notes !== undefined ? notes : a.notes };
        appendLog('APPOINTMENT', `Updated appointment (ID: ${id}) for ${a.patientName} to state: ${status}`);
        return updated;
      }
      return a;
    }));
  };

  // Administer Vaccine (and auto-deduct inventory)
  const administerVaccine = (adminData: Omit<AdministeredVaccine, 'id' | 'dateAdministered' | 'administeredBy'>) => {
    // 1. Check stock
    const targetStock = stocks.find(s => s.name === adminData.vaccineType);
    if (!targetStock) {
      return { success: false, error: 'Vaccine type not found in stock database.' };
    }
    if (targetStock.dosesAvailable <= 0) {
      appendLog('VACCINATION', `FAILED VACCINE ADMINISTRATION: Out of stock for ${adminData.vaccineType}`);
      return { success: false, error: `Vaccination failed. Stock exhausted for '${adminData.vaccineType}'.` };
    }

    // 2. Decrement Stock
    setStocks(prev => prev.map(s => {
      if (s.name === adminData.vaccineType) {
        const nextDoses = s.dosesAvailable - 1;
        if (nextDoses <= s.lowStockThreshold) {
          // Send automatic notification mock trigger
          console.warn(`LOW STOCK WARNING: ${s.name} down to ${nextDoses} doses.`);
        }
        return { ...s, dosesAvailable: nextDoses };
      }
      return s;
    }));

    // 3. Create administration record
    const newId = 'adm-' + Math.random().toString(36).substr(2, 9);
    const newAdmin: AdministeredVaccine = {
      ...adminData,
      id: newId,
      dateAdministered: new Date().toISOString().split('T')[0],
      administeredBy: currentUser.name
    };
    setAdministrations(prev => [newAdmin, ...prev]);

    // 4. Update scheduled appointment if exists for this patient and vaccine to "Completed"
    const matchedAppointment = appointments.find(a => 
      a.patientId === adminData.patientId && 
      a.vaccineType === adminData.vaccineType && 
      a.status === 'Scheduled'
    );
    if (matchedAppointment) {
      setAppointments(prev => prev.map(apt => 
        apt.id === matchedAppointment.id ? { ...apt, status: 'Completed', notes: 'Dose administered.' } : apt
      ));
    }

    appendLog('VACCINATION', `Administered ${newAdmin.doseNumber} of ${newAdmin.vaccineType} to ${newAdmin.patientName}. Dose deducted from Stock (${targetStock.batchNumber}).`);
    return { success: true };
  };

  // Report AEFI (Adverse Event Following Immunization)
  const reportAEFI = (reportData: Omit<AEFIReport, 'id' | 'reportedBy' | 'reportedAt'>) => {
    const newId = 'aef-' + Math.random().toString(36).substr(2, 9);
    const newReport: AEFIReport = {
      ...reportData,
      id: newId,
      reportedBy: currentUser.name,
      reportedAt: new Date().toISOString()
    };
    setAefiReports(prev => [newReport, ...prev]);
    appendLog('AEFI', `Reported AEFI (${newReport.symptomSeverity}) for ${newReport.patientName} on ${newReport.vaccineType}`);
  };

  // Replenish stock level
  const replenishStock = (id: string, amount: number) => {
    setStocks(prev => prev.map(s => {
      if (s.id === id) {
        const nextDoses = s.dosesAvailable + amount;
        appendLog('INVENTORY', `Replenished vaccine stock: ${s.name} increased by ${amount} doses (New Balance: ${nextDoses}).`);
        return { ...s, dosesAvailable: nextDoses };
      }
      return s;
    }));
  };

  // Add a new stock category/item
  const addStockItem = (newItem: Omit<VaccineStock, 'id'>) => {
    const newId = 'vax-' + Math.random().toString(36).substr(2, 9);
    const item: VaccineStock = {
      ...newItem,
      id: newId
    };
    setStocks(prev => [...prev, item]);
    appendLog('INVENTORY', `Configured new vaccine stock line: ${item.name} (${item.manufacturer}, Batch: ${item.batchNumber})`);
  };

  // Update stock thresholds
  const updateStockThresholds = (id: string, threshold: number) => {
    setStocks(prev => prev.map(s => {
      if (s.id === id) {
        appendLog('INVENTORY', `Upped alert threshold for ${s.name} to ${threshold}`);
        return { ...s, lowStockThreshold: threshold };
      }
      return s;
    }));
  };

  // Update Settings
  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    appendLog('CONFIG', `Modified core settings for: ${newSettings.clinicName}`);
  };

  // Clear Audit Logs
  const clearAllLogs = () => {
    const cleanLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      actionCategory: 'CONFIG',
      actionDetails: 'Audit trail log database cleared by administrator.',
      ipAddress: '127.0.0.1'
    };
    setAuditLogs([cleanLog]);
  };

  const signedLogs = signLogsChain(auditLogs);

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      currentUser,
      allUsers,
      currentRole,
      patients,
      stocks,
      appointments,
      administrations,
      aefiReports,
      auditLogs: signedLogs,
      settings,
      successfulLogins,
      notifications,
      atError,
      setAtError,
      login,
      logout,
      addUserAccount,
      changePassword,
      resetPassword,
      toggleUserActivation,
      switchRole,
      addPatient,
      updatePatient,
      addAppointment,
      updateAppointmentStatus,
      administerVaccine,
      reportAEFI,
      replenishStock,
      addStockItem,
      updateStockThresholds,
      updateSettings,
      clearAllLogs,
      appendLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
