import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api, type AdminNotification } from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  info: "bg-[#DBEAFE] text-[#1D4ED8]",
  success: "bg-[#DCFCE7] text-[#15803D]",
  warning: "bg-[#FEF3C7] text-[#B45309]",
  error: "bg-[#FEE2E2] text-[#DC2626]",
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const r = await api.admin.notifications.list();
      setItems(r.notifications);
      setUnread(r.unread);
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const markAll = async () => {
    await api.admin.notifications.markAllRead();
    load();
  };
  const markOne = async (id: string) => {
    await api.admin.notifications.markRead(id);
    load();
  };

  return (
    <AdminLayout
      title="Notifications"
      subtitle={`${unread} unread`}
      actions={
        unread > 0 ? (
          <Button size="sm" variant="outline" onClick={markAll}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        ) : null
      }
    >
      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-[#9CA3AF] py-10 text-center">Loading…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-[#9CA3AF] shadow-sm">
            <Bell className="h-6 w-6 mx-auto mb-2 opacity-60" />
            You're all caught up.
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border border-[#E5E7EB] bg-white p-4 flex items-start gap-3 shadow-sm ${
                n.isRead ? "opacity-60" : ""
              }`}
            >
              <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${TYPE_COLORS[n.type] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                {n.type}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#111827]">{n.title}</div>
                {n.body && <div className="text-xs text-[#6B7280] mt-0.5">{n.body}</div>}
                <div className="text-[11px] text-[#9CA3AF] mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => markOne(n.id)}
                  className="text-xs text-[#5B4FF9] hover:text-[#4338CA]"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
