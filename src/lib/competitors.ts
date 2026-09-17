// Módulo central de BLOQUEIO de empresas concorrentes (portais de emprego).
//
// O dono NÃO quer portais concorrentes (LinkedIn, Indeed, Glassdoor, Seek,
// Computrabajo, Jooble etc.) anunciando vagas no NOSSY — nem como empresa da
// vaga, nem como link de contato/site da empresa. Empresas do mesmo setor
// (agências de recrutamento com vagas reais) continuam permitidas.
//
// Fonte única dos dados: competitor-data.json (consumido também pelo script
// de limpeza scripts/clean-competitors.mjs, garantindo paridade total entre
// runtime e dados).
//
// Este módulo é PURO (sem imports de Node) — pode ser usado no client e no
// server em qualquer rota.

import data from "./competitor-data.json";

/** Normaliza: minúsculas, sem acentos, espaços colapsados. */
function norm(s: string | null | undefined): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const COMPETITOR_NAMES = new Set<string>(
  (data.companies as string[]).map(norm)
);
const SUBSTRINGS = data.companySubstrings as string[];
const ALLOW_EXACT = new Set<string>((data.allowlist as string[]).map(norm));
const ALLOW_SUBSTRINGS = data.allowSubstrings as string[];
const DOMAINS = data.domains as string[];
const BRAND_LABELS = new Set<string>(data.brandLabels as string[]);
const BRAND_EXCEPTIONS = data.brandLabelExceptions as string[];

/**
 * True se a EMPRESA da vaga é um portal concorrente de emprego.
 * Cobre: nome exato ("LinkedIn", "Indeed Ireland"), variantes regionais
 * publicadas como nome ("br.linkedin.com", "in.indeed.com") e contém
 * ("Glint (LinkedIn)", "Indeed Ireland").
 */
export function isCompetitorJobBoardCompany(company?: string | null): boolean {
  const n = norm(company);
  if (!n) return false;
  if (ALLOW_EXACT.has(n)) return false;
  if (COMPETITOR_NAMES.has(n)) return true;
  for (const s of SUBSTRINGS) {
    if (n.includes(s)) {
      // Exceções explícitas (ex.: "Monster Energy") não bloqueiam
      for (const a of ALLOW_SUBSTRINGS) {
        if (n.includes(a)) return false;
      }
      return true;
    }
  }
  // Empresas publicadas como DOMÍNIO ("dailyremote.com", "br.linkedin.com"):
  // se o nome parece uma URL, aplica o verificador de domínios concorrentes.
  if (n.includes(".")) {
    return isCompetitorJobBoardUrl("http://" + n.replace(/\s+/g, ""));
  }
  return false;
}

/** Host de uma URL qualquer (sem protocolo/www, sem path). */
function hostOf(url: string): string {
  return url
    .replace(/^[a-z]+:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#:]/)[0]
    .toLowerCase();
}

/**
 * True se a URL aponta para um portal concorrente.
 * Match por sufixo de domínio ("br.linkedin.com" termina com
 * "linkedin.com"), por rótulo de marca ("jobstreet.com.my" tem o rótulo
 * "jobstreet") e por fragmento de path conhecido.
 */
export function isCompetitorJobBoardUrl(url?: string | null): boolean {
  const raw = (url || "").toLowerCase().trim();
  if (!raw) return false;
  const host = hostOf(raw);
  if (!host || !host.includes(".")) return false;

  // Exceções explícitas (domínios de empresas legítimas parecidas)
  for (const ex of BRAND_EXCEPTIONS) {
    if (host === ex || host.endsWith("." + ex)) return false;
  }

  for (const d of DOMAINS) {
    if (host === d || host.endsWith("." + d)) return true;
    if (d.includes("/") && raw.includes(d)) return true; // ex. gov.uk/find-a-job
  }

  for (const label of BRAND_LABELS) {
    for (const part of host.split(".")) {
      if (part === label) return true;
    }
  }
  return false;
}

/**
 * Limpa uma vaga legítima: se a empresa NÃO é concorrente mas o
 * companyUrl/contactWebsite aponta para portal concorrente, o link é
 * removido (a vaga fica sem site em vez de divulgar o concorrente).
 */
export function sanitizeJobCompetitors<T extends Record<string, any>>(job: T): T {
  const out: Record<string, any> = { ...job };
  if (isCompetitorJobBoardUrl(out.companyUrl)) out.companyUrl = "";
  if (isCompetitorJobBoardUrl(out.contactWebsite)) out.contactWebsite = "";
  return out as T;
}

/**
 * Filtra a lista: remove vagas DE concorrentes e sanitiza as restantes.
 */
export function filterCompetitorJobs<T extends Record<string, any>>(jobs: T[]): T[] {
  if (!Array.isArray(jobs)) return jobs;
  const out: T[] = [];
  for (const j of jobs) {
    if (isCompetitorJobBoardCompany(j?.company)) continue;
    out.push(sanitizeJobCompetitors(j));
  }
  return out;
}

/** True se a vaga em si é de concorrente (empresa OU URLs). */
export function isCompetitorJob(job?: Record<string, any> | null): boolean {
  if (!job) return false;
  return (
    isCompetitorJobBoardCompany(job.company) ||
    isCompetitorJobBoardUrl(job.companyUrl) ||
    isCompetitorJobBoardUrl(job.contactWebsite)
  );
}
