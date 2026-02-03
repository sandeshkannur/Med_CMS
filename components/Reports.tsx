
import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { PatientEntry, Consultant } from '../types';
import { formatCurrency, formatDateDisplay } from '../utils/formatters';

interface ReportsProps {
  allEntries: PatientEntry[];
  consultants: Consultant[];
}

const Reports: React.FC<ReportsProps> = ({ allEntries }) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const filtered = allEntries.filter(e => {
      const entryDate = new Date(e.date);
      if (period === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return entryDate >= weekAgo;
      } else {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return entryDate >= monthAgo;
      }
    });

    const totalRevenue = filtered.reduce((sum, e) => sum + (e.fee || 0), 0);
    const volumeByDay: Record<string, number> = {};
    filtered.forEach(e => {
      volumeByDay[e.date] = (volumeByDay[e.date] || 0) + 1;
    });

    const chartData = Object.keys(volumeByDay).sort().map(date => ({ date, count: volumeByDay[date] }));

    return { filtered, chartData, totalRevenue };
  }, [allEntries, period]);

  const handleExportCSV = () => {
    const headers = ["Date", "Patient Name", "Consultant", "Procedure", "Fee (INR)", "Status"];
    const rows = stats.filtered.map(e => [
      formatDateDisplay(e.date),
      e.patientName,
      e.consultant,
      e.procedure,
      e.fee || 0,
      e.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(r => r.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `medflow_revenue_report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Practice Revenue Analytics</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Detailed treatment financial audit</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleExportCSV}
             className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 flex items-center gap-2 hover:bg-emerald-700 transition-all"
           >
             <i className="fas fa-file-excel"></i>
             Export Billing CSV
           </button>
           <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
            <button 
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${period === 'weekly' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${period === 'monthly' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 text-blue-600 text-4xl transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
            <i className="fas fa-indian-rupee-sign"></i>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Collection (₹)</p>
          <h4 className="text-2xl font-black mt-1 text-blue-600">{formatCurrency(stats.totalRevenue)}</h4>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Case Sittings</p>
          <h4 className="text-2xl font-black mt-1 text-slate-800">{stats.filtered.length}</h4>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion Rate</p>
          <h4 className="text-2xl font-black mt-1 text-emerald-600">
            {Math.round((stats.filtered.filter(e => e.status === 'Completed').length / (stats.filtered.length || 1)) * 100)}%
          </h4>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Session Revenue</p>
          <h4 className="text-2xl font-black mt-1 text-slate-800">{formatCurrency(stats.totalRevenue / (stats.filtered.length || 1))}</h4>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
          <i className="fas fa-chart-line text-blue-500"></i>
          Daily Sitting Volume
        </h4>
        <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
          {hasMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis 
                  allowDecimals={false} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8'}} 
                  label={{ value: 'Sittings', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                  formatter={(value) => [`${value} Sittings`, 'Volume']}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full">
               <span className="text-[10px] font-bold text-slate-300 animate-pulse uppercase tracking-widest">Preparing Revenue Data...</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
