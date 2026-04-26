import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SectionComponentProps } from "./types";
import { LinkAutocompleteInput } from "../LinkAutocompleteInput";

type PublicProduct = {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  images: Array<{ id: string; url: string; isPrimary: boolean }>;
  variants: Array<{ id: string; price: number; stock: number; isActive: boolean }>;
};

function formatNpr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProductPlaceholder({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center gap-3"
      style={{ backgroundColor: "var(--sf-card, rgba(255,255,255,0.06))" }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.18 }}
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <span
        className="text-2xl font-bold"
        style={{ opacity: 0.18, color: "var(--sf-text, #E2E8F0)" }}
      >
        {initial}
      </span>
    </div>
  );
}

export function ProductGridSection({
  data,
  isEditing,
  onUpdate,
  storeSlug,
  linkOptions,
}: SectionComponentProps) {
  const title = String(data.props.title ?? "Featured Products");
  const productIds = Array.isArray(data.props.productIds)
    ? (data.props.productIds as string[])
    : [];
  const productLinks = Array.isArray(data.props.productLinks)
    ? (data.props.productLinks as string[])
    : [];
  const [products, setProducts] = useState<PublicProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (isEditing || !storeSlug || productIds.length === 0) {
      setProducts([]);
      return;
    }
    api.stores
      .getPublicProducts(storeSlug, productIds)
      .then((result) => {
        if (!cancelled) setProducts(result.products as PublicProduct[]);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isEditing, productIds.join(","), storeSlug]);

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      {/* Section heading */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight outline-none"
            style={{ color: "var(--sf-text, #E2E8F0)" }}
            contentEditable={Boolean(isEditing)}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate?.({ ...data.props, title: e.currentTarget.textContent ?? "" })}
          >
            {title}
          </h2>
          <div
            className="mt-2 h-0.5 w-12 rounded-full"
            style={{ backgroundColor: "var(--sf-accent, #6366F1)" }}
          />
        </div>
        {!isEditing && (
          <a
            href="/products"
            className="text-sm font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-70 flex-shrink-0"
            style={{ color: "var(--sf-accent, #6366F1)" }}
          >
            View all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        )}
      </div>

      {/* Edit controls */}
      {isEditing && (
        <div className="mb-6 space-y-3 p-4 rounded-xl bg-black/10 border border-white/10">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Product IDs (comma separated)</label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-sm text-white"
              value={productIds.join(",")}
              onChange={(e) =>
                onUpdate?.({
                  ...data.props,
                  productIds: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                })
              }
            />
          </div>
          {productIds.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 block mb-1">Product links</label>
              <div className="space-y-2">
                {productIds.map((id, i) => (
                  <div key={`${id}-${i}`} className="grid md:grid-cols-[1fr_2fr] gap-2">
                    <input
                      className="px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-xs text-gray-400"
                      value={id}
                      disabled
                    />
                    <LinkAutocompleteInput
                      value={productLinks[i] ?? ""}
                      onChange={(nextLink) => {
                        const next = [...productLinks];
                        next[i] = nextLink;
                        onUpdate?.({ ...data.props, productLinks: next });
                      }}
                      options={[
                        { label: "This product page", url: `/product/${id}`, group: "product" },
                        ...(linkOptions ?? []),
                      ]}
                      placeholder="Link for this product card"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {isEditing || !storeSlug
          ? productIds.length === 0
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    border: "1px solid var(--sf-border, rgba(255,255,255,0.08))",
                    backgroundColor: "var(--sf-card, rgba(255,255,255,0.04))",
                  }}
                >
                  <div className="aspect-square animate-pulse" style={{ backgroundColor: "var(--sf-border, rgba(255,255,255,0.08))" }} />
                  <div className="p-4 space-y-2">
                    <div className="h-3 rounded-full animate-pulse w-3/4" style={{ backgroundColor: "var(--sf-border, rgba(255,255,255,0.08))" }} />
                    <div className="h-3 rounded-full animate-pulse w-1/3" style={{ backgroundColor: "var(--sf-border, rgba(255,255,255,0.06))" }} />
                  </div>
                </div>
              ))
            : productIds.map((id) => (
                <div
                  key={id}
                  className="rounded-2xl p-4 text-sm"
                  style={{
                    border: "1px solid var(--sf-border, rgba(255,255,255,0.08))",
                    color: "var(--sf-muted, rgba(226,232,240,0.5))",
                  }}
                >
                  Product ID: {id}
                </div>
              ))
          : products.map((product) => {
              const activeVariant = product.variants.find((v) => v.isActive);
              const displayPrice = activeVariant?.price ?? product.price;
              const image = product.images.find((img) => img.isPrimary) ?? product.images[0];
              const link = productLinks[productIds.indexOf(product.id)] ?? "/products";
              const hasDiscount = product.comparePrice && product.comparePrice > displayPrice;
              const discountPct = hasDiscount
                ? Math.round((1 - displayPrice / product.comparePrice!) * 100)
                : 0;

              return (
                <a
                  key={product.id}
                  href={link}
                  className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundColor: "var(--sf-card, rgba(255,255,255,0.06))",
                    border: "1px solid var(--sf-border, rgba(255,255,255,0.08))",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Image container */}
                  <div className="aspect-square relative overflow-hidden">
                    {image ? (
                      <img
                        src={image.url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <ProductPlaceholder name={product.name} />
                    )}

                    {/* Discount badge */}
                    {hasDiscount && (
                      <div
                        className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: "var(--sf-accent, #6366F1)",
                          color: "var(--sf-accent-t, #fff)",
                        }}
                      >
                        -{discountPct}%
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                    >
                      <span
                        className="px-5 py-2.5 rounded-full text-sm font-semibold translate-y-1 group-hover:translate-y-0 transition-transform duration-200"
                        style={{
                          backgroundColor: "var(--sf-accent, #6366F1)",
                          color: "var(--sf-accent-t, #fff)",
                        }}
                      >
                        View Product
                      </span>
                    </div>
                  </div>

                  {/* Product info */}
                  <div className="p-4">
                    <p
                      className="text-sm font-semibold leading-snug truncate"
                      style={{ color: "var(--sf-text, #E2E8F0)" }}
                    >
                      {product.name}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className="text-sm font-bold"
                        style={{ color: "var(--sf-accent, #6366F1)" }}
                      >
                        {formatNpr(displayPrice)}
                      </span>
                      {hasDiscount && (
                        <span
                          className="text-xs line-through"
                          style={{ color: "var(--sf-muted, rgba(226,232,240,0.4))" }}
                        >
                          {formatNpr(product.comparePrice!)}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
      </div>
    </section>
  );
}
