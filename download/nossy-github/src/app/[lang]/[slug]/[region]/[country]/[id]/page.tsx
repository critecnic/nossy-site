"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LANGUAGES, LANG_SLUGS, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getTypeLabel, getRegionName, getLocalizedCountryName } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";
import countriesData from "@/data/countries.json";

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
const langKeys = ["zh","ja","ko","hi","bn","ar","tr","vi","th","ur","tl","sw"];
for (const k of langKeys) { if (!DL[k]) DL[k] = { ...fbEN }; }

export default function JobDetailPage({ params }: { params: Promise<{ lang: string; slug: string; region: string; country: string; id: string }> }) {
  const { lang: langCode, region: rc, country: cc, id: jobId } = use(params);
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
  }, [rc, cc, jobId]);

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

  const SI: Record<string, string> = { "Software Engineering": "SE", "Cloud & DevOps": "CD", "Data Science & Analytics": "DS", "AI & Machine Learning": "AI", "Cybersecurity": "CS", "Product Management": "PM", "Consulting": "CO", "Data Engineering": "DE", "UX/UI & Design": "UX", "QA & Testing": "QA", "Mobile Development": "MB", "Game Development": "GD", "Engineering Leadership": "EL", "Finance Technology": "FT", "Sales & Marketing": "SM", "Writing & Content": "WC", "IT Support & Operations": "IT", "R&D": "RD", "Other": "OT" };
  const sectorIcons: Record<string, string> = { "Software Engineering": "\u{1F4BB}", "Cloud & DevOps": "\u2601\uFE0F", "Data Science & Analytics": "\u{1F4CA}", "AI & Machine Learning": "\u{1F916}", "Cybersecurity": "\u{1F512}", "Product Management": "\u{1F4E6}", "Consulting": "\u{1F4BC}", "Data Engineering": "\u{1F5C2}", "UX/UI & Design": "\u{1F3A8}", "QA & Testing": "\u{1F9EA}", "Mobile Development": "\u{1F4F1}", "Game Development": "\u{1F3AE}", "Engineering Leadership": "\u{1F454}", "Finance Technology": "\u{1F4B0}", "Sales & Marketing": "\u{1F4E3}", "Writing & Content": "\u270D\uFE0F", "IT Support & Operations": "\u{1F5A5}", "R&D": "\u{1F52C}", "Other": "\u{1F4CC}" };

  const googleLink = job ? "https://www.google.com/search?q=" + encodeURIComponent(job.company + " careers") : "#";
  const jobSchema = job ? { "@context": "https://schema.org", "@type": "JobPosting", "title": job.title, "description": job.description || ("Tech job: " + job.title + " at " + job.company + " in " + job.location), "datePosted": job.posted || undefined, "hiringOrganization": { "@type": "Organization", "name": job.company }, "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": job.location, "addressCountry": countryName } } } : null;

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
          <div className="text-center py-16 text-gray-400"><p className="text-5xl mb-4">\u{1F50D}</p><p className="text-lg font-medium text-gray-600">{T.noJobsFound}</p><button onClick={goBack} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">{L.backToJobs}</button></div>
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