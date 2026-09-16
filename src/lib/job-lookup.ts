// Busca RÁPIDA de vaga individual (performance < 2s).
//
// Problema corrigido: para países com dados fatiados (ex.: EUA = 19 chunks
// de ~1.000 vagas), achar 1 vaga exigia ler e parsear ATÉ 19 arquivos JSON
// sequencialmente em cada request — segundos de latência no serverless.
//
// Solução: o build gera um índice {id -> chunk} por país
// (data/site/{base}_idmap.json, via scripts/gen-idmaps.mjs). Com ele, a
// busca lê exatamente 1 mapa + 1 chunk. Ambos ficam em cache em memória
// (lambda morna = zero I/O). Sem o índice, cai no fallback de varredura
// (comportamento antigo), então nunca quebra.

import { readFileSync, existsSync } from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { DATA_DIR } from "./data-dir";

type JobMap = Map<string, unknown>;
type IdMap = Record<string, string>;

// Caches em memória com limite (evita estourar a RAM da lambda)
const IDMAP_CACHE = new Map<string, IdMap>();
const CHUNK_CACHE = new Map<string, JobMap>();
const MAX_IDMAP_CACHE = 4;
const MAX_CHUNK_CACHE = 8;

function evict(cache: Map<string, unknown>, max: number) {
  while (cache.size >= max) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

function safePath(file: string): string | null {
  if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) return null;
  const resolved = path.resolve(DATA_DIR, file);
  if (!resolved.startsWith(DATA_DIR + path.sep) && resolved !== DATA_DIR) return null;
  return resolved;
}

function basePaths(baseName: string) {
  return {
    direct: safePath(`${baseName}.json`),
    idmap: safePath(`${baseName}_idmap.json`),
    index: safePath(`${baseName}_index.json`),
  };
}

function chunkToMap(file: string, jobs: unknown[]): JobMap {
  const m: JobMap = new Map();
  for (const j of jobs) {
    const id = (j as { id?: number | string }).id;
    if (id !== undefined) m.set(String(id), j);
  }
  return m;
}

// ─── Síncrona (server components / layouts) ───────────────────────────

function loadIdmapSync(baseName: string): IdMap | null {
  if (IDMAP_CACHE.has(baseName)) return IDMAP_CACHE.get(baseName)!;
  const p = basePaths(baseName).idmap;
  if (!p || !existsSync(p)) return null;
  try {
    const map = JSON.parse(readFileSync(p, "utf-8")) as IdMap;
    evict(IDMAP_CACHE, MAX_IDMAP_CACHE);
    IDMAP_CACHE.set(baseName, map);
    return map;
  } catch {
    return null;
  }
}

function loadDirectSync(baseName: string): JobMap | null {
  const key = `${baseName}::direct`;
  if (CHUNK_CACHE.has(key)) return CHUNK_CACHE.get(key)!;
  const p = basePaths(baseName).direct;
  if (!p || !existsSync(p)) return null;
  try {
    const jobs = JSON.parse(readFileSync(p, "utf-8")) as unknown[];
    const map = chunkToMap(baseName, jobs);
    evict(CHUNK_CACHE, MAX_CHUNK_CACHE);
    CHUNK_CACHE.set(key, map);
    return map;
  } catch {
    return null;
  }
}

function loadChunkFileSync(chunkFile: string): JobMap | null {
  const key = chunkFile;
  if (CHUNK_CACHE.has(key)) return CHUNK_CACHE.get(key)!;
  const p = safePath(chunkFile);
  if (!p || !existsSync(p)) return null;
  try {
    const jobs = JSON.parse(readFileSync(p, "utf-8")) as unknown[];
    const map = chunkToMap(key, jobs);
    evict(CHUNK_CACHE, MAX_CHUNK_CACHE);
    CHUNK_CACHE.set(key, map);
    return map;
  } catch {
    return null;
  }
}

function chunkListFromIndexSync(baseName: string): string[] {
  const p = basePaths(baseName).index;
  if (!p || !existsSync(p)) return [];
  try {
    const idx = JSON.parse(readFileSync(p, "utf-8")) as { chunks?: string[] };
    return idx.chunks || [];
  } catch {
    return [];
  }
}

export function findJobFast<T>(baseName: string, jobId: string): T | null {
  const id = String(jobId);

  // 1) Caminho rápido: idmap ({id -> chunk}) + 1 único chunk
  const idmap = loadIdmapSync(baseName);
  if (idmap) {
    const chunkFile = idmap[id];
    if (chunkFile) {
      const chunk = loadChunkFileSync(chunkFile);
      const hit = chunk?.get(id);
      if (hit) return hit as T;
    }
    // idmap existe mas não tem o id -> vaga não existe
    return null;
  }

  // 2) Arquivo direto (países pequenos), em cache
  const direct = loadDirectSync(baseName);
  if (direct) {
    return (direct.get(id) as T) ?? null;
  }

  // 3) Fallback: varre os chunks via _index.json (comportamento antigo)
  for (const chunkFile of chunkListFromIndexSync(baseName)) {
    const chunk = loadChunkFileSync(chunkFile);
    const hit = chunk?.get(id);
    if (hit) return hit as T;
  }

  return null;
}

// ─── Assíncrona (rotas de API) ─────────────────────────────────────────

export async function findJobFastAsync<T>(baseName: string, jobId: string): Promise<T | null> {
  const id = String(jobId);

  const idmap = IDMAP_CACHE.get(baseName) ?? (await loadIdmapAsync(baseName));
  if (idmap) {
    const chunkFile = idmap[id];
    if (chunkFile) {
      const chunk = CHUNK_CACHE.get(chunkFile) ?? (await loadChunkFileAsync(chunkFile));
      const hit = chunk?.get(id);
      if (hit) return hit as T;
    }
    return null;
  }

  const direct = CHUNK_CACHE.get(`${baseName}::direct`) ?? (await loadDirectAsync(baseName));
  if (direct) {
    return (direct.get(id) as T) ?? null;
  }

  // Fallback assíncrono
  const indexPath = basePaths(baseName).index;
  if (indexPath && existsSync(indexPath)) {
    try {
      const idx = JSON.parse(await fsp.readFile(indexPath, "utf-8")) as { chunks?: string[] };
      for (const chunkFile of idx.chunks || []) {
        const chunk = await loadChunkFileAsync(chunkFile);
        const hit = chunk?.get(id);
        if (hit) return hit as T;
      }
    } catch { /* ignore */ }
  }

  return null;
}

async function loadIdmapAsync(baseName: string): Promise<IdMap | null> {
  const p = basePaths(baseName).idmap;
  if (!p) return null;
  try {
    const map = JSON.parse(await fsp.readFile(p, "utf-8")) as IdMap;
    evict(IDMAP_CACHE, MAX_IDMAP_CACHE);
    IDMAP_CACHE.set(baseName, map);
    return map;
  } catch {
    return null;
  }
}

async function loadDirectAsync(baseName: string): Promise<JobMap | null> {
  const p = basePaths(baseName).direct;
  if (!p) return null;
  try {
    const jobs = JSON.parse(await fsp.readFile(p, "utf-8")) as unknown[];
    const map = chunkToMap(baseName, jobs);
    evict(CHUNK_CACHE, MAX_CHUNK_CACHE);
    CHUNK_CACHE.set(`${baseName}::direct`, map);
    return map;
  } catch {
    return null;
  }
}

async function loadChunkFileAsync(chunkFile: string): Promise<JobMap | null> {
  const p = safePath(chunkFile);
  if (!p) return null;
  try {
    const jobs = JSON.parse(await fsp.readFile(p, "utf-8")) as unknown[];
    const map = chunkToMap(chunkFile, jobs);
    evict(CHUNK_CACHE, MAX_CHUNK_CACHE);
    CHUNK_CACHE.set(chunkFile, map);
    return map;
  } catch {
    return null;
  }
}
