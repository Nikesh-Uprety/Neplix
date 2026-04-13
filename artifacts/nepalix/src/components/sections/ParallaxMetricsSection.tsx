import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GradientButton } from "../ui-custom/GradientButton";
import { AnimatedCounter } from "../ui-custom/AnimatedCounter";

const metrics = [
  { end: 5000, suffix: "+", label: "Active Merchants", color: "#06B6D4" },
  { end: 2, prefix: "NPR ", suffix: "B+", label: "GMV Processed", color: "#8B5CF6" },
  { end: 99.9, suffix: "%", label: "Uptime SLA", color: "#EC4899" },
  { end: 14, suffix: " days", label: "Free Trial", color: "#84CC16" },
  { end: 30, suffix: " min", label: "Average Setup Time", color: "#F59E0B" },
  { end: 77, suffix: " districts", label: "Nepal Coverage", color: "#06B6D4" },
];

export function ParallaxMetricsSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const textY = useTransform(scrollYProgress, [0, 1], ["40px", "-40px"]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden bg-[#070B14]">
      {/* Parallax radial gradient bg */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ scale: bgScale }}
      >
        <div className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div style={{ y: textY }} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white font-heading mb-4">
            Numbers that speak for themselves
          </h2>
          <p className="text-xl text-gray-400">Built by Nepali entrepreneurs, for Nepali businesses.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-20">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-extrabold font-heading mb-1" style={{ color: m.color }}>
                <AnimatedCounter end={m.end} prefix={m.prefix} suffix={m.suffix} />
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-[#84CC16]/30 bg-[#84CC16]/5 p-8 text-center max-w-3xl mx-auto mb-10"
        >
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#84CC16] mb-3">Guarantee</div>
          <h3 className="text-2xl font-bold text-white font-heading mb-2">30-Day Money Back Guarantee</h3>
          <p className="text-gray-400 mb-6">
            If NEPALIX doesn't make your life easier in 30 days, we'll refund every rupee.
            No questions asked. No paperwork. No hassle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <GradientButton href="/book-demo" size="lg">
              Start Free 14-Day Trial
            </GradientButton>
            <GradientButton href="/pricing" variant="ghost" size="lg">
              View Pricing
            </GradientButton>
          </div>
        </motion.div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          {[
            "Bank-grade SSL security",
            "No tech skills needed",
            "Setup in under 30 minutes",
            "Built & supported in Nepal",
          ].map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {badge}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
