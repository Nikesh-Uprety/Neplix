import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ShoppingCart, Users, Package, Wallet, ArrowRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api, type AdminAnalyticsOverview, type AdminOrdersTrendPoint } from "@/lib/api";

function formatNpr(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(null);
  const [trend, setTrend] = useState<AdminOrdersTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([api.admin.analytics.overview(), api.admin.analytics.ordersTrend(14)])
      .then(([ovRes, trRes]) => {
        if (cancelled) return;
        if (ovRes.status === "fulfilled") setOverview(ovRes.value);
        else setError(ovRes.reason?.message ?? "Failed to load overview");
        if (trRes.status === "fulfilled") setTrend(trRes.value.series);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const maxRev = Math.max(1, ...trend.map((p) => p.revenue));

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back to your store command center">
      {error && (
        <div className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Today's Revenue",
            value: loading ? "…" : formatNpr(overview?.revenue ?? 0),
            icon: Wallet,
            color: "#5B4FF9",
          },
          {
            label: "Orders Today",
            value: loading ? "…" : (overview?.orders ?? 0).toLocaleString(),
            icon: ShoppingCart,
            color: "#16A34A",
          },
          {
            label: "Active Customers",
            value: loading ? "…" : (overview?.customers ?? 0).toLocaleString(),
            icon: Users,
            color: "#2563EB",
          },
          {
            label: "Products Live",
            value: loading ? "…" : (overview?.products ?? 0).toLocaleString(),
            icon: Package,
            color: "#D97706",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${item.color}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
              </div>
              <div className="text-[22px] font-bold text-[#111827] tracking-tight leading-tight">
                {item.value}
              </div>
              <div className="text-xs text-[#9CA3AF] mt-0.5 font-medium">{item.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">Revenue Last 14 Days</h2>
              <p className="text-xs text-[#9CA3AF]">Daily store trend</p>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs text-[#5B4FF9] hover:text-[#4338CA] inline-flex items-center gap-1 font-semibold"
            >
              View analytics <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {trend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-[#9CA3AF]">
              No order data yet
            </div>
          ) : (
            <div className="h-48 flex items-end gap-1.5">
              {trend.map((p) => {
                const h = (p.revenue / maxRev) * 100;
                return (
                  <div
                    key={p.day}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    title={`${p.day} · ${formatNpr(p.revenue)} · ${p.orders} orders`}
                  >
                    <div
                      className="w-full rounded-t-md transition-opacity group-hover:opacity-100"
                      style={{
                        height: `${Math.max(2, h)}%`,
                        background: p === trend[trend.length - 1] ? "#5B4FF9" : "#EEF2FF",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <h2 className="text-sm font-bold text-[#111827] mb-3">Quick actions</h2>
          <div className="space-y-2">
            {[
              { to: "/admin/products", label: "Add a product" },
              { to: "/admin/orders", label: "View open orders" },
              { to: "/admin/promo-codes", label: "Create a promo code" },
              { to: "/admin/marketing", label: "Plan a campaign" },
              { to: "/admin/inventory", label: "Check inventory" },
            ].map((a) => (
              <Link
                key={a.to}
                href={a.to}
                className="flex items-center justify-between rounded-lg border border-[#F3F4F6] bg-[#FAFBFF] px-3 py-2 text-sm text-[#374151] hover:bg-[#F5F3FF] hover:text-[#111827]"
              >
                <span>{a.label}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-60 text-[#5B4FF9]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
