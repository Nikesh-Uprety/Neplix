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
          badge: "✦ New Collection",
          heading: "NORTH: THE ASCEND",
          subtext: "Technical streetwear engineered for high-altitude city life. Bold cuts, refined details.",
          buttonLabel: "Shop Collection",
          buttonLink: "/products",
          bgImage:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=80",
          heroRatio: "16/9",
        },
      },
      {
        id: sid(),
        type: "productGrid",
        props: { title: "Featured Collection", productIds: [], productLinks: [] },
      },
      {
        id: sid(),
        type: "imageText",
        props: {
          imageUrl:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
          heading: "Designed in Kathmandu.",
          text: "Built for weather, movement, and identity. Every stitch crafted for the streets of the city and the trails beyond. Explore the story behind North Atelier.",
          imageLink: "/products",
          imageRatio: "4/3",
        },
      },
      {
        id: sid(),
        type: "features",
        props: {
          items: [
            { icon: "🧵", title: "Premium Fabrics", desc: "Technical materials engineered for durability and comfort." },
            { icon: "🚚", title: "Nationwide Delivery", desc: "Fast shipping across Nepal, right to your door." },
            { icon: "🔄", title: "Easy Returns", desc: "Not happy? 7-day hassle-free returns, no questions asked." },
          ],
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
          badge: "Luxury Fashion",
          heading: "Maison Noir",
          subtext: "Modern luxury with couture restraint. Timeless silhouettes for the discerning.",
          buttonLabel: "Explore Looks",
          buttonLink: "/products",
          bgImage:
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1800&q=80",
          heroRatio: "16/9",
        },
      },
      {
        id: sid(),
        type: "productGrid",
        props: { title: "The Edit", productIds: [], productLinks: [] },
      },
      {
        id: sid(),
        type: "testimonials",
        props: {
          title: "Editors & Clients",
          reviews: [
            { author: "Priya S.", quote: "Absolutely stunning craftsmanship. The fit is impeccable and the fabric feels luxurious.", rating: 5 },
            { author: "Anish K.", quote: "A brand that truly understands modern elegance. Every piece is a statement.", rating: 5 },
          ],
        },
      },
      {
        id: sid(),
        type: "features",
        props: {
          items: [
            { icon: "◆", title: "Atelier Crafted", desc: "Premium materials and hand-finished detailing on every piece." },
            { icon: "♻", title: "Sustainably Made", desc: "Responsible sourcing and eco-conscious production." },
            { icon: "📦", title: "Gift Packaging", desc: "Every order arrives in signature Maison Noir packaging." },
          ],
        },
      },
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
          badge: "☕ Fresh Daily",
          heading: "Craft coffee, brewed bold every day.",
          subtext: "Single-origin beans from the hills of Nepal. Fresh bakery items made every morning.",
          buttonLabel: "Order Now",
          buttonLink: "/products",
          bgImage:
            "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1800&q=80",
          heroRatio: "16/9",
        },
      },
      {
        id: sid(),
        type: "productGrid",
        props: {
          title: "Coffee & Bakery Favorites",
          productIds: [],
          productLinks: [],
        },
      },
      {
        id: sid(),
        type: "imageText",
        props: {
          imageUrl:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
          heading: "From seed to cup.",
          text: "We source our beans directly from small farms in Nepal's highlands. Every cup you enjoy supports local farmers and sustainable agriculture in the Himalayas.",
          imageLink: "/products",
          imageRatio: "4/3",
        },
      },
      {
        id: sid(),
        type: "features",
        props: {
          items: [
            { icon: "🌱", title: "Single-Origin Beans", desc: "Directly sourced from Nepali highland farms for peak freshness." },
            { icon: "🧑‍🍳", title: "Baked Fresh Daily", desc: "All pastries and breads made fresh in our kitchen every morning." },
            { icon: "🏠", title: "Home Delivery", desc: "Order before 10 AM for same-day delivery within the valley." },
          ],
        },
      },
      {
        id: sid(),
        type: "newsletter",
        props: {
          title: "Join Brew Club",
          subtitle: "Get weekly specials, new roast alerts and exclusive member deals.",
          placeholder: "Enter your email address",
          buttonLabel: "Subscribe",
        },
      },
    ],
  },
];

export function getPresetById(id: string) {
  return STOREFRONT_PRESETS.find((preset) => preset.id === id) ?? null;
}
