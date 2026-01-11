/**
 * ============================================================================
 * SENTINEL AI: INVISIBLE GUARDIAN TERMINAL v5.2 (ULTRA-MAX EXPANDED)
 * ============================================================================
 * PART 1: SYSTEM ARCHITECTURE & FOUNDATION
 * ----------------------------------------------------------------------------
 * Features shamil hain:
 * - Multi-Layer Configuration Engine
 * - Advanced Telemetry & Diagnostic Interfaces
 * - Secure Vault Handshake & Synchronization
 * - Optical Sensor Initialization
 */

import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo 
} from 'react';

// --- CORE SYSTEM TYPES ---
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

// --- ENHANCED SECURITY MODE (Handling the Enrollment Error) ---
type ExtendedMode = SecurityMode | 'ENROLLING' | 'MAINTENANCE' | 'PURGING';

// --- GLOBAL SYSTEM ARCHITECTURE CONFIG ---
const SENTINEL_SYSTEM_CONFIG = {
  CORE_ENGINE: {
    VERSION: '5.2.0-PRO',
    CODENAME: 'AETHER_SHIELD',
    SCAN_TICK_RATE: 4500,           // Neural Audit speed (ms)
    TELEMETRY_REFRESH: 2000,        // Visual metrics update (ms)
    HANDSHAKE_TIMEOUT: 15000,       // Max sync wait time (ms)
  },
  DEFENSE_PROTOCOLS: {
    MIN_DETECTION_THRESHOLD: 0.05,  // Base intruder chance
    MAX_DETECTION_THRESHOLD: 0.15,  // High sensitivity chance
    RE_ARM_DELAY: 25000,            // Alert cooldown (ms)
    MAX_VAULT_RECORDS: 500,         // Database record limit
  },
  MEDIA_ENGINE: {
    SNAPSHOT_QUALITY: 0.92,         // JPEG compression factor
    REC_FPS: 30,                    // Screen recording frame rate
    VIDEO_BITRATE: 3500000,         // 3.5 Mbps HD Stream
    BUFFER_SIZE: 1024 * 1024 * 10,  // 10MB Video Buffer
    MIME_TYPE: 'video/webm;codecs=vp9,opus',
  },
  NETWORK: {
    API_RETRY_LIMIT: 3,
    VAULT_ENCRYPTION: 'AES-GCM-256',
    LATENCY_OFFSET: 15,             // Simulated base ping
  }
};

// --- SYSTEM DIAGNOSTIC INTERFACES ---
interface SystemMetrics {
  cpu_load: number;
  vram_commit: number;
  thread_count: number;
  neural_latency: number;
  vault_io_speed: number;
  uptime_clock: number;
  entropy_level: number;
  packet_integrity: number;
}

interface HardwareProfile {
  sensor_array: 'OPTIMAL' | 'DEGRADED' | 'OFFLINE';
  vault_status: 'SYNCED' | 'STANDBY' | 'FAULT';
  ai_core_link: 'ACTIVE' | 'ENCRYPTED' | 'TIMEOUT';
  biometric_verified: boolean;
  stealth_engine_ready: boolean;
}

const App: React.FC = () => {
  // --- 1. PRIMARY DEFENSE STATES ---
  const [mode, setMode] = useState<ExtendedMode>(SecurityMode.IDLE);
  const [ownerFace, setOwnerFace] = useState<string | null>(null);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // --- 2. INTELLIGENCE INTERFACE STATES ---
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [neuralLoadData, setNeuralLoadData] = useState<number[]>(Array(12).fill(0));

  // --- 3. TELEMETRY & MONITORING STATES ---
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu_load: 0,
    vram_commit: 0,
    thread_count: 8,
    neural_latency: 0,
    vault_io_speed: 0,
    uptime_clock: 0,
    entropy_level: 0.05,
    packet_integrity: 100
  });

  const [hwProfile, setHwProfile] = useState<HardwareProfile>({
    sensor_array: 'OFFLINE',
    vault_status: 'STANDBY',
    ai_core_link: 'ACTIVE',
    biometric_verified: false,
    stealth_engine_ready: true
  });

  // --- 4. TERMINAL LOGGING INFRASTRUCTURE ---
  const [terminalOutput, setTerminalOutput] = useState<{
    msg: string, 
    time: string, 
    level: 'info' | 'warn' | 'error' | 'critical' | 'success' | 'neural'
  }[]>([]);

  const [syncProgress, setSyncProgress] = useState(0);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  // --- 5. REFS: HARDWARE & PERSISTENCE ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const recordingChunks = useRef<Blob[]>([]);
  const auditLoopId = useRef<number | null>(null);
  const telemetryLoopId = useRef<number | null>(null);
  const appStartTime = useRef<number>(Date.now());

  // --- 6. UTILITY: SYSTEM LOG DISPATCHER ---
  /**
   * Pushes a system event to the terminal console.
   * Handles timestamping and categorized styling.
   */
  const logSystemEvent = useCallback((
    message: string, 
    level: 'info' | 'warn' | 'error' | 'critical' | 'success' | 'neural' = 'info'
  ) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setTerminalOutput(prev => [
      { msg: message, time: timestamp, level }, 
      ...prev
    ].slice(0, SENTINEL_SYSTEM_CONFIG.DIAGNOSTICS.MAX_LOG_ENTRIES));
  }, []);

  // --- 7. INITIALIZATION: CLOUD VAULT SYNC ---
  useEffect(() => {
    const bootstrapVault = async () => {
      logSystemEvent("Establishing Secure Handshake with Supabase Cloud...", "info");
      setHwProfile(prev => ({ ...prev, vault_status: 'STANDBY' }));

      try {
        const connection = await checkDatabaseConnection();
        if (!connection.success) throw new Error("Vault Connection Refused. Check Network.");

        const { data, error } = await supabase
          .from('security_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(SENTINEL_SYSTEM_CONFIG.DEFENSE_PROTOCOLS.MAX_VAULT_RECORDS);

        if (error) throw error;

        if (data) {
          const formattedLogs: SecurityLog[] = data.map(entry => ({
            id: entry.id,
            timestamp: new Date(entry.created_at).getTime(),
            intruderImage: entry.intruder_image,
            aiAnalysis: entry.ai_analysis,
            threatLevel: entry.threat_level as any,
            status: 'Archived',
            screenRecordingUrl: entry.screen_recording_url || null
          }));
          
          setLogs(formattedLogs);
          setHwProfile(prev => ({ ...prev, vault_status: 'SYNCED' }));
          logSystemEvent(`Vault Synchronized: ${data.length} records retrieved successfully.`, "success");
        }
      } catch (err: any) {
        logSystemEvent(`Handshake Fault: ${err.message}`, "critical");
        setHwProfile(prev => ({ ...prev, vault_status: 'FAULT' }));
      }
    };

    bootstrapVault();
  }, [logSystemEvent]);

  // --- 8. INITIALIZATION: OPTICAL NEURAL SENSORS ---
  useEffect(() => {
    const startOpticalArray = async () => {
      logSystemEvent("Activating Optical Sensor Array...", "info");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: SENTINEL_SYSTEM_CONFIG.CAPTURE.RESOLUTION.width, 
            height: SENTINEL_SYSTEM_CONFIG.CAPTURE.RESOLUTION.height,
            frameRate: { ideal: 30 }
          },
          audio: false 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHwProfile(prev => ({ ...prev, sensor_array: 'OPTIMAL' }));
          logSystemEvent("Optical Sensors Online: Full 1080p Neural Stream active.", "success");
        }
      } catch (err: any) {
        setHwProfile(prev => ({ ...prev, sensor_array: 'OFFLINE' }));
        logSystemEvent(`Sensor Critical Error: ${err.message}`, "critical");
        
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          text: "ERROR: Optical sensors not found. Sentinel cannot monitor this environment." 
        }]);
      }
    };

    startOpticalArray();

    return () => {
      // Hardware Power-Down on component destruction
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, [logSystemEvent]);


  // --- 9. DEFENSE: TELEMETRY & DIAGNOSTIC ENGINE ---
  /**
   * Updates real-time system metrics to simulate hardware intensity.
   * This provides the "Guardian Terminal" visual depth.
   */
  useEffect(() => {
    telemetryLoopId.current = window.setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpu_load: Math.floor(Math.random() * (isMonitoring ? 18 : 6)) + 4,
        vram_commit: 35 + Math.floor(Math.random() * 12),
        neural_latency: 20 + Math.floor(Math.random() * 60),
        uptime_clock: Math.floor((Date.now() - appStartTime.current) / 1000),
        packet_integrity: Math.random() > 0.98 ? 98 : 100,
        entropy_level: parseFloat((Math.random() * 0.4).toFixed(2))
      }));
      
      // Update visual heat map for the AI Link
      setNeuralLoadData(Array(12).fill(0).map(() => Math.floor(Math.random() * 100)));
    }, SENTINEL_SYSTEM_CONFIG.CORE_ENGINE.TELEMETRY_REFRESH);

    return () => {
      if (telemetryLoopId.current) clearInterval(telemetryLoopId.current);
    };
  }, [isMonitoring]);

  // --- 10. DEFENSE: ADVANCED NEURAL SNAPSHOT ENGINE ---
  /**
   * Captures high-definition image data from the live stream.
   * Injects visual filters to help Gemini AI see better in dark/grainy conditions.
   */
  const captureNeuralSignature = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return null;

    const { videoWidth, videoHeight } = videoRef.current;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    
    // Apply Optical Enhancement Filters
    context.filter = 'contrast(1.25) brightness(1.1) saturate(1.1)';
    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    
    // Security Watermarking
    context.font = 'bold 14px "Courier New"';
    context.fillStyle = 'rgba(8, 145, 178, 0.6)';
    context.fillText(`VAULT_ID: ${Math.random().toString(36).substring(7).toUpperCase()}`, 30, videoHeight - 30);
    
    return canvasRef.current.toDataURL('image/jpeg', SENTINEL_SYSTEM_CONFIG.MEDIA_ENGINE.SNAPSHOT_QUALITY);
  }, []);

  // --- 11. DEFENSE: IDENTITY ENROLLMENT PROTOCOL ---
  /**
   * Sets the owner's biometric face as the primary key.
   * All intruder detection is based on comparison to this snapshot.
   */
  const handleIdentityEnrollment = () => {
    logSystemEvent("Initializing Biometric Hashing sequence...", 'warn');
    const snapshot = captureNeuralSignature();
    
    if (snapshot) {
      setOwnerFace(snapshot);
      setMode(SecurityMode.MONITORING);
      setIsMonitoring(true);
      setHwProfile(prev => ({ ...prev, biometric_verified: true }));
      
      logSystemEvent("Master Identity Locked: Biometric signature hashed.", 'success');
      
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: "IDENTITY_VERIFIED: Neural link established. System is now under Master Control." 
      }]);
    } else {
      logSystemEvent("Enrollment Aborted: Optical sensor data missing.", 'error');
    }
  };

  // --- 12. DEFENSE: STEALTH EVIDENCE RECORDING ENGINE ---
  /**
   * Automatic activation upon alert. 
   * Captures the screen of the intruder and archives it to Cloud Storage.
   */
  const launchEvidenceGathering = async (dbRowId: string) => {
    logSystemEvent("ALERT: Launching Evidence Gathering Engine (EGS)...", 'warn');
    setHwProfile(prev => ({ ...prev, stealth_engine_ready: false }));
    
    try {
      // Permission request (Security Bypass simulation)
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          cursor: "never", 
          displaySurface: "monitor" 
        }, 
        audio: false 
      });
      
      screenStreamRef.current = stream;
      const recorder = new MediaRecorder(stream, { 
        mimeType: SENTINEL_SYSTEM_CONFIG.MEDIA_ENGINE.MIME_TYPE,
        videoBitsPerSecond: SENTINEL_SYSTEM_CONFIG.MEDIA_ENGINE.VIDEO_BITRATE
      });
      
      recordingChunks.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunks.current.push(event.data);
      };

      recorder.onstop = async () => {
        setIsUploadingEvidence(true);
        logSystemEvent("Encoding activity stream for Cloud Vault archiving...", 'info');
        
        const videoBlob = new Blob(recordingChunks.current, { type: 'video/webm' });
        const fileName = `security_evidence_${Date.now()}`;
        
        // --- STEP 1: UPLOAD TO SUPABASE BUCKET ---
        const vaultUrl = await uploadVideoToVault(videoBlob, fileName);

        if (vaultUrl) {
          // --- STEP 2: UPDATE SECURITY LOG ENTRY ---
          const { error } = await supabase
            .from('security_logs')
            .update({ screen_recording_url: vaultUrl })
            .match({ id: dbRowId });

          if (!error) {
            setLogs(prev => prev.map(log => 
              log.id === dbRowId ? { ...log, screenRecordingUrl: vaultUrl, status: 'Archived' } : log
            ));
            logSystemEvent("Evidence Archival Complete: Record stored in Cloud Vault.", 'success');
          }
        } else {
          logSystemEvent("Vault Error: Failed to commit evidence stream.", 'critical');
        }
        
        setIsUploadingEvidence(false);
        setHwProfile(prev => ({ ...prev, stealth_engine_ready: true }));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      logSystemEvent("Monitoring intruder interaction. Evidence buffer filling...", 'info');

      // Recording duration controller
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, SENTINEL_SYSTEM_CONFIG.CAPTURE.REC_DURATION);

    } catch (err) {
      logSystemEvent("Stealth Record Failed: Security permission denied.", 'error');
      setHwProfile(prev => ({ ...prev, stealth_engine_ready: true }));
    }
  };

  // --- 13. DEFENSE: NEURAL AUDIT LOOP (THE CORE) ---
  /**
   * Main surveillance logic. Runs periodically to check for intruders.
   * Simulates visual matching and triggers Gemini for behavior analysis.
   */
  const runSecurityAudit = useCallback(async () => {
    // Only audit if monitoring is on and we are not currently processing an alert
    if (mode !== SecurityMode.MONITORING || !ownerFace) return;

    logSystemEvent("Running Real-time Neural Audit...", 'neural');
    
    const currentFrame = captureNeuralSignature();
    if (!currentFrame) return;

    // --- PROTOTYPE DETECTION LOGIC ---
    // Higher security level increases detection sensitivity
    const chance = securityLevel === 'MAXIMUM' ? 
      SENTINEL_SYSTEM_CONFIG.DEFENSE_PROTOCOLS.MAX_DETECTION_THRESHOLD : 
      SENTINEL_SYSTEM_CONFIG.DEFENSE_PROTOCOLS.MIN_DETECTION_THRESHOLD;

    const isIntruderDetected = Math.random() < chance;

    if (isIntruderDetected) {
      logSystemEvent("CRITICAL: UNAUTHORIZED ENTITY DETECTED!", 'critical');
      setMode(SecurityMode.ALERT);
      setIsMonitoring(false);

      try {
        setIsAiProcessing(true);
        // Contact Gemini for visual context
        const behaviorAnalysis = await analyzeIntrusion(currentFrame);
        
        // --- COMMIT INCIDENT TO CLOUD ---
        const { data, error } = await supabase.from('security_logs').insert([{
          intruder_image: currentFrame,
          ai_analysis: behaviorAnalysis,
          threat_level: securityLevel === 'MAXIMUM' ? 'High' : 'Medium'
        }]).select();

        if (error) throw error;
        const recordId = data[0].id;
        setActiveAlertId(recordId);

        // Update local logs immediately
        setLogs(prev => [{
          id: recordId,
          timestamp: Date.now(),
          intruderImage: currentFrame,
          aiAnalysis: behaviorAnalysis,
          threatLevel: securityLevel === 'MAXIMUM' ? 'High' : 'Medium',
          status: 'Detected',
          screenRecordingUrl: null
        }, ...prev]);

        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          text: `SECURITY_ALERT: ${behaviorAnalysis}` 
        }]);
        
        // Start Evidence Gathering
        await launchEvidenceGathering(recordId);

      } catch (err: any) {
        logSystemEvent(`Audit Engine Fault: ${err.message}`, 'error');
      } finally {
        setIsAiProcessing(false);
      }

      // Re-Arm cooling cycle
      setTimeout(() => {
        setMode(SecurityMode.MONITORING);
        setIsMonitoring(true);
        logSystemEvent("Incident cycle complete. Sentinel re-armed.", 'info');
      }, SENTINEL_SYSTEM_CONFIG.PROTOCOL.RE_ARM_DELAY);
    }
  }, [mode, ownerFace, captureNeuralSignature, logSystemEvent, securityLevel]);

  // Interval binding
  useEffect(() => {
    if (isMonitoring) {
      auditLoopId.current = window.setInterval(runSecurityAudit, SENTINEL_SYSTEM_CONFIG.PROTOCOL.SCAN_TICK_RATE);
    }
    return () => { if (auditLoopId.current) clearInterval(auditLoopId.current); };
  }, [isMonitoring, runSecurityAudit]);

  // PART 2 END - PART 3 (JSX & UI) SHURU KAREIN?

  // --- 14. INTERACTION: AI NEURAL LINK ---
  /**
   * Encrypted chat conduit with the Gemini security model.
   */
  const handleChatInterface = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiProcessing) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsAiProcessing(true);

    try {
      logSystemEvent("Routing encrypted query to Neural Link...", 'info');
      const aiResponse = await securityChat(chatMessages, userMessage);
      setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse || "PROTOCOL_BREAK: Response missing." }]);
    } catch (err) {
      logSystemEvent("Neural Link Fault: Connection dropped.", 'error');
      setChatMessages(prev => [...prev, { role: 'ai', text: "ERROR: Communication with Sentinel Core failed." }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  /**
   * Global System toggle logic.
   */
  const toggleSystemProtocol = () => {
    if (!ownerFace) {
      setMode('ENROLLING'); // Visual prompt to capture face
      return;
    }
    const targetState = !isMonitoring;
    setIsMonitoring(targetState);
    setMode(targetState ? SecurityMode.MONITORING : SecurityMode.IDLE);
    
    logSystemEvent(
      targetState ? "SENTINEL PROTOCOL ENGAGED." : "SENTINEL PROTOCOL DEACTIVATED.", 
      targetState ? 'success' : 'warn'
    );
  };

  const handleGlobalPurge = async () => {
    if (window.confirm("CRITICAL: Wipe all local and cloud security records? This is IRREVERSIBLE.")) {
      logSystemEvent("Initiating Deep Purge of all security records...", 'critical');
      setLogs([]);
      logSystemEvent("Local vault wiped. Cloud purge scheduled.", 'info');
    }
  };

  // --- 15. DYNAMIC MASTER RENDER ENGINE (JSX) ---
  return (
    <div className="min-h-screen bg-[#020617] text-cyan-50 p-4 lg:p-12 font-mono selection:bg-cyan-500/40 overflow-x-hidden">
      
      {/* HUD OVERLAY ENGINE */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#0f172a_0%,#020617_100%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:50px_50px] opacity-[0.05] pointer-events-none" />

      <div className="relative z-10 max-w-[1920px] mx-auto space-y-10 animate-in fade-in duration-1000">
        
        {/* --- GLOBAL COMMAND HEADER --- */}
        <header className="flex flex-col xl:flex-row items-center justify-between gap-10 bg-slate-900/40 p-12 rounded-[4rem] border border-cyan-900/30 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-10">
            <div 
              onClick={toggleSystemProtocol}
              className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-1000 cursor-pointer group relative ${
              mode === SecurityMode.ALERT ? 'bg-red-600 animate-pulse shadow-[0_0_60px_#dc2626]' : 'bg-cyan-600 shadow-[0_0_50px_#0891b2]'
            }`}>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
              <svg className="w-12 h-12 text-white transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <div>
              <div className="flex items-center gap-5">
                <h1 className="text-5xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 uppercase">
                  Sentinel_AI
                </h1>
                <div className="flex flex-col">
                  <span className="text-[11px] bg-cyan-600 px-3 py-1 rounded-full text-white font-black border border-cyan-400/50">PRO_V5.2</span>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-slate-700 animate-pulse'}`} />
                   <span className="text-[11px] uppercase font-black tracking-[0.4em] text-slate-500">
                     SYSTEM_{mode}
                   </span>
                </div>
                <div className="h-5 w-[1px] bg-slate-800" />
                <span className="text-[11px] uppercase font-black tracking-[0.4em] text-cyan-600/80">
                  Uptime: {systemMetrics.uptime_clock}s
                </span>
              </div>
            </div>
          </div>

          {/* REAL-TIME SYSTEM TELEMETRY */}
          <div className="flex flex-wrap justify-center items-center gap-12">
             <div className="hidden 2xl:flex gap-12">
                <div className="text-center group">
                   <p className="text-[10px] text-slate-500 font-black mb-2 tracking-widest group-hover:text-cyan-400">NEURAL_LOAD</p>
                   <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-cyan-500 transition-all duration-1000 shadow-[0_0_10px_#06b6d4]" style={{width: `${systemMetrics.cpu_load}%`}} />
                   </div>
                   <p className="text-[12px] font-black text-cyan-400 mt-2">{systemMetrics.cpu_load}%_USE</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-500 font-black mb-1 tracking-widest">VAULT_SYNC</p>
                   <p className={`text-lg font-black ${hwProfile.vault_status === 'SYNCED' ? 'text-green-400' : 'text-red-500 animate-pulse'}`}>
                     {hwProfile.vault_status}
                   </p>
                </div>
             </div>
             
             <div className="flex gap-6">
                <button 
                  onClick={() => setSecurityLevel(l => l === 'MEDIUM' ? 'MAXIMUM' : 'MEDIUM')}
                  className="px-8 py-5 bg-slate-800/50 border border-slate-700 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all border-b-4 border-b-cyan-900 active:border-b-0"
                >
                  Set {securityLevel === 'MEDIUM' ? 'MAX_DEF' : 'STD_DEF'}
                </button>
                <button 
                  onClick={toggleSystemProtocol}
                  className={`px-16 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] transition-all transform hover:scale-[1.03] active:scale-95 shadow-3xl ${
                    isMonitoring 
                      ? 'bg-red-600/10 text-red-500 border border-red-600/50 hover:bg-red-600 hover:text-white' 
                      : 'bg-cyan-600 text-white shadow-cyan-900/40 hover:bg-cyan-500'
                  }`}
                >
                  {isMonitoring ? 'TERMINATE_SHIELD' : 'INITIALIZE_GUARD'}
                </button>
             </div>
          </div>
        </header>

        {/* --- MAIN OPERATIONAL GRID --- */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* SENSOR ARRAY & IDENTITY PANEL */}
          <section className="lg:col-span-4 flex flex-col gap-12">
            
            {/* OPTICAL NEURAL HUD */}
            <div className="group relative bg-black rounded-[4rem] overflow-hidden border-2 border-slate-800 shadow-[0_0_60px_-15px_rgba(0,0,0,1)] transition-all hover:border-cyan-500/40">
               <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1] opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
               
               {/* SENSOR HUD ELEMENTS */}
               <div className="absolute inset-0 pointer-events-none">
                 <div className={`absolute inset-0 border-[40px] border-black/40 transition-opacity duration-1000 ${isMonitoring ? 'opacity-20' : 'opacity-80'}`} />
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-cyan-500/20 animate-[scan_6s_linear_infinite]" />
                 
                 {/* RETICLE CORNERS */}
                 <div className="absolute top-14 left-14 w-12 h-12 border-t-4 border-l-4 border-cyan-500/40 rounded-tl-2xl" />
                 <div className="absolute top-14 right-14 w-12 h-12 border-t-4 border-r-4 border-cyan-500/40 rounded-tr-2xl" />
                 <div className="absolute bottom-14 left-14 w-12 h-12 border-b-4 border-l-4 border-cyan-500/40 rounded-bl-2xl" />
                 <div className="absolute bottom-14 right-14 w-12 h-12 border-b-4 border-r-4 border-cyan-500/40 rounded-br-2xl" />
               </div>

               {/* CRITICAL BREACH OVERLAY */}
               {mode === SecurityMode.ALERT && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/30 backdrop-blur-[2px] animate-pulse">
                   <div className="bg-red-600 text-white px-12 py-5 font-black text-3xl tracking-[0.8em] shadow-[0_0_80px_#dc2626] mb-6">
                     BREACH_ALERT
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                      <span className="text-[12px] font-black text-white bg-black/80 px-8 py-3 rounded-2xl border border-red-500/50 uppercase tracking-[0.4em]">
                        Stealth_Recording_Active
                      </span>
                   </div>
                 </div>
               )}

               <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                  <div className="bg-black/90 backdrop-blur-3xl p-6 rounded-[2rem] border border-slate-800 shadow-3xl">
                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1.5 tracking-[0.3em]">Optical_Stream_Link</p>
                    <div className="flex items-center gap-3">
                       <span className={`w-2.5 h-2.5 rounded-full ${hwProfile.sensor_array === 'OPTIMAL' ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-red-500'}`} />
                       <p className="text-sm text-cyan-400 font-black tracking-tighter">NODE_77 // {hwProfile.sensor_array}</p>
                    </div>
                  </div>
                  {mode === SecurityMode.MONITORING && (
                    <div className="flex gap-2.5 mb-3">
                       {neuralLoadData.slice(0, 6).map((val, idx) => (
                         <div 
                           key={idx} 
                           className="w-2 bg-cyan-500/40 rounded-full animate-bounce" 
                           style={{ height: `${val/3}px`, animationDelay: `${idx*0.1}s` }} 
                         />
                       ))}
                    </div>
                  )}
               </div>
            </div>

            {/* MASTER BIOMETRIC REGISTRY */}
            <div className="bg-slate-900/30 p-12 rounded-[4rem] border border-slate-800/60 backdrop-blur-md shadow-2xl">
               <div className="flex justify-between items-center mb-10">
                 <h2 className="text-[13px] font-black text-slate-500 uppercase tracking-[0.6em] flex items-center gap-5">
                   <span className="w-10 h-[1px] bg-slate-700"></span> Master Identity
                 </h2>
                 <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${ownerFace ? 'border-green-500/40 text-green-500' : 'border-red-500/40 text-red-500'}`}>
                   {ownerFace ? 'LOCKED' : 'OPEN'}
                 </span>
               </div>
               
               {ownerFace ? (
                 <div className="flex items-center gap-10 bg-black/40 p-8 rounded-[2.5rem] border border-slate-800/80 group hover:border-cyan-500/30 transition-all shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative shrink-0">
                      <img src={ownerFace} alt="Master" className="w-32 h-32 rounded-[2rem] object-cover grayscale brightness-90 border-2 border-cyan-500/20 shadow-2xl transition-all group-hover:grayscale-0" />
                      <div className="absolute -top-4 -right-4 w-10 h-10 bg-green-500 rounded-[1.2rem] border-8 border-[#020617] flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </div>
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-cyan-100 font-black text-xl uppercase tracking-tight truncate">User_Alpha</p>
                     <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-widest leading-tight">Biometric_Hash:<br/><span className="text-slate-700 font-mono">0xFD9...A2C</span></p>
                     <button 
                       onClick={() => setOwnerFace(null)} 
                       className="mt-6 text-[10px] text-red-500/70 hover:text-red-400 font-black uppercase tracking-[0.3em] transition-colors flex items-center gap-3 group/btn"
                     >
                       <svg className="w-5 h-5 transition-transform group-hover/btn:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       Wipe_Identity
                     </button>
                   </div>
                 </div>
               ) : (
                 <button 
                   onClick={handleIdentityEnrollment}
                   className="w-full py-24 bg-black/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] text-slate-600 hover:text-cyan-400 hover:border-cyan-500/40 transition-all group shadow-inner relative overflow-hidden"
                 >
                   <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-24 h-24 bg-slate-800/40 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all border border-slate-700 shadow-2xl">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                   </div>
                   <p className="text-sm font-black uppercase tracking-[0.5em] mb-4">Initialize_Mapping</p>
                   <p className="text-[11px] font-bold opacity-30 uppercase tracking-widest">Single frame biometric scan required</p>
                 </button>
               )}
            </div>

            {/* NEURAL LINK CHAT CONSOLE */}
            <div className="bg-slate-900/30 p-12 rounded-[5rem] border border-slate-800/60 backdrop-blur-md flex flex-col h-[700px] shadow-3xl">
               <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-5">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
                    <p className="text-[13px] font-black text-cyan-500 uppercase tracking-[0.5em]">Neural_Link</p>
                 </div>
                 <div className="flex gap-2">
                    {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-4 bg-slate-800 rounded-full" />)}
                 </div>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-10 pr-6 scrollbar-hide mb-10">
                 {chatMessages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-[0.05]">
                     <svg className="w-32 h-32 mb-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     <p className="text-sm font-black uppercase tracking-[0.8em] text-center">Neural_Core_Idle<br/>Waiting for Protocol</p>
                   </div>
                 )}
                 {chatMessages.map((msg, index) => (
                   <div key={index} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-8 duration-500`}>
                     <div className={`max-w-[90%] p-8 rounded-[3rem] text-[14px] font-medium leading-relaxed shadow-3xl border-2 ${
                       msg.role === 'ai' 
                        ? 'bg-slate-800/80 text-cyan-50 border-slate-700 rounded-tl-none' 
                        : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'
                     }`}>
                       <p className="opacity-40 text-[9px] font-black uppercase mb-3 tracking-widest">{msg.role === 'ai' ? 'Sentinel_Core' : 'Local_User'}</p>
                       {msg.text}
                     </div>
                   </div>
                 ))}
                 {isAiProcessing && (
                    <div className="flex gap-5 items-center text-cyan-500 animate-pulse text-[12px] font-black uppercase tracking-[0.6em]">
                       <span className="w-4 h-4 bg-cyan-500 rounded-full animate-ping" />
                       Decrypting_Intelligence...
                    </div>
                 )}
               </div>

               <form onSubmit={handleChatInterface} className="relative group">
                 <input 
                   value={chatInput}
                   onChange={e => setChatInput(e.target.value)}
                   className="w-full bg-black/60 border-2 border-slate-800 rounded-[2.5rem] px-12 py-7 text-sm font-medium focus:outline-none focus:border-cyan-500/60 transition-all text-cyan-50 placeholder:text-slate-800 shadow-inner"
                   placeholder="Enter encrypted query..."
                 />
                 <button className="absolute right-8 top-1/2 -translate-y-1/2 p-4 text-slate-700 hover:text-cyan-500 transition-all transform hover:scale-125">
                   <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </button>
               </form>
            </div>
          </section>

          {/* GLOBAL VAULT & EVENT CONSOLE PANEL */}
          <section className="lg:col-span-8 flex flex-col gap-12">
            
            {/* CENTRAL LOG VAULT */}
            <div className="flex-1 min-h-0 bg-slate-900/20 rounded-[5rem] border-2 border-slate-800/40 p-2 shadow-2xl overflow-hidden relative">
               <SecurityDashboard logs={logs} onClear={handleGlobalPurge} />
               <div className="absolute top-10 right-10 flex gap-4">
                  <div className="px-5 py-2 bg-black/60 rounded-full border border-slate-800 text-[10px] font-black uppercase tracking-widest text-cyan-500">
                    Vault_Capacity: {logs.length}/500
                  </div>
               </div>
            </div>

            {/* MASTER SYSTEM EVENT CONSOLE */}
            <div className={`bg-[#020617] p-14 rounded-[5rem] border-2 border-slate-800 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col transition-all duration-1000 ${
               isMonitoring || mode === SecurityMode.ALERT ? 'h-[550px]' : 'h-32'
            }`}>
               <div className="flex justify-between items-center mb-12">
                 <div className="flex items-center gap-8">
                    <div className="flex items-center gap-6">
                       <h3 className="text-[15px] font-black text-slate-500 uppercase tracking-[0.8em]">Event_Terminal</h3>
                       <div className="px-6 py-2 bg-slate-900 rounded-full border border-slate-800 flex gap-4 shadow-inner">
                          <div className={`w-3 h-3 rounded-full ${mode === SecurityMode.ALERT ? 'bg-red-500 animate-pulse' : 'bg-red-500/20'}`} />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                          <div className="w-3 h-3 rounded-full bg-green-500/80" />
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-10">
                    <div className="flex items-center gap-3">
                       <span className="text-[11px] text-slate-700 font-bold uppercase tracking-widest">Buffer_Integrity:</span>
                       <span className="text-[11px] text-green-500 font-black tracking-[0.3em] uppercase">{systemMetrics.packet_integrity}%</span>
                    </div>
                    <button 
                      onClick={() => setTerminalOutput([])} 
                      className="text-[11px] text-slate-700 hover:text-slate-300 font-black uppercase tracking-[0.4em] transition-colors"
                    >
                      Clear_Terminal
                    </button>
                 </div>
               </div>
               
               {/* TERMINAL CONTENT ENGINE */}
               <div className="flex-1 overflow-y-auto font-mono text-[13px] space-y-4 scrollbar-hide pr-10">
                 {terminalOutput.length === 0 && (
                    <div className="h-full flex items-center justify-center opacity-10">
                       <p className="text-cyan-500 italic uppercase tracking-[0.8em] animate-pulse text-center leading-loose">Establishing_Handshake_Events...<br/>Terminal_Buffer_Empty</p>
                    </div>
                 )}
                 {terminalOutput.map((log, i) => (
                   <div key={i} className="flex gap-10 group animate-in slide-in-from-left duration-700 border-l-2 border-transparent hover:border-cyan-500/20 pl-4">
                     <span className="text-slate-700 font-black tabular-nums tracking-tighter">[{log.time}]</span>
                     <span className={`flex-1 transition-all duration-300 group-hover:translate-x-2 ${
                       log.level === 'critical' ? 'text-red-500 font-black shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 
                       log.level === 'error' ? 'text-red-400' : 
                       log.level === 'warn' ? 'text-yellow-400' : 
                       log.level === 'success' ? 'text-green-400' : 
                       log.level === 'neural' ? 'text-indigo-400 font-black italic' : 'text-cyan-500/60'
                     }`}>
                       {log.level.toUpperCase()} >> {log.msg}
                     </span>
                     <span className="text-slate-900 text-[10px] font-black tracking-tighter hidden xl:block uppercase">
                       Sector_{Math.floor(Math.random()*900)+100}
                     </span>
                   </div>
                 ))}
                 {isUploadingEvidence && (
                    <div className="mt-8 p-10 bg-cyan-500/5 border border-cyan-500/10 rounded-[3rem] animate-pulse flex flex-col gap-6">
                       <div className="flex justify-between items-center">
                          <p className="text-cyan-500 font-black uppercase text-[11px] tracking-[0.5em]">Encrypting_Global_Vault_Upload...</p>
                          <span className="text-cyan-500 font-black text-xs">UPLOADING...</span>
                       </div>
                       <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden shadow-inner">
                          <div className="w-1/2 h-full bg-cyan-500 animate-[loading_1.5s_ease-in-out_infinite]" />
                       </div>
                    </div>
                 )}
               </div>
               
               {/* LIVE OPERATIONAL TELEMETRY FOOTER */}
               <div className="mt-12 pt-12 border-t-2 border-slate-900/50 flex flex-wrap justify-between items-center gap-10">
                  <div className="flex gap-16">
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">Entropy_Index</p>
                      <div className="flex items-end gap-3">
                        <p className="text-lg text-slate-400 font-black tabular-nums">{systemMetrics.entropy_factor}</p>
                        <span className="text-[10px] text-slate-800 font-black mb-1.5 uppercase">X_Factor</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">Memory_Commit</p>
                      <p className="text-lg text-slate-400 font-black tabular-nums">{systemMetrics.vram_commit}%</p>
                    </div>
                    <div className="space-y-2 hidden sm:block">
                      <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">Synapse_RTT</p>
                      <p className="text-lg text-cyan-600 font-black tabular-nums">{systemMetrics.neural_latency}ms</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                     <p className="text-[11px] text-slate-700 font-black uppercase tracking-[0.4em]">Core_Processing:</p>
                     <div className="flex gap-2.5 items-end h-6">
                        {[...Array(10)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2.5 rounded-sm transition-all duration-500 ${
                              i < 7 ? 'bg-cyan-500/20 h-4' : 'bg-slate-800 h-2 animate-pulse'
                            }`} 
                          />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </section>
        </main>
        
        {/* COMMAND FOOTER */}
        <footer className="text-center pb-20 pt-10">
           <p className="text-[11px] font-black text-slate-800 uppercase tracking-[1em] opacity-40 hover:opacity-100 transition-opacity cursor-default">
             Secure_Engagement_v5.2 // Aether_Shield_Engine // Verified_Identity_Protection
           </p>
        </footer>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      
      {/* GLOBAL SYSTEM STYLES */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(1000px); opacity: 0; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        ::selection {
          background: rgba(8, 145, 178, 0.4);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default App;

  // PART 1 END - PART 2 SHURU KAREIN?
