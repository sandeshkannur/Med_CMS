
import React, { useState, useMemo } from 'react';
import { Patient, Consultant, PatientEntry } from '../types';
import { PROCEDURES } from '../constants';
import { formatDateDisplay, formatCurrency } from '../utils/formatters';

interface PatientManagerProps {
  patients: Patient[];
  consultants: Consultant[];
  onAddPatient: (patient: Omit<Patient, 'records'>) => void;
  onAddEntry: (patientId: string, entry: Omit<PatientEntry, 'id'>) => void;
  onToggleLock: (patientId: string) => void;
}

const PatientManager: React.FC<PatientManagerProps> = ({ patients, consultants, onAddPatient, onAddEntry, onToggleLock }) => {
  const [activePatientId, setActivePatientId] = useState<string | null>(patients[0]?.id || null);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activePatient = useMemo(() => patients.find(p => p.id === activePatientId), [patients, activePatientId]);
  
  const sortedRecords = useMemo(() => {
    if (!activePatient) return [];
    return [...activePatient.records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activePatient]);

  const [newPatient, setNewPatient] = useState({ name: '', phone: '', email: '' });
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    consultant: consultants[0].name,
    procedure: PROCEDURES[0],
    diagnosis: '',
    notes: '',
    fee: 500,
    status: 'Completed' as const
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPatient({ id: `p-${Date.now()}`, ...newPatient });
    setNewPatient({ name: '', phone: '', email: '' });
    setShowNewPatientModal(false);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatientId) return;
    setErrorMsg(null);
    try {
      onAddEntry(activePatientId, {
        ...newEntry,
        patientName: activePatient?.name || ''
      });
      setShowNewEntryModal(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-fit shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500">OPD Desk</h4>
          <button 
            onClick={() => setShowNewPatientModal(true)}
            className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {patients.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePatientId(p.id)}
              className={`w-full text-left p-4 border-b border-slate-50 last:border-0 hover:bg-blue-50 transition-all ${activePatientId === p.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">{p.phone}</p>
                </div>
                {p.isLocked && <i className="fas fa-lock text-[10px] text-slate-300 mt-1"></i>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-3 space-y-6">
        {activePatient ? (
          <>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${activePatient.isLocked ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                  <i className={`fas ${activePatient.isLocked ? 'fa-lock' : 'fa-user'}`}></i>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    {activePatient.name}
                    {activePatient.isLocked && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-widest">File Locked</span>}
                  </h2>
                  <div className="flex flex-wrap gap-4 mt-1 text-xs text-slate-500 font-medium">
                    <span><i className="fas fa-phone mr-1.5 opacity-50"></i>{activePatient.phone}</span>
                    <span><i className="fas fa-envelope mr-1.5 opacity-50"></i>{activePatient.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleLock(activePatient.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                    activePatient.isLocked 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fas ${activePatient.isLocked ? 'fa-unlock' : 'fa-lock'} mr-2`}></i>
                  {activePatient.isLocked ? 'Unlock Case Sheet' : 'Lock Case Sheet'}
                </button>
                <button
                  disabled={activePatient.isLocked}
                  onClick={() => setShowNewEntryModal(true)}
                  className={`px-4 py-2 rounded-lg font-bold shadow-sm transition-all text-sm flex items-center gap-2 ${
                    activePatient.isLocked 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  <i className="fas fa-plus"></i>
                  New Treatment Sitting
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-700 uppercase tracking-widest">Case History & Sittings</h3>
                <span className="text-[10px] font-bold text-slate-400">{activePatient.records.length} sessions logged</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                      <th className="px-6 py-4 font-bold uppercase text-[10px]">Date</th>
                      <th className="px-6 py-4 font-bold uppercase text-[10px]">Consultant</th>
                      <th className="px-6 py-4 font-bold uppercase text-[10px]">Procedure</th>
                      <th className="px-6 py-4 font-bold uppercase text-[10px]">Clinical Impression</th>
                      <th className="px-6 py-4 font-bold uppercase text-[10px]">Fee (₹)</th>
                      <th className="px-6 py-4 font-bold uppercase text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sortedRecords.map(record => (
                      <tr key={record.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500">{formatDateDisplay(record.date)}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{record.consultant}</td>
                        <td className="px-6 py-4 text-slate-600">{record.procedure}</td>
                        <td className="px-6 py-4 italic text-slate-500">{record.diagnosis}</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{formatCurrency(record.fee || 0)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                            record.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            record.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {activePatient.records.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-300 italic">
                          No treatment sessions found for this patient.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12 bg-white rounded-xl border border-dashed border-slate-200">
            <i className="fas fa-file-medical text-5xl mb-4 opacity-10"></i>
            <p className="font-medium">Select a patient case sheet from the desk</p>
          </div>
        )}
      </div>

      {/* New Patient Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">New Patient Registration</h3>
              <button onClick={() => setShowNewPatientModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreatePatient} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Patient Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none transition-all text-sm font-medium"
                  value={newPatient.name}
                  onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                  placeholder="e.g. Mrs. Sunita Sharma"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp / Contact Number</label>
                <input
                  required
                  type="tel"
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none transition-all text-sm font-medium"
                  value={newPatient.phone}
                  onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email (Optional)</label>
                <input
                  type="email"
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none transition-all text-sm font-medium"
                  value={newPatient.email}
                  onChange={e => setNewPatient({...newPatient, email: e.target.value})}
                  placeholder="patient@email.in"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                Create Treatment File
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      {showNewEntryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Add Session: {activePatient?.name}</h3>
              <button onClick={() => { setShowNewEntryModal(false); setErrorMsg(null); }} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100">
                <i className="fas fa-times"></i>
              </button>
            </div>
            {errorMsg && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-xs font-bold animate-shake">
                <i className="fas fa-exclamation-triangle"></i>
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleCreateEntry} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sitting Date</label>
                  <input
                    required
                    type="date"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium"
                    value={newEntry.date}
                    onChange={e => setNewEntry({...newEntry, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Consultant Doctor</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium appearance-none"
                    value={newEntry.consultant}
                    onChange={e => setNewEntry({...newEntry, consultant: e.target.value})}
                  >
                    {consultants.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Procedure Code</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium appearance-none"
                    value={newEntry.procedure}
                    onChange={e => setNewEntry({...newEntry, procedure: e.target.value})}
                  >
                    {PROCEDURES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Clinical Impression</label>
                  <input
                    required
                    type="text"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium"
                    value={newEntry.diagnosis}
                    onChange={e => setNewEntry({...newEntry, diagnosis: e.target.value})}
                    placeholder="e.g. Class I Caries"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Session Fee (₹)</label>
                <input
                  required
                  type="number"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium"
                  value={newEntry.fee}
                  onChange={e => setNewEntry({...newEntry, fee: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Procedure Notes</label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl p-3 h-24 text-sm font-medium resize-none"
                  value={newEntry.notes}
                  onChange={e => setNewEntry({...newEntry, notes: e.target.value})}
                  placeholder="e.g. Tooth #36 RCT sitting 1 done. Next sitting for obturation."
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                Log Sitting
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManager;
