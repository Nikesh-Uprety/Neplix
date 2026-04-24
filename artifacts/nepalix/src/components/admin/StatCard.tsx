import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "cyan",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: "cyan" | "purple" | "amber" | "emerald" | "rose";
}) {
  const accents: Record<string, { bg: string; text: string }> = {
    cyan: { bg: "bg-[#DBEAFE]", text: "text-[#2563EB]" },
    purple: { bg: "bg-[#F3F0FF]", text: "text-[#5B4FF9]" },
    amber: { bg: "bg-[#FFFBEB]", text: "text-[#B45309]" },
    emerald: { bg: "bg-[#DCFCE7]", text: "text-[#16A34A]" },
    rose: { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]" },
  };
  const tone = accents[accent];

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">{label}</div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-[#111827]">{value}</div>
          {hint && <div className="mt-1 text-xs text-[#6B7280]">{hint}</div>}
        </div>
        {icon && (
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", tone.bg, tone.text)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
