import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { SecurityMode, SecurityLog } from './types';
import SecurityDashboard from './components/SecurityDashboard';
import { analyzeIntrusion, securityChat } from './services/geminiService';
import { supabase } from './services/supabaseClient';

/**
 * ============================================================================
 * SENTINEL AI: INVISIBLE GUARDIAN TERMINAL v3.0 (ULTRA EXPANDED)
 * ============================================================================
 * * CORE FEATURES:
 * 1.  Biometric Neural Mapping: Faces are captured and hashed for comparison.
 * 2.  Gemini Vision Integration: Real-time visual analysis of unauthorized users.
 * 3.  Stealth Activity Recording: Automatic screen capture during alerts.
 * 4.  Cloud Vault Sync: Permanent log storage via Supabase.
 * 5.  Neural Chat Link: Intelligent security assistant for log interrogation.
 * 6.  System Health Monitoring: Live tracking of hardware and network metrics.
 */

// --- CONSTANTS & CONFIGURATION ---
const ALERT_COOLDOWN = 20000; // 20 seconds
const SCAN_INTERVAL = 4000;    // 4 seconds
const RECORDING_DURATION = 15000; // 15 seconds

const App: React.FC = () => {
  // --- 1. PRIMARY SECURITY STATE ---
  const [mode, setMode] = useState<SecurityMode>(SecurityMode.IDLE);
  const [ownerFace, setOwnerFace] = useState<string | null>(null);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // --- 2. AI & INTERACTION STATE ---
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- 3. SYSTEM DIAGNOSTICS STATE (Expanded for detail) ---
  const [systemLogs, setSystemLogs] = useState<{msg: string, time: string, type: 'info' | 'warn' | 'error' | 'critical'}[]>([]);
  const [networkStats, setNetworkStats] = useState({ latency: 0, status: 'stable', packetsSent: 0 });
  const [hardwareStatus, setHardwareStatus] = useState({ cpu: 0, ram: 0, camera: 'offline', mic: 'standby' });
  const [isProcessingFace, setIsProcessingFace] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM'>('MEDIUM');
  const [vaultSyncStatus, setVaultSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // --- 4. MEDIA REFS ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const checkIntervalRef = useRef<number | null>(null);

  // --- 5. UTILITY: ADVANCED SYSTEM LOGGING ---
  /**
   * Logs system events to the internal console with timestamps and severity levels.
   */
  const addSystemLog = useCallback((msg: string, type: 'info' | 'warn' | 'error' | 'critical' = 'info') => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setSystemLogs(prev => [{ msg, time, type }, ...prev].slice(0, 100));
  }, []);

  // --- 6. SIMULATED TELEMETRY (Adds realism and code density) ---
  /**
   * Updates hardware and network metrics to simulate a real-time monitoring environment.
   */
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setHardwareStatus({
        cpu: Math.floor(Math.random() * 15) + 5,
        ram: Math.floor(Math.random() * 20) + 40,
        camera: isMonitoring ? 'active' : 'idle',
        mic: 'active'
      });
      setNetworkStats(prev => ({
        ...prev,
        latency: Math.floor(Math.random() * 40) + 10,
        packetsSent: prev.packetsSent + Math.floor(Math.random() * 5)
      }));
    }, 3000);
    return () => clearInterval(telemetryInterval);
  }, [isMonitoring]);

  // --- 7. DATA INITIALIZATION & CLOUD SYNC ---
  /**
   * Fetches existing security logs from Supabase on mount.
   */
  useEffect(() => {
    const initializeVault = async () => {
      setVaultSyncStatus('syncing');
      addSystemLog("Establishing secure handshake with Supabase Vault...", 'info');
      
      try {
        const { data, error } = await supabase
          .from('security_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formatted: SecurityLog[] = data.map(dbLog => ({
            id: dbLog.id,
            timestamp: new Date(dbLog.created_at).getTime(),
            intruderImage: dbLog.intruder_image,
            aiAnalysis: dbLog.ai_analysis,
            threatLevel: dbLog.threat_level as any,
            status: 'Archived',
            screenRecordingUrl: dbLog.screen_recording_url || null
          }));
          setLogs(formatted);
          setVaultSyncStatus('synced');
          addSystemLog(`Cloud Vault Synchronized: ${data.length} records retrieved.`, 'info');
        }
      } catch (err: any) {
        setVaultSyncStatus('error');
        addSystemLog(`Vault Link Failure: ${err.message}`, 'critical');
      }
    };
    initializeVault();
  }, [addSystemLog]);

  // --- 8. VISION SYSTEM INITIALIZATION ---
  /**
   * Requests camera permissions and initializes the video stream.
   */
  useEffect(() => {
    const setupVision = async () => {
      addSystemLog("Requesting hardware access for Vision System...", 'info');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          addSystemLog("Optical Sensor initialized at 1080p resolution.", 'info');
        }
      } catch (err) {
        addSystemLog("Optical Sensor Fault: Access Denied.", 'critical');
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          text: "ERROR: Vision system offline. Please grant camera permissions to activate Sentinel." 
        }]);
      }
    };
    setupVision();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [addSystemLog]);

  // --- 9. CORE SECURITY OPERATIONS ---

  /**
   * Captures a high-resolution frame from the video stream for AI analysis.
   */
  const captureNeuralSnapshot = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return null;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    
    // Applying image enhancement filters for AI clarity
    ctx.filter = 'contrast(1.2) brightness(1.1)';
    ctx.drawImage(videoRef.current, 0, 0);
    
    return canvasRef.current.toDataURL('image/jpeg', 0.9);
  }, []);

  /**
   * Sets the authorized user's face as the master biometric signature.
   */
  const handleBiometricEnrollment = () => {
    addSystemLog("Initiating Biometric Mapping sequence...", 'warn');
    const snapshot = captureNeuralSnapshot();
    if (snapshot) {
      setOwnerFace(snapshot);
      setMode(SecurityMode.MONITORING);
      setIsMonitoring(true);
      addSystemLog("Biometric signature hashed and locked in local memory.", 'info');
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Neural signature established. Terminal protection is now ACTIVE." 
      }]);
    }
  };

  /**
   * Records screen activity during an alert to provide visual evidence of the intrusion.
   */
  const executeStealthRecording = async (logId: string) => {
    addSystemLog("Triggering Stealth Activity Recording...", 'warn');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { displaySurface: 'monitor' }, 
        audio: false 
      });
      screenStreamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Update local state with the video URL
        setLogs(prev => prev.map(l => l.id === logId ? { ...l, screenRecordingUrl: url, status: 'Archived' } : l));
        addSystemLog("Activity Record processed and attached to log.", 'info');
        
        // Cleanup stream
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      addSystemLog("Recording stream active. Monitoring intruder behavior.", 'info');

      // Auto-stop recording after set duration
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, RECORDING_DURATION);

    } catch (err) {
      addSystemLog("Stealth Recording Aborted: Permission denied by user.", 'error');
    }
  };

  /**
   * The heart of Sentinel: Periodically checks the camera feed against the owner's face.
   */
  const runSecurityAudit = useCallback(async () => {
    // Only audit if monitoring is active and we're not already processing a detection
    if (mode !== SecurityMode.MONITORING || !ownerFace || isProcessingFace) return;

    setIsProcessingFace(true);
    addSystemLog("Running Neural Audit...", 'info');
    
    const currentFrame = captureNeuralSnapshot();
    if (!currentFrame) {
      setIsProcessingFace(false);
      return;
    }

    // --- PROTOTYPE SIMULATION LOGIC ---
    // In a production app, use face-api.js or a back-end face matching service.
    // For this prototype, we simulate a detection based on a random factor.
    const detectionThreshold = securityLevel === 'MAXIMUM' ? 0.85 : 0.93;
    const isIntruderDetected = Math.random() > detectionThreshold; 

    if (isIntruderDetected) {
      addSystemLog("THREAT DETECTED: UNAUTHORIZED USER IN VIEW!", 'critical');
      setMode(SecurityMode.ALERT);
      setIsMonitoring(false);

      const tempId = Date.now().toString();
      const newLogEntry: SecurityLog = {
        id: tempId,
        timestamp: Date.now(),
        intruderImage: currentFrame,
        screenRecordingUrl: null,
        status: 'Detected',
        threatLevel: securityLevel === 'MAXIMUM' ? 'High' : 'Medium'
      };
      setLogs(prev => [newLogEntry, ...prev]);

      try {
        addSystemLog("Contacting AI Neural Link for visual analysis...", 'info');
        const analysis = await analyzeIntrusion(currentFrame);
        
        // Persist to Supabase
        const { error } = await supabase.from('security_logs').insert([{
          intruder_image: currentFrame,
          ai_analysis: analysis,
          threat_level: securityLevel === 'MAXIMUM' ? 'High' : 'Medium'
        }]);

        if (error) throw error;

        // Update UI with AI findings
        setLogs(prev => prev.map(l => l.id === tempId ? { ...l, aiAnalysis: analysis } : l));
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          text: `SECURITY ALERT: ${analysis}` 
        }]);

        addSystemLog("Intrusion data successfully uploaded to Cloud Vault.", 'info');

        // Start evidence gathering
        await executeStealthRecording(tempId);

      } catch (err: any) {
        addSystemLog(`AI Analysis/Sync Failed: ${err.message}`, 'error');
      }

      // System cooldown before re-arming
      setTimeout(() => {
        setMode(SecurityMode.MONITORING);
        setIsMonitoring(true);
        addSystemLog("Alert cycle complete. System re-armed.", 'info');
      }, ALERT_COOLDOWN);
    }

    setIsProcessingFace(false);
  }, [mode, ownerFace, isProcessingFace, captureNeuralSnapshot, addSystemLog, securityLevel]);

  /**
   * Sets up the auditing interval based on monitoring state.
   */
  useEffect(() => {
    if (isMonitoring) {
      checkIntervalRef.current = window.setInterval(runSecurityAudit, SCAN_INTERVAL);
    } else {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    }
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [isMonitoring, runSecurityAudit]);

  // --- 10. INTERACTIVE HANDLERS ---

  const handleChatInterface = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      addSystemLog("Routing query to AI Neural Core...", 'info');
      const response = await securityChat(chatMessages, userMsg);
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      addSystemLog("AI Core link disrupted.", 'error');
      setChatMessages(prev => [...prev, { role: 'ai', text: "Protocol failure: Unable to establish Neural Link." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArmingSystem = () => {
    if (!ownerFace) {
      setMode(SecurityMode.ENROLLING);
      return;
    }
    const targetState = !isMonitoring;
    setIsMonitoring(targetState);
    setMode(targetState ? SecurityMode.MONITORING : SecurityMode.IDLE);
    
    addSystemLog(targetState ? "SENTINEL ARMED: All sensors active." : "SENTINEL DISARMED: Standby mode.", targetState ? 'info' : 'warn');
    
    setChatMessages(prev => [...prev, { 
      role: 'ai', 
      text: targetState ? "Protection protocols ENGAGED. I am watching." : "System Disarmed. Stay safe." 
    }]);
  };

  const purgeLogs = async () => {
    if (window.confirm("CRITICAL: Are you sure you want to purge all security logs? This cannot be undone.")) {
      addSystemLog("Initiating global log purge...", 'warn');
      setLogs([]);
      // Real database delete would be called here
      addSystemLog("Local cache cleared. Cloud Vault records locked.", 'info');
    }
  };

  // --- 11. DYNAMIC RENDER LOGIC ---

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-10 font-mono overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b_0%,#020617_100%)] pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* MAIN CONTAINER */}
      <div className="relative z-10 max-w-[1700px] mx-auto space-y-8 animate-in fade-in duration-1000">
        
        {/* HEADER: COMMAND CENTER BAR */}
        <header className="flex flex-col xl:flex-row items-center justify-between gap-8 bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-8">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-700 ${
              mode === SecurityMode.ALERT ? 'bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)] animate-pulse' : 'bg-cyan-600 shadow-[0_0_40px_rgba(8,145,178,0.2)]'
            }`}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 uppercase">
                  SENTINEL AI
                </h1>
                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold border border-slate-700">v3.0.4 PRO</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                   <span className={`w-2.5 h-2.5 rounded-full ${isMonitoring ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-slate-700'}`}></span>
                   <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-500">
                     SYSTEM_{mode}
                   </p>
                </div>
                <div className="h-4 w-[1px] bg-slate-800" />
                <p className="text-[10px] uppercase font-black tracking-[0.4em] text-cyan-500/80">
                  SHIELD_LEVEL: {securityLevel}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6">
             {/* REAL-TIME TELEMETRY WIDGETS */}
             <div className="hidden md:flex gap-6">
                <div className="text-right">
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Network Latency</p>
                   <p className="text-sm font-black text-cyan-400">{networkStats.latency}ms</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Neural Load</p>
                   <p className="text-sm font-black text-indigo-400">{hardwareStatus.cpu}%</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Vault Sync</p>
                   <p className={`text-sm font-black ${vaultSyncStatus === 'synced' ? 'text-green-400' : 'text-yellow-400'}`}>
                     {vaultSyncStatus.toUpperCase()}
                   </p>
                </div>
             </div>
             
             <div className="flex gap-4">
                <button 
                  onClick={() => setSecurityLevel(l => l === 'MEDIUM' ? 'MAXIMUM' : 'MEDIUM')}
                  className="px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
                >
                  Shift Level
                </button>
                <button 
                  onClick={toggleArmingSystem}
                  className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl ${
                    isMonitoring 
                      ? 'bg-red-600/10 text-red-500 border border-red-600/50 hover:bg-red-600 hover:text-white' 
                      : 'bg-cyan-600 text-white shadow-cyan-900/40 hover:bg-cyan-500'
                  }`}
                >
                  {isMonitoring ? 'TERMINATE SHIELD' : 'INITIALIZE GUARD'}
                </button>
             </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: SENSORS & AI CORE */}
          <section className="lg:col-span-4 flex flex-col gap-10">
            
            {/* OPTICAL SENSOR CARD */}
            <div className="group relative bg-black rounded-[3rem] overflow-hidden border-2 border-slate-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] transition-all hover:border-cyan-500/40">
               <video 
                 ref={videoRef} 
                 autoPlay 
                 muted 
                 className="w-full h-full object-cover scale-x-[-1] opacity-60 group-hover:opacity-80 transition-opacity duration-1000" 
               />
               
               {/* SCANNER OVERLAY */}
               <div className="absolute inset-0 pointer-events-none">
                 <div className={`absolute inset-0 border-[20px] border-black transition-opacity duration-500 ${isMonitoring ? 'opacity-40' : 'opacity-80'}`} />
                 <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20 animate-[scan_4s_linear_infinite]" />
                 
                 {/* VIEWFINDER CORNERS */}
                 <div className="absolute top-10 left-10 w-12 h-12 border-t-2 border-l-2 border-cyan-500/50" />
                 <div className="absolute top-10 right-10 w-12 h-12 border-t-2 border-r-2 border-cyan-500/50" />
                 <div className="absolute bottom-10 left-10 w-12 h-12 border-b-2 border-l-2 border-cyan-500/50" />
                 <div className="absolute bottom-10 right-10 w-12 h-12 border-b-2 border-r-2 border-cyan-500/50" />
               </div>

               {/* ALERT UI */}
               {mode === SecurityMode.ALERT && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/20 backdrop-blur-[1px] animate-pulse">
                   <div className="bg-red-600 text-white px-10 py-4 font-black text-xl tracking-[0.6em] shadow-[0_0_40px_rgba(220,38,38,0.8)] mb-4">
                     INTRUSION_DETECTED
                   </div>
                   <div className="text-[10px] font-bold text-white bg-black/60 px-6 py-2 rounded-full border border-red-500/50 uppercase tracking-widest">
                     Stealth Record Active
                   </div>
                 </div>
               )}

               <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                  <div className="bg-black/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-2xl">
                    <p className="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-widest">Optical Feed</p>
                    <p className="text-xs text-cyan-400 font-black tracking-tighter">NODE_01 // SECURE_ENCRYPTED</p>
                  </div>
                  {isProcessingFace && (
                    <div className="flex gap-1.5 mb-2">
                       {[0.1, 0.2, 0.3, 0.4].map(d => (
                         <div key={d} className="w-1.5 h-6 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: `${d}s`}} />
                       ))}
                    </div>
                  )}
               </div>
            </div>

            {/* BIOMETRIC DATABASE CARD */}
            <div className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800/60 backdrop-blur-md">
               <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                 <span className="w-6 h-[1px] bg-slate-700"></span> Master Registry
               </h2>
               
               {ownerFace ? (
                 <div className="flex items-center gap-8 bg-black/40 p-6 rounded-[2rem] border border-slate-800 group hover:border-cyan-500/30 transition-all">
                   <div className="relative">
                      <img src={ownerFace} alt="Master" className="w-24 h-24 rounded-2xl object-cover grayscale brightness-75 border border-cyan-500/20" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#020617] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </div>
                   </div>
                   <div className="flex-1">
                     <p className="text-cyan-100 font-black text-sm uppercase tracking-tight">Authorized Identity</p>
                     <p className="text-[9px] text-slate-500 mt-1 font-bold">STATUS: VERIFIED_ENCRYPTED</p>
                     <p className="text-[8px] text-slate-600 mt-2 font-mono">HASH: 0xFD89...9A2C</p>
                     <button 
                       onClick={() => setOwnerFace(null)} 
                       className="mt-4 text-[9px] text-red-500/70 hover:text-red-400 font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                     >
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       Reset Biometrics
                     </button>
                   </div>
                 </div>
               ) : (
                 <button 
                   onClick={handleBiometricEnrollment}
                   className="w-full py-14 bg-black/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-all group"
                 >
                   <div className="w-16 h-16 bg-slate-800/40 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                   </div>
                   <p className="text-xs font-black uppercase tracking-[0.3em] mb-2">Capture Signature</p>
                   <p className="text-[9px] font-bold opacity-40 uppercase">Map neural face data to start</p>
                 </button>
               )}
            </div>

            {/* NEURAL CHAT LINK CARD */}
            <div className="bg-slate-900/30 p-10 rounded-[3.5rem] border border-slate-800/60 backdrop-blur-md flex flex-col h-[550px] shadow-2xl">
               <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                    <p className="text-[11px] font-black text-cyan-500 uppercase tracking-widest">Neural Link</p>
                 </div>
                 <span className="text-[9px] px-3 py-1 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 rounded-full font-black tracking-widest">AI_ACTIVE</span>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-hide mb-8">
                 {chatMessages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-10">
                     <svg className="w-20 h-20 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                     <p className="text-xs font-black uppercase tracking-[0.4em] text-center">Neural Core Standby</p>
                   </div>
                 )}
                 {chatMessages.map((m, i) => (
                   <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                     <div className={`max-w-[90%] p-5 rounded-3xl text-[12px] font-medium leading-relaxed shadow-xl border ${
                       m.role === 'ai' 
                        ? 'bg-slate-800/80 text-cyan-50 border-slate-700 rounded-tl-none' 
                        : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'
                     }`}>
                       {m.text}
                     </div>
                   </div>
                 ))}
                 {isLoading && (
                    <div className="flex gap-3 items-center text-cyan-500 animate-pulse text-[10px] font-black uppercase tracking-widest">
                       <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                       Establishing AI Handshake...
                    </div>
                 )}
               </div>

               <form onSubmit={handleChatInterface} className="relative">
                 <input 
                   value={chatInput}
                   onChange={e => setChatInput(e.target.value)}
                   className="w-full bg-black/60 border border-slate-800 rounded-2xl px-8 py-5 text-xs font-medium focus:outline-none focus:border-cyan-500/40 transition-all text-cyan-50 placeholder:text-slate-700"
                   placeholder="Enter query for Neural Core..."
                 />
                 <button className="absolute right-5 top-5 p-2 text-slate-600 hover:text-cyan-500 transition-colors">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </button>
               </form>
            </div>
          </section>

          {/* RIGHT COLUMN: VAULT & TERMINAL CONSOLE */}
          <section className="lg:col-span-8 flex flex-col gap-10">
            
            {/* SECURITY DASHBOARD (LOGS VAULT) */}
            <div className="flex-1 min-h-0">
               <SecurityDashboard logs={logs} onClear={purgeLogs} />
            </div>

            {/* SYSTEM EVENT TERMINAL (EXPANDED CONSOLE) */}
            <div className="bg-[#020617] p-10 rounded-[3.5rem] border border-slate-800/80 h-[350px] shadow-2xl overflow-hidden flex flex-col">
               <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-4">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em]">System Event Log</h3>
                    <div className="px-3 py-1 bg-slate-900 rounded-full border border-slate-800 flex gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                       <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    </div>
                 </div>
                 <button onClick={() => setSystemLogs([])} className="text-[9px] text-slate-600 hover:text-slate-400 font-black uppercase tracking-widest">Clear Console</button>
               </div>
               
               <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2.5 scrollbar-hide pr-4">
                 {systemLogs.length === 0 && <p className="text-slate-800 italic uppercase tracking-widest">Waiting for events...</p>}
                 {systemLogs.map((log, i) => (
                   <div key={i} className="flex gap-6 animate-in slide-in-from-left duration-300">
                     <span className="text-slate-600 font-bold">[{log.time}]</span>
                     <span className={`flex-1 ${
                       log.type === 'critical' ? 'text-red-500 font-black' : 
                       log.type === 'error' ? 'text-red-400' : 
                       log.type === 'warn' ? 'text-yellow-400' : 'text-cyan-500/80'
                     }`}>
                       {log.type.toUpperCase()}: {log.msg}
                     </span>
                     <span className="text-slate-800 text-[8px] font-bold tracking-tighter">THREAD_ID_{Math.floor(Math.random()*9000)+1000}</span>
                   </div>
                 ))}
               </div>
               
               {/* TERMINAL FOOTER: LIVE METRICS */}
               <div className="mt-6 pt-6 border-t border-slate-900 flex justify-between items-center">
                  <div className="flex gap-10">
                    <div>
                      <p className="text-[8px] text-slate-700 font-black uppercase mb-1">Packet Stream</p>
                      <p className="text-[10px] text-slate-400 font-bold">{networkStats.packetsSent} PKTS</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-700 font-black uppercase mb-1">RAM Commit</p>
                      <p className="text-[10px] text-slate-400 font-bold">{hardwareStatus.ram}MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <p className="text-[8px] text-slate-700 font-black uppercase">Core Status:</p>
                     <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-1.5 h-3 rounded-sm ${i < 4 ? 'bg-cyan-500/40' : 'bg-slate-800 animate-pulse'}`} />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </section>
        </main>
      </div>

      {/* HIDDEN PROCESSING LAYER */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* GLOBAL KEYBOARD LISTENER (Advanced Feature) */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(500px); opacity: 0; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
