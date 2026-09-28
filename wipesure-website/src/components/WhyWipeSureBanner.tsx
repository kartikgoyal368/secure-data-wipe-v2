"use client";

import { ShieldCheck, Cpu, Certificate } from "@phosphor-icons/react";

export default function WhyWipeSureBanner() {
  const pillars = [
    {
      num: "01",
      icon: ShieldCheck,
      title: "Mathematically Non-Recoverable",
      desc: "Standard file deletion and OS format commands only unlink index headers. WipeSure issues hardware-level commands directly to drive microcontrollers, resetting each physical sector or flash cell to guarantee zero residual data.",
    },
    {
      num: "02",
      icon: Cpu,
      title: "Automatic BIOS Lock Bypass",
      desc: "Enterprise motherboards from Dell, HP, and Lenovo lock SATA and NVMe ports with ATA Freeze-Locks upon boot. WipeSure executes an automated ACPI S3 sleep cycle to release the hardware locks without system reboot.",
    },
    {
      num: "03",
      icon: Certificate,
      title: "Cryptographic Certificate of Erasure",
      desc: "Upon completion, the engine runs direct I/O verification across pseudo-random LBA samples and compiles a signed audit trail. The record is cryptographically stamped for NIST SP 800-88 compliance reporting.",
    },
  ];

  return (
    <section className="py-24 bg-neutral-950 border-t border-neutral-900">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Left-aligned editorial header */}
        <div className="space-y-3 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-neutral-800 bg-neutral-900 font-mono text-[11px] text-neutral-400">
            <span>ENGINEERING FOUNDATIONS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-50">
            Deterministic Sanitization Architecture
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-[65ch]">
            Every year, decommissioned storage drives and logical file deletions expose confidential records. WipeSure provides both an audited Linux ISO and a native desktop OS application to guarantee non-recoverability in any scenario.
          </p>
        </div>

        {/* 3 Pillars: Flat, 1px border, rounded-md, no shadows, no hover transitions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="panel-border p-6 rounded-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-xs font-semibold text-white">
                      {p.num}
                    </span>
                    <Icon size={20} weight="regular" className="text-neutral-400" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-neutral-100 mb-2.5">
                    {p.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-[55ch]">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 font-mono text-[11px] text-neutral-500">
                  <span>AUDIT STANDARD: ACTIVE</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
