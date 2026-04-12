import { motion } from "framer-motion";

const brands = [
  "Himalayan Roasters", "KTM Apparel", "TechHub Nepal", "Everest Electronics",
  "Pokhara Threads", "Nepal Grocers", "Yak & Yeti Gifts", "SastoDeal",
  "Foodmandu", "Pathao Business", "IME Digital", "Khalti Merchants",
];

export function SocialProofBanner() {
  return (
    <section className="py-10 border-y border-white/[0.06] bg-[#070B14] overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#070B14] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#070B14] to-transparent z-10" />

      <p className="text-center text-xs font-semibold text-gray-600 uppercase tracking-[0.2em] mb-6">
        Trusted by Nepal's fastest-growing brands
      </p>

      <div className="flex gap-12 items-center" style={{ width: "max-content" }}>
        <motion.div
          className="flex gap-12 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
        >
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={i}
              className="font-heading font-bold text-lg text-white/20 whitespace-nowrap hover:text-white/50 transition-colors cursor-default"
            >
              {brand}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
