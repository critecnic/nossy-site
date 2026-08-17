#!/usr/bin/env python3
"""
Phase 3: Country layout (NO generateStaticParams), country page with JobPosting schema,
and individual job detail page with full JobPosting schema.
"""

import os

BASE = "/home/z/my-project"
STAGING = os.path.join(BASE, "nossy-deploy-final")

def w(path, content):
    full = os.path.join(STAGING, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)

# ═══════════════════════════════════════════════════════════════
# src/app/[lang]/[slug]/[region]/[country]/layout.tsx
# NO generateStaticParams - this is critical to avoid the build crash
# ═══════════════════════════════════════════════════════════════
w("src/app/[lang]/[slug]/[region]/[country]/layout.tsx", '''import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import countriesData from "@/data/countries.json";

interface CountryInfo { name: string; slug: string; region: string; count: number; }

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

const REGION_EN: Record<string, string> = { europa: "Europe", asia: "Asia", eua: "United States" };

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string; region: string; country: string }> }): Promise<Metadata> {
  const { lang: lc, region: rc, country: cc } = await params;
  const lang = lc as Lang;
  const countryEn = COUNTRY_EN[cc] || cc;
  const regionEn = REGION_EN[rc] || rc;
  const countries = countriesData as CountryInfo[];
  const cInfo = countries.find(c => c.slug === cc);
  const jobCount = cInfo?.count || 0;
  const slug = LANG_SLUGS[lang];
  const pageUrl = "/" + lang + "/" + slug + "/" + rc + "/" + cc;
  const isPt = lang === "pt-br" || lang === "pt-pt";
  const title = jobCount.toLocaleString() + "+ " + (isPt ? "Vagas" : "Jobs") + " in " + countryEn + " | NOSSY";
  const description = isPt
    ? "Encontre " + jobCount.toLocaleString() + "+ vagas de tecnologia em " + countryEn + ", " + regionEn + ". Trabalhe remoto, hibrido ou presencial nas melhores empresas. Atualizado diariamente."
    : "Find " + jobCount.toLocaleString() + "+ tech jobs in " + countryEn + ", " + regionEn + ". Remote, hybrid and on-site positions at top companies. Updated daily.";
  const ogMap: Record<string, string> = { europa: "/og/og-europa.png", asia: "/og/og-asia.png", eua: "/og/og-eua.png" };
  return {
    title, description,
    alternates: { canonical: pageUrl, languages: Object.fromEntries(LANGUAGES.map(l => [l.code, "/" + l.code + "/" + LANG_SLUGS[l.code] + "/" + rc + "/" + cc])) },
    openGraph: { url: pageUrl, title, description, type: "website", siteName: "NOSSY", locale: lang === "pt-br" ? "pt_BR" : lang === "pt-pt" ? "pt_PT" : lang, images: [{ url: ogMap[rc] || "/og/og-default.png", width: 1200, height: 630 }] },
    robots: { index: true, follow: true },
  };
}

export default function CountryLayout({ children }: { children: React.ReactNode }) { return children; }
''')

print("  [country] layout created (NO generateStaticParams, with OG images)")

# ═══════════════════════════════════════════════════════════════
# src/app/[lang]/[slug]/[region]/[country]/page.tsx
# With JobPosting + BreadcrumbList JSON-LD
# ═══════════════════════════════════════════════════════════════
w("src/app/[lang]/[slug]/[region]/[country]/page.tsx", r'''"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getTypeStyle, getTypeLabel, getPaywallText, formatSalary, getRegionName, getLocalizedCountryName } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";
import PaywallModal from "@/components/PaywallModal";
import countriesData from "@/data/countries.json";

interface Job {
  id: number; title: string; company: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  paywall: boolean; contactEmail: string;
}

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
  const [countries, setCountries] = useState<any[]>(countriesData);
  const router = useRouter();
  const PER = 18;

  useEffect(() => { setCountries(countriesData); }, []);

  useEffect(() => {
    if (!rc || !cc) return;
    setLoading(true); setDataError(false); setLoadProgress(10);
    fetch("/api/data/country?file=" + encodeURIComponent(rc + "_" + cc + ".json"))
      .then(r => { setLoadProgress(50); if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Job[]) => {
        setLoadProgress(90);
        setAllJobs(data || []);
        if (data && data.length > 0) setCountryName(getLocalizedCountryName(data[0].countryName || countries.find((c: any) => c.slug === cc)?.name || cc, lang));
        setLoadProgress(100); setLoading(false);
      }).catch(() => { setDataError(true); setLoading(false); });
  }, [rc, cc]);

  useEffect(() => {
    if (countryName || !cc || countries.length === 0) return;
    const m = countries.find((c: any) => c.slug === cc);
    if (m) setCountryName(getLocalizedCountryName(m.name, lang));
  }, [countries, cc, countryName, lang]);

  const filtered = allJobs.filter(j => {
    if (typeFilter && typeFilter !== 'all' && j.type?.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (sectorFilter && sectorFilter !== 'all' && j.sector !== sectorFilter) return false;
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

  // JSON-LD: JobPosting for first 10 jobs on page
  const jobPostingSchema = paged.slice(0, 10).map(job => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description || ("Tech job: " + job.title + " at " + job.company + " in " + job.location),
    "datePosted": job.posted || undefined,
    "hiringOrganization": { "@type": "Organization", "name": job.company },
    "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": job.location?.split(",").pop()?.trim() || countryName, "addressCountry": countryName } },
    ...(job.salaryMin || job.salaryMax ? { "baseSalary": { "@type": "MonetaryAmount", "currency": job.salaryCurrency || "USD", "value": { "@type": "QuantitativeValue", "minValue": job.salaryMin || undefined, "maxValue": job.salaryMax || undefined, "unitText": job.salaryPeriod === 'year' ? 'YEAR' : job.salaryPeriod === 'month' ? 'MONTH' : 'HOUR' } } } : {}),
    "employmentType": "FULL_TIME",
  }));

  // JSON-LD: BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "NOSSY", "item": "https://nossy.pro" },
      { "@type": "ListItem", "position": 2, "name": rName, "item": "https://nossy.pro/" + lang + "/" + LANG_SLUGS[lang] + "/" + rc },
      { "@type": "ListItem", "position": 3, "name": countryName || cc, "item": "https://nossy.pro/" + lang + "/" + LANG_SLUGS[lang] + "/" + rc + "/" + cc },
    ],
  };

  const allSchemas = [breadcrumbSchema, ...jobPostingSchema];

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <PaywallModal isOpen={!!paywallJob} onClose={() => setPaywallJob(null)} jobId={paywallJob?.id || 0} jobTitle={paywallJob?.title || ''} lang={lang} company={paywallJob?.company || ''} />
      {allSchemas.map((schema, i) => (
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
            <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-sky-500 h-1.5 rounded-full transition-all" style={{ width: loadProgress + '%' }} /></div>
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
            <p className="text-sm mt-1">Try adjusting your filters</p>
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
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{job.description || ''}</p>
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
''')

print("  [country] page created (with JobPosting + BreadcrumbList JSON-LD)")

# ═══════════════════════════════════════════════════════════════
# src/app/[lang]/[slug]/[region]/[country]/[id]/page.tsx
# Individual job detail with full JobPosting schema
# ═══════════════════════════════════════════════════════════════
w("src/app/[lang]/[slug]/[region]/[country]/[id]/page.tsx", r'''"use client";

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

const DL: Record<string, Record<string, string>> = {
  en: { title: "Job Details", company: "Company", location: "Location", salary: "Salary", category: "Category", workType: "Work Type", posted: "Posted", description: "Description", contact: "Contact", noContact: "Contact not available", backToJobs: "Back to Jobs", searchCompany: "Search {0} on Google", perYear: "/year", perMonth: "/month", perHour: "/hour" },
  "pt-br": { title: "Detalhes da Vaga", company: "Empresa", location: "Localizacao", salary: "Salario", category: "Categoria", workType: "Tipo de Trabalho", posted: "Publicada em", description: "Descricao", contact: "Contato", noContact: "Contato nao disponivel", backToJobs: "Voltar as Vagas", searchCompany: "Buscar {0} no Google", perYear: "/ano", perMonth: "/mes", perHour: "/hora" },
  "pt-pt": { title: "Detalhes da Vaga", company: "Empresa", location: "Localizacao", salary: "Salario", category: "Categoria", workType: "Tipo de Trabalho", posted: "Publicada em", description: "Descricao", contact: "Contacto", noContact: "Contacto nao disponivel", backToJobs: "Voltar as Vagas", searchCompany: "Pesquisar {0} no Google", perYear: "/ano", perMonth: "/mes", perHour: "/hora" },
  es: { title: "Detalles del Empleo", company: "Empresa", location: "Ubicacion", salary: "Salario", category: "Categoria", workType: "Tipo de Trabajo", posted: "Publicado", description: "Descripcion", contact: "Contacto", noContact: "Contacto no disponible", backToJobs: "Volver a Empleos", searchCompany: "Buscar {0} en Google", perYear: "/ano", perMonth: "/mes", perHour: "/hora" },
  fr: { title: "Details de l'Offre", company: "Entreprise", location: "Localisation", salary: "Salaire", category: "Categorie", workType: "Type de Travail", posted: "Publie", description: "Description", contact: "Contact", noContact: "Contact non disponible", backToJobs: "Retour aux Offres", searchCompany: "Rechercher {0} sur Google", perYear: "/an", perMonth: "/mois", perHour: "/heure" },
  de: { title: "Stellendetails", company: "Unternehmen", location: "Standort", salary: "Gehalt", category: "Kategorie", workType: "Arbeitsart", posted: "Veroffentlicht", description: "Beschreibung", contact: "Kontakt", noContact: "Kein Kontakt verfugbar", backToJobs: "Zuruck zu Stellen", searchCompany: "{0} bei Google suchen", perYear: "/Jahr", perMonth: "/Monat", perHour: "/Stunde" },
  it: { title: "Dettagli dell'Offerta", company: "Azienda", location: "Sede", salary: "Stipendio", category: "Categoria", workType: "Tipo di Lavoro", posted: "Pubblicato", description: "Descrizione", contact: "Contatto", noContact: "Contatto non disponibile", backToJobs: "Torna alle Offerte", searchCompany: "Cerca {0} su Google", perYear: "/anno", perMonth: "/mese", perHour: "/ora" },
  nl: { title: "Vacaturedetails", company: "Bedrijf", location: "Locatie", salary: "Salaris", category: "Categorie", workType: "Werktype", posted: "Geplaatst", description: "Beschrijving", contact: "Contact", noContact: "Geen contact beschikbaar", backToJobs: "Terug naar Vacatures", searchCompany: "{0} zoeken op Google", perYear: "/jaar", perMonth: "/maand", perHour: "/uur" },
  pl: { title: "Szczegoly Oferty", company: "Firma", location: "Lokalizacja", salary: "Wynagrodzenie", category: "Kategoria", workType: "Typ Pracy", posted: "Opublikowano", description: "Opis", contact: "Kontakt", noContact: "Brak danych kontaktowych", backToJobs: "Powrot do Ofert", searchCompany: "Szukaj {0} w Google", perYear: "/rok", perMonth: "/miesiac", perHour: "/godzina" },
  ru: { title: "Detali vakansii", company: "Kompaniya", location: "Mestopolozhenie", salary: "Zarplata", category: "Kategoriya", workType: "Tip zanyatosti", posted: "Opublikovano", description: "Opisanie", contact: "Kontakt", noContact: "Kontakt nedostupen", backToJobs: "Nazad k vakansiyam", searchCompany: "Iskat {0} v Google", perYear: "/god", perMonth: "/mesyac", perHour: "/chas" },
};
const fbEN = DL["en"];
for (const k of ["zh","ja","ko","hi","bn","ar","tr","vi","th","ur","tl","sw"]) { if (!DL[k]) DL[k] = { ...fbEN }; }

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
  const L = DL[lang] || DL["en"];
  const T = i18n[lang] || i18n["en"];
  const goBack = useCallback(() => router.push("/" + lang + "/" + (LANG_SLUGS[lang] || "jobs") + "/" + rc + "/" + cc), [lang, router, rc, cc]);

  useEffect(() => {
    if (!rc || !cc) return;
    fetch("/api/data/country?file=" + encodeURIComponent(rc + "_" + cc + ".json"))
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Job[]) => {
        const found = data.find((j: Job) => String(j.id) === String(jobId));
        if (found) { setJob(found); setCountryName(getLocalizedCountryName(found.countryName || cc, lang)); }
        else { setNotFound(true); }
        setLoading(false);
      }).catch(() => { setNotFound(true); setLoading(false); });
  }, [rc, cc, jobId, lang]);

  const getWorkType = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t === "remoto" || t === "remote") return "Remote";
    if (t === "hibrido" || t === "hybrid") return "Hybrid";
    return "On-site";
  };

  const getSalaryText = (j: Job) => {
    const pL = j.salaryPeriod === "month" ? L.perMonth : j.salaryPeriod === "hour" ? L.perHour : L.perYear;
    if (j.salaryMin && j.salaryMax) return Number(j.salaryMin).toLocaleString() + " - " + Number(j.salaryMax).toLocaleString() + " " + j.salaryCurrency + " " + pL;
    if (j.salary) return j.salary + " " + (j.salaryCurrency ? j.salaryCurrency + " " : "") + pL;
    return "--";
  };

  const sectorIcons: Record<string, string> = { "Software Engineering": "\u{1F4BB}", "Cloud & DevOps": "\u2601\uFE0F", "Data Science & Analytics": "\u{1F4CA}", "AI & Machine Learning": "\u{1F916}", "Cybersecurity": "\u{1F512}", "Product Management": "\u{1F4E6}", "Consulting": "\u{1F4BC}", "Data Engineering": "\u{1F5C2}", "UX/UI & Design": "\u{1F3A8}", "QA & Testing": "\u{1F9EA}", "Mobile Development": "\u{1F4F1}", "Game Development": "\u{1F3AE}", "Engineering Leadership": "\u{1F454}", "Finance Technology": "\u{1F4B0}", "Sales & Marketing": "\u{1F4E3}", "Writing & Content": "\u270D\uFE0F", "IT Support & Operations": "\u{1F5A5}", "R&D": "\u{1F52C}", "Other": "\u{1F4CC}" };

  const googleLink = job ? "https://www.google.com/search?q=" + encodeURIComponent(job.company + " careers") : "#";
  const jobSchema = job ? { "@context": "https://schema.org", "@type": "JobPosting", "title": job.title, "description": job.description || ("Tech job: " + job.title + " at " + job.company + " in " + job.location), "datePosted": job.posted || undefined, "hiringOrganization": { "@type": "Organization", "name": job.company }, "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": job.location, "addressCountry": countryName } }, ...(job.salaryMin || job.salaryMax ? { "baseSalary": { "@type": "MonetaryAmount", "currency": job.salaryCurrency || "USD", "value": { "@type": "QuantitativeValue", "minValue": job.salaryMin || undefined, "maxValue": job.salaryMax || undefined, "unitText": job.salaryPeriod === 'year' ? 'YEAR' : job.salaryPeriod === 'month' ? 'MONTH' : 'HOUR' } } } : {}), "employmentType": "FULL_TIME" } : null;

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
            <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.category}</p><p className="text-sm text-gray-700 mt-1">{sectorIcons[job.sector] || "\u{1F4CC}"} {job.sector}</p></div>
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
''')

print("  [id] job detail page created (with full JobPosting schema)")
print("\n=== Phase 3 Complete: Country layout, country page, job detail page ===")
