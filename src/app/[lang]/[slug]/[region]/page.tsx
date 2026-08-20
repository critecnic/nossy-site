"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LANGUAGES, LANG_SLUGS, i18n } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import { getRegionName, getLocalizedCountryName } from '@/lib/shared';
import SiteLogo from '@/components/SiteLogo';
import LangSelector from '@/components/LangSelector';
import countriesData from '@/data/countries.json';

export default function RegionPage() {
  const params = useParams();
  const langCode = String(params.lang || 'en');
  const rc = String(params.region || '');
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || 'en') as Lang;
  const [countries, setCountries] = useState<any[]>([]);
  const router = useRouter();
  const T = i18n[lang] || i18n['en'];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === 'rtl';
  const rName = getRegionName(lang, rc);
  const slug = LANG_SLUGS[lang] || 'jobs';
  const ogImage = rc === 'europa' ? '/og/og-europa.png' : rc === 'asia' ? '/og/og-asia.png' : '/og/og-eua.png';

  useEffect(() => {
    const filtered = countriesData.filter((c: any) => c.region === rc);
    setCountries(filtered);
  }, [rc]);

  const goHome = () => router.push('/' + lang + '/' + slug);
  const goCountry = (c: string) => router.push('/' + lang + '/' + slug + '/' + rc + '/' + c);
  const total = countries.reduce((s: number, c: any) => s + c.count, 0);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={goHome} className="hover:opacity-80 transition-opacity flex-shrink-0"><SiteLogo size={36} /></button>
            <button onClick={goHome} className="text-lg font-bold text-gray-900 tracking-tight hover:text-sky-600 transition-colors hidden sm:block">NOSSY</button>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <span className="text-gray-700 font-semibold hidden md:inline">{rName}</span>
          </div>
          <LangSelector lang={lang} switchLang={(l) => router.push('/' + l + '/' + LANG_SLUGS[l] + '/' + rc)} />
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
            <p className="text-gray-500">{total.toLocaleString()}+ {T.vacancies} - {countries.length} {T.countries || 'countries'}</p>
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
