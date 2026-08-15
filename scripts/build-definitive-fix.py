#!/usr/bin/env python3
"""
NOSSY.DEFINTIVFIX - Gerar ZIP de deploy com correcao definitiva.
Causa raiz: generateStaticParams gerava 1254+ paginas estaticas no build,
com ignoreBuildErrors:true o Vercel fazia build silenciosamente quebrado.
Solucao: removido generateStaticParams de layouts de pais/regiao,
removido imports estaticos de JSON em componentes cliente,
adicionado Error Boundary global.
"""
import os, json, zipfile, shutil

BASE = "/home/z/my-project/download/nossy-github"
OUT = "/home/z/my-project/download/nossy-fix-definitivo.zip"
STAGE = "/tmp/nossy-stage"

# Limpar stage
if os.path.exists(STAGE):
    shutil.rmtree(STAGE)
os.makedirs(STAGE, exist_ok=True)

# ============================================================
# 1. COPIAR TODO O PROJETO EXISTENTE (menos os que vamos reescrever)
# ============================================================
SKIP_FILES = [
    # Layouts que vamos reescrever
    "src/app/[lang]/[slug]/[region]/[country]/layout.tsx",
    "src/app/[lang]/[slug]/[region]/layout.tsx",
    # Paginas que vamos reescrever
    "src/app/[lang]/[slug]/[region]/[country]/page.tsx",
    "src/app/[lang]/[slug]/[region]/[country]/[id]/page.tsx",
    "src/app/[lang]/[slug]/page.tsx",
    "src/app/[lang]/[slug]/[region]/page.tsx",
    # Root layout - adicionar error boundary
    "src/app/layout.tsx",
    # Config
    "package.json",
    "next.config.ts",
    # Arquivos que NAO devem ir
    "bun.lock",
    "bun.lockb",
]

for root, dirs, files in os.walk(BASE):
    rel = os.path.relpath(root, BASE)
    for f in files:
        src_path = os.path.join(root, f)
        if rel == ".":
            dst_rel = f
        else:
            dst_rel = os.path.join(rel, f)
        
        # Normalizar path para comparacao
        dst_norm = dst_rel.replace("\\", "/")
        
        # Pular arquivos bloqueados
        skip = False
        for s in SKIP_FILES:
            if dst_norm.endswith(s) or dst_norm == s:
                skip = True
                break
        if skip:
            continue
        
        # Pazar arquivos de lock
        if f in ("bun.lock", "bun.lockb", "package-lock.json", "yarn.lock"):
            continue
            
        dst_path = os.path.join(STAGE, dst_rel)
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        shutil.copy2(src_path, dst_path)

print(f"Copiados {len([f for r,d,files in os.walk(STAGE) for f in files])} arquivos base")

# ============================================================
# 2. ESCREVER ARQUIVOS CORRIGIDOS
# ============================================================

# --- package.json (React 19, sem bun.lock) ---
package_json = {
    "name": "nossy-pro",
    "version": "1.0.0",
    "private": True,
    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
    },
    "dependencies": {
        "next": "15.3.3",
        "react": "19.1.0",
        "react-dom": "19.1.0"
    },
    "devDependencies": {
        "@tailwindcss/postcss": "^4",
        "@types/node": "20.17.6",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "tailwindcss": "^4",
        "tw-animate-css": "^1.3.5",
        "typescript": "^5"
    }
}
with open(os.path.join(STAGE, "package.json"), "w") as f:
    json.dump(package_json, f, indent=2)
print("package.json escrito (React 19.1.0, Next 15.3.3 pinado)")

# --- next.config.ts (sem ignoreBuildErrors - queremos saber se ha erro) ---
next_config = '''import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
};

export default nextConfig;
'''
with open(os.path.join(STAGE, "next.config.ts"), "w") as f:
    f.write(next_config)
print("next.config.ts escrito (limpo, sem ignoreBuildErrors)")

# --- Error Boundary Global ---
error_boundary = '''"use client";

import React, { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#128736;</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>NOSSY</h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              An error occurred. Please try again.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              style={{
                padding: '0.625rem 1.5rem', backgroundColor: '#0ea5e9', color: 'white',
                border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
'''
with open(os.path.join(STAGE, "src", "components", "ErrorBoundary.tsx"), "w") as f:
    f.write(error_boundary)
print("ErrorBoundary.tsx escrito")

# --- Root Layout com Error Boundary ---
root_layout = '''import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { TOTAL_JOBS } from "@/lib/countries";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NOSSY | " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs Worldwide | Seek and you shall find.",
  description: "NOSSY - Seek and you shall find. Browse " + TOTAL_JOBS.toLocaleString() + "+ tech job vacancies across Europe, Asia and USA. Free global job search with real salaries and top companies. Find remote, hybrid and on-site positions in Software Engineering, Data Science, Cloud, AI and more.",
  keywords: ["jobs", "tech jobs", "job search", "careers", "remote jobs", "NOSSY", "seek and find", "jobs in Europe", "jobs in Asia", "jobs in USA"],
  authors: [{ name: "NOSSY" }],
  creator: "NOSSY",
  publisher: "NOSSY",
  metadataBase: new URL("https://nossy.pro"),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "NOSSY",
    title: "NOSSY | " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs Worldwide | Seek and you shall find.",
    description: "Browse " + TOTAL_JOBS.toLocaleString() + "+ tech job vacancies across Europe, Asia and USA. NOSSY - Seek and you shall find.",
  },
};

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NOSSY",
    "url": "https://nossy.pro",
    "description": "Browse " + TOTAL_JOBS + "+ tech job vacancies across Europe, Asia and USA",
    "publisher": { "@type": "Organization", "name": "NOSSY" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function HrefLangTags() {
  const links = [
    { hreflang: "en", href: "/en/jobs" },
    { hreflang: "pt-BR", href: "/pt-br/vagas" },
    { hreflang: "es", href: "/es/empleos" },
    { hreflang: "fr", href: "/fr/empleos" },
    { hreflang: "de", href: "/de/stellenangebote" },
    { hreflang: "x-default", href: "/en/jobs" },
  ];
  return <>{links.map(l => <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />)}</>;
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0f172a" />
        <HrefLangTags />
        <JsonLd />
      </head>
      <body className={geistSans.variable + " antialiased bg-gray-50 text-gray-900"}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
'''
with open(os.path.join(STAGE, "src", "app", "layout.tsx"), "w") as f:
    f.write(root_layout)
print("src/app/layout.tsx escrito (com ErrorBoundary)")

# --- Slug Layout (manter generateStaticParams - apenas 22 paginas) ---
slug_layout = '''import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { TOTAL_JOBS } from "@/lib/countries";
import type { Lang } from "@/lib/i18n";

export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang: lang.code, slug: LANG_SLUGS[lang.code] }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: langCode, slug } = await params;
  const lang = langCode as Lang;
  const langCfg = LANGUAGES.find((l) => l.code === lang);
  const total = TOTAL_JOBS.toLocaleString();
  return {
    title: "NOSSY | " + (langCfg?.name || lang) + " | " + total + "+ Jobs",
    description: "NOSSY - Seek and you shall find. Browse " + total + "+ tech job vacancies across Europe, Asia and USA.",
    alternates: {
      canonical: "/" + lang + "/" + slug,
      languages: Object.fromEntries(LANGUAGES.map((l) => [l.code, "/" + l.code + "/" + LANG_SLUGS[l.code]])),
    },
    robots: { index: true, follow: true },
  };
}

export default function LangSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
'''
os.makedirs(os.path.join(STAGE, "src/app/[lang]/[slug]"), exist_ok=True)
with open(os.path.join(STAGE, "src/app/[lang]/[slug]/layout.tsx"), "w") as f:
    f.write(slug_layout)
print("slug layout escrito (generateStaticParams mantido - 22 paginas)")

# --- Region Layout (SEM generateStaticParams - era 66 paginas) ---
region_layout = '''import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

const REGION_META: Record<string, { count: number }> = {
  "europa": { count: 14853 },
  "asia": { count: 10328 },
  "eua": { count: 19046 },
};

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string; region: string }> }): Promise<Metadata> {
  const { lang: langCode, region: rc } = await params;
  const lang = langCode as Lang;
  const meta = REGION_META[rc] || { count: 0 };
  const slug = LANG_SLUGS[lang] || "jobs";
  return {
    title: meta.count.toLocaleString() + "+ Jobs | NOSSY",
    description: "Browse " + meta.count.toLocaleString() + "+ tech jobs on NOSSY.",
    alternates: {
      canonical: "/" + lang + "/" + slug + "/" + rc,
    },
    robots: { index: true, follow: true },
  };
}

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
'''
os.makedirs(os.path.join(STAGE, "src/app/[lang]/[slug]/[region]"), exist_ok=True)
with open(os.path.join(STAGE, "src/app/[lang]/[slug]/[region]/layout.tsx"), "w") as f:
    f.write(region_layout)
print("region layout escrito (SEM generateStaticParams)")

# --- Country Layout (SEM generateStaticParams - era 1254 paginas!) ---
country_layout = '''import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

const COUNTRY_EN: Record<string, string> = {
  "japao": "Japan", "coreia-do-sul": "South Korea", "singapura": "Singapore",
  "tailandia": "Thailand", "malasia": "Malaysia", "vietna": "Vietnam",
  "filipinas": "Philippines", "paquistao": "Pakistan", "remoto-global": "Remote",
  "india": "India", "china": "China", "indonesia": "Indonesia",
  "hong-kong": "Hong Kong", "taiwan": "Taiwan", "sri-lanka": "Sri Lanka",
  "bangladesh": "Bangladesh", "nepal": "Nepal",
  "united-states": "United States", "united-kingdom": "United Kingdom",
  "germany": "Germany", "france": "France", "spain": "Spain", "italy": "Italy",
  "netherlands": "Netherlands", "poland": "Poland", "ireland": "Ireland",
  "finland": "Finland", "portugal": "Portugal", "switzerland": "Switzerland",
  "denmark": "Denmark", "norway": "Norway", "sweden": "Sweden", "belgium": "Belgium",
  "austria": "Austria", "czech-republic": "Czech Republic", "romania": "Romania",
  "hungary": "Hungary", "greece": "Greece", "bulgaria": "Bulgaria", "croatia": "Croatia",
  "slovakia": "Slovakia", "slovenia": "Slovenia", "estonia": "Estonia",
  "latvia": "Latvia", "lithuania": "Lithuania", "luxembourg": "Luxembourg",
  "malta": "Malta", "cyprus": "Cyprus", "iceland": "Iceland", "serbia": "Serbia",
  "ukraine": "Ukraine", "bosnia-and-herzegovina": "Bosnia and Herzegovina",
  "montenegro": "Montenegro", "moldova": "Moldova", "albania": "Albania",
  "north-macedonia": "North Macedonia", "georgia": "Georgia",
};

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string; region: string; country: string }> }): Promise<Metadata> {
  const { lang: langCode, region: rc, country: cc } = await params;
  const lang = langCode as Lang;
  const countryEn = COUNTRY_EN[cc] || cc;
  const slug = LANG_SLUGS[lang] || "jobs";
  const pageUrl = "/" + lang + "/" + slug + "/" + rc + "/" + cc;
  return {
    title: "Jobs in " + countryEn + " | NOSSY",
    description: "Find tech jobs in " + countryEn + ". Remote, hybrid and on-site positions. Updated daily on NOSSY.",
    alternates: {
      canonical: pageUrl,
    },
    robots: { index: true, follow: true },
  };
}

export default function CountryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
'''
os.makedirs(os.path.join(STAGE, "src/app/[lang]/[slug]/[region]/[country]"), exist_ok=True)
with open(os.path.join(STAGE, "src/app/[lang]/[slug]/[region]/[country]/layout.tsx"), "w") as f:
    f.write(country_layout)
print("country layout escrito (SEM generateStaticParams - ELIMINADO 1254 paginas estaticas)")

# --- Homepage (slug/page.tsx) - SEM imports estaticos de JSON ---
homepage = '''"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { REGIONS, TOTAL_JOBS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getFlag } from "@/lib/flags";
import { getSectorMeta, getTypeStyle, getTypeLabel, getRegionName } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";

interface Job {
  id: number; title: string; company: string;
  location: string; country: string; countryName: string;
  salary: string; description: string; sector: string; posted: string; type: string; paywall: boolean;
}
interface CountryInfo { name: string; slug: string; region: string; count: number; }

export default function HomePage() {
  const params = useParams();
  const langCode = String(params.lang || "en");
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [latest, setLatest] = useState<Job[]>([]);
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/data/latest_20.json").then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/data/countries.json").then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    ]).then(([jobs, ctry]) => {
      if (cancelled) return;
      setLatest(jobs || []);
      setCountries(ctry || []);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) { setDataError(true); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  function goRegion(r: string) { router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + r); }
  function goCountry(r: string, c: string) { router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + r + "/" + c); }

  const byRegion: Record<string, CountryInfo[]> = {};
  for (const c of countries) { if (!byRegion[c.region]) byRegion[c.region] = []; byRegion[c.region].push(c); }

  if (dataError) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"}>
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3"><SiteLogo size={38} /><span className="text-xl font-bold text-gray-900">NOSSY</span></div>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-4xl mb-3">&#9888;&#65039;</p>
          <p className="text-lg text-gray-500">{T.error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600">Reload</button>
        </main>
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/" + lang + "/" + LANG_SLUGS[lang])} className="flex items-center gap-3 hover:opacity-80">
            <SiteLogo size={38} /><span className="text-xl font-bold text-gray-900 tracking-tight">NOSSY</span>
          </button>
          <LangSelector lang={lang} switchLang={(l) => router.push("/" + l + "/" + LANG_SLUGS[l])} />
        </nav>
      </header>

      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="NOSSY" className="w-28 h-28 sm:w-36 sm:h-36 rounded-[22%] shadow-2xl ring-4 ring-white/20" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">NOSSY</h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-xl mx-auto mb-2 italic">Seek and you shall find.</p>
          <p className="text-base sm:text-lg text-blue-200 max-w-2xl mx-auto mb-10">{T.heroSubtitle}</p>
          <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-3 text-blue-100 text-sm">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" /><strong>{TOTAL_JOBS.toLocaleString()}+</strong> {T.vacancies}</span>
            <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg><strong>57</strong> {T.countries}</span>
            <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg><strong>3</strong> {T.allRegions}</span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="relative w-full sm:w-96 mb-8">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder={T.searchPlaceholder} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white" />
        </div>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{T.browseByRegion}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {REGIONS.map((r) => {
              const sm = getSectorMeta(r.topCategories?.[0]?.name || "Other");
              return (
              <button key={r.code} onClick={() => goRegion(r.code)} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300">
                <div className={"absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity " + sm.color} />
                <div className="relative">
                  <span className="text-4xl mb-3 block">{r.flag}</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{getRegionName(lang, r.code)}</h3>
                  <p className="text-3xl font-extrabold text-sky-600">{r.jobCount.toLocaleString()}+</p>
                  <p className="text-sm text-gray-500 mt-1">{T.vacancies}</p>
                  {byRegion[r.code] && <p className="text-xs text-gray-400 mt-2">{byRegion[r.code].length} {T.countries}</p>}
                </div>
              </button>);
            })}
          </div>
        </section>

        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{T.latestJobs}</h2>
            <button onClick={() => goRegion("europa")} className="text-sky-600 hover:text-sky-700 text-sm font-semibold flex items-center gap-1 group">
              {T.viewAllJobs}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5"><div className="h-4 bg-gray-200 rounded w-1/3 mb-3" /><div className="h-5 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2 mb-3" /><div className="h-3 bg-gray-200 rounded w-full" /></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latest.slice(0, 20).map((job) => {
                const m = getSectorMeta(job.sector); const tc = getTypeStyle(job.type);
                return (
                  <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">
                    <div className={"h-1 w-full bg-gradient-to-r " + m.color} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span><span className="text-xs text-gray-400">{job.posted}</span></div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{job.title}</h3>
                      <p className="text-xs font-medium text-gray-600 mb-2">{job.company}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500"><span>{job.location}</span><span className="text-gray-300">|</span><span className="font-medium text-sky-600">{job.salary}</span></div>
                      <div className="mt-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span></div>
                    </div></article>);
              })}
            </div>)}
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{T.browseByCountry}</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{Array.from({ length: 12 }).map((_, i) => (<div key={i} className="animate-pulse h-24 rounded-xl bg-gray-100" />))}</div>
          ) : (
            <div className="space-y-8">
              {REGIONS.map((region) => {
                const rc = byRegion[region.code] || []; if (!rc.length) return null;
                return (
                  <div key={region.code}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-xl">{region.flag}</span> {getRegionName(lang, region.code)}
                      <span className="text-sm font-normal text-gray-400">({rc.length} {T.countries})</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {rc.sort((a, b) => b.count - a.count).map((c) => (
                        <button key={c.slug} onClick={() => goCountry(region.code, c.slug)} className="group flex flex-col items-center gap-1.5 p-4 rounded-xl border border-gray-100 bg-white hover:border-sky-200 hover:shadow-lg transition-all">
                          <span className="text-3xl">{getFlag(c.slug)}</span>
                          <span className="text-xs font-medium text-gray-800 text-center leading-tight line-clamp-2 group-hover:text-sky-600 transition-colors">{c.name}</span>
                          <span className="text-xs font-bold text-sky-600">{c.count.toLocaleString()}</span>
                        </button>))}
                    </div></div>);
              })}
            </div>)}
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="NOSSY" className="w-12 h-12 rounded-[22%]" />
              <div>
                <span className="font-extrabold text-2xl tracking-tight">NOSSY</span>
                <p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <span>{TOTAL_JOBS.toLocaleString()}+ {T.vacancies}</span>
              <span className="text-gray-600">|</span>
              <span>57 {T.countries}</span>
              <span className="text-gray-600">|</span>
              <span>{T.footerText}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>);
}
'''
os.makedirs(os.path.join(STAGE, "src/app/[lang]/[slug]"), exist_ok=True)
with open(os.path.join(STAGE, "src/app/[lang]/[slug]/page.tsx"), "w") as f:
    f.write(homepage)
print("homepage escrito (SEM imports estaticos de JSON)")

# --- Region Page (ja usa fetch, apenas verificar) ---
region_page = '''"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { REGIONS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getFlag } from "@/lib/flags";
import { getRegionName } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";

interface CountryInfo { name: string; slug: string; region: string; count: number; }

export default function RegionPage() {
  const params = useParams();
  const langCode = String(params.lang || "en");
  const rc = String(params.region || "");
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [regionCountries, setRegionCountries] = useState<CountryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!rc) return;
    let cancelled = false;
    setLoading(true); setDataError(false);
    fetch("/data/countries.json")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((cd: CountryInfo[]) => {
        if (cancelled) return;
        const ac = (cd || []).filter((c) => c.region === rc).sort((a, b) => b.count - a.count);
        setRegionCountries(ac); setLoading(false);
      }).catch(() => { if (!cancelled) { setDataError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [rc]);

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const rCfg = REGIONS.find(r => r.code === rc);
  const rName = getRegionName(lang, rc);
  function goHome() { router.push("/" + lang + "/" + LANG_SLUGS[lang]); }
  function goCountry(s: string) { router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + rc + "/" + s); }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="hover:opacity-80 transition-opacity"><SiteLogo size={38} /></button>
            <button onClick={goHome} className="text-xl font-bold text-gray-900 tracking-tight hover:text-sky-600 transition-colors">NOSSY</button>
            <span className="text-gray-300 mx-2 hidden sm:inline">/</span>
            <span className="text-sky-600 font-semibold hidden sm:inline">{rName}</span>
          </div>
          <LangSelector lang={lang} switchLang={(l) => router.push("/" + l + "/" + LANG_SLUGS[l] + "/" + rc)} />
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={goHome} className="hover:text-sky-600 transition-colors">{T.backToHome}</button>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">{rName}</span>
        </nav>
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">{rCfg?.flag} {rName}</h1>
          <p className="text-gray-500 mt-1">{rCfg?.jobCount.toLocaleString()}+ {T.vacancies}</p>
        </div>
        {dataError ? (
          <div className="text-center py-12 text-gray-400"><p className="text-3xl mb-2">&#9888;&#65039;</p><p>{T.error}</p><button onClick={() => window.location.reload()} className="mt-3 text-sky-600 font-medium text-sm hover:underline">Reload</button></div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">{Array.from({ length: 10 }).map((_, i) => (<div key={i} className="animate-pulse h-24 rounded-xl bg-gray-100" />))}</div>
        ) : (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{T.browseByCountry}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {regionCountries.map((c) => (
                <button key={c.slug} onClick={() => goCountry(c.slug)} className="group flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-sky-200 hover:shadow-lg transition-all text-left">
                  <span className="text-3xl">{getFlag(c.slug)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-sky-600 transition-colors">{c.name}</p>
                    <p className="text-xs font-bold text-sky-600">{c.count.toLocaleString()} {T.jobCount}</p>
                  </div>
                </button>))}
            </div>
          </section>
        )}
      </main>
      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="NOSSY" className="w-12 h-12 rounded-[22%]" />
              <div>
                <span className="font-extrabold text-2xl tracking-tight">NOSSY</span>
                <p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">{T.footerText}</p>
          </div>
        </div>
      </footer>
    </div>);
}
'''
os.makedirs(os.path.join(STAGE, "src/app/[lang]/[slug]/[region]"), exist_ok=True)
with open(os.path.join(STAGE, "src/app/[lang]/[slug]/[region]/page.tsx"), "w") as f:
    f.write(region_page)
print("region page escrito")

# --- Country Page (SEM import estatico de countries.json) ---
country_page = '''"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getTypeStyle, getTypeLabel, getPaywallText, formatSalary, getRegionName, getLocalizedCountryName } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";
import PaywallModal from "@/components/PaywallModal";

interface Job {
  id: number; title: string; company: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  paywall: boolean; contactEmail: string;
}
interface CountryInfo { name: string; slug: string; region: string; count: number; }

export default function CountryPage() {
  const params = useParams();
  const langCode = String(params.lang || "en");
  const rc = String(params.region || "");
  const cc = String(params.country || "");
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [countryName, setCountryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [page, setPage] = useState(1);
  const [paywallJob, setPaywallJob] = useState<Job | null>(null);
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const router = useRouter();
  const PER = 18;

  useEffect(() => {
    if (!rc || !cc) return;
    let cancelled = false;
    setLoading(true); setDataError(false); setLoadProgress(10);
    Promise.all([
      fetch("/api/data/country?file=" + encodeURIComponent(rc + "_" + cc + ".json")).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/data/countries.json").then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    ]).then(([data, ctry]) => {
      if (cancelled) return;
      setLoadProgress(90);
      setAllJobs(data || []);
      setCountries(ctry || []);
      if (data && data.length > 0) {
        const cInfo = (ctry || []).find((c: CountryInfo) => c.slug === cc);
        setCountryName(getLocalizedCountryName(data[0].countryName || cInfo?.name || cc, lang));
      }
      setLoadProgress(100); setLoading(false);
    }).catch(() => { if (!cancelled) { setDataError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [rc, cc]);

  useEffect(() => {
    if (countryName || !cc || countries.length === 0) return;
    const m = countries.find((c: CountryInfo) => c.slug === cc);
    if (m) setCountryName(getLocalizedCountryName(m.name, lang));
  }, [countries, cc, countryName, lang]);

  const filtered = allJobs.filter(j => {
    if (typeFilter && typeFilter !== "all" && j.type?.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (sectorFilter && sectorFilter !== "all" && j.sector !== sectorFilter) return false;
    if (search) { const s = search.toLowerCase(); if (!j.title?.toLowerCase().includes(s) && !j.company?.toLowerCase().includes(s) && !j.sector?.toLowerCase().includes(s)) return false; }
    return true;
  });

  const actualTotal = filtered.length;
  const totalPages = Math.max(1, Math.ceil(actualTotal / PER));
  const paged = filtered.slice((page - 1) * PER, page * PER);
  const workTypes = [...new Set(allJobs.map(j => j.type).filter(Boolean))];
  const sectors = [...new Set(allJobs.map(j => j.sector).filter(Boolean))].sort();

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const rName = getRegionName(lang, rc);
  const pw = getPaywallText(lang);

  const goHome = useCallback(() => router.push("/" + lang + "/" + (LANG_SLUGS[lang] || "jobs")), [lang, router]);
  const goRegion = useCallback(() => router.push("/" + lang + "/" + (LANG_SLUGS[lang] || "jobs") + "/" + rc), [lang, router, rc]);
  useEffect(() => { setPage(1); }, [search, typeFilter, sectorFilter]);

  const hasActiveFilters = typeFilter || sectorFilter || search;
  function clearFilters() { setTypeFilter(""); setSectorFilter(""); setSearch(""); }

  const jobPostingSchema = paged.slice(0, 10).map(job => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description || ("Tech job: " + job.title + " at " + job.company + " in " + job.location),
    "datePosted": job.posted || undefined,
    "hiringOrganization": { "@type": "Organization", "name": job.company },
    "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": job.location?.split(",").pop()?.trim() || countryName, "addressCountry": countryName } },
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "NOSSY", "item": "https://nossy.pro" },
      { "@type": "ListItem", "position": 2, "name": rName, "item": "https://nossy.pro/" + lang + "/" + LANG_SLUGS[lang] + "/" + rc },
      { "@type": "ListItem", "position": 3, "name": countryName || cc, "item": "https://nossy.pro/" + lang + "/" + LANG_SLUGS[lang] + "/" + rc + "/" + cc },
    ],
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <PaywallModal isOpen={!!paywallJob} onClose={() => setPaywallJob(null)} jobId={paywallJob?.id || 0} jobTitle={paywallJob?.title || ""} lang={lang} company={paywallJob?.company || ""} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {jobPostingSchema.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={goHome} className="hover:opacity-80 transition-opacity flex-shrink-0"><SiteLogo size={36} /></button>
            <button onClick={goHome} className="text-lg font-bold text-gray-900 tracking-tight hover:text-sky-600 transition-colors hidden sm:block">NOSSY</button>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <button onClick={goRegion} className="text-sky-600 font-semibold hover:underline hidden md:inline truncate">{rName}</button>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <span className="text-gray-700 font-semibold hidden md:inline truncate">{countryName}</span>
          </div>
          <LangSelector lang={lang} switchLang={(l) => router.push("/" + l + "/" + LANG_SLUGS[l] + "/" + rc + "/" + cc)} />
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <button onClick={goHome} className="hover:text-sky-600 transition-colors">{T.backToHome}</button>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <button onClick={goRegion} className="hover:text-sky-600 transition-colors">{rName}</button>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">{countryName || cc}</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">{T.jobsIn.replace("{0}", countryName || cc)}</h1>
          <p className="text-gray-500 mt-1">{actualTotal.toLocaleString()} {T.vacancies}</p>
        </div>

        <div className="relative w-full sm:w-80 mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={T.searchPlaceholder} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white" />
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{T.filterByType}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTypeFilter("")} className={"px-4 py-2 rounded-full text-sm font-medium border transition-all " + (!typeFilter ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:bg-sky-50")}>{T.allWorkTypes}</button>
            {workTypes.map((t) => (
              <button key={t} onClick={() => setTypeFilter(typeFilter === t ? "" : t)} className={"px-4 py-2 rounded-full text-sm font-medium border transition-all " + (typeFilter === t ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:bg-sky-50")}>{getTypeLabel(lang, t)}</button>
            ))}
          </div>
        </div>

        {sectors.length > 1 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{T.filterByCategory}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSectorFilter("")} className={"px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all " + (!sectorFilter ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300")}>{T.allCategories}</button>
              {sectors.map((s) => {
                const si = getSectorMeta(s);
                return (<button key={s} onClick={() => setSectorFilter(sectorFilter === s ? "" : s)} className={"px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 " + (sectorFilter === s ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300")}><span>{si.icon}</span>{sectorNames[lang]?.[s] || s}</button>);
              })}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs text-gray-500">{filtered.length} {T.vacancies}</span>
            <button onClick={clearFilters} className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              {T.allTypes}
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-sky-500 h-1.5 rounded-full transition-all" style={{ width: loadProgress + "%" }} /></div>
            <p className="text-center text-sm text-gray-400">{T.loading}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5"><div className="h-4 bg-gray-200 rounded w-1/3 mb-3" /><div className="h-5 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2 mb-3" /></div>))}</div>
          </div>
        ) : dataError ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">&#9888;&#65039;</p><p className="text-lg">{T.error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">Reload</button>
          </div>
        ) : actualTotal === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">&#128269;</p>
            <p className="text-lg font-medium text-gray-600">{T.noJobsFound}</p>
            {hasActiveFilters && (<button onClick={clearFilters} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">{T.allTypes}</button>)}
          </div>
        ) : (<>
          <p className="text-sm text-gray-500 mb-4">{T.showing.replace("{0}", String((page - 1) * PER + 1)).replace("{1}", String(Math.min(page * PER, actualTotal))).replace("{2}", actualTotal.toLocaleString())}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{paged.map((job) => {
            const m = getSectorMeta(job.sector); const sn = sectorNames[lang]?.[job.sector] || job.sector; const tc = getTypeStyle(job.type);
            return (
              <a key={job.id} href={"/" + lang + "/" + (LANG_SLUGS[lang] || "jobs") + "/" + rc + "/" + cc + "/" + job.id} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-gray-100 block">
                <div className={"h-1.5 w-full bg-gradient-to-r " + m.color} />
                {job.paywall && <div className="absolute top-3 right-3 z-10"><span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 shadow-sm">{pw.premium}</span></div>}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span><span className="text-xs text-gray-400">{job.posted}</span></div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-sky-600 transition-colors">{job.title}</h3>
                  <p className="text-xs font-medium text-gray-600 mb-1">{job.company}</p>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{job.location}</p>
                  <div className="flex items-center gap-2 text-xs mb-2"><span className="font-bold text-sky-600">{formatSalary(job)}</span></div>
                  <div className="mb-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sn}</span></div>
                  {job.paywall ? (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2 line-clamp-1">{job.description || ""}</p>
                      <button onClick={(e) => { e.stopPropagation(); setPaywallJob(job); }} className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm flex items-center justify-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        {pw.unlock}
                      </button>
                    </div>
                  ) : (<>
                    {job.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{job.description}</p>}
                  </>)}
                </div></a>);
          })}</div>
          {totalPages > 1 && (<div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{T.prevPage}</button>
            <span className="text-sm text-gray-600">{T.pageOf.replace("{0}", String(page)).replace("{1}", String(totalPages))}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{T.nextPage}</button>
          </div>)}
        </>)}
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="NOSSY" className="w-12 h-12 rounded-[22%]" />
              <div>
                <span className="font-extrabold text-2xl tracking-tight">NOSSY</span>
                <p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">{T.footerText}</p>
          </div>
        </div>
      </footer>
    </div>);
}
'''
os.makedirs(os.path.join(STAGE, "src/app/[lang]/[slug]/[region]/[country]"), exist_ok=True)
with open(os.path.join(STAGE, "src/app/[lang]/[slug]/[region]/[country]/page.tsx"), "w") as f:
    f.write(country_page)
print("country page escrito (SEM import estatico de countries.json)")

# --- Job Detail Page (ja usa fetch, manter limpo) ---
job_detail = '''"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { LANGUAGES, LANG_SLUGS, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getRegionName, getLocalizedCountryName } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";

interface Job {
  id: number; title: string; company: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  paywall: boolean; contactEmail: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const langCode = String(params.lang || "en");
  const rc = String(params.region || "");
  const cc = String(params.country || "");
  const jobId = String(params.id || "");
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [countryName, setCountryName] = useState("");
  const router = useRouter();
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const T = i18n[lang] || i18n["en"];
  const goBack = useCallback(() => router.push("/" + lang + "/" + (LANG_SLUGS[lang] || "jobs") + "/" + rc + "/" + cc), [lang, router, rc, cc]);

  useEffect(() => {
    if (!rc || !cc) return;
    let cancelled = false;
    fetch("/api/data/country?file=" + encodeURIComponent(rc + "_" + cc + ".json"))
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Job[]) => {
        if (cancelled) return;
        const found = data.find((j: Job) => String(j.id) === String(jobId));
        if (found) { setJob(found); setCountryName(getLocalizedCountryName(found.countryName || cc, lang)); }
        else { setNotFound(true); }
        setLoading(false);
      }).catch(() => { if (!cancelled) { setNotFound(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [rc, cc, jobId, lang]);

  const getWorkType = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t === "remoto" || t === "remote") return "Remote";
    if (t === "hibrido" || t === "hybrid") return "Hybrid";
    return "On-site";
  };

  const getSalaryText = (j: Job) => {
    if (j.salaryMin && j.salaryMax) return Number(j.salaryMin).toLocaleString() + " - " + Number(j.salaryMax).toLocaleString() + " " + (j.salaryCurrency || "");
    if (j.salary) return j.salary + " " + (j.salaryCurrency || "");
    return "--";
  };

  const sectorIcons: Record<string, string> = { "Software Engineering": "\U0001F4BB", "Cloud & DevOps": "\u2601\uFE0F", "Data Science & Analytics": "\U0001F4CA", "AI & Machine Learning": "\U0001F916", "Cybersecurity": "\U0001F512", "Product Management": "\U0001F4E6", "Consulting": "\U0001F4BC", "Data Engineering": "\U0001F5C2", "UX/UI & Design": "\U0001F3A8", "QA & Testing": "\U0001F9EA", "Mobile Development": "\U0001F4F1", "Game Development": "\U0001F3AE", "Engineering Leadership": "\U0001F454", "Finance Technology": "\U0001F4B0", "Sales & Marketing": "\U0001F4E3", "Writing & Content": "\u270D\uFE0F", "IT Support & Operations": "\U0001F5A5", "R&D": "\U0001F52C", "Other": "\U0001F4CC" };

  const googleLink = job ? "https://www.google.com/search?q=" + encodeURIComponent(job.company + " careers") : "#";
  const jobSchema = job ? { "@context": "https://schema.org", "@type": "JobPosting", "title": job.title, "description": job.description, "datePosted": job.posted || undefined, "hiringOrganization": { "@type": "Organization", "name": job.company }, "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": job.location, "addressCountry": countryName } } } : null;

  const detailLabels: Record<string, string> = {
    title: "Job Details", company: "Company", location: "Location", salary: "Salary",
    category: "Category", workType: "Work Type", posted: "Posted", description: "Description",
    contact: "Contact", noContact: "Contact not available", backToJobs: "Back to Jobs",
    searchCompany: "Search {0} on Google",
  };
  const L = detailLabels;

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      {jobSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }} />}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={goBack} className="hover:opacity-80 transition-opacity flex-shrink-0"><SiteLogo size={36} /></button>
            <button onClick={goBack} className="text-lg font-bold text-gray-900 tracking-tight hover:text-sky-600 transition-colors hidden sm:block">NOSSY</button>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <button onClick={goBack} className="text-sky-600 font-semibold hover:underline hidden md:inline truncate">{countryName}</button>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <span className="text-gray-700 font-semibold hidden md:inline truncate">{L.title}</span>
          </div>
          <LangSelector lang={lang} switchLang={(l) => router.push("/" + l + "/" + LANG_SLUGS[l] + "/" + rc + "/" + cc + "/" + jobId)} />
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <button onClick={goBack} className="hover:text-sky-600 transition-colors">{L.backToJobs}</button>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">{job?.title || "..."}</span>
        </nav>
        {loading ? (
          <div className="space-y-4"><div className="animate-pulse h-8 bg-gray-200 rounded w-3/4" /><div className="animate-pulse h-5 bg-gray-200 rounded w-1/3" /><div className="animate-pulse h-40 bg-gray-100 rounded-xl" /></div>
        ) : notFound || !job ? (
          <div className="text-center py-16 text-gray-400"><p className="text-5xl mb-4">&#128269;</p><p className="text-lg font-medium text-gray-600">{T.noJobsFound}</p><button onClick={goBack} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">{L.backToJobs}</button></div>
        ) : (<div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className={"h-2 w-full bg-gradient-to-r " + getSectorMeta(job.sector).color} />
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-full px-3 py-1 text-xs font-medium border bg-sky-50 text-sky-700 border-sky-200">{getWorkType(job.type)}</span>
                {job.posted && <span className="text-xs text-gray-400">{L.posted}: {job.posted}</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">{job.title}</h1>
              <a href={googleLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-lg font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                {job.company}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.location}</p><p className="text-sm font-semibold text-gray-800 mt-1">{job.location}</p></div>
            <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.salary}</p><p className="text-sm font-bold text-sky-600 mt-1">{getSalaryText(job)}</p></div>
            <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.workType}</p><p className="text-sm font-semibold text-gray-800 mt-1">{getWorkType(job.type)}</p></div>
            <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.category}</p><p className="text-sm text-gray-700 mt-1">{sectorIcons[job.sector] || "\U0001F4CC"} {job.sector}</p></div>
            <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.company}</p><p className="text-sm text-gray-700 mt-1">{job.company}</p></div>
            {job.posted && <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.posted}</p><p className="text-sm text-gray-700 mt-1">{job.posted}</p></div>}
          </div>
          {job.description && <div className="bg-white rounded-xl border border-gray-100 p-6"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{L.description}</p><p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p></div>}
          <div className="bg-white rounded-xl border border-gray-100 p-6"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{L.contact}</p>{job.contactEmail ? <p className="text-sm font-semibold text-sky-600">{job.contactEmail}</p> : <p className="text-sm text-gray-400 italic">{L.noContact}</p>}</div>
          <a href={googleLink} target="_blank" rel="noopener noreferrer" className="block bg-sky-50 border border-sky-200 rounded-xl p-5 hover:bg-sky-100 transition-colors text-center"><p className="text-sm font-semibold text-sky-700">{L.searchCompany.replace("{0}", job.company)}</p></a>
          <button onClick={goBack} className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">{L.backToJobs}</button>
        </div>)}
      </main>
      <footer className="bg-gray-900 text-white py-10 mt-8"><div className="max-w-4xl mx-auto px-4 sm:px-6 text-center"><p className="text-gray-400 text-sm">{T.footerText}</p></div></footer>
    </div>);
}
'''
os.makedirs(os.path.join(STAGE, "src/app/[lang]/[slug]/[region]/[country]/[id]"), exist_ok=True)
with open(os.path.join(STAGE, "src/app/[lang]/[slug]/[region]/[country]/[id]/page.tsx"), "w") as f:
    f.write(job_detail)
print("job detail page escrito (limpo, com fetch e cancel cleanup)")

# ============================================================
# 3. VERIFICACOES FINAIS
# ============================================================

# Garantir que nao existe bun.lock
for lockfile in ["bun.lock", "bun.lockb", "package-lock.json", "yarn.lock"]:
    p = os.path.join(STAGE, lockfile)
    if os.path.exists(p):
        os.remove(p)
        print(f"REMOVIDO: {lockfile}")

# Verificar arquivos criticos
print("\n=== VERIFICACOES ===")
critical = [
    "package.json",
    "next.config.ts",
    "tsconfig.json",
    "src/app/layout.tsx",
    "src/app/page.tsx",
    "src/components/ErrorBoundary.tsx",
    "src/app/[lang]/[slug]/layout.tsx",
    "src/app/[lang]/[slug]/page.tsx",
    "src/app/[lang]/[slug]/[region]/layout.tsx",
    "src/app/[lang]/[slug]/[region]/page.tsx",
    "src/app/[lang]/[slug]/[region]/[country]/layout.tsx",
    "src/app/[lang]/[slug]/[region]/[country]/page.tsx",
    "src/app/[lang]/[slug]/[region]/[country]/[id]/page.tsx",
    "src/lib/i18n.ts",
    "src/lib/shared.ts",
    "src/lib/countries.ts",
    "src/lib/flags.ts",
    "src/components/LangSelector.tsx",
    "src/components/SiteLogo.tsx",
    "src/components/PaywallModal.tsx",
    "src/app/api/data/country/route.ts",
    "src/app/globals.css",
    "public/logo.png",
    "public/favicon.ico",
]

missing = []
for f in critical:
    p = os.path.join(STAGE, f)
    if os.path.exists(p):
        print(f"  OK: {f}")
    else:
        print(f"  FALTANDO: {f}")
        missing.append(f)

if missing:
    print(f"\n!!! ATENCAO: {len(missing)} arquivos criticos faltando !!!")
    for m in missing:
        print(f"  - {m}")
else:
    print(f"\n  Todos os {len(critical)} arquivos criticos presentes.")

# Verificar que NAO tem generateStaticParams nos layouts de country/region
for check_file in [
    "src/app/[lang]/[slug]/[region]/[country]/layout.tsx",
    "src/app/[lang]/[slug]/[region]/layout.tsx",
]:
    p = os.path.join(STAGE, check_file)
    with open(p) as f:
        content = f.read()
    if "generateStaticParams" in content:
        print(f"  ERRO: {check_file} ainda tem generateStaticParams!")
    else:
        print(f"  OK: {check_file} SEM generateStaticParams")

# Verificar que slug layout AINDA tem generateStaticParams
p = os.path.join(STAGE, "src/app/[lang]/[slug]/layout.tsx")
with open(p) as f:
    content = f.read()
if "generateStaticParams" in content:
    print(f"  OK: slug layout MANTÉM generateStaticParams (22 paginas)")
else:
    print(f"  AVISO: slug layout sem generateStaticParams")

# Verificar que paginas cliente NAO importam JSON estaticamente
for check_file in [
    "src/app/[lang]/[slug]/page.tsx",
    "src/app/[lang]/[slug]/[region]/[country]/page.tsx",
]:
    p = os.path.join(STAGE, check_file)
    with open(p) as f:
        content = f.read()
    if 'from "@/data/' in content:
        print(f"  ERRO: {check_file} ainda importa JSON estaticamente!")
    else:
        print(f"  OK: {check_file} SEM imports estaticos de JSON")

# Contar arquivos public/data
public_data = [f for f in os.listdir(os.path.join(STAGE, "public", "data")) if f.endswith(".json")]
print(f"\n  Arquivos public/data/: {len(public_data)}")

# ============================================================
# 4. GERAR ZIP
# ============================================================
print(f"\nGerando ZIP: {OUT}")
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(STAGE):
        for f in files:
            src = os.path.join(root, f)
            arcname = os.path.relpath(src, STAGE)
            zf.write(src, arcname)

zip_size = os.path.getsize(OUT)
file_count = sum(len(files) for _, _, files in os.walk(STAGE))
print(f"\n=== ZIP GERADO ===")
print(f"  Arquivo: {OUT}")
print(f"  Tamanho: {zip_size / 1024 / 1024:.1f} MB")
print(f"  Arquivos: {file_count}")
print(f"\n=== MUDANCAS CRITICAS ===")
print(f"  1. REMOVIDO generateStaticParams do layout de pais (era 1254 paginas)")
print(f"  2. REMOVIDO generateStaticParams do layout de regiao (era 66 paginas)")
print(f"  3. MANTIDO generateStaticParams no layout slug (22 paginas)")
print(f"  4. REMOVIDO imports estaticos de JSON em paginas cliente")
print(f"  5. ADICIONADO ErrorBoundary global no root layout")
print(f"  6. PINADO React 19.1.0 + Next 15.3.3 (sem caret)")
print(f"  7. REMOVIDO ignoreBuildErrors (erros agora sao visiveis)")
print(f"  8. NENHUM bun.lock incluido")
print(f"\nPRONTO PARA DEPLOY NO GITHUB/VERCEL.")
