import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";

export default function AdminPlatformFeatureFlagsPage() {
  const flags = useQuery({
    queryKey: ["admin", "feature-flags"],
    queryFn: () => api.admin.featureFlags(),
  });

  return (
    <AdminLayout
      title="Feature Flags"
      subtitle="Current platform feature gate values from the server environment"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(flags.data?.flags ?? {}).map(([name, enabled]) => (
          <div
            key={name}
            className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#111827]">{name}</p>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Server-side toggle read from the current environment.
                </p>
              </div>
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                  enabled
                    ? "bg-[#DCFCE7] text-[#15803D]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        ))}

        {flags.isLoading ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-sm text-[#9CA3AF] shadow-sm md:col-span-2">
            Loading feature flags...
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
