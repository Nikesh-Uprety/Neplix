import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { useToast } from "@/hooks/use-toast";
import {
  api,
  type AdminAnalyticsOverview,
  type AdminOrdersTrendPoint,
  type AdminProduct,
} from "@/lib/api";

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(null);
  const [trend, setTrend] = useState<AdminOrdersTrendPoint[]>([]);
  const [top, setTop] = useState<AdminProduct[]>([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    Promise.allSettled([
      api.admin.analytics.overview(),
      api.admin.analytics.ordersTrend(days),
      api.admin.analytics.topProducts(),
    ])
      .then(([ov, tr, tp]) => {
        if (ov.status === "fulfilled") setOverview(ov.value);
        if (tr.status === "fulfilled") setTrend(tr.value.series);
        if (tp.status === "fulfilled") setTop(tp.value.products);
      })
      .catch((e) => toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }));
  }, [days, toast]);

  const maxOrders = Math.max(1, ...trend.map((p) => p.orders));

  return (
    <AdminLayout title="Analytics" subtitle="Performance insights for your store">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue" value={`Rs ${(overview?.revenue ?? 0).toLocaleString()}`} accent="emerald" />
        <StatCard label="Orders" value={(overview?.orders ?? 0).toLocaleString()} accent="cyan" />
        <StatCard label="Customers" value={(overview?.customers ?? 0).toLocaleString()} accent="purple" />
        <StatCard label="Products" value={(overview?.products ?? 0).toLocaleString()} accent="amber" />
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#111827]">Orders · last {days} days</h3>
          <div className="flex gap-2">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`text-xs px-2 py-1 rounded-md border ${
                  days === d
                    ? "bg-[#5B4FF9] border-[#5B4FF9] text-white"
                    : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#C4B5FD] hover:text-[#111827]"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        {trend.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-[#9CA3AF]">No data yet</div>
        ) : (
          <div className="h-40 flex items-end gap-1">
            {trend.map((p) => (
              <div key={p.day} className="flex-1" title={`${p.day} · ${p.orders} orders`}>
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${Math.max(2, (p.orders / maxOrders) * 100)}%`,
                    background: p === trend[trend.length - 1] ? "#5B4FF9" : "#EEF2FF",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
        <h3 className="text-sm font-bold text-[#111827] mb-3">Top products</h3>
        {top.length === 0 ? (
          <div className="text-sm text-[#9CA3AF]">No product data yet</div>
        ) : (
          <ul className="divide-y divide-[#F3F4F6]">
            {top.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-[#111827] font-medium">{p.name}</span>
                <span className="text-[#6B7280]">stock {p.stock} · Rs {p.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}
