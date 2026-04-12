import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShoppingBag, Monitor, Package, CreditCard, BarChart3, Zap
} from "lucide-react";

const modules = [
  {
    id: "store",
    label: "Online Store",
    icon: ShoppingBag,
    tagline: "Your shop, open 24/7",
    headline: "Launch a world-class online store in under 30 minutes",
    description:
      "Beautiful, conversion-optimized storefronts designed for Nepali shoppers. Mobile-first, lightning fast, and deeply customizable — no developers needed.",
    bullets: [
      "50+ premium store themes",
      "Drag-and-drop product editor",
      "Built-in SEO optimization",
      "Discount & coupon engine",
    ],
    color: "#06B6D4",
    gradient: "from-[#06B6D4]/20 to-transparent",
    visual: (
      <div className="space-y-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-white text-xs font-medium">Himalayan Roasters</div>
              <div className="text-gray-500 text-xs">Online Store Active</div>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["Coffee Blend", "French Press", "Cold Brew"].map((p, i) => (
              <div key={i} className="rounded-lg bg-white/5 p-2">
                <div className="h-12 bg-gradient-to-b from-amber-500/20 to-transparent rounded mb-1.5" />
                <div className="text-white text-xs font-medium truncate">{p}</div>
                <div className="text-cyan-400 text-xs">Rs {(800 + i * 200).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-xs text-gray-500">Today's Orders</div>
            <div className="text-xl font-bold text-white font-heading">142</div>
            <div className="text-green-400 text-xs">+28% vs yesterday</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-xs text-gray-500">Conversion Rate</div>
            <div className="text-xl font-bold text-white font-heading">3.8%</div>
            <div className="text-cyan-400 text-xs">Above average</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "pos",
    label: "POS & Retail",
    icon: Monitor,
    tagline: "Your counter, digitized",
    headline: "Run every physical store location from a single system",
    description:
      "From a single counter to 50 outlets across Nepal — NEPALIX POS gives you real-time visibility, unified inventory, and fast checkout across all locations.",
    bullets: [
      "Real-time multi-outlet sync",
      "Offline mode — works without internet",
      "QR & cash payment support",
      "Staff roles and permissions",
    ],
    color: "#8B5CF6",
    gradient: "from-[#8B5CF6]/20 to-transparent",
    visual: (
      <div className="space-y-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="text-xs text-gray-500 mb-3">Current Transaction</div>
          {[
            { name: "Americano (Large)", qty: 2, price: 320 },
            { name: "Chocolate Muffin", qty: 1, price: 180 },
            { name: "Cold Brew", qty: 1, price: 420 },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
              <div>
                <div className="text-white text-xs">{item.name}</div>
                <div className="text-gray-500 text-xs">x{item.qty}</div>
              </div>
              <div className="text-white text-xs font-medium">Rs {(item.price * item.qty).toLocaleString()}</div>
            </div>
          ))}
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
            <div className="text-gray-400 text-xs">Total</div>
            <div className="text-xl font-bold text-white font-heading">Rs 1,240</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {["eSewa", "Khalti", "Cash"].map((m) => (
              <button key={m} className="py-2 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-medium border border-[#8B5CF6]/30">{m}</button>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-green-400 text-lg">✓</span>
          </div>
          <div>
            <div className="text-white text-xs font-medium">Payment Successful</div>
            <div className="text-gray-500 text-xs">Khalti · Rs 1,240 · 11:42 AM</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    tagline: "Never run out. Never overstock.",
    headline: "Know exactly what you have, where it is, and when to reorder",
    description:
      "Real-time inventory tracking across all locations. Set reorder thresholds, get low-stock alerts, and eliminate the spreadsheet chaos that costs Nepali businesses thousands every month.",
    bullets: [
      "Bulk import & barcode scanning",
      "Low-stock SMS/WhatsApp alerts",
      "Multi-location stock transfer",
      "Supplier & purchase orders",
    ],
    color: "#84CC16",
    gradient: "from-[#84CC16]/20 to-transparent",
    visual: (
      <div className="space-y-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-white font-medium">Stock Health</div>
            <div className="text-xs text-green-400">3 alerts</div>
          </div>
          {[
            { name: "Premium Coffee Blend", stock: 48, max: 100, status: "ok" },
            { name: "French Press 600ml", stock: 8, max: 50, status: "low" },
            { name: "Ceramic Mug Set", stock: 23, max: 60, status: "ok" },
            { name: "Cold Brew Bottle", stock: 3, max: 30, status: "critical" },
          ].map((item, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-300 truncate max-w-[140px]">{item.name}</span>
                <span
                  className={`text-xs font-medium ${item.status === "ok" ? "text-green-400" : item.status === "low" ? "text-yellow-400" : "text-red-400"}`}
                >
                  {item.stock} units
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.status === "ok" ? "bg-green-500" : item.status === "low" ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${(item.stock / item.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    tagline: "Every payment method, one platform",
    headline: "Accept every payment Nepali customers prefer",
    description:
      "eSewa, Khalti, FonePay, IME Pay, ConnectIPS, and bank transfers — all in one checkout. No separate merchant accounts. No technical setup.",
    bullets: [
      "Instant settlement to your bank",
      "QR code payment generation",
      "Refund management built-in",
      "Real-time transaction alerts",
    ],
    color: "#EC4899",
    gradient: "from-[#EC4899]/20 to-transparent",
    visual: (
      <div className="space-y-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="text-xs text-gray-500 mb-3">Payment Methods Active</div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {["eSewa", "Khalti", "FonePay", "IME Pay", "ConnectIPS", "Bank Transfer"].map((m) => (
              <div key={m} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-xs truncate">{m}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-[#EC4899]/10 border border-[#EC4899]/20 p-3">
            <div className="text-xs text-gray-500">This Month's Revenue</div>
            <div className="text-2xl font-bold text-white font-heading">NPR 4,82,350</div>
            <div className="text-green-400 text-xs mt-0.5">+34.2% vs last month</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    tagline: "See exactly what's making you money",
    headline: "Turn your sales data into your unfair advantage",
    description:
      "Know your best-selling products, your peak hours, your top customers, and exactly where your revenue is coming from — all in a beautiful real-time dashboard.",
    bullets: [
      "Revenue by product, location, hour",
      "Customer lifetime value tracking",
      "Abandoned cart recovery insights",
      "Export to Excel or PDF",
    ],
    color: "#F59E0B",
    gradient: "from-[#F59E0B]/20 to-transparent",
    visual: (
      <div className="space-y-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="text-xs text-gray-500 mb-2">Revenue (Last 7 days)</div>
          <div className="flex items-end gap-1.5 h-20 mb-3">
            {[45, 65, 48, 85, 72, 90, 78].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div
                  className="rounded-sm w-full"
                  style={{
                    height: `${h}%`,
                    background:
                      i === 5
                        ? "linear-gradient(180deg, #F59E0B, #F59E0B88)"
                        : `rgba(245, 158, 11, ${0.15 + i * 0.04})`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Top Product", value: "Cold Brew" },
              { label: "Peak Hour", value: "11AM–1PM" },
              { label: "Repeat Rate", value: "64%" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-white text-xs font-bold">{s.value}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

export function PlatformShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  return (
    <section className="bg-[#070B14]">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 text-sm font-medium text-cyan-400">
              <Zap className="w-3.5 h-3.5" /> The Full Platform
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white font-heading mb-6 leading-[1.05]">
              Everything you need,
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #06B6D4, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                built as one
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-xl mx-auto">
              No more patching together 5 different tools. NEPALIX is the complete commerce stack, deeply integrated from day one.
            </p>
          </motion.div>
        </div>

        {/* Module cards staggered grid */}
        <div ref={containerRef} className="space-y-6">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className={`rounded-2xl border border-white/10 bg-[#0F172A]/60 overflow-hidden grid lg:grid-cols-2 gap-0 ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
              >
                {/* Content */}
                <div className={`p-8 lg:p-12 flex flex-col justify-center ${i % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${mod.color}25` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: mod.color }} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: mod.color }}>
                      {mod.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-2" style={{ color: mod.color }}>{mod.tagline}</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white font-heading mb-4 leading-tight">
                    {mod.headline}
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{mod.description}</p>
                  <ul className="space-y-2">
                    {mod.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-center gap-2.5 text-sm text-gray-300">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${mod.color}25` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mod.color }} />
                        </div>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div
                  className={`p-8 flex items-center justify-center ${i % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}
                  style={{
                    background: `linear-gradient(135deg, ${mod.color}08, transparent)`,
                  }}
                >
                  <div className="w-full max-w-xs">{mod.visual}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
