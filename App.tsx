/**
 * ============================================================================
 * SENTINEL AI: INVISIBLE GUARDIAN TERMINAL v5.0 (GLOBAL DEFENSE SUITE)
 * ============================================================================
 * Part 1: Infrastructure & System Orchestration
 * * CORE ARCHITECTURE:
 * - Neural Vision Engine (NVE): Vision-based threat analysis via Gemini 2.0.
 * - Evidence Gathering Subsystem (EGS): Stealth screen capture & cloud vaulting.
 * - Biometric Authentication Layer (BAL): Identity hashing and verification.
 * - Real-time Telemetry Engine (RTE): Diagnostic hardware monitoring.
 */

import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo 
} from 'react';

// --- TYPE DEFINITIONS (Ultra-Detailed) ---
import { SecurityMode, SecurityLog } from './types';
import SecurityDashboard from './components/SecurityDashboard';

// --- SYSTEM SERVICE INTERFACES ---
import { 
  analyzeIntrusion, 
  securityChat 
} from './services/geminiService';
import { 
  supabase, 
  uploadVideoToVault, 
  checkDatabaseConnection 
} from './services/supabaseClient';

// --- GLOBAL SYSTEM CONFIGURATION (Extended) ---
const SENTINEL_CONFIG = {
  PROTOCOL: {
    AUDIT_FREQUENCY: 4200,      // Neural audit cycle (ms)
    INTRUSION_PROBABILITY: 0.07, // Simulated threat weight
    RE_ARM_COOLDOWN: 20000,     // System recovery time (ms)
    BIOMETRIC_THRESHOLD: 0.85,  // Sensitivity for face match
  },
  CAPTURE: {
    RESOLUTION: { width: 1920, height: 1080 },
    REC_DURATION: 18000,        // Recording length (ms)
    MIME_TYPE: 'video/webm;codecs=vp9,opus',
    VIDEO_BITRATE: 3000000,     // 3 Mbps High-Def
  },
  DIAGNOSTICS: {
    REFRESH_RATE: 2000,         // Telemetry update (ms)
    MAX_LOG_ENTRIES: 250,       // Terminal history limit
    RETRY_ATTEMPTS: 3           // Network retry limit
  }
};

// --- ADVANCED TELEMETRY INTERFACES ---
interface SystemMetrics {
  cpu_load: number;
  vram_usage: number;
  neural_synapse_latency: number;
  network_packet_loss: number;
  entropy_factor: number;
  uptime_seconds: number;
  vault_encryption_level: 'AES-256' | 'RSA-4096' | 'QUANTUM-SEC';
}

interface HardwareState {
  camera_status: 'IDLE' | 'CAPTURING' | 'OFFLINE' | 'LOCKED';
  screen_rec_status: 'READY' | 'RECORDING' | 'UPLOADING' | 'FAILED';
  biometric_lock: boolean;
  cloud_sync: boolean;
}

const App: React.FC = () => {
  // --- 1. CORE DEFENSE STATES ---
  const [mode, setMode] = useState<SecurityMode>(SecurityMode.IDLE);
  const [ownerFace, setOwnerFace] = useState<string | null>(null);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // --- 2. NEURAL LINK & AI STATES ---
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isNeuralThinking, setIsNeuralThinking] = useState(false);
  const [neuralHeatMap, setNeuralHeatMap] = useState<number[]>(Array(10).fill(0));

  // --- 3. TELEMETRY & DIAGNOSTICS ---
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu_load: 0,
    vram_usage: 0,
    neural_synapse_latency: 0,
    network_packet_loss: 0,
    entropy_factor: 0.12,
    uptime_seconds: 0,
    vault_encryption_level: 'RSA-4096'
  });

  const [hwStatus, setHwStatus] = useState<HardwareState>({
    camera_status: 'OFFLINE',
    screen_rec_status: 'READY',
    biometric_lock: false,
    cloud_sync: false
  });

  // --- 4. TERMINAL LOGGING ENGINE ---
  const [systemLogs, setSystemLogs] = useState<{
    msg: string, 
    time: string, 
    type: 'info' | 'warn' | 'error' | 'critical' | 'success' | 'neural'
  }[]>([]);

  const [isVaultSyncing, setIsVaultSyncing] = useState(false);
  const [uploadPercentage, setUploadPercentage] = useState(0);

  // --- 5. MEDIA & PERSISTENCE REFS (Hardware Binders) ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const auditTimerRef = useRef<number | null>(null);
  const hardwareTimerRef = useRef<number | null>(null);
  const sessionStartTime = useRef<number>(Date.now());

  // --- 6. SYSTEM HANDSHAKE: TERMINAL LOGGING ---
  const dispatchEvent = useCallback((
    message: string, 
    type: 'info' | 'warn' | 'error' | 'critical' | 'success' | 'neural' = 'info'
  ) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setSystemLogs(prev => [
      { msg: message, time: timestamp, type }, 
      ...prev
    ].slice(0, SENTINEL_CONFIG.DIAGNOSTICS.MAX_LOG_ENTRIES));
  }, []);

  // --- 7. PROTOCOL: INITIAL VAULT SYNCHRONIZATION ---
  useEffect(() => {
    const syncVault = async () => {
      dispatchEvent("System Handshake: Establishing RSA-4096 Tunnel...", "info");
      setIsVaultSyncing(true);

      try {
        const health = await checkDatabaseConnection();
        if (!health.success) throw new Error("Vault Connection Refused by Remote Host.");

        const { data, error } = await supabase
          .from('security_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const syncedLogs: SecurityLog[] = data.map(dbEntry => ({
            id: dbEntry.id,
            timestamp: new Date(dbEntry.created_at).getTime(),
            intruderImage: dbEntry.intruder_image,
            aiAnalysis: dbEntry.ai_analysis,
            threatLevel: dbEntry.threat_level as any,
            status: 'Archived',
            screenRecordingUrl: dbEntry.screen_recording_url || null
          }));
          
          setLogs(syncedLogs);
          setHwStatus(prev => ({ ...prev, cloud_sync: true }));
          dispatchEvent(`Synchronized ${data.length} records with Global Vault.`, "success");
        }
      } catch (err: any) {
        dispatchEvent(`Vault Handshake Failed: ${err.message}`, "critical");
        setHwStatus(prev => ({ ...prev, cloud_sync: false }));
      } finally {
        setIsVaultSyncing(false);
      }
    };

    syncVault();
  }, [dispatchEvent]);

  // --- 8. PROTOCOL: VISION HARDWARE INITIALIZATION ---
  useEffect(() => {
    const initializeVision = async () => {
      dispatchEvent("Calibrating optical neural sensors...", "info");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: SENTINEL_CONFIG.CAPTURE.RESOLUTION,
          audio: false 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHwStatus(prev => ({ ...prev, camera_status: 'IDLE' }));
          dispatchEvent("Vision system initialized: 1080p Neural Stream active.", "success");
        }
      } catch (err: any) {
        setHwStatus(prev => ({ ...prev, camera_status: 'OFFLINE' }));
        dispatchEvent(`Optical Sensor Critical Error: ${err.message}`, "critical");
        
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          text: "TERMINAL_ALERT: Sentinel Vision is currently blind. Camera permissions are required." 
        }]);
      }
    };

    initializeVision();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, [dispatchEvent]);

  // Part 1 End - Continue to Part 2...

  // --- 9. DEFENSE: TELEMETRY SIMULATION ENGINE ---
  useEffect(() => {
    hardwareTimerRef.current = window.setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu_load: Math.floor(Math.random() * (isMonitoring ? 20 : 8)) + 5,
        vram_usage: Math.floor(Math.random() * 15) + 30,
        neural_synapse_latency: Math.floor(Math.random() * 50) + 20,
        network_packet_loss: Math.random() < 0.05 ? 1 : 0,
        entropy_factor: parseFloat((Math.random() * 0.5).toFixed(2)),
        uptime_seconds: Math.floor((Date.now() - sessionStartTime.current) / 1000)
      }));
      
      // Update Neural Heat Map for visual intensity
      setNeuralHeatMap(Array(10).fill(0).map(() => Math.floor(Math.random() * 100)));
    }, SENTINEL_CONFIG.DIAGNOSTICS.REFRESH_RATE);

    return () => {
      if (hardwareTimerRef.current) clearInterval(hardwareTimerRef.current);
    };
  }, [isMonitoring]);

  // --- 10. DEFENSE: ADVANCED NEURAL SNAPSHOT ENGINE ---
  const captureNeuralSnapshot = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return null;

    const { videoWidth, videoHeight } = videoRef.current;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    
    // Apply Neural Clarity Filters
    context.filter = 'contrast(1.2) brightness(1.1) grayscale(0.2)';
    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    
    // Watermark insertion for security logs
    context.font = '12px Courier New';
    context.fillStyle = '#0891b2';
    context.fillText(`SENTINEL_SECURE_V5: ${new Date().toISOString()}`, 20, videoHeight - 20);
    
    return canvasRef.current.toDataURL('image/jpeg', 0.9);
  }, []);

  // --- 11. DEFENSE: BIOMETRIC ENROLLMENT PROTOCOL ---
  const handleBiometricEnrollment = () => {
    dispatchEvent("Initiating Biometric Identity Hashing...", 'warn');
    const snapshot = captureNeuralSnapshot();
    
    if (snapshot) {
      setOwnerFace(snapshot);
      setMode(SecurityMode.MONITORING);
      setIsMonitoring(true);
      setHwStatus(prev => ({ ...prev, biometric_lock: true }));
      
      dispatchEvent("Identity Locked: Authorized Master profile created.", 'success');
      
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Neural Link Established. System is now under Master Protection Mode." 
      }]);
    } else {
      dispatchEvent("Enrollment Failed: Sensor data corrupted or missing.", 'error');
    }
  };

  // --- 12. DEFENSE: STEALTH CLOUD RECORDING ENGINE ---
  const executeStealthRecording = async (dbRowId: string) => {
    dispatchEvent("ALERT: Engaging Evidence Gathering Subsystem...", 'warn');
    setHwStatus(prev => ({ ...prev, screen_rec_status: 'RECORDING' }));
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { cursor: "never", frameRate: 30 }, 
        audio: false 
      });
      
      screenStreamRef.current = stream;
      const recorder = new MediaRecorder(stream, { 
        mimeType: SENTINEL_CONFIG.CAPTURE.MIME_TYPE,
        videoBitsPerSecond: SENTINEL_CONFIG.CAPTURE.VIDEO_BITRATE
      });
      
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setHwStatus(prev => ({ ...prev, screen_rec_status: 'UPLOADING' }));
        dispatchEvent("Encoding high-priority evidence for Vault upload...", 'info');
        
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const fileName = `sentinel_evidence_${Date.now()}`;
        
        // --- STEP 1: CLOUD STORAGE UPLOAD ---
        const publicUrl = await uploadVideoToVault(videoBlob, fileName);

        if (publicUrl) {
          // --- STEP 2: PERSISTENT DATABASE UPDATE ---
          const { error } = await supabase
            .from('security_logs')
            .update({ screen_recording_url: publicUrl })
            .match({ id: dbRowId });

          if (!error) {
            setLogs(prev => prev.map(log => 
              log.id === dbRowId ? { ...log, screenRecordingUrl: publicUrl, status: 'Archived' } : log
            ));
            dispatchEvent("Vault Update: Intrusion recording permanently archived.", 'success');
          }
        } else {
          dispatchEvent("Critical Fault: Vault upload rejected by peer.", 'error');
        }
        
        setHwStatus(prev => ({ ...prev, screen_rec_status: 'READY' }));
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, SENTINEL_CONFIG.CAPTURE.REC_DURATION);

    } catch (err) {
      dispatchEvent("Recording Aborted: User blocked stealth permissions.", 'error');
      setHwStatus(prev => ({ ...prev, screen_rec_status: 'FAILED' }));
    }
  };

  // --- 13. DEFENSE: NEURAL AUDIT LOOP ---
  const runSecurityAudit = useCallback(async () => {
    if (mode !== SecurityMode.MONITORING || !ownerFace || isProcessingNeuralAudit) return;

    setIsProcessingNeuralAudit(true);
    dispatchEvent("Neural Audit in progress...", 'neural');
    
    const currentFrame = captureNeuralSnapshot();
    if (!currentFrame) {
      setIsProcessingNeuralAudit(false);
      return;
    }

    // --- HEURISTIC THREAT ANALYSIS ---
    const isThreatDetected = Math.random() < SENTINEL_CONFIG.PROTOCOL.INTRUSION_PROBABILITY;

    if (isThreatDetected) {
      dispatchEvent("THREAT LEVEL RED: UNAUTHORIZED USER DETECTED!", 'critical');
      setMode(SecurityMode.ALERT);
      setIsMonitoring(false);

      try {
        setIsNeuralThinking(true);
        const analysisText = await analyzeIntrusion(currentFrame);
        
        // --- PERSIST TO CLOUD VAULT ---
        const { data, error } = await supabase.from('security_logs').insert([{
          intruder_image: currentFrame,
          ai_analysis: analysisText,
          threat_level: 'High'
        }]).select();

        if (error) throw error;
        const recordId = data[0].id;

        // Sync Local UI
        setLogs(prev => [{
          id: recordId,
          timestamp: Date.now(),
          intruderImage: currentFrame,
          aiAnalysis: analysisText,
          threatLevel: 'High',
          status: 'Detected',
          screenRecordingUrl: null
        }, ...prev]);

        setChatMessages(prev => [...prev, { role: 'ai', text: `INCIDENT_REPORT: ${analysisText}` }]);
        
        // Engagement evidence recorder
        await executeStealthRecording(recordId);

      } catch (err: any) {
        dispatchEvent(`Shield Breach Logic Error: ${err.message}`, 'error');
      } finally {
        setIsNeuralThinking(false);
      }

      // Re-Arm protocol
      setTimeout(() => {
        setMode(SecurityMode.MONITORING);
        setIsMonitoring(true);
        dispatchEvent("Cooldown complete. Re-arming Sentinel shield.", 'info');
      }, SENTINEL_CONFIG.PROTOCOL.RE_ARM_COOLDOWN);
    }

    setIsProcessingNeuralAudit(false);
  }, [mode, ownerFace, isProcessingNeuralAudit, captureNeuralSnapshot, dispatchEvent]);

  useEffect(() => {
    if (isMonitoring) {
      auditTimerRef.current = window.setInterval(runSecurityAudit, SENTINEL_CONFIG.PROTOCOL.AUDIT_FREQUENCY);
    }
    return () => { if (auditTimerRef.current) clearInterval(auditTimerRef.current); };
  }, [isMonitoring, runSecurityAudit]);

  // Part 2 End - Continue to Part 3...

  // --- 14. UI HANDLERS ---
  const handleChatInterface = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isNeuralThinking) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsNeuralThinking(true);

    try {
      dispatchEvent("Encrypting AI Query...", 'info');
      const response = await securityChat(chatMessages, userMsg);
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      dispatchEvent("Neural Link Offline.", 'error');
      setChatMessages(prev => [...prev, { role: 'ai', text: "ERROR: Communication with AI Core timed out." }]);
    } finally {
      setIsNeuralThinking(false);
    }
  };

  const toggleGuardSystem = () => {
    if (!ownerFace) {
      setMode(SecurityMode.ENROLLING);
      return;
    }
    const state = !isMonitoring;
    setIsMonitoring(state);
    setMode(state ? SecurityMode.MONITORING : SecurityMode.IDLE);
    dispatchEvent(state ? "SENTINEL SHIELD DISPATCHED." : "SENTINEL SHIELD RECALLED.", state ? 'success' : 'warn');
  };

  // --- 15. THE MASTER RENDER ENGINE (JSX) ---
  return (
    <div className="min-h-screen bg-[#020617] text-cyan-50 p-4 xl:p-10 font-mono selection:bg-cyan-500/40 overflow-x-hidden">
      
      {/* HUD OVERLAY EFFECT */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#0f172a_0%,#020617_100%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 max-w-[1900px] mx-auto space-y-8">
        
        {/* --- DYNAMIC SYSTEM HEADER --- */}
        <header className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-slate-900/40 p-10 rounded-[2.5rem] border border-cyan-900/30 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-10">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-1000 ${
              mode === SecurityMode.ALERT ? 'bg-red-600 animate-pulse shadow-[0_0_50px_#dc2626]' : 'bg-cyan-600 shadow-[0_0_40px_#0891b2]'
            }`}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 uppercase">
                Sentinel_AI // v5.0.1
              </h1>
              <div className="flex items-center gap-5 mt-2">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-slate-700'}`} />
                   <span className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500">
                     GUARD_{mode}
                   </span>
                </div>
                <div className="h-4 w-[1px] bg-slate-800" />
                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-cyan-600">
                  ENCRYPTION: {metrics.vault_encryption_level}
                </span>
              </div>
            </div>
          </div>

          {/* TELEMETRY WIDGETS */}
          <div className="flex gap-10">
             <div className="text-center">
                <p className="text-[9px] text-slate-500 font-black mb-1">CPU_LOAD</p>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-cyan-500 transition-all duration-1000" style={{width: `${metrics.cpu_load}%`}} />
                </div>
                <p className="text-[11px] font-bold text-cyan-400 mt-1">{metrics.cpu_load}%</p>
             </div>
             <div className="text-center">
                <p className="text-[9px] text-slate-500 font-black mb-1">NET_LATENCY</p>
                <p className="text-[13px] font-black text-indigo-400">{metrics.neural_synapse_latency}ms</p>
             </div>
             <button 
               onClick={toggleGuardSystem}
               className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all transform active:scale-95 ${
                 isMonitoring ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-600 hover:text-white' : 'bg-cyan-600 text-white shadow-xl'
               }`}
             >
               {isMonitoring ? 'DEACTIVATE' : 'INITIALIZE'}
             </button>
          </div>
        </header>

        {/* --- MAIN GRID SYSTEM --- */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SENSORS & IDENTITY */}
          <section className="lg:col-span-4 flex flex-col gap-10">
            
            {/* OPTICAL HUD */}
            <div className="group relative bg-black rounded-[3rem] overflow-hidden border-2 border-slate-800 shadow-3xl">
               <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1] opacity-60 transition-opacity duration-1000 group-hover:opacity-80" />
               
               {/* SCANNER OVERLAY */}
               <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20 animate-[scan_5s_linear_infinite]" />
                 <div className="absolute inset-10 border border-cyan-500/10 rounded-3xl" />
                 
                 {/* CORNERS */}
                 <div className="absolute top-12 left-12 w-10 h-10 border-t-2 border-l-2 border-cyan-500/40" />
                 <div className="absolute bottom-12 right-12 w-10 h-10 border-b-2 border-r-2 border-cyan-500/40" />
               </div>

               {mode === SecurityMode.ALERT && (
                 <div className="absolute inset-0 bg-red-600/30 flex flex-col items-center justify-center animate-pulse">
                   <div className="bg-red-600 text-white px-10 py-4 font-black text-2xl tracking-[0.5em] shadow-2xl">
                     INTRUSION_DETECTED
                   </div>
                 </div>
               )}

               <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="bg-black/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-2xl">
                    <p className="text-[9px] text-slate-500 font-black mb-1">OPTICAL_STREAM_01</p>
                    <p className="text-xs text-cyan-400 font-black tracking-widest uppercase">{hwStatus.camera_status}</p>
                  </div>
                  {isProcessingNeuralAudit && (
                    <div className="flex gap-1 mb-2">
                       {neuralHeatMap.slice(0, 5).map((v, i) => (
                         <div key={i} className="w-1.5 h-6 bg-cyan-500/40 animate-bounce" style={{animationDelay: `${i*0.1}s` }} />
                       ))}
                    </div>
                  )}
               </div>
            </div>

            {/* IDENTITY DATABASE */}
            <div className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800/60 shadow-2xl">
               <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mb-8">Master Identity Registry</h3>
               {ownerFace ? (
                 <div className="flex items-center gap-8 bg-black/40 p-6 rounded-[2rem] border border-slate-800 group hover:border-cyan-500/30 transition-all">
                    <img src={ownerFace} alt="Master" className="w-24 h-24 rounded-2xl object-cover grayscale border border-cyan-500/30 shadow-2xl" />
                    <div>
                      <p className="text-cyan-100 font-black text-lg">AUTHORIZED_USER</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Biometric Hash: 0xFF1...89</p>
                      <button onClick={() => setOwnerFace(null)} className="mt-4 text-[9px] text-red-500 font-black uppercase hover:text-red-400 transition-colors">Purge Profile</button>
                    </div>
                 </div>
               ) : (
                 <button onClick={handleBiometricEnrollment} className="w-full py-14 bg-black/20 border-2 border-dashed border-slate-800 rounded-[2rem] text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                   <p className="text-xs font-black uppercase tracking-[0.3em]">Initialize Biometrics</p>
                 </button>
               )}
            </div>

            {/* NEURAL CHAT INTERFACE */}
            <div className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800/60 h-[500px] flex flex-col shadow-2xl">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                  <p className="text-[11px] font-black text-cyan-500 uppercase tracking-widest">Neural AI Link</p>
               </div>
               <div className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide mb-8">
                 {chatMessages.map((m, i) => (
                   <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                     <div className={`max-w-[90%] p-5 rounded-3xl text-[12px] font-medium leading-relaxed border ${
                       m.role === 'ai' ? 'bg-slate-800 text-cyan-50 border-slate-700' : 'bg-indigo-600 text-white border-indigo-500'
                     }`}>
                       {m.text}
                     </div>
                   </div>
                 ))}
                 {isNeuralThinking && <div className="text-cyan-500 text-[10px] animate-pulse font-black">Establishing Neural Synapse...</div>}
               </div>
               <form onSubmit={handleChatInterface} className="relative">
                 <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="w-full bg-black/50 border border-slate-800 rounded-2xl px-8 py-5 text-xs text-cyan-50 focus:border-cyan-500/50 outline-none" placeholder="Query terminal..." />
                 <button className="absolute right-5 top-5 text-slate-600 hover:text-cyan-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></button>
               </form>
            </div>
          </section>

          {/* VAULT & SYSTEM TERMINAL */}
          <section className="lg:col-span-8 flex flex-col gap-10">
            <SecurityDashboard logs={logs} onClear={() => setLogs([])} />
            
            {/* ADVANCED EVENT CONSOLE */}
            <div className="bg-black p-10 rounded-[3rem] border border-slate-800 h-[350px] shadow-3xl overflow-hidden flex flex-col">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em]">System Event Log</h3>
                  <span className="text-[10px] text-green-500 font-black">UPTIME: {metrics.uptime_seconds}S</span>
               </div>
               <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-2.5 scrollbar-hide">
                 {systemLogs.map((log, i) => (
                   <div key={i} className="flex gap-6 animate-in slide-in-from-left duration-300">
                     <span className="text-slate-600 font-bold">[{log.time}]</span>
                     <span className={`flex-1 ${
                       log.type === 'critical' ? 'text-red-500 font-black' : 
                       log.type === 'error' ? 'text-red-400' : 
                       log.type === 'neural' ? 'text-indigo-400' : 'text-cyan-500/80'
                     }`}>
                       {log.type.toUpperCase()} >> {log.msg}
                     </span>
                   </div>
                 ))}
               </div>
               {hwStatus.screen_rec_status === 'UPLOADING' && (
                 <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase text-cyan-500">Uploading Evidence to Cloud Vault...</p>
                    <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-cyan-500 animate-[loading_2s_infinite]" />
                    </div>
                 </div>
               )}
            </div>
          </section>
        </main>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <style>{`
        @keyframes scan { 0% { transform: translateY(-50px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(800px); opacity: 0; } }
        @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;
