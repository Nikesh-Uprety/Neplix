import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, type AdminMediaBucket } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminBucketsPage() {
  const { toast } = useToast();
  const [buckets, setBuckets] = useState<AdminMediaBucket[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const load = async () => {
    try {
      const data = await api.admin.media.listBuckets();
      setBuckets(data.buckets);
    } catch (e) {
      toast({ title: "Failed to load buckets", description: (e as Error).message, variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AdminLayout title="Media Buckets" subtitle="Manage folder taxonomy for assets">
      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bucket name" />
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="bucket-slug" />
        <Button
          onClick={async () => {
            try {
              await api.admin.media.createBucket({ name, slug });
              setName("");
              setSlug("");
              await load();
            } catch (e) {
              toast({ title: "Failed to create bucket", description: (e as Error).message, variant: "destructive" });
            }
          }}
        >
          Create Bucket
        </Button>
      </div>
      <div className="space-y-2">
        {buckets.map((bucket) => (
          <div key={bucket.id} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-[#111827]">{bucket.name}</p>
            <p className="text-xs text-[#9CA3AF]">{bucket.slug}</p>
          </div>
        ))}
        {buckets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-white p-10 text-center text-sm text-[#9CA3AF] shadow-sm">
            No media buckets created yet.
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
