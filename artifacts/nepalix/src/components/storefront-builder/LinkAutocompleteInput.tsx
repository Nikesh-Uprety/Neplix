import { useMemo, useState } from "react";

type LinkOption = { label: string; url: string; group?: "page" | "product" | "custom" };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: LinkOption[];
  placeholder?: string;
};

export function LinkAutocompleteInput({
  value,
  onChange,
  options,
  placeholder = "Paste URL or search page/product...",
}: Props) {
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options.slice(0, 20);
    return options
      .filter(
        (option) =>
          option.label.toLowerCase().includes(q) ||
          option.url.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [options, value]);

  return (
    <div className="relative">
      <input
        className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-xs text-white"
        value={value}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(e) => {
          onChange(e.target.value);
          if (!open) setOpen(true);
        }}
        placeholder={placeholder}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-white/10 bg-[#0B1020] shadow-xl">
          {filtered.map((option) => (
            <button
              key={`${option.url}-${option.label}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(option.url);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 border-b border-white/5 last:border-b-0 hover:bg-white/5"
            >
              <p className="text-xs text-white">{option.label}</p>
              <p className="text-[11px] text-gray-500">{option.url}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
