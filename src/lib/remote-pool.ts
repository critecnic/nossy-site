// Pool GLOBAL de vagas remotas (padrão 1874 / catálogo mundial).
//
// As vagas 100% remotas vivem em dois arquivos (asia_remoto-global e
// europa_remoto-global). O dono pediu que TODOS os países do catálogo
// mundial (~195) exibam essas vagas remotas. Países sem arquivo próprio de
// dados recebem o pool como conteúdo da página; o lookup de detalhe usa o
// MESMO pool, garantindo listagem <-> detalhe consistentes.
//
// Deduplicação por id: o pool da Ásia tem prioridade (mesma ordem usada no
// merge e no findJobInPools, então listagem e detalhe nunca divergem).

import { readFileSync, existsSync } from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { DATA_DIR } from "./data-dir";
import { filterCompetitorJobs, isCompetitorJob } from "./competitors";

const POOL_FILES = ["asia_remoto-global.json", "europa_remoto-global.json"] as const;

type AnyJob = Record<string, any>;

let poolCacheSync: AnyJob[] | null = null;
let poolCacheAsync: Promise<AnyJob[]> | null = null;
const byIdCacheSync = new Map<string, AnyJob | null>();

function safeRead(file: string): string | null {
  if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) return null;
  const p = path.resolve(DATA_DIR, file);
  if (!p.startsWith(DATA_DIR + path.sep) && p !== DATA_DIR) return null;
  if (!existsSync(p)) return null;
  try {
    return readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

function mergePools(asia: AnyJob[], europa: AnyJob[]): AnyJob[] {
  const seen = new Set<string>();
  const merged: AnyJob[] = [];
  for (const j of [...asia, ...europa]) {
    const id = String(j?.id ?? "");
    if (!id || seen.has(id)) continue;
    if (isCompetitorJob(j)) continue;
    seen.add(id);
    merged.push(j);
  }
  // Mais recentes primeiro (campo posted é ISO date)
  merged.sort((a, b) => String(b.posted || "").localeCompare(String(a.posted || "")));
  return merged;
}

/** Pool combinado (sem concorrentes), ordenado por data — síncrono. */
export function getRemotePoolSync(): AnyJob[] {
  if (poolCacheSync) return poolCacheSync;
  const asia = safeRead(POOL_FILES[0]);
  const europa = safeRead(POOL_FILES[1]);
  let asiaJobs: AnyJob[] = [];
  let europaJobs: AnyJob[] = [];
  try { asiaJobs = asia ? JSON.parse(asia) : []; } catch {}
  try { europaJobs = europa ? JSON.parse(europa) : []; } catch {}
  poolCacheSync = mergePools(Array.isArray(asiaJobs) ? asiaJobs : [], Array.isArray(europaJobs) ? europaJobs : []);
  return poolCacheSync;
}

/** Pool combinado — assíncrono (rotas de API). */
export async function getRemotePool(): Promise<AnyJob[]> {
  if (poolCacheSync) return poolCacheSync;
  if (!poolCacheAsync) {
    poolCacheAsync = (async () => {
      const ordered: AnyJob[] = [];
      for (const file of POOL_FILES) {
        if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) continue;
        const p = path.resolve(DATA_DIR, file);
        if (!p.startsWith(DATA_DIR + path.sep) && p !== DATA_DIR) continue;
        try {
          const raw = await fsp.readFile(p, "utf-8");
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) ordered.push(...parsed);
        } catch {}
      }
      const merged = mergePools(ordered, []);
      poolCacheSync = merged;
      return merged;
    })();
  }
  return poolCacheAsync;
}

/**
 * Busca uma vaga do pool por id (para URLs de países sem arquivo próprio).
 * Ordem = ordem do merge (Ásia primeiro), consistente com getRemotePool.
 */
export function findJobInPoolsSync(jobId: string): AnyJob | null {
  const id = String(jobId);
  if (byIdCacheSync.has(id)) return byIdCacheSync.get(id) ?? null;
  const pool = getRemotePoolSync();
  const hit = pool.find((j) => String(j?.id) === id) ?? null;
  byIdCacheSync.set(id, hit);
  return hit;
}

export async function findJobInPools(jobId: string): Promise<AnyJob | null> {
  const id = String(jobId);
  if (byIdCacheSync.has(id)) return byIdCacheSync.get(id) ?? null;
  const pool = await getRemotePool();
  const hit = pool.find((j) => String(j?.id) === id) ?? null;
  byIdCacheSync.set(id, hit);
  return hit;
}

/** Total de vagas no pool (para contagens do catálogo). */
export function remotePoolCountSync(): number {
  return getRemotePoolSync().length;
}

// Reexport para rotas que só precisam filtrar concorrentes de arquivos locais
export { filterCompetitorJobs };
