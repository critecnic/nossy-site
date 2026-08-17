#!/usr/bin/env python3
"""
Build 4 ZIP fixes for nossy.pro
Each ZIP contains FULL folder structure for GitHub "Upload Files"
"""

import os
import zipfile
import tempfile
import shutil

DOWNLOAD = "/home/z/my-project/download"

def write_file(dirpath: str, filepath: str, content: str):
    """Write content to file, creating dirs as needed."""
    full = os.path.join(dirpath, filepath)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)

def make_zip(zip_name: str, files: dict):
    """Create a ZIP with the given files {path: content}."""
    zip_path = os.path.join(DOWNLOAD, zip_name)
    tmpdir = tempfile.mkdtemp()
    try:
        for fpath, content in files.items():
            write_file(tmpdir, fpath, content)
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, dirs, filenames in os.walk(tmpdir):
                for fn in filenames:
                    full = os.path.join(root, fn)
                    arcname = os.path.relpath(full, tmpdir)
                    zf.write(full, arcname)
        print(f"  OK: {zip_name} ({os.path.getsize(zip_path):,} bytes)")
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


# ============================================================
# ZIP 1: fix1-homepage-undefined.zip
# ============================================================
ZIP1_FILES = {
    "src/app/[lang]/[slug]/layout.tsx": r'''import { Metadata } from "next";
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
  const isPT = lang === "pt-br" || lang === "pt-pt";
  const jobsWord = isPT ? "Vagas" : "Jobs";

  const title = `NOSSY | ${langCfg?.name || lang} | ${total}+ ${jobsWord}`;
  const description = isPT
    ? `NOSSY - Busque e encontre. Navegue por ${total}+ vagas de tecnologia na Europa, Asia e EUA. Pesquisa gratuita!`
    : `NOSSY - Seek and you shall find. Browse ${total}+ tech job vacancies across Europe, Asia and USA. Free to browse!`;
  const pageUrl = `/${lang}/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [l.code, `/${l.code}/${LANG_SLUGS[l.code]}`])
      ),
    },
    openGraph: {
      url: pageUrl,
      title,
      description,
      type: "website",
      siteName: "NOSSY",
    },
    robots: { index: true, follow: true },
  };
}

export default function LangSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
''',
}


# ============================================================
# ZIP 2: fix2-job-metadata.zip
# ============================================================
ZIP2_FILES = {
    "src/app/[lang]/[slug]/[region]/[country]/[id]/layout.tsx": r'''import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getLocalizedCountryName } from "@/lib/shared";
import countriesData from "@/data/countries.json";

interface CountryInfo { name: string; slug: string; region: string; count: number; }

const COUNTRY_EN: Record<string, string> = {
  'japao': 'Japan', 'coreia-do-sul': 'South Korea', 'singapura': 'Singapore',
  'tailandia': 'Thailand', 'malasia': 'Malaysia', 'vietna': 'Vietnam',
  'filipinas': 'Philippines', 'paquistao': 'Pakistan', 'remoto-global': 'Remote',
  'india': 'India', 'china': 'China', 'indonesia': 'Indonesia',
  'hong-kong': 'Hong Kong', 'taiwan': 'Taiwan', 'sri-lanka': 'Sri Lanka',
  'bangladesh': 'Bangladesh', 'nepal': 'Nepal',
  'united-states': 'United States', 'united-kingdom': 'United Kingdom',
  'germany': 'Germany', 'france': 'France', 'spain': 'Spain', 'italy': 'Italy',
  'netherlands': 'Netherlands', 'poland': 'Poland', 'ireland': 'Ireland',
  'finland': 'Finland', 'portugal': 'Portugal', 'switzerland': 'Switzerland',
  'denmark': 'Denmark', 'norway': 'Norway', 'sweden': 'Sweden', 'belgium': 'Belgium',
  'austria': 'Austria', 'czech-republic': 'Czech Republic', 'romania': 'Romania',
  'hungary': 'Hungary', 'greece': 'Greece', 'bulgaria': 'Bulgaria', 'croatia': 'Croatia',
  'slovakia': 'Slovakia', 'slovenia': 'Slovenia', 'estonia': 'Estonia',
  'latvia': 'Latvia', 'lithuania': 'Lithuania', 'luxembourg': 'Luxembourg',
  'malta': 'Malta', 'cyprus': 'Cyprus', 'iceland': 'Iceland', 'serbia': 'Serbia',
  'ukraine': 'Ukraine', 'bosnia-and-herzegovina': 'Bosnia and Herzegovina',
  'montenegro': 'Montenegro', 'moldova': 'Moldova', 'albania': 'Albania',
  'north-macedonia': 'North Macedonia', 'georgia': 'Georgia',
};

const countriesArr = countriesData as unknown as CountryInfo[];

function getCountryEnglish(slug: string): string {
  return COUNTRY_EN[slug] || countriesArr.find(c => c.slug === slug)?.name || slug;
}

async function fetchJob(rc: string, cc: string, jobId: string) {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/data/country?file=${encodeURIComponent(rc + "_" + cc + ".json")}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.find((j: { id: number }) => String(j.id) === String(jobId)) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; region: string; country: string; id: string }>;
}): Promise<Metadata> {
  const { lang: langCode, slug, region: rc, country: cc, id: jobId } = await params;
  const lang = langCode as Lang;
  const isPT = lang === "pt-br" || lang === "pt-pt";
  const pageUrl = `/${lang}/${slug}/${rc}/${cc}/${jobId}`;

  const job = await fetchJob(rc, cc, jobId);

  if (!job) {
    return {
      title: isPT ? "Vaga nao encontrada | NOSSY" : "Job Not Found | NOSSY",
      description: isPT
        ? "A vaga solicitada nao foi encontrada."
        : "The requested job listing was not found.",
      alternates: { canonical: pageUrl },
      robots: { index: false, follow: false },
    };
  }

  const countryEn = getCountryEnglish(cc);
  const countryLocal = getLocalizedCountryName(job.countryName || countryEn, lang);

  const fullDesc = job.description || `${job.title} at ${job.company} in ${job.location}`;
  const shortDesc = fullDesc.length > 160 ? fullDesc.slice(0, 157) + "..." : fullDesc;
  const ogDesc = fullDesc.length > 300 ? fullDesc.slice(0, 297) + "..." : fullDesc;

  const title = `${job.title} - ${job.company} | ${countryLocal} | NOSSY`;

  return {
    title,
    description: shortDesc,
    alternates: {
      canonical: pageUrl,
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [
          l.code,
          `/${l.code}/${LANG_SLUGS[l.code]}/${rc}/${cc}/${jobId}`,
        ])
      ),
    },
    openGraph: {
      url: pageUrl,
      title,
      description: ogDesc,
      type: "article",
      siteName: "NOSSY",
      locale: lang === "pt-br" ? "pt_BR" : lang === "pt-pt" ? "pt_PT" : lang,
    },
    robots: { index: true, follow: true },
  };
}

export default function JobDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
''',
}


# ============================================================
# ZIP 3: fix3-security-headers.zip
# ============================================================
ZIP3_FILES = {
    "next.config.ts": r'''import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; connect-src 'self' https://plausible.io;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
''',
    "vercel.json": r'''{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; connect-src 'self' https://plausible.io;" }
      ]
    }
  ]
}
''',
}


# ============================================================
# ZIP 4: fix4-us-duplication.zip
# ============================================================
ZIP4_FILES = {
    "src/app/[lang]/[slug]/[region]/[country]/layout.tsx": r'''import { Metadata } from 'next';
import { LANGUAGES, LANG_SLUGS } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import countriesData from '@/data/countries.json';

interface CountryInfo { name: string; slug: string; region: string; count: number; }

const COUNTRY_EN: Record<string, string> = {
  'japao': 'Japan', 'coreia-do-sul': 'South Korea', 'singapura': 'Singapore',
  'tailandia': 'Thailand', 'malasia': 'Malaysia', 'vietna': 'Vietnam',
  'filipinas': 'Philippines', 'paquistao': 'Pakistan', 'remoto-global': 'Remote',
  'india': 'India', 'china': 'China', 'indonesia': 'Indonesia',
  'hong-kong': 'Hong Kong', 'taiwan': 'Taiwan', 'sri-lanka': 'Sri Lanka',
  'bangladesh': 'Bangladesh', 'nepal': 'Nepal',
  'united-states': 'United States', 'united-kingdom': 'United Kingdom',
  'germany': 'Germany', 'france': 'France', 'spain': 'Spain', 'italy': 'Italy',
  'netherlands': 'Netherlands', 'poland': 'Poland', 'ireland': 'Ireland',
  'finland': 'Finland', 'portugal': 'Portugal', 'switzerland': 'Switzerland',
  'denmark': 'Denmark', 'norway': 'Norway', 'sweden': 'Sweden', 'belgium': 'Belgium',
  'austria': 'Austria', 'czech-republic': 'Czech Republic', 'romania': 'Romania',
  'hungary': 'Hungary', 'greece': 'Greece', 'bulgaria': 'Bulgaria', 'croatia': 'Croatia',
  'slovakia': 'Slovakia', 'slovenia': 'Slovenia', 'estonia': 'Estonia',
  'latvia': 'Latvia', 'lithuania': 'Lithuania', 'luxembourg': 'Luxembourg',
  'malta': 'Malta', 'cyprus': 'Cyprus', 'iceland': 'Iceland', 'serbia': 'Serbia',
  'ukraine': 'Ukraine', 'bosnia-and-herzegovina': 'Bosnia and Herzegovina',
  'montenegro': 'Montenegro', 'moldova': 'Moldova', 'albania': 'Albania',
  'north-macedonia': 'North Macedonia', 'georgia': 'Georgia',
};

export function generateStaticParams() {
  const countries = countriesData as CountryInfo[];
  const params: { lang: string; slug: string; region: string; country: string }[] = [];
  for (const lang of LANGUAGES) {
    for (const c of countries) {
      params.push({
        lang: lang.code,
        slug: LANG_SLUGS[lang.code],
        region: c.region,
        country: c.slug,
      });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string; region: string; country: string }> }): Promise<Metadata> {
  const { lang: langCode, region: rc, country: cc } = await params;
  const lang = langCode as Lang;
  const countryEn = COUNTRY_EN[cc] || cc;
  const countries = countriesData as CountryInfo[];
  const cInfo = countries.find(c => c.slug === cc);
  const jobCount = cInfo?.count || 0;
  const slug = LANG_SLUGS[lang];
  const pageUrl = `/${lang}/${slug}/${rc}/${cc}`;
  const isPT = lang === 'pt-br' || lang === 'pt-pt';
  const jobsWord = isPT ? 'Vagas' : 'Jobs';

  const title = `${jobCount.toLocaleString()}+ ${jobsWord} in ${countryEn} | NOSSY`;

  // FIX: Only country name in description, NOT region + country
  // This avoids "United States, United States" when region=eua maps to "United States"
  const description = isPT
    ? `Encontre ${jobCount.toLocaleString()}+ vagas de tecnologia em ${countryEn}. Trabalhe remoto, hibrido ou presencial nas melhores empresas. Atualizado diariamente.`
    : `Find ${jobCount.toLocaleString()}+ tech jobs in ${countryEn}. Remote, hybrid and on-site positions at top companies. Updated daily.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: Object.fromEntries(LANGUAGES.map(l => [l.code, `/${l.code}/${LANG_SLUGS[l.code]}/${rc}/${cc}`])),
    },
    openGraph: {
      url: pageUrl,
      title,
      description,
      type: 'website',
      siteName: 'NOSSY',
      locale: lang === 'pt-br' ? 'pt_BR' : lang === 'pt-pt' ? 'pt_PT' : lang,
    },
    robots: { index: true, follow: true },
  };
}

export default function CountryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
''',
}


# ============================================================
# BUILD ALL
# ============================================================
if __name__ == "__main__":
    print("Building 4 ZIP fixes for nossy.pro...\n")

    print("[ZIP 1] fix1-homepage-undefined.zip")
    make_zip("fix1-homepage-undefined.zip", ZIP1_FILES)

    print("[ZIP 2] fix2-job-metadata.zip")
    make_zip("fix2-job-metadata.zip", ZIP2_FILES)

    print("[ZIP 3] fix3-security-headers.zip")
    make_zip("fix3-security-headers.zip", ZIP3_FILES)

    print("[ZIP 4] fix4-us-duplication.zip")
    make_zip("fix4-us-duplication.zip", ZIP4_FILES)

    print("\n=== ALL 4 ZIPS CREATED SUCCESSFULLY ===")
    print(f"Location: {DOWNLOAD}/")
