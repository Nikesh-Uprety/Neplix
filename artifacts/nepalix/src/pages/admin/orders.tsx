import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { api, type AdminOrderListItem } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  processing: "bg-cyan-500/15 text-cyan-300",
  shipped: "bg-blue-500/15 text-blue-300",
  delivered: "bg-emerald-500/15 text-emerald-300",
  cancelled: "bg-rose-500/15 text-rose-300",
  refunded: "bg-purple-500/15 text-purple-300",
};

const PAY_COLORS: Record<string, string> = {
  unpaid: "bg-rose-500/15 text-rose-300",
  paid: "bg-emerald-500/15 text-emerald-300",
  refunded: "bg-purple-500/15 text-purple-300",
  failed: "bg-rose-500/15 text-rose-300",
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const { orders } = await api.admin.orders.list({ status: filter || undefined });
      setOrders(orders);
    } catch (e) {
      toast({ title: "Failed to load orders", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.admin.orders.update(id, { status });
      setOrders((arr) => arr.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (e) {
      toast({ title: "Update failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout title="Orders" subtitle="Track and fulfil customer orders">
      <div className="mb-4 flex flex-wrap gap-2">
        {["", "pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs capitalize border ${
              filter === s
                ? "bg-[#5B4FF9] border-[#5B4FF9] text-white"
                : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#C4B5FD] hover:text-[#111827]"
            }`}
          >
            {s || "all"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFBFF] text-[#9CA3AF] text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Payment</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#9CA3AF]">
                  Loading…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#9CA3AF]">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t border-[#F3F4F6] hover:bg-[#FAFBFF]">
                  <td className="px-4 py-3 font-mono text-xs text-[#5B4FF9] font-semibold">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="text-[#111827] font-medium">{o.customerName}</div>
                    {o.customerEmail && (
                      <div className="text-xs text-[#9CA3AF]">{o.customerEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#111827]">
                    Rs {o.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${
                        PAY_COLORS[o.paymentStatus]?.replace("/15", "/10") ?? "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={`text-xs rounded-full px-2 py-1 capitalize border border-transparent ${
                        STATUS_COLORS[o.status]?.replace("/15", "/10") ?? "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {["pending", "processing", "shipped", "delivered", "cancelled", "refunded"].map((s) => (
                        <option key={s} value={s} className="bg-white text-[#111827]">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#9CA3AF]">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
