export type SectionType =
  | "hero"
  | "productGrid"
  | "imageText"
  | "testimonials"
  | "newsletter"
  | "features";

export type SectionData = {
  id: string;
  type: SectionType;
  props: Record<string, unknown>;
  styles?: Record<string, string>;
};

export type SectionComponentProps = {
  data: SectionData;
  isEditing?: boolean;
  onUpdate?: (props: Record<string, unknown>) => void;
  storeSlug?: string;
  onUploadImage?: (file: File) => Promise<string>;
  linkOptions?: Array<{ label: string; url: string; group?: "page" | "product" | "custom" }>;
};
