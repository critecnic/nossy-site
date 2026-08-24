"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import { getSectorMeta, getTypeStyle, getTypeLabel, getRegionName, shouldHavePaywall, getPaywallText, formatSalary } from '@/lib/shared';
import { needsTranslation, translateText, translateJob } from '@/lib/translate';
import SiteLogo from '@/components/SiteLogo';
import NossyBrand from '@/components/NossyBrand';
import LangSelector from '@/components/LangSelector';

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number | null; salaryMax: number | null;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  paywall: boolean; contactEmail: string; contactPhone?: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const langCode = String(params.lang || 'en');
  const rc = String(params.region || '');
  const cc = String(params.country || '');
  const jobId = String(params.id || '');
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || 'en') as Lang;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedJob, setTranslatedJob] = useState<{title:string;description:string;company:string;location:string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!rc || !cc || !jobId) return;
    setLoading(true); setDataError(false);
    const baseFile = rc + '_' + cc;
    const loadFile = async (f: string): Promise<Job[]> => {
      try {
        const r = await fetch('/api/data/country?file=' + encodeURIComponent(f + '.json'));
        if (!r.ok) return [];
        return r.json();
      } catch { return []; }
    };
    (async () => {
      try {
        let jobs = await loadFile(baseFile);
        if (!jobs.length) {
          for (let i = 1; i <= 4; i++) {
            const part = await loadFile(baseFile + '-' + i);
            if (part.length) { jobs = part; break; }
          }
        }
        const found = (jobs || []).find((j: Job) => String(j.id) === String(jobId));
        if (found) setJob(found);
        setLoading(false);
      } catch { setDataError(true); setLoading(false); }
    })();
  }, [rc, cc, jobId]);

  const doTranslation = useCallback(async (j: Job, l: Lang) => {
    if (!j || !needsTranslation(l)) {
      setTranslatedJob(j ? { title: j.title, description: j.description, company: j.company, location: j.location } : null);
      setTranslating(false);
      return;
    }
    setTranslating(true);
    try {
      const result = await translateJob(j, l);
      setTranslatedJob(result);
    } catch {
      setTranslatedJob({ title: j.title, description: j.description, company: j.company, location: j.location });
    }
    setTranslating(false);
  }, []);

  useEffect(() => { if (job) doTranslation(job, lang); }, [job, lang, doTranslation]);

  const T = i18n[lang] || i18n['en'];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === 'rtl';
  const rName = getRegionName(lang, rc);
  const pwText = getPaywallText(lang);
  const pw = job ? shouldHavePaywall({ id: job.id, type: job.type, salaryMin: job.salaryMin ?? undefined, salaryMax: job.salaryMax ?? undefined, salaryPeriod: job.salaryPeriod, salaryCurrency: job.salaryCurrency }) : false;
  const isLocked = pw;
  const displayTitle = translatedJob?.title || job?.title || '';
  const displayDescription = translatedJob?.description || job?.description || '';
  const displayCompany = translatedJob?.company || job?.company || '';
  const displayLocation = translatedJob?.location || job?.location || '';
  const salText = job?.salaryMin ? (job.salaryCurrency || '') + ' ' + (job.salaryMin || 0).toLocaleString() + (job.salaryMax ? ' - ' + (job.salaryMax || 0).toLocaleString() : '') : job?.salary || '';

  const homeHref = '/' + lang + '/' + (LANG_SLUGS[lang] || 'jobs');
  const regionHref = homeHref + '/' + rc;
  const countryHref = regionHref + '/' + cc;

  if (loading) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <button onClick={() => router.push(countryHref)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-sky-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {T.backToCountry}
            </button>
            <LangSelector lang={lang} switchLang={(l) => router.push('/' + l + '/' + LANG_SLUGS[l] + '/' + rc + '/' + cc + '/' + jobId)} />
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-32 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (dataError || !job) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <button onClick={() => router.push(countryHref)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-sky-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {T.backToCountry}
            </button>
            <LangSelector lang={lang} switchLang={(l) => router.push('/' + l + '/' + LANG_SLUGS[l] + '/' + rc + '/' + cc + '/' + jobId)} />
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center text-gray-400">
          <p className="text-4xl mb-3">&#128269;</p><p className="text-lg">{T.error}</p>
          <button onClick={() => router.push(countryHref)} className="mt-4 inline-block px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">{T.backToCountry}</button>
        </div>
      </div>
    );
  }

  const m = getSectorMeta(job.sector);
  const sn = sectorNames[lang]?.[job.sector] || job.sector;
  const tc = getTypeStyle(job.type);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => router.push(homeHref)} className="hover:opacity-80 transition-opacity flex-shrink-0"><SiteLogo size={32} /></button>
            <button onClick={() => router.push(homeHref)} className="hover:text-sky-600 transition-colors hidden sm:block"><NossyBrand variant="dark" size={20} className="h-5 w-auto" /></button>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <button onClick={() => router.push(regionHref)} className="text-sky-600 font-semibold hover:underline hidden md:inline truncate text-sm">{rName}</button>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <button onClick={() => router.push(countryHref)} className="text-sky-600 hover:underline hidden md:inline truncate text-sm">{job.countryName || cc}</button>
          </div>
          <LangSelector lang={lang} switchLang={(l) => router.push('/' + l + '/' + LANG_SLUGS[l] + '/' + rc + '/' + cc + '/' + jobId)} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <button onClick={() => router.push(homeHref)} className="hover:text-sky-600 transition-colors">{T.backToHome}</button>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <button onClick={() => router.push(regionHref)} className="hover:text-sky-600 transition-colors">{rName}</button>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <button onClick={() => router.push(countryHref)} className="hover:text-sky-600 transition-colors">{job.countryName || cc}</button>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium truncate max-w-xs">{displayTitle}</span>
        </nav>

        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={"h-2 w-full bg-gradient-to-r " + m.color} />
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={"rounded-full px-3 py-1 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-600">{m.icon} {sn}</span>
              {pw && <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">{pwText.premium}</span>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
              {translating ? <span className="inline-block w-3/4 h-8 bg-gray-200 rounded animate-pulse" /> : displayTitle}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {isLocked ? (
                  <span className="text-gray-300 text-sm">{'***'.repeat(3)}</span>
                ) : (
                  <span className="text-sm font-medium text-gray-900">{translating ? <span className="inline-block w-24 h-4 bg-gray-200 rounded animate-pulse" /> : displayCompany}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-sm text-gray-600">{translating ? <span className="inline-block w-32 h-4 bg-gray-200 rounded animate-pulse" /> : displayLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-bold text-sky-600">{salText}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-sm text-gray-600">{T.postedOn} {job.posted}</span>
              </div>
            </div>

            {isLocked && (
              <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span className="text-sm font-bold text-amber-800">{T.lockedInfo}</span>
                </div>
                <p className="text-xs text-amber-700 mb-3">{T.unlockContactInfo}</p>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{T.descriptionFull}</h2>
              {translating ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-11/12" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-4/5" />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{displayDescription}</div>
              )}
            </div>

            {!isLocked && (
              <div className="mb-6 p-5 rounded-xl bg-sky-50 border border-sky-200">
                <h3 className="text-base font-bold text-sky-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {T.contactInfoTitle}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-sky-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <span className="text-xs text-sky-600 font-medium">{T.companyEmail}</span>
                      {job.contactEmail ? (
                        <a href={'mailto:' + job.contactEmail} className="block text-sm text-gray-900 font-medium hover:text-sky-600 transition-colors">{job.contactEmail}</a>
                      ) : (<span className="block text-sm text-gray-400">{T.notAvailable}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-sky-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                      <span className="text-xs text-sky-600 font-medium">{T.companyPhone}</span>
                      {job.contactPhone ? (
                        <a href={'tel:' + job.contactPhone} className="block text-sm text-gray-900 font-medium hover:text-sky-600 transition-colors">{job.contactPhone}</a>
                      ) : (<span className="block text-sm text-gray-400">{T.notAvailable}</span>)}
                    </div>
                  </div>
                  {job.companyUrl && (
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-sky-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9-9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                      </div>
                      <div>
                        <span className="text-xs text-sky-600 font-medium">{T.companySite}</span>
                        <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-sky-600 font-medium hover:text-sky-700 transition-colors truncate max-w-xs">{job.companyUrl.replace(/^https?:\/\//, '')}</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isLocked && (
              <div className="mb-6 p-5 rounded-xl bg-gray-50 border border-gray-200">
                <h3 className="text-base font-bold text-gray-500 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  {T.contactInfoTitle}
                </h3>
                <p className="mt-4 text-xs text-center text-amber-600 font-medium">{T.payToUnlock}</p>
              </div>
            )}

            {!isLocked && job.companyUrl && (
              <div className="mb-6">
                <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-sky-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  {T.applyOnCompanySite}
                </a>
              </div>
            )}
          </div>
        </article>

        <div className="mt-6 text-center">
          <button onClick={() => router.push(countryHref)} className="text-sm text-sky-600 hover:text-sky-700 font-medium inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {T.seeMoreJobs}
          </button>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push(homeHref)} className="hover:opacity-80 transition-opacity"><SiteLogo size={48} /></button>
              <div>
                <NossyBrand variant="white" size={36} className="h-9 w-auto" />
                <p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">{T.footerText}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}