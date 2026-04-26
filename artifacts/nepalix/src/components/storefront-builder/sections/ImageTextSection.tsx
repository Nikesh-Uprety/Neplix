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

export function ImageTextSection({
  data,
  isEditing,
  onUpdate,
  onUploadImage,
  linkOptions,
}: SectionComponentProps) {
  const imageUrl = String(data.props.imageUrl ?? "");
  const text = String(data.props.text ?? "Edit this text");
  const imageLink = String(data.props.imageLink ?? "#");
  const ratio = String(data.props.imageRatio ?? "16/10");
  const focalPoint = String(data.props.focalPoint ?? "center");
  const objectPosClass = useMemo(() => {
    switch (focalPoint) {
      case "top":
        return "object-top";
      case "bottom":
        return "object-bottom";
      case "left":
        return "object-left";
      case "right":
        return "object-right";
      default:
        return "object-center";
    }
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

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
      <div className={`relative rounded-2xl bg-black/5 border border-black/8 overflow-hidden shadow-sm ${ratioClass}`}>
        {isEditing && (
          <div className="absolute pointer-events-none inset-1 border border-dashed border-white/30 rounded-lg" />
        )}
        <a href={isEditing ? "#" : imageLink || "#"} onClick={(e) => isEditing && e.preventDefault()}>
          {imageUrl ? (
            <img src={imageUrl} alt="" className={`h-full w-full object-cover ${objectPosClass}`} />
          ) : (
            <div className="h-full w-full grid place-items-center text-gray-500 text-sm">No image</div>
          )}
        </a>
      </div>
      <div className="opacity-80">
        {isEditing && (
          <div className="space-y-2 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer text-xs px-2 py-1 rounded bg-white/20">
                Upload image
                <input type="file" className="hidden" accept="image/*" onChange={onFile} />
              </label>
              <select
                className="text-xs px-2 py-1 rounded bg-white/20 text-white border border-white/20"
                value={ratio}
                onChange={(e) => onUpdate?.({ ...data.props, imageRatio: e.target.value })}
              >
                <option value="16/10">16:10</option>
                <option value="4/3">4:3</option>
                <option value="1/1">1:1</option>
                <option value="3/4">3:4</option>
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
            </div>
            <input
              className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-sm text-white"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => onUpdate?.({ ...data.props, imageUrl: e.target.value })}
            />
            <LinkAutocompleteInput
              value={imageLink}
              onChange={(next) => onUpdate?.({ ...data.props, imageLink: next })}
              options={linkOptions ?? []}
              placeholder="Image click link: search product/page or paste URL"
            />
          </div>
        )}
        <p
          className="outline-none"
          contentEditable={Boolean(isEditing)}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate?.({ ...data.props, text: e.currentTarget.textContent ?? "" })}
        >
          {text}
        </p>
      </div>
    </section>
  );
}
