#!/usr/bin/env node
// PADRÃO 1874 — Vagas remotas em TODOS os países (pedido do dono, 2026-09-18):
// "pessoas na Índia querem trabalho remoto dos EUA, Brasil queria trabalho
// remoto da China. então adicione... acrescente remoto para todos os países".
//
// O pool remoto global (asia_remoto-global + europa_remoto-global, dedupe por
// id, ordem = mergePools do runtime) passa a ser anexado às listagens de TODOS
// os países. Como os ids do pool COLIDEM com ids locais de vários países (são
// vagas DIFERENTES com o mesmo número — ex.: EUA 10005 = "Tooling Engineer |
// Google" vs pool 10005 = "Principal Data Scientist | GIC"), cada país recebe
// somente a fração do pool cujos ids NÃO existem nos dados locais — assim a
// URL de detalhe nunca abre a vaga errada.
//
// Este script gera:
//   1. data/site/{base}_remote-extra.json  — ids do pool exclusivos do país
//      (mesma ordem do pool em runtime: asia→europa, dedupe, posted desc);
//   2. atualiza count em src/data/countries.json (locais = local + extra;
//      sem-dados locais = tamanho do pool);
//   3. recompõe src/data/continents.json (locais do continente + pool UMA vez);
//   4. atualiza data/site/countries.json (lista legada de 58, se existir slug).
//
// Execução: node scripts/gen-remote-extra.mjs

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data", "site");
const SRC_DATA = path.join(ROOT, "src", "data");

// ── Pool em EXATAMENTE a mesma ordem do runtime (remote-pool.ts) ──────────
function loadPool() {
  const asia = JSON.parse(readFileSync(path.join(DATA, "asia_remoto-global.json"), "utf-8"));
  const europa = JSON.parse(readFileSync(path.join(DATA, "europa_remoto-global.json"), "utf-8"));
  const seen = new Set();
  const merged = [];
  for (const j of [...asia, ...europa]) {
    const id = String(j?.id ?? "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    merged.push(j);
  }
  // mergePools também filtra concorrentes; dados já estão limpos, mas se um
  // dia houver concorrente no pool ele NÃO pode entrar no extra (runtime não
  // o serviria e a listagem ficaria curta). Filtro por nome/domínio:
  const competitorRe = /(linkedin|indeed|glassdoor|seek limited|weworkremotely|wellfound|remote\.co|jobstreet|computrabajo|jooble|usajobs|ziprecruiter|catho|vagas\.com|trampofacil)/i;
  const clean = merged.filter((j) => {
    const hay = `${j.company || ""} ${j.companyUrl || ""} ${j.contactWebsite || ""}`;
    return !competitorRe.test(hay);
  });
  clean.sort((a, b) => String(b.posted || "").localeCompare(String(a.posted || "")));
  return clean;
}

const pool = loadPool();
const poolIds = pool.map((j) => Number(j.id));
console.log(`Pool remoto: ${pool.length} vagas (asia+europa dedupe, posted desc)`);

// ── Catálogo mundial (fonte da verdade de países/regiões) ─────────────────
const countriesPath = path.join(SRC_DATA, "countries.json");
const catalog = JSON.parse(readFileSync(countriesPath, "utf-8"));

// ── Ids locais por país (base única OU chunks via _index) ─────────────────
function localIdsFor(base) {
  const ids = new Set();
  const idxPath = path.join(DATA, `${base}_index.json`);
  if (existsSync(idxPath)) {
    const idx = JSON.parse(readFileSync(idxPath, "utf-8"));
    for (const chunk of idx.chunks) {
      const jobs = JSON.parse(readFileSync(path.join(DATA, chunk), "utf-8"));
      for (const j of jobs) ids.add(String(j.id));
    }
    const totalJobs = idx.totalJobs ?? ids.size;
    return { ids, totalJobs, chunked: true };
  }
  const basePath = path.join(DATA, `${base}.json`);
  if (existsSync(basePath)) {
    const jobs = JSON.parse(readFileSync(basePath, "utf-8"));
    for (const j of jobs) ids.add(String(j.id));
    return { ids, totalJobs: jobs.length, chunked: false };
  }
  return null;
}

// ── 1. Gera {base}_remote-extra.json e calcula contagens ──────────────────
const report = [];
let anyCountChanged = false;

for (const c of catalog) {
  if (c.slug === "remoto-global") continue; // entradas especiais do pool
  const base = `${c.region}_${c.slug}`;
  const local = localIdsFor(base);
  if (!local) {
    // País sem dados locais: recebe o pool inteiro (comportamento Task 16)
    if (c.count !== pool.length) {
      c.count = pool.length;
      anyCountChanged = true;
    }
    report.push({ slug: c.slug, continent: c.continent, local: 0, extra: pool.length, total: pool.length, mode: "pool-only" });
    continue;
  }
  const extra = poolIds.filter((id) => !local.ids.has(String(id)));
  writeFileSync(path.join(DATA, `${base}_remote-extra.json`), JSON.stringify(extra));
  const total = local.totalJobs + extra.length;
  if (c.count !== total) {
    c.count = total;
    anyCountChanged = true;
  }
  report.push({ slug: c.slug, continent: c.continent, local: local.totalJobs, extra: extra.length, total, mode: local.chunked ? "chunked" : "base" });
}

// ── 2. Continentes: locais do continente + pool UMA vez (convenção atual) ─
const localByContinent = {};
for (const r of report) {
  if (r.local > 0) localByContinent[r.continent] = (localByContinent[r.continent] || 0) + r.local;
}
const CONTINENTS = ["africa", "america-do-norte", "america-do-sul", "asia", "europa", "oceania"];
const continentsOut = CONTINENTS.map((code) => ({
  code,
  count: (localByContinent[code] || 0) + pool.length,
}));

// ── 3. Lista legada de 58 (data/site/countries.json) — se slug existir ────
const legacyPath = path.join(DATA, "countries.json");
let legacyUpdated = 0;
if (existsSync(legacyPath)) {
  const legacy = JSON.parse(readFileSync(legacyPath, "utf-8"));
  const bySlug = new Map(report.map((r) => [r.slug, r.total]));
  for (const c of legacy) {
    if (bySlug.has(c.slug) && c.count !== bySlug.get(c.slug)) {
      c.count = bySlug.get(c.slug);
      legacyUpdated++;
    }
  }
  writeFileSync(legacyPath, JSON.stringify(legacy));
}

// ── 4. Grava catálogos ────────────────────────────────────────────────────
if (anyCountChanged || true) writeFileSync(countriesPath, JSON.stringify(catalog, null, 1) + "\n");
writeFileSync(path.join(SRC_DATA, "continents.json"), JSON.stringify(continentsOut, null, 1) + "\n");

// ── Relatório ─────────────────────────────────────────────────────────────
const withLocal = report.filter((r) => r.local > 0);
const poolOnly = report.filter((r) => r.local === 0);
console.log(`\nPaíses com dados locais: ${withLocal.length}`);
for (const r of withLocal.sort((a, b) => b.total - a.total)) {
  console.log(`  ${r.slug.padEnd(20)} local=${String(r.local).padStart(6)} +remoto=${String(r.extra).padStart(5)} => ${r.total}`);
}
console.log(`\nPaíses somente-pool: ${poolOnly.length} (todos com ${pool.length})`);

const sumLocal = withLocal.reduce((a, r) => a + r.local, 0);
console.log(`\nVagas locais somadas: ${sumLocal}`);
console.log(`Únicas no sistema (locais + pool 1x): ${sumLocal + pool.length}`);
console.log(`Continentes: ${JSON.stringify(continentsOut)}`);
console.log(`Lista legada 58: ${legacyUpdated} contagens atualizadas`);
