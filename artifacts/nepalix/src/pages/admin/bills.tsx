import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { useToast } from "@/hooks/use-toast";
import { api, type AdminBill } from "@/lib/api";

export default function AdminBills() {
  const { toast } = useToast();
  const [bills, setBills] = useState<AdminBill[]>([]);
  const [summary, setSummary] = useState<{ totalRevenue: number; pending: number; verified: number; failed: number } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.admin.bills
      .list()
      .then((r) => {
        setBills(r.bills);
        setSummary(r.summary);
      })
      .catch((e) => toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <AdminLayout title="Bills" subtitle="Subscription payments and invoices">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Verified revenue" value={`Rs ${(summary?.totalRevenue ?? 0).toLocaleString()}`} accent="emerald" />
        <StatCard label="Verified" value={summary?.verified ?? 0} accent="cyan" />
        <StatCard label="Pending" value={summary?.pending ?? 0} accent="amber" />
        <StatCard label="Failed" value={summary?.failed ?? 0} accent="rose" />
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFBFF] text-[#9CA3AF] text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Plan</th>
              <th className="text-left px-4 py-3">Provider</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[#9CA3AF]">Loading…</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[#9CA3AF]">No bills yet.</td></tr>
            ) : (
              bills.map((b) => (
                <tr key={b.id} className="border-t border-[#F3F4F6] hover:bg-[#FAFBFF]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#111827]">{b.userName ?? "—"}</div>
                    <div className="text-xs text-[#9CA3AF]">{b.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-[#111827]">{b.planName ?? b.planSlug ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-[#6B7280]">{b.provider}</td>
                  <td className="px-4 py-3 text-right font-medium text-[#111827]">Rs {b.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      b.status === "verified" ? "bg-[#DCFCE7] text-[#15803D]"
                      : b.status === "failed" ? "bg-[#FEE2E2] text-[#DC2626]"
                      : "bg-[#FEF3C7] text-[#B45309]"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#9CA3AF]">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
