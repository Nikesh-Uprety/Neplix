import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { api, type AdminStorefrontPage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminCanvasPage() {
  const { toast } = useToast();
  const [pages, setPages] = useState<AdminStorefrontPage[]>([]);
  const [selected, setSelected] = useState<AdminStorefrontPage | null>(null);
  const [rawContent, setRawContent] = useState("{}");

  const load = async () => {
    try {
      const data = await api.admin.landing.listPages();
      setPages(data.pages);
      if (!selected && data.pages.length > 0) {
        setSelected(data.pages[0]);
        setRawContent(JSON.stringify(data.pages[0].content ?? {}, null, 2));
      }
    } catch (e) {
      toast({ title: "Failed to load canvas pages", description: (e as Error).message, variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AdminLayout title="Canvas Builder" subtitle="Edit page JSON blocks quickly">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase text-[#9CA3AF]">Pages</h3>
          <div className="space-y-2">
            {pages.map((page) => (
              <button
                key={page.id}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  selected?.id === page.id
                    ? "bg-[#EEF2FF] text-[#4338CA] font-medium"
                    : "bg-[#F9FAFB] text-[#4B5563] hover:bg-[#F3F4F6]"
                }`}
                onClick={() => {
                  setSelected(page);
                  setRawContent(JSON.stringify(page.content ?? {}, null, 2));
                }}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            className="h-[55vh] w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 font-mono text-xs text-[#111827]"
          />
          <div className="mt-3">
            <Button
              disabled={!selected}
              onClick={async () => {
                if (!selected) return;
                try {
                  const content = JSON.parse(rawContent);
                  await api.admin.landing.updatePage(selected.id, { content });
                  toast({ title: "Canvas content saved" });
                  await load();
                } catch (e) {
                  toast({ title: "Invalid JSON or save failed", description: (e as Error).message, variant: "destructive" });
                }
              }}
            >
              Save Canvas JSON
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
