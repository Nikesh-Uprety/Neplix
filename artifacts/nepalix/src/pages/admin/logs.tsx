import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type EventItem = { type: string; id: string; label: string; createdAt: string };

export default function AdminLogsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);

  const load = async () => {
    try {
      const data = await api.admin.logs.recent();
      setEvents(data.events);
    } catch (e) {
      toast({ title: "Failed to load logs", description: (e as Error).message, variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AdminLayout title="Security Logs" subtitle="Recent tenant activity feed">
      <div className="space-y-2">
        {events.map((event) => (
          <div key={`${event.type}-${event.id}`} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-[#111827]">{event.label}</p>
            <p className="text-xs text-[#9CA3AF]">
              {event.type} · {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-white p-10 text-center text-sm text-[#9CA3AF] shadow-sm">
            No recent activity.
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
