"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { LANGUAGES, LANG_SLUGS, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getRegionName, getLocalizedCountryName, getTypeLabel, getSectorLabel } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";
import PaddlePayment from "@/components/PaddlePayment";

interface Job {
  id: number; title: string; company: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  paywall: boolean; contactEmail: string;
  paywallReason?: string;
}

const DL: Record<string, Record<string, string>> = {
  en: { title: "Job Details", company: "Company", location: "Location", salary: "Salary", category: "Category", workType: "Work Type", posted: "Posted", description: "Description", contact: "Contact", noContact: "Contact not available", backToJobs: "Back to Jobs", viewOnCompany: "View on {0} Career Page", perYear: "/year", perMonth: "/month", perHour: "/hour", unlockContact: "Unlock Contact", agencyJob: "This job is from a partner platform. Apply directly:", fullDescNote: "Full description available after unlocking contact." },
  "pt-br": { title: "Detalhes da Vaga", company: "Empresa", location: "Localizacao", salary: "Salario", category: "Categoria", workType: "Tipo de Trabalho", posted: "Publicada em", description: "Descricao", contact: "Contato", noContact: "Contato nao disponivel", backToJobs: "Voltar as Vagas", viewOnCompany: "Ver no site de carreira da {0}", perYear: "/ano", perMonth: "/mes", perHour: "/hora", unlockContact: "Desbloquear Contato", agencyJob: "Vaga de plataforma parceira. Aplique diretamente:", fullDescNote: "Descricao completa disponivel apos desbloquear o contato." },
  "pt-pt": { title: "Detalhes da Vaga", company: "Empresa", location: "Localizacao", salary: "Salario", category: "Categoria", workType: "Tipo de Trabalho", posted: "Publicada em", description: "Descricao", contact: "Contacto", noContact: "Contacto nao disponivel", backToJobs: "Voltar as Vagas", viewOnCompany: "Ver no site de carreira da {0}", perYear: "/ano", perMonth: "/mes", perHour: "/hora", unlockContact: "Desbloquear Contacto", agencyJob: "Vaga de plataforma parceira. Aplique diretamente:", fullDescNote: "Descricao completa disponivel apos desbloquear o contacto." },
  es: { title: "Detalles del Empleo", company: "Empresa", location: "Ubicacion", salary: "Salario", category: "Categoria", workType: "Tipo de Trabajo", posted: "Publicado", description: "Descripcion", contact: "Contacto", noContact: "Contacto no disponible", backToJobs: "Volver a Empleos", viewOnCompany: "Ver en la pagina de empleos de {0}", perYear: "/ano", perMonth: "/mes", perHour: "/hora", unlockContact: "Desbloquear Contacto", agencyJob: "Oferta de plataforma asociada. Aplique directamente:", fullDescNote: "Descripcion completa disponible tras desbloquear el contacto." },
  fr: { title: "Details de l'Offre", company: "Entreprise", location: "Localisation", salary: "Salaire", category: "Categorie", workType: "Type de Travail", posted: "Publie", description: "Description", contact: "Contact", noContact: "Contact non disponible", backToJobs: "Retour aux Offres", viewOnCompany: "Voir sur la page carriere de {0}", perYear: "/an", perMonth: "/mois", perHour: "/heure", unlockContact: "Debloquer le Contact", agencyJob: "Offre d'une plateforme partenaire. Postulez directement:", fullDescNote: "Description complete disponible apres deblocage du contact." },
  de: { title: "Stellendetails", company: "Unternehmen", location: "Standort", salary: "Gehalt", category: "Kategorie", workType: "Arbeitsart", posted: "Veroffentlicht", description: "Beschreibung", contact: "Kontakt", noContact: "Kein Kontakt verfugbar", backToJobs: "Zuruck zu Stellen", viewOnCompany: "Auf der Karriereseite von {0} ansehen", perYear: "/Jahr", perMonth: "/Monat", perHour: "/Stunde", unlockContact: "Kontakt freischalten", agencyJob: "Stellenangebot von einer Partnerplattform. Bewerben Sie sich direkt:", fullDescNote: "Vollstandige Beschreibung nach Freischaltung verfugbar." },
  it: { title: "Dettagli dell'Offerta", company: "Azienda", location: "Sede", salary: "Stipendio", category: "Categoria", workType: "Tipo di Lavoro", posted: "Pubblicato", description: "Descrizione", contact: "Contatto", noContact: "Contatto non disponibile", backToJobs: "Torna alle Offerte", viewOnCompany: "Vedi sulla pagina carriere di {0}", perYear: "/anno", perMonth: "/mese", perHour: "/ora", unlockContact: "Sblocca Contatto", agencyJob: "Offerta da piattaforma partner. Candidati direttamente:", fullDescNote: "Descrizione completa disponibile dopo lo sblocco." },
  nl: { title: "Vacaturedetails", company: "Bedrijf", location: "Locatie", salary: "Salaris", category: "Categorie", workType: "Werktype", posted: "Geplaatst", description: "Beschrijving", contact: "Contact", noContact: "Geen contact beschikbaar", backToJobs: "Terug naar Vacatures", viewOnCompany: "Bekijk op de carrierepagina van {0}", perYear: "/jaar", perMonth: "/maand", perHour: "/uur", unlockContact: "Contact ontgrendelen", agencyJob: "Vacature van een partnerplatform. Solliciteer direct:", fullDescNote: "Volledige beschrijving beschikbaar na ontgrendeling." },
  pl: { title: "Szczegoly Oferty", company: "Firma", location: "Lokalizacja", salary: "Wynagrodzenie", category: "Kategoria", workType: "Typ Pracy", posted: "Opublikowano", description: "Opis", contact: "Kontakt", noContact: "Brak danych kontaktowych", backToJobs: "Powrot do Ofert", viewOnCompany: "Zobacz na stronie karier {0}", perYear: "/rok", perMonth: "/miesiac", perHour: "/godzina", unlockContact: "Odblokuj Kontakt", agencyJob: "Oferta z platformy partnerskiej. Aplikuj bezposrednio:", fullDescNote: "Pelny opis dostepny po odblokowaniu kontaktu." },
  ru: { title: "Detali vakansii", company: "Kompaniya", location: "Mestopolozhenie", salary: "Zarplata", category: "Kategoriya", workType: "Tip zanyatosti", posted: "Opublikovano", description: "Opisanie", contact: "Kontakt", noContact: "Kontakt nedostupen", backToJobs: "Nazad k vakansiyam", viewOnCompany: "Smotret' na stranitse kar'ery {0}", perYear: "/god", perMonth: "/mesyac", perHour: "/chas", unlockContact: "Razblokirovat' kontakt", agencyJob: "Vakansiya s partnerskoj platformy. Otkliknites' napryamuyu:", fullDescNote: "Polnoe opisanie dostupno posle razblokirovki kontakta." },
};

const fbEN = DL["en"];
const langKeys = ["zh","ja","ko","hi","bn","ar","tr","vi","th","ur","tl","sw"];
for (const k of langKeys) { if (!DL[k]) DL[k] = { ...fbEN }; }

// ============================================================
// Company career page URLs — direct links to apply
// ============================================================
const COMPANY_CAREERS: Record<string, string> = {
  "Amazon": "https://www.amazon.jobs",
  "Google": "https://careers.google.com",
  "Microsoft": "https://careers.microsoft.com",
  "Apple": "https://jobs.apple.com",
  "Meta": "https://www.metacareers.com",
  "Stripe": "https://stripe.com/jobs",
  "JPMorgan Chase": "https://careers.jpmorgan.com",
  "Vercel": "https://vercel.com/careers",
  "Palantir": "https://www.palantir.com/careers",
  "Cisco": "https://jobs.cisco.com",
  "Postman": "https://www.postman.com/company/careers",
  "Workday": "https://www.workday.com/careers",
  "Rivian": "https://rivian.com/careers",
  "Oracle": "https://www.oracle.com/careers",
  "IBM": "https://www.ibm.com/careers",
  "Dell Technologies": "https://jobs.dell.com",
  "Dropbox": "https://www.dropbox.com/jobs",
  "Boeing": "https://boeing.com/careers",
  "VMware": "https://careers.vmware.com",
  "HP Inc": "https://jobs.hp.com",
  "DoorDash": "https://careers.doordash.com",
  "HashiCorp": "https://www.hashicorp.com/careers",
  "Zoom": "https://zoom.us/careers",
  "Grafana Labs": "https://grafana.com/about/careers",
  "Morgan Stanley": "https://www.morganstanley.com/people",
  "Intel": "https://www.intel.com/content/www/us/en/jobs.html",
  "Figma": "https://www.figma.com/careers",
  "MongoDB": "https://www.mongodb.com/careers",
  "Zscaler": "https://www.zscaler.com/company/careers",
  "Linear": "https://linear.app/careers",
  "Shopify": "https://www.shopify.com/careers",
  "Salesforce": "https://www.salesforce.com/company/careers",
  "Adobe": "https://www.adobe.com/careers.html",
  "Netflix": "https://jobs.netflix.com",
  "NVIDIA": "https://www.nvidia.com/en-us/about-nvidia/careers",
  "Tesla": "https://www.tesla.com/careers",
  "Uber": "https://www.uber.com/careers",
  "Spotify": "https://www.lifeatspotify.com",
  "Airbnb": "https://careers.airbnb.com",
  "Slack": "https://slack.com/careers",
  "Twilio": "https://www.twilio.com/en-us/company/jobs",
  "Cloudflare": "https://www.cloudflare.com/careers",
  "Datadog": "https://www.datadoghq.com/careers",
  "Snowflake": "https://careers.snowflake.com",
  "Databricks": "https://www.databricks.com/company/careers",
  "Coinbase": "https://www.coinbase.com/careers",
  "Kraken": "https://jobs.kraken.com",
  "PayPal": "https://www.paypal.com/us/webapps/mpp/jobs",
  "SAP": "https://www.sap.com/about/careers",
  "ServiceNow": "https://www.servicenow.com/careers",
  "Atlassian": "https://www.atlassian.com/company/careers",
  "GitHub": "https://github.com/about/careers",
  "GitLab": "https://about.gitlab.com/jobs",
  "HubSpot": "https://www.hubspot.com/careers",
  "Notion": "https://www.notion.so/careers",
  "Canva": "https://www.canva.com/careers",
  "Robinhood": "https://robinhood.com/us/en/careers",
  "Block": "https://block.xyz/careers",
  "Square": "https://block.xyz/careers",
  "Plaid": "https://plaid.com/careers",
  "Wise": "https://wise.com/jobs",
  "Revolut": "https://www.revolut.com/careers",
  "Nubank": "https://nubank.com.br/carreiras",
  "Deel": "https://www.deel.com/careers",
  "Remote": "https://remote.com/careers",
  "Automattic": "https://automattic.com/work-with-us",
  "Shopify": "https://www.shopify.com/careers",
};

// Agencias/plataformas concorrentes — nao linkar externamente
const AGENCY_DOMAINS = ["linkedin", "indeed", "glassdoor", "ziprecruiter", "monster", "dice", "jsjobbs", "wearedevelopers", "wellfound", "angel", "builtinnyc", "justjoin", "otodom", "jooble"];

function isAgency(company: string): boolean {
  const c = company.toLowerCase();
  return AGENCY_DOMAINS.some(a => c.includes(a));
}

function getCompanyCareerUrl(company: string): string | null {
  if (isAgency(company)) return null;
  return COMPANY_CAREERS[company] || null;
}

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
  const [showPayment, setShowPayment] = useState(false);
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

  const getWorkTypeLabel = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t === "remoto" || t === "remote") return getTypeLabel(lang, "Remote");
    if (t === "hibrido" || t === "hybrid") return getTypeLabel(lang, "Hybrid");
    return getTypeLabel(lang, "On-site");
  };

  const getWorkTypeKey = (type: string) => {
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

  // Verifica se qualifica para desconto de 10% (remoto + salario > $450k/ano)
  const qualifiesForDiscount = (j: Job): boolean => {
    const t = j.type?.toLowerCase() || "";
    const isRemote = t === "remoto" || t === "remote";
    if (!isRemote) return false;
    const maxSalary = j.salaryMax || 0;
    const period = j.salaryPeriod || "year";
    const annualMax = period === "month" ? maxSalary * 12 : period === "hour" ? maxSalary * 2080 : maxSalary;
    return annualMax > 450000;
  };

  const sectorIcons: Record<string, string> = { "Software Engineering": "\u{1F4BB}", "Cloud & DevOps": "\u2601\uFE0F", "Data Science & Analytics": "\u{1F4CA}", "AI & Machine Learning": "\u{1F916}", "Cybersecurity": "\u{1F512}", "Product Management": "\u{1F4CB}", "Consulting": "\u{1F4BC}", "Data Engineering": "\u{1F5C2}", "UX/UI & Design": "\u{1F3A8}", "QA & Testing": "\u{1F9EA}", "Mobile Development": "\u{1F4F1}", "Game Development": "\u{1F3AE}", "Engineering Leadership": "\u{1F454}", "Finance Technology": "\u{1F4B0}", "Sales & Marketing": "\u{1F4E3}", "Writing & Content": "\u270D\uFE0F", "IT Support & Operations": "\u{1F5A5}", "R&D": "\u{1F52C}", "Other": "\u{1F4CC}" };

  const careerUrl = job ? getCompanyCareerUrl(job.company) : null;
  const isAgencyJob = job ? isAgency(job.company) : false;
  const hasDiscount = job ? qualifiesForDiscount(job) : false;
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
          <div className="text-center py-16 text-gray-400"><p className="text-5xl mb-4">&#128269;</p><p className="text-lg font-medium text-gray-600">{T.noJobsFound}</p><button onClick={goBack} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">{L.backToJobs}</button></div>
        ) : (<div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className={"h-2 w-full bg-gradient-to-r " + getSectorMeta(job.sector).color} />
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={"rounded-full px-3 py-1 text-xs font-medium border " + (getSectorMeta(job.sector).color.includes("green") ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200")}>{getWorkTypeLabel(job.type)}</span>
                {job.posted && <span className="text-xs text-gray-400">{L.posted}: {job.posted}</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">{job.title}</h1>
              {careerUrl ? (
                <a href={careerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-lg font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                  {job.company}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              ) : (
                <span className="text-lg font-semibold text-gray-800">{job.company}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.location}</p><p className="text-sm font-semibold text-gray-800 mt-1">{job.location}</p></div>
            <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.salary}</p><p className="text-sm font-bold text-sky-600 mt-1">{getSalaryText(job)}</p></div>
            <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.workType}</p><p className="text-sm font-semibold text-gray-800 mt-1">{getWorkTypeLabel(job.type)}</p></div>
            <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.category}</p><p className="text-sm text-gray-700 mt-1">{sectorIcons[job.sector] || "\u{1F4CC}"} {getSectorLabel(job.sector, lang)}</p></div>
            <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.company}</p><p className="text-sm text-gray-700 mt-1">{job.company}</p></div>
            {job.posted && <div className="bg-white rounded-xl border border-gray-100 p-4"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.posted}</p><p className="text-sm text-gray-700 mt-1">{job.posted}</p></div>}
          </div>

          {/* DESCRICAO */}
          {job.description && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{L.description}</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
              {!job.contactEmail && (
                <p className="text-xs text-gray-400 mt-3 italic">{L.fullDescNote}</p>
              )}
            </div>
          )}

          {/* CONTATO — com botao desbloquear */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{L.contact}</p>
            {job.contactEmail ? (
              <p className="text-sm font-semibold text-sky-600">{job.contactEmail}</p>
            ) : !showPayment ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 italic">{L.noContact}</p>
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full py-3 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors text-sm"
                >
                  {L.unlockContact}
                </button>
              </div>
            ) : null}
          </div>

          {/* COMPONENTE DE PAGAMENTO */}
          {showPayment && !job.contactEmail && (
            <PaddlePayment
              jobId={String(job.id)}
              onClose={() => setShowPayment(false)}
              hasDiscount={hasDiscount}
            />
          )}

          {/* LINK DIRETO DA EMPRESA (nao agencias) */}
          {careerUrl && (
            <a href={careerUrl} target="_blank" rel="noopener noreferrer" className="block bg-sky-50 border border-sky-200 rounded-xl p-5 hover:bg-sky-100 transition-colors text-center">
              <p className="text-sm font-semibold text-sky-700">{L.viewOnCompany.replace("{0}", job.company)}</p>
            </a>
          )}

          {/* VAGA DE AGENCIA — sem link externo */}
          {isAgencyJob && !careerUrl && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-500">{L.agencyJob}</p>
              <button
                onClick={() => setShowPayment(true)}
                className="mt-3 px-6 py-2 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors text-sm"
              >
                {L.unlockContact}
              </button>
            </div>
          )}

          <button onClick={goBack} className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">{L.backToJobs}</button>
        </div>)}
      </main>
      <footer className="bg-gray-900 text-white py-10 mt-8"><div className="max-w-4xl mx-auto px-4 sm:px-6 text-center"><p className="text-gray-400 text-sm">{T.footerText}</p></div></footer>
    </div>);
}