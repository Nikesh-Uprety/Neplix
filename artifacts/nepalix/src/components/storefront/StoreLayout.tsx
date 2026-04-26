import { type ReactNode, useEffect, useState } from "react";
import type { StoreSettings } from "@/lib/api";

type CategoryTheme = {
  bg: string;
  text: string;
  accent: string;
  accentText: string;
  headerBg: string;
  headerText: string;
  border: string;
  badge: string;
  footerBg: string;
};

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  "Coffee & Bakery": {
    bg: "#FDF6EC",
    text: "#2C1A0E",
    accent: "#8B4513",
    accentText: "#FFFFFF",
    headerBg: "#2C1A0E",
    headerText: "#FDF6EC",
    border: "#D4A76A40",
    badge: "☕",
    footerBg: "#1A0D08",
  },
  "Fashion": {
    bg: "#F9F7F5",
    text: "#1A1A1A",
    accent: "#1A1A1A",
    accentText: "#F9F7F5",
    headerBg: "#1A1A1A",
    headerText: "#F9F7F5",
    border: "#1A1A1A15",
    badge: "👗",
    footerBg: "#111111",
  },
  "Electronics": {
    bg: "#0D1117",
    text: "#E2E8F0",
    accent: "#3B82F6",
    accentText: "#FFFFFF",
    headerBg: "#0D1117",
    headerText: "#E2E8F0",
    border: "#3B82F630",
    badge: "⚡",
    footerBg: "#080D12",
  },
  "Beauty": {
    bg: "#FFF5F7",
    text: "#4A1530",
    accent: "#C2185B",
    accentText: "#FFFFFF",
    headerBg: "#4A1530",
    headerText: "#FFF5F7",
    border: "#C2185B20",
    badge: "💄",
    footerBg: "#2D0C1D",
  },
  "Grocery": {
    bg: "#F0FDF4",
    text: "#14532D",
    accent: "#16A34A",
    accentText: "#FFFFFF",
    headerBg: "#14532D",
    headerText: "#F0FDF4",
    border: "#16A34A20",
    badge: "🛒",
    footerBg: "#0A2D18",
  },
  "Home Decor": {
    bg: "#FAFAF8",
    text: "#292524",
    accent: "#92400E",
    accentText: "#FFFFFF",
    headerBg: "#292524",
    headerText: "#FAFAF8",
    border: "#92400E20",
    badge: "🏠",
    footerBg: "#1C1917",
  },
  "Health": {
    bg: "#F0FFFE",
    text: "#0F3D3D",
    accent: "#0D9488",
    accentText: "#FFFFFF",
    headerBg: "#0F3D3D",
    headerText: "#F0FFFE",
    border: "#0D948820",
    badge: "💚",
    footerBg: "#072424",
  },
};

const DEFAULT_THEME: CategoryTheme = {
  bg: "#F8FAFC",
  text: "#0F172A",
  accent: "#5B4FF9",
  accentText: "#FFFFFF",
  headerBg: "#0F172A",
  headerText: "#F8FAFC",
  border: "#5B4FF920",
  badge: "🏪",
  footerBg: "#080C14",
};

function getTheme(category?: string | null, primaryColor?: string): CategoryTheme {
  if (category) {
    for (const [key, theme] of Object.entries(CATEGORY_THEMES)) {
      if (
        category.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(category.toLowerCase())
      ) {
        return theme;
      }
    }
  }
  if (primaryColor && primaryColor !== "#1A0D00" && primaryColor !== "#111827") {
    return { ...DEFAULT_THEME, accent: primaryColor, headerBg: primaryColor };
  }
  return DEFAULT_THEME;
}

type Props = {
  settings: StoreSettings | null;
  storeName: string;
  category?: string | null;
  children: ReactNode;
};

export function StoreLayout({ settings, storeName, category, children }: Props) {
  const fontFamily = settings?.fontFamily || "Inter";
  const menu = settings?.navbarMenu ?? [];
  const footer = settings?.footerLinks ?? [];
  const theme = getTheme(category, settings?.primaryColor);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily, backgroundColor: theme.bg, color: theme.text }} className="min-h-screen">
      {/* Sticky header */}
      <header
        style={{
          backgroundColor: scrolled ? theme.headerBg + "F2" : theme.headerBg,
          borderBottomColor: theme.border,
          backdropFilter: scrolled ? "blur(12px)" : "none",
        }}
        className="sticky top-0 z-50 border-b transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo / Store name */}
          <a href="/" className="flex items-center gap-3 flex-shrink-0">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={storeName} className="h-9 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2.5" style={{ color: theme.headerText }}>
                <span className="text-xl leading-none">{theme.badge}</span>
                <span className="text-lg font-bold tracking-tight">{storeName}</span>
              </div>
            )}
          </a>

          {/* Navigation */}
          {menu.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {menu.map((item) => (
                <a
                  key={`${item.label}-${item.url}`}
                  href={item.url}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ color: theme.headerText + "B0" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = theme.headerText;
                    (e.currentTarget as HTMLElement).style.backgroundColor = theme.accentText + "18";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = theme.headerText + "B0";
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}

          {/* CTA */}
          <a
            href="/products"
            style={{ backgroundColor: theme.accent, color: theme.accentText }}
            className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 shadow-sm flex-shrink-0"
          >
            Shop Now
          </a>
        </div>
      </header>

      {/* Full-width page content */}
      <main>{children}</main>

      {/* Footer */}
      <footer
        style={{ backgroundColor: theme.footerBg, borderTopColor: theme.border }}
        className="border-t mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-start gap-10">
            {/* Brand */}
            <div className="flex-1 min-w-0">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={storeName} className="h-8 w-auto mb-3 object-contain" />
              ) : (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{theme.badge}</span>
                  <span className="font-bold" style={{ color: theme.headerText }}>
                    {storeName}
                  </span>
                </div>
              )}
              <p className="text-sm" style={{ color: theme.headerText + "60" }}>
                Powered by{" "}
                <a
                  href="https://nepalix.com"
                  className="underline hover:no-underline"
                  style={{ color: theme.accent }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Nepalix
                </a>
              </p>
            </div>

            {/* Footer links */}
            {footer.length > 0 && (
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: theme.headerText + "50" }}
                >
                  Links
                </p>
                <ul className="space-y-2">
                  {footer.map((item) => (
                    <li key={`${item.label}-${item.url}`}>
                      <a
                        href={item.url}
                        className="text-sm transition-opacity hover:opacity-100"
                        style={{ color: theme.headerText + "70" }}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Social links */}
            {settings?.socialLinks && Object.keys(settings.socialLinks).length > 0 && (
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: theme.headerText + "50" }}
                >
                  Follow Us
                </p>
                <ul className="space-y-2">
                  {Object.entries(settings.socialLinks).map(([platform, url]) => (
                    <li key={platform}>
                      <a
                        href={url as string}
                        className="text-sm transition-opacity hover:opacity-100 capitalize"
                        style={{ color: theme.headerText + "70" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {platform}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t text-xs"
            style={{ borderTopColor: theme.headerText + "15", color: theme.headerText + "40" }}
          >
            <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            <p>
              Built with{" "}
              <a
                href="https://nepalix.com"
                className="underline hover:no-underline"
                style={{ color: theme.accent }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Nepalix
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
