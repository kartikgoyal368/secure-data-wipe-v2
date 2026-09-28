"use client";

import { TerminalWindow, ArrowRight, DownloadSimple, Check } from "@phosphor-icons/react";
import AeroShards from "@/components/lightswind/AeroShards";
import { TextParticleAnimation } from "@/components/lightswind/text-particle-animation";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 pt-24 pb-32">
      {/* Interactive Aero Shards Canvas (Restricted strictly to Hero Background) */}
      <div className="absolute inset-0 z-0">
        <AeroShards
          backgroundColor="#0a0a0a" /* Tailwind neutral-950 */
          shardColor="#ffffff" /* Monochrome theme requested earlier */
          accentColor="#555555"
          placement="full"
          flow="stream"
          material="pearl"
          detail="balanced"
          effect="none"
          scale={1}
          spread={1}
          depth={1}
          speed={1}
          spin={1}
          interaction="repel"
          density={1.5}
          shardSize={1.1}
          stretch={1}
          turbulence={1}
          glow={1}
          edgeSoftness={2}
          bloom={0.5}
          grain={0.05}
          chromaticAberration={0.0075}
          transitionDuration={1}
          interactionRadius={1.5}
          interactionStrength={0.5}
          rippleIntensity={1}
          holdToGather
          paused={false}
        />
      </div>
      <div className="lg:hidden absolute inset-0 bg-neutral-900/50" />

      {/* Engineering Precision Grid Dots Layer */}
      <div className="absolute inset-0 bg-grid-dots pointer-events-none opacity-50" />

      {/* Hero Content Container */}
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Left-aligned, disciplined editorial hierarchy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* System Identifier Tag */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-neutral-800 bg-neutral-900/90 backdrop-blur-sm font-mono text-[11px] text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span>NIST SP 800-88 REV. 1 PURGE COMPLIANT</span>
            </div>

            {/* Display Headline: Real Type Scale, Left-Aligned, Space Grotesk */}
            <div className="w-full h-[120px] sm:h-[150px] flex items-start justify-start overflow-visible -ml-4">
              <TextParticleAnimation
                text="WIPESURE"
                fontSize={120}
                fontFamily="Space Grotesk, sans-serif"
                fontWeight={900}
                resolution={4}
                pixelSize={3}
                hoverRadius={70}
                repelForce={10}
                clickRadius={250}
                clickForce={60}
                springForce={0.08}
                friction={0.85}
                theme="dark"
                padding={80}
              />
            </div>

            {/* Disciplined Body Copy (under 68 characters per line) */}
            <p className="text-neutral-300 text-base leading-relaxed max-w-[65ch]">
              WipeSure provides a bootable, air-gapped OS engineered in low-level C for full-drive cryptographic purges, alongside a secure desktop application for surgical file deletion and advanced data recovery. Guaranteed zero-residual state and complete forensic auditing.
            </p>

            {/* Action Group: Functional, Flat, Pure White Primary Accent */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#simulator"
                className="btn-primary gap-2"
              >
                <span>Run Interactive Simulator</span>
                <ArrowRight size={15} weight="bold" />
              </a>

              <a
                href="#download"
                className="btn-secondary gap-2"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>Download Universal ISO</span>
              </a>
            </div>

            {/* Technical Verification Footprint */}
            <div className="pt-6 border-t border-neutral-900/80 grid grid-cols-3 gap-6 font-mono text-xs">
              <div>
                <div className="text-neutral-500 text-[11px] uppercase tracking-wider mb-1">Standard</div>
                <div className="text-neutral-200 font-medium">NIST Purge &amp; DoD</div>
              </div>
              <div>
                <div className="text-neutral-500 text-[11px] uppercase tracking-wider mb-1">Verification</div>
                <div className="text-neutral-200 font-medium">O_DIRECT Direct Bus</div>
              </div>
              <div>
                <div className="text-neutral-500 text-[11px] uppercase tracking-wider mb-1">Bypass Engine</div>
                <div className="text-neutral-200 font-medium">ACPI RTCWake S3</div>
              </div>
            </div>

          </div>

          {/* Right Column: Precise Technical Spec Panel */}
          <div className="lg:col-span-5">
            <div className="panel-border bg-neutral-900/90 backdrop-blur-md font-mono text-xs">
              
              {/* Header */}
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between text-neutral-400">
                <div className="flex items-center gap-2">
                  <TerminalWindow size={16} className="text-neutral-400" />
                  <span className="text-[11px] uppercase tracking-wider text-neutral-300">wipesure-daemon v1.0.4</span>
                </div>
                <span className="text-[10px] text-white bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-700">
                  KERNEL_DIRECT
                </span>
              </div>

              {/* Console Body */}
              <div className="p-4 space-y-2.5 text-[11px] leading-relaxed text-neutral-300 bg-neutral-950/80">
                <div className="text-neutral-500"># System Hardware Topology Scan</div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">Target Node:</span>
                  <span className="text-neutral-200">/dev/nvme0n1</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">Controller Bus:</span>
                  <span className="text-neutral-200">PCIe 4.0 x4 (NVMe 1.4)</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">Physical LBAs:</span>
                  <span className="text-neutral-200">3,907,029,168 (2.0 TB)</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">BIOS Lock Status:</span>
                  <span className="text-neutral-200">ATA_FREEZE_LOCKED</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">Bypass Protocol:</span>
                  <span className="text-white">rtcwake -m mem -s 3 (ACPI S3)</span>
                </div>
                <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                  <span className="text-neutral-400">Sanitize Opcode:</span>
                  <span className="text-neutral-200">NVMe Format NVM (0x80)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-400">Residual Bit Audit:</span>
                  <span className="text-neutral-100 font-semibold flex items-center gap-1">
                    <Check size={13} weight="bold" className="text-white" />
                    <span>0.00% (PASSED)</span>
                  </span>
                </div>
              </div>

              {/* Status Footer */}
              <div className="px-4 py-2.5 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Direct I/O: <strong className="text-neutral-200">O_DIRECT Engaged</strong></span>
                <span className="text-neutral-500">Air-Gapped: True</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
