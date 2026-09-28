"use client";

import { useState } from "react";
import { DownloadSimple, Copy, Check, TerminalWindow, HardDrive } from "@phosphor-icons/react";

export default function DownloadSection() {
  const [checksumCopied, setChecksumCopied] = useState(false);
  const sha256Checksum = "a7b38d94e102f9c87d4a20b1297e68bc5d290fb4310d54a2cb58ab42fbbf1c75";

  const copyChecksum = () => {
    navigator.clipboard.writeText(sha256Checksum);
    setChecksumCopied(true);
    setTimeout(() => setChecksumCopied(false), 2000);
  };

  return (
    <section id="download" className="py-24 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Left-aligned editorial header */}
        <div className="space-y-3 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-neutral-800 bg-neutral-900 font-mono text-[11px] text-neutral-400">
            <span>DISTRIBUTION ARTIFACT</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-50">
            Download WipeSure Products
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-[65ch]">
            Deploy our Air-Gapped Linux ISO for absolute hardware-level drive sanitization, or install the Desktop Client for surgical file deletion and metadata obfuscation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Panel 1: Bootable ISO */}
          <div className="panel-border p-8 rounded-md bg-neutral-900/50 flex flex-col">
            <div className="flex flex-col gap-6 pb-6 border-b border-neutral-800">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <HardDrive size={20} className="text-purple-400" />
                  <h3 className="font-display text-xl font-semibold text-neutral-100">
                    WipeSure Bootable ISO
                  </h3>
                  <span className="font-mono text-[10px] text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-md bg-neutral-950">
                    v2.1.0-LIVE
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  Full Drive Sanitization • Bypass OEM BIOS • O_DIRECT
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/download/WipeSure-Universal-Boot.iso"
                  download
                  className="btn-primary gap-2 w-full sm:w-auto"
                >
                  <DownloadSimple size={16} weight="bold" />
                  <span>Download ISO (1.2 GB)</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 border-b border-neutral-800 font-mono text-xs flex-1">
              <div>
                <div className="text-[10px] uppercase text-neutral-500 mb-1">TARGET ARCH</div>
                <div className="text-neutral-200 font-medium">x86_64 / AMD64</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-neutral-500 mb-1">BOOT MODE</div>
                <div className="text-neutral-200 font-medium">UEFI & Legacy</div>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-neutral-500 uppercase tracking-wider">SHA-256 HASH VERIFICATION</span>
                <button
                  onClick={copyChecksum}
                  className="text-neutral-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {checksumCopied ? (
                    <>
                      <Check size={13} weight="bold" className="text-white" />
                      <span className="text-white">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 rounded-md bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 select-all overflow-x-auto truncate">
                {sha256Checksum}
              </div>
            </div>
          </div>

          {/* Panel 2: Desktop App */}
          <div className="panel-border p-8 rounded-md bg-neutral-900/50 flex flex-col">
            <div className="flex flex-col gap-6 pb-6 border-b border-neutral-800">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <TerminalWindow size={20} className="text-purple-400" />
                  <h3 className="font-display text-xl font-semibold text-neutral-100">
                    WipeSure Desktop App
                  </h3>
                  <span className="font-mono text-[10px] text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-md bg-neutral-950">
                    v2.1.0-GUI
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  Surgical File Wipe • Forensic Data Recovery • Audit Logging
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href="/download/WipeSure-Setup.exe"
                  download
                  className="btn-primary gap-2 w-full sm:w-auto bg-neutral-100 hover:bg-white text-black"
                >
                  <DownloadSimple size={16} weight="bold" />
                  <span>Windows (.exe)</span>
                </a>
                <a
                  href="/download/WipeSure-Mac.dmg"
                  download
                  className="btn-secondary gap-2 w-full sm:w-auto"
                >
                  <DownloadSimple size={16} weight="bold" />
                  <span>macOS (.dmg)</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 border-b border-neutral-800 font-mono text-xs flex-1">
              <div>
                <div className="text-[10px] uppercase text-neutral-500 mb-1">PLATFORMS</div>
                <div className="text-neutral-200 font-medium">Windows 10/11, macOS 13+</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-neutral-500 mb-1">FRAMEWORK</div>
                <div className="text-neutral-200 font-medium">Tauri + Rust Backend</div>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-neutral-500 uppercase tracking-wider">ENTERPRISE COMPATIBILITY</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono text-neutral-400 mt-2">
                <span className="px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-300">Active Directory</span>
                <span className="px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-300">MDM Deployable</span>
                <span className="px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-300">SOC2 Logs</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
