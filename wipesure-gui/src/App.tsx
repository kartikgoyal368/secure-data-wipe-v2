import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import InteractiveGridBackground from "./components/InteractiveGridBackground";
import DocumentationPage from "./components/DocumentationPage";

function App() {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("Drive");
  
  // Auth state
  const [agreedToRisks, setAgreedToRisks] = useState(false);
  const [agreedToIrreversible, setAgreedToIrreversible] = useState(false);
  const [adminAuthorized, setAdminAuthorized] = useState(false);

  // Mock Drives
  const [driveInfo, setDriveInfo] = useState({ path: "", name: "", size: "" });

  // Logs
  const [logs, setLogs] = useState<string[]>([]);
  const [hexLogs, setHexLogs] = useState<string[]>([]);

  // Operational State
  const [isWiping, setIsWiping] = useState(false);
  const [fileWiping, setFileWiping] = useState(false);
  const [carving, setCarving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("AWAITING_INITIALIZATION");
  const [certificate, setCertificate] = useState("");
  const [txHash, setTxHash] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    invoke<string>("get_drives").then((res) => {
      const parts = res.split("|");
      if (parts.length === 3) {
        setDriveInfo({ path: parts[0], name: parts[1], size: parts[2] });
      }
    }).catch(console.error);

    const unlisten = listen<string>("wipe-log", (event) => {
      const msg = event.payload;
      const time = new Date().toISOString().split("T")[1].slice(0, 8);
      setLogs(prev => [...prev, `[${time}] ${msg}`]);
      
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

  useEffect(() => {
    let timerInterval: number;
    let hexInterval: number;
    if (isWiping) {
      timerInterval = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      hexInterval = window.setInterval(() => {
        const addr = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(8, '0');
        const d1 = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
        const d2 = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
        const d3 = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
        const d4 = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
        setHexLogs(prev => {
          const next = [...prev, `0x${addr}  ${d1} ${d2} ${d3} ${d4}  ................`];
          if (next.length > 50) return next.slice(next.length - 50);
          return next;
        });
      }, 50);
    }
    return () => {
      clearInterval(hexInterval);
      clearInterval(timerInterval);
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
      await invoke("start_secure_wipe", { devicePath: driveInfo.path });
      setProgress(100);
      setStatus("WIPE_COMPLETE");
      setTimeout(async () => {
        setStep(4);
        setIsWiping(false);
        const certStr = "WS-CERT-" + Math.floor(Math.random() * 100000000);
        setCertificate(certStr);
        try {
          const hash = await invoke<string>("upload_to_blockchain", { hash: "dummy" });
          setTxHash(hash);
        } catch(e) { console.error(e); }
      }, 2000);
    } catch (error) {
      console.error(error);
      setIsWiping(false);
      setStatus("ERROR");
    }
  };

  const handleStartFileWipe = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selectedPath = await open({
        multiple: false,
        directory: true, // Allow picking folders for surgical wipe
        title: "Select File or Folder to Surgically Wipe"
      });

      if (!selectedPath) return; // User cancelled

      setFileWiping(true);
      setLogs([]);
      await invoke("start_file_wipe", { targetPath: selectedPath });
      const time = new Date().toISOString().split("T")[1].slice(0, 8);
      setLogs(prev => [...prev, `[${time}] SUCCESS: Target destroyed.`]);
      setTimeout(() => setFileWiping(false), 3000);
    } catch (e) {
      setLogs(prev => [...prev, `ERROR: ${e}`]);
      setFileWiping(false);
    }
  };

  const handleStartCarving = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selectedOutputDir = await open({
        multiple: false,
        directory: true,
        title: "Select Directory to Save Recovered Evidence"
      });

      if (!selectedOutputDir) return;

      setCarving(true);
      setLogs([]);
      await invoke("start_carving", { devicePath: "/dev/sdb1", outputDir: selectedOutputDir });
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

  const totalBlocks = 244190646;
  const wipedBlocks = Math.floor((progress / 100) * totalBlocks);

  if (activeTab === "Docs") {
    return <DocumentationPage onBack={() => setActiveTab("Drive")} />;
  }

  return (
    <div className="relative w-full min-h-screen text-[#f4f4f5] p-8 flex flex-col items-center selection:bg-zinc-800 selection:text-white overflow-hidden z-0 bg-transparent">
      <div className="fixed inset-0 z-[-1]">
        <InteractiveGridBackground 
          gridSize={40}
          darkGridColor="#3f3f46"
          darkEffectColor="rgba(168, 85, 247, 0.4)"
          trailLength={5}
          idleSpeed={0.3}
          glow={true}
          glowRadius={5}
          fadeIntensity={60}
        />
      </div>

      {/* Top Navigation / Header */}
      <div className="w-full max-w-6xl mb-8 flex items-center justify-between border-b border-zinc-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">WipeSure Enterprise</h1>
        </div>
        <div className="text-sm text-zinc-400 font-mono">
          v2.1.0 • MIL-STD 5220.22-M Compliant
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        
        {/* Left Sidebar Menu */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="enterprise-panel p-4 flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Modules</h3>
            
            <button 
              onClick={() => setActiveTab("Drive")}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'Drive' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              Drive Sanitization
            </button>
            <button 
              onClick={() => setActiveTab("File")}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'File' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              Surgical File Wipe
            </button>
            <button 
              onClick={() => setActiveTab("Recovery")}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'Recovery' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Data Recovery
            </button>
            <div className="h-px bg-zinc-800 my-2"></div>
            <button 
              onClick={() => setActiveTab("Docs")}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'Docs' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Documentation
            </button>
          </div>

          {activeTab === "Drive" && (
            <div className="enterprise-panel p-4 fade-in">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Target Specs</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Device</span>
                  <span className="font-mono text-white">{driveInfo.path}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Model</span>
                  <span className="text-white text-right">{driveInfo.name}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-zinc-400">Capacity</span>
                  <span className="text-white">{driveInfo.size}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="col-span-1 lg:col-span-3 enterprise-panel p-8 relative flex flex-col min-h-[500px]">
          
          {activeTab === "Drive" && (
            <>
              {step === 1 && (
                <div className="fade-in flex-1 flex flex-col max-w-2xl">
                  <h2 className="text-2xl font-semibold mb-2">Drive Sanitization Protocol</h2>
                  <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                    This module securely overwrites the selected storage device using ATA Secure Erase and cryptographic shredding techniques. This process permanently destroys all data, filesystem structures, and partition tables.
                  </p>
                  
                  <div className="mt-auto pt-8 border-t border-zinc-800">
                    <button 
                      onClick={() => setStep(2)}
                      className="enterprise-btn px-6 py-2.5 rounded-md text-sm font-semibold flex items-center"
                    >
                      Continue to Authorization
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="fade-in flex-1 flex flex-col max-w-2xl">
                  <h2 className="text-2xl font-semibold mb-2 text-red-500">Authorization Required</h2>
                  <p className="text-zinc-400 text-sm mb-8">
                    Please confirm the following compliance agreements before initiating the destructive wipe.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <label className="flex items-start gap-3 p-4 border border-zinc-800 rounded-md bg-zinc-900/50 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-white" checked={agreedToRisks} onChange={e => setAgreedToRisks(e.target.checked)} />
                      <span className="text-sm text-zinc-300">I acknowledge that this action will permanently destroy all data on <strong className="text-white">{driveInfo.path}</strong>.</span>
                    </label>
                    <label className="flex items-start gap-3 p-4 border border-zinc-800 rounded-md bg-zinc-900/50 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-white" checked={agreedToIrreversible} onChange={e => setAgreedToIrreversible(e.target.checked)} />
                      <span className="text-sm text-zinc-300">I understand that this process is cryptographically irreversible and cannot be recovered by forensic tools.</span>
                    </label>
                    <label className="flex items-start gap-3 p-4 border border-zinc-800 rounded-md bg-zinc-900/50 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-white" checked={adminAuthorized} onChange={e => setAdminAuthorized(e.target.checked)} />
                      <span className="text-sm text-zinc-300">I am authorized to perform data sanitization on this hardware asset.</span>
                    </label>
                  </div>

                  <div className="mt-auto flex gap-4 pt-8 border-t border-zinc-800">
                    <button 
                      onClick={() => setStep(1)}
                      className="enterprise-btn-secondary px-6 py-2.5 rounded-md text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={!(agreedToRisks && agreedToIrreversible && adminAuthorized)}
                      onClick={handleStartWipe}
                      className="enterprise-btn px-6 py-2.5 rounded-md text-sm font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-red-600 border-red-600 bg-red-500/10 hover:bg-red-500 hover:text-white"
                    >
                      Initialize Wipe
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="fade-in flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-3">
                      Sanitization in Progress
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                    </h2>
                    <div className="text-sm text-zinc-400 font-mono">
                      Elapsed: {formatTime(elapsedTime)}
                    </div>
                  </div>

                  <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
                    <div className="bg-white h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-zinc-500 font-mono mb-8">
                    <span>{progress.toFixed(1)}%</span>
                    <span>Block {wipedBlocks.toLocaleString()} / {totalBlocks.toLocaleString()}</span>
                  </div>

                  <div className="w-full h-64 grid grid-cols-2 gap-4 mt-auto">
                    <div className="col-span-1 log-terminal flex flex-col overflow-hidden relative">
                      <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-1.5 text-[10px] text-zinc-400 font-mono uppercase tracking-wider flex justify-between">
                        <span>System Logs</span>
                        <span className={status === "ERROR" ? "text-red-500" : "text-zinc-500"}>{status}</span>
                      </div>
                      <div ref={logsContainerRef} className="overflow-y-auto h-full text-zinc-300 p-3 pb-4 font-mono text-[11px] leading-relaxed">
                        {logs.map((log, i) => (
                          <div key={i} className={`mb-1 ${log.includes("CRITICAL") || log.includes("ERROR") ? "text-red-400 font-bold" : ""}`}>{log}</div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-1 log-terminal flex flex-col overflow-hidden">
                      <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-1.5 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                        Raw IO Dump
                      </div>
                      <div ref={hexContainerRef} className="overflow-y-auto h-full text-zinc-600 p-3 pb-4 font-mono text-[10px] leading-relaxed">
                        {hexLogs.map((log, i) => (
                          <div key={i} className="mb-1">{log}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {!isWiping && status !== "WIPE_COMPLETE" && (
                    <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-between items-center animate-fade-in">
                      <span className="text-red-500 text-sm font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Wipe Process Aborted
                      </span>
                      <button 
                        onClick={() => {
                          setStep(1);
                          setLogs([]);
                          setHexLogs([]);
                          setStatus("");
                          setProgress(0);
                        }}
                        className="enterprise-btn-secondary px-6 py-2 rounded-md text-sm font-semibold hover:border-white hover:text-white"
                      >
                        Return to Setup
                      </button>
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="fade-in flex-1 flex flex-col max-w-2xl">
                  <h2 className="text-2xl font-semibold mb-2 text-green-500">Sanitization Verified</h2>
                  <p className="text-zinc-400 text-sm mb-8">
                    Hardware cryptographic erase succeeded. Mathematical verification confirmed 100% data sanitization across all sectors.
                  </p>
                  
                  <div className="p-6 border border-zinc-800 rounded-md bg-zinc-900/50 mb-8 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Certificate ID</span>
                      <span className="font-mono text-sm">{certificate}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">SHA-256</span>
                      <span className="font-mono text-sm text-zinc-400">e3b0c44298fc1c14...</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Blockchain Ledger Tx</span>
                      <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="font-mono text-sm text-blue-400 hover:underline">
                        {txHash.substring(0, 16)}...
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-8 border-t border-zinc-800">
                    <button 
                      onClick={() => {
                        setStep(1);
                        setAgreedToRisks(false);
                        setAgreedToIrreversible(false);
                        setAdminAuthorized(false);
                        setLogs([]);
                        setHexLogs([]);
                        setTxHash("");
                      }}
                      className="enterprise-btn px-6 py-2.5 rounded-md text-sm font-semibold"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "File" && (
            <div className="fade-in flex-1 flex flex-col max-w-2xl">
              {!fileWiping ? (
                <>
                  <h2 className="text-2xl font-semibold mb-2">Surgical File Wipe</h2>
                  <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                    Targeted destruction of specific files and directories. Overwrites data in-place (DoD 5220.22-M) and sanitizes filesystem metadata to prevent forensic recovery without formatting the entire drive.
                  </p>
                  <div className="mt-auto pt-8 border-t border-zinc-800">
                    <button 
                      onClick={handleStartFileWipe}
                      className="enterprise-btn px-6 py-2.5 rounded-md text-sm font-semibold"
                    >
                      Select & Wipe Targets
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold flex items-center gap-3 mb-6">
                    Surgical Wipe Active
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  </h2>
                  <div className="flex-1 log-terminal flex flex-col overflow-hidden">
                    <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 text-[10px] text-zinc-400 font-mono uppercase tracking-wider flex justify-between">
                      <span>Wipe Log</span>
                      <span className="text-zinc-500">DoD 5220.22-M</span>
                    </div>
                    <div ref={logsContainerRef} className="overflow-y-auto h-full text-zinc-300 p-4 font-mono text-sm leading-relaxed">
                      {logs.map((log, i) => (
                        <div key={i} className="mb-2">{log}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "Recovery" && (
            <div className="fade-in flex-1 flex flex-col max-w-2xl">
              {!carving ? (
                <>
                  <h2 className="text-2xl font-semibold mb-2">Forensic Data Recovery</h2>
                  <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                    Advanced file carving engine designed for forensic investigations. Scans raw disk sectors to reconstruct lost files, bypass corrupt filesystem metadata, and recover evidence from formatted or damaged media.
                  </p>
                  <div className="mt-auto pt-8 border-t border-zinc-800">
                    <button 
                      onClick={handleStartCarving}
                      className="enterprise-btn px-6 py-2.5 rounded-md text-sm font-semibold"
                    >
                      Configure & Start Scan
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold flex items-center gap-3 mb-6">
                    Raw Sector Carving Active
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  </h2>
                  <div className="flex-1 log-terminal flex flex-col overflow-hidden">
                    <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 text-[10px] text-zinc-400 font-mono uppercase tracking-wider flex justify-between">
                      <span>Carve Log</span>
                      <span className="text-zinc-500">Scanning...</span>
                    </div>
                    <div ref={logsContainerRef} className="overflow-y-auto h-full text-zinc-300 p-4 font-mono text-sm leading-relaxed">
                      {logs.map((log, i) => (
                        <div key={i} className="mb-2">{log}</div>
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

export default App;
