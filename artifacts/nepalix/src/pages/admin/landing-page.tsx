import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Coffee, Croissant, Shirt, Sparkles } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, type AdminStorefrontPage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const TEMPLATE_PREVIEWS = [
  {
    name: "North Atelier",
    category: "Streetwear & Outerwear",
    palette: "from-[#2C3440] via-[#1F2937] to-[#111827]",
    accent: "bg-white text-[#111827]",
    icon: Shirt,
    blurb: "Minimal editorial storefront with strong campaign imagery, monochrome product grids, and premium storytelling blocks.",
  },
  {
    name: "Maison Noir",
    category: "Luxury Fashion",
    palette: "from-[#1A1A1A] via-[#2A2A28] to-[#3B3B3B]",
    accent: "bg-[#F7F5F2] text-[#1A1A1A]",
    icon: Sparkles,
    blurb: "Runway-inspired luxury template with split-screen hero layouts, serif typography, and crisp editorial merchandising.",
  },
  {
    name: "Himalayan Brew",
    category: "Cafe & Bakery",
    palette: "from-[#FBF8F3] via-[#F3E7D6] to-[#E6D4BE]",
    accent: "bg-[#8B5E3C] text-white",
    icon: Coffee,
    blurb: "Warm coffeehouse system built for beans, pastries, subscriptions, and same-day local delivery storytelling.",
  },
];

export default function AdminLandingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [pages, setPages] = useState<AdminStorefrontPage[]>([]);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; pageTitle: string }>>([]);
  const [slug, setSlug] = useState("home");
  const [title, setTitle] = useState("Home");

  const load = async () => {
    try {
      const [data, templateData] = await Promise.all([
        api.admin.landing.listPages(),
        api.admin.landing.listTemplates(),
      ]);
      setPages(data.pages);
      setTemplates(templateData.templates);
    } catch (e) {
      toast({ title: "Failed to load pages", description: (e as Error).message, variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AdminLayout title="Landing Page Manager" subtitle="Manage storefront pages and publish state">
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9CA3AF] mb-2">
                Storefront Concepts
              </p>
              <h2 className="text-2xl font-semibold text-[#111827] tracking-tight">
                Design directions from the Nepalix storefront prototype
              </h2>
            </div>
            <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B4FF9]">
              <Croissant className="h-5 w-5" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {TEMPLATE_PREVIEWS.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.name}
                  className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD]"
                >
                  <div className={`h-40 bg-gradient-to-br ${template.palette} p-4`}>
                    <div className="flex h-full flex-col justify-between rounded-[20px] border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${template.accent}`}>
                          {template.category}
                        </span>
                        <Icon className="h-4 w-4 text-white/80" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">{template.name}</p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="h-12 rounded-xl bg-white/20" />
                          <div className="h-12 rounded-xl bg-white/15" />
                          <div className="h-12 rounded-xl bg-white/10" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-[#111827]">{template.name}</p>
                    <p className="mt-1 text-xs leading-5 text-[#6B7280]">{template.blurb}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9CA3AF] mb-2">
            Recommended Setup
          </p>
          <h2 className="text-xl font-semibold text-[#111827] tracking-tight mb-3">
            Cafe and bakery stores should start from Himalayan Brew
          </h2>
          <p className="text-sm leading-6 text-[#6B7280] mb-4">
            The storefront prototype already includes a warm cafe-and-bakery direction with menu calls, bakery sections, delivery messaging, and subscription-friendly merchandising.
          </p>
          <div className="rounded-2xl border border-[#EADAC8] bg-[#FBF8F3] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B5E3C] mb-2">
              Best fit for your test stores
            </p>
            <div className="space-y-2 text-sm text-[#4B5563]">
              <p>Himalayan Brew Cafe: use the coffee-led hero and featured beans sections.</p>
              <p>Himalayan Brew Bakery: emphasize bakery favorites, daily bakes, and local delivery CTAs.</p>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#8B5E3C]">
              Use Canvas Builder to adapt page JSON
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
              Quick Apply Template
            </p>
            <div className="grid gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  onClick={async () => {
                    try {
                      await api.admin.landing.applyTemplate({
                        templateId: template.id,
                        slug: "home",
                      });
                      await load();
                      toast({ title: "Template applied", description: `${template.name} is ready in draft.` });
                    } catch (e) {
                      toast({
                        title: "Template apply failed",
                        description: (e as Error).message,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Use {template.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" />
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <Button
          onClick={async () => {
            try {
              await api.admin.landing.createPage({ slug, title, content: { blocks: [] } });
              await load();
            } catch (e) {
              toast({ title: "Failed to create page", description: (e as Error).message, variant: "destructive" });
            }
          }}
        >
          Create Page
        </Button>
      </div>

      <div className="space-y-2">
        {pages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-white p-10 text-center text-sm text-[#9CA3AF] shadow-sm">
            No storefront pages created yet.
          </div>
        ) : null}
        {pages.map((page) => (
          <div key={page.id} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-sm font-medium text-[#111827]">{page.title}</p>
              <p className="text-xs text-[#9CA3AF]">/{page.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setLocation(`/admin/page-editor/${page.id}`)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant={page.isPublished ? "secondary" : "outline"}
                onClick={async () => {
                  await api.admin.landing.updatePage(page.id, { isPublished: !page.isPublished });
                  await load();
                }}
              >
                {page.isPublished ? "Published" : "Publish"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
