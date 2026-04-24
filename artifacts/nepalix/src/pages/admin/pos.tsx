import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Product = { id: string; name: string; price: number; stock: number; sku: string | null };

export default function AdminPosPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Array<{ product: Product; qty: number }>>([]);
  const [tax, setTax] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.admin.pos.products();
      setProducts(data.products);
    } catch (e) {
      toast({ title: "Failed to load POS products", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const subtotal = useMemo(
    () => cart.reduce((sum, row) => sum + row.product.price * row.qty, 0),
    [cart],
  );
  const total = subtotal + tax;

  return (
    <AdminLayout title="Point of Sale" subtitle="Create walk-in orders and take payments">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-[#111827]">Products</h2>
          <div className="max-h-[55vh] space-y-2 overflow-auto">
            {loading ? <p className="text-sm text-[#9CA3AF]">Loading...</p> : null}
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  setCart((old) => {
                    const idx = old.findIndex((item) => item.product.id === p.id);
                    if (idx === -1) return [...old, { product: p, qty: 1 }];
                    const next = [...old];
                    next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
                    return next;
                  })
                }
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#FCFCFD] px-3 py-3 text-left hover:bg-[#F9FAFB] transition-colors"
              >
                <p className="text-sm font-medium text-[#111827]">{p.name}</p>
                <p className="text-xs text-[#6B7280]">Rs {p.price.toLocaleString()} · Stock {p.stock}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-[#111827]">Cart</h2>
          <div className="space-y-2">
            {cart.length === 0 ? <p className="text-sm text-[#9CA3AF]">No items yet.</p> : null}
            {cart.map((row) => (
              <div key={row.product.id} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#FCFCFD] px-3 py-3">
                <div>
                  <p className="text-sm font-medium text-[#111827]">{row.product.name}</p>
                  <p className="text-xs text-[#6B7280]">Rs {row.product.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setCart((old) =>
                        old
                          .map((x) => (x.product.id === row.product.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))
                          .filter((x) => x.qty > 0),
                      )
                    }
                  >
                    -
                  </Button>
                  <span className="w-6 text-center text-sm text-[#111827]">{row.qty}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setCart((old) =>
                        old.map((x) => (x.product.id === row.product.id ? { ...x, qty: x.qty + 1 } : x)),
                      )
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-xs text-[#6B7280]">Tax (NPR)</label>
            <Input type="number" value={tax} onChange={(e) => setTax(Number(e.target.value || 0))} />
            <p className="text-sm text-[#6B7280]">Subtotal: Rs {subtotal.toLocaleString()}</p>
            <p className="text-base font-semibold text-[#111827]">Total: Rs {total.toLocaleString()}</p>
            <Button
              disabled={cart.length === 0 || saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await api.admin.pos.checkout({
                    tax,
                    items: cart.map((c) => ({
                      productId: c.product.id,
                      name: c.product.name,
                      price: c.product.price,
                      quantity: c.qty,
                    })),
                  });
                  toast({ title: "POS order created" });
                  setCart([]);
                  setTax(0);
                  await load();
                } catch (e) {
                  toast({ title: "Checkout failed", description: (e as Error).message, variant: "destructive" });
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Processing..." : "Checkout"}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
