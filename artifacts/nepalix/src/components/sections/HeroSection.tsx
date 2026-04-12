import { Suspense, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GradientButton } from "../ui-custom/GradientButton";
import { AnimatedCounter } from "../ui-custom/AnimatedCounter";
import { HeroScene } from "../3d/HeroScene";
import { SceneErrorBoundary } from "../3d/SceneErrorBoundary";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

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

const stats = [
  { end: 5000, suffix: "+", label: "Merchants" },
  { end: 2, prefix: "NPR ", suffix: "B+", label: "Processed" },
  { end: 99.9, suffix: "%", label: "Uptime" },
  { end: 50, suffix: "+", label: "Districts" },
];

// Floating particle dot
function Particle({ x, y, size, color, speed }: {
  x: number; y: number; size: number; color: string; speed: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, backgroundColor: color }}
      animate={{ y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: speed, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const particles = [
  { x: 10, y: 20, size: 4, color: "#06B6D4", speed: 3.5 },
  { x: 80, y: 15, size: 6, color: "#8B5CF6", speed: 4.2 },
  { x: 25, y: 70, size: 3, color: "#EC4899", speed: 3 },
  { x: 90, y: 60, size: 5, color: "#06B6D4", speed: 5 },
  { x: 60, y: 85, size: 4, color: "#84CC16", speed: 3.8 },
  { x: 45, y: 10, size: 3, color: "#8B5CF6", speed: 4.5 },
  { x: 5, y: 50, size: 5, color: "#06B6D4", speed: 3.2 },
  { x: 70, y: 40, size: 3, color: "#EC4899", speed: 4.8 },
];

export function HeroSection() {
  const reducedMotion = useReducedMotion();
  const isMobile = useMobile();
  const webGLSupported = useWebGLSupport();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Strong parallax layers — different speeds create depth
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const badgeY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const statsY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  const show3D = !isMobile && !reducedMotion && webGLSupported === true;

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden bg-[#070B14]">
      {/* Layer 1: Far background — slowest parallax */}
      <motion.div className="absolute inset-0 pointer-events-none z-0" style={{ y: bgY }}>
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      {/* Layer 2: Glow orbs — medium parallax */}
      <motion.div className="absolute inset-0 pointer-events-none z-[1]" style={{ y: glowY }}>
        <div className="absolute top-[10%] left-[20%] w-[700px] h-[700px] bg-[#06B6D4]/10 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-[#8B5CF6]/12 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-[#EC4899]/8 rounded-full blur-[100px]" />
      </motion.div>

      {/* Layer 3: Particles — vary in speed */}
      {!reducedMotion && !isMobile && (
        <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>
      )}

      {/* Main grid layout */}
      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-8rem)]">
          {/* LEFT: Text content — foreground, moves fastest */}
          <motion.div style={reducedMotion ? {} : { y: textY, opacity: textOpacity }}>
            {/* Badge */}
            <motion.div
              style={reducedMotion ? {} : { y: badgeY }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[#06B6D4]/30 mb-6 text-sm font-medium text-cyan-400 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                NEPALIX OS 2.0 — Now Live
              </div>
            </motion.div>

            {/* Headline with layered gradient */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.03] font-heading">
                <span className="text-white">The Commerce OS</span>
                <br />
                <span className="text-white">Built For </span>
                <span
                  style={{
                    background: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 40%, #8B5CF6 70%, #EC4899 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Nepal
                </span>
              </h1>
            </motion.div>

            <motion.p
              className="text-xl text-gray-400 mb-8 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Launch your online store, run your POS, track inventory, and accept every Nepal payment — all in one platform. No developers needed.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-start gap-3 mb-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GradientButton href="/book-demo" size="lg">
                Start Free 14-Day Trial
              </GradientButton>
              <GradientButton href="/product" variant="ghost" size="lg">
                See How It Works
              </GradientButton>
            </motion.div>

            {/* Trust row */}
            <motion.div
              className="flex flex-wrap gap-4 mb-10 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {["✅ 30-day money back", "🔒 No credit card needed", "⚡ Setup in 30 min"].map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </motion.div>

            {/* Stats with slow parallax */}
            <motion.div
              style={reducedMotion ? {} : { y: statsY }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-6 border-t border-white/[0.07]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="text-2xl md:text-3xl font-extrabold text-white font-heading">
                    <AnimatedCounter end={s.end} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider font-medium mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: 3D scene / dashboard visual — slowest foreground parallax */}
          <motion.div
            className="relative h-[500px] lg:h-[620px]"
            style={reducedMotion ? {} : { y: sceneY, opacity: sceneOpacity }}
            initial={{ opacity: 0, scale: 0.92, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
          >
            {show3D ? (
              <SceneErrorBoundary fallback={<StaticDashboard />}>
                <Suspense fallback={<StaticDashboard />}>
                  <HeroScene className="rounded-2xl" />
                </Suspense>
              </SceneErrorBoundary>
            ) : (
              <StaticDashboard />
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      {!reducedMotion && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent"
            animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#070B14] to-transparent pointer-events-none z-20" />
    </section>
  );
}

function StaticDashboard() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Main card */}
        <motion.div
          className="rounded-2xl border border-[#06B6D4]/20 bg-[#0F172A]/90 backdrop-blur-xl p-5 shadow-[0_0_80px_rgba(6,182,212,0.12)]"
          initial={{ y: 0 }}
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Browser bar */}
          <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-white/[0.06]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            <div className="flex-1 mx-3 h-5 rounded-md bg-white/5 flex items-center px-2">
              <span className="text-gray-600 text-xs">nepalix.com/dashboard</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Today's Revenue</div>
              <div
                className="text-3xl font-extrabold font-heading"
                style={{
                  background: "linear-gradient(135deg, #06B6D4, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                NPR 1,24,350
              </div>
              <div className="text-green-400 text-xs mt-0.5 flex items-center gap-1">
                <span>▲</span> +23.4% vs yesterday
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 mt-1 animate-pulse" />
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-1.5 h-14 mb-4">
            {[38, 55, 42, 72, 60, 90, 68].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background:
                    i === 5
                      ? "linear-gradient(180deg, #06B6D4, #3B82F6)"
                      : `rgba(6,182,212,${0.08 + i * 0.03})`,
                }}
              />
            ))}
          </div>

          {/* Payment methods */}
          <div className="flex gap-1.5 flex-wrap">
            {["eSewa", "Khalti", "FonePay", "Cash"].map((m) => (
              <span key={m} className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-xs border border-white/[0.06]">
                {m}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Floating: Orders card */}
        <motion.div
          className="absolute -top-6 -right-6 rounded-xl border border-white/10 bg-[#111827]/90 backdrop-blur-xl p-3 shadow-xl"
          initial={{ y: 0 }}
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="text-xs text-gray-500 mb-0.5">Orders Today</div>
          <div className="text-xl font-bold text-white font-heading">284</div>
          <div className="text-green-400 text-xs">+12 this hour</div>
        </motion.div>

        {/* Floating: Merchants card */}
        <motion.div
          className="absolute -bottom-4 -left-6 rounded-xl border border-white/10 bg-[#111827]/90 backdrop-blur-xl p-3 shadow-xl"
          initial={{ y: 0 }}
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="text-xs text-gray-500 mb-0.5">Active Merchants</div>
          <div className="text-xl font-bold text-white font-heading">5,247</div>
          <div className="text-cyan-400 text-xs">🇳🇵 Across Nepal</div>
        </motion.div>

        {/* Floating: Live sale notification */}
        <motion.div
          className="absolute top-1/3 -left-10 rounded-xl border border-[#8B5CF6]/30 bg-[#111827]/90 backdrop-blur-xl px-3 py-2 shadow-xl"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: [0, 1, 1, 0], x: [-10, 0, 0, -10] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeOut" }}
        >
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            New order from Pokhara
          </div>
          <div className="text-white text-xs font-medium">Rs 3,450 via Khalti</div>
        </motion.div>
      </div>
    </div>
  );
}
