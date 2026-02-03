
import React, { useState } from 'react';
import { ClinicData, PatientEntry } from '../types';
import { geminiService } from '../services/geminiService';

interface AICenterProps {
  data: ClinicData;
  allEntries: PatientEntry[];
}

const AICenter: React.FC<AICenterProps> = ({ data, allEntries }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [smartSummary, setSmartSummary] = useState('');

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    setGroundingLinks([]);
    
    const isMapQuery = query.toLowerCase().includes('nearby') || 
                       query.toLowerCase().includes('find') || 
                       query.toLowerCase().includes('pharmacy') ||
                       query.toLowerCase().includes('hospital');

    try {
      if (isMapQuery) {
        const result = await geminiService.queryWithMaps(query);
        setResponse(result.text);
        setGroundingLinks(result.links);
      } else {
        const result = await geminiService.queryClinicData(query, data);
        setResponse(result);
      }
    } catch (err) {
      setResponse("I encountered an error while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    const summary = await geminiService.generateSmartSummary(allEntries);
    setSmartSummary(summary || '');
    setLoading(false);
  };

  const SUGGESTIONS = [
    "List all patients with Frozen Shoulder",
    "How many RCT procedures were done this week?",
    "Find nearby Dental Lab facilities",
    "Analyze revenue trends for Dr. Anjali"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <h2 className="text-3xl font-bold mb-2 relative z-10">Smile & Spine AI</h2>
        <p className="text-blue-100 mb-6 opacity-90 relative z-10">Clinical intelligence for Dental & Physiotherapy practice management.</p>
        
        <form onSubmit={handleQuery} className="relative z-10">
          <input
            type="text"
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 pl-12 pr-24 outline-none focus:ring-2 focus:ring-white/40 transition-all placeholder:text-blue-200 text-white"
            placeholder="Ask about treatments, revenue, or find labs..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <i className="fas fa-sparkles absolute left-4 top-1/2 -translate-y-1/2 text-blue-300"></i>
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-indigo-700 px-5 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Consult AI'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 relative z-10">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors border border-white/10"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center">
              <i className="fas fa-brain text-purple-500 mr-2"></i>Clinical Insights
            </h3>
            {loading && !response && <span className="text-xs text-slate-400 animate-pulse">Consulting...</span>}
          </div>
          <div className="flex-1 min-h-[250px] bg-slate-50 rounded-lg p-5 text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
            {response || (loading ? "Analyzing session data..." : "Ask about dental procedures, physio sessions, or local medical labs.")}
            
            {groundingLinks.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Nearby Facilities:</p>
                <div className="space-y-2">
                  {groundingLinks.map((link, i) => (
                    <a 
                      key={i} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all text-blue-600 font-medium"
                    >
                      <i className="fas fa-map-marker-alt text-red-500"></i>
                      <span>{link.title}</span>
                      <i className="fas fa-external-link-alt ml-auto text-xs text-slate-300"></i>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center">
              <i className="fas fa-chart-line text-emerald-500 mr-2"></i>Smart Summary
            </h3>
            <button 
              onClick={generateSummary}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
              disabled={loading}
            >
              <i className="fas fa-sync-alt mr-1"></i> Refresh
            </button>
          </div>
          <div className="flex-1 min-h-[250px] bg-slate-50 rounded-lg p-5 text-slate-700 leading-relaxed text-sm">
            {smartSummary ? (
              <div className="prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: smartSummary.replace(/\*/g, '').replace(/\n/g, '<br/>') }} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                   <i className="fas fa-tooth text-3xl opacity-30"></i>
                </div>
                <p className="max-w-[200px]">Generate a concise summary of procedure volume and treatment success.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICenter;
