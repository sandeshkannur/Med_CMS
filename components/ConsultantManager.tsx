
import React, { useState } from 'react';
import { Consultant } from '../types';

interface ConsultantManagerProps {
  consultants: Consultant[];
  onAdd: (consultant: Consultant) => void;
  onDelete: (id: string) => void;
}

const ConsultantManager: React.FC<ConsultantManagerProps> = ({ consultants, onAdd, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: 'Dr. ', specialty: '', color: 'bg-blue-100 text-blue-700' });

  const colors = [
    { label: 'Blue', value: 'bg-blue-100 text-blue-700' },
    { label: 'Emerald', value: 'bg-emerald-100 text-emerald-700' },
    { label: 'Purple', value: 'bg-purple-100 text-purple-700' },
    { label: 'Amber', value: 'bg-amber-100 text-amber-700' },
    { label: 'Rose', value: 'bg-rose-100 text-rose-700' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: `c-${Date.now()}`, ...newDoctor });
    setShowModal(false);
    setNewDoctor({ name: 'Dr. ', specialty: '', color: 'bg-blue-100 text-blue-700' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Medical Team Management</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Directory of consultants & specialists</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <i className="fas fa-user-md"></i> Add New Consultant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultants.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
             <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${c.color}`}>
                  <i className="fas fa-user-doctor"></i>
                </div>
                <div>
                  <h4 className="font-black text-slate-800">{c.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{c.specialty}</p>
                </div>
             </div>
             <button 
               onClick={() => onDelete(c.id)}
               className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 hover:text-white"
             >
               <i className="fas fa-trash-alt text-xs"></i>
             </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800">Add Doctor to Practice</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Doctor's Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-50 text-sm font-bold"
                  value={newDoctor.name}
                  onChange={e => setNewDoctor({...newDoctor, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Specialty</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Cardiologist"
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-50 text-sm font-bold"
                  value={newDoctor.specialty}
                  onChange={e => setNewDoctor({...newDoctor, specialty: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">UI Highlight Color</label>
                <div className="flex gap-3">
                  {colors.map(col => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setNewDoctor({...newDoctor, color: col.value})}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${col.value} ${newDoctor.color === col.value ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700">
                Register Specialist
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantManager;
