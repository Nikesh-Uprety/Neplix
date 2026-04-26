type PresetSection = {
  id: string;
  type: string;
  props: Record<string, unknown>;
};

type Preset = {
  id: string;
  name: string;
  pageTitle: string;
  sections: PresetSection[];
};

function sid() {
  return crypto.randomUUID();
}

export const STOREFRONT_PRESETS: Preset[] = [
  {
    id: "north-atelier",
    name: "North Atelier",
    pageTitle: "North Atelier Home",
    sections: [
      {
        id: sid(),
        type: "hero",
        props: {
          heading: "NORTH: THE ASCEND",
          subtext: "Technical streetwear for high-altitude city life.",
          buttonLabel: "Shop Collection",
          bgImage:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=80",
        },
      },
      { id: sid(), type: "productGrid", props: { title: "Featured Collection", productIds: [] } },
      {
        id: sid(),
        type: "imageText",
        props: {
          imageUrl:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
          text: "Designed in Kathmandu. Built for weather, movement, and identity.",
        },
      },
    ],
  },
  {
    id: "maison-noir",
    name: "Maison Noir",
    pageTitle: "Maison Noir Home",
    sections: [
      {
        id: sid(),
        type: "hero",
        props: {
          heading: "Maison Noir",
          subtext: "Modern luxury with couture restraint.",
          buttonLabel: "Explore Looks",
          bgImage:
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1800&q=80",
        },
      },
      { id: sid(), type: "testimonials", props: { title: "Editors and clients", reviews: [] } },
      { id: sid(), type: "features", props: { items: [{ icon: "◆", title: "Atelier Crafted", desc: "Premium materials and detailing." }] } },
    ],
  },
  {
    id: "himalayan-brew",
    name: "Himalayan Brew",
    pageTitle: "Himalayan Brew Home",
    sections: [
      {
        id: sid(),
        type: "hero",
        props: {
          heading: "Craft coffee, brewed bold every day.",
          subtext: "Single-origin beans and fresh bakery items from the valley.",
          buttonLabel: "Order Now",
          bgImage:
            "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1800&q=80",
        },
      },
      { id: sid(), type: "productGrid", props: { title: "Coffee and bakery favorites", productIds: [] } },
      { id: sid(), type: "newsletter", props: { title: "Join Brew Club", placeholder: "Email address", buttonLabel: "Subscribe" } },
    ],
  },
];

export function getPresetById(id: string) {
  return STOREFRONT_PRESETS.find((preset) => preset.id === id) ?? null;
}
