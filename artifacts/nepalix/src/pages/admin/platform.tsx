import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";

export default function AdminPlatformPage() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.admin.stats(),
  });
  const stores = useQuery({
    queryKey: ["admin", "stores"],
    queryFn: () => api.admin.stores.list({ limit: 100 }),
  });

  return (
    <AdminLayout title="Platform Admin" subtitle="Super admin controls across all stores">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Total stores", stats.data?.storesCount ?? 0, "#5B4FF9"],
            ["Active stores", stats.data?.activeStores ?? 0, "#16A34A"],
            ["Users", stats.data?.usersCount ?? 0, "#2563EB"],
            ["Revenue (NPR)", stats.data?.totalRevenueNpr ?? 0, "#D97706"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">{String(label)}</p>
              <p className="mt-2 text-[26px] font-black tracking-tight" style={{ color: String(color) }}>
                {String(value)}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#111827]">All Stores</p>
                <p className="text-xs text-[#9CA3AF]">Platform-wide tenant overview</p>
              </div>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {(stores.data?.stores ?? []).map((store) => (
                <div key={store.id} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-[#FAFBFF]">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111827] truncate">{store.name}</p>
                    <p className="text-xs text-[#9CA3AF] truncate">{store.slug}</p>
                  </div>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F0FF] text-[#5B4FF9] capitalize">
                    {store.status}
                  </span>
                </div>
              ))}
              {stores.isLoading ? (
                <p className="px-5 py-4 text-sm text-[#9CA3AF]">Loading stores...</p>
              ) : null}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-4">
              Platform Controls
            </p>
            <div className="space-y-2">
              {[
                "Review trial stores",
                "Inspect subscription health",
                "Audit feature flags",
                "Monitor support queue",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-lg border border-[#F3F4F6] bg-[#FAFBFF] px-3 py-2 text-sm text-[#374151]"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
