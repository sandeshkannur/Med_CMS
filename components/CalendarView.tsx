
import React, { useState, useMemo } from 'react';
import { Appointment, Patient, Consultant } from '../types';
import { formatDateDisplay } from '../utils/formatters';

interface CalendarViewProps {
  appointments: Appointment[];
  patients: Patient[];
  consultants: Consultant[];
  onAdd: (app: Omit<Appointment, 'id'>) => void;
  onDelete: (id: string) => void;
}

type ViewMode = 'day' | 'week' | 'month';

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, patients, consultants, onAdd, onDelete }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [showModal, setShowModal] = useState(false);
  const [filterConsultant, setFilterConsultant] = useState('');

  const [newApp, setNewApp] = useState({
    patientId: '',
    consultantId: consultants[0]?.id || '',
    startTime: '10:00',
    endTime: '10:30',
    totalSittings: 1,
    notes: ''
  });

  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  // Navigation Logic
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const setToday = () => setSelectedDate(new Date());

  // Filtering Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      // Validate that patient and consultant still exist
      const pExists = patients.some(p => p.id === a.patientId);
      const cExists = consultants.some(c => c.id === a.consultantId);
      if (!pExists || !cExists) return false;

      const matchesConsultant = !filterConsultant || a.consultantId === filterConsultant;
      return matchesConsultant;
    });
  }, [appointments, patients, consultants, filterConsultant]);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === newApp.patientId);
    const consultant = consultants.find(c => c.id === newApp.consultantId);
    
    if (!patient || !consultant) return;

    for (let i = 1; i <= newApp.totalSittings; i++) {
      const appDate = new Date(selectedDate);
      appDate.setDate(appDate.getDate() + (i - 1) * 7); 
      
      onAdd({
        patientId: patient.id,
        patientName: patient.name,
        consultantId: consultant.id,
        consultantName: consultant.name,
        date: appDate.toISOString().split('T')[0],
        startTime: newApp.startTime,
        endTime: newApp.endTime,
        sittingNumber: i,
        totalSittings: newApp.totalSittings,
        notes: newApp.notes
      });
    }

    setShowModal(false);
  };

  const getConsultantColor = (id: string) => {
    const c = consultants.find(cons => cons.id === id);
    return c?.color || 'bg-slate-100 text-slate-700';
  };

  // Rendering Helpers
  const renderDayView = () => {
    const apps = filteredAppointments
      .filter(a => a.date === selectedDateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
      <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Slot</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{formatDateDisplay(selectedDateStr)}</span>
        </div>
        {apps.length > 0 ? apps.map(app => (
          <div key={app.id} className="p-6 flex items-center gap-6 group hover:bg-slate-50 transition-all">
            <div className="w-20 text-center">
              <p className="text-sm font-black text-slate-800">{app.startTime}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{app.endTime}</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-black text-slate-800">{app.patientName}</h4>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">
                  Sitting {app.sittingNumber}/{app.totalSittings}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getConsultantColor(app.consultantId)}`}>
                  {app.consultantName}
                </span>
                {app.notes && <p className="text-xs text-slate-400 italic truncate max-w-xs">"{app.notes}"</p>}
              </div>
            </div>
            <button 
              onClick={() => onDelete(app.id)}
              className="w-10 h-10 rounded-xl bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
            >
              <i className="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300">
            <i className="far fa-calendar-times text-5xl mb-4 opacity-10"></i>
            <p className="font-bold text-sm">No sittings found for this day</p>
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Sunday start

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {days.map(day => {
          const dStr = day.toISOString().split('T')[0];
          const isToday = dStr === new Date().toISOString().split('T')[0];
          const apps = filteredAppointments.filter(a => a.date === dStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
          
          return (
            <div key={dStr} className={`bg-white min-h-[400px] flex flex-col ${isToday ? 'bg-blue-50/20' : ''}`}>
              <div className={`p-3 text-center border-b border-slate-100 ${isToday ? 'bg-blue-600 text-white' : 'bg-slate-50'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-lg font-black leading-none mt-1">{day.getDate()}</p>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar max-h-[500px]">
                {apps.map(app => (
                  <div key={app.id} className="p-2 rounded-lg bg-white border border-slate-100 shadow-sm relative group cursor-default hover:border-blue-300 transition-all">
                    <p className="text-[10px] font-black text-slate-800 truncate">{app.patientName}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[8px] font-bold text-slate-400">{app.startTime}</span>
                      <span className={`w-2 h-2 rounded-full ${getConsultantColor(app.consultantId).split(' ')[0]}`}></span>
                    </div>
                  </div>
                ))}
                {apps.length === 0 && <div className="h-full flex items-center justify-center opacity-10"><i className="fas fa-calendar-plus text-2xl"></i></div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const startDay = startOfMonth.getDay();

    const calendarGrid = [];
    // Padding for start day
    for (let i = 0; i < startDay; i++) calendarGrid.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarGrid.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-slate-100">
          {calendarGrid.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="bg-white min-h-[100px]" />;
            
            const dStr = day.toISOString().split('T')[0];
            const isToday = dStr === new Date().toISOString().split('T')[0];
            const apps = filteredAppointments.filter(a => a.date === dStr);

            return (
              <div key={dStr} className={`bg-white min-h-[100px] p-2 hover:bg-slate-50 transition-all ${isToday ? 'bg-blue-50/10 ring-1 ring-inset ring-blue-100' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-400'}`}>
                    {day.getDate()}
                  </span>
                  {apps.length > 0 && <span className="text-[8px] font-black text-blue-600">{apps.length} sittings</span>}
                </div>
                <div className="space-y-1">
                  {apps.slice(0, 3).map(app => (
                    <div key={app.id} className="text-[9px] font-bold truncate p-1 bg-slate-50 border border-slate-100 rounded text-slate-600">
                      {app.startTime} {app.patientName}
                    </div>
                  ))}
                  {apps.length > 3 && <p className="text-[8px] text-slate-400 font-bold text-center">+{apps.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Clinical Scheduler</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage specialist sittings & availability</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* Navigation */}
          <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
            <button onClick={() => navigate('prev')} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button onClick={setToday} className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
              Today
            </button>
            <button onClick={() => navigate('next')} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-1 flex shadow-sm">
            {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === mode ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex-1 lg:flex-none">
            <select 
              className="w-full lg:w-48 p-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white outline-none focus:ring-4 focus:ring-blue-50 transition-all appearance-none"
              value={filterConsultant}
              onChange={e => setFilterConsultant(e.target.value)}
            >
              <option value="">All Specialists</option>
              {consultants.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Book Sitting
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 group">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-sm tracking-tight">AI Schedule Sync</h4>
              <i className="fas fa-bolt text-amber-400 animate-pulse"></i>
            </div>
            <p className="text-[10px] opacity-80 mb-6 leading-relaxed">
              Paste your Google Calendar day summary here. Our AI blocks these slots locally.
            </p>
            <textarea 
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-[10px] placeholder:text-white/30 focus:bg-white/20 outline-none h-32 resize-none transition-all"
              placeholder="e.g. Surgery at City Dental 2pm-5pm..."
            ></textarea>
            <button className="w-full mt-4 bg-white text-indigo-700 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform">
              Sync Availability
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4">Duty Status</h4>
            <div className="space-y-4">
              {consultants.map(c => (
                <div key={c.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <div className="max-w-[140px]">
                    <p className="text-xs font-black text-slate-800 truncate">{c.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">10:00 - 19:00</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-emerald-600 uppercase">On-Duty</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <i className="fas fa-calendar-check text-blue-600"></i>
                Schedule Treatment
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleBooking} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Select Patient</label>
                <select 
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none appearance-none bg-slate-50"
                  value={newApp.patientId}
                  onChange={e => setNewApp({...newApp, patientId: e.target.value})}
                >
                  <option value="">Choose Case Sheet...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Specialist</label>
                  <select 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none appearance-none bg-slate-50"
                    value={newApp.consultantId}
                    onChange={e => setNewApp({...newApp, consultantId: e.target.value})}
                  >
                    {consultants.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Sittings</label>
                  <input 
                    type="number" 
                    min="1"
                    max="12"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none bg-slate-50"
                    value={newApp.totalSittings}
                    onChange={e => setNewApp({...newApp, totalSittings: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Start Time</label>
                  <input 
                    required
                    type="time" 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none bg-slate-50"
                    value={newApp.startTime}
                    onChange={e => setNewApp({...newApp, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">End Time</label>
                  <input 
                    required
                    type="time" 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none bg-slate-50"
                    value={newApp.endTime}
                    onChange={e => setNewApp({...newApp, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Short Notes</label>
                <input 
                  type="text"
                  placeholder="e.g. Prep for RCT Stage 2"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none bg-slate-50"
                  value={newApp.notes}
                  onChange={e => setNewApp({...newApp, notes: e.target.value})}
                />
              </div>
              <p className="text-[10px] text-blue-600 font-bold bg-blue-50 p-3 rounded-xl leading-relaxed">
                <i className="fas fa-info-circle mr-1"></i> Multi-sitting plans reserve slots at the same time every week from the selected start date.
              </p>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition-all">
                Confirm Treatment Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
