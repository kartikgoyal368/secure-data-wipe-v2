import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyWeBuiltItSection from "@/components/WhyWeBuiltItSection";
import WhyWipeSureBanner from "@/components/WhyWipeSureBanner";
import ProblemSolutionSection from "@/components/ProblemSolutionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import NistComplianceBox from "@/components/NistComplianceBox";
import WipingSimulator from "@/components/WipingSimulator";
import WhoIsItForSection from "@/components/WhoIsItForSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import FaqSection from "@/components/FaqSection";
import DownloadSection from "@/components/DownloadSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black relative">
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Hero Section with Contained Clean Banner */}
      <Hero />

      {/* 2.5 "Why We Built It" Section with Globe in easy language */}
      <WhyWeBuiltItSection />

      {/* 3. High-Contrast White Sub-Hero Banner ("Why WipeSure") */}
      <WhyWipeSureBanner />

      {/* 4. Plain English Problem vs Solution: Why Simple Format Fails */}
      <ProblemSolutionSection />

      {/* 5. 3 Easy Steps to Clean Any Drive */}
      <HowItWorksSection />

      {/* 6. Prominent NIST SP 800-88 & Regulatory Standards Compliance Box */}
      <NistComplianceBox />

      {/* 7. Interactive Wiping Simulator (Live 60-Second Demo) */}
      <WipingSimulator />

      {/* 8. Who Needs WipeSure (Students, Businesses, Recyclers) */}
      <WhoIsItForSection />

      {/* 9. Deep Technical Architecture for Engineers (C Core, RTCWake, O_DIRECT) */}
      <ArchitectureSection />

      {/* 10. Simple Frequently Asked Questions */}
      <FaqSection />

      {/* 11. 1-Click Free Bootable ISO Download */}
      <DownloadSection />

      {/* 12. Enterprise Footer */}
      <Footer />
    </main>
  );
}
