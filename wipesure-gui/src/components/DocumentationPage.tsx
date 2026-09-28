import { useState, useEffect } from "react";
import InteractiveGridBackground from "./InteractiveGridBackground";
import { TextParticleAnimation } from "./TextParticleAnimation";

interface DocumentationPageProps {
  onBack: () => void;
}

export default function DocumentationPage({ onBack }: DocumentationPageProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading/decrypting the forensic manual with a short gap
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
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

        {/* Skeleton Top Nav */}
        <div className="w-full max-w-6xl mb-12 flex items-center justify-between pb-4 relative z-10 border-b border-zinc-800/50">
          <div className="w-32 h-6 shimmer rounded"></div>
          <div className="w-48 h-4 shimmer rounded"></div>
        </div>

        {/* Skeleton Hero & Content (Website Layout) */}
        <div className="w-full max-w-6xl flex-1 flex flex-col relative z-10">
          
          <div className="flex flex-col items-center justify-center text-center mt-10 mb-20">
            <div className="w-20 h-20 rounded-full shimmer mb-6"></div>
            <div className="w-96 h-12 shimmer rounded mb-6"></div>
            <div className="w-full max-w-2xl h-16 shimmer rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="col-span-1 border border-zinc-800/50 bg-black/20 rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl shimmer mb-6"></div>
                <div className="w-3/4 h-6 shimmer rounded mb-4"></div>
                <div className="w-full h-20 shimmer rounded mb-6"></div>
                <div className="w-full h-12 shimmer rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen text-[#f4f4f5] p-8 flex flex-col items-center selection:bg-zinc-800 selection:text-white z-0 bg-transparent overflow-y-auto custom-scrollbar">
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

      {/* Website Top Nav */}
      <div className="w-full max-w-6xl flex items-center justify-between border-b border-zinc-800/50 pb-4 mb-16 relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Application
        </button>
        <div className="text-sm text-zinc-500 font-mono uppercase tracking-widest">
          Forensic Documentation
        </div>
      </div>

      {/* Website Main Content */}
      <div className="w-full max-w-6xl flex-1 flex flex-col relative z-10 fade-in">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 mt-10">
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(168,85,247,0.1)] relative">
            <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl"></div>
            <svg className="w-10 h-10 text-zinc-100 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent pb-2">
            Transparency & Methodology
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
            WipeSure is engineered for absolute operational transparency. Explore the core technical algorithms, hardware-level commands, and cryptographic standards implemented in our Rust/C-Engine to guarantee both legal compliance and forensic integrity.
          </p>
        </div>

        {/* Section 1: Core Erase Protocols */}
        <div className="w-full mb-8 flex items-center gap-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent flex-1"></div>
          <h2 className="text-zinc-500 uppercase tracking-[0.2em] text-sm font-semibold">1. Sanitization Protocols</h2>
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          
          {/* DoD Algorithm Card */}
          <div className="col-span-1 xl:col-span-2 border border-zinc-800/50 bg-black/20 backdrop-blur-md rounded-3xl p-10 hover:border-zinc-500 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-zinc-800 transition-all">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div className="w-full">
                <h3 className="text-base font-semibold text-white mb-2">DoD 5220.22-M Sanitization Standard</h3>
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                  The U.S. Department of Defense standard dictates a highly secure, 3-pass overwrite mechanism designed to prevent both software and hardware-based (magnetic force microscopy) data recovery. Our implementation utilizes direct OS-bypass block writing to ensure caches do not intercept the payload.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-black border border-zinc-800 rounded p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Pass 1</div>
                    <div className="font-mono text-xs text-white">Binary Zeroes <span className="text-zinc-500">(0x00)</span></div>
                  </div>
                  <div className="bg-black border border-zinc-800 rounded p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Pass 2</div>
                    <div className="font-mono text-xs text-white">Binary Ones <span className="text-zinc-500">(0xFF)</span></div>
                  </div>
                  <div className="bg-black border border-zinc-800 rounded p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Pass 3</div>
                    <div className="font-mono text-xs text-white">Cryptographic <span className="text-zinc-500">(CSPRNG)</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SSD TRIM Bypass */}
          <div className="col-span-1 border border-zinc-800/50 bg-black/20 backdrop-blur-md rounded-3xl p-10 hover:border-zinc-500 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-800 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-2">SSD Firmware / TRIM Override</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Modern Solid State Drives use Wear Leveling algorithms that redirect overwrite commands to empty blocks, leaving original data intact. WipeSure utilizes low-level <code>ATA_SECURE_ERASE</code> and NVMe format commands to force the hardware controller to flush all NAND flash memory blocks simultaneously, bypassing OS limitations.
            </p>
            <div className="bg-black border border-zinc-800 rounded p-3 font-mono text-[11px] text-zinc-500">
              <div className="text-zinc-300">&gt; nvme format /dev/nvme0n1 --ses=1</div>
              <div className="text-white mt-1">Executing Cryptographic Erase (Sanitize)...</div>
            </div>
          </div>

        </div>

        {/* Section 2: Forensics & Metadata */}
        <div className="w-full mb-8 flex items-center gap-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent flex-1"></div>
          <h2 className="text-zinc-500 uppercase tracking-[0.2em] text-sm font-semibold">2. Recovery Prevention</h2>
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          {/* File Carving Card */}
          <div className="col-span-1 border border-zinc-800/50 bg-black/20 backdrop-blur-md rounded-3xl p-10 hover:border-zinc-500 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-800 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Raw Sector File Carving</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Our recovery engine bypasses corrupted filesystems (NTFS, APFS, ext4) entirely. It reads the disk byte-by-byte at the physical block level, scanning for standardized file signatures (Magic Bytes) to reconstruct lost forensic evidence.
            </p>
            <div className="bg-black border border-zinc-800 rounded p-3 font-mono text-[11px] text-zinc-500">
              <div className="flex justify-between items-center mb-1">
                <span>Scanning sector 2048...</span>
                <span className="text-white">MATCH</span>
              </div>
              <div className="text-zinc-300">Header: <span className="text-white">%PDF-</span> <span className="text-zinc-500">(0x25 0x50 0x44 0x46)</span></div>
            </div>
          </div>

          {/* Metadata Obfuscation Card */}
          <div className="col-span-1 border border-zinc-800/50 bg-black/20 backdrop-blur-md rounded-3xl p-10 hover:border-zinc-500 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-800 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-2">MFT & Journal Obfuscation</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Overwriting file contents leaves the original filename intact within the Master File Table (MFT) or APFS directory B-Trees. WipeSure mitigates this by cryptographically renaming target files and directories multiple times before zeroing their allocated blocks.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="bg-zinc-900 text-zinc-300 px-2 py-1 rounded border border-zinc-800">secret.pdf</span>
              <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <span className="bg-zinc-900 text-white px-2 py-1 rounded border border-zinc-700 truncate">f7b2c9a1_8x.tmp</span>
            </div>
          </div>

          {/* Audit Logging Card */}
          <div className="col-span-1 border border-zinc-800/50 bg-black/20 backdrop-blur-md rounded-3xl p-10 hover:border-zinc-500 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-800 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Cryptographic Audit Trails</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Upon completion of a drive sanitization, WipeSure generates a cryptographically signed JSON/PDF report containing the SHA-256 hashes of disk sectors before and after wiping, serving as tamper-proof legal verification of data destruction.
            </p>
            <div className="bg-black border border-zinc-800 rounded p-3 font-mono text-[11px] text-zinc-500">
              <div className="text-zinc-300 truncate">Hash_Pre: <span className="text-zinc-500">a3f9e2b1...</span></div>
              <div className="text-zinc-300 truncate mt-1">Hash_Post: <span className="text-white">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span></div>
            </div>
          </div>

        </div>

        {/* Section 3: Tauri Architecture Block */}
        <div className="w-full mb-8 flex items-center gap-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent flex-1"></div>
          <h2 className="text-zinc-500 uppercase tracking-[0.2em] text-sm font-semibold">3. System Architecture</h2>
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent flex-1"></div>
        </div>

        <div className="w-full border border-zinc-800/50 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl mb-20 flex flex-col md:flex-row group hover:border-zinc-600 transition-colors">
          <div className="w-full md:w-1/3 bg-zinc-900/50 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-zinc-800/50">
            <h3 className="text-2xl font-bold text-white mb-3">Tauri IPC Bridge</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              The beautiful React/Tailwind frontend communicates securely with the low-level Rust/C wipe binaries using Tauri's Inter-Process Communication (IPC) invoke system.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono bg-black/30 p-3 rounded-lg border border-zinc-800">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div> Frontend (React)
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono bg-black/30 p-3 rounded-lg border border-zinc-800">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div> Backend (Rust/C)
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/3 p-6 bg-[#0c0c0c] font-mono text-sm leading-relaxed relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
            </div>
            <div className="text-zinc-500 mt-4 mb-2">// Tauri Command Invocation</div>
            <div className="text-blue-400">import <span className="text-zinc-300">{`{ invoke }`}</span> from <span className="text-green-400">'@tauri-apps/api/core'</span>;</div>
            <div className="text-zinc-300 mt-4">
              <span className="text-purple-400">const</span> <span className="text-yellow-200">executeWipe</span> = <span className="text-purple-400">async</span> (targetPath) =&gt; {`{`}
            </div>
            <div className="pl-4 text-zinc-300">
              <span className="text-purple-400">try</span> {`{`}
            </div>
            <div className="pl-8 text-zinc-300">
              <span className="text-purple-400">await</span> <span className="text-blue-300">invoke</span>(<span className="text-green-400">'execute_c_wipe'</span>, {`{`} path: targetPath {`}`});
            </div>
            <div className="pl-8 text-zinc-300 mt-1">
              <span className="text-zinc-500">// Engine spawns root process for block device</span>
            </div>
            <div className="pl-4 text-zinc-300">
              {`}`} <span className="text-purple-400">catch</span> (err) {`{`}
            </div>
            <div className="pl-8 text-zinc-300">
              <span className="text-blue-300">console</span>.<span className="text-yellow-200">error</span>(err);
            </div>
            <div className="pl-4 text-zinc-300">
              {`}`}
            </div>
            <div className="text-zinc-300">
              {`}`};
            </div>
          </div>
        </div>

        {/* Particle Text Footer */}
        <div className="w-full mt-10 pt-16 border-t border-zinc-800/50 flex flex-col items-center justify-center pb-20">
          <div className="text-zinc-500 text-xs tracking-[0.3em] uppercase mb-8 font-mono">End of Manual</div>
          <div className="w-full max-w-4xl h-48 flex justify-center items-center">
            <TextParticleAnimation
              text="WIPESURE"
              fontSize={120}
              fontFamily="sans-serif"
              fontWeight={900}
              resolution={4}
              pixelSize={3}
              hoverRadius={60}
              repelForce={15}
              clickRadius={300}
              clickForce={80}
              springForce={0.08}
              friction={0.85}
              theme="dark"
              padding={150}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
