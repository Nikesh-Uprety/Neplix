import { Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GradientButton } from "../ui-custom/GradientButton";
import { AnimatedCounter } from "../ui-custom/AnimatedCounter";
import { HeroScene } from "../3d/HeroScene";
import { SceneErrorBoundary } from "../3d/SceneErrorBoundary";
import { ArrowRight, ExternalLink } from "lucide-react";

function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setSupported(!!ctx);
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

const stats = [
  { end: 5000, suffix: "+",   label: "Merchants",  prefix: "" },
  { end: 2,    suffix: "B+",  label: "Processed",  prefix: "NPR " },
  { end: 99.9, suffix: "%",   label: "Uptime",     prefix: "" },
  { end: 50,   suffix: "+",   label: "Districts",  prefix: "" },
];

function StaticGlobeFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#070B14]">
      {/* Fallback styling omitted for brevity */}
    </div>
  );
}

export function HeroSection() {
  const webGLSupported = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const show3D = !reducedMotion && webGLSupported === true;

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        backgroundColor: "#070B14",
      }}
    >
      {/* ── Full-screen 3D canvas / fallback ── */}
      <div className="absolute inset-0 z-[1] opacity-70">
        {show3D ? (
          <SceneErrorBoundary fallback={<StaticGlobeFallback />}>
            <Suspense fallback={<StaticGlobeFallback />}>
              <HeroScene className="w-full h-full" />
            </Suspense>
          </SceneErrorBoundary>
        ) : (
          <StaticGlobeFallback />
        )}
      </div>

      {/* ── Hero content centered on top ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-32 pb-16 w-full max-w-5xl mx-auto mt-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 text-xs font-semibold uppercase tracking-[0.12em]"
          style={{
            background: "rgba(6,182,212,0.07)",
            border: "1px solid rgba(6,182,212,0.22)",
            color: "#67e8f9",
          }}
        >
          <motion.span
            className="w-[7px] h-[7px] rounded-full bg-[#06B6D4]"
            animate={{ opacity: [1, 0.4, 1], boxShadow: ["0 0 6px #06B6D4", "0 0 0px #06B6D4", "0 0 6px #06B6D4"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Nepal's Commerce Operating System
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading font-extrabold text-white mb-6 leading-[1.04]"
          style={{ fontSize: "clamp(3.2rem, 7vw, 5.8rem)", letterSpacing: "-0.02em" }}
        >
          Run Your Entire Fashion Retail
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #06B6D4, #3B82F6, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            From One System
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl leading-[1.72] mb-10 max-w-2xl"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Powering next-generation retail experiences. Unify your online store, POS, inventory, orders, and analytics in a single infrastructure built for Nepal.
        </motion.p>

        {/* Live Case Study Callout */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, delay: 0.3 }}
           className="mb-12 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col md:flex-row items-center gap-4 text-left max-w-3xl"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
             <span className="font-heading font-bold text-white">RA</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm md:text-base">Live Case Study: Rare Atelier</p>
            <p className="text-gray-400 text-xs md:text-sm">Currently running their entire fashion retail operations on NEPALIX.</p>
          </div>
          <a 
            href="https://rare-np-production.up.railway.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-sm text-white font-medium border border-white/10 whitespace-nowrap"
          >
            Visit Live Store <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-4 flex-wrap justify-center mb-20"
        >
          <GradientButton href="/book-demo" size="lg">
            Start Selling Online <ArrowRight className="w-4 h-4 ml-2" />
          </GradientButton>
          <GradientButton href="/product" variant="ghost" size="lg">
            Explore Platform Capabilities
          </GradientButton>
        </motion.div>
      </div>

      {/* Bottom gradient blend into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#070B14] to-transparent pointer-events-none z-20" />
    </section>
  );
}
