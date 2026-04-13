import { useRef } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, Monitor, Package, CreditCard, BarChart3, Zap, 
  Users, UserCheck, Megaphone, Paintbrush, Receipt, ListOrdered
} from "lucide-react";

import img1 from "@assets/image_1776100495005.png";
import img2 from "@assets/image_1776100524442.png";
import img3 from "@assets/image_1776100541356.png";
import img4 from "@assets/image_1776100572045.png";
import img5 from "@assets/image_1776100592841.png";
import img6 from "@assets/image_1776100621061.png";
import img7 from "@assets/image_1776100642684.png";
import img8 from "@assets/image_1776100665095.png";
import img9 from "@assets/image_1776100687942.png";
import img10 from "@assets/image_1776100728550.png";

const modules = [
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    tagline: "Data-driven decisions",
    headline: "Live revenue and performance metrics",
    description: "Turn your sales data into your unfair advantage. Track best-selling products, peak hours, and customer trends in a beautiful real-time dashboard.",
    bullets: ["Revenue by product and location", "Real-time order velocity", "Customer lifetime value insights"],
    color: "#06B6D4",
    image: img1
  },
  {
    id: "inventory",
    label: "Inventory & Products",
    icon: Package,
    tagline: "Never oversell again",
    headline: "Real-time stock synchronization",
    description: "Manage thousands of SKUs across multiple locations. From raw materials to finished fashion pieces, know exactly what you have and where it is.",
    bullets: ["Bulk import & variant management", "Low-stock alerts", "Multi-location transfer tracking"],
    color: "#8B5CF6",
    image: img2
  },
  {
    id: "pos",
    label: "Point of Sale",
    icon: Monitor,
    tagline: "Your retail counter, digitized",
    headline: "Lightning-fast physical checkouts",
    description: "Run your physical store seamlessly. NEPALIX POS gives you real-time visibility, unified inventory, and fast checkout across all your retail outlets.",
    bullets: ["Real-time online/offline sync", "Integrated payment gateways", "Staff role permissions"],
    color: "#EC4899",
    image: img3
  },
  {
    id: "orders",
    label: "Order Management",
    icon: ListOrdered,
    tagline: "Streamlined fulfillment",
    headline: "From click to delivery, managed",
    description: "Process orders from your online store, Instagram, and walk-ins from one unified queue. Automatically generate shipping labels and track delivery status.",
    bullets: ["Centralized order queue", "Automated status updates", "Return and exchange handling"],
    color: "#F59E0B",
    image: img4
  },
  {
    id: "bills",
    label: "Billing & Invoicing",
    icon: Receipt,
    tagline: "Financial compliance, simplified",
    headline: "Automated, compliant billing",
    description: "Generate professional invoices, manage tax compliance, and keep your accounting clean without jumping between different software suites.",
    bullets: ["Customizable invoice templates", "Tax calculation & reporting", "Digital receipt delivery"],
    color: "#10B981",
    image: img5
  },
  {
    id: "customers",
    label: "Customers & Marketing",
    icon: Users,
    tagline: "Build lasting relationships",
    headline: "Know your buyers, grow your sales",
    description: "Track customer purchase history, manage loyalty programs, and launch targeted marketing campaigns directly from your commerce OS.",
    bullets: ["Unified customer profiles", "Purchase history tracking", "Integrated marketing tools"],
    color: "#3B82F6",
    image: img6
  },
  {
    id: "customization",
    label: "Canvas Customization",
    icon: Paintbrush,
    tagline: "Your brand, your rules",
    headline: "Design a storefront that stands out",
    description: "Use our visual canvas editor to build a unique online presence. No coding required—just drag, drop, and customize to match your brand identity.",
    bullets: ["Drag-and-drop page builder", "Mobile-optimized templates", "Brand color & typography control"],
    color: "#8B5CF6",
    image: img7
  }
];

export function PlatformShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

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
              <Zap className="w-3.5 h-3.5" /> The Operating System
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white font-heading mb-6 leading-[1.05]">
              Everything Rare Atelier needs,
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #06B6D4, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                built as one.
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See the actual interface powering one of Nepal's most modern fashion retailers. 
              No patching together 5 different tools — NEPALIX is the complete commerce stack.
            </p>
          </motion.div>
        </div>

        {/* Module cards staggered grid */}
        <div ref={containerRef} className="relative space-y-12">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className={`rounded-3xl border border-white/10 bg-[#0F172A]/60 overflow-hidden grid lg:grid-cols-2 gap-0 ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
              >
                {/* Content */}
                <div className={`p-8 lg:p-14 flex flex-col justify-center ${i % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${mod.color}25` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: mod.color }} />
                    </div>
                    <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: mod.color }}>
                      {mod.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-3" style={{ color: mod.color }}>{mod.tagline}</p>
                  <h3 className="text-3xl md:text-4xl font-bold text-white font-heading mb-5 leading-tight">
                    {mod.headline}
                  </h3>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">{mod.description}</p>
                  <ul className="space-y-3">
                    {mod.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-center gap-3 text-base text-gray-300">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${mod.color}25` }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mod.color }} />
                        </div>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div
                  className={`relative p-8 flex items-center justify-center overflow-hidden ${i % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}
                  style={{
                    background: `linear-gradient(135deg, ${mod.color}08, transparent)`,
                  }}
                >
                  <div className="relative z-10 w-full h-full flex items-center justify-center rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <img 
                      src={mod.image} 
                      alt={mod.label} 
                      className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                  </div>
                  {/* Decorative glow */}
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md max-h-md rounded-full blur-[100px] opacity-30 pointer-events-none"
                    style={{ backgroundColor: mod.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
