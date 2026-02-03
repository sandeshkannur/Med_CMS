
import { ClinicData, Patient, PatientEntry, Consultant, PracticeSettings, Appointment } from '../types';
import { INITIAL_DATA } from '../constants';

const STORAGE_KEY = 'medflow_clinic_data';

export const storageService = {
  getData: (): ClinicData => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      storageService.saveData(INITIAL_DATA);
      return INITIAL_DATA;
    }
    try {
      const parsed = JSON.parse(data);
      if (!parsed.settings) parsed.settings = INITIAL_DATA.settings;
      if (!parsed.appointments) parsed.appointments = [];
      if (!parsed.workingHours) parsed.workingHours = INITIAL_DATA.workingHours;
      if (!parsed.patients) parsed.patients = [];
      if (!parsed.consultants) parsed.consultants = INITIAL_DATA.consultants;
      
      return parsed;
    } catch (e) {
      console.error("Database corrupted, resetting to safe defaults.");
      return INITIAL_DATA;
    }
  },

  saveData: (data: ClinicData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  exportDatabase: () => {
    const data = storageService.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  importDatabase: (file: File): Promise<ClinicData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.settings && parsed.patients) {
            storageService.saveData(parsed);
            resolve(parsed);
          } else {
            reject(new Error("Invalid backup file structure."));
          }
        } catch (err) {
          reject(new Error("Failed to read backup file."));
        }
      };
      reader.readAsText(file);
    });
  },

  updateSettings: (newSettings: Partial<PracticeSettings>) => {
    const data = storageService.getData();
    data.settings = { ...data.settings, ...newSettings };
    storageService.saveData(data);
    return data;
  },

  addPatient: (patient: Omit<Patient, 'records'>) => {
    const data = storageService.getData();
    const newPatient: Patient = { ...patient, records: [], isLocked: false };
    data.patients.push(newPatient);
    storageService.saveData(data);
    return data;
  },

  addAppointment: (app: Omit<Appointment, 'id'>) => {
    const data = storageService.getData();
    const newApp: Appointment = {
      ...app,
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    data.appointments.push(newApp);
    storageService.saveData(data);
    return data;
  },

  deleteAppointment: (id: string) => {
    const data = storageService.getData();
    data.appointments = data.appointments.filter(a => a.id !== id);
    storageService.saveData(data);
    return data;
  },

  addConsultant: (consultant: Consultant) => {
    const data = storageService.getData();
    data.consultants.push(consultant);
    storageService.saveData(data);
    return data;
  },

  deleteConsultant: (id: string) => {
    const data = storageService.getData();
    data.appointments = data.appointments.filter(a => a.consultantId !== id);
    data.consultants = data.consultants.filter(c => c.id !== id);
    storageService.saveData(data);
    return data;
  },

  togglePatientLock: (patientId: string) => {
    const data = storageService.getData();
    const patient = data.patients.find(p => p.id === patientId);
    if (patient) {
      patient.isLocked = !patient.isLocked;
      storageService.saveData(data);
    }
    return data;
  },

  addEntry: (patientId: string, entry: Omit<PatientEntry, 'id'>) => {
    const data = storageService.getData();
    const patient = data.patients.find(p => p.id === patientId);
    if (!patient) throw new Error('Patient case sheet not found.');
    if (patient.isLocked) throw new Error('File Locked: Unlock case sheet to add sittings.');

    const newEntry: PatientEntry = {
      ...entry,
      id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const isDuplicate = patient.records.some(r => 
      r.date === newEntry.date && 
      r.procedure === newEntry.procedure && 
      r.consultant === newEntry.consultant
    );

    if (isDuplicate) {
      throw new Error('This procedure has already been logged for this patient on this date.');
    }

    patient.records.push(newEntry);
    storageService.saveData(data);
    return data;
  }
};
