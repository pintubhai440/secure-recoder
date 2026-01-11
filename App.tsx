import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SecurityMode, SecurityLog } from './types';
import SecurityDashboard from './components/SecurityDashboard';
import { analyzeIntrusion, securityChat } from './services/geminiService';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [mode, setMode] = useState<SecurityMode>(SecurityMode.IDLE);
  const [ownerFace, setOwnerFace] = useState<string | null>(null);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- REFS FOR MEDIA ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // --- 1. INITIALIZATION: SUPABASE HISTORY LOAD ---
  useEffect(() => {
    const loadLogsFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('security_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedLogs: SecurityLog[] = data.map(dbLog => ({
            id: dbLog.id,
            timestamp: new Date(dbLog.created_at).getTime(),
            intruderImage: dbLog.intruder_image,
            aiAnalysis: dbLog.ai_analysis,
            threatLevel: dbLog.threat_level as 'High' | 'Medium' | 'Low',
            status: 'Archived',
            screenRecordingUrl: dbLog.screen_recording_url || null
          }));
          setLogs(formattedLogs);
        }
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };
    loadLogsFromSupabase();
  }, []);

  // --- 2. CAMERA SETUP ---
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera access denied", err);
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          text: "CRITICAL: Camera access is required for Sentinel AI protection." 
        }]);
      }
    };
    startCamera();
  }, []);

  // --- 3. HELPER FUNCTIONS ---
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return null;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    return canvasRef.current.toDataURL('image/jpeg');
  };

  const handleEnroll = () => {
    const face = captureFrame();
    if (face) {
      setOwnerFace(face);
      setMode(SecurityMode.MONITORING);
      setIsMonitoring(true);
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Biometric signature encrypted and stored. Sentinel monitoring active." 
      }]);
    }
  };

  const startSilentRecording = async (logId: string) => {
    try {
      if (!screenStreamRef.current || !screenStreamRef.current.active) {
        screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
      }

      const recorder = new MediaRecorder(screenStreamRef.current, {
        mimeType: 'video/webm;codecs=vp8'
      });
      
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        
        // Local state update
        setLogs(prev => prev.map(log => 
          log.id === logId ? { ...log, screenRecordingUrl: videoUrl, status: 'Archived' } : log
        ));

        // Note: Real video upload to Supabase Storage would go here
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      
      // Stop after 10 seconds of intruder activity
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 10000);

      return true;
    } catch (err) {
      console.error("Screen recording failed", err);
      return false;
    }
  };

  // --- 4. CORE SECURITY LOGIC ---
  const checkFace = useCallback(async () => {
    if (mode !== SecurityMode.MONITORING || !ownerFace) return;

    const currentFace = captureFrame();
    if (!currentFace) return;

    // SIMULATION: 10% chance of "Unknown User" detection for prototype testing
    const isOwner = Math.random() > 0.10; 

    if (!isOwner) {
      setMode(SecurityMode.ALERT);
      setIsMonitoring(false);
      
      const intruderImg = currentFace;
      const tempLogId = Date.now().toString();

      // UI Update: Immediately show detection
      const newLog: SecurityLog = {
        id: tempLogId,
        timestamp: Date.now(),
        intruderImage: intruderImg,
        screenRecordingUrl: null,
        status: 'Detected',
        threatLevel: 'High'
      };
      setLogs(prev => [newLog, ...prev]);

      try {
        // Step A: Gemini Vision Analysis
        const analysis = await analyzeIntrusion(intruderImg);
        
        // Step B: Save to Supabase Permanently
        const { error } = await supabase
          .from('security_logs')
          .insert([{
            intruder_image: intruderImg,
            ai_analysis: analysis,
            threat_level: 'High'
          }]);

        if (error) throw error;

        // Step C: Final UI Updates
        setLogs(prev => prev.map(l => l.id === tempLogId ? { ...l, aiAnalysis: analysis } : l));
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          text: `SECURITY ALERT: ${analysis}` 
        }]);

        // Step D: Start Silent Screen Record
        await startSilentRecording(tempLogId);

      } catch (err) {
        console.error("Security workflow error:", err);
      }

      // Resume Monitoring after delay
      setTimeout(() => {
        setMode(SecurityMode.MONITORING);
        setIsMonitoring(true);
      }, 15000);
    }
  }, [mode, ownerFace]);

  useEffect(() => {
    let interval: number;
    if (isMonitoring) {
      interval = window.setInterval(checkFace, 5000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, checkFace]);

  // --- 5. UI HANDLERS ---
  const toggleMonitoring = () => {
    if (!ownerFace) {
      setMode(SecurityMode.ENROLLING);
    } else {
      const active = !isMonitoring;
      setIsMonitoring(active);
      setMode(active ? SecurityMode.MONITORING : SecurityMode.IDLE);
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: active ? "Sentinel Dispatched. All protocols active." : "System Disarmed. Monitoring offline." 
      }]);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await securityChat(chatMessages, userMsg);
      setChatMessages(prev => [...prev, { role: 'ai', text: response || "Protocol failure. AI link timeout." }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "Encrypted AI link disrupted." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    // Note: In production, add supabase delete call here
  };

  // --- 6. RENDER ---
  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto font-sans selection:bg-cyan-500/30">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-full transition-all duration-700 ${
            mode === SecurityMode.ALERT ? 'bg-red-600 animate-pulse' : 'bg-cyan-600 shadow-[0_0_15px_rgba(8,145,178,0.4)]'
          }`}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent uppercase italic">
              SENTINEL AI
            </h1>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-slate-700'}`}></span>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
                Protection Level: <span className={mode === SecurityMode.ALERT ? 'text-red-500' : 'text-cyan-400'}>{mode}</span>
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={toggleMonitoring}
          className={`px-10 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl border ${
            isMonitoring 
              ? 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500 hover:text-white' 
              : 'bg-cyan-600 text-white border-cyan-400/50 hover:bg-cyan-500'
          }`}
        >
          {isMonitoring ? 'Disarm Sentinel' : 'Arm Protection'}
        </button>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Vision & Identity */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Live Camera Card */}
          <div className="relative rounded-3xl border-2 border-slate-800 bg-black aspect-video overflow-hidden shadow-2xl group">
             <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1] opacity-60" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
             <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-[10px] font-mono text-cyan-400 border border-cyan-400/30 flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></span>
               LIVE_FEED_SECURE
             </div>
             {mode === SecurityMode.ALERT && (
               <div className="absolute inset-0 bg-red-900/40 border-4 border-red-600 flex flex-col items-center justify-center animate-pulse">
                  <div className="bg-red-600 text-white px-6 py-2 font-black text-sm tracking-[0.4em] mb-2 shadow-2xl">INTRUSION</div>
                  <div className="text-white text-[10px] font-mono uppercase">Recording Stealth Stream...</div>
               </div>
             )}
          </div>

          {/* Biometric Card */}
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Master Identity</h3>
            {ownerFace ? (
              <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 group">
                <img src={ownerFace} alt="Owner" className="w-16 h-16 rounded-xl border border-cyan-500/50 object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all" />
                <div className="flex-1">
                  <p className="text-cyan-100 text-sm font-bold">Authorized User</p>
                  <p className="text-[10px] text-slate-500 font-mono">STATUS: VERIFIED</p>
                </div>
                <button onClick={() => setOwnerFace(null)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleEnroll}
                className="w-full py-6 bg-slate-950/50 border-2 border-dashed border-slate-700 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-cyan-500/50 hover:text-cyan-400 transition-all group"
              >
                <span className="block mb-1 group-hover:scale-110 transition-transform">Capture Signature</span>
                <span className="text-[8px] font-mono text-slate-600">Scan Face to Initialize</span>
              </button>
            )}
          </div>

          {/* AI Chat Card */}
          <div className="flex-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex flex-col min-h-[300px]">
             <div className="flex items-center gap-2 mb-4">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Intelligence</span>
             </div>
             <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-hide">
               {chatMessages.length === 0 && (
                 <div className="h-full flex items-center justify-center text-slate-600 italic text-[10px] font-mono">Waiting for system logs...</div>
               )}
               {chatMessages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed font-mono shadow-lg ${
                      m.role === 'ai' ? 'bg-slate-800 text-cyan-50 border border-slate-700' : 'bg-cyan-600 text-white'
                    }`}>
                      {m.text}
                    </div>
                 </div>
               ))}
               {isLoading && <div className="text-cyan-400 text-[10px] animate-pulse font-mono">DECRYPTING RESPONSE...</div>}
             </div>
             <form onSubmit={handleChat} className="relative">
               <input 
                 value={chatInput}
                 onChange={(e) => setChatInput(e.target.value)}
                 placeholder="Ask Sentinel..."
                 className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-mono focus:outline-none focus:border-cyan-500/50 transition-all text-cyan-50"
               />
               <button className="absolute right-4 top-4 text-slate-600 hover:text-cyan-500">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" /></svg>
               </button>
             </form>
          </div>
        </div>

        {/* Right Column: Security Vault (Dashboard) */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <SecurityDashboard logs={logs} onClear={clearLogs} />
        </div>
      </main>

      {/* Invisible Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default App;
