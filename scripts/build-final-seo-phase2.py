#!/usr/bin/env python3
"""
Phase 2: Create all project source files with complete SEO.
This script writes every source file to the staging directory.
"""

import os, json, shutil, glob

BASE = "/home/z/my-project"
STAGING = os.path.join(BASE, "nossy-deploy-final")
SRC = os.path.join(STAGING, "src")

# Helper to write file
def w(path, content):
    full = os.path.join(STAGING, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)

# Helper to copy file
def cp(src_rel, dst_rel):
    src = os.path.join(BASE, src_rel)
    dst = os.path.join(STAGING, dst_rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(src):
        shutil.copy2(src, dst)

print("Creating project files...")

# ═══════════════════════════════════════════════════════════════
# package.json
# ═══════════════════════════════════════════════════════════════
w("package.json", '{"name":"nossy-site","version":"1.0.0","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start"},"dependencies":{"next":"15.3.3","react":"19.1.0","react-dom":"19.1.0"},"devDependencies":{"@types/node":"20.14.0","@types/react":"19.0.0","typescript":"5.5.0","tailwindcss":"3.4.0","postcss":"8.4.0","autoprefixer":"10.4.0"}}')

# ═══════════════════════════════════════════════════════════════
# next.config.ts - NO ignoreBuildErrors
# ═══════════════════════════════════════════════════════════════
w("next.config.ts", '''import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: false,
};
export default nextConfig;
''')

# ═══════════════════════════════════════════════════════════════
# tsconfig.json
# ═══════════════════════════════════════════════════════════════
w("tsconfig.json", '{"compilerOptions":{"target":"ES2017","lib":["dom","dom.iterable","esnext"],"allowJs":true,"skipLibCheck":true,"strict":true,"noEmit":true,"esModuleInterop":true,"module":"esnext","moduleResolution":"bundler","resolveJsonModule":true,"isolatedModules":true,"jsx":"preserve","incremental":true,"plugins":[{"name":"next"}],"paths":{"@/*":["./src/*"]}},"include":["next-env.d.ts","**/*.ts","**/*.tsx",".next/types/**/*.ts"],"exclude":["node_modules"]}')

# ═══════════════════════════════════════════════════════════════
# postcss.config.mjs
# ═══════════════════════════════════════════════════════════════
cp("postcss.config.mjs", "postcss.config.mjs")
if not os.path.exists(os.path.join(STAGING, "postcss.config.mjs")):
    w("postcss.config.mjs", '''/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;
''')

# ═══════════════════════════════════════════════════════════════
# tailwind.config.ts
# ═══════════════════════════════════════════════════════════════
cp("tailwind.config.ts", "tailwind.config.ts")
if not os.path.exists(os.path.join(STAGING, "tailwind.config.ts")):
    w("tailwind.config.ts", '''import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
''')

print("  Config files created")

# ═══════════════════════════════════════════════════════════════
# src/app/globals.css
# ═══════════════════════════════════════════════════════════════
cp("src/app/globals.css", "src/app/globals.css")
if not os.path.exists(os.path.join(STAGING, "src/app/globals.css")):
    w("src/app/globals.css", '''@tailwind base;
@tailwind components;
@tailwind utilities;
body { font-family: system-ui, -apple-system, sans-serif; }
''')

# ═══════════════════════════════════════════════════════════════
# src/lib/i18n.ts - copy from current project
# ═══════════════════════════════════════════════════════════════
cp("src/lib/i18n.ts", "src/lib/i18n.ts")
if not os.path.exists(os.path.join(STAGING, "src/lib/i18n.ts")):
    print("  WARNING: i18n.ts not found, copying from download")
    cp("download/nossy-github/src/lib/i18n.ts", "src/lib/i18n.ts")

# ═══════════════════════════════════════════════════════════════
# src/lib/shared.ts
# ═══════════════════════════════════════════════════════════════
cp("download/nossy-github/src/lib/shared.ts", "src/lib/shared.ts")

# ═══════════════════════════════════════════════════════════════
# src/lib/flags.ts, countries.ts, country-names.ts, slug-map.ts
# ═══════════════════════════════════════════════════════════════
for f in ["flags.ts", "countries.ts", "country-names.ts", "slug-map.ts"]:
    cp(f"src/lib/{f}", f"src/lib/{f}")
    if not os.path.exists(os.path.join(STAGING, f"src/lib/{f}")):
        cp(f"download/nossy-github/src/lib/{f}", f"src/lib/{f}")

# ═══════════════════════════════════════════════════════════════
# src/data/countries.json and latest_20.json
# ═══════════════════════════════════════════════════════════════
cp("download/nossy-github/src/data/countries.json", "src/data/countries.json")
cp("download/nossy-github/src/data/latest_20.json", "src/data/latest_20.json")

print("  Lib files copied")

# ═══════════════════════════════════════════════════════════════
# src/components/
# ═══════════════════════════════════════════════════════════════
for f in ["SiteLogo.tsx", "LangSelector.tsx", "PaywallModal.tsx"]:
    cp(f"src/components/{f}", f"src/components/{f}")
    if not os.path.exists(os.path.join(STAGING, f"src/components/{f}")):
        cp(f"download/nossy-github/src/components/{f}", f"src/components/{f}")

print("  Components copied")

# ═══════════════════════════════════════════════════════════════
# src/app/api/data/country/route.ts
# ═══════════════════════════════════════════════════════════════
cp("src/app/api/data/country/route.ts", "src/app/api/data/country/route.ts")
if not os.path.exists(os.path.join(STAGING, "src/app/api/data/country/route.ts")):
    cp("download/nossy-github/src/app/api/data/country/route.ts", "src/app/api/data/country/route.ts")

print("  API routes copied")

# ═══════════════════════════════════════════════════════════════
# src/components/ErrorBoundary.tsx
# ═══════════════════════════════════════════════════════════════
w("src/components/ErrorBoundary.tsx", '''"use client";
import React from "react";

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui" }}>
          <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>\u26A0\uFE0F</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: ".5rem" }}>Something went wrong</p>
          <p style={{ fontSize: ".85rem", color: "#888", marginBottom: "1rem" }}>{this.state.error?.message || "An unexpected error occurred"}</p>
          <button onClick={() => window.location.reload()} style={{ padding: ".5rem 1.5rem", background: "#0ea5e9", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: ".9rem" }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
''')

print("  ErrorBoundary created")

# ═══════════════════════════════════════════════════════════════
# src/app/layout.tsx - Root with ErrorBoundary, dynamic html lang
# ═══════════════════════════════════════════════════════════════
w("src/app/layout.tsx", '''import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NOSSY | 44,000+ Tech Jobs Worldwide",
  description: "Find tech jobs in 60 countries across Europe, Asia and the USA. Remote, hybrid and on-site positions at top companies. Available in 22 languages.",
  keywords: ["tech jobs", "software engineering jobs", "remote jobs", "jobs in Europe", "jobs in Asia", "IT jobs", "developer jobs", "NOSSY"],
  authors: [{ name: "NOSSY" }],
  metadataBase: new URL("https://nossy.pro"),
  openGraph: {
    type: "website",
    siteName: "NOSSY",
    title: "NOSSY | 44,000+ Tech Jobs Worldwide",
    description: "Find tech jobs in 60 countries. Remote, hybrid and on-site positions at top companies.",
    url: "https://nossy.pro",
    images: [{ url: "/og/og-default.png", width: 1200, height: 630, alt: "NOSSY - Tech Jobs Worldwide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOSSY | 44,000+ Tech Jobs Worldwide",
    description: "Find tech jobs in 60 countries. Remote, hybrid and on-site positions.",
    images: ["/og/og-default.png"],
  },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><meta name="google" content="notranslate" /></head>
      <body className={geist.className} style={{ margin: 0 }}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
''')

print("  Root layout created")

# ═══════════════════════════════════════════════════════════════
# src/app/page.tsx - redirect
# ═══════════════════════════════════════════════════════════════
w("src/app/page.tsx", '''import { redirect } from "next/navigation";
export default function Home() { redirect("/en/jobs"); }
''')

# ═══════════════════════════════════════════════════════════════
# src/app/robots.ts
# ═══════════════════════════════════════════════════════════════
w("src/app/robots.ts", '''import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: "https://nossy.pro/sitemap.xml",
  };
}
''')

# ═══════════════════════════════════════════════════════════════
# src/app/sitemap.ts - Dynamic sitemap generator
# ═══════════════════════════════════════════════════════════════
w("src/app/sitemap.ts", '''import type { MetadataRoute } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import countriesData from "@/data/countries.json";

interface CountryInfo { slug: string; region: string; count: number; name: string; }

export default function sitemap(): MetadataRoute.Sitemap {
  const countries = countriesData as CountryInfo[];
  const entries: MetadataRoute.Sitemap = [];
  const baseUrl = "https://nossy.pro";

  for (const lang of LANGUAGES) {
    const slug = LANG_SLUGS[lang.code];
    // Homepage
    entries.push({ url: baseUrl + "/" + lang.code + "/" + slug, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 });
    // Region pages
    for (const region of ["europa", "asia", "eua"]) {
      entries.push({ url: baseUrl + "/" + lang.code + "/" + slug + "/" + region, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 });
    }
    // Country pages
    for (const c of countries) {
      entries.push({ url: baseUrl + "/" + lang.code + "/" + slug + "/" + c.region + "/" + c.slug, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 });
    }
  }
  return entries;
}
''')

print("  Sitemap and robots created")

# ═══════════════════════════════════════════════════════════════
# src/app/[lang]/[slug]/layout.tsx - WITH generateStaticParams (22 pages only)
# ═══════════════════════════════════════════════════════════════
w("src/app/[lang]/[slug]/layout.tsx", '''import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export function generateStaticParams() {
  return LANGUAGES.map(l => ({ lang: l.code, slug: LANG_SLUGS[l.code] }));
}

const DESC: Record<string, string> = {};
for (const l of LANGUAGES) {
  const t = i18n[l.code] || i18n["en"];
  DESC[l.code] = t.homeDesc || ("Browse " + t.totalJobs + "+ tech jobs across 60 countries in Europe, Asia and the USA. " + (t.homeSubtitle || ""));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: lc } = await params;
  const lang = lc as Lang;
  const slug = LANG_SLUGS[lang];
  const url = "/" + lang + "/" + slug;
  return {
    title: "NOSSY | " + (i18n[lang]?.totalJobs || "44,000+") + "+ " + (i18n[lang]?.vacancies || "Tech Jobs") + " Worldwide",
    description: DESC[lang] || DESC["en"],
    alternates: { canonical: url, languages: Object.fromEntries(LANGUAGES.map(l => [l.code, "/" + l.code + "/" + LANG_SLUGS[l.code]])), },
    openGraph: { url, type: "website", siteName: "NOSSY", locale: lang === "pt-br" ? "pt_BR" : lang === "pt-pt" ? "pt_PT" : lang },
    robots: { index: true, follow: true },
  };
}

export default function LangSlugLayout({ children }: { children: React.ReactNode }) { return children; }
''')

print("  [slug] layout created")

# ═══════════════════════════════════════════════════════════════
# src/app/[lang]/[slug]/page.tsx
# ═══════════════════════════════════════════════════════════════
w("src/app/[lang]/[slug]/page.tsx", '''"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LANGUAGES, LANG_SLUGS, i18n, sectorNames } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getRegionName, formatSalary } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";
import countriesData from "@/data/countries.json";

export default function HomePage() {
  const params = useParams();
  const langCode = String(params.lang || "en");
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [jobs, setJobs] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>(countriesData);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const slug = LANG_SLUGS[lang] || "jobs";

  useEffect(() => {
    fetch("/data/latest_20.json").then(r => r.json()).then(d => { setJobs(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const regions = ["europa", "asia", "eua"];
  const goCountry = (r: string, c: string) => router.push("/" + lang + "/" + slug + "/" + r + "/" + c);

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><SiteLogo size={36} /><span className="text-lg font-bold text-gray-900 tracking-tight">NOSSY</span></div>
          <LangSelector lang={lang} switchLang={(l) => router.push("/" + l + "/" + LANG_SLUGS[l])} />
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{T.heroTitle || "Find your dream tech job"}</h1>
          <p className="text-gray-500 text-lg">{T.heroSubtitle || ""}</p>
          <div className="flex justify-center gap-8 mt-6">
            <div><p className="text-3xl font-bold text-sky-600">{T.totalJobs}</p><p className="text-xs text-gray-400 uppercase tracking-wider">{T.vacancies}</p></div>
            <div><p className="text-3xl font-bold text-sky-600">{countries.length}</p><p className="text-xs text-gray-400 uppercase tracking-wider">{T.countries || "Countries"}</p></div>
            <div><p className="text-3xl font-bold text-sky-600">{regions.length}</p><p className="text-xs text-gray-400 uppercase tracking-wider">{T.regions || "Regions"}</p></div>
          </div>
        </div>
        {regions.map(region => {
          const rName = getRegionName(lang, region);
          const rCountries = countries.filter((c: any) => c.region === region);
          const ogImage = region === "europa" ? "/og/og-europa.png" : region === "asia" ? "/og/og-asia.png" : "/og/og-eua.png";
          return (
            <section key={region} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <img src={ogImage} alt={rName} className="w-10 h-10 rounded-lg" />
                <h2 className="text-2xl font-bold text-gray-900">{rName}</h2>
                <span className="text-sm text-gray-400">{rCountries.reduce((s: number, c: any) => s + c.count, 0).toLocaleString()}+ {T.vacancies}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {rCountries.map((c: any) => (
                  <button key={c.slug} onClick={() => goCountry(region, c.slug)} className="group p-4 rounded-xl border border-gray-100 bg-white hover:border-sky-300 hover:shadow-md transition-all text-left">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-sky-600 transition-colors">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{c.count.toLocaleString()}+ {T.vacancies}</p>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {!loading && jobs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">{T.latestJobs || "Latest Jobs"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.slice(0, 6).map((job: any) => {
                const m = getSectorMeta(job.sector);
                return (
                  <div key={job.id} className="rounded-xl border bg-white shadow-sm p-4">
                    <div className={"h-1.5 w-full rounded-full bg-gradient-to-r " + m.color + " mb-3"} />
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-xs text-gray-600 mb-1">{job.company}</p>
                    <p className="text-xs text-gray-400 mb-2">{job.location}</p>
                    <p className="text-xs font-bold text-sky-600">{formatSalary(job)}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3"><img src="/logo.png" alt="NOSSY" className="w-10 h-10 rounded-[22%]" /><span className="font-extrabold text-xl tracking-tight">NOSSY</span></div>
          <p className="text-sky-400 text-sm italic">Seek and you shall find.</p>
          <p className="text-gray-400 text-xs">{T.footerText}</p>
        </div>
      </footer>
    </div>
  );
}
''')

print("  Homepage created")

# ═══════════════════════════════════════════════════════════════
# src/app/[lang]/[slug]/[region]/layout.tsx - NO generateStaticParams
# ═══════════════════════════════════════════════════════════════
w("src/app/[lang]/[slug]/[region]/layout.tsx", '''import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import countriesData from "@/data/countries.json";

interface CountryInfo { name: string; slug: string; region: string; count: number; }

const REGION_EN: Record<string, string> = { europa: "Europe", asia: "Asia", eua: "United States" };
const REGION_COUNT: Record<string, number> = {};
for (const c of countriesData as CountryInfo[]) { REGION_COUNT[c.region] = (REGION_COUNT[c.region] || 0) + c.count; }

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string; region: string }> }): Promise<Metadata> {
  const { lang: lc, region: rc } = await params;
  const lang = lc as Lang;
  const regionEn = REGION_EN[rc] || rc;
  const count = REGION_COUNT[rc] || 0;
  const countries = (countriesData as CountryInfo[]).filter(c => c.region === rc);
  const slug = LANG_SLUGS[lang];
  const pageUrl = "/" + lang + "/" + slug + "/" + rc;
  const isPt = lang === "pt-br" || lang === "pt-pt";
  const title = count.toLocaleString() + "+ " + (isPt ? "Vagas" : "Jobs") + " in " + regionEn + " | " + countries.length + " " + (isPt ? "Paises" : "Countries") + " | NOSSY";
  const description = isPt
    ? "Explore " + count.toLocaleString() + "+ vagas de tecnologia em " + regionEn + ". " + countries.length + " paises com vagas remotas, hibridas e presenciais."
    : "Browse " + count.toLocaleString() + "+ tech jobs across " + regionEn + ". " + countries.length + " countries with remote, hybrid and on-site positions.";
  return {
    title, description,
    alternates: { canonical: pageUrl, languages: Object.fromEntries(LANGUAGES.map(l => [l.code, "/" + l.code + "/" + LANG_SLUGS[l.code] + "/" + rc])) },
    openGraph: { url: pageUrl, title, description, type: "website", siteName: "NOSSY", locale: lang === "pt-br" ? "pt_BR" : lang === "pt-pt" ? "pt_PT" : lang },
    robots: { index: true, follow: true },
  };
}

export default function RegionLayout({ children }: { children: React.ReactNode }) { return children; }
''')

print("  [region] layout created (NO generateStaticParams)")

# ═══════════════════════════════════════════════════════════════
# src/app/[lang]/[slug]/[region]/page.tsx
# ═══════════════════════════════════════════════════════════════
w("src/app/[lang]/[slug]/[region]/page.tsx", '''"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LANGUAGES, LANG_SLUGS, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getRegionName, getLocalizedCountryName } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";
import countriesData from "@/data/countries.json";

export default function RegionPage() {
  const params = useParams();
  const langCode = String(params.lang || "en");
  const rc = String(params.region || "");
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [countries, setCountries] = useState<any[]>([]);
  const router = useRouter();
  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const rName = getRegionName(lang, rc);
  const slug = LANG_SLUGS[lang] || "jobs";
  const ogImage = rc === "europa" ? "/og/og-europa.png" : rc === "asia" ? "/og/og-asia.png" : "/og/og-eua.png";

  useEffect(() => {
    const filtered = countriesData.filter((c: any) => c.region === rc);
    setCountries(filtered);
  }, [rc]);

  const goHome = () => router.push("/" + lang + "/" + slug);
  const goCountry = (c: string) => router.push("/" + lang + "/" + slug + "/" + rc + "/" + c);
  const total = countries.reduce((s: number, c: any) => s + c.count, 0);

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={goHome} className="hover:opacity-80 transition-opacity flex-shrink-0"><SiteLogo size={36} /></button>
            <button onClick={goHome} className="text-lg font-bold text-gray-900 tracking-tight hover:text-sky-600 transition-colors hidden sm:block">NOSSY</button>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <span className="text-gray-700 font-semibold hidden md:inline">{rName}</span>
          </div>
          <LangSelector lang={lang} switchLang={(l) => router.push("/" + l + "/" + LANG_SLUGS[l] + "/" + rc)} />
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={goHome} className="hover:text-sky-600">{T.backToHome}</button>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">{rName}</span>
        </nav>
        <div className="flex items-center gap-4 mb-8">
          <img src={ogImage} alt={rName} className="w-14 h-14 rounded-xl" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{rName}</h1>
            <p className="text-gray-500">{total.toLocaleString()}+ {T.vacancies} - {countries.length} {T.countries || "countries"}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {countries.map((c: any) => {
            const localName = getLocalizedCountryName(c.name, lang);
            return (
              <button key={c.slug} onClick={() => goCountry(c.slug)} className="group p-5 rounded-xl border border-gray-100 bg-white hover:border-sky-300 hover:shadow-lg transition-all text-left">
                <p className="text-base font-bold text-gray-900 group-hover:text-sky-600 transition-colors">{localName}</p>
                <p className="text-sm text-gray-400 mt-1">{c.count.toLocaleString()}+ {T.vacancies}</p>
              </button>
            );
          })}
        </div>
      </main>
      <footer className="bg-gray-900 text-white py-12 mt-8"><div className="max-w-7xl mx-auto px-4 sm:px-6 text-center"><p className="text-gray-400 text-sm">{T.footerText}</p></div></footer>
    </div>
  );
}
''')

print("  [region] page created")

print("\n=== Phase 2 Complete: Source files (part 1) created ===")
