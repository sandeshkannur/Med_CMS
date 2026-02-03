
import React, { useState, useMemo } from 'react';
import { PatientEntry, Consultant } from '../types';
import { PROCEDURES } from '../constants';
import { formatDateDisplay, formatCurrency } from '../utils/formatters';

interface MasterLogProps {
  entries: PatientEntry[];
  consultants: Consultant[];
  hideFees?: boolean;
}

const MasterLog: React.FC<MasterLogProps> = ({ entries, consultants, hideFees = false }) => {
  const [filter, setFilter] = useState({
    search: '',
    consultant: '',
    procedure: '',
    dateRange: 'all'
  });

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = 
        e.patientName.toLowerCase().includes(filter.search.toLowerCase()) ||
        e.diagnosis.toLowerCase().includes(filter.search.toLowerCase());
      
      const matchesConsultant = !filter.consultant || e.consultant === filter.consultant;
      const matchesProcedure = !filter.procedure || e.procedure === filter.procedure;

      let matchesDate = true;
      if (filter.dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = new Date(e.date) >= weekAgo;
      } else if (filter.dateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = new Date(e.date) >= monthAgo;
      }

      return matchesSearch && matchesConsultant && matchesProcedure && matchesDate;
    });
  }, [entries, filter]);

  const getConsultantColor = (name: string) => {
    const c = consultants.find(cons => cons.name === name);
    return c?.color || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search patient, ID or diagnosis..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={filter.search}
            onChange={e => setFilter({...filter, search: e.target.value})}
          />
        </div>
        <select
          className="p-2 border border-slate-200 rounded-lg text-sm outline-none"
          value={filter.consultant}
          onChange={e => setFilter({...filter, consultant: e.target.value})}
        >
          <option value="">All Doctors</option>
          {consultants.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select
          className="p-2 border border-slate-200 rounded-lg text-sm outline-none"
          value={filter.procedure}
          onChange={e => setFilter({...filter, procedure: e.target.value})}
        >
          <option value="">All Procedures</option>
          {PROCEDURES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Date</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Patient</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Doctor</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Procedure</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase">Diagnosis</th>
                {!hideFees && <th className="px-6 py-4 font-bold text-[10px] uppercase">Fee Paid</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{formatDateDisplay(entry.date)}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{entry.patientName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getConsultantColor(entry.consultant)}`}>
                      {entry.consultant}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{entry.procedure}</td>
                  <td className="px-6 py-4 italic font-medium">{entry.diagnosis}</td>
                  {!hideFees && <td className="px-6 py-4 font-bold text-slate-700">{formatCurrency(entry.fee || 0)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MasterLog;
