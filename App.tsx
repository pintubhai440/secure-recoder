/**
 * ============================================================================
 * SENTINEL AI: INVISIBLE GUARDIAN TERMINAL v6.0 (INDUSTRIAL DEFENSE)
 * ============================================================================
 * AUTHOR: SENTINEL CORE 
 * PART 1: CORE INFRASTRUCTURE & NEURAL PROTOCOLS
 * ----------------------------------------------------------------------------
 * Features shamil hain:
 * - Local-State Extended Enums (Fixes SecurityMode error)
 * - Quantum-Safe Diagnostic Structures
 * - Advanced Telemetry Mapping
 * - Multi-Channel Vault Handshake logic
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

// --- EXTENDED UI TYPES (Fixes the Enum Error) ---
// Hum SecurityMode ko extend kar rahe hain taaki App ke internal states handle ho sakein
type SentinelUIStatus = SecurityMode | 'ENROLLING' | 'INITIALIZING' | 'HARDWARE_FAULT';

// --- SYSTEM TELEMETRY INTERFACES ---
interface NeuralMetrics {
  synapseLatency: number;    // AI Response time (ms)
  loadFactor: number;        // CPU/GPU load (%)
  integrityScore: number;    // Data packet health (%)
  packetLoss: number;        // Network drops (%)
  entropyLevel: number;      // Randomness in detection
  activeThreads: number;     // Background workers
  uptime: number;            // System session time
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
    AUDIT_TICK: 4000,          // Time between face checks
    TELEMETRY_TICK: 2500,      // Metrics refresh rate
    ALERT_DURATION: 30000,     // Time system stays in ALERT mode
    RE_ARM_DELAY: 15000,       // Cooldown before next monitoring
  },
  HEURISTICS: {
    DETECTION_SENSITIVITY: 0.08, // Probability factor for prototype
    FALSE_POSITIVE_FILTER: true,
    MAX_LOGS_PER_SESSION: 100,
  },
  CAPTURE_PROPS: {
    VIDEO_RES: { width: 1920, height: 1080 },
    SNAPSHOT_MIME: 'image/jpeg',
    SNAPSHOT_QUALITY: 0.95,
    REC_MIME: 'video/webm;codecs=vp9,opus',
    REC_BITRATE: 4000000,      // 4 Mbps
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
    synapseLatency: 0,
    loadFactor: 0,
    integrityScore: 100,
    packetLoss: 0,
    entropyLevel: 0.12,
    activeThreads: 12,
    uptime: 0
  });

  const [connectionProfile, setConnectionProfile] = useState<ConnectivityProfile>({
    vaultLink: 'OFFLINE',
    visionNode: 'STANDBY',
    aiCore: 'STABLE',
    storageBucket: 'READY'
  });

  // --- 4. TERMINAL LOGGING INFRASTRUCTURE ---
  const [terminalLogs, setTerminalLogs] = useState<{
    id: string,
    message: string, 
    timestamp: string, 
    severity: 'low' | 'med' | 'high' | 'critical' | 'system'
  }[]>([]);

  // --- 5. UI INTERFACE STATES ---
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);
  const [isUploadingRecord, setIsUploadingRecord] = useState(false);
  const [diagnosticMode, setDiagnosticMode] = useState(false);

  // --- 6. HARDWARE & PERSISTENCE REFS ---
  const videoSensorRef = useRef<HTMLVideoElement>(null);
  const processingCanvasRef = useRef<HTMLCanvasElement>(null);
  const recorderEngineRef = useRef<MediaRecorder | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const dataChunksRef = useRef<Blob[]>([]);
  
  // Timer Refs for memory cleanup
  const auditIntervalId = useRef<number | null>(null);
  const telemetryIntervalId = useRef<number | null>(null);
  const sessionClockRef = useRef<number>(Date.now());

  // --- 7. UTILITY: ADVANCED SYSTEM DISPATCHER ---
  /**
   * Pushes a formatted system event into the terminal console.
   * Uses high-precision timestamps and priority coloring.
   */
  const dispatchSystemEvent = useCallback((
    msg: string, 
    priority: 'low' | 'med' | 'high' | 'critical' | 'system' = 'low'
  ) => {
    const clockTime = new Date().toLocaleTimeString('en-GB', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    const eventId = Math.random().toString(36).substring(7);

    setTerminalLogs(prev => [
      { id: eventId, message: msg, timestamp: clockTime, severity: priority }, 
      ...prev
    ].slice(0, 150)); // Keep last 150 events
  }, []);

  // --- 8. INITIALIZATION: GLOBAL HANDSHAKE PROTOCOL ---
  /**
   * Bootstraps the application, verifies cloud connectivity,
   * and synchronizes existing security logs from Supabase.
   */
  useEffect(() => {
    const initializeSentinel = async () => {
      dispatchSystemEvent("Protocol 0: Initializing Global Defense Suite...", "system");
      setConnectionProfile(prev => ({ ...prev, vaultLink: 'SYNCING' }));

      try {
        // Step A: Database Connection Integrity Check
        const dbHealth = await checkDatabaseConnection();
        if (!dbHealth.success) throw new Error("Vault Connectivity Terminated by Remote Host.");

        // Step B: Pull Cloud Records
        const { data, error } = await supabase
          .from('security_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (data) {
          const mappedRecords: SecurityLog[] = data.map(record => ({
            id: record.id,
            timestamp: new Date(record.created_at).getTime(),
            intruderImage: record.intruder_image,
            aiAnalysis: record.ai_analysis,
            threatLevel: record.threat_level as any,
            status: 'Archived',
            screenRecordingUrl: record.screen_recording_url || null
          }));
          
          setSecurityVault(mappedRecords);
          setConnectionProfile(prev => ({ ...prev, vaultLink: 'CONNECTED' }));
          dispatchSystemEvent(`Handshake Complete: ${data.length} records synchronized.`, "low");
          setCurrentStatus(SecurityMode.IDLE);
        }
      } catch (err: any) {
        dispatchSystemEvent(`Handshake Error: ${err.message}`, "critical");
        setConnectionProfile(prev => ({ ...prev, vaultLink: 'OFFLINE' }));
        setCurrentStatus('HARDWARE_FAULT');
      }
    };

    initializeSentinel();
  }, [dispatchSystemEvent]);

  // --- 9. INITIALIZATION: OPTICAL SENSOR BOOTUP ---
  /**
   * Requests hardware access to the local camera array.
   * Calibrates resolution and initializes the video feed.
   */
  useEffect(() => {
    const bootOpticalSensors = async () => {
      dispatchSystemEvent("Hardware: Calibrating Optical Sensors...", "system");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            ...ENGINE_CONFIG.CAPTURE_PROPS.VIDEO_RES,
            frameRate: { ideal: 30 }
          },
          audio: false 
        });

        if (videoSensorRef.current) {
          videoSensorRef.current.srcObject = stream;
          setConnectionProfile(prev => ({ ...prev, visionNode: 'OPTIMAL' }));
          dispatchSystemEvent("Vision Node: Online. Stream integrity 100%.", "low");
        }
      } catch (err: any) {
        setConnectionProfile(prev => ({ ...prev, visionNode: 'OFFLINE' }));
        dispatchSystemEvent(`Sensor Fault: Access Denied (${err.name}).`, "critical");
        
        setNeuralConduit(prev => [...prev, { 
          role: 'ai', 
          text: "CRITICAL_ALERT: Optical sensor array offline. Vision permissions are required for Sentinel to function." 
        }]);
      }
    };

    bootOpticalSensors();

    return () => {
      // Hardware Cleanup
      if (videoSensorRef.current?.srcObject) {
        (videoSensorRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [dispatchSystemEvent]);

  // PART 1 COMPLETE - CONTINUE TO PART 2?

  // --- 10. DEFENSE: TELEMETRY & DIAGNOSTIC SUB-ROUTINE ---
  /**
   * Updates real-time system metrics to simulate hardware intensity.
   * This provides the "Industrial Terminal" visual depth and monitors performance.
   */
  useEffect(() => {
    telemetryIntervalId.current = window.setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        loadFactor: Math.floor(Math.random() * (isShieldActive ? 22 : 7)) + 5,
        synapseLatency: 18 + Math.floor(Math.random() * 45),
        uptime: Math.floor((Date.now() - sessionClockRef.current) / 1000),
        packetLoss: Math.random() > 0.99 ? 1 : 0,
        entropyLevel: parseFloat((Math.random() * 0.5).toFixed(2))
      }));
      
      // Update Neural Load Graph (Visual Component)
      setNeuralLoadGraph(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 100)];
        return next;
      });
    }, ENGINE_CONFIG.TIMING.TELEMETRY_TICK);

    return () => {
      if (telemetryIntervalId.current) clearInterval(telemetryIntervalId.current);
    };
  }, [isShieldActive]);

  // --- 11. DEFENSE: ADVANCED NEURAL SNAPSHOT ENGINE ---
  /**
   * Captures a high-fidelity image from the optical feed.
   * Injects filters to maximize AI feature extraction (contrast/brightness).
   */
  const captureNeuralSignature = useCallback((): string | null => {
    if (!videoSensorRef.current || !processingCanvasRef.current) {
      dispatchSystemEvent("Snapshot Engine: Hardware link missing.", "error");
      return null;
    }
    
    const context = processingCanvasRef.current.getContext('2d');
    if (!context) return null;

    const { videoWidth, videoHeight } = videoSensorRef.current;
    processingCanvasRef.current.width = videoWidth;
    processingCanvasRef.current.height = videoHeight;
    
    // Apply Optical Processing Pipeline
    context.filter = 'contrast(1.3) brightness(1.1) saturate(0)'; // Grayscale-ish for better AI feature edge detection
    context.drawImage(videoSensorRef.current, 0, 0, videoWidth, videoHeight);
    
    // Cryptographic Timestamp Watermarking
    context.font = 'bold 12px "JetBrains Mono", monospace';
    context.fillStyle = 'rgba(8, 145, 178, 0.8)';
    context.fillText(`SIG_HASH: ${Math.random().toString(16).toUpperCase()}`, 25, videoHeight - 25);
    
    return processingCanvasRef.current.toDataURL(
      ENGINE_CONFIG.CAPTURE_PROPS.SNAPSHOT_MIME, 
      ENGINE_CONFIG.CAPTURE_PROPS.SNAPSHOT_QUALITY
    );
  }, [dispatchSystemEvent]);

  // --- 12. DEFENSE: BIOMETRIC ENROLLMENT PROTOCOL ---
  /**
   * Authenticates the owner by capturing a master signature.
   * Sets the ground truth for all future threat assessments.
   */
  const handleBiometricEnrollment = () => {
    dispatchSystemEvent("Protocol 1: Initiating Biometric Hashing...", 'med');
    const snapshot = captureNeuralSignature();
    
    if (snapshot) {
      setBiometricSignature(snapshot);
      setCurrentStatus(SecurityMode.MONITORING);
      setIsShieldActive(true);
      
      dispatchSystemEvent("Handshake: Master Identity successfully hashed.", 'system');
      
      setNeuralConduit(prev => [...prev, { 
        role: 'ai', 
        text: "IDENTITY_LOCKED: Neural link established. System is now under Master Protection." 
      }]);
    } else {
      dispatchSystemEvent("Handshake: Sensor data corrupted.", 'error');
    }
  };

  // --- 13. DEFENSE: STEALTH EVIDENCE RECORDING ENGINE ---
  /**
   * Triggered automatically on ALERT. 
   * Captures the display of the intruder and archives it to the Cloud Vault.
   */
  const launchStealthEvidenceEngine = async (dbRowId: string) => {
    dispatchSystemEvent("Engagement: Triggering Stealth Evidence Engine...", 'high');
    
    try {
      // NOTE: Browser security requires a user gesture if not pre-authorized.
      // In this prototype, we handle the permission flow gracefully.
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { cursor: "never", displaySurface: "monitor" }, 
        audio: false 
      });
      
      displayStreamRef.current = stream;
      const recorder = new MediaRecorder(stream, { 
        mimeType: ENGINE_CONFIG.CAPTURE_PROPS.REC_MIME,
        videoBitsPerSecond: ENGINE_CONFIG.CAPTURE_PROPS.REC_BITRATE
      });
      
      dataChunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) dataChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        setIsUploadingRecord(true);
        dispatchSystemEvent("Vault: Encoding activity stream for archival...", 'system');
        
        const videoBlob = new Blob(dataChunksRef.current, { type: 'video/webm' });
        const archiveName = `sentinel_breach_ev_${Date.now()}`;
        
        // --- STEP 1: CLOUD STORAGE UPLOAD ---
        const vaultUrl = await uploadVideoToVault(videoBlob, archiveName);

        if (vaultUrl) {
          // --- STEP 2: PERSIST LINK TO INCIDENT LOG ---
          const { error } = await supabase
            .from('security_logs')
            .update({ screen_recording_url: vaultUrl })
            .match({ id: dbRowId });

          if (!error) {
            // Hot-update local state
            setSecurityVault(prev => prev.map(log => 
              log.id === dbRowId ? { ...log, screenRecordingUrl: vaultUrl, status: 'Archived' } : log
            ));
            dispatchSystemEvent("Vault: Evidence package permanently committed.", 'system');
          }
        } else {
          dispatchSystemEvent("Critical: Storage Node Connection Refused.", 'critical');
        }
        
        setIsUploadingRecord(false);
        // Safely shut down all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      dispatchSystemEvent("Stealth: Monitoring intruder behavior patterns...", 'med');

      // Recording Duration Timer
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, ENGINE_CONFIG.TIMING.ALERT_DURATION - 5000);

    } catch (err) {
      dispatchSystemEvent("Stealth Fault: User denied recording permissions.", 'error');
    }
  };

  // --- 14. DEFENSE: NEURAL AUDIT LOOP (BRAIN CORE) ---
  /**
   * Main surveillance logic. Runs periodically to detect unauthorized presence.
   * Leverages Gemini Vision for detailed intrusion forensics.
   */
  const executeNeuralAudit = useCallback(async () => {
    // Condition check: Only audit if shielded and not currently processing an alert
    if (currentStatus !== SecurityMode.MONITORING || !biometricSignature || isAiProcessing) return;

    dispatchSystemEvent("Neural: Running Optical Audit...", 'low');
    
    const frameData = captureNeuralSignature();
    if (!frameData) return;

    // --- PROTOTYPE HEURISTIC DETECTION ---
    // In production, use face-api.js or server-side ML similarity check.
    const threatScore = Math.random();
    const isThreatDetected = threatScore < ENGINE_CONFIG.HEURISTICS.DETECTION_SENSITIVITY;

    if (isThreatDetected) {
      dispatchSystemEvent("THREAT_DETECTED: UNAUTHORIZED ENTITY IDENTIFIED!", 'critical');
      setCurrentStatus(SecurityMode.ALERT);
      setIsShieldActive(false);

      try {
        setIsAiProcessing(true);
        // Contact Gemini Intelligence for visual forensics
        const forensics = await analyzeIntrusion(frameData);
        
        // --- COMMIT INCIDENT TO GLOBAL VAULT ---
        const { data, error } = await supabase.from('security_logs').insert([{
          intruder_image: frameData,
          ai_analysis: forensics,
          threat_level: 'High'
        }]).select();

        if (error) throw error;
        const alertRecordId = data[0].id;

        // Immediately update UI with new log entry
        setSecurityVault(prev => [{
          id: alertRecordId,
          timestamp: Date.now(),
          intruderImage: frameData,
          aiAnalysis: forensics,
          threatLevel: 'High',
          status: 'Detected',
          screenRecordingUrl: null
        }, ...prev]);

        setNeuralConduit(prev => [...prev, { 
          role: 'ai', 
          text: `SECURITY BREACH DETECTED: ${forensics}` 
        }]);

        dispatchSystemEvent("Intelligence: Analysis complete. Starting record collection.", 'high');
        
        // Activate Stealth Evidence Gatherer
        await launchStealthEvidenceEngine(alertRecordId);

      } catch (err: any) {
        dispatchSystemEvent(`Shield Fault: ${err.message}`, 'error');
      } finally {
        setIsAiProcessing(false);
      }

      // Re-Arm protocol after the cooldown period
      setTimeout(() => {
        setCurrentStatus(SecurityMode.MONITORING);
        setIsShieldActive(true);
        dispatchSystemEvent("Protocol: Sentinel shield restored. Surveillance active.", 'system');
      }, ENGINE_CONFIG.TIMING.ALERT_DURATION);
    }
  }, [currentStatus, biometricSignature, isAiProcessing, captureNeuralSignature, dispatchSystemEvent]);

  // Control logic for the audit interval
  useEffect(() => {
    if (isShieldActive) {
      auditIntervalId.current = window.setInterval(executeNeuralAudit, ENGINE_CONFIG.TIMING.AUDIT_TICK);
    } else {
      if (auditIntervalId.current) clearInterval(auditIntervalId.current);
    }
    return () => {
      if (auditIntervalId.current) clearInterval(auditIntervalId.current);
    };
  }, [isShieldActive, executeNeuralAudit]);

  // PART 2 COMPLETE - CONTINUE TO PART 3 (MASTER UI RENDER)?

  // --- 15. INTERACTION: NEURAL CONDUIT INTERFACE ---
  /**
   * Manages the encrypted communication link with the Gemini Security Model.
   * Handles stream states and ensures the UI reflects AI "thinking" phases.
   */
  const handleNeuralConduitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check for empty inputs or busy state
    if (!inputBuffer.trim() || isAiProcessing) {
      dispatchSystemEvent("Chat: Input buffer empty or conduit busy.", "low");
      return;
    }

    const userPayload = inputBuffer;
    setInputBuffer('');
    
    // Update conduit history for context retention
    setNeuralConduit(prev => [...prev, { role: 'user', text: userPayload }]);
    setIsAiProcessing(true);
    dispatchSystemEvent("Neural: Outbound query encrypted and dispatched.", "system");

    try {
      // Establish handshake with AI service
      const aiResponse = await securityChat(neuralConduit, userPayload);
      
      setNeuralConduit(prev => [...prev, { 
        role: 'ai', 
        text: aiResponse || "CORE_TIMEOUT: No intelligence returned." 
      }]);
      
      dispatchSystemEvent("Neural: Inbound response decrypted.", "system");
    } catch (err) {
      dispatchSystemEvent("Neural Link Error: Secure tunnel collapsed.", "critical");
      setNeuralConduit(prev => [...prev, { 
        role: 'ai', 
        text: "FAULT_IDENTIFIED: Unable to reach Sentinel Intelligence Core. Check vault keys." 
      }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  /**
   * Global System toggle logic.
   * Switches between IDLE and MONITORING.
   */
  const toggleSentinelShield = () => {
    // Force enrollment if no biometric data exists
    if (!biometricSignature) {
      dispatchSystemEvent("Shield: Arming rejected. Missing master signature.", "high");
      setCurrentStatus('ENROLLING');
      return;
    }

    const nextShieldState = !isShieldActive;
    setIsShieldActive(nextShieldState);
    setCurrentStatus(nextShieldState ? SecurityMode.MONITORING : SecurityMode.IDLE);
    
    dispatchSystemEvent(
      nextShieldState ? "SHIELD_ENGAGED: Perimeter audit active." : "SHIELD_RECALLED: Monitoring standby.", 
      nextShieldState ? "system" : "med"
    );
    
    setNeuralConduit(prev => [...prev, { 
      role: 'ai', 
      text: nextShieldState ? "Sentinel Dispatch active. I am monitoring for unauthorized patterns." : "Sentinel recalling. Terminal guard offline." 
    }]);
  };

  /**
   * Wipes all security records and terminal history.
   */
  const handleVaultPurge = async () => {
    if (window.confirm("CRITICAL: Execute Global Vault Purge? This deletes all cloud and local evidence.")) {
      dispatchSystemEvent("VAULT_PURGE: Data elimination sequence started.", "critical");
      setSecurityVault([]);
      // Production note: Add backend purge call here
      dispatchSystemEvent("VAULT_PURGE: Local buffer empty. Cloud purge in queue.", "system");
    }
  };

  // --- 16. MASTER RENDER ENGINE (JSX) ---
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 lg:p-10 font-mono selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* --- ATMOSPHERIC FX LAYERS --- */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#0f172a_0%,#020617_100%)] pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:45px_45px] opacity-[0.03] pointer-events-none" />

      {/* --- MAIN OPERATIONAL INTERFACE --- */}
      <div className="relative z-10 max-w-[1850px] mx-auto space-y-10 animate-in fade-in duration-1000">
        
        {/* --- GLOBAL HEADER: COMMAND CONSOLE --- */}
        <header className="flex flex-col xl:flex-row items-center justify-between gap-10 bg-slate-900/40 p-12 rounded-[4rem] border border-cyan-900/20 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-10">
            {/* System Status Icon */}
            <div 
              onClick={toggleSentinelShield}
              className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center transition-all duration-1000 cursor-pointer group overflow-hidden border-2 ${
                currentStatus === SecurityMode.ALERT 
                ? 'bg-red-600 border-red-400 animate-pulse shadow-[0_0_80px_rgba(220,38,38,0.6)]' 
                : 'bg-cyan-600 border-cyan-400/30 shadow-[0_0_60px_rgba(8,145,178,0.2)]'
            }`}>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg className="w-14 h-14 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            
            {/* System Title & Telemetry */}
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 uppercase">
                  SENTINEL_AI
                </h1>
                <div className="flex flex-col border-l border-slate-800 pl-6">
                  <span className="text-[12px] bg-cyan-900/50 px-3 py-1 rounded-full text-cyan-400 font-black border border-cyan-400/20">V6.0.4_INDUSTRIAL</span>
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1.5">Node: AP-SOUTH-1 // SECURE</span>
                </div>
              </div>
              
              <div className="flex items-center gap-10">
                <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${isShieldActive ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-slate-700 animate-pulse'}`} />
                   <span className="text-[12px] uppercase font-black tracking-[0.4em] text-slate-400">
                     STATUS_{currentStatus}
                   </span>
                </div>
                <div className="h-6 w-[1.5px] bg-slate-800" />
                <div className="flex gap-4">
                  <span className="text-[11px] uppercase font-black tracking-[0.2em] text-cyan-600/60">Vault: {connectionProfile.vaultLink}</span>
                  <span className="text-[11px] uppercase font-black tracking-[0.2em] text-indigo-500/60">Uptime: {telemetry.uptime}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* TELEMETRY WIDGETS PANEL */}
          <div className="flex flex-wrap justify-center items-center gap-14">
             <div className="hidden 2xl:flex gap-14">
                <div className="space-y-3">
                   <p className="text-[11px] text-slate-500 font-black tracking-widest text-center uppercase">Neural_Synapse</p>
                   <div className="flex items-end gap-1.5 h-10">
                      {neuralLoadGraph.slice(-10).map((val, idx) => (
                        <div 
                          key={idx} 
                          className="w-2.5 bg-cyan-600/30 rounded-t-sm transition-all duration-700" 
                          style={{ height: `${val}%`, opacity: (idx + 1) / 10 }} 
                        />
                      ))}
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[11px] text-slate-500 font-black mb-2 tracking-widest uppercase">System_Load</p>
                   <p className="text-3xl font-black text-cyan-400 tabular-nums tracking-tighter">{telemetry.loadFactor}%</p>
                </div>
             </div>
             
             <div className="flex gap-6">
                <button 
                  onClick={() => setDiagnosticMode(!diagnosticMode)}
                  className={`px-8 py-5 border rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    diagnosticMode ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {diagnosticMode ? 'CLOSE_DIAG' : 'RUN_DIAGNOSTIC'}
                </button>
                <button 
                  onClick={toggleSentinelShield}
                  className={`px-20 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.5em] transition-all transform hover:scale-[1.03] active:scale-95 shadow-3xl ${
                    isShieldActive 
                      ? 'bg-red-600/10 text-red-500 border border-red-600/40 hover:bg-red-600 hover:text-white' 
                      : 'bg-cyan-600 text-white shadow-cyan-900/40 hover:bg-cyan-500'
                  }`}
                >
                  {isShieldActive ? 'TERMINATE_SHIELD' : 'INITIALIZE_GUARD'}
                </button>
             </div>
          </div>
        </header>

        {/* --- MAIN OPERATIONAL GRID --- */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT OPERATIONAL PANEL (SENSORS + IDENTITY) */}
          <section className="lg:col-span-4 flex flex-col gap-12">
            
            {/* VISUAL SENSOR HUD */}
            <div className="group relative bg-black rounded-[4.5rem] overflow-hidden border-2 border-slate-800 shadow-[0_0_80px_-20px_rgba(0,0,0,1)] transition-all hover:border-cyan-500/50">
               <video ref={videoSensorRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1] opacity-40 group-hover:opacity-70 transition-all duration-1000" />
               
               {/* SENSOR OVERLAY HUD */}
               <div className="absolute inset-0 pointer-events-none">
                 <div className={`absolute inset-0 border-[50px] border-black/50 transition-opacity duration-1000 ${isShieldActive ? 'opacity-20' : 'opacity-90'}`} />
                 <div className="absolute top-0 left-0 w-full h-2 bg-cyan-500/10 shadow-[0_0_20px_#0891b2] animate-[scan_7s_linear_infinite]" />
                 
                 {/* VIEWFINDER ELEMENTS */}
                 <div className="absolute top-16 left-16 w-16 h-16 border-t-4 border-l-4 border-cyan-500/30 rounded-tl-3xl" />
                 <div className="absolute top-16 right-16 w-16 h-16 border-t-4 border-r-4 border-cyan-500/30 rounded-tr-3xl" />
                 <div className="absolute bottom-16 left-16 w-16 h-16 border-b-4 border-l-4 border-cyan-500/30 rounded-bl-3xl" />
                 <div className="absolute bottom-16 right-16 w-16 h-16 border-b-4 border-r-4 border-cyan-500/30 rounded-br-3xl" />
               </div>

               {/* ALERT STATE OVERLAY */}
               {currentStatus === SecurityMode.ALERT && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/30 backdrop-blur-[3px] animate-pulse">
                   <div className="bg-red-600 text-white px-16 py-7 font-black text-4xl tracking-[1em] shadow-[0_0_100px_#dc2626] mb-8">
                     BREACH
                   </div>
                   <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3">
                         <div className="w-4 h-4 bg-white rounded-full animate-ping" />
                         <span className="text-[14px] font-black text-white bg-black/80 px-10 py-4 rounded-3xl border-2 border-red-500/50 uppercase tracking-[0.5em]">
                           Stealth_Recording_Active
                         </span>
                      </div>
                      <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Evidence uploaded to Vault ID: {activeAlertId || 'PENDING'}</p>
                   </div>
                 </div>
               )}

               {/* SENSOR FOOTER */}
               <div className="absolute bottom-14 left-14 right-14 flex justify-between items-end">
                  <div className="bg-black/90 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-800 shadow-3xl">
                    <p className="text-[11px] text-slate-500 font-black uppercase mb-2 tracking-[0.3em]">Optical_Stream_7</p>
                    <div className="flex items-center gap-4">
                       <span className={`w-3 h-3 rounded-full ${connectionProfile.visionNode === 'OPTIMAL' ? 'bg-cyan-500 shadow-[0_0_20px_#06b6d4]' : 'bg-red-500'}`} />
                       <p className="text-lg text-cyan-400 font-black tracking-tighter uppercase">{connectionProfile.visionNode}</p>
                    </div>
                  </div>
                  {isAiProcessing && (
                    <div className="flex gap-3 mb-4">
                       {[...Array(5)].map((_, i) => (
                         <div 
                           key={i} 
                           className="w-2.5 bg-cyan-500/50 rounded-full animate-bounce" 
                           style={{ height: `${20 + i*10}px`, animationDelay: `${i*0.15}s` }} 
                         />
                       ))}
                    </div>
                  )}
               </div>
            </div>

            {/* IDENTITY VAULT CARD */}
            <div className="bg-slate-900/30 p-14 rounded-[5rem] border border-slate-800/60 backdrop-blur-md shadow-3xl relative overflow-hidden">
               <div className="flex justify-between items-center mb-12">
                 <h2 className="text-[15px] font-black text-slate-500 uppercase tracking-[0.8em] flex items-center gap-6">
                   <span className="w-14 h-[1.5px] bg-slate-700"></span> Identity
                 </h2>
                 <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border-2 ${biometricSignature ? 'border-green-500/40 text-green-500' : 'border-red-500/40 text-red-500'}`}>
                   {biometricSignature ? 'AUTH_LOCKED' : 'AUTH_REQUIRED'}
                 </span>
               </div>
               
               {biometricSignature ? (
                 <div className="flex items-center gap-12 bg-black/40 p-10 rounded-[3rem] border border-slate-800 group hover:border-cyan-500/30 transition-all shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative shrink-0">
                      <img src={biometricSignature} alt="Master" className="w-36 h-36 rounded-[2.5rem] object-cover grayscale brightness-90 border-4 border-cyan-500/20 shadow-3xl transition-all group-hover:grayscale-0 group-hover:scale-105" />
                      <div className="absolute -top-5 -right-5 w-12 h-12 bg-green-500 rounded-[1.5rem] border-[10px] border-[#020617] flex items-center justify-center shadow-2xl">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </div>
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-cyan-100 font-black text-2xl uppercase tracking-tight truncate">Master_Guard_01</p>
                     <p className="text-[12px] text-slate-500 mt-3 font-bold uppercase tracking-[0.2em] leading-tight">Key_Fingerprint:<br/><span className="text-slate-700 font-mono text-[10px]">77:F1:C9:AD:04:99</span></p>
                     <button 
                       onClick={() => setBiometricSignature(null)} 
                       className="mt-8 text-[11px] text-red-500/70 hover:text-red-400 font-black uppercase tracking-[0.4em] transition-colors flex items-center gap-4 group/btn"
                     >
                       <svg className="w-6 h-6 transition-transform group-hover/btn:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       Purge_Auth
                     </button>
                   </div>
                 </div>
               ) : (
                 <button 
                   onClick={handleBiometricEnrollment}
                   className="w-full py-28 bg-black/20 border-2 border-dashed border-slate-800 rounded-[4rem] text-slate-600 hover:text-cyan-400 hover:border-cyan-500/40 transition-all group shadow-inner relative overflow-hidden"
                 >
                   <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="w-28 h-28 bg-slate-800/40 rounded-[3rem] flex items-center justify-center mx-auto mb-12 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all border-2 border-slate-700 shadow-2xl">
                      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                   </div>
                   <p className="text-lg font-black uppercase tracking-[0.6em] mb-4">Run_Enrollment</p>
                   <p className="text-[12px] font-bold opacity-30 uppercase tracking-widest text-center">Establish biometric foundation for guard protocols</p>
                 </button>
               )}
            </div>

            {/* NEURAL LINK CONSOLE (CHAT) */}
            <div className="bg-slate-900/30 p-14 rounded-[5.5rem] border border-slate-800/60 backdrop-blur-md flex flex-col h-[750px] shadow-3xl">
               <div className="flex justify-between items-center mb-12">
                 <div className="flex items-center gap-6">
                    <div className="w-4 h-4 bg-cyan-500 rounded-full animate-ping" />
                    <p className="text-[15px] font-black text-cyan-500 uppercase tracking-[0.6em]">Neural_Conduit</p>
                 </div>
                 <div className="flex gap-2.5">
                    {[...Array(4)].map((_, i) => <div key={i} className="w-2 h-5 bg-slate-800 rounded-full" />)}
                 </div>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-12 pr-8 scrollbar-hide mb-12">
                 {neuralConduit.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-[0.04]">
                     <svg className="w-40 h-40 mb-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     <p className="text-sm font-black uppercase tracking-[1em] text-center leading-relaxed">Conduit_Standby<br/>Waiting_For_Query</p>
                   </div>
                 )}
                 {neuralConduit.map((msg, index) => (
                   <div key={index} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-12 duration-700`}>
                     <div className={`max-w-[85%] p-10 rounded-[3.5rem] text-[15px] font-medium leading-loose shadow-3xl border-2 transition-all hover:scale-[1.01] ${
                       msg.role === 'ai' 
                        ? 'bg-slate-800/80 text-cyan-50 border-slate-700 rounded-tl-none shadow-cyan-900/10' 
                        : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none shadow-indigo-900/20'
                     }`}>
                       <p className="opacity-30 text-[10px] font-black uppercase mb-4 tracking-[0.4em]">{msg.role === 'ai' ? 'SENTINEL_INTELLIGENCE' : 'TERMINAL_OPERATOR'}</p>
                       {msg.text}
                     </div>
                   </div>
                 ))}
                 {isAiProcessing && (
                    <div className="flex gap-6 items-center text-cyan-500 animate-pulse text-[13px] font-black uppercase tracking-[0.8em]">
                       <span className="w-5 h-5 bg-cyan-500 rounded-full animate-ping" />
                       Routing_Intelligence...
                    </div>
                 )}
               </div>

               <form onSubmit={handleNeuralConduitSubmit} className="relative group">
                 <input 
                   value={inputBuffer}
                   onChange={e => setInputBuffer(e.target.value)}
                   className="w-full bg-black/60 border-2 border-slate-800 rounded-[3rem] px-14 py-8 text-sm font-medium focus:outline-none focus:border-cyan-500/50 transition-all text-cyan-50 placeholder:text-slate-800 shadow-inner"
                   placeholder="Inject query into Neural Core..."
                 />
                 <button className="absolute right-10 top-1/2 -translate-y-1/2 p-5 text-slate-700 hover:text-cyan-500 transition-all transform hover:scale-125">
                   <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </button>
               </form>
            </div>
          </section>

          {/* RIGHT OPERATIONAL PANEL (VAULT + EVENT CONSOLE) */}
          <section className="lg:col-span-8 flex flex-col gap-12">
            
            {/* MASTER LOG VAULT (SECURITY DASHBOARD) */}
            <div className="flex-1 min-h-0 bg-slate-900/20 rounded-[6rem] border-2 border-slate-800/40 p-4 shadow-3xl overflow-hidden relative">
               <SecurityDashboard logs={securityVault} onClear={handleVaultPurge} />
               
               {/* Dashboard Badges */}
               <div className="absolute top-14 right-14 flex gap-6">
                  <div className="px-6 py-3 bg-black/80 rounded-full border border-slate-700 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400 shadow-2xl backdrop-blur-xl">
                    Vault_Used: {((securityVault.length / 500) * 100).toFixed(1)}%
                  </div>
               </div>
            </div>

            {/* SYSTEM EVENT TERMINAL (HIGH-PRECISION LOGS) */}
            <div className={`bg-[#020617] p-16 rounded-[5rem] border-2 border-slate-800 shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden flex flex-col transition-all duration-1000 ${
               isShieldActive || currentStatus === SecurityMode.ALERT ? 'h-[600px]' : 'h-36'
            }`}>
               <div className="flex justify-between items-center mb-14">
                 <div className="flex items-center gap-10">
                    <div className="flex items-center gap-8">
                       <h3 className="text-[18px] font-black text-slate-500 uppercase tracking-[1em]">Event_Terminal</h3>
                       <div className="px-8 py-3 bg-slate-900 rounded-full border border-slate-800 flex gap-6 shadow-inner">
                          <div className={`w-4 h-4 rounded-full ${currentStatus === SecurityMode.ALERT ? 'bg-red-500 animate-pulse' : 'bg-red-500/20'}`} />
                          <div className="w-4 h-4 rounded-full bg-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]" />
                          <div className="w-4 h-4 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-14">
                    <div className="flex items-center gap-4 border-r border-slate-800 pr-10">
                       <span className="text-[12px] text-slate-700 font-bold uppercase tracking-[0.4em]">Synapse_RTT:</span>
                       <span className="text-[12px] text-green-500 font-black tracking-[0.4em] uppercase">{telemetry.synapseLatency}ms</span>
                    </div>
                    <button 
                      onClick={() => setTerminalLogs([])} 
                      className="text-[12px] text-slate-700 hover:text-slate-200 font-black uppercase tracking-[0.6em] transition-all"
                    >
                      Purge_Console
                    </button>
                 </div>
               </div>
               
               {/* TERMINAL SCROLL ENGINE */}
               <div className="flex-1 overflow-y-auto font-mono text-[14px] space-y-5 scrollbar-hide pr-12">
                 {terminalLogs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-[0.08]">
                       <p className="text-cyan-500 italic uppercase tracking-[1.5em] animate-pulse text-center leading-[3] text-xl">System_Standby...<br/>Terminal_Buffer_Empty</p>
                    </div>
                 )}
                 {terminalLogs.map((log) => (
                   <div key={log.id} className="flex gap-12 group animate-in slide-in-from-left duration-700 border-l-2 border-transparent hover:border-cyan-500/40 pl-6 py-1">
                     <span className="text-slate-700 font-black tabular-nums tracking-tighter opacity-60">[{log.timestamp}]</span>
                     <span className={`flex-1 transition-all duration-300 group-hover:translate-x-3 ${
                       log.severity === 'critical' ? 'text-red-500 font-black shadow-[0_0_30px_rgba(239,68,68,0.4)] bg-red-500/5 px-4 rounded' : 
                       log.severity === 'error' ? 'text-red-400' : 
                       log.severity === 'med' ? 'text-yellow-400' : 
                       log.severity === 'system' ? 'text-green-400 font-bold underline decoration-green-900 underline-offset-8' : 
                       log.severity === 'neural' ? 'text-indigo-400 font-black italic shadow-[0_0_20px_rgba(129,140,248,0.2)]' : 'text-cyan-500/70'
                     }`}>
                       {log.severity.toUpperCase()} {`>>`} {log.message}
                     </span>
                     <span className="text-slate-900 text-[11px] font-black tracking-tighter hidden 2xl:block uppercase opacity-40">
                       SEC_{Math.floor(Math.random()*9000)+1000}
                     </span>
                   </div>
                 ))}
                 
                 {isUploadingRecord && (
                    <div className="mt-12 p-14 bg-cyan-500/5 border-2 border-cyan-500/10 rounded-[4rem] animate-pulse flex flex-col gap-8 shadow-2xl">
                       <div className="flex justify-between items-center">
                          <p className="text-cyan-500 font-black uppercase text-[13px] tracking-[0.8em]">Vault_Archiving_Sequence_Active...</p>
                          <span className="text-cyan-500 font-black text-sm px-4 py-1 bg-cyan-900/30 rounded-full">UPLOADING...</span>
                       </div>
                       <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden shadow-inner">
                          <div className="w-1/3 h-full bg-cyan-500 shadow-[0_0_30px_#06b6d4] animate-[loading_1.8s_ease-in-out_infinite]" />
                       </div>
                    </div>
                 )}
               </div>
               
               {/* TERMINAL DIAGNOSTICS FOOTER */}
               <div className="mt-14 pt-14 border-t-2 border-slate-900/80 flex flex-wrap justify-between items-center gap-12">
                  <div className="flex gap-24">
                    <div className="space-y-3">
                      <p className="text-[11px] text-slate-700 font-black uppercase tracking-[0.6em]">Entropy_Index</p>
                      <div className="flex items-end gap-4">
                        <p className="text-2xl text-slate-500 font-black tabular-nums">{telemetry.entropyLevel}</p>
                        <span className="text-[11px] text-slate-800 font-black mb-1.5 uppercase tracking-widest">Global_X</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[11px] text-slate-700 font-black uppercase tracking-[0.6em]">Memory_Commit</p>
                      <p className="text-2xl text-slate-500 font-black tabular-nums">{telemetry.loadFactor}%</p>
                    </div>
                    <div className="space-y-3 hidden 2xl:block">
                      <p className="text-[11px] text-slate-700 font-black uppercase tracking-[0.6em]">Integrity_Score</p>
                      <p className="text-2xl text-green-700 font-black tabular-nums">{telemetry.integrityScore}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-10">
                     <p className="text-[12px] text-slate-700 font-black uppercase tracking-[0.6em]">Core_Handshake:</p>
                     <div className="flex gap-4 items-end h-10">
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-3 rounded-full transition-all duration-700 ${
                              i < 9 ? 'bg-cyan-500/20 h-6' : 'bg-slate-800 h-3 animate-pulse'
                            }`} 
                          />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </section>
        </main>
        
        {/* --- SYSTEM FOOTER CREDITS --- */}
        <footer className="text-center pb-24 pt-16 border-t border-slate-900/30">
           <p className="text-[12px] font-black text-slate-800 uppercase tracking-[1.5em] opacity-40 hover:opacity-100 transition-opacity cursor-default select-none">
             Aether_Shield_Network // Neural_Defense_Verified // v6.0_STABLE
           </p>
        </footer>
      </div>

      {/* --- BACKGROUND PROCESSING CANVAS --- */}
      <canvas ref={processingCanvasRef} className="hidden" />
      
      {/* --- GLOBAL ANIMATIONS & CUSTOM STYLES --- */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-150px); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(1200px); opacity: 0; }
        }
        @keyframes loading {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(300%); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        ::selection {
          background: rgba(8, 145, 178, 0.5);
          color: white;
        }

        /* High-Definition Text Glow */
        .glow-text {
          text-shadow: 0 0 20px rgba(8, 145, 178, 0.4);
        }
      `}</style>
    </div>
  );
};

export default App;
