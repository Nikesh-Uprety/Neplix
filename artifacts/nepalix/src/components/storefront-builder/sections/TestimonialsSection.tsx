import type { SectionComponentProps } from "./types";

const DEFAULT_REVIEWS = [
  {
    author: "Sita M.",
    quote: "The quality exceeded my expectations. Fast delivery and beautiful packaging!",
    rating: 5,
  },
  {
    author: "Rohan T.",
    quote: "My go-to store for everything. Amazing customer service and genuine products.",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 mb-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={n <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: "var(--sf-accent, #6366F1)" }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className="h-9 w-9 rounded-full grid place-items-center text-xs font-bold flex-shrink-0"
      style={{
        backgroundColor: "var(--sf-accent, #6366F1)22",
        color: "var(--sf-accent, #6366F1)",
        border: "1.5px solid var(--sf-accent, #6366F1)30",
      }}
    >
      {initials}
    </div>
  );
}

export function TestimonialsSection({ data, isEditing, onUpdate }: SectionComponentProps) {
  const title = String(data.props.title ?? "What Our Customers Say");
  const rawReviews = Array.isArray(data.props.reviews)
    ? (data.props.reviews as Array<{ quote: string; author: string; rating?: number }>)
    : [];
  const reviews = rawReviews.length > 0 ? rawReviews : DEFAULT_REVIEWS;

  return (
    <section
      className="py-16 px-4"
      style={{
        background: "linear-gradient(180deg, transparent 0%, var(--sf-card, rgba(255,255,255,0.03)) 50%, transparent 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight outline-none"
            style={{ color: "var(--sf-text, #E2E8F0)" }}
            contentEditable={Boolean(isEditing)}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate?.({ ...data.props, title: e.currentTarget.textContent ?? "" })}
          >
            {title}
          </h2>
          <div
            className="mt-3 mx-auto h-0.5 w-10 rounded-full"
            style={{ backgroundColor: "var(--sf-accent, #6366F1)" }}
          />
        </div>

        {/* Edit controls */}
        {isEditing && (
          <div className="mb-6 p-3 rounded-xl bg-black/10 border border-white/10">
            <label className="text-xs text-gray-400 block mb-1.5">
              Reviews — one per line: <code>Author Name|Review text|rating(1-5)</code>
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-sm text-white font-mono resize-none"
              rows={reviews.length + 1}
              value={reviews
                .map((r) => `${r.author}|${r.quote}|${r.rating ?? 5}`)
                .join("\n")}
              onChange={(e) =>
                onUpdate?.({
                  ...data.props,
                  reviews: e.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => {
                      const [author, quote, rating] = line.split("|");
                      return {
                        author: author?.trim() || "Customer",
                        quote: quote?.trim() || "",
                        rating: Math.min(5, Math.max(1, parseInt(rating ?? "5") || 5)),
                      };
                    }),
                })
              }
            />
          </div>
        )}

        {/* Review cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {reviews.map((r, i) => (
            <div
              key={`${r.author}-${i}`}
              className="rounded-2xl p-6 relative"
              style={{
                backgroundColor: "var(--sf-card, rgba(255,255,255,0.05))",
                border: "1px solid var(--sf-border, rgba(255,255,255,0.08))",
              }}
            >
              {/* Big quote mark */}
              <div
                className="absolute top-4 right-5 text-5xl font-serif leading-none select-none"
                style={{ color: "var(--sf-accent, #6366F1)", opacity: 0.12 }}
                aria-hidden
              >
                ❝
              </div>

              <StarRating rating={r.rating ?? 5} />

              <p
                className="text-sm sm:text-base leading-relaxed mb-5 italic"
                style={{ color: "var(--sf-text, #E2E8F0)", opacity: 0.85 }}
              >
                "{r.quote}"
              </p>

              <div className="flex items-center gap-3">
                <Avatar name={r.author} />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--sf-text, #E2E8F0)" }}
                  >
                    {r.author}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--sf-muted, rgba(226,232,240,0.45))" }}
                  >
                    Verified buyer
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
