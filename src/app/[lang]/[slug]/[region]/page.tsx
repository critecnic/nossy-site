"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { REGIONS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import SiteLogo from "@/components/SiteLogo";

interface CountryInfo { name: string; slug: string; region: string; count: number; }

const RN: Record<string, Record<string, string>> = {
  en: { europa: "Europe", asia: "Asia", eua: "United States" },
  "pt-br": { europa: "Europa", asia: "Ásia", eua: "Estados Unidos" },
  "pt-pt": { europa: "Europa", asia: "Ásia", eua: "Estados Unidos" },
  es: { europa: "Europa", asia: "Asia", eua: "Estados Unidos" },
  fr: { europa: "Europe", asia: "Asie", eua: "États-Unis" },
  de: { europa: "Europa", asia: "Asien", eua: "USA" },
  it: { europa: "Europa", asia: "Asia", eua: "Stati Uniti" },
  nl: { europa: "Europa", asia: "Azië", eua: "VS" },
  pl: { europa: "Europa", asia: "Azja", eua: "USA" },
  ru: { europa: "Европа", asia: "Азия", eua: "США" },
  zh: { europa: "欧洲", asia: "亚洲", eua: "美国" },
  ja: { europa: "ヨーロッパ", asia: "アジア", eua: "アメリカ" },
  ko: { europa: "유럽", asia: "아시아", eua: "미국" },
  hi: { europa: "यूरोप", asia: "एशिया", eua: "अमेरिका" },
  bn: { europa: "ইউরোপ", asia: "এশিয়া", eua: "যুক্তরাষ্ট্র" },
  ar: { europa: "أوروبا", asia: "آسيا", eua: "الولايات المتحدة" },
  tr: { europa: "Avrupa", asia: "Asya", eua: "ABD" },
  vi: { europa: "Châu Âu", asia: "Châu Á", eua: "Mỹ" },
  th: { europa: "ยุโรป", asia: "เอเชีย", eua: "อเมริกา" },
  ur: { europa: "یورپ", asia: "ایشیا", eua: "امریکہ" },
  tl: { europa: "Europa", asia: "Asia", eua: "USA" },
  sw: { europa: "Ulaya", asia: "Asia", eua: "Marekani" },
};

const CF: Record<string, string> = {
  "united-kingdom": "🇬🇧", "germany": "🇩🇪", "france": "🇫🇷",
  "sweden": "🇸🇪", "spain": "🇪🇸", "netherlands": "🇳🇱",
  "ireland": "🇮🇪", "switzerland": "🇨🇭", "italy": "🇮🇹",
  "belgium": "🇧🇪", "denmark": "🇩🇰", "norway": "🇳🇴",
  "finland": "🇫🇮", "austria": "🇦🇹", "poland": "🇵🇱",
  "portugal": "🇵🇹", "czech-republic": "🇨🇿", "romania": "🇷🇴",
  "greece": "🇬🇷", "hungary": "🇭🇺", "india": "🇮🇳",
  "china": "🇨🇳", "japao": "🇯🇵", "singapore": "🇸🇬",
  "south-korea": "🇰🇷", "hong-kong": "🇭🇰", "taiwan": "🇹🇼",
  "united-states": "🇺🇸", "remoto-global": "🌍",
};

function LangSelector({ lang, switchLang }: { lang: Lang; switchLang: (l: Lang) => void }) {
  return (
    <select value={lang} onChange={(e) => switchLang(e.target.value as Lang)}
      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer shadow-sm hover:border-sky-300 transition-colors">
      {LANGUAGES.map((l) => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}
    </select>
  );
}

export default function RegionPage({ params }: { params: Promise<{ lang: string; slug: string; region: string }> }) {
  const { lang: langCode, region: rc } = use(params);
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [regionCountries, setRegionCountries] = useState<CountryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!rc) return; setLoading(true);
    fetch("/data/countries.json").then(r => r.json()).then((cd: CountryInfo[]) => {
      const ac = (cd || []).filter((c: CountryInfo) => c.region === rc).sort((a: CountryInfo, b: CountryInfo) => b.count - a.count);
      setRegionCountries(ac); setLoading(false);
    }).catch(() => setLoading(false));
  }, [rc]);

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const rCfg = REGIONS.find(r => r.code === rc);
  const rName = RN[lang]?.[rc] || rc;

  function switchLang(l: Lang) { router.push("/" + l + "/" + LANG_SLUGS[l] + "/" + rc); }
  function goCountry(s: string) { router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + rc + "/" + s); }
  function goHome() { router.push("/" + lang + "/" + LANG_SLUGS[lang]); }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="hover:opacity-80 transition-opacity"><SiteLogo size={38} /></button>
            <button onClick={goHome} className="text-xl font-bold text-gray-900 tracking-tight hover:text-sky-600 transition-colors">Work Versaly</button>
            <span className="text-gray-300 mx-2 hidden sm:inline">/</span>
            <span className="text-sky-600 font-semibold hidden sm:inline">{rName}</span>
          </div>
          <LangSelector lang={lang} switchLang={switchLang} />
        </div>
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
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{T.browseByCountry}</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="animate-pulse h-20 rounded-xl bg-gray-100" />))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {regionCountries.map((c) => (
                <button key={c.slug} onClick={() => goCountry(c.slug)} className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-sky-200 hover:shadow-md transition-all text-left">
                  <span className="text-2xl">{CF[c.slug] || "🏳️"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-sky-600 transition-colors">{c.name}</p>
                    <p className="text-xs font-bold text-sky-600">{c.count.toLocaleString()} {T.jobCount}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
      <footer className="bg-gray-900 text-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3"><SiteLogo size={30} /><span className="font-bold text-lg">Work Versaly</span></div>
            <p className="text-gray-400 text-sm">{T.footerText}</p>
          </div>
        </div>
      </footer>
    </div>);
}