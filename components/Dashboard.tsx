
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { ClinicData, PatientEntry } from '../types';
import { formatDateDisplay } from '../utils/formatters';

interface DashboardProps {
  data: ClinicData;
  allEntries: PatientEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ data, allEntries }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const metrics = useMemo(() => {
    const totalPatients = data.patients.length;
    const totalConsultations = allEntries.length;
    const thisMonth = new Date().getMonth();
    const monthlyConsultations = allEntries.filter(e => new Date(e.date).getMonth() === thisMonth).length;
    return { totalPatients, totalConsultations, monthlyConsultations };
  }, [data, allEntries]);

  const chartData = useMemo(() => {
    const consultantCounts = allEntries.reduce((acc: any, curr) => {
      acc[curr.consultant] = (acc[curr.consultant] || 0) + 1;
      return acc;
    }, {});
    const consultantChart = Object.keys(consultantCounts).map(name => ({
      name: name.split(' ').pop(),
      value: consultantCounts[name]
    }));
    const procedureCounts = allEntries.reduce((acc: any, curr) => {
      acc[curr.procedure] = (acc[curr.procedure] || 0) + 1;
      return acc;
    }, {});
    const procedureChart = Object.keys(procedureCounts).map(name => ({
      name,
      value: procedureCounts[name]
    })).sort((a, b) => b.value - a.value).slice(0, 5);
    return { consultantChart, procedureChart };
  }, [allEntries]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Case Files</p>
          <h3 className="text-3xl font-black mt-1 text-slate-800">{metrics.totalPatients}</h3>
          <div className="mt-2 text-xs text-emerald-600 font-bold">
            <i className="fas fa-users mr-1"></i> Unique Patients
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Clinical Sittings</p>
          <h3 className="text-3xl font-black mt-1 text-slate-800">{metrics.totalConsultations}</h3>
          <div className="mt-2 text-xs text-slate-400 font-medium">Completed Sessions</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OPD Sittings (This Month)</p>
          <h3 className="text-3xl font-black mt-1 text-blue-600">{metrics.monthlyConsultations}</h3>
          <div className="mt-2 text-xs text-slate-400 font-medium">Monthly Progress</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
          <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-6">Patient Sittings by Specialist</h4>
          <div className="h-[300px] w-full relative">
            {hasMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.consultantChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis 
                    allowDecimals={false} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10}} 
                    label={{ value: 'Sittings', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} 
                    formatter={(value) => [`${value} Sittings`, 'Consultations']}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-[10px] font-bold text-slate-300 animate-pulse uppercase tracking-widest">Calculating Analytics...</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
          <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-6">Top Treatment Categories</h4>
          <div className="h-[300px] w-full relative">
            {hasMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.procedureChart}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartData.procedureChart.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Sessions`, 'Frequency']} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-[10px] font-bold text-slate-300 animate-pulse uppercase tracking-widest">Generating Metrics...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Recent OPD Sittings</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 font-black uppercase text-[10px]">Date</th>
                <th className="px-6 py-4 font-black uppercase text-[10px]">Patient Name</th>
                <th className="px-6 py-4 font-black uppercase text-[10px]">Consultant Doctor</th>
                <th className="px-6 py-4 font-black uppercase text-[10px]">Clinical Impression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allEntries.slice(0, 5).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{formatDateDisplay(entry.date)}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{entry.patientName}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{entry.consultant}</td>
                  <td className="px-6 py-4 text-slate-500 italic">{entry.diagnosis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
