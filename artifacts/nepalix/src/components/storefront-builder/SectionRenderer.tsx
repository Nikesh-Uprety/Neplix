import { sectionRegistry } from "./sections/registry";
import type { SectionData } from "./sections/types";

type Props = {
  section: SectionData;
  isEditing?: boolean;
  onUpdate?: (nextProps: Record<string, unknown>) => void;
  storeSlug?: string;
  onUploadImage?: (file: File) => Promise<string>;
  linkOptions?: Array<{ label: string; url: string; group?: "page" | "product" | "custom" }>;
};

export function SectionRenderer({
  section,
  isEditing,
  onUpdate,
  storeSlug,
  onUploadImage,
  linkOptions,
}: Props) {
  const Component = sectionRegistry[section.type];
  if (!Component) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Unknown section type: {section.type}
      </div>
    );
  }
  return (
    <Component
      data={section}
      isEditing={isEditing}
      onUpdate={onUpdate}
      storeSlug={storeSlug}
      onUploadImage={onUploadImage}
      linkOptions={linkOptions}
    />
  );
}
