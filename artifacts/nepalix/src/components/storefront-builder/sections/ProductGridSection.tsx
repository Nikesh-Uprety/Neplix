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
        if (!cancelled) {
          setProducts(result.products as PublicProduct[]);
        }
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isEditing, productIds.join(","), storeSlug]);

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2
        className="text-2xl font-bold mb-6 outline-none"
        contentEditable={Boolean(isEditing)}
        suppressContentEditableWarning
        onBlur={(e) => onUpdate?.({ ...data.props, title: e.currentTarget.textContent ?? "" })}
      >
        {title}
      </h2>
      {isEditing && (
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-1">Product IDs (comma separated)</label>
          <input
            className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-sm text-white"
            value={productIds.join(",")}
            onChange={(e) =>
              onUpdate?.({
                ...data.props,
                productIds: e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
          />
          <label className="text-xs text-gray-400 block mt-3 mb-1">Product links (per product)</label>
          <div className="space-y-2">
            {productIds.map((id, i) => (
              <div key={`${id}-${i}`} className="grid md:grid-cols-[1fr_1fr_1fr] gap-2">
                <input
                  className="px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-xs text-gray-300"
                  value={id}
                  disabled
                />
                <div className="md:col-span-2">
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
                    placeholder="Search page/product link for this card"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isEditing || !storeSlug
          ? productIds.length === 0
          ? [0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-black/10 bg-black/5 overflow-hidden">
                <div className="aspect-square bg-black/5 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 rounded bg-black/10 w-2/3 animate-pulse" />
                  <div className="h-3 rounded bg-black/8 w-1/3 animate-pulse" />
                </div>
              </div>
            ))
          : productIds.map((id) => (
              <div key={id} className="rounded-2xl border border-black/10 p-4 bg-black/5 text-sm opacity-60">
                Product ID: {id}
              </div>
            ))
          : products.map((product) => {
              const activeVariant = product.variants.find((v) => v.isActive);
              const displayPrice = activeVariant?.price ?? product.price;
              const image = product.images.find((img) => img.isPrimary) ?? product.images[0];
              const link = productLinks[productIds.indexOf(product.id)] ?? "#";
              return (
                <a
                  key={product.id}
                  href={link}
                  className="group rounded-2xl overflow-hidden border border-black/8 bg-white/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="aspect-square bg-black/5 overflow-hidden">
                    {image ? (
                      <img
                        src={image.url}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center opacity-30 text-sm">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold">{product.name}</p>
                    <p className="text-sm opacity-70 mt-0.5">{formatNpr(displayPrice)}</p>
                  </div>
                </a>
              );
            })}
      </div>
    </section>
  );
}
