// ═══════════════════════════════════════════════════════════════════════
// NOSSY — Listagem de país: rotação/mistura de vagas remotas (padrão 0220)
// ═══════════════════════════════════════════════════════════════════════
//
// Requisitos do dono (2026-09-19):
//  1. TODAS as vagas remotas aparecem em TODOS os países (pool 8xxxxx já
//     é anexado a cada país via {base}_remote-extra.json — zero colisões);
//  2. As remotas ALTERNAM entre si e com as vagas locais — a ordem ROTACIONA
//     a cada janela de 6h (semeada por hash do país + janela), então o
//     visitante não vê sempre os mesmos anúncios nas mesmas posições;
//  3. Os anúncios EXCLUSIVOS da G4 COMPANY ficam ENTRE OS 10 PRIMEIROS de
//     cada país (posições pares do bloco inicial, alternando com as demais
//     vagas — nunca duas da mesma empresa em sequência);
//  4. Ordem DETERMINÍSTICA dentro da janela: SSR (página 1) e API (todas as
//     páginas) usam a mesma função → listagem e paginação nunca divergem;
//  5. Dados NUNCA são alterados — apenas a ordem de exibição.
//
// Este módulo é SERVER-ONLY (lê arquivos de data/site/).

import { promises as fsp } from "fs";
import path from "path";
import { DATA_DIR } from "./data-dir";
import { getRemoteExtraJobs, getRemotePool } from "./remote-pool";
import { filterCompetitorJobs } from "./competitors";

// ── Rotação temporal ────────────────────────────────────────────────────
export const ROTATION_WINDOW_MS = 6 * 60 * 60 * 1000; // 6h — 4 rotações/dia

function windowSeed(): number {
  return Math.floor(Date.now() / ROTATION_WINDOW_MS);
}

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** PRNG determinístico (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Diversidade de empresas ─────────────────────────────────────────────

function normCompany(c: unknown): string {
  return (typeof c === "string" ? c : "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Vaga exclusiva G4 COMPANY (identificada pelo nome exato da empresa). */
function isG4(job: Record<string, any>): boolean {
  return normCompany(job?.company) === "g4 company";
}

/** Fisher-Yates semeado + correção para NUNCA duas mesma-empresa seguidas. */
function diverseShuffle<T extends Record<string, any>>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  const companyOf = (j: T) => normCompany(j?.company);
  for (let i = 1; i < a.length; i++) {
    const c = companyOf(a[i]);
    if (c && c === companyOf(a[i - 1])) {
      for (let k = i + 1; k < a.length; k++) {
        if (companyOf(a[k]) !== c) {
          const tmp = a[i];
          a[i] = a[k];
          a[k] = tmp;
          break;
        }
      }
    }
  }
  return a;
}

/**
 * Ordem das remotas da janela: G4 primeiro (para o top 10), perfeitamente
 * alternadas com as demais ([G4, outra, G4, outra...]) — nunca a mesma
 * empresa em sequência. Determinístico por (país, janela).
 */
function orderExtras(extras: Record<string, any>[], seed: number): Record<string, any>[] {
  const rand = mulberry32(seed);
  const g4 = diverseShuffle(extras.filter(isG4), rand);
  const others = diverseShuffle(
    extras.filter((j) => !isG4(j)),
    rand
  );
  const out: Record<string, any>[] = [];
  let i = 0;
  let j = 0;
  while (i < g4.length && j < others.length) {
    out.push(g4[i++]);
    out.push(others[j++]);
  }
  while (i < g4.length) out.push(g4[i++]);
  while (j < others.length) out.push(others[j++]);
  return out;
}

// ── Construção da ordem completa (países com arquivo único / só-pool) ───

/**
 * Ordem completa em memória (usa quando os locais já estão carregados).
 * Bloco top (10 primeiras posições): G4 nas pares, alternando com locais;
 * restante: espalhamento uniforme (Bresenham) das remotas entre os locais.
 */
function buildFullOrder(locals: Record<string, any>[], extras: Record<string, any>[]): Record<string, any>[] {
  const L = locals.length;
  const E = extras.length;
  const N = L + E;
  const out: Record<string, any>[] = new Array(N);
  let li = 0;
  let ei = 0;
  const top = Math.min(N, 10);
  for (let p = 0; p < top; p++) {
    if (p % 2 === 0 && ei < E) out[p] = extras[ei++];
    else if (li < L) out[p] = locals[li++];
    else if (ei < E) out[p] = extras[ei++];
  }
  const remE = E - ei;
  const restN = N - top;
  for (let p = top; p < N; p++) {
    const r = p - top;
    const done = Math.min(remE, remE > 0 ? Math.floor(((r + 1) * remE) / restN) : 0);
    const prev = remE > 0 ? Math.floor((r * remE) / restN) : 0;
    if (done > prev && ei < E) out[p] = extras[ei++];
    else if (li < L) out[p] = locals[li++];
    else if (ei < E) out[p] = extras[ei++];
  }
  return out;
}

/**
 * Pós-passada na página montada: minimiza anúncios da MESMA empresa em
 * sequência. O top 10 é intocado (alternância G4/resto por construção);
 * o restante da página é re-arranjado pelo algoritmo de mínima adjacência
 * (grupos por frequência, preenchimento par/ímpar) — atinge o mínimo
 * teórico de pares quando uma empresa satura os dados locais (ex.: 11
 * vagas Shopify seguidas no Canadá). Determinístico — SSR == API.
 */
function diversifyPage(jobs: Record<string, any>[]): Record<string, any>[] {
  if (!Array.isArray(jobs) || jobs.length <= 10) return jobs;
  const top = jobs.slice(0, 10);
  const tail = jobs.slice(10);
  const n = tail.length;

  // Agrupa o restante por empresa (vagas sem empresa agrupam por id —
  // nunca se fundem indevidamente).
  const groups = new Map<string, Record<string, any>[]>();
  const tailOrder: string[] = [];
  for (const j of tail) {
    const c = normCompany(j?.company) || "\u0000id:" + String(j?.id ?? "");
    if (!groups.has(c)) {
      groups.set(c, []);
      tailOrder.push(c);
    }
    groups.get(c)!.push(j);
  }

  // Grupos maiores primeiro (desempate: ordem de ocorrência — determinístico)
  const sorted = [...groups.entries()].sort(
    (a, b) => b[1].length - a[1].length || tailOrder.indexOf(a[0]) - tailOrder.indexOf(b[0])
  );

  // Colocação gulosa ótima: a cada passo escolhe a empresa com MAIS vagas
  // restantes DIFERENTE da última colocada (algoritmo clássico de
  // reorganização — atinge o mínimo teórico de pares; a borda com o top 10
  // é tratada naturalmente pela regra "diferente do anterior").
  const remaining = new Map<string, Record<string, any>[]>();
  for (const [c, js] of sorted) remaining.set(c, [...js]);
  const arr: Record<string, any>[] = [];
  const boundaryCompany = normCompany(top[top.length - 1]?.company);
  let last = boundaryCompany;
  for (let i = 0; i < n; i++) {
    let best: string | null = null;
    for (const [c, js] of remaining) {
      if (js.length === 0 || (c === last && i < n - 1)) continue;
      if (best === null || js.length > remaining.get(best)!.length) best = c;
    }
    if (best === null) best = last; // só sobrou a empresa do anterior
    const queue = remaining.get(best)!;
    arr.push(queue.shift()!);
    last = best;
  }

  return [...top, ...arr];
}

// ── Leitura de dados locais ─────────────────────────────────────────────

const CHUNK_SIZE = 1000;

async function exists(p: string): Promise<boolean> {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

function safeChunkPath(file: string): string | null {
  if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) return null;
  const resolved = path.resolve(DATA_DIR, file);
  if (!resolved.startsWith(DATA_DIR + path.sep) && resolved !== DATA_DIR) return null;
  return resolved;
}

async function getIndex(
  base: string
): Promise<{ chunks: string[]; totalJobs: number } | null> {
  try {
    const raw = await fsp.readFile(path.join(DATA_DIR, `${base}_index.json`), "utf-8");
    const idx = JSON.parse(raw);
    if (idx && Array.isArray(idx.chunks)) return { chunks: idx.chunks, totalJobs: idx.totalJobs || 0 };
    return null;
  } catch {
    return null;
  }
}

/** Fatia de locais [start, start+count) dos chunks (lê no máx. 2-3 chunks). */
async function loadLocalRangeFromChunks(
  base: string,
  idx: { chunks: string[]; totalJobs: number },
  start: number,
  count: number
): Promise<Record<string, any>[]> {
  if (count <= 0) return [];
  const startChunk = Math.floor(start / CHUNK_SIZE);
  const endChunk = Math.min(Math.floor((start + count - 1) / CHUNK_SIZE), idx.chunks.length - 1);
  let combined: Record<string, any>[] = [];
  for (let c = startChunk; c <= endChunk; c++) {
    const chunkPath = safeChunkPath(idx.chunks[c]);
    if (!chunkPath) continue;
    try {
      const raw = await fsp.readFile(chunkPath, "utf-8");
      combined = combined.concat(JSON.parse(raw));
    } catch {}
  }
  const localOffset = start - startChunk * CHUNK_SIZE;
  return combined.slice(localOffset, localOffset + count);
}

// ── Página da listagem (chunked: caminho de forma fechada) ──────────────

/**
 * Nº de remotas com posição < x (forma fechada, consistente com extraPos).
 * Bloco top: remotas nas posições pares 0,2,4,6,8 (máx. 5).
 * Restante: k-ésima remota em restStart + ceil(j*restN/remE) - 1.
 */
function extrasBefore(x: number, phase1: number, restStart: number, restN: number, remE: number): number {
  const top = restStart;
  const inTop = Math.min(phase1, Math.ceil(Math.min(x, top) / 2));
  const intoRest = Math.max(0, x - restStart);
  const inRest = restN > 0 ? Math.min(remE, Math.floor((intoRest * remE) / restN)) : 0;
  return inTop + inRest;
}

function extraPos(k: number, phase1: number, restStart: number, restN: number, remE: number): number {
  if (k < phase1) return 2 * k;
  const j = k - phase1 + 1;
  return restStart + Math.ceil((j * restN) / remE) - 1;
}

export interface ListingPage {
  jobs: Record<string, any>[];
  total: number;
  totalPages: number;
  page: number;
}

/**
 * Página da listagem de um país — MESMA ordem para SSR e API.
 * base: "regiao_pais" (ex.: "eua_united-states").
 */
export async function getCountryListing(
  baseName: string,
  page: number,
  limit: number
): Promise<ListingPage> {
  const base = baseName.replace(/\.json$/, "").toLowerCase();
  const seed = (hashStr(base) ^ windowSeed()) >>> 0;
  const p = Math.max(1, page);

  const [idx, hasFile] = await Promise.all([
    getIndex(base),
    exists(path.join(DATA_DIR, `${base}.json`)),
  ]);

  // Países do catálogo mundial sem dados próprios: página 100% pool remoto.
  if (!idx && !hasFile) {
    const pool = await getRemotePool();
    const ordered = buildFullOrder([], orderExtras(pool, seed));
    const total = ordered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = Math.min((p - 1) * limit, Math.max(0, total - 1));
    return { jobs: diversifyPage(ordered.slice(offset, offset + limit)), total, totalPages, page: p };
  }

  const extrasRaw = await getRemoteExtraJobs(base);
  const extras = orderExtras(extrasRaw, seed);
  const E = extras.length;

  // Países fatiados (EUA/Canadá/Austrália/NZ): forma fechada — lê apenas
  // os chunks da fatia pedida (nunca o arquivo inteiro).
  if (idx) {
    const L = idx.totalJobs;
    const N = L + E;
    const totalPages = Math.max(1, Math.ceil(N / limit));
    const offset = (p - 1) * limit;
    if (offset >= N) return { jobs: [], total: N, totalPages, page: p };
    const end = Math.min(offset + limit, N);
    const top = Math.min(N, 10);
    const phase1 = Math.min(5, E, Math.ceil(top / 2));
    const restStart = top;
    const restN = N - top;
    const remE = E - phase1;

    const kStart = extrasBefore(offset, phase1, restStart, restN, remE);
    const kEnd = extrasBefore(end, phase1, restStart, restN, remE);
    const localStart = offset - kStart;
    const localsInPage = end - offset - (kEnd - kStart);

    const locals = await loadLocalRangeFromChunks(base, idx, localStart, localsInPage);

    // k -> posição; monta a fatia percorrendo posições offset..end-1
    const extraAt = new Map<number, number>();
    for (let k = kStart; k < kEnd; k++) {
      extraAt.set(extraPos(k, phase1, restStart, restN, remE), k);
    }
    const jobs: Record<string, any>[] = [];
    let nextLocal = 0;
    for (let pos = offset; pos < end; pos++) {
      const k = extraAt.get(pos);
      if (k !== undefined) jobs.push(extras[k]);
      else if (nextLocal < locals.length) jobs.push(locals[nextLocal++]);
    }
    // BLOQUEIO DE CONCORRENTES: defesa extra em runtime (dados já são limpos
    // no build; o filtro aqui garante que nenhum portal apareça na resposta).
    const clean = filterCompetitorJobs(jobs);
    return { jobs: diversifyPage(clean), total: N, totalPages, page: p };
  }

  // Países com arquivo único: arquivo inteiro já é carregado no caminho
  // antigo também — monta a ordem completa e fatia.
  const raw = await fsp.readFile(path.join(DATA_DIR, `${base}.json`), "utf-8");
  const locals = filterCompetitorJobs(JSON.parse(raw));
  const ordered = buildFullOrder(locals, extras);
  const total = ordered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = Math.min((p - 1) * limit, Math.max(0, total - 1));
  return { jobs: diversifyPage(ordered.slice(offset, offset + limit)), total, totalPages, page: p };
}

/**
 * Listagem por SETOR: filtra locais (varredura) e remotas pelo setor e
 * aplica a MESMA mistura/rotação. Retornada já fatiada por página.
 */
export async function getSectorListing(
  baseName: string,
  sectorFilter: string,
  page: number,
  limit: number
): Promise<ListingPage> {
  const base = baseName.replace(/\.json$/, "").toLowerCase();
  const sector = sectorFilter.trim().toLowerCase();
  const seed = (hashStr(base + ":" + sector) ^ windowSeed()) >>> 0;
  const p = Math.max(1, page);

  const [idx, hasFile] = await Promise.all([
    getIndex(base),
    exists(path.join(DATA_DIR, `${base}.json`)),
  ]);

  let locals: Record<string, any>[] = [];
  if (idx) {
    for (const c of idx.chunks) {
      const chunkPath = safeChunkPath(c);
      if (!chunkPath) continue;
      try {
        const raw = await fsp.readFile(chunkPath, "utf-8");
        for (const job of JSON.parse(raw)) {
          if ((job.sector || "").toLowerCase() === sector) locals.push(job);
        }
      } catch {}
    }
  } else if (hasFile) {
    const raw = await fsp.readFile(path.join(DATA_DIR, `${base}.json`), "utf-8");
    for (const job of JSON.parse(raw)) {
      if ((job.sector || "").toLowerCase() === sector) locals.push(job);
    }
  }
  locals = filterCompetitorJobs(locals);

  let extrasRaw: Record<string, any>[] = [];
  if (idx || hasFile) {
    extrasRaw = (await getRemoteExtraJobs(base)).filter(
      (j: Record<string, any>) => (j.sector || "").toLowerCase() === sector
    );
  } else {
    extrasRaw = (await getRemotePool()).filter(
      (j: Record<string, any>) => (j.sector || "").toLowerCase() === sector
    );
  }

  const ordered = buildFullOrder(locals, orderExtras(extrasRaw, seed));
  const total = ordered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = Math.min((p - 1) * limit, Math.max(0, total - 1));
  return { jobs: diversifyPage(ordered.slice(offset, offset + limit)), total, totalPages, page: p };
}
