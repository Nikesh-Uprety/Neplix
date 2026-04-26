import type { SectionComponentProps } from "./types";

const DEFAULT_ITEMS = [
  { icon: "🚚", title: "Free Delivery", desc: "On orders above NPR 1,500." },
  { icon: "✅", title: "Genuine Products", desc: "100% authentic, quality guaranteed." },
  { icon: "🔄", title: "Easy Returns", desc: "Hassle-free 7-day return policy." },
];

export function FeaturesSection({ data, isEditing, onUpdate }: SectionComponentProps) {
  const rawItems = Array.isArray(data.props.items)
    ? (data.props.items as Array<{ icon: string; title: string; desc: string }>)
    : DEFAULT_ITEMS;

  const items = rawItems.length > 0 ? rawItems : DEFAULT_ITEMS;

  return (
    <section className="py-14 px-4 max-w-7xl mx-auto">
      {isEditing && (
        <div className="mb-4 p-3 rounded-xl bg-black/10 border border-white/10">
          <label className="text-xs text-gray-400 block mb-1.5">
            Features — one per line: <code>icon|title|description</code>
          </label>
          <textarea
            className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-sm text-white font-mono resize-none"
            rows={items.length + 1}
            value={items.map((i) => `${i.icon}|${i.title}|${i.desc}`).join("\n")}
            onChange={(e) =>
              onUpdate?.({
                ...data.props,
                items: e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => {
                    const [icon, title, desc] = line.split("|");
                    return {
                      icon: icon?.trim() || "★",
                      title: title?.trim() || "Feature",
                      desc: desc?.trim() || "",
                    };
                  }),
              })
            }
          />
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item, i) => (
          <div
            key={`${item.title}-${i}`}
            className="group rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: "var(--sf-card, rgba(255,255,255,0.05))",
              border: "1px solid var(--sf-border, rgba(255,255,255,0.08))",
            }}
          >
            {/* Icon circle */}
            <div
              className="h-12 w-12 rounded-xl grid place-items-center text-xl mb-4 transition-transform duration-200 group-hover:scale-110"
              style={{
                backgroundColor: "var(--sf-accent, #6366F1)18",
                border: "1px solid var(--sf-accent, #6366F1)22",
              }}
            >
              {item.icon}
            </div>

            <p
              className="font-semibold mb-1.5"
              style={{ color: "var(--sf-text, #E2E8F0)" }}
            >
              {item.title}
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--sf-muted, rgba(226,232,240,0.55))" }}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
