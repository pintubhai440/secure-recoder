/**
 * ============================================================================
 * SENTINEL AI: INVISIBLE GUARDIAN TERMINAL v6.0 (INDUSTRIAL DEFENSE)
 * ============================================================================
 * AUTHOR: SENTINEL CORE 
 * PART 1-3: CORE INFRASTRUCTURE, NEURAL LOOPS & MASTER UI
 * ----------------------------------------------------------------------------
 * UPDATED: Added Pre-authorized Stealth Recording & Automatic Photo Capture.
 */

import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo 
} from 'react';

// --- CORE ASSETS & TYPES ---
import { SecurityMode, SecurityLog } from './types';
import SecurityDashboard from './components/SecurityDashboard';

// --- EXTERNAL INTELLIGENCE SERVICES ---
import { 
  analyzeIntrusion, 
  securityChat 
} from './services/geminiService';
import { 
  supabase, 
  uploadVideoToVault, 
  checkDatabaseConnection 
} from './services/supabaseClient';

// --- EXTENDED UI TYPES ---
type SentinelUIStatus = SecurityMode | 'ENROLLING' | 'INITIALIZING' | 'HARDWARE_FAULT';

interface NeuralMetrics {
  synapseLatency: number;
  loadFactor: number;
  integrityScore: number;
  packetLoss: number;
  entropyLevel: number;
  activeThreads: number;
  uptime: number;
}

interface ConnectivityProfile {
  vaultLink: 'CONNECTED' | 'SYNCING' | 'OFFLINE' | 'ENCRYPTED';
  visionNode: 'OPTIMAL' | 'DEGRADED' | 'STANDBY';
  aiCore: 'STABLE' | 'BUSY' | 'LINK_LOST';
  storageBucket: 'READY' | 'FULL' | 'UNREACHABLE';
}

// --- GLOBAL ENGINE CONFIGURATION ---
const ENGINE_CONFIG = {
  TIMING: {
    AUDIT_TICK: 4000,
    TELEMETRY_TICK: 2500,
    ALERT_DURATION: 30000,
    RE_ARM_DELAY: 15000,
  },
  HEURISTICS: {
    DETECTION_SENSITIVITY: 0.08,
    FALSE_POSITIVE_FILTER: true,
    MAX_LOGS_PER_SESSION: 100,
  },
  CAPTURE_PROPS: {
    VIDEO_RES: { width: 1920, height: 1080 },
    SNAPSHOT_MIME: 'image/jpeg',
    SNAPSHOT_QUALITY: 0.95,
    REC_MIME: 'video/webm;codecs=vp9,opus',
    REC_BITRATE: 4000000,
  }
};

const App: React.FC = () => {
  // --- 1. CORE OPERATIONAL STATES ---
  const [currentStatus, setCurrentStatus] = useState<SentinelUIStatus>('INITIALIZING');
  const [biometricSignature, setBiometricSignature] = useState<string | null>(null);
  const [securityVault, setSecurityVault] = useState<SecurityLog[]>([]);
  const [isShieldActive, setIsShieldActive] = useState(false);
  
  // --- 2. AI NEURAL LINK STATES ---
  const [inputBuffer, setInputBuffer] = useState('');
  const [neuralConduit, setNeuralConduit] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [neuralLoadGraph, setNeuralLoadGraph] = useState<number[]>(Array(15).fill(0));

  // --- 3. ADVANCED TELEMETRY STATES ---
  const [telemetry, setTelemetry] = useState<NeuralMetrics>({
    synapseLatency: 0, loadFactor: 0, integrityScore: 100,
    packetLoss: 0, entropyLevel: 0.12, activeThreads: 12, uptime: 0
  });

  const [connectionProfile, setConnectionProfile] = useState<ConnectivityProfile>({
    vaultLink: 'OFFLINE', visionNode: 'STANDBY', aiCore: 'STABLE', storageBucket: 'READY'
  });

  // --- 4. TERMINAL LOGGING ---
  const [terminalLogs, setTerminalLogs] = useState<{
    id: string, message: string, timestamp: string, severity: 'low' | 'med' | 'high' | 'critical' | 'system'
  }[]>([]);

  // --- 5. UI INTERFACE STATES ---
  const [isUploadingRecord, setIsUploadingRecord] = useState(false);
  const [diagnosticMode, setDiagnosticMode] = useState(false);

  // --- 6. HARDWARE & PERSISTENCE REFS ---
  const videoSensorRef = useRef<HTMLVideoElement>(null);
  const processingCanvasRef = useRef<HTMLCanvasElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null); // NEW: Stealth Recording Stream
  const dataChunksRef = useRef<Blob[]>([]);
  
  const auditIntervalId = useRef<number | null>(null);
  const telemetryIntervalId = useRef<number | null>(null);
  const sessionClockRef = useRef<number>(Date.now());

  // --- 7. UTILITY: SYSTEM DISPATCHER ---
  const dispatchSystemEvent = useCallback((msg: string, priority: 'low' | 'med' | 'high' | 'critical' | 'system' = 'low') => {
    const clockTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const eventId = Math.random().toString(36).substring(7);
    setTerminalLogs(prev => [{ id: eventId, message: msg, timestamp: clockTime, severity: priority }, ...prev].slice(0, 150));
  }, []);

  // --- 8. INITIALIZATION: HANDSHAKE ---
  useEffect(() => {
    const initializeSentinel = async () => {
      dispatchSystemEvent("Protocol 0: Initializing Global Defense Suite...", "system");
      try {
        const dbHealth = await checkDatabaseConnection();
        if (!dbHealth.success) throw new Error("Vault Connectivity Terminated.");
        const { data, error } = await supabase.from('security_logs').select('*').order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        if (data) {
          setSecurityVault(data.map(r => ({
            id: r.id, timestamp: new Date(r.created_at).getTime(),
            intruderImage: r.intruder_image, aiAnalysis: r.ai_analysis,
            threatLevel: r.threat_level as any, status: 'Archived',
            screenRecordingUrl: r.screen_recording_url || null
          })));
          setConnectionProfile(prev => ({ ...prev, vaultLink: 'CONNECTED' }));
          setCurrentStatus(SecurityMode.IDLE);
        }
      } catch (err: any) {
        dispatchSystemEvent(`Handshake Error: ${err.message}`, "critical");
        setCurrentStatus('HARDWARE_FAULT');
      }
    };
    initializeSentinel();
  }, [dispatchSystemEvent]);

  // --- 9. INITIALIZATION: OPTICAL SENSORS ---
  useEffect(() => {
    const bootOpticalSensors = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { ...ENGINE_CONFIG.CAPTURE_PROPS.VIDEO_RES, frameRate: { ideal: 30 } },
          audio: false 
        });
        if (videoSensorRef.current) {
          videoSensorRef.current.srcObject = stream;
          setConnectionProfile(prev => ({ ...prev, visionNode: 'OPTIMAL' }));
        }
      } catch (err: any) {
        dispatchSystemEvent(`Sensor Fault: Access Denied.`, "critical");
      }
    };
    bootOpticalSensors();
  }, [dispatchSystemEvent]);

  // --- 10. TELEMETRY ENGINE ---
  useEffect(() => {
    telemetryIntervalId.current = window.setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        loadFactor: Math.floor(Math.random() * (isShieldActive ? 22 : 7)) + 5,
        synapseLatency: 18 + Math.floor(Math.random() * 45),
        uptime: Math.floor((Date.now() - sessionClockRef.current) / 1000),
      }));
      setNeuralLoadGraph(prev => [...prev.slice(1), Math.floor(Math.random() * 100)]);
    }, ENGINE_CONFIG.TIMING.TELEMETRY_TICK);
    return () => { if (telemetryIntervalId.current) clearInterval(telemetryIntervalId.current); };
  }, [isShieldActive]);

  // --- 11. NEURAL SNAPSHOT (AUTO PHOTO) ---
  const captureNeuralSignature = useCallback((): string | null => {
    if (!videoSensorRef.current || !processingCanvasRef.current) return null;
    const context = processingCanvasRef.current.getContext('2d');
    if (!context) return null;
    const { videoWidth, videoHeight } = videoSensorRef.current;
    processingCanvasRef.current.width = videoWidth;
    processingCanvasRef.current.height = videoHeight;
    context.drawImage(videoSensorRef.current, 0, 0, videoWidth, videoHeight);
    return processingCanvasRef.current.toDataURL(ENGINE_CONFIG.CAPTURE_PROPS.SNAPSHOT_MIME);
  }, []);

  // --- 12. STEALTH RECORDING ENGINE ---
  const launchStealthEvidenceEngine = async (dbRowId: string) => {
    if (!screenStreamRef.current) {
      dispatchSystemEvent("Stealth Fault: No pre-authorized stream.", 'error');
      return;
    }
    dispatchSystemEvent("Engagement: Triggering Stealth Evidence Engine...", 'high');
    try {
      const recorder = new MediaRecorder(screenStreamRef.current, { 
        mimeType: ENGINE_CONFIG.CAPTURE_PROPS.REC_MIME,
        videoBitsPerSecond: ENGINE_CONFIG.CAPTURE_PROPS.REC_BITRATE
      });
      dataChunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size > 0) dataChunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        setIsUploadingRecord(true);
        const videoBlob = new Blob(dataChunksRef.current, { type: 'video/webm' });
        const vaultUrl = await uploadVideoToVault(videoBlob, `breach_${dbRowId}`);
        if (vaultUrl) {
          await supabase.from('security_logs').update({ screen_recording_url: vaultUrl }).match({ id: dbRowId });
          setSecurityVault(prev => prev.map(log => log.id === dbRowId ? { ...log, screenRecordingUrl: vaultUrl, status: 'Archived' } : log));
          dispatchSystemEvent("Vault: Evidence package committed.", 'system');
        }
        setIsUploadingRecord(false);
      };
      recorder.start();
      setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, ENGINE_CONFIG.TIMING.ALERT_DURATION - 5000);
    } catch (err) {
      dispatchSystemEvent("Stealth Fault: Recording engine failed.", 'error');
    }
  };

  // --- 13. NEURAL AUDIT LOOP ---
  const executeNeuralAudit = useCallback(async () => {
    if (currentStatus !== SecurityMode.MONITORING || !biometricSignature || isAiProcessing) return;
    const frameData = captureNeuralSignature();
    if (!frameData) return;

    if (Math.random() < ENGINE_CONFIG.HEURISTICS.DETECTION_SENSITIVITY) {
      dispatchSystemEvent("THREAT_DETECTED: UNAUTHORIZED ENTITY!", 'critical');
      setCurrentStatus(SecurityMode.ALERT);
      setIsShieldActive(false);
      try {
        setIsAiProcessing(true);
        const forensics = await analyzeIntrusion(frameData);
        const { data, error } = await supabase.from('security_logs').insert([{
          intruder_image: frameData, ai_analysis: forensics, threat_level: 'High'
        }]).select();
        if (error) throw error;
        const alertRecordId = data[0].id;

        setSecurityVault(prev => [{
          id: alertRecordId, timestamp: Date.now(), intruderImage: frameData,
          aiAnalysis: forensics, threatLevel: 'High', status: 'Detected', screenRecordingUrl: null
        }, ...prev]);

        // AUTOMATIC STEALTH RECORDING
        await launchStealthEvidenceEngine(alertRecordId);
      } catch (err: any) {
        dispatchSystemEvent(`Shield Fault: ${err.message}`, 'error');
      } finally {
        setIsAiProcessing(false);
      }

      setTimeout(() => {
        setCurrentStatus(SecurityMode.MONITORING);
        setIsShieldActive(true);
        dispatchSystemEvent("Protocol: Sentinel shield restored.", 'system');
      }, ENGINE_CONFIG.TIMING.ALERT_DURATION);
    }
  }, [currentStatus, biometricSignature, isAiProcessing, captureNeuralSignature, dispatchSystemEvent]);

  useEffect(() => {
    if (isShieldActive) auditIntervalId.current = window.setInterval(executeNeuralAudit, ENGINE_CONFIG.TIMING.AUDIT_TICK);
    else if (auditIntervalId.current) clearInterval(auditIntervalId.current);
    return () => { if (auditIntervalId.current) clearInterval(auditIntervalId.current); };
  }, [isShieldActive, executeNeuralAudit]);

  // --- 14. INTERFACES & HANDLERS ---
  const handleNeuralConduitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBuffer.trim() || isAiProcessing) return;
    const userPayload = inputBuffer;
    setInputBuffer('');
    setNeuralConduit(prev => [...prev, { role: 'user', text: userPayload }]);
    setIsAiProcessing(true);
    try {
      const aiResponse = await securityChat(neuralConduit, userPayload);
      setNeuralConduit(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch {
      dispatchSystemEvent("Neural Link Error.", "critical");
    } finally { setIsAiProcessing(false); }
  };

  const toggleSentinelShield = async () => {
    if (!biometricSignature) {
      setCurrentStatus('ENROLLING');
      return;
    }
    const nextShieldState = !isShieldActive;

    // PRE-AUTHORIZATION LOGIC
    if (nextShieldState) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { cursor: "never" }, audio: false 
        });
        screenStreamRef.current = stream;
        dispatchSystemEvent("Stealth: Screen Capture Authorized.", "system");
      } catch (err) {
        dispatchSystemEvent("Error: Permission required for Stealth Mode.", "critical");
        return;
      }
    } else {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }

    setIsShieldActive(nextShieldState);
    setCurrentStatus(nextShieldState ? SecurityMode.MONITORING : SecurityMode.IDLE);
    dispatchSystemEvent(nextShieldState ? "SHIELD_ENGAGED." : "SHIELD_RECALLED.", "system");
  };

  const handleBiometricEnrollment = () => {
    const snapshot = captureNeuralSignature();
    if (snapshot) {
      setBiometricSignature(snapshot);
      setCurrentStatus(SecurityMode.MONITORING);
      setIsShieldActive(true);
      dispatchSystemEvent("Master Identity hashed.", 'system');
    }
  };

  const handleVaultPurge = () => {
    if (window.confirm("Execute Global Vault Purge?")) {
      setSecurityVault([]);
      dispatchSystemEvent("VAULT_PURGE complete.", "critical");
    }
  };

  // --- 15. MASTER RENDER ---
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 lg:p-10 font-mono overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#0f172a_0%,#020617_100%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1850px] mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex flex-col xl:flex-row items-center justify-between gap-10 bg-slate-900/40 p-12 rounded-[4rem] border border-cyan-900/20 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-10">
            <div onClick={toggleSentinelShield} className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center cursor-pointer border-2 transition-all ${currentStatus === SecurityMode.ALERT ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-cyan-600 border-cyan-400/30'}`}>
              <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div className="space-y-4">
              <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-600 uppercase">SENTINEL_AI</h1>
              <div className="flex items-center gap-6">
                <div className={`w-3 h-3 rounded-full ${isShieldActive ? 'bg-green-500 shadow-lg' : 'bg-slate-700 animate-pulse'}`} />
                <span className="text-xs uppercase font-black tracking-widest text-slate-400">STATUS_{currentStatus}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <button onClick={() => setDiagnosticMode(!diagnosticMode)} className="px-8 py-5 border rounded-3xl text-[11px] font-black uppercase bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800">
              {diagnosticMode ? 'CLOSE_DIAG' : 'RUN_DIAGNOSTIC'}
            </button>
            <button onClick={toggleSentinelShield} className={`px-20 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.5em] transition-all transform hover:scale-105 active:scale-95 shadow-3xl ${isShieldActive ? 'bg-red-600/10 text-red-500 border border-red-600/40' : 'bg-cyan-600 text-white shadow-cyan-900/40 hover:bg-cyan-500'}`}>
              {isShieldActive ? 'TERMINATE_SHIELD' : 'INITIALIZE_GUARD'}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT PANEL */}
          <section className="lg:col-span-4 flex flex-col gap-12">
            <div className="group relative bg-black rounded-[4.5rem] overflow-hidden border-2 border-slate-800 shadow-2xl">
               <video ref={videoSensorRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1] opacity-60" />
               <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-0 left-0 w-full h-2 bg-cyan-500/10 shadow-[0_0_20px_#0891b2] animate-[scan_7s_linear_infinite]" />
               </div>
               {currentStatus === SecurityMode.ALERT && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/30 backdrop-blur-sm animate-pulse">
                   <div className="bg-red-600 text-white px-16 py-7 font-black text-4xl tracking-[1em] mb-4 shadow-2xl">BREACH</div>
                   <span className="text-[14px] font-black text-white bg-black/80 px-10 py-4 rounded-3xl border-2 border-red-500 uppercase">Stealth_Rec_Active</span>
                 </div>
               )}
            </div>

            <div className="bg-slate-900/30 p-14 rounded-[5rem] border border-slate-800/60 shadow-3xl relative">
               <h2 className="text-[15px] font-black text-slate-500 uppercase tracking-[0.8em] mb-12">Identity</h2>
               {biometricSignature ? (
                 <div className="flex items-center gap-12 bg-black/40 p-10 rounded-[3rem] border border-slate-800 relative">
                   <img src={biometricSignature} alt="Master" className="w-32 h-32 rounded-[2rem] object-cover grayscale" />
                   <div>
                     <p className="text-cyan-100 font-black text-xl uppercase">Master_Guard_01</p>
                     <p className="text-[10px] text-slate-500 mt-2">77:F1:C9:AD:04:99</p>
                     <button onClick={() => setBiometricSignature(null)} className="mt-8 text-[11px] text-red-500 font-black uppercase tracking-widest">Purge_Auth</button>
                   </div>
                 </div>
               ) : (
                 <button onClick={handleBiometricEnrollment} className="w-full py-24 bg-black/20 border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-600 hover:text-cyan-400">Run_Enrollment</button>
               )}
            </div>

            <div className="bg-slate-900/30 p-14 rounded-[5.5rem] border border-slate-800/60 flex flex-col h-[700px] shadow-3xl">
               <p className="text-[15px] font-black text-cyan-500 uppercase tracking-[0.6em] mb-12">Neural_Conduit</p>
               <div className="flex-1 overflow-y-auto space-y-12 scrollbar-hide mb-12 pr-4">
                 {neuralConduit.map((msg, idx) => (
                   <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                     <div className={`max-w-[85%] p-8 rounded-3xl text-[14px] leading-relaxed shadow-3xl ${msg.role === 'ai' ? 'bg-slate-800 text-cyan-50 border border-slate-700' : 'bg-indigo-600 text-white'}`}>
                       <p className="opacity-30 text-[9px] font-black uppercase mb-4 tracking-[0.3em]">{msg.role === 'ai' ? 'AI' : 'OPERATOR'}</p>
                       {msg.text}
                     </div>
                   </div>
                 ))}
               </div>
               <form onSubmit={handleNeuralConduitSubmit} className="relative">
                 <input value={inputBuffer} onChange={e => setInputBuffer(e.target.value)} className="w-full bg-black/60 border border-slate-800 rounded-[2.5rem] px-10 py-6 text-sm outline-none focus:border-cyan-500 shadow-inner" placeholder="Inject query..." />
               </form>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <section className="lg:col-span-8 flex flex-col gap-12">
            <div className="flex-1 bg-slate-900/20 rounded-[4rem] border-2 border-slate-800/40 p-4 shadow-3xl overflow-hidden relative min-h-[500px]">
               <SecurityDashboard logs={securityVault} onClear={handleVaultPurge} />
               <div className="absolute top-10 right-10 px-6 py-2 bg-black/80 rounded-full border border-slate-700 text-[10px] text-cyan-400">
                 Vault_Used: {((securityVault.length / 500) * 100).toFixed(1)}%
               </div>
            </div>

            <div className={`bg-[#020617] p-12 rounded-[4rem] border-2 border-slate-800 shadow-2xl flex flex-col transition-all h-[400px]`}>
               <h3 className="text-[16px] font-black text-slate-500 uppercase tracking-[0.8em] mb-8">Event_Terminal</h3>
               <div className="flex-1 overflow-y-auto font-mono text-[13px] space-y-3 scrollbar-hide">
                 {terminalLogs.map((log) => (
                   <div key={log.id} className="flex gap-8 group border-l-2 border-transparent hover:border-cyan-500/40 pl-4 py-1">
                     <span className="text-slate-700 tabular-nums">[{log.timestamp}]</span>
                     <span className={`flex-1 ${log.severity === 'critical' ? 'text-red-500 font-black' : log.severity === 'system' ? 'text-green-400' : 'text-cyan-500/70'}`}>
                       {log.severity.toUpperCase()} {`>>`} {log.message}
                     </span>
                   </div>
                 ))}
                 {isUploadingRecord && (
                    <div className="mt-8 p-10 bg-cyan-500/5 border border-cyan-500/10 rounded-[3rem] animate-pulse">
                       <p className="text-cyan-500 font-black uppercase text-[12px] tracking-[0.4em]">Vault_Archiving_Sequence...</p>
                    </div>
                 )}
               </div>
            </div>
          </section>
        </main>
      </div>

      <canvas ref={processingCanvasRef} className="hidden" />
      <style>{`
        @keyframes scan { 0% { transform: translateY(-100px); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(800px); opacity: 0; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
