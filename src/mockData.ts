/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, VaccineStock, Appointment, AdministeredVaccine, AEFIReport, AuditLog, SystemSettings, User } from './types';

export const SEED_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Dr. Jane M. Waithera',
    email: 'admin@clinichub.org',
    role: 'Admin',
    username: 'admin',
    password: 'adminpassword',
    securityQuestion: 'What is the name of this clinic facility? (Answer: mwihoko)',
    securityAnswer: 'mwihoko'
  },
  {
    id: 'usr-nurse',
    name: 'Nurse Richard Cole',
    email: 'richard.cole@clinichub.org',
    role: 'Nurse',
    username: 'nurse',
    password: 'nursepassword',
    securityQuestion: 'What is your clinical specialty? (Answer: pediatrics)',
    securityAnswer: 'pediatrics'
  },
  {
    id: 'usr-pat-1',
    name: 'Samuel Kiprop',
    email: 'samuel.kiprop@outlook.com',
    role: 'Patient',
    patientId: 'pat-1',
    username: 'samuel',
    password: 'samuelpassword',
    securityQuestion: 'Where do you work? (Answer: nairobi)',
    securityAnswer: 'nairobi'
  },
  {
    id: 'usr-pat-2',
    name: 'Esther Njeri',
    email: 'esther.njeri@gmail.com',
    role: 'Patient',
    patientId: 'pat-2',
    username: 'esther',
    password: 'estherpassword',
    securityQuestion: 'What is your home town? (Answer: githurai)',
    securityAnswer: 'githurai'
  }
];

export const SEED_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Samuel Kiprop',
    birthDate: '1988-04-12',
    gender: 'Male',
    contactNumber: '+254 712 345678',
    email: 'samuel.kiprop@outlook.com',
    address: '404 Valley Road, Nairobi',
    medicalHistory: 'Mild penicillin allergy. No previous vaccination issues.',
    registeredBy: 'Dr. Jane M. Waithera',
    registeredAt: '2026-03-10T08:30:00Z'
  },
  {
    id: 'pat-2',
    name: 'Esther Njeri',
    birthDate: '2019-11-23',
    gender: 'Female',
    contactNumber: '+254 722 987654',
    email: 'esther.njeri@gmail.com',
    address: 'Apt 5B, Westlands, Nairobi',
    medicalHistory: 'None. Normal childhood development indicators.',
    registeredBy: 'Nurse Richard Cole',
    registeredAt: '2026-04-01T10:15:00Z',
    isChild: true,
    guardianName: 'Grace Wangari (Mother)',
    guardianContact: '+254 722 987654',
    guardianRelation: 'Parent'
  },
  {
    id: 'pat-3',
    name: 'Devin Curtis',
    birthDate: '1962-07-30',
    gender: 'Male',
    contactNumber: '+254 733 111222',
    email: 'devin.curtis@yahoo.com',
    address: '88 Link Road, Karen',
    medicalHistory: 'Type 2 Diabetes controlled on Metformin.',
    registeredBy: 'Dr. Jane M. Waithera',
    registeredAt: '2026-04-15T09:00:00Z'
  },
  {
    id: 'pat-4',
    name: 'Miriam Al-Amin',
    birthDate: '1995-01-05',
    gender: 'Female',
    contactNumber: '+254 701 555444',
    email: 'miriam.amin@gmail.com',
    address: 'Mombasa Road Business Park, Nairobi',
    medicalHistory: 'Asthmatic, has standard inhaler.',
    registeredBy: 'Nurse Richard Cole',
    registeredAt: '2026-05-10T14:40:00Z'
  }
];

export const SEED_STOCKS: VaccineStock[] = [
  {
    id: 'vax-bcg',
    name: 'BCG (Tuberculosis)',
    manufacturer: 'Serum Institute of India',
    batchNumber: 'BCG-2026-99A',
    dosesAvailable: 120,
    lowStockThreshold: 30,
    expiryDate: '2027-08-30',
    storageTemp: '2-8°C'
  },
  {
    id: 'vax-pfz',
    name: 'COVID-19 (Pfizer-BioNTech)',
    manufacturer: 'Pfizer Inc.',
    batchNumber: 'PFR-98001-X',
    dosesAvailable: 15, // Low stock!
    lowStockThreshold: 40,
    expiryDate: '2026-11-15',
    storageTemp: '-80°C to -60°C'
  },
  {
    id: 'vax-hpv',
    name: 'HPV (Gardasil 9)',
    manufacturer: 'Merck & Co.',
    batchNumber: 'HPV-V449',
    dosesAvailable: 45,
    lowStockThreshold: 15,
    expiryDate: '2028-02-28',
    storageTemp: '2-8°C'
  },
  {
    id: 'vax-rot',
    name: 'Rotavirus (Rotarix)',
    manufacturer: 'GlaxoSmithKline',
    batchNumber: 'ROT-382C',
    dosesAvailable: 8, // Very low stock!
    lowStockThreshold: 20,
    expiryDate: '2026-09-01',
    storageTemp: '2-8°C'
  },
  {
    id: 'vax-tet',
    name: 'Tetanus Toxoid',
    manufacturer: 'Sanofi Pasteur',
    batchNumber: 'TET-812B',
    dosesAvailable: 85,
    lowStockThreshold: 20,
    expiryDate: '2027-12-15',
    storageTemp: '2-8°C'
  }
];

export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-2',
    patientName: 'Esther Njeri',
    vaccineType: 'Rotavirus (Rotarix)',
    scheduledDate: '2026-06-02',
    scheduledTime: '10:00',
    status: 'Scheduled',
    notes: '2nd Dose follow-up.'
  },
  {
    id: 'apt-2',
    patientId: 'pat-1',
    patientName: 'Samuel Kiprop',
    vaccineType: 'COVID-19 (Pfizer-BioNTech)',
    scheduledDate: '2026-06-03',
    scheduledTime: '11:15',
    status: 'Scheduled',
    notes: 'Booster shot recommendation.'
  },
  {
    id: 'apt-3',
    patientId: 'pat-3',
    patientName: 'Devin Curtis',
    vaccineType: 'Tetanus Toxoid',
    scheduledDate: '2026-05-28', // Today (using mock system local date logic)
    scheduledTime: '14:30',
    status: 'Scheduled',
    notes: 'Minor arm injury preventative shot.'
  },
  {
    id: 'apt-4',
    patientId: 'pat-4',
    patientName: 'Miriam Al-Amin',
    vaccineType: 'HPV (Gardasil 9)',
    scheduledDate: '2026-05-25',
    scheduledTime: '09:00',
    status: 'Missed',
    notes: 'Patient did not show up. Auto-emails scheduled for re-booking.'
  }
];

export const SEED_ADMINISTRATIONS: AdministeredVaccine[] = [
  {
    id: 'adm-1',
    patientId: 'pat-2',
    patientName: 'Esther Njeri',
    vaccineType: 'Rotavirus (Rotarix)',
    doseNumber: '1st Dose',
    dateAdministered: '2026-04-01',
    batchNumber: 'ROT-382C',
    manufacturer: 'GlaxoSmithKline',
    administeredBy: 'Nurse Richard Cole',
    siteOfInjection: 'Right Thigh',
    notes: 'Injected successfully, infant was calm. No crying.'
  },
  {
    id: 'adm-2',
    patientId: 'pat-1',
    patientName: 'Samuel Kiprop',
    vaccineType: 'COVID-19 (Pfizer-BioNTech)',
    doseNumber: '2nd Dose',
    dateAdministered: '2026-03-12',
    batchNumber: 'PFR-98001-X',
    manufacturer: 'Pfizer Inc.',
    administeredBy: 'Nurse Richard Cole',
    siteOfInjection: 'Left Deltoid',
    notes: 'Previous dose administered elsewhere.'
  },
  {
    id: 'adm-3',
    patientId: 'pat-4',
    patientName: 'Miriam Al-Amin',
    vaccineType: 'HPV (Gardasil 9)',
    doseNumber: '1st Dose',
    dateAdministered: '2026-05-10',
    batchNumber: 'HPV-V449',
    manufacturer: 'Merck & Co.',
    administeredBy: 'Dr. Jane M. Waithera',
    siteOfInjection: 'Left Deltoid',
    notes: 'Needs 2nd Dose in 6 months.'
  }
];

export const SEED_AEFIS: AEFIReport[] = [
  {
    id: 'aef-1',
    administeredVaccineId: 'adm-2',
    patientId: 'pat-1',
    patientName: 'Samuel Kiprop',
    vaccineType: 'COVID-19 (Pfizer-BioNTech)',
    symptomSeverity: 'Moderate',
    onsetTimestamp: '2026-03-13T04:00:00Z',
    symptoms: 'Low grade fever (38.2°C), muscle fatigue, and soreness at injection site.',
    actionsTaken: 'Advised rest and oral paracetamol 1g every 6-8 hrs. Checked on patient via call on Day 2 - symptoms resolved.',
    reportedBy: 'Nurse Richard Cole',
    reportedAt: '2026-03-14T09:30:00Z'
  }
];

export const SEED_SETTINGS: SystemSettings = {
  clinicName: 'Vaccination Tracking System',
  address: 'Section 4, Nairobi Health Services, Nairobi',
  allowSelfRegistration: true,
  lowStockAlertEmail: 'pharmacy@vaccinationtracking.org',
  enableSmsNotifications: true,
  enableEmailNotifications: true,
  atUsername: 'sandbox',
  atApiKey: 'atsk_60e40e7bc707cdb83f18accd452d3d088db5071581db8a3b2c955bc851de172625290db0',
  atSenderId: '',
  smtpHost: '',
  smtpPort: '587',
  smtpSecure: false,
  smtpUser: '',
  smtpPass: '',
  smtpFromEmail: 'noreply@clinichub.org'
};

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-05-28T08:00:02Z',
    userId: 'usr-admin',
    userName: 'Dr. Jane M. Waithera',
    userRole: 'Admin',
    actionCategory: 'AUTH',
    actionDetails: 'Administrator logged into clinic console.',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'log-2',
    timestamp: '2026-05-28T09:12:44Z',
    userId: 'usr-nurse',
    userName: 'Nurse Richard Cole',
    userRole: 'Nurse',
    actionCategory: 'INVENTORY',
    actionDetails: 'Replenished 50 doses of Tetanus Toxoid (batch TET-812B).',
    ipAddress: '192.168.1.112'
  },
  {
    id: 'log-3',
    timestamp: '2026-05-28T10:45:10Z',
    userId: 'usr-nurse',
    userName: 'Nurse Richard Cole',
    userRole: 'Nurse',
    actionCategory: 'APPOINTMENT',
    actionDetails: 'Scheduled 2nd dose Rotavirus appointment for Esther Njeri.',
    ipAddress: '192.168.1.112'
  }
];
