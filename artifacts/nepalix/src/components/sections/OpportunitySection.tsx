import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TrendingUp, ShoppingCart, Smartphone, MapPin } from "lucide-react";

const stats = [
  {
    value: "NPR 180B+",
    label: "Nepal's digital commerce market",
    sub: "Growing 40% year over year",
    icon: TrendingUp,
    color: "#06B6D4",
  },
  {
    value: "32M+",
    label: "Mobile internet users in Nepal",
    sub: "80% browse and buy on mobile",
    icon: Smartphone,
    color: "#8B5CF6",
  },
  {
    value: "150K+",
    label: "Active online businesses",
    sub: "Only 12% have a proper platform",
    icon: ShoppingCart,
    color: "#EC4899",
  },
  {
    value: "77",
    label: "Districts across Nepal",
    sub: "All reachable by digital commerce",
    icon: MapPin,
    color: "#84CC16",
  },
];

const milestones = [
  { year: "2020", event: "Nepal's e-commerce was Rs 15B/year" },
  { year: "2022", event: "Post-COVID boom: 3x growth to Rs 45B" },
  { year: "2024", event: "Rs 120B+ — fastest growing sector in South Asia" },
  { year: "2026", event: "Projected Rs 300B — the opportunity window is NOW" },
];

export function OpportunitySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Parallax background layer */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#06B6D4]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#8B5CF6]/8 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div style={{ y: textY, opacity }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#84CC16]/30 mb-6 text-sm font-medium text-[#84CC16]">
            🇳🇵 The Nepal Opportunity
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 font-heading leading-[1.05]">
            The biggest commerce
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #06B6D4, #8B5CF6, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              wave Nepal has ever seen
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Nepal's digital commerce is exploding. The businesses that win the next decade are the ones
            who build their infrastructure now — not later.
          </p>
        </motion.div>

        {/* Stats grid with staggered parallax */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-white/10 bg-[#0F172A]/60 p-6 relative overflow-hidden group cursor-default"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${stat.color}15, transparent 70%)`,
                  }}
                />
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className="text-3xl font-extrabold text-white font-heading mb-1" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-gray-200 font-medium text-sm mb-1">{stat.label}</div>
                <div className="text-gray-500 text-xs">{stat.sub}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white font-heading text-center mb-10">
            The growth curve keeps going — are you on it?
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#06B6D4]/50 via-[#8B5CF6]/50 to-[#EC4899]/50" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`flex items-center gap-8 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                    <div
                      className="inline-block rounded-xl border border-white/10 bg-[#0F172A]/80 px-5 py-3"
                    >
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{m.year}</span>
                      <p className="text-white text-sm font-medium mt-0.5">{m.event}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-[#06B6D4] bg-[#070B14] z-10" />
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center p-6 rounded-2xl border border-[#06B6D4]/30 bg-[#06B6D4]/5"
          >
            <p className="text-lg font-semibold text-white">
              NEPALIX gives you the infrastructure to capture this wave.{" "}
              <span className="text-cyan-400">Start today — before your competitors do.</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
