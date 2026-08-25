"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { REGIONS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getFlag } from "@/lib/flags";
import { getRegionName } from "@/lib/shared";
import { getCountryNameTranslated } from "@/lib/country-names";
import SiteLogo from "@/components/SiteLogo";
import NossyBrand from "@/components/NossyBrand";
import LangSelector from "@/components/LangSelector";
import allCountries from "@/data/countries.json";

interface CountryInfo { name: string; slug: string; region: string; count: number; }

export default function RegionPage({ params }: { params: Promise<{ lang: string; slug: string; region: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ lang: string; slug: string; region: string } | null>(null);
  useEffect(() => { params.then(setResolvedParams); }, [params]);
  const langCode = resolvedParams?.lang || '';
  const rc = resolvedParams?.region || '';
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const regionCountries = (allCountries as CountryInfo[]).filter((c) => c.region === rc).sort((a, b) => b.count - a.count);

  const homeHref = "/" + lang + "/" + LANG_SLUGS[lang];
  const regionHref = homeHref + "/" + rc;

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const rCfg = REGIONS.find(r => r.code === rc);
  const rName = getRegionName(lang, rc);

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={homeHref} className="hover:opacity-80 transition-opacity"><SiteLogo size={38} /></Link>
            <Link href={homeHref} className="hover:text-sky-600 transition-colors"><NossyBrand variant="dark" size={28} className="h-7 w-auto" /></Link>
            <span className="text-gray-300 mx-2 hidden sm:inline">/</span>
            <Link href={regionHref} className="text-sky-600 font-semibold hidden sm:inline hover:underline">{rName}</Link>
          </div>
          <LangSelector lang={lang} switchLang={(l) => window.location.href = "/" + l + "/" + LANG_SLUGS[l] + "/" + rc} />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={homeHref} className="hover:text-sky-600 transition-colors">{T.backToHome}</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">{rName}</span>
        </nav>
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">{rCfg?.flag} {rName}</h1>
          <p className="text-gray-500 mt-1">{rCfg?.jobCount.toLocaleString()}+ {T.vacancies}</p>
        </div>
        <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{T.browseByCountry}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {regionCountries.map((c) => (
                <Link key={c.slug} href={regionHref + "/" + c.slug} className="group flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-sky-200 hover:shadow-lg transition-all text-left">
                  <span className="text-3xl">{getFlag(c.slug)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-sky-600 transition-colors">{getCountryNameTranslated(c.slug, lang, c.name)}</p>
                    <p className="text-xs font-bold text-sky-600">{c.count.toLocaleString()} {T.jobCount}</p>
                  </div>
                </Link>))}
            </div>
        </section>
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
    </div>);
}