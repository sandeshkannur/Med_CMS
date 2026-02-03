
import { ClinicData, Consultant } from './types';

export const CONSULTANTS: Consultant[] = [
  { id: '1', name: 'Dr. Sameer Verma', specialty: 'MDS - Endodontics', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: '2', name: 'Dr. Anjali Mehta', specialty: 'BPT - Physiotherapist', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: '3', name: 'Dr. Karan Shah', specialty: 'MDS - Orthodontics', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: '4', name: 'Dr. Ritu Hegde', specialty: 'MPT - Sports Rehab', color: 'bg-amber-100 text-amber-700 border-amber-200' }
];

export const PROCEDURES = [
  'Dental Consultation',
  'RCT (Root Canal Treatment)',
  'Scaling & Polishing',
  'Dental Filling / Restoration',
  'Physiotherapy Session',
  'Manual Therapy & Mobilization',
  'Dry Needling / TENS',
  'Post-Op Rehabilitation',
  'Tooth Extraction',
  'Orthodontic Adjustment'
];

export const INITIAL_DATA: ClinicData = {
  patients: [
    {
      id: 'p1',
      name: 'Rajesh Khanna',
      phone: '+91 98200-12345',
      email: 'rajesh.k@example.in',
      records: [
        {
          id: 'e1',
          date: '2024-03-01',
          patientName: 'Rajesh Khanna',
          consultant: 'Dr. Sameer Verma',
          procedure: 'RCT (Root Canal Treatment)',
          diagnosis: 'Acute Irreversible Pulpitis',
          notes: 'First sitting completed. Access opening done. BMP initiated.',
          fee: 2500,
          status: 'Completed'
        }
      ]
    }
  ],
  consultants: CONSULTANTS,
  appointments: [],
  workingHours: CONSULTANTS.map(c => ({
    consultantId: c.id,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    start: '10:00',
    end: '19:00'
  })),
  settings: {
    adminPin: "1234",
    recoveryEmail: "admin@smileandspine.in",
    clinicName: "Smile & Spine Dental-Physio Centre"
  }
};
