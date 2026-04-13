import { motion } from "framer-motion";
import { GradientButton } from "../ui-custom/GradientButton";
import { Shield, Zap, MessageCircle } from "lucide-react";

export function CtaStripSection() {
  return (
    <section className="relative py-28 overflow-hidden bg-[#070B14]">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(6,182,212,0.12) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300 mb-4">Built in Nepal</div>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white font-heading mb-5 leading-[1.05]">
            Nepal's commerce future{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #06B6D4, #8B5CF6, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              starts here
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join 5,000+ Nepali merchants already growing with NEPALIX. Your store could be live by tonight.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <GradientButton href="/book-demo" size="lg">
              Start Free 14-Day Trial
            </GradientButton>
            <a
              href="https://wa.me/9779801234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-green-400" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-4 h-4 text-green-400" />
              30-Day Money Back Guarantee
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Zap className="w-4 h-4 text-yellow-400" />
              No credit card required
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              Bank-grade security
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
