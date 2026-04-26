import type { SectionComponentProps } from "./types";

export function NewsletterSection({ data, isEditing, onUpdate }: SectionComponentProps) {
  const title = String(data.props.title ?? "Join Us");
  const placeholder = String(data.props.placeholder ?? "Enter email");
  const buttonLabel = String(data.props.buttonLabel ?? "Subscribe");

  return (
    <section className="rounded-2xl border border-white/10 p-6 bg-white/[0.02]">
      <h3
        className="text-xl text-white font-semibold mb-3 outline-none"
        contentEditable={Boolean(isEditing)}
        suppressContentEditableWarning
        onBlur={(e) => onUpdate?.({ ...data.props, title: e.currentTarget.textContent ?? "" })}
      >
        {title}
      </h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-sm text-white"
          placeholder={placeholder}
          onChange={(e) => isEditing && onUpdate?.({ ...data.props, placeholder: e.target.value })}
        />
        <button className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium">
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}
