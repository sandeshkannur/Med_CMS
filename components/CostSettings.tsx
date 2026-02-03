
import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../utils/formatters';
import { PracticeSettings } from '../types';
import { storageService } from '../services/storageService';

interface CostSettingsProps {
  settings: PracticeSettings;
  onUpdate: (settings: Partial<PracticeSettings>) => void;
}

const CostSettings: React.FC<CostSettingsProps> = ({ settings, onUpdate }) => {
  const [usageCount, setUsageCount] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('medflow_api_hits');
    if (stored) setUsageCount(parseInt(stored));
  }, []);

  const FREE_TIER_LIMIT = 1500;
  const usagePercent = Math.min((usageCount / FREE_TIER_LIMIT) * 100, 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setEditMode(false);
  };

  const handleExport = () => {
    storageService.exportDatabase();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (confirm("Importing a backup will OVERWRITE all current data. Proceed?")) {
        try {
          await storageService.importDatabase(file);
          window.location.reload(); // Reload to refresh all components with new data
        } catch (err: any) {
          alert(err.message);
        }
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Practice Configuration</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Management Controls for the Chief Doctor</p>
        </div>
        <button 
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            editMode ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'
          }`}
        >
          {editMode ? 'Cancel Edit' : 'Modify Security Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Security Section */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <i className="fas fa-shield-alt text-blue-600"></i>
              Security & Identity
            </h4>
            
            {editMode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Clinic Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold"
                    value={formData.clinicName}
                    onChange={e => setFormData({...formData, clinicName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Admin Security PIN (4 Digits)</label>
                  <input 
                    type="password" 
                    maxLength={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold tracking-widest"
                    value={formData.adminPin}
                    onChange={e => setFormData({...formData, adminPin: e.target.value.replace(/\D/g,'')})}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Recovery Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold"
                    value={formData.recoveryEmail}
                    onChange={e => setFormData({...formData, recoveryEmail: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest mt-4">
                  Commit Security Changes
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                   <span className="text-xs font-bold text-slate-500 uppercase">Practice Title</span>
                   <span className="text-sm font-black text-slate-800">{settings.clinicName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                   <span className="text-xs font-bold text-slate-500 uppercase">Recovery Email</span>
                   <span className="text-sm font-black text-slate-800">{settings.recoveryEmail}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                   <span className="text-xs font-bold text-slate-500 uppercase">PIN Status</span>
                   <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-black">ACTIVE & PROTECTED</span>
                </div>
              </div>
            )}
          </div>

          {/* Backup & Vault Section */}
          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-all"></div>
            <h4 className="font-black text-[10px] text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <i className="fas fa-vault"></i>
              Clinical Data Vault
            </h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Since MedFlow stores data in your browser, clearing your history will delete records. <span className="text-white font-bold">Download a backup file weekly</span> to keep your clinic safe.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleExport}
                className="bg-white text-slate-900 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-file-export"></i>
                Export Backup
              </button>
              <button 
                onClick={handleImportClick}
                className="bg-slate-800 text-white border border-slate-700 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-file-import"></i>
                Restore Data
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".json"
              />
            </div>
            <p className="text-[9px] text-slate-500 mt-4 text-center italic font-medium">
              Last auto-save: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Allowance Monitor */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800">Practice Economics</h4>
                <p className="text-xs text-slate-400">Monthly AI Allowance Monitor</p>
              </div>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                ₹0 / Monthly Budget
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>AI Consultations Used</span>
                <span>{usageCount} / {FREE_TIER_LIMIT}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
                  style={{ width: `${usagePercent}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Usage Reset: Your 1,500 monthly limit refreshes on the 1st of every month.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4">
               <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  <h5 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fas fa-thumbs-up"></i> Do's for ₹0 Practice
                  </h5>
                  <ul className="text-[10px] text-emerald-800/80 space-y-2 font-medium">
                    <li>• <span className="font-bold">Be Precise:</span> Ask "How many RCT sittings today?" instead of broad questions.</li>
                    <li>• <span className="font-bold">Clean Records:</span> Delete duplicate patient files to keep AI analysis fast and cheap.</li>
                    <li>• <span className="font-bold">Single Refreshes:</span> Use the 'Refresh Summary' button only after adding new sittings.</li>
                  </ul>
               </div>

               <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                  <h5 className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i> Don'ts (Saves Usage)
                  </h5>
                  <ul className="text-[10px] text-rose-800/80 space-y-2 font-medium">
                    <li>• <span className="font-bold">Avoid Speeding:</span> Don't send more than 10 AI questions in 1 minute.</li>
                    <li>• <span className="font-bold">Irrelevant Data:</span> Don't paste large non-medical texts into the AI query box.</li>
                    <li>• <span className="font-bold">Redundant Clicks:</span> Don't repeatedly ask the same clinical question in one session.</li>
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSettings;
