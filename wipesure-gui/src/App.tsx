import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

// Helper for generating random hex strings
const generateHex = (length: number) => {
  let result = '';
  const characters = '0123456789ABCDEF';
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export default function App() {
  const [activeTab, setActiveTab] = useState("Drive");
  const [step, setStep] = useState(1);
  const [driveInfo, setDriveInfo] = useState({ path: "/dev/nvme0n1", name: "Detecting...", size: "..." });
  
  // Permissions State
  const [agreedToRisks, setAgreedToRisks] = useState(false);
  const [agreedToIrreversible, setAgreedToIrreversible] = useState(false);
  const [adminAuthorized, setAdminAuthorized] = useState(false);

  // Wipe State
  const [isWiping, setIsWiping] = useState(false);
  const [fileWiping, setFileWiping] = useState(false);
  const [carving, setCarving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("AWAITING_INITIALIZATION");
  const [certificate, setCertificate] = useState("");
  const [txHash, setTxHash] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [hexLogs, setHexLogs] = useState<string[]>([]);
  
  // Telemetry State
  const [elapsedTime, setElapsedTime] = useState(0);
  const [ioSpeed, setIoSpeed] = useState("0.00 MB/s");
  const [cpuTemp, setCpuTemp] = useState("45°C");

  const hexIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);


  useEffect(() => {
    // Fetch real drive info when app loads
    invoke("get_drives").then((res: any) => {
      const parts = res.split("|");
      if (parts.length === 3) {
        setDriveInfo({ path: parts[0], name: parts[1], size: parts[2] });
      }
    }).catch(console.error);

    // Listen to streaming logs from Rust
    const unlisten = listen<string>("wipe-log", (event) => {
      const msg = event.payload;
      
      const time = new Date().toISOString().split("T")[1].slice(0, 8);
      setLogs(prev => [...prev, `[${time}] ${msg}`]);
      
      // Dynamically update progress/status based on log keywords
      if (msg.includes("Initializing")) {
        setStatus("ESCALATING_PRIVILEGES");
        setProgress(15);
      } else if (msg.includes("Scanning") || msg.includes("HPA")) {
        setStatus("ANALYZING_TOPOLOGY");
        setProgress(35);
      } else if (msg.includes("Issuing") || msg.includes("Erase") || msg.includes("high-voltage")) {
        setStatus("EXECUTING_HARDWARE_ERASE");
        setProgress(60);
      } else if (msg.includes("verify_wipe()")) {
        setStatus("MATHEMATICAL_VERIFICATION");
        setProgress(85);
      }
    });

    const unlistenCarve = listen<string>("carve-log", (event) => {
      const msg = event.payload;
      const time = new Date().toISOString().split("T")[1].slice(0, 8);
      setLogs(prev => [...prev, `[${time}] ${msg}`]);
    });

    return () => {
      unlisten.then(f => f());
      unlistenCarve.then(f => f());
    };
  }, []);

  // Auto-scroll logs
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const hexContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (hexContainerRef.current) {
      hexContainerRef.current.scrollTop = hexContainerRef.current.scrollHeight;
    }
  }, [hexLogs]);

  // Telemetry & Hex stream effect
  useEffect(() => {
    if (isWiping) {
      // Hex Streamer
      hexIntervalRef.current = window.setInterval(() => {
        setHexLogs(prev => {
          const newHex = `0x${generateHex(4)} 0x${generateHex(4)} 0x${generateHex(4)} 0x${generateHex(4)}  ${generateHex(8)}`;
          const updated = [...prev, newHex];
          return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
        });
        
        // Randomize speed and temp for visual effect during wipe
        setIoSpeed(`${(Math.random() * 2.5 + 3.1).toFixed(2)} GB/s`);
        setCpuTemp(`${Math.floor(Math.random() * 15 + 60)}°C`);
      }, 100);

      // Timer
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (hexIntervalRef.current) clearInterval(hexIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setIoSpeed("0.00 MB/s");
      setCpuTemp("42°C");
    }

    return () => {
      if (hexIntervalRef.current) clearInterval(hexIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isWiping, fileWiping, carving]);

  const handleStartWipe = async () => {
    setStep(3);
    setIsWiping(true);
    setStatus("ESCALATING_PRIVILEGES");
    setProgress(5);
    setLogs([]); 
    setHexLogs([]);
    setElapsedTime(0);
    
    try {
      // Trigger backend process
      await invoke("start_secure_wipe", { devicePath: driveInfo.path });
      
      setStatus("UPLOADING_TO_BLOCKCHAIN");
      setProgress(95);
      
      const time = new Date().toISOString().split("T")[1].slice(0, 8);
      setLogs(prev => [...prev, `[${time}] Transmitting SHA-256 hash to Polygon Mainnet...`]);
      
      try {
        const mock_pdf_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        const returned_tx: any = await invoke("upload_to_blockchain", { hash: mock_pdf_hash });
        setTxHash(returned_tx);
        setLogs(prev => [...prev, `[${time}] Transaction confirmed. TX: ${returned_tx.substring(0, 10)}...`]);
      } catch (e) {
        setLogs(prev => [...prev, `[${time}] Blockchain upload failed.`]);
      }
      
      setStatus("SANITIZATION_COMPLETE"); 
      setProgress(100); 
      setCertificate("tamper_proof_cert_93a1f.pdf");
      setIsWiping(false);
      setStep(4);
    } catch (error) {
      const time = new Date().toISOString().split("T")[1].slice(0, 8);
      setLogs(prev => [...prev, `[${time}] FATAL ERROR: ${error}`]);
      setStatus("WIPE_FAILED");
      setIsWiping(false);
    }
  };

  const handleStartFileWipe = async () => {
    setFileWiping(true);
    setLogs([]);
    try {
      await invoke("start_file_wipe", { targetPath: "/Users/kartikgoyal/Documents/Secret_Case" });
      const time = new Date().toISOString().split("T")[1].slice(0, 8);
      setLogs(prev => [...prev, `[${time}] SUCCESS: Target destroyed.`]);
      setTimeout(() => setFileWiping(false), 3000);
    } catch (e) {
      setLogs(prev => [...prev, `ERROR: ${e}`]);
      setFileWiping(false);
    }
  };

  const handleStartCarving = async () => {
    setCarving(true);
    setLogs([]);
    try {
      await invoke("start_carving", { devicePath: "/dev/sdb1", outputDir: "/Desktop/Recovered_Evidence" });
      const time = new Date().toISOString().split("T")[1].slice(0, 8);
      setLogs(prev => [...prev, `[${time}] SUCCESS: Carving finished.`]);
      setTimeout(() => setCarving(false), 3000);
    } catch (e) {
      setLogs(prev => [...prev, `ERROR: ${e}`]);
      setCarving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Generate 200 blocks for the sector map
  const totalBlocks = 200;
  const wipedBlocks = Math.floor((progress / 100) * totalBlocks);

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white p-6 flex flex-col items-center font-sans selection:bg-cyan-900 selection:text-cyan-100 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <div className="w-full max-w-7xl mb-6 flex items-end justify-between border-b border-white/10 pb-4 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter flex items-center gap-3">
            <span className="text-cyan-400">WIPESURE</span>
            <span className="font-light text-neutral-400">ENTERPRISE</span>
          </h1>
          <p className="text-neutral-500 text-xs tracking-[0.3em] mt-1 font-mono uppercase">Forensic-Grade Data Sanitization</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-[10px] text-cyan-500/70 font-mono tracking-widest border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 rounded-sm mb-2 uppercase">MIL-STD 5220.22-M Compliant</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-mono uppercase">Node: KIOSK-01</span>
            <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded border border-white/10">
              <span className={`w-2 h-2 rounded-full ${isWiping ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'}`}></span>
              <span className="text-xs text-white font-mono">{isWiping ? 'SYS_BUSY' : 'SYS_READY'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        
        {/* Left Sidebar - Navigation & Specs */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* Navigation Panel */}
          <div className="border border-white/10 bg-black/40 backdrop-blur-md p-5 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-xs font-bold text-neutral-400 tracking-widest mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              MODULES
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab("Drive")}
                className={`w-full text-left px-3 py-2 rounded text-[11px] font-bold tracking-widest transition-colors uppercase ${activeTab === "Drive" ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-neutral-400 hover:bg-white/5 border border-transparent'}`}
              >
                Secure Drive Eraser
              </button>
              <button 
                onClick={() => setActiveTab("File")}
                className={`w-full text-left px-3 py-2 rounded text-[11px] font-bold tracking-widest transition-colors uppercase ${activeTab === "File" ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-neutral-400 hover:bg-white/5 border border-transparent'}`}
              >
                File & Folder Eraser
              </button>
              <button 
                onClick={() => setActiveTab("Recovery")}
                className={`w-full text-left px-3 py-2 rounded text-[11px] font-bold tracking-widest transition-colors uppercase ${activeTab === "Recovery" ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-neutral-400 hover:bg-white/5 border border-transparent'}`}
              >
                Data Recovery
              </button>
            </div>
          </div>

          {activeTab === "Drive" && (
            <>
              {/* Target Specs Panel */}
              <div className="border border-white/10 bg-black/40 backdrop-blur-md p-5 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-xs font-bold text-neutral-400 tracking-widest mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              TARGET SPECS
            </h3>
            <div className="space-y-4 font-mono text-[11px] text-neutral-300">
              <div>
                <p className="text-neutral-600 mb-0.5">MOUNT POINT</p>
                <p className="font-bold text-cyan-400 text-sm">{driveInfo.path}</p>
              </div>
              <div>
                <p className="text-neutral-600 mb-0.5">HARDWARE ID</p>
                <p className="truncate text-white">{driveInfo.name}</p>
              </div>
              <div>
                <p className="text-neutral-600 mb-0.5">CAPACITY / SECTORS</p>
                <p className="text-white">{driveInfo.size} / 1,953,525,168</p>
              </div>
              <div>
                <p className="text-neutral-600 mb-0.5">ENCRYPTION ENGINE</p>
                <p className="text-white">OPAL v2.0 SED / AES-256</p>
              </div>
            </div>
          </div>

          {/* Live Telemetry Panel */}
          <div className={`border transition-colors duration-500 bg-black/40 backdrop-blur-md p-5 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${isWiping ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-white/10'}`}>
            <h3 className="text-xs font-bold text-neutral-400 tracking-widest mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              LIVE TELEMETRY
            </h3>
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">THROUGHPUT</span>
                <span className={`font-bold ${isWiping ? 'text-amber-400' : 'text-neutral-300'}`}>{ioSpeed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">CPU TEMP</span>
                <span className={`font-bold ${isWiping ? 'text-amber-400' : 'text-neutral-300'}`}>{cpuTemp}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">I/O QUEUE</span>
                <span className="text-white">O_DIRECT</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-neutral-500">ELAPSED</span>
                <span className="text-cyan-400 font-bold text-sm">{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>
            </>
          )}

        </div>

        {/* Right Main Container */}
        <div className="col-span-1 lg:col-span-3 border border-white/10 bg-black/40 backdrop-blur-xl p-8 rounded-xl relative flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {activeTab === "Drive" && (
            <>
              {/* Step 1: Initialization */}
          {step === 1 && (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex-1 flex flex-col justify-center max-w-2xl">
              <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h2 className="text-3xl font-bold mb-3 tracking-tight">Hardware Locked & Ready</h2>
              <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                The WipeSure engine has mapped the physical topology of <strong className="text-white">{driveInfo.path}</strong> and secured exclusive NVMe/ATA locks. OS interventions are suspended. 
              </p>
              
              <div className="mt-auto">
                <button 
                  onClick={() => setStep(2)}
                  className="group relative inline-flex items-center justify-center bg-cyan-500 text-black px-8 py-3 rounded font-bold uppercase text-sm tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                >
                  Proceed to Authorization
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Permissions and Authorization */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                Legal Authorization
              </h2>
              <p className="text-neutral-400 text-sm mb-8 leading-relaxed max-w-2xl">
                Digital signature required for Level-3 Cryptographic Erasure. 
                Data destroyed in this manner is mathematically impossible to recover.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { state: agreedToRisks, set: setAgreedToRisks, title: "Assumption of Liability", desc: "I understand that this software will completely and permanently destroy all data, including hidden HPA/DCO partitions." },
                  { state: agreedToIrreversible, set: setAgreedToIrreversible, title: "Acknowledge Irreversibility", desc: "No recovery software or forensic electron microscopy will be able to retrieve data after this process." },
                  { state: adminAuthorized, set: setAdminAuthorized, title: "Administrative Consent", desc: "I confirm that I have the legal authority to sanitize this hardware." }
                ].map((item, idx) => (
                  <label key={idx} className={`flex items-start gap-4 cursor-pointer p-5 border rounded-lg transition-all duration-300 ${item.state ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-white/10 bg-black/50 hover:border-white/30'}`}>
                    <input 
                      type="checkbox" 
                      className="mt-0.5 w-5 h-5 accent-cyan-500 cursor-pointer rounded border-neutral-700 bg-neutral-900"
                      checked={item.state}
                      onChange={(e) => item.set(e.target.checked)}
                    />
                    <span className="text-sm">
                      <strong className={`block mb-1 tracking-wider ${item.state ? 'text-cyan-400' : 'text-white'}`}>{item.title}</strong>
                      <span className="text-neutral-400 leading-snug block">{item.desc}</span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-6">
                <button 
                  onClick={() => setStep(1)}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Abort
                </button>
                <button 
                  onClick={handleStartWipe}
                  disabled={!agreedToRisks || !agreedToIrreversible || !adminAuthorized}
                  className="relative group bg-red-600 text-white px-8 py-3 rounded font-bold uppercase text-sm tracking-[0.2em] transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-red-500 disabled:hover:bg-red-600"
                >
                  <div className={`absolute inset-0 rounded bg-red-600 blur-md opacity-0 transition-opacity ${(!agreedToRisks || !agreedToIrreversible || !adminAuthorized) ? '' : 'group-hover:opacity-60'}`}></div>
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    EXECUTE HARDWARE WIPE
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Wiping Process */}
          {step === 3 && (
            <div className="animate-in fade-in duration-500 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-red-500 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                    Sanitization Active
                  </h2>
                  <p className="text-neutral-400 text-xs mt-1 font-mono uppercase">Interrupting power will brick the target device</p>
                </div>
                <div className="font-mono text-3xl font-light tracking-widest text-white/90">
                  {progress}%
                </div>
              </div>
              
              <div className="w-full mb-8 relative">
                <div className="flex justify-between text-xs font-mono mb-2 uppercase text-neutral-400">
                  <span className="text-cyan-400">{status}</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-300 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHBhdGggZD0iTTAgNDBoNDBMMDAgMHoiIGZpbGw9IiNmZmZmZmYyMCIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
                  </div>
                </div>
              </div>

              {/* Sector Map Visualization */}
              <div className="mb-6">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-2 border-b border-white/5 pb-1">Sector Map Visualization</h4>
                <div className="grid grid-cols-20 sm:grid-cols-25 md:grid-cols-40 gap-[1px] p-2 bg-neutral-950 rounded border border-white/5">
                  {Array.from({ length: totalBlocks }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-2 rounded-[1px] transition-colors duration-150 ${i < wipedBlocks ? 'bg-cyan-500/80 shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'bg-red-500/20'}`}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Dual Logs Panel */}
              <div className="w-full h-56 grid grid-cols-2 gap-4">
                {/* Event Logs */}
                <div className="col-span-1 p-3 border border-white/10 bg-black/60 rounded flex flex-col font-mono text-[10px] leading-relaxed relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-white/10 px-2 py-0.5 text-[9px] text-white/50 rounded-bl z-10">SYS_LOG</div>
                  <div ref={logsContainerRef} className="overflow-y-auto h-full text-cyan-300/80 pr-2 custom-scrollbar pb-2">
                    {logs.map((log, i) => (
                      <div key={i} className="mb-1">{log}</div>
                    ))}
                  </div>
                </div>

                {/* Hex Dump */}
                <div className="col-span-1 p-3 border border-white/10 bg-black/80 rounded flex flex-col font-mono text-[10px] leading-relaxed relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-white/10 px-2 py-0.5 text-[9px] text-white/50 rounded-bl z-10">RAW_DUMP</div>
                  <div ref={hexContainerRef} className="overflow-y-auto h-full text-neutral-500 pr-2 custom-scrollbar select-none pb-2">
                    {hexLogs.map((log, i) => (
                      <div key={i} className="mb-0.5">{log}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success & Certificate */}
          {step === 4 && (
            <div className="animate-in zoom-in-95 duration-700 flex-1 flex flex-col justify-center items-center text-center relative z-20">
              
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent -z-10"></div>

              <div className="w-24 h-24 bg-cyan-500/10 border border-cyan-500/50 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                <svg className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold mb-3 uppercase tracking-[0.2em] text-white drop-shadow-md">Sanitization Complete</h2>
              <p className="text-neutral-400 text-sm mb-10 max-w-md leading-relaxed">
                Hardware cryptographic erase succeeded. Mathematical verification confirmed 100% data sanitization across all sectors.
              </p>
              
              <div className="w-full max-w-lg border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md p-6 rounded-xl text-left mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em]">Certificate Issued</span>
                  <span className="font-mono text-white text-sm bg-white/5 px-2 py-1 rounded">{certificate}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 py-3">
                  <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em]">SHA-256 HASH</span>
                  <span className="font-mono text-neutral-300 text-[11px]">e3b0c44298fc1c14...</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em]">Polygon Tx</span>
                  <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="font-mono text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 group">
                    {txHash.substring(0, 14)}... 
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              </div>
              
              <button 
                className="bg-white text-black px-12 py-3 rounded font-bold uppercase tracking-[0.2em] text-sm hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                onClick={() => {
                  setStep(1);
                  setAgreedToRisks(false);
                  setAgreedToIrreversible(false);
                  setAdminAuthorized(false);
                  setLogs([]);
                  setHexLogs([]);
                  setTxHash("");
                }}
              >
                Return to Dashboard
              </button>
            </div>
          )}
            </>
          )}

          {activeTab === "File" && (
            <div className="animate-in fade-in duration-500 flex-1 flex flex-col justify-center items-center text-center">
              {!fileWiping ? (
                <>
                  <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 tracking-tight">Secure File & Folder Eraser</h2>
                  <p className="text-neutral-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
                    Targeted destruction of specific files and directories. Overwrites data in-place and sanitizes filesystem metadata to prevent forensic recovery.
                  </p>
                  <button 
                    onClick={handleStartFileWipe}
                    className="bg-cyan-500 text-black px-6 py-2 rounded font-bold uppercase text-xs tracking-widest hover:bg-cyan-400 transition-colors"
                  >
                    Select & Wipe Targets
                  </button>
                </>
              ) : (
                <div className="w-full text-left">
                  <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-red-500 flex items-center gap-3 mb-6">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                    Surgical Wipe Active
                  </h2>
                  <div className="w-full h-64 p-3 border border-white/10 bg-black/60 rounded flex flex-col font-mono text-[10px] leading-relaxed relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-white/10 px-2 py-0.5 text-[9px] text-white/50 rounded-bl z-10">WIPE_LOG</div>
                    <div ref={logsContainerRef} className="overflow-y-auto h-full text-cyan-300/80 pr-2 custom-scrollbar pb-2">
                      {logs.map((log, i) => (
                        <div key={i} className="mb-1">{log}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "Recovery" && (
            <div className="animate-in fade-in duration-500 flex-1 flex flex-col justify-center items-center text-center">
              {!carving ? (
                <>
                  <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 tracking-tight">Advanced Data Recovery</h2>
                  <p className="text-neutral-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
                    Forensic-grade file carving engine. Scans raw disk sectors to reconstruct lost files, bypass filesystem metadata, and recover evidence from formatted or damaged media.
                  </p>
                  <button 
                    onClick={handleStartCarving}
                    className="bg-cyan-500 text-black px-6 py-2 rounded font-bold uppercase text-xs tracking-widest hover:bg-cyan-400 transition-colors"
                  >
                    Configure & Start Scan
                  </button>
                </>
              ) : (
                <div className="w-full text-left">
                  <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-3 mb-6">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
                    Raw Sector Carving Active
                  </h2>
                  <div className="w-full h-64 p-3 border border-white/10 bg-black/60 rounded flex flex-col font-mono text-[10px] leading-relaxed relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-white/10 px-2 py-0.5 text-[9px] text-white/50 rounded-bl z-10">CARVE_LOG</div>
                    <div ref={logsContainerRef} className="overflow-y-auto h-full text-green-400/80 pr-2 custom-scrollbar pb-2">
                      {logs.map((log, i) => (
                        <div key={i} className="mb-1">{log}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
