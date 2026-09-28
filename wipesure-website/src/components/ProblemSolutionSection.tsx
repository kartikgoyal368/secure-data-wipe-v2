"use client";

import { WarningCircle, CheckCircle } from "@phosphor-icons/react";

export default function ProblemSolutionSection() {
  return (
    <section className="py-24 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header: Left-aligned, Real Type Scale */}
        <div className="mb-12 text-left">
          <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider mb-2">
            Sanitization Mechanics
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-100 mb-3">
            Why Standard OS Formatting Fails Security Audits
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-[65ch]">
            Most commercial operating systems implement file deletion as a pointer deallocation rather than physical bit destruction. This leaves raw data vulnerable to automated forensic carving.
          </p>
        </div>

        {/* Side-by-Side Comparison: Flat 1px border, rounded-md, no drop shadows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Logical Deletion Panel */}
          <div className="p-6 sm:p-7 rounded-md border border-neutral-800 bg-neutral-900/40 space-y-5 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <WarningCircle size={18} className="text-neutral-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-300">
                  Standard OS Format
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700">
                Logical Only
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold text-neutral-200 mb-2">
                Filesystem Table Reset (Quick Format)
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-[65ch]">
                When an operator executes a disk format in Windows or macOS, the kernel modifies the file allocation table or partition directory. Physical NAND charge states and magnetic polarities remain unchanged.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-neutral-800 bg-neutral-950 font-mono text-xs space-y-1">
              <div className="text-neutral-500 text-[11px]">VULNERABILITY:</div>
              <p className="text-neutral-300 text-[11px] leading-relaxed max-w-[65ch]">
                Automated open-source recovery utilities (e.g. PhotoRec, TestDisk) bypass filesystem pointers and reconstruct documents directly from raw unmapped sectors in minutes.
              </p>
            </div>

            <div className="pt-2 font-mono text-xs text-neutral-500 border-t border-neutral-800">
              AUDIT RESULT: <span className="text-neutral-300 font-semibold">95%+ Data Easily Carved</span>
            </div>
          </div>

          {/* Physical Sanitize Panel */}
          <div className="p-6 sm:p-7 rounded-md border border-neutral-700 bg-neutral-900/80 space-y-5 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} weight="bold" className="text-white" />
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-200">
                  WipeSure Purge Protocol
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-white font-semibold">
                NIST Purge Compliant
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold text-neutral-100 mb-2">
                Hardware Controller Voltage Discharge &amp; Overwrite
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-[65ch]">
                WipeSure bypasses host operating system abstractions—whether via its air-gapped bootable ISO for full drives, or its low-level desktop application for targeted file deletion. It forces direct physical block overwrites, discharging all addressable memory cells rather than unlinking pointers.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-neutral-800 bg-neutral-950 font-mono text-xs space-y-1">
              <div className="text-neutral-400 text-[11px]">ASSURANCE:</div>
              <p className="text-neutral-200 text-[11px] leading-relaxed max-w-[65ch]">
                Concealed areas (HPA/DCO) are unhidden and purged. Direct I/O validation samples physical blocks to verify zero residual magnetic or electrical charge remains.
              </p>
            </div>

            <div className="pt-2 font-mono text-xs text-neutral-400 border-t border-neutral-800">
              AUDIT RESULT: <span className="text-neutral-100 font-semibold">0.00% Residual (Non-Recoverable)</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
