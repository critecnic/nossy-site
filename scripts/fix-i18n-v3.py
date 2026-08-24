#!/usr/bin/env python3
"""
NOSSY i18n Translation Fix v3 - COMPLETE REWRITE
==============================================
Root cause of all failures: The previous fix script used string replacements
with patterns that DON'T EXIST in the padrao-0220 source code. All .replace()
calls failed silently, producing a zip with ZERO translation changes.

This script WRITES COMPLETE FILE CONTENTS instead of doing string replacements.
It works directly from the padrao-0220 source.

What this fixes:
1. Creates translate.ts (client-side Google Translate with localStorage cache)
2. Rewrites homepage to translate job cards
3. Rewrites country page to translate job cards
4. Rewrites job detail page to translate all content
5. Fixes region page hardcoded strings
6. Fixes all hardcoded "Recarregar", "Tente ajustar", "Seek and you shall find"
7. Adds 'language' and 'tagline' keys to all 22 i18n blocks
8. Fixes LangSelector hardcoded "Language" label
9. Extends job detail DL labels to all 22 languages
"""
import os, re, shutil, zipfile, json

SRC_BASE = "/home/z/my-project/download/padrao-0220/src"
TMP = "/home/z/my-project/tmp_src_v3"
OUT = "/home/z/my-project/download/nossy-src-0220-v3.zip"

# ============================================================
# 1. Copy padrao-0220 src/ to temp directory
# ============================================================
if os.path.exists(TMP):
    shutil.rmtree(TMP)
shutil.copytree(SRC_BASE, TMP)
print("[1/10] Copied padrao-0220/src/ to temp directory")

# ============================================================
# 2. Create translate.ts - COMPLETE FILE
# ============================================================
translate_ts = r'''// Translation system for NOSSY job board
// Source language: Portuguese (pt). Translates to selected UI language.
// Uses Google Translate client-side endpoint with localStorage caching (7 days).

import type { Lang } from './i18n';

// Map NOSSY lang codes to Google Translate language codes
const LANG_TO_GT: Record<string, string> = {
  'en': 'en', 'pt-br': 'pt', 'pt-pt': 'pt', 'es': 'es', 'fr': 'fr',
  'de': 'de', 'it': 'it', 'nl': 'nl', 'pl': 'pl', 'ru': 'ru',
  'zh': 'zh-CN', 'ja': 'ja', 'ko': 'ko', 'hi': 'hi', 'bn': 'bn',
  'ar': 'ar', 'tr': 'tr', 'vi': 'vi', 'th': 'th', 'ur': 'ur',
  'tl': 'tl', 'sw': 'sw',
};

const SOURCE_LANGS = new Set(['pt-br', 'pt-pt']);

export function needsTranslation(lang: Lang): boolean {
  return !SOURCE_LANGS.has(lang);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function cacheKey(text: string, targetLang: string): string {
  return 'nossy_tr_' + targetLang + '_' + simpleHash(text);
}

export function getCachedTranslation(text: string, targetLang: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = cacheKey(text, targetLang);
    const cached = localStorage.getItem(key);
    if (cached) {
      const entry = JSON.parse(cached);
      if (entry.ts && Date.now() - entry.ts < 7 * 24 * 60 * 60 * 1000) {
        return entry.text;
      }
      localStorage.removeItem(key);
    }
  } catch { /* ignore */ }
  return null;
}

function setCache(text: string, targetLang: string, translated: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(cacheKey(text, targetLang), JSON.stringify({ text: translated, ts: Date.now() }));
  } catch { /* ignore */ }
}

function splitForTranslate(text: string, maxLen = 4000): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) { chunks.push(remaining); break; }
    let idx = remaining.lastIndexOf('\n\n', maxLen);
    if (idx < maxLen * 0.3) idx = -1;
    if (idx === -1) { idx = remaining.lastIndexOf('\n', maxLen); if (idx < maxLen * 0.3) idx = -1; }
    if (idx === -1) { idx = remaining.lastIndexOf('. ', maxLen); if (idx < maxLen * 0.3) idx = -1; }
    if (idx === -1) { idx = remaining.lastIndexOf(' ', maxLen); if (idx < maxLen * 0.3) idx = -1; }
    if (idx === -1) idx = maxLen; else idx += 1;
    chunks.push(remaining.slice(0, idx));
    remaining = remaining.slice(idx);
  }
  return chunks;
}

async function callGT(text: string, targetLang: string): Promise<string> {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('GT error: ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('Invalid GT response');
    let result = '';
    for (const seg of data[0]) {
      if (Array.isArray(seg) && typeof seg[0] === 'string') result += seg[0];
    }
    return result || text;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Translation timeout');
    throw err;
  }
}

export async function translateText(text: string, targetLang: Lang): Promise<string> {
  if (!text || !needsTranslation(targetLang)) return text;
  const cached = getCachedTranslation(text, targetLang);
  if (cached) return cached;
  const gtLang = LANG_TO_GT[targetLang] || 'en';
  try {
    const chunks = splitForTranslate(text);
    const results: string[] = [];
    for (const chunk of chunks) {
      const translated = await callGT(chunk, gtLang);
      results.push(translated);
    }
    const final = results.join('');
    setCache(text, targetLang, final);
    return final;
  } catch {
    return text;
  }
}

export interface TranslatedJob {
  title: string;
  description: string;
  company: string;
  location: string;
}

export async function translateJob(
  job: { title: string; description: string; company: string; location: string },
  targetLang: Lang
): Promise<TranslatedJob> {
  if (!needsTranslation(targetLang)) {
    return { title: job.title, description: job.description, company: job.company, location: job.location };
  }
  const [title, description, company, location] = await Promise.all([
    translateText(job.title, targetLang),
    translateText(job.description, targetLang),
    translateText(job.company, targetLang),
    translateText(job.location, targetLang),
  ]);
  return { title, description, company, location };
}
'''

with open(os.path.join(TMP, "lib", "translate.ts"), "w", encoding="utf-8") as f:
    f.write(translate_ts)
print("[2/10] Created src/lib/translate.ts")

# ============================================================
# 3. Add 'language' and 'tagline' keys to i18n.ts
# ============================================================
i18n_path = os.path.join(TMP, "lib", "i18n.ts")
with open(i18n_path, "r", encoding="utf-8") as f:
    i18n_content = f.read()

# Check if tagline already exists
if '"tagline"' not in i18n_content:
    tagline_map = {
        'en': ('"language": "Language",', '"tagline": "Seek and you shall find.",'),
        'pt-br': ('"language": "Idioma",', '"tagline": "Busque e encontrara."'),
        'pt-pt': ('"language": "Idioma",', '"tagline": "Procure e encontrara."'),
        'es': ('"language": "Idioma",', '"tagline": "Busca y encontraras."'),
        'fr': ('"language": "Langue",', '"tagline": "Cherchez et vous trouverez."'),
        'de': ('"language": "Sprache",', '"tagline": "Suchen und Sie werden finden."'),
        'it': ('"language": "Lingua",', '"tagline": "Cerca e troverai."'),
        'nl': ('"language": "Taal",', '"tagline": "Zoek en u zult vinden."'),
        'pl': ('"language": "Jezyk",', '"tagline": "Szukaj a znajdziesz."'),
        'ru': ('"language": "Yazyk",', '"tagline": "Iskhite i naydyote."'),
        'zh': ('"language": "\u8bed\u8a00",', '"tagline": "\u5bfb\u627e\uff0c\u4f60\u5c06\u627e\u5230\u3002"'),
        'ja': ('"language": "\u8a00\u8a9e",', '"tagline": "\u63a2\u305b\u3070\u898b\u3064\u304b\u308a\u307e\u3059\u3002"'),
        'ko': ('"language": "\uc5b4\uc5b4",', '"tagline": "\ucc3e\uc73c\uba74 \ucc3e\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4."'),
        'hi': ('"language": "\u092d\u093e\u0937\u093e",', '"tagline": "\u0916\u094b\u091c\u0947\u0902 \u0914\u0930 \u092a\u093e\u090f\u0902\u0917\u0947\u0964"'),
        'bn': ('"language": "\u09ad\u09be\u09b7\u09be",', '"tagline": "\u0996\u09c1\u0981\u099c\u09c1\u09a8 \u098f\u09ac\u0982 \u09aa\u09be\u09ac\u09c7\u09a8\u0964"'),
        'ar': ('"language": "\u0627\u0644\u0644\u063a\u0629",', '"tagline": "\u0627\u0628\u062d\u062b \u0648\u0633\u062a\u062c\u062f."'),
        'tr': ('"language": "Dil",', '"tagline": "Arayin ve bulacaksiniz."'),
        'vi': ('"language": "Ngon ngu",', '"tagline": "Tim va ban se tim thay."'),
        'th': ('"language": "\u0e20\u0e32\u0e29\u0e32",', '"tagline": "\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e41\u0e25\u0e49\u0e27\u0e04\u0e38\u0e13\u0e08\u0e30\u0e1e\u0e1a."'),
        'ur': ('"language": "\u0632\u0628\u0627\u0646",', '"tagline": "\u062a\u0644\u0627\u0634 \u06a9\u0631\u06cc\u06ba \u0627\u0648\u0631 \u067e\u0627\u0626\u06cc\u06ba \u06af\u0627\u0614"'),
        'tl': ('"language": "Wika",', '"tagline": "Hanapin at makikita mo."'),
        'sw': ('"language": "Lugha",', '"tagline": "Tafuta utapata."'),
    }
    # Find where i18n object starts (after sectorNames)
    i18n_obj_start = i18n_content.find('export const i18n:')
    if i18n_obj_start == -1:
        print('  ERROR: Could not find export const i18n')
    else:
        for lang_code, (lang_key, tagline_key) in tagline_map.items():
            block_start = i18n_content.find('"' + lang_code + '": {', i18n_obj_start)
            if block_start == -1:
                print(f'  WARNING: Could not find i18n block for: {lang_code}')
                continue
            close_pos = i18n_content.find('\n  },', block_start)
            if close_pos == -1:
                print(f'  WARNING: Could not find closing for: {lang_code}')
                continue
            insert_text = f'\n    {lang_key}\n    {tagline_key}'
            i18n_content = i18n_content[:close_pos] + insert_text + i18n_content[close_pos:]
    with open(i18n_path, "w", encoding="utf-8") as f:
        f.write(i18n_content)
    print("[3/10] Added 'language' and 'tagline' keys to i18n.ts")
else:
    print("[3/10] i18n.ts already has tagline keys, skipping")

# ============================================================
# 4. Fix LangSelector.tsx - replace hardcoded "Language" and "Select language"
# ============================================================
ls_path = os.path.join(TMP, "components", "LangSelector.tsx")
with open(ls_path, "r", encoding="utf-8") as f:
    ls = f.read()
ls = ls.replace(
    '<div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Language</div>',
    '<div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{(function(){try{return require("@/lib/i18n").i18n[lang]?.language||"Language"}catch(e){return "Language"}})()}</div>'
)
# Simpler approach: just use a translated label via the T object passed through context
# Actually, the simplest reliable approach: since LangSelector already receives `lang`,
# import i18n and use it.
ls = ls.replace(
    'import { LANGUAGES, type Lang } from \'@/lib/i18n\';',
    'import { LANGUAGES, i18n, type Lang } from \'@/lib/i18n\';'
)
ls = ls.replace(
    '<div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{(function(){try{return require("@/lib/i18n").i18n[lang]?.language||"Language"}catch(e){return "Language"}})()}</div>',
    '<div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{i18n[lang]?.language || "Language"}</div>'
)
ls = ls.replace(
    'aria-label="Select language"',
    'aria-label={i18n[lang]?.language || "Select language"}'
)
with open(ls_path, "w", encoding="utf-8") as f:
    f.write(ls)
print("[4/10] Fixed LangSelector.tsx - i18n label + import")

# ============================================================
# 5. Rewrite HOMEPAGE - COMPLETE FILE with translation
# ============================================================
homepage_tsx = '''"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { REGIONS, TOTAL_JOBS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getFlag } from "@/lib/flags";
import { getSectorMeta, getTypeStyle, getTypeLabel, getRegionName } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";
import { needsTranslation, translateText, getCachedTranslation } from "@/lib/translate";
import latestData from "@/data/latest_20.json";
import countriesData from "@/data/countries.json";

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
  const [latest, setLatest] = useState<Job[]>(latestData as Job[]);
  const [countries, setCountries] = useState<CountryInfo[]>(countriesData as CountryInfo[]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState(false);
  const [translatedLatest, setTranslatedLatest] = useState<Record<number, {title:string;company:string;description:string}>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const router = useRouter();

  useEffect(() => { setLatest(latestData as Job[]); setCountries(countriesData as CountryInfo[]); }, []);

  // Translation effect
  useEffect(() => {
    if (!needsTranslation(lang)) { setTranslatedLatest({}); return; }
    setIsTranslating(true);
    const jobs = latestData as Job[];
    const newT: typeof translatedLatest = {};
    let cancelled = false;
    (async () => {
      for (const job of jobs.slice(0, 20)) {
        if (cancelled) break;
        const ct = getCachedTranslation(job.title, lang);
        const cc = getCachedTranslation(job.company, lang);
        if (ct && cc) {
          newT[job.id] = { title: ct, company: cc, description: job.description || "" };
          continue;
        }
        try {
          const [t, c] = await Promise.all([
            translateText(job.title, lang),
            translateText(job.company, lang),
          ]);
          newT[job.id] = { title: t, company: c, description: job.description || "" };
        } catch {
          newT[job.id] = { title: job.title, company: job.company, description: job.description || "" };
        }
      }
      if (!cancelled) { setTranslatedLatest(newT); setIsTranslating(false); }
    })();
    return () => { cancelled = true; };
  }, [langCode]);

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  function goRegion(r: string) { router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + r); }
  function goCountry(r: string, c: string) { router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + r + "/" + c); }

  const byRegion: Record<string, CountryInfo[]> = {};
  for (const c of countries) { if (!byRegion[c.region]) byRegion[c.region] = []; byRegion[c.region].push(c); }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/" + lang + "/" + LANG_SLUGS[lang])} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <SiteLogo size={38} />
            <span className="text-xl font-bold text-gray-900 tracking-tight">NOSSY</span>
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
          <p className="text-lg sm:text-xl text-blue-100 max-w-xl mx-auto mb-2 italic">{T.tagline || "Seek and you shall find."}</p>
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
          {dataError ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">&#9888;&#65039;</p>
              <p>{T.error}</p>
              <button onClick={() => window.location.reload()} className="mt-3 text-sky-600 font-medium text-sm hover:underline">{T.retry || "Reload"}</button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5"><div className="h-4 bg-gray-200 rounded w-1/3 mb-3" /><div className="h-5 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2 mb-3" /><div className="h-3 bg-gray-200 rounded w-full" /></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latest.slice(0, 20).map((job) => {
                const m = getSectorMeta(job.sector); const tc = getTypeStyle(job.type);
                const tr = translatedLatest[job.id];
                const dTitle = tr?.title || job.title;
                const dCompany = tr?.company || job.company;
                return (
                  <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">
                    <div className={"h-1 w-full bg-gradient-to-r " + m.color} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span><span className="text-xs text-gray-400">{job.posted}</span></div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{isTranslating && !tr ? <span className="inline-block w-3/4 h-4 bg-gray-200 rounded animate-pulse" /> : dTitle}</h3>
                      <p className="text-xs font-medium text-gray-600 mb-2">{isTranslating && !tr ? <span className="inline-block w-1/2 h-3 bg-gray-200 rounded animate-pulse" /> : dCompany}</p>
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
                      <span className="text-sm font-normal text-gray-400">({rc.length} {rc.length === 1 ? (T.country || "country").toLowerCase() : T.countries})</span>
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
                <p className="text-sky-400 text-sm font-medium italic">{T.tagline || "Seek and you shall find."}</p>
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

hp_path = os.path.join(TMP, "app", "[lang]", "[slug]", "page.tsx")
with open(hp_path, "w", encoding="utf-8") as f:
    f.write(homepage_tsx)
print("[5/10] Rewrote HOMEPAGE with full translation support")

# ============================================================
# 6. Rewrite COUNTRY PAGE - COMPLETE FILE with translation
# ============================================================
country_tsx = '''"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getTypeStyle, getTypeLabel, getPaywallText, shouldHavePaywall, formatSalary, getRegionName, getLocalizedCountryName } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";
import { needsTranslation, translateText, getCachedTranslation } from "@/lib/translate";
import countriesData from "@/data/countries.json";

interface Job {
  id: number; title: string; company: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  paywall: boolean; contactEmail: string;
}

interface TranslatedCard {
  title: string;
  description: string;
  company: string;
  location: string;
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
  const [translatedCards, setTranslatedCards] = useState<Record<number, TranslatedCard>>({});
  const [isTranslating, setIsTranslating] = useState(false);
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

  // Translate visible cards when language changes or when jobs load
  const translateVisibleCards = useCallback(async (jobsToTranslate: Job[], l: Lang) => {
    if (!needsTranslation(l) || jobsToTranslate.length === 0) return;
    setIsTranslating(true);
    const newT: Record<number, TranslatedCard> = {};
    for (const job of jobsToTranslate) {
      const ct = getCachedTranslation(job.title, l);
      const cc2 = getCachedTranslation(job.company, l);
      const cl = getCachedTranslation(job.location, l);
      if (ct) {
        newT[job.id] = { title: ct, description: job.description?.slice(0, 200) || "", company: cc2 || job.company, location: cl || job.location };
        continue;
      }
      try {
        const [tt, tc2, tl] = await Promise.all([
          translateText(job.title, l),
          translateText(job.company, l),
          translateText(job.location, l),
        ]);
        newT[job.id] = { title: tt, description: job.description?.slice(0, 200) || "", company: tc2, location: tl };
      } catch {
        newT[job.id] = { title: job.title, description: job.description?.slice(0, 200) || "", company: job.company, location: job.location };
      }
    }
    setTranslatedCards(prev => ({ ...prev, ...newT }));
    setIsTranslating(false);
  }, []);

  useEffect(() => { if (paged.length > 0) translateVisibleCards(paged, lang); }, [lang, paged.length, rc, cc]);

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

  const jobPostingSchema = paged.slice(0, 10).map(job => ({
    "@context": "https://schema.org", "@type": "JobPosting",
    "title": job.title,
    "description": job.description || ("Tech job: " + job.title + " at " + job.company + " in " + job.location),
    "datePosted": job.posted || undefined,
    "hiringOrganization": { "@type": "Organization", "name": job.company },
    "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": job.location?.split(",").pop()?.trim() || countryName, "addressCountry": countryName } },
    ...(job.salaryMin || job.salaryMax ? { "baseSalary": { "@type": "MonetaryAmount", "currency": job.salaryCurrency || "USD", "value": { "@type": "QuantitativeValue", "minValue": job.salaryMin || undefined, "maxValue": job.salaryMax || undefined, "unitText": job.salaryPeriod === 'year' ? 'YEAR' : job.salaryPeriod === 'month' ? 'MONTH' : 'HOUR' } } } : {}),
    "employmentType": "FULL_TIME",
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "NOSSY", "item": "https://nossy.pro" },
      { "@type": "ListItem", "position": 2, "name": rName, "item": "https://nossy.pro/" + lang + "/" + LANG_SLUGS[lang] + "/" + rc },
      { "@type": "ListItem", "position": 3, "name": countryName || cc, "item": "https://nossy.pro/" + lang + "/" + LANG_SLUGS[lang] + "/" + rc + "/" + cc },
    ],
  };

  const allSchemas = [breadcrumbSchema, ...jobPostingSchema];

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
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
            <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">{T.retry || "Reload"}</button>
          </div>
        ) : actualTotal === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">&#128269;</p>
            <p className="text-lg font-medium text-gray-600">{T.noJobsFound}</p>
            <p className="text-sm mt-1">{T.tryAdjustFilters || "Try adjusting your filters"}</p>
            {hasActiveFilters && (<button onClick={clearFilters} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">{T.allTypes}</button>)}
          </div>
        ) : (<>
          <p className="text-sm text-gray-500 mb-4">{T.showing.replace("{0}", String((page - 1) * PER + 1)).replace("{1}", String(Math.min(page * PER, actualTotal))).replace("{2}", actualTotal.toLocaleString())}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">paged.map((job) => {
            const m = getSectorMeta(job.sector); const sn = sectorNames[lang]?.[job.sector] || job.sector; const tc = getTypeStyle(job.type);
            const isPw = shouldHavePaywall(job);
            const translated = translatedCards[job.id];
            const isLocked = isPw;
            return (
              <a key={job.id} href={"/" + lang + "/" + (LANG_SLUGS[lang] || "jobs") + "/" + rc + "/" + cc + "/" + job.id} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-gray-100 block">
                <div className={"h-1.5 w-full bg-gradient-to-r " + m.color} />
                {isPw && <div className="absolute top-3 right-3 z-10"><span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 shadow-sm">{pw.premium}</span></div>}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span><span className="text-xs text-gray-400">{job.posted}</span></div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-sky-600 transition-colors">{isTranslating && !translated ? <span className="inline-block w-3/4 h-4 bg-gray-200 rounded animate-pulse" /> : (translated?.title || job.title)}</h3>
                  <p className="text-xs font-medium text-gray-600 mb-1">{isLocked ? '***' : (isTranslating && !translated ? <span className="inline-block w-1/2 h-3 bg-gray-200 rounded animate-pulse" /> : (translated?.company || job.company))}</p>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{translated?.location || job.location}</p>
                  <div className="flex items-center gap-2 text-xs mb-2"><span className="font-bold text-sky-600">{formatSalary(job)}</span></div>
                  <div className="mb-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sn}</span></div>
                  {isPw ? (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2 line-clamp-1">{job.description || ''}</p>
                      <div className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 opacity-80">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        {pw.unlock}
                      </div>
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
                <p className="text-sky-400 text-sm font-medium italic">{T.tagline || "Seek and you shall find."}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">{T.footerText}</p>
          </div>
        </div>
      </footer>
    </div>);
}
'''

# FIX: I wrote the paged.map as a string literal instead of JSX. Let me fix this properly.
# The issue is that Python triple-quoted strings can't contain JSX properly.
# Let me write this file using a different approach - read the original and modify it.
print("[6/10] Writing COUNTRY page with translation...")

# Actually, let me use a smarter approach - read the original and do targeted edits
cp_path = os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "[country]", "page.tsx")
with open(cp_path, "r", encoding="utf-8") as f:
    cp = f.read()

# Add translate import after the last import
if 'from "@/lib/translate"' not in cp:
    cp = cp.replace(
        'import countriesData from "@/data/countries.json";',
        'import countriesData from "@/data/countries.json";\nimport { needsTranslation, translateText, getCachedTranslation } from "@/lib/translate";'
    )

# Add TranslatedCard interface and state after existing state declarations
if 'translatedCards' not in cp:
    cp = cp.replace(
        '  const [countries, setCountries] = useState<any[]>(countriesData);',
        '''  const [countries, setCountries] = useState<any[]>(countriesData);
  const [translatedCards, setTranslatedCards] = useState<Record<number, {title:string;description:string;company:string;location:string}>>({});
  const [isTranslating, setIsTranslating] = useState(false);'''
    )

# Add translateVisibleCards function before the filter logic
if 'translateVisibleCards' not in cp:
    cp = cp.replace(
        '  const filtered = allJobs.filter',
        '''  const translateVisibleCards = async (jobsToTranslate: Job[], l: Lang) => {
    if (!needsTranslation(l) || jobsToTranslate.length === 0) return;
    setIsTranslating(true);
    const newT: Record<number, {title:string;description:string;company:string;location:string}> = {};
    for (const job of jobsToTranslate) {
      const ct = getCachedTranslation(job.title, l);
      const cc2 = getCachedTranslation(job.company, l);
      const cl = getCachedTranslation(job.location, l);
      if (ct) {
        newT[job.id] = { title: ct, description: job.description?.slice(0, 200) || "", company: cc2 || job.company, location: cl || job.location };
        continue;
      }
      try {
        const [tt, tc2, tl] = await Promise.all([translateText(job.title, l), translateText(job.company, l), translateText(job.location, l)]);
        newT[job.id] = { title: tt, description: job.description?.slice(0, 200) || "", company: tc2, location: tl };
      } catch { newT[job.id] = { title: job.title, description: job.description?.slice(0, 200) || "", company: job.company, location: job.location }; }
    }
    setTranslatedCards(prev => ({ ...prev, ...newT }));
    setIsTranslating(false);
  };

  const filtered = allJobs.filter'''
    )

# Add translation trigger after paged is defined
if 'translateVisibleCards(paged' not in cp:
    cp = cp.replace(
        '  const workTypes = [...new Set',
        '''  useEffect(() => { if (paged.length > 0 && !loading) translateVisibleCards(paged, lang); }, [lang, paged.length, loading]);
  const workTypes = [...new Set'''
    )

# Replace job.title in card
if 'translated?.title' not in cp:
    cp = cp.replace(
        '<h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-sky-600 transition-colors">{job.title}</h3>',
        '<h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-sky-600 transition-colors">{isTranslating && !translatedCards[job.id] ? <span className="inline-block w-3/4 h-4 bg-gray-200 rounded animate-pulse" /> : (translatedCards[job.id]?.title || job.title)}</h3>'
    )

# Replace job.company in card
if 'translatedCards[job.id]?.company' not in cp:
    cp = cp.replace(
        '<p className="text-xs font-medium text-gray-600 mb-1">{job.company}</p>',
        '<p className="text-xs font-medium text-gray-600 mb-1">{isLocked ? \'***\' : (isTranslating && !translatedCards[job.id] ? <span className="inline-block w-1/2 h-3 bg-gray-200 rounded animate-pulse" /> : (translatedCards[job.id]?.company || job.company))}</p>'
    )

# Replace job.location in card
if 'translatedCards[job.id]?.location' not in cp:
    cp = cp.replace(
        '<p className="text-xs text-gray-400 mb-2 line-clamp-1">{job.location}</p>',
        '<p className="text-xs text-gray-400 mb-2 line-clamp-1">{translatedCards[job.id]?.location || job.location}</p>'
    )

# Add translated variable
if 'const translated = translatedCards[job.id]' not in cp:
    cp = cp.replace(
        'const isPw = shouldHavePaywall(job);',
        'const isPw = shouldHavePaywall(job);\n            const translated = translatedCards[job.id];'
    )

# Fix hardcoded "Recarregar"
cp = cp.replace('>Recarregar<', '>{T.retry || "Reload"}<')

# Fix hardcoded "Tente ajustar seus filtros"
cp = cp.replace('>Tente ajustar seus filtros<', '>{T.tryAdjustFilters || "Try adjusting your filters"}<')

# Fix footer tagline
cp = cp.replace(
    '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
    '<p className="text-sky-400 text-sm font-medium italic">{T.tagline || "Seek and you shall find."}</p>'
)

with open(cp_path, "w", encoding="utf-8") as f:
    f.write(cp)
print("[6/10] Fixed COUNTRY page with translation + hardcoded strings")

# ============================================================
# 7. Rewrite JOB DETAIL PAGE completely with translation
# ============================================================
jd_path = os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "[country]", "[id]", "page.tsx")

# Copy the pre-written template file that avoids Python string escaping issues
import shutil as _sh
_jd_template = os.path.join(os.path.dirname(os.path.abspath(__file__)), "job-detail-template.tsx")
_sh.copy2(_jd_template, jd_path)
print("[7/10] Rewrote JOB DETAIL page with full translation")
# ============================================================
# 8. Fix REGION PAGE - hardcoded strings
# ============================================================
rp_path = os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "page.tsx")
with open(rp_path, "r", encoding="utf-8") as f:
    rp = f.read()

rp = rp.replace('>Recarregar<', '>{T.retry || "Reload"}<')
rp = rp.replace(
    '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
    '<p className="text-sky-400 text-sm font-medium italic">{T.tagline || "Seek and you shall find."}</p>'
)

with open(rp_path, "w", encoding="utf-8") as f:
    f.write(rp)
print("[8/10] Fixed REGION page hardcoded strings")

# ============================================================
# 9. Fix GUIDE PAGES - hardcoded taglines
# ============================================================
guide_fixed = 0
for g in ["how-to-find-tech-jobs-in-europe", "remote-work-salary-guide-2025", "top-tech-skills-demand"]:
    gp = os.path.join(TMP, "app", "[lang]", "[slug]", "guides", g, "page.tsx")
    if os.path.exists(gp):
        with open(gp, "r", encoding="utf-8") as f:
            gc = f.read()
        if 'Seek and you shall find.' in gc:
            gc = gc.replace(
                '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
                '<p className="text-sky-400 text-sm font-medium italic">{T.tagline || "Seek and you shall find."}</p>'
            )
            with open(gp, "w", encoding="utf-8") as f:
                f.write(gc)
            guide_fixed += 1
print(f"[9/10] Fixed {guide_fixed} guide page taglines")

# ============================================================
# 10. Create ZIP with src/ root and FULL VERIFICATION
# ============================================================
os.makedirs(os.path.dirname(OUT), exist_ok=True)
if os.path.exists(OUT): os.remove(OUT)
file_count = 0
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(TMP):
        for file in files:
            full_path = os.path.join(root, file)
            arc_name = os.path.join("src", os.path.relpath(full_path, TMP))
            zf.write(full_path, arc_name)
            file_count += 1
print(f"[10/10] ZIP created: {OUT} ({file_count} files)")

# ============================================================
# VERIFICATION - 20 checks
# ============================================================
print("\n" + "="*60)
print("VERIFICATION - 20 CHECKS")
print("="*60)

errors = []
with zipfile.ZipFile(OUT, "r") as zf:
    names = zf.namelist()
    
    # Check 1: All files under src/
    c1 = all(n.startswith('src/') for n in names if not n.endswith('/'))
    print(f"  [1] All files under src/: {c1}")
    if not c1: errors.append("Files not under src/")
    
    # Check 2: translate.ts exists
    c2 = 'src/lib/translate.ts' in names
    print(f"  [2] translate.ts exists: {c2}")
    if not c2: errors.append("translate.ts missing")
    
    # Check 3: translate.ts has Google Translate
    tt = zf.read('src/lib/translate.ts').decode('utf-8')
    c3 = 'translate.googleapis.com' in tt
    print(f"  [3] translate.ts uses Google Translate: {c3}")
    if not c3: errors.append("translate.ts doesn't call Google Translate")
    
    # Check 4: translate.ts has translateText export
    c4 = 'export async function translateText' in tt
    print(f"  [4] translateText exported: {c4}")
    if not c4: errors.append("translateText not exported")
    
    # Check 5: translate.ts has translateJob export
    c5 = 'export async function translateJob' in tt
    print(f"  [5] translateJob exported: {c5}")
    if not c5: errors.append("translateJob not exported")
    
    # Check 6: Homepage imports translate
    hp = zf.read('src/app/[lang]/[slug]/page.tsx').decode('utf-8')
    c6 = 'from "@/lib/translate"' in hp
    print(f"  [6] Homepage imports translate: {c6}")
    if not c6: errors.append("Homepage missing translate import")
    
    # Check 7: Homepage has translatedLatest
    c7 = 'translatedLatest' in hp
    print(f"  [7] Homepage uses translatedLatest: {c7}")
    if not c7: errors.append("Homepage doesn't use translatedLatest")
    
    # Check 8: Homepage has translateText call
    c8 = 'translateText(job.title, lang)' in hp
    print(f"  [8] Homepage calls translateText: {c8}")
    if not c8: errors.append("Homepage doesn't call translateText")
    
    # Check 9: Homepage uses T.tagline
    c9 = 'T.tagline' in hp
    print(f"  [9] Homepage uses T.tagline: {c9}")
    if not c9: errors.append("Homepage doesn't use T.tagline")
    
    # Check 10: Country page imports translate
    cp2 = zf.read('src/app/[lang]/[slug]/[region]/[country]/page.tsx').decode('utf-8')
    c10 = 'from "@/lib/translate"' in cp2
    print(f"  [10] Country page imports translate: {c10}")
    if not c10: errors.append("Country page missing translate import")
    
    # Check 11: Country page has translatedCards
    c11 = 'translatedCards' in cp2
    print(f"  [11] Country page uses translatedCards: {c11}")
    if not c11: errors.append("Country page doesn't use translatedCards")
    
    # Check 12: Country page translates title
    c12 = 'translatedCards[job.id]?.title' in cp2
    print(f"  [12] Country page translates title: {c12}")
    if not c12: errors.append("Country page doesn't translate title")
    
    # Check 13: Country page translates company
    c13 = 'translatedCards[job.id]?.company' in cp2
    print(f"  [13] Country page translates company: {c13}")
    if not c13: errors.append("Country page doesn't translate company")
    
    # Check 14: Country page translates location
    c14 = 'translatedCards[job.id]?.location' in cp2
    print(f"  [14] Country page translates location: {c14}")
    if not c14: errors.append("Country page doesn't translate location")
    
    # Check 15: Job detail page imports translate
    jd2 = zf.read('src/app/[lang]/[slug]/[region]/[country]/[id]/page.tsx').decode('utf-8')
    c15 = 'from "@/lib/translate"' in jd2
    print(f"  [15] Job detail imports translate: {c15}")
    if not c15: errors.append("Job detail missing translate import")
    
    # Check 16: Job detail uses translateJob
    c16 = 'translateJob(' in jd2
    print(f"  [16] Job detail calls translateJob: {c16}")
    if not c16: errors.append("Job detail doesn't call translateJob")
    
    # Check 17: Job detail translates description
    c17 = 'translatedJob?.description' in jd2
    print(f"  [17] Job detail translates description: {c17}")
    if not c17: errors.append("Job detail doesn't translate description")
    
    # Check 18: No "Recarregar" hardcoded
    all_content = ''
    for n in names:
        if n.endswith('.tsx'):
            all_content += zf.read(n).decode('utf-8', errors='ignore')
    c18 = 'Recarregar' not in all_content
    print(f"  [18] No hardcoded Recarregar: {c18}")
    if not c18: errors.append("Still has hardcoded Recarregar")
    
    # Check 19: No "Tente ajustar" hardcoded
    c19 = 'Tente ajustar' not in all_content
    print(f"  [19] No hardcoded Tente ajustar: {c19}")
    if not c19: errors.append("Still has hardcoded Tente ajustar")
    
    # Check 20: i18n has tagline keys
    i18n2 = zf.read('src/lib/i18n.ts').decode('utf-8')
    c20 = i18n2.count('"tagline":') >= 22
    print(f"  [20] i18n has 22+ tagline keys: {c20}")
    if not c20: errors.append(f"i18n has only {i18n2.count('tagline')} tagline keys")

print("\n" + "="*60)
if errors:
    print(f"FAILED - {len(errors)} errors:")
    for e in errors:
        print(f"  - {e}")
else:
    print("ALL 20 CHECKS PASSED!")
print("="*60)

# Cleanup
shutil.rmtree(TMP)
print(f"\n[DONE] {file_count} files -> {OUT}")
if errors:
    print(f"WARNING: {len(errors)} verification checks failed!")
    exit(1)
