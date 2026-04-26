import { useMemo, type ChangeEvent } from "react";
import type { SectionComponentProps } from "./types";
import { LinkAutocompleteInput } from "../LinkAutocompleteInput";

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });
}

export function HeroSection({
  data,
  isEditing,
  onUpdate,
  onUploadImage,
  linkOptions,
}: SectionComponentProps) {
  const heading = String(data.props.heading ?? "Your Store Heading");
  const subtext = String(data.props.subtext ?? "Discover our latest collection.");
  const buttonLabel = String(data.props.buttonLabel ?? "Shop Now");
  const bgImage = String(data.props.bgImage ?? "");
  const buttonLink = String(data.props.buttonLink ?? "#");
  const heroRatio = String(data.props.heroRatio ?? "16/9");
  const focalPoint = String(data.props.focalPoint ?? "center");
  const badge = String(data.props.badge ?? "");

  const bgPositionStyle = useMemo(() => {
    const map: Record<string, string> = {
      top: "top",
      bottom: "bottom",
      left: "left",
      right: "right",
      center: "center",
    };
    return map[focalPoint] ?? "center";
  }, [focalPoint]);

  const ratioClass =
    heroRatio === "21/9"
      ? "aspect-[21/9]"
      : heroRatio === "4/3"
        ? "aspect-[4/3]"
        : heroRatio === "1/1"
          ? "aspect-square"
          : heroRatio === "full"
            ? "min-h-[90vh]"
            : "aspect-[16/9]";

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = onUploadImage ? await onUploadImage(file) : await toDataUrl(file);
    onUpdate?.({ ...data.props, bgImage: url });
  }

  return (
    <div
      className={`relative ${ratioClass} min-h-[320px] overflow-hidden`}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: bgPositionStyle,
        backgroundColor: bgImage ? undefined : "var(--sf-header, #0F172A)",
      }}
    >
      {/* Gradient overlay — more cinematic */}
      <div
        className="absolute inset-0"
        style={{
          background: bgImage
            ? "linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.65) 100%)"
            : "linear-gradient(160deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)",
        }}
      />

      {/* No-image ambient gradient when bg is set via theme */}
      {!bgImage && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 70% 40%, var(--sf-accent, #6366F1) 0%, transparent 60%)",
          }}
        />
      )}

      {/* Edit overlay guides */}
      {isEditing && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-3 border border-dashed border-white/25 rounded-xl" />
        </div>
      )}

      {/* Edit toolbar */}
      {isEditing && (
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-black/50 text-white border border-white/20 hover:bg-black/70 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            {bgImage ? "Change image" : "Upload image"}
            <input type="file" className="hidden" accept="image/*" onChange={onFile} />
          </label>
          <select
            className="text-xs px-2.5 py-1.5 rounded-lg bg-black/50 text-white border border-white/20"
            value={heroRatio}
            onChange={(e) => onUpdate?.({ ...data.props, heroRatio: e.target.value })}
          >
            <option value="16/9">16:9</option>
            <option value="21/9">21:9 (wide)</option>
            <option value="4/3">4:3</option>
            <option value="1/1">1:1</option>
            <option value="full">Full height</option>
          </select>
          <select
            className="text-xs px-2.5 py-1.5 rounded-lg bg-black/50 text-white border border-white/20"
            value={focalPoint}
            onChange={(e) => onUpdate?.({ ...data.props, focalPoint: e.target.value })}
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
          <div className="min-w-[260px]">
            <LinkAutocompleteInput
              value={buttonLink}
              onChange={(next) => onUpdate?.({ ...data.props, buttonLink: next })}
              options={linkOptions ?? []}
              placeholder="Button link…"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl w-full mx-auto px-6 sm:px-10 py-16 sm:py-24">
          {/* Optional badge */}
          {(badge || isEditing) && (
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5 outline-none"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              contentEditable={Boolean(isEditing)}
              suppressContentEditableWarning
              onBlur={(e) =>
                onUpdate?.({ ...data.props, badge: e.currentTarget.textContent ?? "" })
              }
            >
              {badge || (isEditing ? "✨ New Collection" : "")}
            </div>
          )}

          {/* Heading */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4 outline-none max-w-3xl"
            contentEditable={Boolean(isEditing)}
            suppressContentEditableWarning
            onBlur={(e) =>
              onUpdate?.({ ...data.props, heading: e.currentTarget.textContent ?? "" })
            }
          >
            {heading}
          </h1>

          {/* Subtext */}
          <p
            className="text-base sm:text-lg text-white/75 mb-8 max-w-xl leading-relaxed outline-none"
            contentEditable={Boolean(isEditing)}
            suppressContentEditableWarning
            onBlur={(e) =>
              onUpdate?.({ ...data.props, subtext: e.currentTarget.textContent ?? "" })
            }
          >
            {subtext}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {isEditing ? (
              <span
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold outline-none cursor-pointer"
                style={{
                  backgroundColor: "var(--sf-accent, rgba(255,255,255,0.95))",
                  color: "var(--sf-accent-t, #0F172A)",
                }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  onUpdate?.({ ...data.props, buttonLabel: e.currentTarget.textContent ?? "" })
                }
              >
                {buttonLabel}
              </span>
            ) : (
              <a
                href={buttonLink || "#"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                style={{
                  backgroundColor: "var(--sf-accent, rgba(255,255,255,0.95))",
                  color: "var(--sf-accent-t, #0F172A)",
                }}
              >
                {buttonLabel}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            )}
            {!isEditing && (
              <a
                href="/products"
                className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold transition-all hover:bg-white/20"
                style={{
                  color: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  backdropFilter: "blur(8px)",
                }}
              >
                Browse all
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator (non-editing, full-height) */}
      {!isEditing && heroRatio === "full" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      )}
    </div>
  );
}
