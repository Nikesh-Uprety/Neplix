import { useEffect, useState } from "react";
import { Minus, Plus, AlertTriangle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api, type AdminInventoryItem } from "@/lib/api";

export default function AdminInventory() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminInventoryItem[]>([]);
  const [low, setLow] = useState<AdminInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([api.admin.inventory.list(), api.admin.inventory.lowStock(10)]);
      setItems(a.items);
      setLow(b.items);
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const adjust = async (id: string, delta: number) => {
    try {
      const { product } = await api.admin.inventory.adjust(id, delta);
      setItems((arr) => arr.map((i) => (i.id === id ? { ...i, stock: product.stock } : i)));
      setLow((arr) => arr.filter((i) => i.id !== id || product.stock <= 10));
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout title="Inventory" subtitle="Stock levels across your catalog">
      {low.length > 0 && (
        <div className="mb-6 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
          <div className="flex items-center gap-2 text-[#B45309] mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{low.length} item{low.length === 1 ? "" : "s"} low on stock</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {low.slice(0, 8).map((i) => (
              <span key={i.id} className="px-2.5 py-1 rounded-full bg-white text-xs text-[#374151] border border-[#F3F4F6]">
                {i.name} <span className="text-[#B45309] ml-1">· {i.stock}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFBFF] text-[#9CA3AF] text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-center px-4 py-3">Stock</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-[#9CA3AF]">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-[#9CA3AF]">No products yet.</td></tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="border-t border-[#F3F4F6] hover:bg-[#FAFBFF]">
                  <td className="px-4 py-3 text-[#111827] font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{p.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-[#111827] font-medium">Rs {p.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={p.stock < 5 ? "text-[#DC2626] font-semibold" : p.stock < 10 ? "text-[#D97706]" : "text-[#374151]"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => adjust(p.id, -1)} disabled={p.stock <= 0}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => adjust(p.id, +1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="ml-1" onClick={() => adjust(p.id, +10)}>
                      +10
                    </Button>
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
