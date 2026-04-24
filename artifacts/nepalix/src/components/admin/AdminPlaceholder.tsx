import { AdminLayout } from "@/components/admin/AdminLayout";

export function AdminPlaceholder({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <AdminLayout title={title} subtitle={subtitle}>
      <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-8">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/70">{description}</p>
      </div>
    </AdminLayout>
  );
}
