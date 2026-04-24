import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AdminPlatformSupportPage() {
  return (
    <AdminLayout
      title="Support Tickets"
      subtitle="Platform support queue and escalation monitoring"
    >
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#111827]">Support Queue</p>
          <div className="mt-4 space-y-3">
            {[
              {
                title: "No platform tickets wired yet",
                body: "The superadmin support route now works, but there is no dedicated support-ticket backend model in this repo yet.",
              },
              {
                title: "Recommended next step",
                body: "If you want, I can build a proper support ticket system next so this page becomes fully functional instead of informational.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-[#F3F4F6] bg-[#FCFCFD] px-4 py-3"
              >
                <p className="text-sm font-medium text-[#111827]">{item.title}</p>
                <p className="mt-1 text-sm text-[#6B7280]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#111827]">Operational Checklist</p>
          <div className="mt-4 space-y-2 text-sm text-[#4B5563]">
            {[
              "Review suspended stores and follow up on billing issues",
              "Check trial stores that need onboarding assistance",
              "Audit feature flags before enabling tenant-wide rollouts",
              "Keep a human escalation path ready for payment and auth failures",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-[#F3F4F6] bg-[#FAFBFF] px-4 py-3"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
