import { useState } from "react";
import type { SectionComponentProps } from "./types";

export function NewsletterSection({ data, isEditing, onUpdate }: SectionComponentProps) {
  const title = String(data.props.title ?? "Stay in the Loop");
  const subtitle = String(
    data.props.subtitle ?? "Get notified about new arrivals, exclusive deals and more.",
  );
  const placeholder = String(data.props.placeholder ?? "Enter your email address");
  const buttonLabel = String(data.props.buttonLabel ?? "Subscribe");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-6 px-4">
      <div
        className="max-w-7xl mx-auto rounded-2xl overflow-hidden relative"
        style={{
          background:
            "linear-gradient(135deg, var(--sf-accent, #6366F1) 0%, var(--sf-header, #0F172A) 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-16 -right-16 h-64 w-64 rounded-full opacity-10"
          style={{ backgroundColor: "var(--sf-accent-t, white)" }}
          aria-hidden
        />
        <div
          className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-10"
          style={{ backgroundColor: "var(--sf-accent-t, white)" }}
          aria-hidden
        />

        <div className="relative px-8 py-12 sm:py-14 text-center">
          {/* Icon */}
          <div className="inline-flex h-12 w-12 rounded-full items-center justify-center mb-5 mx-auto"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          <h3
            className="text-2xl sm:text-3xl font-bold text-white mb-2 outline-none"
            contentEditable={Boolean(isEditing)}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate?.({ ...data.props, title: e.currentTarget.textContent ?? "" })}
          >
            {title}
          </h3>

          <p
            className="text-white/70 text-sm sm:text-base mb-8 max-w-md mx-auto outline-none"
            contentEditable={Boolean(isEditing)}
            suppressContentEditableWarning
            onBlur={(e) =>
              onUpdate?.({ ...data.props, subtitle: e.currentTarget.textContent ?? "" })
            }
          >
            {subtitle}
          </p>

          {submitted && !isEditing ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 text-white text-sm font-semibold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              You&apos;re subscribed!
            </div>
          ) : (
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                if (!isEditing) setSubmitted(true);
              }}
            >
              <input
                type="email"
                required={!isEditing}
                className="flex-1 px-4 py-3 rounded-full text-sm outline-none transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
                placeholder={placeholder}
                onChange={(e) =>
                  isEditing && onUpdate?.({ ...data.props, placeholder: e.target.value })
                }
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: "white", color: "var(--sf-accent, #6366F1)" }}
              >
                {isEditing ? (
                  <span
                    className="outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onUpdate?.({
                        ...data.props,
                        buttonLabel: e.currentTarget.textContent ?? "",
                      })
                    }
                  >
                    {buttonLabel}
                  </span>
                ) : (
                  buttonLabel
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
