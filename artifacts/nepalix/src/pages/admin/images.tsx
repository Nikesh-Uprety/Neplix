import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, type AdminMediaAsset } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminImagesPage() {
  const { toast } = useToast();
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const load = async () => {
    try {
      const data = await api.admin.media.listImages();
      setAssets(data.assets);
    } catch (e) {
      toast({ title: "Failed to load assets", description: (e as Error).message, variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AdminLayout title="Image Library" subtitle="Manage tenant media assets">
      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://image-url" />
        <Button
          onClick={async () => {
            try {
              await api.admin.media.createImage({ title, url });
              setTitle("");
              setUrl("");
              await load();
              toast({ title: "Image added" });
            } catch (e) {
              toast({ title: "Failed to add image", description: (e as Error).message, variant: "destructive" });
            }
          }}
        >
          Add Image
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
            <img src={asset.url} alt={asset.title ?? "asset"} className="h-40 w-full rounded object-cover" />
            <p className="mt-2 text-sm font-medium text-[#111827]">{asset.title ?? "Untitled"}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={async () => {
                await api.admin.media.deleteImage(asset.id);
                await load();
              }}
            >
              Delete
            </Button>
          </div>
        ))}
        {assets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-white p-10 text-center text-sm text-[#9CA3AF] shadow-sm md:col-span-2 xl:col-span-3">
            No images in the library yet.
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
