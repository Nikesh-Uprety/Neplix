import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";

export default function AdminPlatformAnalyticsPage() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.admin.stats(),
  });

  const cards = [
    {
      label: "Total Stores",
      value: stats.data?.storesCount ?? 0,
      color: "#5B4FF9",
      hint: "All platform tenants",
    },
    {
      label: "Active Stores",
      value: stats.data?.activeStores ?? 0,
      color: "#16A34A",
      hint: "Currently live",
    },
    {
      label: "Active Subscriptions",
      value: stats.data?.activeSubscriptions ?? 0,
      color: "#2563EB",
      hint: "Paying stores",
    },
    {
      label: "Trialing Subscriptions",
      value: stats.data?.trialingSubscriptions ?? 0,
      color: "#D97706",
      hint: "Stores still evaluating",
    },
    {
      label: "Platform Users",
      value: stats.data?.usersCount ?? 0,
      color: "#DC2626",
      hint: "All authenticated accounts",
    },
    {
      label: "Verified Revenue",
      value: `Rs ${(stats.data?.totalRevenueNpr ?? 0).toLocaleString()}`,
      color: "#7C3AED",
      hint: "Captured gross revenue",
    },
  ];

  return (
    <AdminLayout
      title="Platform Analytics"
      subtitle="Global metrics across stores, subscriptions, and revenue"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">
                {card.label}
              </p>
              <p
                className="mt-2 text-[28px] font-black tracking-tight"
                style={{ color: card.color }}
              >
                {card.value}
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">{card.hint}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#111827]">Platform Snapshot</p>
            <div className="mt-4 space-y-3">
              {[
                ["Store Activation Rate", `${stats.data?.storesCount ? Math.round(((stats.data?.activeStores ?? 0) / stats.data.storesCount) * 100) : 0}%`],
                ["Subscription Conversion", `${stats.data?.storesCount ? Math.round((((stats.data?.activeSubscriptions ?? 0) + (stats.data?.trialingSubscriptions ?? 0)) / stats.data.storesCount) * 100) : 0}%`],
                ["Trial Mix", `${stats.data?.trialingSubscriptions ?? 0} stores`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-[#F3F4F6] bg-[#FAFBFF] px-4 py-3"
                >
                  <span className="text-sm text-[#4B5563]">{label}</span>
                  <span className="text-sm font-semibold text-[#111827]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-[#111827]">What To Watch</p>
            <div className="mt-4 space-y-3 text-sm text-[#4B5563]">
              <div className="rounded-lg border border-[#F3F4F6] bg-[#FCFCFD] px-4 py-3">
                Trial stores should move into paid plans before their evaluation window closes.
              </div>
              <div className="rounded-lg border border-[#F3F4F6] bg-[#FCFCFD] px-4 py-3">
                Compare active subscriptions against active stores to spot monetization gaps.
              </div>
              <div className="rounded-lg border border-[#F3F4F6] bg-[#FCFCFD] px-4 py-3">
                Pair this view with All Stores to inspect which tenants need onboarding help.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
