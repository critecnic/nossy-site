"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { LANGUAGES, LANG_SLUGS, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getRegionName } from "@/lib/shared";
import { getCountryNameTranslated, getCountryCountLabel } from "@/lib/country-names";
import SiteLogo from "@/components/SiteLogo";
import NossyBrand from "@/components/NossyBrand";
import LangSelector from "@/components/LangSelector";
import allCountries from "@/data/countries.json";
import continentsData from "@/data/continents.json";

interface CountryInfo { name: string; namePt?: string; slug: string; region: string; continent: string; count: number; }

export default function RegionPage({ params }: { params: Promise<{ lang: string; slug: string; region: string }> }) {
  // SSR no idioma correto (use(params) resolve na renderização inicial)
  const { lang: langCode, region: rc } = use(params);
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  // Catálogo mundial: agrupa por CONTINENTE (países com região de dados
  // diferente — ex. Estados Unidos em "eua" — aparecem no continente certo)
  const regionCountries = (allCountries as CountryInfo[])
    .filter((c) => c.continent === rc && c.slug !== "remoto-global")
    .sort((a, b) => b.count - a.count);

  const homeHref = "/" + lang + "/" + LANG_SLUGS[lang];
  const regionHref = homeHref + "/" + rc;

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const rName = getRegionName(lang, rc);
  const continentJobs = (continentsData as { code: string; count: number }[]).find(c => c.code === rc)?.count ?? 0;

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
          <h1 className="text-3xl font-extrabold text-gray-900">{rName}</h1>
          <p className="text-gray-500 mt-1">{continentJobs.toLocaleString()} {T.vacancies} · {getCountryCountLabel(regionCountries.length, lang, T.countries)}</p>
        </div>
        <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{T.browseByCountry}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {regionCountries.map((c) => (
                <Link key={c.region + "/" + c.slug} href={homeHref + "/" + c.region + "/" + c.slug} className="group flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-sky-200 hover:shadow-lg transition-all text-left">
                  <span className="flex-1 min-w-0 text-sm font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">{getCountryNameTranslated(c.slug, lang, c.name)}</span>
                  <span className="text-xs font-bold text-sky-600 whitespace-nowrap">{c.count.toLocaleString()}</span>
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
            <div className="flex flex-col items-center gap-2 text-gray-400 text-sm">
              <a href="mailto:CRITECNIC@OUTLOOK.COM" className="text-sky-400 hover:text-sky-300 transition-colors">Contact: CRITECNIC@OUTLOOK.COM</a>
              <span>{T.footerText}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>);
}