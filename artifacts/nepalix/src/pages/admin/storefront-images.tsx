import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api, type AdminMediaAsset } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminStorefrontImagesPage() {
  const { toast } = useToast();
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);

  useEffect(() => {
    api.admin.media
      .listStorefrontImages()
      .then((r) => setAssets(r.assets))
      .catch((e) =>
        toast({ title: "Failed to load storefront images", description: (e as Error).message, variant: "destructive" }),
      );
  }, [toast]);

  return (
    <AdminLayout title="Storefront Images" subtitle="Assets marked for storefront use">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
            <img src={asset.url} alt={asset.title ?? "asset"} className="h-40 w-full rounded object-cover" />
            <p className="mt-2 text-sm font-medium text-[#111827]">{asset.title ?? "Untitled"}</p>
          </div>
        ))}
        {assets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-white p-10 text-center text-sm text-[#9CA3AF] shadow-sm md:col-span-2 xl:col-span-3">
            No storefront assets yet.
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
