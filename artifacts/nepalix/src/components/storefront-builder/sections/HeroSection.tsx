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
  const heading = String(data.props.heading ?? "Your Heading");
  const subtext = String(data.props.subtext ?? "Add a subtext");
  const buttonLabel = String(data.props.buttonLabel ?? "Shop Now");
  const bgImage = String(data.props.bgImage ?? "");
  const buttonLink = String(data.props.buttonLink ?? "#");
  const heroRatio = String(data.props.heroRatio ?? "16/9");
  const focalPoint = String(data.props.focalPoint ?? "center");
  const bgPositionClass = useMemo(() => {
    switch (focalPoint) {
      case "top":
        return "bg-top";
      case "bottom":
        return "bg-bottom";
      case "left":
        return "bg-left";
      case "right":
        return "bg-right";
      default:
        return "bg-center";
    }
  }, [focalPoint]);
  const ratioClass =
    heroRatio === "21/9"
      ? "aspect-[21/9]"
      : heroRatio === "4/3"
        ? "aspect-[4/3]"
        : heroRatio === "1/1"
          ? "aspect-square"
          : "aspect-[16/9]";

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = onUploadImage ? await onUploadImage(file) : await toDataUrl(file);
    onUpdate?.({ ...data.props, bgImage: url });
  }

  return (
    <div
      className={`relative ${ratioClass} min-h-[280px] rounded-2xl border border-white/10 overflow-hidden ${bgPositionClass} bg-cover`}
      style={{ backgroundImage: bgImage ? `url(${bgImage})` : undefined }}
    >
      {isEditing && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-2 border border-dashed border-white/35 rounded-xl" />
          <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-white/20" />
          <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-white/20" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative p-8 sm:p-12 text-white">
        {isEditing && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer text-xs px-2 py-1 rounded bg-white/20">
              Upload background
              <input type="file" className="hidden" accept="image/*" onChange={onFile} />
            </label>
            <select
              className="text-xs px-2 py-1 rounded bg-white/20 text-white border border-white/20"
              value={heroRatio}
              onChange={(e) => onUpdate?.({ ...data.props, heroRatio: e.target.value })}
            >
              <option value="16/9">16:9</option>
              <option value="21/9">21:9</option>
              <option value="4/3">4:3</option>
              <option value="1/1">1:1</option>
            </select>
            <select
              className="text-xs px-2 py-1 rounded bg-white/20 text-white border border-white/20"
              value={focalPoint}
              onChange={(e) => onUpdate?.({ ...data.props, focalPoint: e.target.value })}
            >
              <option value="center">Focal: center</option>
              <option value="top">Focal: top</option>
              <option value="bottom">Focal: bottom</option>
              <option value="left">Focal: left</option>
              <option value="right">Focal: right</option>
            </select>
            <div className="min-w-[260px]">
              <LinkAutocompleteInput
                value={buttonLink}
                onChange={(next) => onUpdate?.({ ...data.props, buttonLink: next })}
                options={linkOptions ?? []}
                placeholder="CTA link: search product/page or paste URL"
              />
            </div>
          </div>
        )}
        <h1
          className="text-3xl sm:text-5xl font-bold mb-3 outline-none"
          contentEditable={Boolean(isEditing)}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate?.({ ...data.props, heading: e.currentTarget.textContent ?? "" })}
        >
          {heading}
        </h1>
        <p
          className="text-white/85 mb-6 max-w-2xl outline-none"
          contentEditable={Boolean(isEditing)}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate?.({ ...data.props, subtext: e.currentTarget.textContent ?? "" })}
        >
          {subtext}
        </p>
        {isEditing ? (
          <span
            className="inline-flex bg-white text-black px-5 py-2 rounded-full font-medium outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              onUpdate?.({ ...data.props, buttonLabel: e.currentTarget.textContent ?? "" })
            }
          >
            {buttonLabel}
          </span>
        ) : (
          <a href={buttonLink || "#"} className="inline-flex bg-white text-black px-5 py-2 rounded-full font-medium">
            {buttonLabel}
          </a>
        )}
      </div>
    </div>
  );
}
