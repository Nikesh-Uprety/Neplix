import type { SectionData, SectionType } from "./types";
import { FeaturesSection } from "./FeaturesSection";
import { HeroSection } from "./HeroSection";
import { ImageTextSection } from "./ImageTextSection";
import { NewsletterSection } from "./NewsletterSection";
import { ProductGridSection } from "./ProductGridSection";
import { TestimonialsSection } from "./TestimonialsSection";

export const sectionRegistry = {
  hero: HeroSection,
  productGrid: ProductGridSection,
  imageText: ImageTextSection,
  testimonials: TestimonialsSection,
  newsletter: NewsletterSection,
  features: FeaturesSection,
} as const;

export const sectionDefaults: Record<SectionType, Record<string, unknown>> = {
  hero: {
    heading: "Your Heading",
    subtext: "Add a subtext",
    buttonLabel: "Shop now",
    buttonLink: "#",
    bgImage: "",
    heroRatio: "16/9",
  },
  productGrid: {
    title: "Featured Products",
    productIds: [],
    productLinks: [],
  },
  imageText: {
    imageUrl: "",
    text: "Edit this text",
    imageLink: "#",
    imageRatio: "16/10",
  },
  testimonials: {
    title: "What People Say",
    reviews: [{ author: "Customer", quote: "Great service!" }],
  },
  newsletter: {
    title: "Join us",
    placeholder: "Enter email",
    buttonLabel: "Subscribe",
  },
  features: {
    items: [{ icon: "★", title: "Feature", desc: "Description" }],
  },
};

export function makeSection(type: SectionType): SectionData {
  return {
    id: crypto.randomUUID(),
    type,
    props: sectionDefaults[type],
  };
}
