
export type UserRole = 'admin' | 'receptionist';

export interface PatientEntry {
  id: string;
  date: string;
  patientName: string;
  consultant: string;
  procedure: string;
  diagnosis: string;
  notes: string;
  fee?: number;
  status: 'Completed' | 'Pending' | 'Follow-up';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  consultantId: string;
  consultantName: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  sittingNumber: number;
  totalSittings: number;
  notes: string;
}

export interface WorkingHours {
  consultantId: string;
  days: string[]; // ['Monday', 'Tuesday'...]
  start: string;
  end: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  records: PatientEntry[];
  isLocked?: boolean;
}

export interface Consultant {
  id: string;
  name: string;
  specialty: string;
  color: string;
}

export interface PracticeSettings {
  adminPin: string;
  recoveryEmail: string;
  clinicName: string;
}

export interface ClinicData {
  patients: Patient[];
  consultants: Consultant[];
  appointments: Appointment[];
  workingHours: WorkingHours[];
  settings: PracticeSettings;
}

export type AppView = 'dashboard' | 'calendar' | 'master-log' | 'patients' | 'reports' | 'ai-center' | 'consultants' | 'settings';

export interface ReportMetric {
  label: string;
  value: string | number;
  trend?: number;
}
