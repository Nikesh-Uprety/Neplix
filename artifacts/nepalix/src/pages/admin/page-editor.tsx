import { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { SectionRenderer } from "@/components/storefront-builder/SectionRenderer";
import { makeSection } from "@/components/storefront-builder/sections/registry";
import type { SectionData, SectionType } from "@/components/storefront-builder/sections/types";
import { api, type AdminStorefrontPage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const SECTION_TYPES: SectionType[] = [
  "hero",
  "productGrid",
  "imageText",
  "testimonials",
  "newsletter",
  "features",
];

export default function AdminPageEditor() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/admin/page-editor/:id");
  const pageId = match ? params.id : "";
  const [page, setPage] = useState<AdminStorefrontPage | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; pageTitle: string }>>([]);
  const [storeSlug, setStoreSlug] = useState<string | undefined>(undefined);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [linkOptions, setLinkOptions] = useState<
    Array<{ label: string; url: string; group?: "page" | "product" | "custom" }>
  >([]);

  useEffect(() => {
    if (!pageId) return;
    (async () => {
      try {
        const [result, templateResult] = await Promise.all([
          api.admin.landing.getPage(pageId),
          api.admin.landing.listTemplates(),
        ]);
        setPage(result.page);
        setSections((result.page.sections as SectionData[]) ?? []);
        setTemplates(templateResult.templates);
        const [me, myStores] = await Promise.all([api.auth.me(), api.stores.listMine()]);
        const active = myStores.stores.find((s) => s.id === me.user.activeStoreId) ?? myStores.stores[0];
        const activeSlug = active?.slug;
        setStoreSlug(activeSlug);
        if (activeSlug) {
          const [publicStore, products] = await Promise.all([
            api.stores.getPublic(activeSlug),
            api.stores.getPublicProducts(activeSlug, []),
          ]);
          const pageLinks = (publicStore.pages ?? []).map((pageItem) => ({
            label: `Page: ${pageItem.title}`,
            url: `/store/${activeSlug}/${pageItem.slug}`,
            group: "page" as const,
          }));
          const productLinks = (products.products ?? []).map((productItem) => ({
            label: `Product: ${productItem.name}`,
            url: `/product/${productItem.id}`,
            group: "product" as const,
          }));
          setLinkOptions([...pageLinks, ...productLinks]);
        } else {
          setLinkOptions([]);
        }
      } catch (e) {
        toast({
          title: "Failed to load page",
          description: (e as Error).message,
          variant: "destructive",
        });
      }
    })();
  }, [pageId, toast]);

  const canSave = useMemo(() => Boolean(page), [page]);

  function updateSection(id: string, props: Record<string, unknown>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, props } : s)));
  }

  function moveByDrag(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setSections((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  }

  async function save() {
    if (!page) return;
    setSaving(true);
    try {
      await api.admin.landing.updatePage(page.id, { sections, content: { schemaVersion: 1 } });
      toast({ title: "Page saved", description: "Sections updated successfully." });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File): Promise<string> {
    const b64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = String(reader.result ?? "");
        const base64 = data.includes(",") ? data.split(",")[1] || "" : "";
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Unable to read image"));
      reader.readAsDataURL(file);
    });
    const uploaded = await api.admin.media.upload({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      dataBase64: b64,
      isStorefront: true,
      title: file.name,
    });
    return uploaded.url;
  }

  return (
    <AdminLayout title="Page Editor" subtitle="Edit and reorder storefront sections">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => setLocation("/admin/landing-page")}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          {page &&
            templates.map((template) => (
              <Button
                key={template.id}
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const applied = await api.admin.landing.applyTemplate({
                      pageId: page.id,
                      templateId: template.id,
                    });
                    setPage(applied.page);
                    setSections((applied.page.sections as SectionData[]) ?? []);
                    toast({
                      title: "Template applied",
                      description: `${template.name} applied to this page.`,
                    });
                  } catch (e) {
                    toast({
                      title: "Failed to apply template",
                      description: (e as Error).message,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Apply {template.name}
              </Button>
            ))}
          {SECTION_TYPES.map((type) => (
            <Button key={type} size="sm" variant="secondary" onClick={() => setSections((p) => [...p, makeSection(type)])}>
              + {type}
            </Button>
          ))}
          <Button disabled={!canSave || saving} onClick={save}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="rounded-2xl border border-white/10 p-3 bg-[#0B1020]"
            draggable
            onDragStart={() => setDraggingIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggingIndex === null) return;
              moveByDrag(draggingIndex, index);
              setDraggingIndex(null);
            }}
            onDragEnd={() => setDraggingIndex(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wide text-gray-400">{section.type}</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 px-2 py-1 border border-white/10 rounded">
                  Drag to reorder
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setSections((prev) => prev.filter((s) => s.id !== section.id))}
                >
                  Delete
                </Button>
              </div>
            </div>
            <SectionRenderer
              section={section}
              isEditing
              storeSlug={storeSlug}
              onUploadImage={uploadImage}
              linkOptions={linkOptions}
              onUpdate={(nextProps) => updateSection(section.id, nextProps)}
            />
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
