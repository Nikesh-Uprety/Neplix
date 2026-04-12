import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { HeroSection } from "@/components/sections/HeroSection";
import { OpportunitySection } from "@/components/sections/OpportunitySection";
import { PlatformShowcase } from "@/components/sections/PlatformShowcase";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CtaStripSection } from "@/components/sections/CtaStripSection";
import { SocialProofBanner } from "@/components/sections/SocialProofBanner";
import { ParallaxMetricsSection } from "@/components/sections/ParallaxMetricsSection";

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <SocialProofBanner />
      <OpportunitySection />
      <PlatformShowcase />
      <ParallaxMetricsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CtaStripSection />
    </div>
  );
}
