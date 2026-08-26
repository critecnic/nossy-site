"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, countryNames, default as i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import SiteLogo from "@/components/SiteLogo";

const SECTORS = ["Technology", "Finance", "Design", "Marketing", "Data Science", "Sales", "Management", "Healthcare", "Education", "Engineering", "Legal", "HR"];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship", "Freelance"];



export default function CompanyPostPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const router = useRouter();
  const [resolved, setResolved] = useState<{ lang: Lang; slug: string } | null>(null);
  const [step, setStep] = useState<"register" | "form" | "success">("register");
  const [submitting, setSubmitting] = useState(false);

  // Registration form
  const [compName, setCompName] = useState("");
  const [compWebsite, setCompWebsite] = useState("");
  const [compEmail, setCompEmail] = useState("");
  const [compPassword, setCompPassword] = useState("");

  // Job form
  const [jobTitle, setJobTitle] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobCountry, setJobCountry] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobSector, setJobSector] = useState("");
  const [jobType, setJobType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("");

  useEffect(() => {
    params.then((p) => {
      const langCode = p.lang as Lang;
      const expectedSlug = LANG_SLUGS[langCode];
      if (!expectedSlug || p.slug !== expectedSlug) {
        router.replace(`/${langCode}/${expectedSlug}/company/post`);
      } else {
        setResolved({ lang: langCode, slug: p.slug });
      }
    });
  }, [params, router]);

  const lang = resolved?.lang || "en";
  const slug = resolved?.slug || "";
  const T = i18n[lang];
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || "ltr";

  const handleRegister = () => {
    if (compName && compEmail && compPassword) {
      setStep("form");
    }
  };

  const handlePublish = async () => {
    if (!jobTitle || !jobLocation || !jobCountry || !jobDescription || !jobSector || !jobType) return;
    setSubmitting(true);
    try {
      const countryCfg = COUNTRIES.find(c => c.code === jobCountry);
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: compName,
          companyUrl: compWebsite,
          companyEmail: compEmail,
          title: jobTitle,
          location: jobLocation,
          country: jobCountry,
          countryName: countryCfg?.name || jobCountry,
          salary: `${salaryCurrency} ${salaryMin} - ${salaryMax}`,
          salaryMin: Number(salaryMin) || 0,
          salaryMax: Number(salaryMax) || 0,
          salaryCurrency: salaryCurrency || countryCfg?.currency.code || "USD",
          salaryPeriod: "month",
          description: jobDescription,
          sector: jobSector,
          type: jobType,
        }),
      });
      if (res.ok) {
        setStep("success");
      }
    } catch {}
    setSubmitting(false);
  };

  if (!resolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center"><SiteLogo size={48} /><div className="mt-4 text-sm text-gray-400">Loading...</div></div>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";
  const selectClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all appearance-none";

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/${lang}/${slug}`)} className="text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors">{String.fromCodePoint(0x2190)} {T.backToJobs}</button>
            <span className="text-gray-300">|</span>
            <SiteLogo size={28} />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm">
            <span className="text-lg leading-none">{LANGUAGES.find((l) => l.code === lang)?.flag}</span>
            <span className="hidden sm:inline text-xs font-semibold text-gray-600">{LANGUAGES.find((l) => l.code === lang)?.name}</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-14">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{T.companyRegister}</h1>
          <p className="text-gray-300">{T.companyRegisterSub}</p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        {/* Step: Register */}
        {step === "register" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 font-bold text-sm">1</div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{T.companySection}</h2>
                <p className="text-xs text-gray-500">{T.createAccount}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>{T.companyName} *</label>
                <input type="text" value={compName} onChange={(e) => setCompName(e.target.value)} className={inputClass} placeholder="Google, Samsung, Nubank..." />
              </div>
              <div>
                <label className={labelClass}>{T.companyWebsite}</label>
                <input type="url" value={compWebsite} onChange={(e) => setCompWebsite(e.target.value)} className={inputClass} placeholder="https://yourcompany.com" />
              </div>
              <div>
                <label className={labelClass}>{T.companyContactEmail} *</label>
                <input type="email" value={compEmail} onChange={(e) => setCompEmail(e.target.value)} className={inputClass} placeholder="careers@company.com" />
              </div>
              <div>
                <label className={labelClass}>{T.companyPassword} *</label>
                <input type="password" value={compPassword} onChange={(e) => setCompPassword(e.target.value)} className={inputClass} placeholder="********" />
              </div>

              <button
                onClick={handleRegister}
                disabled={!compName || !compEmail || !compPassword}
                className="w-full rounded-xl bg-sky-500 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-sky-600 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >{T.createAccount}</button>
            </div>
          </div>
        )}

        {/* Step: Post Job */}
        {step === "form" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white font-bold text-sm">2</div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{T.jobSection}</h2>
                <p className="text-xs text-gray-500">{compName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>{T.jobTitle} *</label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} placeholder="Senior Software Engineer" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{T.jobLocation} *</label>
                  <input type="text" value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} className={inputClass} placeholder="Lagos, Nairobi, Mumbai..." />
                </div>
                <div>
                  <label className={labelClass}>{T.selectCountry2} *</label>
                  <select value={jobCountry} onChange={(e) => { setJobCountry(e.target.value); const c = COUNTRIES.find(x => x.code === e.target.value); if (c) setSalaryCurrency(c.currency.code); }} className={selectClass}>
                    <option value="">{T.selectCountry2}...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {countryNames[lang]?.[c.code] || c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>{T.jobDescription} *</label>
                <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={4} className={inputClass + " resize-none"} placeholder="Describe the role, responsibilities, and requirements..." />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{T.jobSector} *</label>
                  <select value={jobSector} onChange={(e) => setJobSector(e.target.value)} className={selectClass}>
                    <option value="">{T.allFunctions}...</option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>{sectorNames[lang]?.[s] || s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{T.jobType} *</label>
                  <select value={jobType} onChange={(e) => setJobType(e.target.value)} className={selectClass}>
                    <option value="">{T.allTypes}...</option>
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{T.salaryMinLabel}</label>
                  <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className={inputClass} placeholder="1000" />
                </div>
                <div>
                  <label className={labelClass}>{T.salaryMaxLabel}</label>
                  <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className={inputClass} placeholder="5000" />
                </div>
                <div>
                  <label className={labelClass}>{T.currency}</label>
                  <select value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)} className={selectClass}>
                    <option value="">{T.currency}...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.currency.code}>{c.currency.symbol} {c.currency.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("register")} className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">{String.fromCodePoint(0x2190)}</button>
                <button
                  onClick={handlePublish}
                  disabled={!jobTitle || !jobLocation || !jobCountry || !jobDescription || !jobSector || !jobType || submitting}
                  className="flex-[2] rounded-xl bg-sky-500 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-sky-600 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >{submitting ? "..." : T.publishJob}</button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-12 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{T.jobPublished}</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">{T.jobPublishedSub}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => { setStep("form"); setJobTitle(""); setJobLocation(""); setJobDescription(""); setJobSector(""); setJobType(""); setSalaryMin(""); setSalaryMax(""); }} className="rounded-xl border border-sky-200 px-6 py-3 text-sm font-semibold text-sky-600 hover:bg-sky-50 transition-all">{T.postAnother}</button>
              <button onClick={() => router.push(`/${lang}/${slug}`)} className="rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-sky-600 transition-all">{T.backToJobs}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
