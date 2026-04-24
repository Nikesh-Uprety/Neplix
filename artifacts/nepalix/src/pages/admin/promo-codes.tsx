import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api, type AdminPromoCode, type AdminPromoCodeInput } from "@/lib/api";

const empty: AdminPromoCodeInput = {
  code: "",
  discountType: "percent",
  discountValue: 10,
  minOrderAmount: 0,
  isActive: true,
};

function CreateModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState<AdminPromoCodeInput>(empty);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      await api.admin.promoCodes.create(form);
      toast({ title: "Promo code created" });
      onSaved();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#111827]">New promo code</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-[#9CA3AF] hover:text-[#111827]" /></button>
        </div>
        <div className="space-y-3">
          <Input
            placeholder="CODE"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value as "percent" | "fixed" })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="percent">% off</option>
              <option value="fixed">Rs off</option>
            </select>
            <Input
              type="number"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
              placeholder="Value"
            />
          </div>
          <Input
            type="number"
            value={form.minOrderAmount ?? 0}
            onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
            placeholder="Min order amount (Rs)"
          />
          <Input
            placeholder="Description (optional)"
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.code}>{saving ? "Saving…" : "Create"}</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPromoCodes() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { promoCodes } = await api.admin.promoCodes.list();
      setItems(promoCodes);
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (p: AdminPromoCode) => {
    try {
      await api.admin.promoCodes.update(p.id, { isActive: !p.isActive });
      load();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const remove = async (p: AdminPromoCode) => {
    if (!confirm(`Delete ${p.code}?`)) return;
    try {
      await api.admin.promoCodes.remove(p.id);
      load();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout
      title="Promo codes"
      subtitle="Discount codes for your store"
      actions={
        <Button size="sm" onClick={() => setShow(true)}>
          <Plus className="h-4 w-4 mr-1" /> New code
        </Button>
      }
    >
      <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFBFF] text-[#9CA3AF] text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Discount</th>
              <th className="text-left px-4 py-3">Min order</th>
              <th className="text-right px-4 py-3">Used</th>
              <th className="text-left px-4 py-3">Active</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[#9CA3AF]">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[#9CA3AF]">No promo codes yet.</td></tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="border-t border-[#F3F4F6] hover:bg-[#FAFBFF]">
                  <td className="px-4 py-3 font-mono text-[#5B4FF9]">{p.code}</td>
                  <td className="px-4 py-3 text-[#111827]">
                    {p.discountType === "percent" ? `${p.discountValue}%` : `Rs ${p.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {p.minOrderAmount ? `Rs ${p.minOrderAmount}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-[#111827]">{p.usageCount}{p.usageLimit ? ` / ${p.usageLimit}` : ""}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(p)}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        p.isActive ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {p.isActive ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(p)} className="text-[#DC2626] hover:text-[#B91C1C] p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {show && <CreateModal onClose={() => setShow(false)} onSaved={() => { setShow(false); load(); }} />}
    </AdminLayout>
  );
}
