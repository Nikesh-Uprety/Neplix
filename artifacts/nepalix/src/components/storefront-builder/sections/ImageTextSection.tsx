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

function ImagePlaceholder() {
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center gap-3"
      style={{
        background:
          "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)",
        backgroundColor: "var(--sf-card, rgba(255,255,255,0.04))",
        border: "2px dashed var(--sf-border, rgba(255,255,255,0.12))",
        borderRadius: "inherit",
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "var(--sf-muted, rgba(226,232,240,0.3))" }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <p
        className="text-xs font-medium"
        style={{ color: "var(--sf-muted, rgba(226,232,240,0.3))" }}
      >
        No image
      </p>
    </div>
  );
}

export function ImageTextSection({
  data,
  isEditing,
  onUpdate,
  onUploadImage,
  linkOptions,
}: SectionComponentProps) {
  const imageUrl = String(data.props.imageUrl ?? "");
  const heading = String(data.props.heading ?? "");
  const text = String(data.props.text ?? "Share your story, highlight a product feature, or tell customers why they should choose you.");
  const imageLink = String(data.props.imageLink ?? "#");
  const ratio = String(data.props.imageRatio ?? "4/3");
  const focalPoint = String(data.props.focalPoint ?? "center");
  const reverse = Boolean(data.props.reverse ?? false);

  const objectPosClass = useMemo(() => {
    const map: Record<string, string> = {
      top: "object-top",
      bottom: "object-bottom",
      left: "object-left",
      right: "object-right",
    };
    return map[focalPoint] ?? "object-center";
  }, [focalPoint]);

  const ratioClass =
    ratio === "1/1"
      ? "aspect-square"
      : ratio === "4/3"
        ? "aspect-[4/3]"
        : ratio === "3/4"
          ? "aspect-[3/4]"
          : "aspect-[16/10]";

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = onUploadImage ? await onUploadImage(file) : await toDataUrl(file);
    onUpdate?.({ ...data.props, imageUrl: url });
  }

  const imageEl = (
    <div
      className={`relative rounded-2xl overflow-hidden ${ratioClass}`}
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}
    >
      {isEditing && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-1 border border-dashed border-white/20 rounded-xl" />
        </div>
      )}
      <a
        href={isEditing ? "#" : imageLink || "#"}
        onClick={(e) => isEditing && e.preventDefault()}
        className="block h-full w-full"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className={`h-full w-full object-cover ${objectPosClass} transition-transform duration-500 hover:scale-105`}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </a>
    </div>
  );

  const textEl = (
    <div className="flex flex-col justify-center py-4">
      {isEditing && (
        <div className="space-y-2 mb-4 p-3 rounded-xl bg-black/10 border border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-black/30 text-white border border-white/15">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              {imageUrl ? "Change" : "Upload image"}
              <input type="file" className="hidden" accept="image/*" onChange={onFile} />
            </label>
            <select
              className="text-xs px-2 py-1.5 rounded-lg bg-black/30 text-white border border-white/15"
              value={ratio}
              onChange={(e) => onUpdate?.({ ...data.props, imageRatio: e.target.value })}
            >
              <option value="16/10">16:10</option>
              <option value="4/3">4:3</option>
              <option value="1/1">1:1</option>
              <option value="3/4">3:4 (portrait)</option>
            </select>
            <select
              className="text-xs px-2 py-1.5 rounded-lg bg-black/30 text-white border border-white/15"
              value={focalPoint}
              onChange={(e) => onUpdate?.({ ...data.props, focalPoint: e.target.value })}
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
            <button
              type="button"
              className="text-xs px-2.5 py-1.5 rounded-lg bg-black/30 text-white border border-white/15"
              onClick={() => onUpdate?.({ ...data.props, reverse: !reverse })}
            >
              ⇄ Flip layout
            </button>
          </div>
          <input
            className="w-full px-3 py-1.5 rounded-lg bg-[#0F172A] border border-white/10 text-sm text-white"
            placeholder="Image URL (or upload above)"
            value={imageUrl}
            onChange={(e) => onUpdate?.({ ...data.props, imageUrl: e.target.value })}
          />
          <LinkAutocompleteInput
            value={imageLink}
            onChange={(next) => onUpdate?.({ ...data.props, imageLink: next })}
            options={linkOptions ?? []}
            placeholder="Image click link…"
          />
        </div>
      )}

      {/* Optional heading */}
      {(heading || isEditing) && (
        <h3
          className="text-xl sm:text-2xl font-bold mb-3 outline-none leading-snug"
          style={{ color: "var(--sf-text, #E2E8F0)" }}
          contentEditable={Boolean(isEditing)}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate?.({ ...data.props, heading: e.currentTarget.textContent ?? "" })}
        >
          {heading || (isEditing ? "Section heading" : "")}
        </h3>
      )}

      <p
        className="text-sm sm:text-base leading-relaxed outline-none"
        style={{ color: "var(--sf-muted, rgba(226,232,240,0.7))" }}
        contentEditable={Boolean(isEditing)}
        suppressContentEditableWarning
        onBlur={(e) => onUpdate?.({ ...data.props, text: e.currentTarget.textContent ?? "" })}
      >
        {text}
      </p>

      {!isEditing && imageLink && imageLink !== "#" && (
        <a
          href={imageLink}
          className="inline-flex items-center gap-2 mt-6 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--sf-accent, #6366F1)" }}
        >
          Learn more
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      )}
    </div>
  );

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className={`grid md:grid-cols-2 gap-10 lg:gap-16 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
        {imageEl}
        {textEl}
      </div>
    </section>
  );
}
