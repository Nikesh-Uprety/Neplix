import type { SectionComponentProps } from "./types";

export function TestimonialsSection({ data, isEditing, onUpdate }: SectionComponentProps) {
  const title = String(data.props.title ?? "What People Say");
  const reviews = Array.isArray(data.props.reviews)
    ? (data.props.reviews as Array<{ quote: string; author: string }>)
    : [];

  return (
    <section className="rounded-2xl border border-white/10 p-6 bg-white/[0.02]">
      <h3
        className="text-xl font-semibold text-white mb-4 outline-none"
        contentEditable={Boolean(isEditing)}
        suppressContentEditableWarning
        onBlur={(e) => onUpdate?.({ ...data.props, title: e.currentTarget.textContent ?? "" })}
      >
        {title}
      </h3>
      {isEditing && (
        <textarea
          className="w-full mb-4 px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-sm text-white"
          rows={4}
          value={reviews.map((r) => `${r.author}|${r.quote}`).join("\n")}
          onChange={(e) =>
            onUpdate?.({
              ...data.props,
              reviews: e.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                  const [author, quote] = line.split("|");
                  return { author: author?.trim() || "Anonymous", quote: quote?.trim() || "" };
                }),
            })
          }
        />
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {(reviews.length ? reviews : [{ author: "Customer", quote: "Great service!" }]).map((r, i) => (
          <div key={`${r.author}-${i}`} className="rounded-xl border border-white/10 p-4 text-gray-300">
            <p className="mb-2">"{r.quote}"</p>
            <p className="text-xs text-gray-500">- {r.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
