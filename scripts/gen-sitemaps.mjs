#!/usr/bin/env node
// Gera SITEMAPS ESTÁTICOS em public/ (CDN, zero custo de runtime):
//
//   public/sitemap.xml          -> SITEMAP INDEX (divide as vagas por PAÍS)
//   public/sitemap-usa.xml      -> vagas dos EUA
//   public/sitemap-germany.xml  -> vagas da Alemanha
//   ... (+ sitemap-united-states.xml / -united-kingdom.xml como alias)
//
// As vagas são listadas na URL canônica EN (x-default); os demais idiomas
// são descobertos via hreflang nas próprias páginas. Cada arquivo respeita
// o limite de 50.000 URLs do protocolo sitemaps.org.
//
// Roda automaticamente antes do build (npm "prebuild"). Idempotente.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { gunzipSync } from "zlib";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "site");
const PUBLIC_DIR = join(process.cwd(), "public");

// Regiões de pasta dos dados -> código de região das URLs do site
const REGION_URL = new Set(["europa", "asia", "eua", "oceania", "america-do-norte"]);

// Nomes CURTOS e amigáveis para os arquivos de sitemap (pedido do dono:
// sitemap-usa.xml, sitemap-germany.xml...). Os demais usam o próprio slug.
const SHORT_NAME = {
  "united-states": "usa",
  "united-kingdom": "uk",
};

const MAX_URLS_PER_SITEMAP = 45000; // margem sob o limite de 50k do protocolo

function loadJobs(file) {
  if (file.endsWith(".gz")) return JSON.parse(gunzipSync(readFileSync(file)));
  return JSON.parse(readFileSync(file, "utf-8"));
}

// ── Descoberta dos países e das vagas ─────────────────────────────────
// Passo A: países FATIADOS (ex.: eua_united-states_index.json + chunks p1..pN)
// Passo B: países de ARQUIVO ÚNICO ({regiao}_{pais}.json / .gz)
// (os regex ignoram _index.json e _pN.json — só casam arquivos diretos)
const countries = new Map(); // base -> { region, slug, jobs: [], lastmod }

function entryFor(base, regionDir, slug) {
  if (!countries.has(base)) countries.set(base, { region: regionDir, slug, jobs: [], lastmod: "" });
  return countries.get(base);
}

function collectJobs(entry, jobs) {
  for (const j of jobs) {
    if (j && j.id !== undefined) {
      entry.jobs.push(j.id);
      if (j.posted && j.posted > entry.lastmod) entry.lastmod = j.posted;
    }
  }
}

for (const f of readdirSync(DATA_DIR).sort()) {
  // Passo A — índice de país fatiado
  const mi = f.match(/^([a-z-]+)_([a-z0-9-]+)_index\.json$/);
  if (mi) {
    const [, regionDir, slug] = mi;
    if (!REGION_URL.has(regionDir)) continue;
    const entry = entryFor(`${regionDir}_${slug}`, regionDir, slug);
    try {
      const idx = JSON.parse(readFileSync(join(DATA_DIR, f), "utf-8"));
      for (const chunkFile of idx.chunks || []) {
        const cp = join(DATA_DIR, chunkFile);
        if (!existsSync(cp)) continue;
        try { collectJobs(entry, loadJobs(cp)); } catch { /* chunk ilegível: pula */ }
      }
    } catch (e) {
      console.error(`[gen-sitemaps] falha no índice ${f}:`, e.message);
    }
    continue;
  }

  // Passo B — arquivo direto de país pequeno
  const m = f.match(/^([a-z-]+)_([a-z0-9-]+)\.json(\.gz)?$/);
  if (!m) continue;
  const [, regionDir, slug, gzSuffix] = m;
  if (!REGION_URL.has(regionDir)) continue;
  // Duplicação: os dados existem em .json E .json.gz — conta só o .json
  if (gzSuffix && existsSync(join(DATA_DIR, f.replace(/\.gz$/, "")))) continue;
  const base = `${regionDir}_${slug}`;
  if (existsSync(join(DATA_DIR, `${base}_index.json`))) continue; // fatiado: Passo A cobre

  const entry = entryFor(base, regionDir, slug);
  try {
    collectJobs(entry, loadJobs(join(DATA_DIR, f)));
  } catch (e) {
    console.error(`[gen-sitemaps] falha em ${f}:`, e.message);
  }
}

// Nomes de arquivo ÚNICOS: colisão (ex.: asia_remoto-global vs
// europa_remoto-global) recebe o prefixo da região.
const usedNames = new Set();
function fileNameFor(entry) {
  const short = SHORT_NAME[entry.slug] || entry.slug;
  // "remoto-global" não é país (existe na Ásia e na Europa): sempre
  // recebe o prefixo da região — sitemap-asia-remoto-global.xml etc.
  let name = entry.slug === "remoto-global"
    ? `sitemap-${entry.region}-${short}.xml`
    : `sitemap-${short}.xml`;
  if (usedNames.has(name)) name = `sitemap-${entry.region}-${short}.xml`;
  while (usedNames.has(name)) name = name.replace(/\.xml$/, "-2.xml");
  usedNames.add(name);
  return name;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const today = new Date().toISOString().slice(0, 10);

// ── 1) Sitemaps por país ──────────────────────────────────────────────
const childFiles = [];
let totalJobUrls = 0;

for (const [, entry] of countries) {
  const jobs = entry.jobs.slice().sort((a, b) => b - a);
  const lastmod = entry.lastmod || today;

  // Chunking de segurança (>45k URLs em um país)
  const batches = [];
  for (let i = 0; i < jobs.length; i += MAX_URLS_PER_SITEMAP) {
    batches.push(jobs.slice(i, i + MAX_URLS_PER_SITEMAP));
  }

  const shortName = SHORT_NAME[entry.slug] || entry.slug;
  const baseName = fileNameFor(entry).replace(/\.xml$/, ""); // com colisão resolvida
  const fileNames = batches.length > 1
    ? batches.map((_, i) => `${baseName}-${i + 1}.xml`)
    : [`${baseName}.xml`];

  batches.forEach((batch, bi) => {
    const urls = batch
      .map(id => `https://nossy.pro/en/jobs/${entry.region}/${esc(entry.slug)}/${id}`)
      .map(loc =>
        `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`
      );
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
    writeFileSync(join(PUBLIC_DIR, fileNames[bi]), xml);
    totalJobUrls += batch.length;
    childFiles.push(fileNames[bi]);
  });

  // Alias com o slug completo (united-states / united-kingdom) — inofensivo
  if (SHORT_NAME[entry.slug] && batches.length === 1) {
    writeFileSync(
      join(PUBLIC_DIR, `sitemap-${entry.slug}.xml`),
      readFileSync(join(PUBLIC_DIR, `${baseName}.xml`))
    );
  }
}

// ── 2) Sitemaps por IDIOMA (páginas: home, regiões, países, guias) ────
// Antes era uma rota dinâmica (sitemap-[lang].xml) que NUNCA funcionou em
// produção (404). Agora é estático como os de país — zero runtime.
const LANG_SLUGS = {
  en: "jobs", "pt-br": "vagas", "pt-pt": "empregos", es: "empleos",
  fr: "emplois", de: "stellenangebote", it: "lavoro", nl: "vacatures",
  pl: "praca", ru: "rabota", zh: "gongzuo", ja: "shigoto", ko: "chae-yong",
  hi: "naukri", bn: "chakri", ar: "wazaif", tr: "is-ilanlari",
  vi: "viec-lam", th: "ngan-thai", ur: "mulazmat", tl: "trabaho", sw: "kazi",
};
const GUIDES = [
  "how-to-find-tech-jobs-in-europe",
  "remote-work-salary-guide-2025",
  "top-tech-skills-demand",
];
const REGION_CODES = ["europa", "asia", "eua", "oceania", "america-do-norte"];

for (const [lang, jobsSlug] of Object.entries(LANG_SLUGS)) {
  const urls = [];
  const add = (path, freq, prio) =>
    urls.push(`  <url><loc>https://nossy.pro${path}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`);

  add(`/${lang}/${jobsSlug}`, "daily", "0.95");
  for (const region of REGION_CODES) add(`/${lang}/${jobsSlug}/${region}`, "daily", "0.8");
  for (const [, entry] of countries) {
    add(`/${lang}/${jobsSlug}/${entry.region}/${entry.slug}`, "weekly", "0.7");
  }
  for (const g of GUIDES) add(`/${lang}/${jobsSlug}/guides/${g}`, "weekly", "0.6");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  writeFileSync(join(PUBLIC_DIR, `sitemap-${lang}.xml`), xml);
  childFiles.push(`sitemap-${lang}.xml`);
}

// ── 3) SITEMAP INDEX ──────────────────────────────────────────────────
// Divide as vagas por PAÍS (sitemap-usa.xml, sitemap-germany.xml...) e
// lista também os sitemaps de páginas por idioma (sitemap-en.xml...).
const allChildren = childFiles.map(n => `/${n}`).sort();

const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allChildren
  .map(loc => `  <sitemap><loc>https://nossy.pro${loc}</loc></sitemap>`)
  .join("\n")}\n</sitemapindex>\n`;

writeFileSync(join(PUBLIC_DIR, "sitemap.xml"), indexXml);

console.log(`[gen-sitemaps] ${childFiles.length} sitemap(s) de país, ${totalJobUrls} URLs de vagas`);
console.log(`[gen-sitemaps] public/sitemap.xml (index com ${allChildren.length} filhos) gerado`);
