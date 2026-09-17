// Limpeza de portais concorrentes nos dados (data/site) — refaz e melhora a
// limpeza perdida do commit 335c166. Usa EXATAMENTE as listas de
// src/lib/competitor-data.json (paridade com o runtime competitors.ts).
//
// Ações:
//  1. Remove vagas cuja empresa é portal concorrente (LinkedIn, Indeed, ...)
//  2. Sanitiza URLs de concorrentes (seek.com.au etc.) em vagas legítimas
//  3. Recalcula _index.json (totalJobs) dos países fatiados
//  4. Gera data/site/_totals.json (total por region_slug) para o catálogo
//  5. Limpa latest_20 (data/site e src/data)
//  6. Remove espelhos .gz dos arquivos .json limpos (dados obsoletos)
//  7. Relatório em /home/z/my-project/scripts/removed-jobs-report.json

import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "..");
// scripts/ roda com cwd = nossy-site quando invocado via npm; detecta:
const SITE_ROOT = fs.existsSync(path.join(process.cwd(), "data", "site"))
  ? process.cwd()
  : ROOT;
const DATA_DIR = path.join(SITE_ROOT, "data", "site");
const COMP = JSON.parse(
  fs.readFileSync(path.join(SITE_ROOT, "src/lib/competitor-data.json"), "utf-8")
);

const norm = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

const NAMES = new Set(COMP.companies.map(norm));
const SUBS = COMP.companySubstrings;
const ALLOW_EXACT = new Set(COMP.allowlist.map(norm));
const ALLOW_SUBS = COMP.allowSubstrings;
const DOMAINS = COMP.domains;
const LABELS = new Set(COMP.brandLabels);
const LABEL_EXC = COMP.brandLabelExceptions;

function isCompetitorCompany(name) {
  const n = norm(name);
  if (!n) return false;
  if (ALLOW_EXACT.has(n)) return false;
  if (NAMES.has(n)) return true;
  for (const s of SUBS) {
    if (n.includes(s)) {
      for (const a of ALLOW_SUBS) if (n.includes(a)) return false;
      return true;
    }
  }
  // Empresas publicadas como DOMÍNIO ("dailyremote.com"): aplica o
  // verificador de domínios concorrentes (paridade com competitors.ts)
  if (n.includes(".")) return isCompetitorUrl("http://" + n.replace(/\s+/g, ""));
  return false;
}

function hostOf(url) {
  return (url || "").replace(/^[a-z]+:\/\//, "").replace(/^www\./, "").split(/[/?#:]/)[0].toLowerCase();
}

function isCompetitorUrl(url) {
  const raw = (url || "").toLowerCase().trim();
  if (!raw) return false;
  const host = hostOf(raw);
  if (!host || !host.includes(".")) return false;
  for (const ex of LABEL_EXC) if (host === ex || host.endsWith("." + ex)) return false;
  for (const d of DOMAINS) {
    if (host === d || host.endsWith("." + d)) return true;
    if (d.includes("/") && raw.includes(d)) return true;
  }
  for (const l of LABELS) for (const part of host.split(".")) if (part === l) return true;
  return false;
}

const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
const listFiles = files.filter(
  (f) => !f.includes("_idmap") && !f.includes("_index") && !f.includes("_totals")
);
const report = { removedJobs: [], urlCleaned: [], totals: {} };
let totalRemoved = 0;

function cleanArray(arr, fileLabel) {
  const out = [];
  let removed = 0, urls = 0;
  for (const j of arr) {
    if (!j || typeof j !== "object") continue;
    if (isCompetitorCompany(j.company)) {
      removed++;
      report.removedJobs.push({ file: fileLabel, id: j.id, company: j.company, title: j.title });
      continue;
    }
    let changed = false;
    if (isCompetitorUrl(j.companyUrl)) { j.companyUrl = ""; changed = true; urls++; }
    if (isCompetitorUrl(j.contactWebsite)) { j.contactWebsite = ""; changed = true; }
    if (changed) report.urlCleaned.push({ file: fileLabel, id: j.id, company: j.company });
    out.push(j);
  }
  return { out, removed, urls };
}

for (const f of listFiles) {
  const p = path.join(DATA_DIR, f);
  let data;
  try { data = JSON.parse(fs.readFileSync(p, "utf-8")); } catch { continue; }
  if (!Array.isArray(data)) continue;
  const { out, removed, urls } = cleanArray(data, f);
  if (removed || urls) {
    fs.writeFileSync(p, JSON.stringify(out));
    totalRemoved += removed;
    console.log(`${f}: -${removed} vagas concorrentes, ${urls} URLs limpas, ${out.length} restantes`);
  }
}

// Recalcula _index.json (totalJobs) a partir dos chunks limpos
for (const f of files.filter((x) => x.endsWith("_index.json"))) {
  const p = path.join(DATA_DIR, f);
  let idx;
  try { idx = JSON.parse(fs.readFileSync(p, "utf-8")); } catch { continue; }
  if (!idx || !Array.isArray(idx.chunks)) continue;
  let total = 0;
  for (const c of idx.chunks) {
    try {
      const arr = JSON.parse(fs.readFileSync(path.join(DATA_DIR, c), "utf-8"));
      if (Array.isArray(arr)) total += arr.length;
    } catch {}
  }
  if (idx.totalJobs !== total) {
    console.log(`${f}: totalJobs ${idx.totalJobs} -> ${total}`);
    idx.totalJobs = total;
    fs.writeFileSync(p, JSON.stringify(idx));
  }
}

// Totais por região_país (base direta ou soma dos chunks)
for (const f of listFiles) {
  if (!/_/.test(f)) continue;
  const base = f.replace(/\.json$/, "");
  const idxPath = path.join(DATA_DIR, base + "_index.json");
  let total = null;
  if (fs.existsSync(idxPath)) {
    try {
      const idx = JSON.parse(fs.readFileSync(idxPath, "utf-8"));
      if (Array.isArray(idx.chunks)) {
        total = 0;
        for (const c of idx.chunks) {
          try {
            const arr = JSON.parse(fs.readFileSync(path.join(DATA_DIR, c), "utf-8"));
            if (Array.isArray(arr)) total += arr.length;
          } catch {}
        }
      }
    } catch {}
  }
  if (total === null) {
    try {
      const arr = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8"));
      if (Array.isArray(arr)) total = arr.length;
    } catch {}
  }
  if (total !== null) report.totals[base] = total;
}
fs.writeFileSync(path.join(DATA_DIR, "_totals.json"), JSON.stringify(report.totals, null, 1));

// Espelhos .gz de arquivos .json limpos → remove (dados obsoletos no repo)
let gzRemoved = 0;
for (const f of files) {
  if (!f.endsWith(".json.gz")) continue;
  const jsonSibling = f.replace(/\.gz$/, "");
  if (fs.existsSync(path.join(DATA_DIR, jsonSibling))) {
    fs.unlinkSync(path.join(DATA_DIR, f));
    gzRemoved++;
  }
}
// .gz sem irmão .json (dataset paralelo obsoleto) → remove também
for (const f of fs.readdirSync(DATA_DIR)) {
  if (f.endsWith(".gz")) fs.unlinkSync(path.join(DATA_DIR, f)), gzRemoved++;
}
console.log(`Espelhos/datasets .gz removidos: ${gzRemoved}`);

// latest_20 nas duas cópias
for (const lp of [
  path.join(DATA_DIR, "latest_20.json"),
  path.join(SITE_ROOT, "src/data/latest_20.json"),
]) {
  if (!fs.existsSync(lp)) continue;
  try {
    const arr = JSON.parse(fs.readFileSync(lp, "utf-8"));
    if (Array.isArray(arr)) {
      const { out, removed } = cleanArray(arr, path.basename(lp));
      if (removed) {
        fs.writeFileSync(lp, JSON.stringify(out));
        console.log(`${lp}: -${removed} concorrentes`);
      }
    }
  } catch {}
}

fs.mkdirSync(path.join(SITE_ROOT, "..", "scripts"), { recursive: true });
fs.writeFileSync(
  path.join(SITE_ROOT, "..", "scripts", "removed-jobs-report.json"),
  JSON.stringify({ totalRemoved, urlCleaned: report.urlCleaned.length, removedJobs: report.removedJobs }, null, 1)
);
console.log(`\nTOTAL: ${totalRemoved} vagas de concorrentes removidas, ${report.urlCleaned.length} URLs sanitizadas`);
