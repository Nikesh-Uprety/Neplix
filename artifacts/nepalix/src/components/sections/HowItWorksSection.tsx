import { motion } from "framer-motion";
import { Store, CreditCard, TrendingUp, ArrowRight } from "lucide-react";
import { GradientButton } from "../ui-custom/GradientButton";

const steps = [
  {
    number: "01",
    icon: Store,
    title: "Pick your plan & set up in 30 minutes",
    description:
      "Choose Starter, Growth, Pro, or Elite. Our guided setup walks you through adding products, setting up payments, and connecting your domain — no developers needed.",
    color: "#06B6D4",
    detail: "Avg. setup time: 28 minutes",
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Start selling — online, in-store, or both",
    description:
      "Your store is live. Accept eSewa, Khalti, FonePay, cash and every other payment method Nepali customers prefer. POS works even without internet.",
    color: "#8B5CF6",
    detail: "First sale usually within 24 hours",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Grow with data, automation & support",
    description:
      "Use built-in analytics to see what's selling, automate abandoned cart recovery, and get hands-on support from our Kathmandu team whenever you need it.",
    color: "#EC4899",
    detail: "Average merchant sees 34% revenue growth in year 1",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-[#070B14]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8B5CF6]/5 rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm font-medium text-gray-400">
              How It Works
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white font-heading mb-5 leading-[1.05]">
              From idea to first sale
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #06B6D4, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                in under an hour
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-xl mx-auto">
              We've built NEPALIX so that any Nepali business owner — not just tech people — can go live fast.
            </p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="grid md:grid-cols-[auto_1fr] gap-6 items-start"
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center border"
                    style={{ backgroundColor: `${step.color}15`, borderColor: `${step.color}30` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0F172A]/60 p-6 mb-2">
                  <div
                    className="text-xs font-bold mb-2 tracking-widest uppercase"
                    style={{ color: step.color }}
                  >
                    Step {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-white font-heading mb-2">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">{step.description}</p>
                  <div className="flex items-center gap-2 text-xs font-medium" style={{ color: step.color }}>
                    <ArrowRight className="w-3.5 h-3.5" />
                    {step.detail}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-14"
        >
          <GradientButton href="/book-demo" size="lg">
            Start Your Free Trial — No Credit Card
          </GradientButton>
        </motion.div>
      </div>
    </section>
  );
}
