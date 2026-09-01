"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { REGIONS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getRegionName } from "@/lib/shared";
import { getCountryNameTranslated } from "@/lib/country-names";
import SiteLogo from "@/components/SiteLogo";
import NossyBrand from "@/components/NossyBrand";
import LangSelector from "@/components/LangSelector";
import countriesData from "@/data/countries.json";

const SECTOR_ORDER = [
  "Software Engineering",
  "Cloud & DevOps",
  "Data Science & Analytics",
  "AI & Machine Learning",
  "Product Management",
  "Cybersecurity",
  "Engineering Leadership",
  "Data Engineering",
  "UX/UI & Design",
  "Sales & Marketing",
  "QA & Testing",
  "Mobile Development",
  "Embedded & IoT",
  "Game Development",
  "Writing & Content",
  "Research & Development",
  "Consulting",
  "Specialized Development",
  "Finance Technology",
  "IT Support & Operations",
  "Other",
];

export default function SectorsPage({ params }: { params: Promise<{ lang: string; slug: string; region: string; country: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ lang: string; slug: string; region: string; country: string } | null>(null);
  useEffect(() => { params.then(setResolvedParams); }, [params]);
  const langCode = resolvedParams?.lang || '';
  const rc = resolvedParams?.region || '';
  const cc = resolvedParams?.country || '';
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;

  const initialCountryName = countriesData.find((c: any) => c.slug === cc)?.name || '';
  const [countryNameRaw, setCountryNameRaw] = useState(initialCountryName);
  const countryName = countryNameRaw ? getCountryNameTranslated(cc, lang, countryNameRaw) : '';

  const [sectors, setSectors] = useState<{ sector: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const homeHref = "/" + lang + "/" + (LANG_SLUGS[lang] || "jobs");
  const regionHref = homeHref + "/" + rc;
  const countryHref = regionHref + "/" + cc;

  const fetchSectors = useCallback(() => {
    if (!rc || !cc) return;
    setLoading(true);
    const sp = new URLSearchParams({ file: rc + "_" + cc + ".json" });
    fetch("/api/data/sectors?" + sp.toString())
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: { sectors: { sector: string; count: number }[] }) => {
        // Sort by SECTOR_ORDER, then by count
        const ordered = data.sectors.sort((a, b) => {
          const ia = SECTOR_ORDER.indexOf(a.sector);
          const ib = SECTOR_ORDER.indexOf(b.sector);
          if (ia !== -1 && ib !== -1) return ia - ib;
          if (ia !== -1) return -1;
          if (ib !== -1) return 1;
          return b.count - a.count;
        });
        setSectors(ordered);
        setLoading(false);
      })
      .catch(() => { setSectors([]); setLoading(false); });
  }, [rc, cc]);

  useEffect(() => { fetchSectors(); }, [fetchSectors]);

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const rName = getRegionName(lang, rc);

  const sectorSlug = (sector: string) => sector.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href={homeHref} className="hover:opacity-80 transition-opacity flex-shrink-0"><SiteLogo size={36} /></Link>
            <Link href={homeHref} className="hover:opacity-80 transition-colors hidden sm:block"><NossyBrand variant="dark" size={24} className="h-6 w-auto" /></Link>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <Link href={regionHref} className="text-sky-600 font-semibold hover:underline hidden md:inline truncate">{rName}</Link>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <Link href={countryHref} className="text-sky-600 font-semibold hover:underline hidden md:inline truncate">{countryName}</Link>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <span className="text-gray-700 font-semibold hidden md:inline truncate">{T.browseByCategory || 'Categories'}</span>
          </div>
          <LangSelector lang={lang} switchLang={(l) => window.location.href = "/" + l + "/" + LANG_SLUGS[l] + "/" + rc + "/" + cc + "/sectors"} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link href={homeHref} className="hover:text-sky-600 transition-colors">{T.backToHome}</Link>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href={regionHref} className="hover:text-sky-600 transition-colors">{rName}</Link>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href={countryHref} className="hover:text-sky-600 transition-colors">{countryName || cc}</Link>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">{T.browseByCategory || 'Categories'}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">{T.exploreCategories || 'Explore by Category'}</h1>
          <p className="text-gray-500 mt-1">{countryName} — {T.selectCategory || 'Select a category to view related jobs'}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : sectors.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">{T.noJobsFound || 'No categories found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sectors.map(({ sector, count }) => {
              const m = getSectorMeta(sector);
              const sn = sectorNames[lang]?.[sector] || sector;
              return (
                <Link
                  key={sector}
                  href={countryHref + "/sectors/" + sectorSlug(sector)}
                  className="group block rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <div className={"h-1.5 w-full bg-gradient-to-r " + m.color} />
                  <div className="p-5">
                    <h2 className="text-sm font-bold text-gray-900 group-hover:text-sky-600 transition-colors mb-1">{sn}</h2>
                    <p className="text-xs text-gray-500">{count.toLocaleString()} {T.vacancies || 'jobs'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-5">
            <Link href={homeHref} className="flex items-center gap-4">
              <SiteLogo size={48} />
              <div>
                <NossyBrand variant="white" size={36} className="h-9 w-auto" />
                <p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm">{T.footerText}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}