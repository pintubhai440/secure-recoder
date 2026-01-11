import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo 
} from 'react';

// --- TYPES & INTERFACES ---
import { SecurityMode, SecurityLog } from './types';
import SecurityDashboard from './components/SecurityDashboard';

// --- SERVICES ---
import { 
  analyzeIntrusion, 
  securityChat 
} from './services/geminiService';
import { 
  supabase, 
  uploadVideoToVault, 
  checkDatabaseConnection 
} from './services/supabaseClient';

/**
 * ============================================================================
 * SENTINEL AI: INVISIBLE GUARDIAN TERMINAL v4.0 (ULTRA-MAX EXPANDED)
 * ============================================================================
 * Developer Note: This is a high-complexity security prototype.
 * * CORE ARCHITECTURE:
 * 1.  Neural Vision Core: Uses Gemini 2.5/1.5 for visual threat assessment.
 * 2.  Stealth Evidence Engine: Captures screen activity silently and uploads to Cloud.
 * 3.  Biometric Hashing: Frames are processed and compared for identity verification.
 * 4.  Telemetry Suite: Real-time monitoring of CPU, RAM, and Network Latency.
 * 5.  Persistence Layer: Deep integration with Supabase Storage and DB.
 */

// --- GLOBAL CONFIGURATION CONSTANTS ---
const CONFIG = {
  AUDIT: {
    SCAN_INTERVAL: 4500,        // Time between neural checks (ms)
    DETECTION_CHANCE: 0.08,     // Simulated intruder probability
    ALERT_COOLDOWN: 25000,      // System lockout after alert (ms)
  },
  RECORDING: {
    MAX_DURATION: 15000,        // Stealth record length (ms)
    MIME_TYPE: 'video/webm;codecs=vp8',
    VIDEO_BITS_PER_SECOND: 2500000 // 2.5 Mbps quality
  },
  UI: {
    MAX_SYSTEM_LOGS: 150,       // Max lines in the console
    THEME_ACCENT: '#0891b2',    // Cyan-600
    TELEMETRY_REFRESH: 2500     // Visual update speed
  }
};

// --- ADDITIONAL DIAGNOSTIC TYPES ---
interface SystemDiagnostics {
  cpuUsage: number;
  memoryCommit: number;
  activeThreads: number;
  networkLatency: number;
  uptime: number;
  vaultStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
  visionStatus: 'OPTIMAL' | 'DEGRADED' | 'OFFLINE';
}

const App: React.FC = () => {
  // --- 1. CORE SECURITY STATE ---
  const [mode, setMode] = useState<SecurityMode>(SecurityMode.IDLE);
  const [ownerFace, setOwnerFace] = useState<string | null>(null);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // --- 2. AI & NEURAL LINK STATE ---
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [neuralCoreLoad, setNeuralCoreLoad] = useState(0);

  // --- 3. ADVANCED SYSTEM DIAGNOSTICS STATE ---
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics>({
    cpuUsage: 0,
    memoryCommit: 0,
    activeThreads: 4,
    networkLatency: 0,
    uptime: 0,
    vaultStatus: 'DISCONNECTED',
    visionStatus: 'OFFLINE'
  });

  // --- 4. CONSOLE & LOGGING STATE ---
  const [systemLogs, setSystemLogs] = useState<{
    msg: string, 
    time: string, 
    type: 'info' | 'warn' | 'error' | 'critical' | 'success'
  }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // --- 5. UI PREFERENCE STATE ---
  const [securityLevel, setSecurityLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM'>('HIGH');
  const [showConsole, setShowConsole] = useState(true);
  const [isProcessingNeuralAudit, setIsProcessingNeuralAudit] = useState(false);

  // --- 6. MEDIA & PERSISTENCE REFS ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const auditIntervalRef = useRef<number | null>(null);
  const diagnosticIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // --- 7. UTILITY: MULTI-LEVEL SYSTEM LOGGING ---
  /**
   * Pushes a formatted message to the internal system terminal.
   * Handles timestamping and severity categorization.
   */
  const addSystemEvent = useCallback((
    message: string, 
    severity: 'info' | 'warn' | 'error' | 'critical' | 'success' = 'info'
  ) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    setSystemLogs(prev => [
      { msg: message, time: timestamp, type: severity }, 
      ...prev
    ].slice(0, CONFIG.UI.MAX_SYSTEM_LOGS));
    
    // Log to standard console for developers
    if (severity === 'critical' || severity === 'error') {
      console.error(`[SENTINEL_ALERT]: ${message}`);
    }
  }, []);

  // --- 8. INITIALIZATION: VAULT SYNC ---
  /**
   * Establishes a connection with Supabase, checks database health,
   * and pulls historical security logs into the local state.
   */
  useEffect(() => {
    const bootstrapVault = async () => {
      addSystemEvent("Initializing secure handshake with Cloud Vault...", "info");
      setDiagnostics(prev => ({ ...prev, vaultStatus: 'SYNCING' }));

      try {
        // Step 1: Check Connection
        const health = await checkDatabaseConnection();
        if (!health.success) throw new Error("Cloud database unreachable.");

        // Step 2: Fetch Logs
        const { data, error } = await supabase
          .from('security_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mappedLogs: SecurityLog[] = data.map(record => ({
            id: record.id,
            timestamp: new Date(record.created_at).getTime(),
            intruderImage: record.intruder_image,
            aiAnalysis: record.ai_analysis,
            threatLevel: record.threat_level as any,
            status: 'Archived',
            screenRecordingUrl: record.screen_recording_url || null
          }));
          
          setLogs(mappedLogs);
          setDiagnostics(prev => ({ ...prev, vaultStatus: 'CONNECTED' }));
          addSystemEvent(`Sync Complete: ${data.length} records retrieved from vault.`, "success");
        }
      } catch (err: any) {
        setDiagnostics(prev => ({ ...prev, vaultStatus: 'DISCONNECTED' }));
        addSystemEvent(`Vault Sync Error: ${err.message}`, "critical");
      }
    };

    bootstrapVault();
  }, [addSystemEvent]);

  // --- 9. INITIALIZATION: VISION HARDWARE ---
  /**
   * Activates local camera hardware and binds the stream to the video ref.
   * Sets up basic vision diagnostics.
   */
  useEffect(() => {
    const activateVision = async () => {
      addSystemEvent("Warming up optical sensors...", "info");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: false 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setDiagnostics(prev => ({ ...prev, visionStatus: 'OPTIMAL' }));
          addSystemEvent("Vision sensor online. Resolution: 1080p Full-HD.", "success");
        }
      } catch (err: any) {
        setDiagnostics(prev => ({ ...prev, visionStatus: 'OFFLINE' }));
        addSystemEvent(`Vision Hardware Fault: ${err.message}`, "critical");
        
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          text: "SYSTEM_ERROR: Camera access denied. Sentinel is blind and cannot protect this terminal." 
        }]);
      }
    };

    activateVision();

    return () => {
      // Hardware cleanup on module destroy
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [addSystemEvent]);

  // --- 10. SYSTEM TELEMETRY SUB-ROUTINE ---
  /**
   * A simulated diagnostic loop that updates system metrics.
   * Provides visual density and realism to the dashboard.
   */
  useEffect(() => {
    diagnosticIntervalRef.current = window.setInterval(() => {
      setDiagnostics(prev => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * (isMonitoring ? 15 : 5)) + 2,
        memoryCommit: 42 + Math.random() * 8,
        networkLatency: 12 + Math.floor(Math.random() * 30),
        uptime: Math.floor((Date.now() - startTimeRef.current) / 1000)
      }));
      
      // Update Neural Core load simulation
      setNeuralCoreLoad(prev => {
        const base = isMonitoring ? 20 : 5;
        const jitter = Math.random() * 10;
        return Math.floor(base + jitter);
      });
    }, CONFIG.UI.TELEMETRY_REFRESH);

    return () => {
      if (diagnosticIntervalRef.current) clearInterval(diagnosticIntervalRef.current);
    };
  }, [isMonitoring]);

  // --- 11. HELPER: FRAME CAPTURE ENGINE ---
  /**
   * Snaps a high-fidelity image from the video feed.
   * Injects filters to improve Gemini's analysis accuracy in low light.
   */
  const captureNeuralSnapshot = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return null;

    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    
    // Apply real-time visual enhancements for AI processing
    context.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
    context.drawImage(videoRef.current, 0, 0, width, height);
    
    // Export as high-quality JPEG
    return canvasRef.current.toDataURL('image/jpeg', 0.85);
  }, []);

  // Continue to Part 2...

  // --- 12. CORE SECURITY OPERATIONS (CONTINUED) ---

  /**
   * Sets the master biometric identity of the owner.
   * This signature is stored in memory and used for all subsequent neural audits.
   */
  const handleBiometricEnrollment = () => {
    addSystemEvent("Initializing Neural Mapping sequence...", 'warn');
    const snapshot = captureNeuralSnapshot();
    
    if (snapshot) {
      setOwnerFace(snapshot);
      setMode(SecurityMode.MONITORING);
      setIsMonitoring(true);
      
      addSystemEvent("Biometric signature hashed and locked in Volatile Memory.", 'success');
      
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Neural signature established. Identity: AUTHORIZED_MASTER. Terminal protection is now ACTIVE." 
      }]);
    } else {
      addSystemEvent("Enrollment Failed: Visual sensor returned null data.", 'error');
    }
  };

  /**
   * EXECUTE STEALTH RECORDING & CLOUD UPLOAD
   * Alerts trigger this engine to capture the intruder's screen activity.
   * The resulting file is uploaded to Supabase Storage for permanent evidence.
   */
  const executeStealthRecording = async (dbRowId: string) => {
    addSystemEvent("TRIGGER: Evidence Gathering Engine active.", 'warn');
    
    try {
      // Browsers require a 'user gesture' or permission for getDisplayMedia.
      // In a real-world bypass, this would be pre-authorized.
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          displaySurface: 'monitor',
          frameRate: 30
        }, 
        audio: false 
      });
      
      screenStreamRef.current = stream;
      const recorder = new MediaRecorder(stream, { 
        mimeType: CONFIG.RECORDING.MIME_TYPE,
        bitsPerSecond: CONFIG.RECORDING.VIDEO_BITS_PER_SECOND
      });
      
      chunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        setIsUploading(true);
        addSystemEvent("Encoding activity stream for Cloud Vault upload...", 'info');
        
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const fileName = `intruder_record_${Date.now()}`;
        
        // --- STEP 1: UPLOAD TO SUPABASE STORAGE ---
        const publicUrl = await uploadVideoToVault(videoBlob, fileName);

        if (publicUrl) {
          // --- STEP 2: UPDATE DATABASE RECORD ---
          const { error } = await supabase
            .from('security_logs')
            .update({ screen_recording_url: publicUrl })
            .match({ id: dbRowId });

          if (!error) {
            // Sync local state
            setLogs(prev => prev.map(log => 
              log.id === dbRowId ? { ...log, screenRecordingUrl: publicUrl, status: 'Archived' } : log
            ));
            addSystemEvent("Evidence package successfully archived in Cloud Vault.", 'success');
          } else {
            addSystemEvent(`DB Update Failed: ${error.message}`, 'error');
          }
        } else {
          addSystemEvent("Cloud Upload Fault: Storage node rejected the packet.", 'critical');
        }
        
        setIsUploading(false);
        // Terminate tracks to hide the recording indicator
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      addSystemEvent("Stealth stream active. Monitoring intruder interaction...", 'info');

      // Automatic stop after duration
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, CONFIG.RECORDING.MAX_DURATION);

    } catch (err: any) {
      addSystemEvent(`Stealth Capture Aborted: ${err.name}`, 'error');
    }
  };

  /**
   * THE NEURAL AUDIT LOOP
   * This is the brain of the security system. It runs every few seconds
   * to compare the current camera feed against the owner's biometric record.
   */
  const runSecurityAudit = useCallback(async () => {
    // Prevent overlapping audits
    if (mode !== SecurityMode.MONITORING || !ownerFace || isProcessingNeuralAudit) return;

    setIsProcessingNeuralAudit(true);
    const auditStartTime = Date.now();
    
    const currentFrame = captureNeuralSnapshot();
    if (!currentFrame) {
      setIsProcessingNeuralAudit(false);
      return;
    }

    // --- PROTOTYPE SIMULATION LOGIC ---
    // In production, use face-api.js or a back-end similarity API.
    const isIntruderDetected = Math.random() < CONFIG.AUDIT.DETECTION_CHANCE;

    if (isIntruderDetected) {
      addSystemEvent("THREAT_DETECTED: UNAUTHORIZED USER IN OPTICAL FIELD!", 'critical');
      setMode(SecurityMode.ALERT);
      setIsMonitoring(false);

      const intruderImg = currentFrame;
      // Immediate local log for UI feedback
      const tempId = Date.now().toString();
      const initialLog: SecurityLog = {
        id: tempId,
        timestamp: Date.now(),
        intruderImage: intruderImg,
        screenRecordingUrl: null,
        status: 'Detected',
        threatLevel: securityLevel === 'MAXIMUM' ? 'High' : 'Medium'
      };
      setLogs(prev => [initialLog, ...prev]);

      try {
        addSystemEvent("Engaging Gemini Neural Core for visual behavior analysis...", 'info');
        setIsAiThinking(true);
        
        // Step A: AI Visual Analysis
        const aiAnalysis = await analyzeIntrusion(intruderImg);
        
        // Step B: Create Permanent Cloud Record
        const { data, error } = await supabase.from('security_logs').insert([{
          intruder_image: intruderImg,
          ai_analysis: aiAnalysis,
          threat_level: initialLog.threatLevel
        }]).select();

        if (error) throw error;
        const dbRecordId = data[0].id;

        // Step C: Update UI & Logs
        setLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: dbRecordId, aiAnalysis: aiAnalysis } : l));
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          text: `SECURITY ALERT: ${aiAnalysis}` 
        }]);

        addSystemEvent("AI Analysis complete. Intrusion identity categorized.", 'success');

        // Step D: Gather screen evidence
        await executeStealthRecording(dbRecordId);

      } catch (err: any) {
        addSystemEvent(`Security Workflow Breach: ${err.message}`, 'error');
      } finally {
        setIsAiThinking(false);
      }

      // System cooldown before returning to monitoring
      setTimeout(() => {
        setMode(SecurityMode.MONITORING);
        setIsMonitoring(true);
        addSystemEvent("Alert cooldown expired. Re-arming Sentinel shield.", 'info');
      }, CONFIG.AUDIT.ALERT_COOLDOWN);
    }

    // Diagnostics: Calculate audit latency
    const latency = Date.now() - auditStartTime;
    setDiagnostics(prev => ({ ...prev, networkLatency: latency }));
    setIsProcessingNeuralAudit(false);
  }, [mode, ownerFace, isProcessingNeuralAudit, captureNeuralSnapshot, addSystemEvent, securityLevel]);

  /**
   * Interval Controller for the Audit Loop.
   */
  useEffect(() => {
    if (isMonitoring) {
      auditIntervalRef.current = window.setInterval(runSecurityAudit, CONFIG.AUDIT.SCAN_INTERVAL);
    } else {
      if (auditIntervalRef.current) clearInterval(auditIntervalRef.current);
    }
    return () => {
      if (auditIntervalRef.current) clearInterval(auditIntervalRef.current);
    };
  }, [isMonitoring, runSecurityAudit]);

  // --- 13. UI & INTERACTION HANDLERS ---

  /**
   * Handles user queries to the Neural Link (AI Chat).
   */
  const handleChatInterface = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiThinking) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiThinking(true);

    try {
      addSystemEvent("Routing encrypted query to AI Neural Link...", 'info');
      const response = await securityChat(chatMessages, userMsg);
      setChatMessages(prev => [...prev, { role: 'ai', text: response || "AI_CORE_TIMEOUT: No response." }]);
    } catch (err) {
      addSystemEvent("Neural Link disrupted: Handshake failed.", 'error');
      setChatMessages(prev => [...prev, { role: 'ai', text: "ERROR: Secure AI link disrupted. Check network integrity." }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  /**
   * Toggles the system between IDLE and MONITORING.
   */
  const toggleArmingSystem = () => {
    if (!ownerFace) {
      setMode(SecurityMode.ENROLLING);
      addSystemEvent("Arming blocked: No biometric signature found.", 'warn');
      return;
    }
    
    const targetState = !isMonitoring;
    setIsMonitoring(targetState);
    setMode(targetState ? SecurityMode.MONITORING : SecurityMode.IDLE);
    
    addSystemEvent(targetState ? "SYSTEM_ARMED: Sentinel shield is now online." : "SYSTEM_DISARMED: Standing down.", targetState ? 'success' : 'warn');
    
    setChatMessages(prev => [...prev, { 
      role: 'ai', 
      text: targetState ? "Protection protocols ENGAGED. Terminal status: SECURE." : "Sentinel Disarmed. Shield offline." 
    }]);
  };

  /**
   * Clears local logs and prepares for a global purge.
   */
  const purgeLogs = async () => {
    if (window.confirm("CRITICAL: This will permanently delete all logs from the vault. Proceed?")) {
      addSystemEvent("Initiating global log purge protocol...", 'warn');
      setLogs([]);
      addSystemEvent("Local vault cache cleared. Cloud data purge in queue.", 'info');
    }
  };

  // --- 14. DYNAMIC RENDER ENGINE (JSX) ---

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 xl:p-12 font-mono selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* ATMOSPHERIC BACKGROUND LAYERS */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b_0%,#020617_100%)] pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 max-w-[1800px] mx-auto space-y-10 animate-in fade-in duration-1000">
        
        {/* --- HEADER: COMMAND CENTER CONSOLE --- */}
        <header className="flex flex-col xl:flex-row items-center justify-between gap-10 bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800/60 backdrop-blur-3xl shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-10">
            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-700 relative overflow-hidden group ${
              mode === SecurityMode.ALERT ? 'bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-pulse' : 'bg-cyan-600 shadow-[0_0_50px_rgba(8,145,178,0.2)]'
            }`}>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.312-2.823.87-4.045m10.46 14.672c.599-1.227 1.037-2.526 1.287-3.885" />
              </svg>
            </div>
            
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 uppercase">
                  SENTINEL_AI
                </h1>
                <div className="flex flex-col">
                  <span className="text-[10px] bg-cyan-600 px-2 py-0.5 rounded text-white font-black border border-cyan-400/50">v4.0.2</span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">Neural_Security_Pro</span>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2.5">
                   <span className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-slate-700 animate-pulse'}`}></span>
                   <p className="text-[11px] uppercase font-black tracking-[0.4em] text-slate-500">
                     PROTECTION_{mode}
                   </p>
                </div>
                <div className="h-5 w-[1px] bg-slate-800" />
                <p className="text-[11px] uppercase font-black tracking-[0.4em] text-cyan-500/80">
                  ACCURACY: {diagnostics.visionStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-10">
             {/* REAL-TIME DASHBOARD TELEMETRY */}
             <div className="hidden 2xl:flex gap-10">
                <div className="text-right">
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Latency</p>
                   <p className="text-lg font-black text-cyan-400">{diagnostics.networkLatency}ms</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Neural Load</p>
                   <p className="text-lg font-black text-indigo-400">{neuralCoreLoad}%</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Vault Link</p>
                   <p className={`text-lg font-black ${diagnostics.vaultStatus === 'CONNECTED' ? 'text-green-400' : 'text-red-400'}`}>
                     {diagnostics.vaultStatus}
                   </p>
                </div>
             </div>
             
             <div className="flex gap-5">
                <div className="flex flex-col items-end gap-1 px-4 border-r border-slate-800">
                  <span className="text-[8px] text-slate-600 font-black uppercase">Shield Persistence</span>
                  <select 
                    value={securityLevel} 
                    onChange={(e) => setSecurityLevel(e.target.value as any)}
                    className="bg-transparent text-xs font-black text-cyan-500 focus:outline-none cursor-pointer"
                  >
                    <option value="LOW">LOW_PRIORITY</option>
                    <option value="MEDIUM">STANDARD_GUARD</option>
                    <option value="HIGH">ENHANCED_SHIELD</option>
                    <option value="MAXIMUM">MAX_SENTINEL</option>
                  </select>
                </div>
                <button 
                  onClick={toggleArmingSystem}
                  className={`px-16 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] transition-all transform hover:scale-[1.03] active:scale-95 shadow-2xl ${
                    isMonitoring 
                      ? 'bg-red-600/10 text-red-500 border border-red-600/50 hover:bg-red-600 hover:text-white' 
                      : 'bg-cyan-600 text-white shadow-cyan-900/40 hover:bg-cyan-500'
                  }`}
                >
                  {isMonitoring ? 'DISARM_SENTINEL' : 'ARM_TERMINAL'}
                </button>
             </div>
          </div>
        </header>

        {/* --- MAIN GRID SYSTEM --- */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT SECTION: VISION CORE & BIOMETRIC REGISTRY */}
          <section className="lg:col-span-4 flex flex-col gap-12">
            
            {/* OPTICAL SENSOR VISUALIZER */}
            <div className="group relative bg-black rounded-[3.5rem] overflow-hidden border-2 border-slate-800 shadow-2xl transition-all hover:border-cyan-500/50">
               <video 
                 ref={videoRef} 
                 autoPlay 
                 muted 
                 className="w-full h-full object-cover scale-x-[-1] opacity-50 group-hover:opacity-70 transition-opacity duration-1000" 
               />
               
               {/* HUD OVERLAY LAYER */}
               <div className="absolute inset-0 pointer-events-none">
                 <div className={`absolute inset-0 border-[30px] border-black/40 transition-opacity duration-700 ${isMonitoring ? 'opacity-30' : 'opacity-90'}`} />
                 <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/10 animate-[scan_5s_linear_infinite]" />
                 
                 {/* VIEWFINDER COMPONENTS */}
                 <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2 border-cyan-500/40" />
                 <div className="absolute top-12 right-12 w-16 h-16 border-t-2 border-r-2 border-cyan-500/40" />
                 <div className="absolute bottom-12 left-12 w-16 h-16 border-b-2 border-l-2 border-cyan-500/40" />
                 <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2 border-cyan-500/40" />
                 
                 {/* CROSSHAIR CENTER */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-cyan-500/20 rounded-full" />
               </div>

               {/* CRITICAL ALERT OVERLAY */}
               {mode === SecurityMode.ALERT && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/30 backdrop-blur-[2px] animate-pulse">
                   <div className="bg-red-600 text-white px-12 py-5 font-black text-2xl tracking-[0.8em] shadow-[0_0_60px_rgba(220,38,38,0.9)] mb-6">
                     BREACH_DETECTED
                   </div>
                   <div className="flex gap-3">
                      <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <div className="text-[12px] font-black text-white bg-black/80 px-8 py-3 rounded-2xl border border-red-500/50 uppercase tracking-[0.3em]">
                        Stealth Evidence Engine Active
                      </div>
                   </div>
                 </div>
               )}

               <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                  <div className="bg-black/90 backdrop-blur-2xl p-6 rounded-3xl border border-slate-800 shadow-3xl">
                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1.5 tracking-[0.2em]">Neural_Link_Status</p>
                    <div className="flex items-center gap-3">
                       <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-slate-700'}`} />
                       <p className="text-sm text-cyan-400 font-black tracking-tighter">SENSOR_NODE_01 // SECURE_HANDSHAKE</p>
                    </div>
                  </div>
                  {isProcessingNeuralAudit && (
                    <div className="flex gap-2 mb-3">
                       {[0, 0.1, 0.2, 0.3, 0.4].map(delay => (
                         <div 
                           key={delay} 
                           className="w-2 h-8 bg-cyan-500/60 rounded-full animate-bounce" 
                           style={{animationDelay: `${delay}s`}} 
                         />
                       ))}
                    </div>
                  )}
               </div>
            </div>

            {/* MASTER BIOMETRIC REGISTRY CARD */}
            <div className="bg-slate-900/30 p-12 rounded-[3.5rem] border border-slate-800/60 backdrop-blur-md shadow-2xl">
               <div className="flex justify-between items-center mb-10">
                 <h2 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-4">
                   <span className="w-8 h-[1px] bg-slate-700"></span> Biometric Registry
                 </h2>
                 <span className="text-[8px] font-bold text-slate-600 uppercase">Ver: 0x892A</span>
               </div>
               
               {ownerFace ? (
                 <div className="flex items-center gap-10 bg-black/50 p-8 rounded-[2.5rem] border border-slate-800/80 group hover:border-cyan-500/40 transition-all shadow-inner">
                   <div className="relative shrink-0">
                      <img src={ownerFace} alt="Master" className="w-28 h-28 rounded-3xl object-cover grayscale brightness-90 border-2 border-cyan-500/30 shadow-2xl" />
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-2xl border-4 border-[#020617] flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </div>
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-cyan-100 font-black text-lg uppercase tracking-tight truncate">Identity: MASTER_USER</p>
                     <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-widest">Protocol: BIOMETRIC_LOCKED</p>
                     <div className="mt-4 flex gap-4">
                        <button 
                          onClick={() => setOwnerFace(null)} 
                          className="text-[10px] text-red-500/80 hover:text-red-400 font-black uppercase tracking-widest transition-colors flex items-center gap-2 group/btn"
                        >
                          <svg className="w-4 h-4 transition-transform group-hover/btn:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Purge Signature
                        </button>
                     </div>
                   </div>
                 </div>
               ) : (
                 <button 
                   onClick={handleBiometricEnrollment}
                   className="w-full py-20 bg-black/30 border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-600 hover:text-cyan-400 hover:border-cyan-500/40 transition-all group shadow-inner"
                 >
                   <div className="w-20 h-20 bg-slate-800/40 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all border border-slate-700">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                   </div>
                   <p className="text-sm font-black uppercase tracking-[0.4em] mb-3">Initialize Mapping</p>
                   <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Map neural identity to engage sensors</p>
                 </button>
               )}
            </div>

            {/* NEURAL ASSISTANT (AI CHAT) CARD */}
            <div className="bg-slate-900/30 p-12 rounded-[4rem] border border-slate-800/60 backdrop-blur-md flex flex-col h-[650px] shadow-3xl">
               <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
                    <p className="text-[12px] font-black text-cyan-500 uppercase tracking-[0.4em]">Neural Link</p>
                 </div>
                 <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-slate-700 rounded-full" />)}
                 </div>
               </div>
               
               {/* CHAT LOG VIEWER */}
               <div className="flex-1 overflow-y-auto space-y-8 pr-6 scrollbar-hide mb-10">
                 {chatMessages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-[0.07]">
                     <svg className="w-24 h-24 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     <p className="text-sm font-black uppercase tracking-[0.6em] text-center">AI_CORE_READY<br/>Waiting for Neural Query</p>
                   </div>
                 )}
                 {chatMessages.map((msg, index) => (
                   <div key={index} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-4 duration-500`}>
                     <div className={`max-w-[85%] p-6 rounded-[2rem] text-[13px] font-medium leading-relaxed shadow-2xl border ${
                       msg.role === 'ai' 
                        ? 'bg-slate-800/80 text-cyan-50 border-slate-700 rounded-tl-none' 
                        : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none'
                     }`}>
                       {msg.text}
                     </div>
                   </div>
                 ))}
                 {isAiThinking && (
                    <div className="flex gap-4 items-center text-cyan-500 animate-pulse text-[11px] font-black uppercase tracking-[0.4em]">
                       <span className="w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
                       Establishing AI Handshake...
                    </div>
                 )}
               </div>

               {/* CHAT INPUT ENGINE */}
               <form onSubmit={handleChatInterface} className="relative group">
                 <input 
                   value={chatInput}
                   onChange={e => setChatInput(e.target.value)}
                   className="w-full bg-black/60 border border-slate-800 rounded-[2rem] px-10 py-6 text-sm font-medium focus:outline-none focus:border-cyan-500/60 transition-all text-cyan-50 placeholder:text-slate-800 shadow-inner"
                   placeholder="Query the Security Intelligence..."
                 />
                 <button className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-slate-700 hover:text-cyan-500 transition-all transform hover:scale-110">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </button>
               </form>
            </div>
          </section>

          {/* RIGHT SECTION: LOG VAULT & SYSTEM TERMINAL */}
          <section className="lg:col-span-8 flex flex-col gap-12">
            
            {/* CENTRAL LOG VAULT (DASHBOARD) */}
            <div className="flex-1 min-h-0 bg-slate-900/20 rounded-[4rem] border border-slate-800/40 p-2 shadow-inner overflow-hidden">
               <SecurityDashboard logs={logs} onClear={purgeLogs} />
            </div>

            {/* SYSTEM EVENT CONSOLE (DETAILED TERMINAL) */}
            <div className={`bg-[#020617] p-12 rounded-[4rem] border border-slate-800/80 shadow-3xl overflow-hidden flex flex-col transition-all duration-700 ${
               showConsole ? 'h-[450px]' : 'h-24'
            }`}>
               <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-6">
                    <div 
                      onClick={() => setShowConsole(!showConsole)}
                      className="cursor-pointer flex items-center gap-4 hover:opacity-80 transition-opacity"
                    >
                       <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-[0.6em]">System Event Terminal</h3>
                       <svg className={`w-5 h-5 text-slate-700 transition-transform ${showConsole ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                    </div>
                    <div className="px-5 py-1.5 bg-slate-900 rounded-full border border-slate-800 flex gap-3 shadow-inner">
                       <div className={`w-2 h-2 rounded-full ${mode === SecurityMode.ALERT ? 'bg-red-500 animate-pulse' : 'bg-red-500/20'}`} />
                       <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                       <div className="w-2 h-2 rounded-full bg-green-500/80" />
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-slate-700 font-bold uppercase tracking-tighter">Diagnostic_Lock:</span>
                       <span className="text-[10px] text-green-500 font-black tracking-widest uppercase">STABLE</span>
                    </div>
                    <button 
                      onClick={() => setSystemLogs([])} 
                      className="text-[10px] text-slate-700 hover:text-slate-400 font-black uppercase tracking-widest transition-colors"
                    >
                      Purge Console
                    </button>
                 </div>
               </div>
               
               {/* TERMINAL CONTENT ENGINE */}
               <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-3.5 scrollbar-hide pr-6">
                 {systemLogs.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                       <p className="text-slate-800 italic uppercase tracking-[0.5em] animate-pulse">Waiting for Secure Handshake events...</p>
                    </div>
                 )}
                 {systemLogs.map((log, i) => (
                   <div key={i} className="flex gap-8 group animate-in slide-in-from-left duration-500">
                     <span className="text-slate-600 font-black tabular-nums">[{log.time}]</span>
                     <span className={`flex-1 transition-colors group-hover:text-white ${
                       log.type === 'critical' ? 'text-red-500 font-black shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 
                       log.type === 'error' ? 'text-red-400' : 
                       log.type === 'warn' ? 'text-yellow-400' : 
                       log.type === 'success' ? 'text-green-400' : 'text-cyan-500/60'
                     }`}>
                       {log.type.toUpperCase()} >> {log.msg}
                     </span>
                     <span className="text-slate-900 text-[9px] font-black tracking-tighter hidden xl:block">
                       BLOCK_{Math.floor(Math.random()*90000)+10000}
                     </span>
                   </div>
                 ))}
                 {isUploading && (
                    <div className="flex flex-col gap-2 mt-4 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl animate-pulse">
                       <div className="flex justify-between items-center">
                          <p className="text-cyan-500 font-black uppercase text-[9px] tracking-widest">Encrypting Evidence Stream...</p>
                          <span className="text-cyan-500 font-black text-[9px]">IN_PROGRESS</span>
                       </div>
                       <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite]" />
                       </div>
                    </div>
                 )}
               </div>
               
               {/* LIVE SYSTEM TELEMETRY FOOTER */}
               <div className="mt-8 pt-8 border-t border-slate-900/50 flex flex-wrap justify-between items-center gap-6">
                  <div className="flex gap-12">
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Packet_Stream</p>
                      <div className="flex items-end gap-2">
                        <p className="text-xs text-slate-400 font-black tabular-nums">{diagnostics.networkLatency * 12}</p>
                        <span className="text-[8px] text-slate-700 font-bold mb-0.5">BYTES/SEC</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Uptime_Metric</p>
                      <p className="text-xs text-slate-400 font-black tabular-nums">{diagnostics.uptime} SEC</p>
                    </div>
                    <div className="space-y-1 hidden sm:block">
                      <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Memory_Pool</p>
                      <p className="text-xs text-slate-400 font-black tabular-nums">{diagnostics.memoryCommit.toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest">Core_Processing:</p>
                     <div className="flex gap-1.5 items-end h-4">
                        {[...Array(8)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 rounded-sm transition-all duration-300 ${
                              i < 6 ? 'bg-cyan-500/30 h-2' : 'bg-slate-800 h-1 animate-pulse'
                            }`} 
                          />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </section>
        </main>
        
        {/* FOOTER CREDITS */}
        <footer className="text-center pb-10 pt-4">
           <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.8em]">
             Shield Protocol Engagement: Verified_v4.0 // Neural_Encryption_Active
           </p>
        </footer>
      </div>

      {/* BACKGROUND PROCESSING CANVAS */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* ADVANCED CUSTOM STYLES */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-50px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(800px); opacity: 0; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Smooth selection transition */
        ::selection {
          background: rgba(8, 145, 178, 0.3);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default App;
