import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";

export default function AdminPlatformSubscriptionsPage() {
  const subscriptions = useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => api.admin.listSubscriptions({ limit: 100 }),
  });

  return (
    <AdminLayout
      title="Platform Subscriptions"
      subtitle="Monitor status across all store subscriptions"
    >
      <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFBFF] text-[#9CA3AF] text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Trial Ends</th>
              <th className="px-4 py-3 text-left">Current Period End</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#9CA3AF]">
                  Loading subscriptions...
                </td>
              </tr>
            ) : (subscriptions.data?.subscriptions ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#9CA3AF]">
                  No subscriptions found.
                </td>
              </tr>
            ) : (
              (subscriptions.data?.subscriptions ?? []).map((subscription) => (
                <tr key={subscription.id} className="border-t border-[#F3F4F6] hover:bg-[#FAFBFF]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#111827]">{subscription.userEmail ?? "Unknown user"}</div>
                    <div className="text-xs text-[#9CA3AF]">{subscription.id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-[#111827]">
                    {subscription.planSlug ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F3F0FF] text-[#5B4FF9] capitalize">
                      {subscription.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {subscription.trialEndsAt
                      ? new Date(subscription.trialEndsAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {subscription.currentPeriodEnd
                      ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                      : "—"}
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
