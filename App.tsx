
import React, { useState, useEffect, useMemo } from 'react';
import { ClinicData, AppView, Patient, PatientEntry, Consultant, UserRole, PracticeSettings, Appointment } from './types';
import { storageService } from './services/storageService';
import Dashboard from './components/Dashboard';
import PatientManager from './components/PatientManager';
import MasterLog from './components/MasterLog';
import AICenter from './components/AICenter';
import Reports from './components/Reports';
import ConsultantManager from './components/ConsultantManager';
import CostSettings from './components/CostSettings';
import CalendarView from './components/CalendarView';

const App: React.FC = () => {
  const [data, setData] = useState<ClinicData | null>(null);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [role, setRole] = useState<UserRole>('receptionist');
  const [showPinModal, setShowPinModal] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [recoveryError, setRecoveryError] = useState(false);

  useEffect(() => {
    const loadedData = storageService.getData();
    setData(loadedData);
  }, []);

  const allEntries = useMemo(() => {
    if (!data) return [];
    return data.patients
      .flatMap(p => p.records)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  const handleUpdateSettings = (settings: Partial<PracticeSettings>) => {
    const updated = storageService.updateSettings(settings);
    setData({...updated});
  };

  const handleAddPatient = (patient: Omit<Patient, 'records'>) => {
    const updated = storageService.addPatient(patient);
    setData({...updated});
  };

  const handleAddConsultant = (consultant: Consultant) => {
    const updated = storageService.addConsultant(consultant);
    setData({...updated});
  };

  const handleDeleteConsultant = (id: string) => {
    const updated = storageService.deleteConsultant(id);
    setData({...updated});
  };

  const handleAddAppointment = (app: Omit<Appointment, 'id'>) => {
    const updated = storageService.addAppointment(app);
    setData({...updated});
  };

  const handleDeleteAppointment = (id: string) => {
    const updated = storageService.deleteAppointment(id);
    setData({...updated});
  };

  const handleAddEntry = (patientId: string, entry: Omit<PatientEntry, 'id'>) => {
    const updated = storageService.addEntry(patientId, entry);
    const hits = parseInt(localStorage.getItem('medflow_api_hits') || '0') + 1;
    localStorage.setItem('medflow_api_hits', hits.toString());
    setData({...updated});
  };

  const handleToggleLock = (patientId: string) => {
    const updated = storageService.togglePatientLock(patientId);
    setData({...updated});
  };

  const handleRoleToggle = () => {
    if (role === 'receptionist') {
      setShowPinModal(true);
    } else {
      setRole('receptionist');
      setActiveView('dashboard');
    }
  };

  const verifyPin = () => {
    if (data && pinInput === data.settings.adminPin) {
      setRole('admin');
      setShowPinModal(false);
      setPinInput("");
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handleRecovery = () => {
    if (data && emailInput.toLowerCase() === data.settings.recoveryEmail.toLowerCase()) {
      setRecoveryMode(false);
      setRole('admin');
      setShowPinModal(false);
      setEmailInput("");
      setRecoveryError(false);
      setActiveView('settings');
      alert("Verification successful. Please update your Admin PIN in Practice Configuration.");
    } else {
      setRecoveryError(true);
    }
  };

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-black tracking-tight animate-pulse uppercase text-[10px]">Verifying Clinical Database...</p>
    </div>
  );

  const NavItem = ({ view, icon, label, adminOnly = false }: { view: AppView; icon: string; label: string, adminOnly?: boolean }) => {
    if (adminOnly && role !== 'admin') return null;
    return (
      <button
        onClick={() => setActiveView(view)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          activeView === view 
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <i className={`fas ${icon} w-5 text-center transition-transform group-hover:scale-110`}></i>
        <span className={`font-black text-[10px] uppercase tracking-widest ${!sidebarOpen && 'hidden'}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shadow-sm relative z-20 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 mb-6">
          <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-xl shadow-blue-100">
            <i className="fas fa-hand-holding-medical text-xl"></i>
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-black text-xl tracking-tighter text-slate-800 leading-none">MedFlow</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mt-1">CMS Edition</p>
            </div>
          )}
        </div>
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <NavItem view="dashboard" icon="fa-th-large" label="Clinic Overview" />
          <NavItem view="calendar" icon="fa-calendar-check" label="OPD Schedule" />
          <NavItem view="patients" icon="fa-id-badge" label="Case Registry" />
          <NavItem view="master-log" icon="fa-stream" label="Daily Activity" />
          
          {role === 'admin' && (
            <>
              <div className="pt-6 pb-2">
                <p className={`text-[9px] font-black text-slate-300 uppercase px-4 mb-2 tracking-widest ${!sidebarOpen && 'hidden'}`}>Medical Admin</p>
                <div className="border-t border-slate-100 mb-4 mx-2"></div>
                <NavItem view="consultants" icon="fa-user-doctor" label="Doctors List" adminOnly />
                <NavItem view="reports" icon="fa-chart-pie" label="Performance" adminOnly />
                <NavItem view="ai-center" icon="fa-bolt" label="Clinical AI" adminOnly />
                <NavItem view="settings" icon="fa-gears" label="Practice Config" adminOnly />
              </div>
            </>
          )}
        </nav>
        
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full h-10 rounded-xl text-slate-400 hover:bg-white hover:text-slate-600 border border-transparent hover:border-slate-200 transition-all">
            <i className={`fas ${sidebarOpen ? 'fa-angle-double-left' : 'fa-angle-double-right'}`}></i>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {data.settings.clinicName}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
               role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
             }`}>
               <i className={`fas ${role === 'admin' ? 'fa-user-tie' : 'fa-user'} mr-1`}></i>
               {role === 'admin' ? 'Doctor View' : 'Receptionist View'}
             </div>
             
             <button 
               onClick={handleRoleToggle}
               className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md"
             >
               <i className={`fas ${role === 'admin' ? 'fa-sign-out-alt' : 'fa-key'}`}></i>
               {role === 'admin' ? 'Exit Admin' : 'Admin Unlock'}
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
          <div className="p-8 max-w-7xl mx-auto">
            {activeView === 'dashboard' && <Dashboard data={data} allEntries={allEntries} />}
            {activeView === 'calendar' && (
              <CalendarView 
                appointments={data.appointments} 
                patients={data.patients}
                consultants={data.consultants}
                onAdd={handleAddAppointment}
                onDelete={handleDeleteAppointment}
              />
            )}
            {activeView === 'patients' && (
              <PatientManager 
                patients={data.patients} 
                consultants={data.consultants} 
                onAddPatient={handleAddPatient}
                onAddEntry={handleAddEntry}
                onToggleLock={handleToggleLock}
              />
            )}
            {activeView === 'master-log' && <MasterLog entries={allEntries} consultants={data.consultants} hideFees={role === 'receptionist'} />}
            {activeView === 'reports' && role === 'admin' && <Reports allEntries={allEntries} consultants={data.consultants} />}
            {activeView === 'ai-center' && role === 'admin' && <AICenter data={data} allEntries={allEntries} />}
            {activeView === 'consultants' && role === 'admin' && (
              <ConsultantManager 
                consultants={data.consultants} 
                onAdd={handleAddConsultant} 
                onDelete={handleDeleteConsultant}
              />
            )}
            {activeView === 'settings' && role === 'admin' && <CostSettings settings={data.settings} onUpdate={handleUpdateSettings} />}
          </div>
        </div>
      </main>

      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-slate-200 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl">
              <i className={`fas ${recoveryMode ? 'fa-envelope-open-text' : 'fa-lock'}`}></i>
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-2">
              {recoveryMode ? 'System Recovery' : 'Admin Verification'}
            </h3>
            <p className="text-xs font-medium text-slate-400 mb-6 uppercase tracking-widest">
              {recoveryMode ? 'Registered Recovery Email' : 'Enter 4-Digit Security PIN'}
            </p>
            
            {!recoveryMode ? (
              <>
                <input 
                  type="password"
                  maxLength={4}
                  className={`w-full text-center text-3xl tracking-[1em] font-black border-2 rounded-2xl p-4 mb-4 outline-none transition-all ${
                    pinError ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-500 focus:bg-blue-50/30'
                  }`}
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                  onKeyDown={(e) => e.key === 'Enter' && verifyPin()}
                  autoFocus
                />
                {pinError && <p className="text-xs font-bold text-red-500 mb-4 animate-shake">Invalid Credentials.</p>}
                <button 
                  onClick={() => setRecoveryMode(true)} 
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 hover:underline"
                >
                  Forgot Access PIN?
                </button>
              </>
            ) : (
              <>
                <input 
                  type="email"
                  placeholder="e.g. clinic@admin.com"
                  className={`w-full text-sm font-bold border-2 rounded-2xl p-4 mb-4 outline-none transition-all ${
                    recoveryError ? 'border-red-500 bg-red-50' : 'border-slate-100 focus:border-blue-500 focus:bg-blue-50/30'
                  }`}
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setRecoveryError(false); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleRecovery()}
                  autoFocus
                />
                {recoveryError && <p className="text-xs font-bold text-red-500 mb-4">Identity verification failed.</p>}
                <button 
                  onClick={() => setRecoveryMode(false)} 
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 hover:underline"
                >
                  Return to PIN Entry
                </button>
              </>
            )}
            
            <div className="flex gap-2">
              <button 
                onClick={() => { setShowPinModal(false); setPinInput(""); setEmailInput(""); setRecoveryMode(false); }} 
                className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={recoveryMode ? handleRecovery : verifyPin} 
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700"
              >
                {recoveryMode ? 'Verify Email' : 'Authenticate'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(5px); }
          50% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
