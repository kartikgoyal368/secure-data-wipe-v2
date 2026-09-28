"use client";

import Globe from "@/components/lightswind/Globe";
import { ShieldCheck, Info } from "@phosphor-icons/react";

export default function WhyWeBuiltItSection() {
  return (
    <section className="py-24 bg-neutral-950 border-b border-neutral-900 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Side: The Globe */}
          <div className="relative w-full h-[500px] lg:h-[600px] max-w-[700px] mx-auto lg:mx-0 flex items-center justify-center opacity-80 mix-blend-screen">
            <Globe
              scale={10}
              speed={2}
              stopOnHover={true}
              dots={{ color: "#ffffff", size: 3, density: 10, allDots: false }}
              outlineColor="#ffffff"
            />
          </div>

          {/* Right Side: Easy Language Explanation Box */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-neutral-800 bg-neutral-900 font-mono text-[11px] text-neutral-400">
              <Info size={14} weight="bold" />
              <span>THE GLOBAL CRISIS</span>
            </div>
            
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-50">
              The True Cost of Data Security
            </h2>
            
            <div className="p-6 sm:p-8 rounded-lg border border-neutral-800 bg-neutral-900/50 shadow-2xl space-y-4">
              <p className="text-neutral-300 text-base leading-relaxed">
                Every month, millions of perfectly functional SSDs, hard drives, and laptops are physically shredded and dumped into landfills across the globe. Why? Because organizations are terrified of data leaks and don't trust standard OS formatting to permanently erase their files.
              </p>
              
              <p className="text-neutral-300 text-base leading-relaxed">
                This paranoia generates thousands of tons of toxic electronic waste (e-waste) annually. We are literally polluting the Earth by destroying working electronics just because we fear someone might use a recovery tool to steal our leftover data.
              </p>

              <div className="pt-4 mt-4 border-t border-neutral-800 flex items-start gap-4">
                <div className="p-2 bg-neutral-800 rounded-md">
                  <ShieldCheck size={24} weight="fill" className="text-[#22c55e]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Our Solution: Circular Economy</h4>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    WipeSure mathematically guarantees your data is permanently scrambled and unrecoverable by discharging the physical cells. This allows you to safely resell, donate, or recycle your devices with total peace of mind—eliminating the need to physically shred working technology.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </section>
  );
}
