import type { ReactNode } from "react";
import type { StoreSettings } from "@/lib/api";

type Props = {
  settings: StoreSettings | null;
  storeName: string;
  children: ReactNode;
};

export function StoreLayout({ settings, storeName, children }: Props) {
  const primary = settings?.primaryColor || "#111827";
  const fontFamily = settings?.fontFamily || "Inter";
  const menu = settings?.navbarMenu ?? [];
  const footer = settings?.footerLinks ?? [];

  return (
    <div style={{ fontFamily }} className="min-h-screen bg-[#070B14] text-white">
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={storeName} className="h-8 w-auto" />
            ) : (
              <div className="h-8 px-3 rounded-md text-sm font-semibold grid place-items-center" style={{ backgroundColor: primary }}>
                {storeName}
              </div>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {menu.map((item) => (
              <a key={`${item.label}-${item.url}`} href={item.url} className="text-sm text-gray-300 hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          {footer.map((item) => (
            <a key={`${item.label}-${item.url}`} href={item.url} className="hover:text-white">
              {item.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
