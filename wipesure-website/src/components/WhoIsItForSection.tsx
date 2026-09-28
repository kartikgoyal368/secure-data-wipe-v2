"use client";

import { Laptop, Buildings, Recycle, ShieldCheck } from "@phosphor-icons/react";

export default function WhoIsItForSection() {
  const audiences = [
    {
      title: "Individual Device Owners",
      tagline: "Secondary Market & Asset Resale",
      desc: "Liquidating a personal workstation or trading in hardware? WipeSure guarantees that private keys, credentials, financial records, and browser sessions cannot be recovered by subsequent owners.",
      icon: Laptop,
    },
    {
      title: "IT Administrators & Enterprises",
      tagline: "Workstation & Server Lifecycle",
      desc: "Decommissioning departmental fleets without paying recurring per-disk proprietary licensing fees. WipeSure delivers audited compliance records for corporate data retention policies.",
      icon: Buildings,
    },
    {
      title: "Hardware Refurbishers & ITADs",
      tagline: "Circular Economy Sanitization",
      desc: "Eliminate the need to physically shred working SSDs and hard drives. WipeSure restores media to factory condition for certified remarketing while meeting environmental mandates.",
      icon: Recycle,
    },
    {
      title: "Regulated Infrastructure Teams",
      tagline: "Air-Gapped & Offline Facilities",
      desc: "Operates completely offline with zero telemetry or outbound network requirements. Aligns directly with NIST SP 800-88 Rev. 1 Purge directives and DoD 5220.22-M sanitization specifications.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="who-is-it-for" className="py-24 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Left-aligned editorial header */}
        <div className="space-y-3 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-neutral-800 bg-neutral-900 font-mono text-[11px] text-neutral-400">
            <span>DEPLOYMENT SCOPE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-50">
            Engineered for High-Assurance Erasure
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-[65ch]">
            From purging a single sensitive file to enterprise data center decommissioning, WipeSure delivers forensically validated sanitization without proprietary lock-in.
          </p>
        </div>

        {/* Audience Grid: 1px flat border, rounded-md, no shadows, no hover scale */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {audiences.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="panel-border p-6 rounded-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300">
                      <Icon size={18} weight="regular" />
                    </div>
                    <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                      {item.tagline}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-neutral-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-[60ch]">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between font-mono text-[11px] text-neutral-500">
                  <span>ERASURE PROFILE</span>
                  <span className="text-neutral-300 font-medium">NIST 800-88 PURGE</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
