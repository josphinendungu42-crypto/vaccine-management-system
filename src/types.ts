/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Nurse' | 'Patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  patientId?: string; // Links to Patient entity if role is Patient
  username?: string;
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  isActive?: boolean;
}

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  contactNumber: string;
  email: string;
  address: string;
  medicalHistory: string;
  registeredBy: string;
  registeredAt: string;
  isChild?: boolean;
  guardianName?: string;
  guardianContact?: string;
  guardianRelation?: string;
}

export interface VaccineStock {
  id: string;
  name: string; // e.g., "BCG", "HPV", "COVID-19 (Pfizer-BioNTech)", "Rotavirus"
  manufacturer: string;
  batchNumber: string;
  dosesAvailable: number;
  lowStockThreshold: number;
  expiryDate: string;
  storageTemp: string; // e.g., "2-8°C"
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  vaccineType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'Scheduled' | 'Completed' | 'Missed' | 'Cancelled';
  notes: string;
}

export interface AdministeredVaccine {
  id: string;
  patientId: string;
  patientName: string;
  vaccineType: string;
  doseNumber: string; // "1st Dose", "2nd Dose", "Booster"
  dateAdministered: string;
  batchNumber: string;
  manufacturer: string;
  administeredBy: string; // Nurse name
  siteOfInjection: string; // "Left Deltoid", "Right Deltoid", "Left Thigh", "Right Thigh"
  notes: string;
}

export interface AEFIReport {
  id: string;
  administeredVaccineId: string;
  patientId: string;
  patientName: string;
  vaccineType: string;
  symptomSeverity: 'Mild' | 'Moderate' | 'Severe';
  onsetTimestamp: string;
  symptoms: string; // e.g., "High fever, swelling at injection site"
  actionsTaken: string; // e.g., "Prescribed paracetamol, advised rest"
  reportedBy: string;
  reportedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionCategory: 'AUTH' | 'PATIENT' | 'VACCINATION' | 'INVENTORY' | 'APPOINTMENT' | 'AEFI' | 'CONFIG';
  actionDetails: string;
  ipAddress: string;
  signature?: string;
  prevSignature?: string;
}

export interface SystemSettings {
  clinicName: string;
  address: string;
  allowSelfRegistration: boolean;
  lowStockAlertEmail: string;
  enableSmsNotifications: boolean;
  enableEmailNotifications: boolean;
  
  // Africa's Talking Configuration
  atUsername?: string;
  atApiKey?: string;
  atSenderId?: string;

  // SMTP Configuration
  smtpHost?: string;
  smtpPort?: string;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromEmail?: string;
}

export interface LoginRecord {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  email: string;
  timestamp: string;
  ipAddress: string;
}

export interface AppNotification {
  id: string;
  recipient: string;
  type: 'SMS' | 'Email' | 'Alert';
  status: string;
  time: string;
  message: string;
}
