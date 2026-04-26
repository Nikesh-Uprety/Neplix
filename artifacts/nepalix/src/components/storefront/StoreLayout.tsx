import { type ReactElement, type ReactNode, useEffect, useRef, useState } from "react";
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
  cardBg: string;
  mutedText: string;
  isDark: boolean;
};

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  "Coffee & Bakery": {
    bg: "#FDF6EC",
    text: "#2C1A0E",
    accent: "#8B4513",
    accentText: "#FFFFFF",
    headerBg: "#2C1A0E",
    headerText: "#FDF6EC",
    border: "#D4A76A30",
    badge: "☕",
    footerBg: "#1A0D08",
    cardBg: "rgba(0,0,0,0.04)",
    mutedText: "rgba(44,26,14,0.55)",
    isDark: false,
  },
  Fashion: {
    bg: "#F9F7F5",
    text: "#1A1A1A",
    accent: "#1A1A1A",
    accentText: "#F9F7F5",
    headerBg: "#1A1A1A",
    headerText: "#F9F7F5",
    border: "#1A1A1A12",
    badge: "👗",
    footerBg: "#111111",
    cardBg: "rgba(255,255,255,0.9)",
    mutedText: "rgba(26,26,26,0.5)",
    isDark: false,
  },
  Electronics: {
    bg: "#0D1117",
    text: "#E2E8F0",
    accent: "#3B82F6",
    accentText: "#FFFFFF",
    headerBg: "#0D1117",
    headerText: "#E2E8F0",
    border: "#3B82F625",
    badge: "⚡",
    footerBg: "#080D12",
    cardBg: "rgba(255,255,255,0.05)",
    mutedText: "rgba(226,232,240,0.5)",
    isDark: true,
  },
  Beauty: {
    bg: "#FFF5F7",
    text: "#4A1530",
    accent: "#C2185B",
    accentText: "#FFFFFF",
    headerBg: "#4A1530",
    headerText: "#FFF5F7",
    border: "#C2185B18",
    badge: "💄",
    footerBg: "#2D0C1D",
    cardBg: "rgba(0,0,0,0.035)",
    mutedText: "rgba(74,21,48,0.5)",
    isDark: false,
  },
  Grocery: {
    bg: "#F0FDF4",
    text: "#14532D",
    accent: "#16A34A",
    accentText: "#FFFFFF",
    headerBg: "#14532D",
    headerText: "#F0FDF4",
    border: "#16A34A18",
    badge: "🛒",
    footerBg: "#0A2D18",
    cardBg: "rgba(0,0,0,0.04)",
    mutedText: "rgba(20,83,45,0.5)",
    isDark: false,
  },
  "Home Decor": {
    bg: "#FAFAF8",
    text: "#292524",
    accent: "#92400E",
    accentText: "#FFFFFF",
    headerBg: "#292524",
    headerText: "#FAFAF8",
    border: "#92400E18",
    badge: "🏠",
    footerBg: "#1C1917",
    cardBg: "rgba(255,255,255,0.9)",
    mutedText: "rgba(41,37,36,0.5)",
    isDark: false,
  },
  Health: {
    bg: "#F0FFFE",
    text: "#0F3D3D",
    accent: "#0D9488",
    accentText: "#FFFFFF",
    headerBg: "#0F3D3D",
    headerText: "#F0FFFE",
    border: "#0D948818",
    badge: "💚",
    footerBg: "#072424",
    cardBg: "rgba(0,0,0,0.04)",
    mutedText: "rgba(15,61,61,0.5)",
    isDark: false,
  },
};

const DEFAULT_THEME: CategoryTheme = {
  bg: "#F8FAFC",
  text: "#0F172A",
  accent: "#5B4FF9",
  accentText: "#FFFFFF",
  headerBg: "#0F172A",
  headerText: "#F8FAFC",
  border: "#5B4FF918",
  badge: "🏪",
  footerBg: "#080C14",
  cardBg: "rgba(255,255,255,0.8)",
  mutedText: "rgba(15,23,42,0.5)",
  isDark: false,
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

const SOCIAL_ICONS: Record<string, ReactElement> = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  x: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  ),
};

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
  const socialLinks = settings?.socialLinks ?? {};
  const theme = getTheme(category, settings?.primaryColor);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const cssVars = {
    "--sf-bg": theme.bg,
    "--sf-text": theme.text,
    "--sf-accent": theme.accent,
    "--sf-accent-t": theme.accentText,
    "--sf-border": theme.border,
    "--sf-card": theme.cardBg,
    "--sf-muted": theme.mutedText,
    "--sf-header": theme.headerBg,
    "--sf-header-t": theme.headerText,
    "--sf-footer": theme.footerBg,
  } as React.CSSProperties;

  return (
    <div
      style={{ fontFamily, backgroundColor: theme.bg, color: theme.text, ...cssVars }}
      className="min-h-screen"
    >
      {/* Sticky header */}
      <header
        style={{
          backgroundColor: scrolled ? theme.headerBg + "F4" : theme.headerBg,
          borderBottomColor: theme.headerText + "15",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        }}
        className="sticky top-0 z-50 border-b transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo / Store name */}
            <a href="/" className="flex items-center gap-3 flex-shrink-0 min-w-0">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={storeName}
                  className="h-8 w-auto object-contain"
                  style={{ maxWidth: 160 }}
                />
              ) : (
                <div className="flex items-center gap-2.5" style={{ color: theme.headerText }}>
                  <div
                    className="h-8 w-8 rounded-lg grid place-items-center text-base flex-shrink-0"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentText,
                    }}
                  >
                    {storeName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-base font-bold tracking-tight truncate">{storeName}</span>
                </div>
              )}
            </a>

            {/* Desktop navigation */}
            {menu.length > 0 && (
              <nav className="hidden md:flex items-center gap-0.5">
                {menu.map((item) => (
                  <a
                    key={`${item.label}-${item.url}`}
                    href={item.url}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ color: theme.headerText + "99" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = theme.headerText;
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        theme.headerText + "14";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = theme.headerText + "99";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <a
                href="/products"
                style={{ backgroundColor: theme.accent, color: theme.accentText }}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-85 shadow-sm flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Shop Now
              </a>

              {/* Mobile hamburger */}
              {menu.length > 0 && (
                <button
                  className="md:hidden p-2 rounded-lg transition-colors"
                  style={{
                    color: theme.headerText,
                    backgroundColor: mobileOpen ? theme.headerText + "14" : "transparent",
                  }}
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                >
                  {mobileOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && menu.length > 0 && (
          <div
            ref={mobileNavRef}
            className="md:hidden border-t"
            style={{ borderTopColor: theme.headerText + "14", backgroundColor: theme.headerBg }}
          >
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">
              {menu.map((item) => (
                <a
                  key={`mob-${item.label}-${item.url}`}
                  href={item.url}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: theme.headerText + "CC" }}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/products"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-center"
                style={{ backgroundColor: theme.accent, color: theme.accentText }}
              >
                Shop Now
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Page content */}
      <main>{children}</main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: theme.footerBg,
          borderTopColor: theme.headerText + "12",
        }}
        className="border-t mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10">
            {/* Brand column */}
            <div>
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={storeName}
                  className="h-8 w-auto mb-4 object-contain"
                />
              ) : (
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="h-8 w-8 rounded-lg grid place-items-center text-sm font-bold"
                    style={{ backgroundColor: theme.accent, color: theme.accentText }}
                  >
                    {storeName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-base" style={{ color: theme.headerText }}>
                    {storeName}
                  </span>
                </div>
              )}
              <p className="text-sm leading-relaxed mb-5" style={{ color: theme.headerText + "55" }}>
                Shop the latest collection from {storeName}. Quality products delivered to your door.
              </p>
              {/* Social icons */}
              {Object.keys(socialLinks).length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                  {Object.entries(socialLinks)
                    .filter(([, url]) => url)
                    .map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={platform}
                        className="h-8 w-8 rounded-full grid place-items-center transition-opacity hover:opacity-100"
                        style={{
                          backgroundColor: theme.headerText + "14",
                          color: theme.headerText + "88",
                        }}
                      >
                        {SOCIAL_ICONS[platform.toLowerCase()] ?? (
                          <span className="text-xs capitalize">{platform[0]}</span>
                        )}
                      </a>
                    ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            {footer.length > 0 && (
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: theme.headerText + "45" }}
                >
                  Quick Links
                </p>
                <ul className="space-y-2.5">
                  {footer.map((item) => (
                    <li key={`${item.label}-${item.url}`}>
                      <a
                        href={item.url}
                        className="text-sm transition-opacity hover:opacity-100"
                        style={{ color: theme.headerText + "65" }}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Shop column */}
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: theme.headerText + "45" }}
              >
                Shop
              </p>
              <ul className="space-y-2.5">
                {["All Products", "New Arrivals", "Best Sellers"].map((label) => (
                  <li key={label}>
                    <a
                      href="/products"
                      className="text-sm transition-opacity hover:opacity-100"
                      style={{ color: theme.headerText + "65" }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t text-xs"
            style={{ borderTopColor: theme.headerText + "12", color: theme.headerText + "35" }}
          >
            <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            <p>
              Powered by{" "}
              <a
                href="https://nepalix.com"
                className="transition-opacity hover:opacity-80"
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
