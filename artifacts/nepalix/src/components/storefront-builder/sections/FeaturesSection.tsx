import type { SectionComponentProps } from "./types";

export function FeaturesSection({ data, isEditing, onUpdate }: SectionComponentProps) {
  const items = Array.isArray(data.props.items)
    ? (data.props.items as Array<{ icon: string; title: string; desc: string }>)
    : [{ icon: "★", title: "Feature", desc: "Description" }];

  return (
    <section className="rounded-2xl border border-white/10 p-6 bg-white/[0.02]">
      {isEditing && (
        <textarea
          className="w-full mb-4 px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-sm text-white"
          rows={3}
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
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div key={`${item.title}-${i}`} className="rounded-xl border border-white/10 p-4 text-gray-300">
            <div className="text-xl mb-2">{item.icon}</div>
            <p className="font-medium text-white">{item.title}</p>
            <p className="text-sm text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
