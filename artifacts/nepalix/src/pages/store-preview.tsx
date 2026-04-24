import { Coffee, Croissant, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { api, type PublicStore, type PublicStorePage } from "@/lib/api";

type StoreTheme = "brew-cafe" | "brew-bakery" | "north-default";

function detectTheme(store: PublicStore | null): StoreTheme {
  const fingerprint = `${store?.slug ?? ""} ${store?.name ?? ""}`.toLowerCase();
  if (fingerprint.includes("bakery")) return "brew-bakery";
  if (fingerprint.includes("cafe") || fingerprint.includes("brew")) return "brew-cafe";
  return "north-default";
}

function PlaceholderBlock({
  label,
  tint,
}: {
  label: string;
  tint: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${tint}`}>
      <div className="aspect-[4/5] w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.34),transparent_34%)]" />
      <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4B5563] backdrop-blur">
        {label}
      </div>
    </div>
  );
}

function CafeBakeryPreview({
  store,
  pages,
  theme,
}: {
  store: PublicStore;
  pages: PublicStorePage[];
  theme: StoreTheme;
}) {
  const isBakery = theme === "brew-bakery";
  const heroTitle = isBakery
    ? "Small-batch breads,\nbaked fresh\nevery morning."
    : "Craft coffee,\nbrewed bold\nevery day.";
  const heroCopy = isBakery
    ? "A warm neighborhood bakery with laminated pastries, daily loaves, and soft, inviting merchandising."
    : "A warm neighborhood cafe with single-origin beans, seasonal drinks, and a pastry counter that feels alive.";
  const highlightLabel = isBakery ? "Fresh out of the oven" : "Roasted in Kathmandu";
  const productHeading = isBakery ? "Bakery Favorites" : "Featured Coffee";
  const cardNames = isBakery
    ? ["Sourdough Country Loaf", "Honey Butter Croissant", "Walnut Babka", "Cardamom Morning Bun"]
    : ["Himalayan Dark Roast", "Sunrise Espresso Blend", "Cloud Nine Pour Over", "Sherpa Cold Brew"];
  const activeHomePage = pages.find((page) => page.slug === "home") ?? pages[0] ?? null;

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#2C2218]">
      <header className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-5">
        <nav className="hidden items-center gap-7 sm:flex">
          <a className="cursor-pointer text-[13px] font-medium text-[#2C2218]">Menu</a>
          <a className="cursor-pointer text-[13px] font-medium text-[#9C8C7A] transition-colors hover:text-[#2C2218]">Story</a>
          <a className="cursor-pointer text-[13px] font-medium text-[#9C8C7A] transition-colors hover:text-[#2C2218]">Visit</a>
        </nav>
        <div className="text-center">
          <p className="font-sora text-xl font-bold uppercase tracking-[0.15em] text-[#2C2218]">
            {store.name}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[#9C8C7A]">
            Powered by Nepalix
          </p>
        </div>
        <div className="flex items-center gap-4 text-[#9C8C7A]">
          <Search className="h-4 w-4" />
          <User className="hidden h-4 w-4 sm:block" />
          <ShoppingBag className="h-4 w-4" />
        </div>
      </header>

      <section className="mx-auto mb-16 grid max-w-screen-xl gap-6 px-6 sm:grid-cols-2 sm:items-center">
        <div className="py-8 sm:py-16">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#9C8C7A]">
            {highlightLabel}
          </p>
          <h1 className="whitespace-pre-line font-playfair text-4xl font-medium leading-[1.05] text-[#2C2218] sm:text-6xl">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#7A6E60]">
            {heroCopy}
          </p>
          <div className="mt-6 flex gap-3">
            <button className="rounded-full bg-[#8B5E3C] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-[#7A5035]">
              Order Now
            </button>
            <button className="rounded-full border border-[#C9BDA8] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#2C2218] transition-all hover:bg-[#EDE8DF]">
              Explore Menu
            </button>
          </div>
          {activeHomePage ? (
            <div className="mt-6 rounded-2xl border border-[#EADAC8] bg-white/80 p-4 text-sm text-[#6B7280] shadow-sm">
              <p className="font-medium text-[#2C2218]">{activeHomePage.title}</p>
              <p className="mt-1">
                Published page ready at <span className="font-semibold text-[#8B5E3C]">/{activeHomePage.slug}</span>
              </p>
            </div>
          ) : null}
        </div>
        <div className="relative">
          <PlaceholderBlock
            label={isBakery ? "Bakery Interior" : "Coffeehouse Hero"}
            tint="bg-[linear-gradient(135deg,#EDE8DF,#F7F1E8)]"
          />
          <div className="absolute bottom-6 left-6 rounded-xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C]">
              {isBakery ? "Daily bake schedule" : "Signature roast"}
            </p>
            <p className="mt-1 text-xs text-[#7A6E60]">
              {isBakery ? "6 AM oven start · 9 AM pastry drop" : "Medium-dark profile · same-day delivery"}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-16 grid max-w-screen-xl gap-4 px-6 sm:grid-cols-4">
        {[
          {
            icon: isBakery ? Croissant : Coffee,
            title: isBakery ? "Baked Fresh" : "Single Origin",
            desc: isBakery ? "Proofed and baked in-house each morning" : "Ethically sourced from Nepal highlands",
          },
          {
            icon: Coffee,
            title: isBakery ? "Coffee Pairings" : "Seasonal Drinks",
            desc: isBakery ? "Curated with espresso and tea service" : "Rotating specials and comforting classics",
          },
          {
            icon: Croissant,
            title: isBakery ? "Pastry Counter" : "Bakery Program",
            desc: isBakery ? "Croissants, buns, babka, and more" : "Pastries baked daily to match the drinks menu",
          },
          {
            icon: ShoppingBag,
            title: "Local Delivery",
            desc: "Quick Kathmandu Valley dispatch for fresh orders",
          },
        ].map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="rounded-xl border border-[#EDE8DF] bg-white p-5 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FBF3EA] text-[#8B5E3C]">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-[#2C2218]">{feature.title}</p>
              <p className="mt-1 text-[11px] text-[#9C8C7A]">{feature.desc}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto mb-20 max-w-screen-xl px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#9C8C7A]">
              {isBakery ? "From the Oven" : "Our Beans"}
            </p>
            <h2 className="font-playfair text-2xl font-medium text-[#2C2218]">
              {productHeading}
            </h2>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-4">
          {cardNames.map((name) => (
            <div key={name}>
              <PlaceholderBlock
                label={isBakery ? "Fresh Batch" : "Coffee Pack"}
                tint="bg-[linear-gradient(135deg,#F4EDE3,#E8DACA)]"
              />
              <p className="mt-3 text-sm font-medium text-[#2C2218]">{name}</p>
              <p className="mt-1 text-sm font-semibold text-[#8B5E3C]">
                Rs. {isBakery ? "250" : "750"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-16 max-w-screen-xl px-6">
        <div className="rounded-2xl border border-[#EADAC8] bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9C8C7A]">
            Preview Route
          </p>
          <h3 className="mt-2 font-playfair text-3xl font-medium text-[#2C2218]">
            {store.name} is live at <span className="text-[#8B5E3C]">/store/{store.slug}</span>
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]">
            This preview uses the Himalyan Brew storefront direction from the prototype and can be further customized from the admin landing and canvas tools.
          </p>
        </div>
      </section>
    </div>
  );
}

function DefaultStorePreview({ store, pages }: { store: PublicStore; pages: PublicStorePage[] }) {
  return (
    <div className="min-h-screen bg-[#F8F8F7] text-[#111827]">
      <div className="mx-auto max-w-screen-xl px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9CA3AF]">
          Nepalix Storefront Preview
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">{store.name}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B7280]">
          Public storefront route is working for this store. A dedicated template has not been assigned yet, so this page is showing the neutral preview shell.
        </p>
        <div className="mt-10 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#111827]">Store slug</p>
          <p className="mt-1 text-sm text-[#6B7280]">/store/{store.slug}</p>
          <p className="mt-4 text-sm font-medium text-[#111827]">Published pages</p>
          <div className="mt-2 space-y-2">
            {pages.length > 0 ? (
              pages.map((page) => (
                <div key={page.id} className="rounded-xl border border-[#F3F4F6] bg-[#FCFCFD] px-4 py-3 text-sm text-[#4B5563]">
                  {page.title} <span className="text-[#9CA3AF]">/{page.slug}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#9CA3AF]">No published pages yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StorePreviewPage() {
  const [, params] = useRoute("/store/:slug");
  const slug = params?.slug ?? "";
  const [store, setStore] = useState<PublicStore | null>(null);
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
        setPages(response.pages);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setStore(null);
        setPages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const theme = useMemo(() => detectTheme(store), [store]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8F7] text-[#6B7280]">
        Loading storefront preview…
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8F7] px-6">
        <div className="max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9CA3AF]">Store not found</p>
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

  if (theme === "brew-cafe" || theme === "brew-bakery") {
    return <CafeBakeryPreview store={store} pages={pages} theme={theme} />;
  }

  return <DefaultStorePreview store={store} pages={pages} />;
}
