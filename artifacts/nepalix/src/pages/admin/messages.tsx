import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { api, type ContactMessage } from "@/lib/api";

export default function AdminMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.contact
      .list()
      .then((r) => setMessages(r.messages))
      .catch((e) => toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <AdminLayout title="Messages" subtitle="Inbound contact form messages">
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-[#9CA3AF] py-10 text-center">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-[#9CA3AF] shadow-sm">
            No messages yet.
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-sm text-[#111827]">{m.subject}</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    {m.name} · <span className="text-[#9CA3AF]">{m.email}</span>
                  </div>
                </div>
                <span className="text-[11px] text-[#9CA3AF]">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-[#374151] mt-3 whitespace-pre-wrap">{m.message}</p>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
