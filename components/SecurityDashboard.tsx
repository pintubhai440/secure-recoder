
import React from 'react';
import { SecurityLog } from '../types';

interface Props {
  logs: SecurityLog[];
  onClear: () => void;
}

const SecurityDashboard: React.FC<Props> = ({ logs, onClear }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-cyan-400">Security Vault</h2>
          <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded border border-cyan-500/20 uppercase font-bold tracking-wider">Encrypted</span>
        </div>
        <button 
          onClick={onClear}
          className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Purge Logs
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <svg className="w-16 h-16 mb-4 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="font-mono text-sm uppercase tracking-widest">No Intrusions Recorded</p>
        </div>
      ) : (
        <div className="space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="group bg-slate-900/60 rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/30 transition-all shadow-xl">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="relative shrink-0">
                  <img 
                    src={log.intruderImage} 
                    alt="Intruder" 
                    className="w-full md:w-32 h-32 object-cover rounded-xl border border-slate-700 shadow-lg"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Captured</div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${
                        log.threatLevel === 'High' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                      }`}>
                        {log.threatLevel} Alert
                      </span>
                      <h4 className="text-slate-200 font-bold mt-1">Unauthorized Access Attempt</h4>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                    <p className="text-xs text-cyan-400 font-bold uppercase mb-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                      AI Behavior Analysis
                    </p>
                    <p className="text-sm text-slate-300 italic">
                      {log.aiAnalysis || "Synthesizing visual data..."}
                    </p>
                  </div>

                  {log.screenRecordingUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-green-400 uppercase">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Activity Record Ready
                      </div>
                      <video 
                        controls 
                        src={log.screenRecordingUrl} 
                        className="w-full rounded-xl border border-slate-700 bg-black shadow-inner overflow-hidden"
                        poster={log.intruderImage}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-600 border-t-cyan-500"></div>
                      <span className="text-xs text-slate-500 font-mono italic">Recording silent activity stream...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
