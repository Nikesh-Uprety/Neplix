import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { SectionRenderer } from "@/components/storefront-builder/SectionRenderer";
import type { SectionData } from "@/components/storefront-builder/sections/types";
import { api, type PublicStore, type PublicStorePage, type StoreSettings } from "@/lib/api";
import { StoreLayout } from "@/components/storefront/StoreLayout";

export default function StorePreviewPage() {
  const [matchSlugOnly, slugOnlyParams] = useRoute("/store/:slug");
  const [matchSlugPage, slugPageParams] = useRoute("/store/:slug/:pageSlug");
  const slug = matchSlugPage ? slugPageParams.slug : matchSlugOnly ? slugOnlyParams.slug : "";
  const pageSlug = matchSlugPage ? slugPageParams.pageSlug : null;
  const [store, setStore] = useState<PublicStore | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [pages, setPages] = useState<PublicStorePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    api.stores
      .getPublic(slug)
      .then((response) => {
        if (cancelled) return;
        setStore(response.store);
        setSettings(response.settings);
        setPages(response.pages);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setStore(null);
        setSettings(null);
        setPages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8F7] text-[#6B7280]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#111827]/20 border-t-[#111827] rounded-full animate-spin" />
          <p className="text-sm">Loading storefront…</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8F7] px-6">
        <div className="max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9CA3AF]">
            Store not found
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">
            We couldn&apos;t find this storefront
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            {error ?? "The store slug does not exist or is not currently active."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Nepalix
          </Link>
        </div>
      </div>
    );
  }

  // Extract category from store.settings JSONB (set during onboarding)
  const storeSettingsJson = store.settings as Record<string, unknown> | null;
  const category = (storeSettingsJson?.category as string | undefined) ?? null;

  const activePage =
    pages.find((page) => page.slug === (pageSlug || "home")) ??
    pages.find((page) => page.slug === "home") ??
    pages[0] ??
    null;

  if (!activePage) {
    return (
      <StoreLayout storeName={store.name} settings={settings} category={category}>
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-semibold mb-2">{store.name}</h1>
          <p className="opacity-50">No published pages yet for this storefront.</p>
        </div>
      </StoreLayout>
    );
  }

  const sections = (activePage.sections ?? []) as SectionData[];

  return (
    <StoreLayout storeName={store.name} settings={settings} category={category}>
      {sections.length > 0 ? (
        sections.map((section) => (
          <SectionRenderer key={section.id} section={section} storeSlug={store.slug} />
        ))
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-16 text-center opacity-50">
          This page has no sections yet.
        </div>
      )}
    </StoreLayout>
  );
}
