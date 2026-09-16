#!/usr/bin/env node
// Gera índices {id -> chunk} para os dados fatiados (ex.: EUA tem 19 chunks).
// Com o índice, buscar 1 vaga passa a custar 1 leitura de mapa + 1 leitura
// de chunk (antes: até 19 leituras sequenciais por request).
//
// Roda automaticamente antes do build (npm "prebuild"). Idempotente:
// só regenera quando o índice ou os chunks são mais novos que o idmap.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "site");

let generated = 0;
let skipped = 0;
const files = readdirSync(DATA_DIR).filter(f => f.endsWith("_index.json"));

for (const idxFile of files) {
  const base = idxFile.replace("_index.json", "");
  const outPath = join(DATA_DIR, `${base}_idmap.json`);
  const idxPath = join(DATA_DIR, idxFile);

  // Atualizado? (idmap mais novo que o índice e que todos os chunks)
  if (existsSync(outPath)) {
    const idmapMtime = statSync(outPath).mtimeMs;
    let fresh = idmapMtime > statSync(idxPath).mtimeMs;
    if (fresh) {
      try {
        const idx = JSON.parse(readFileSync(idxPath, "utf-8"));
        for (const chunkFile of idx.chunks || []) {
          const cp = join(DATA_DIR, chunkFile);
          if (existsSync(cp) && statSync(cp).mtimeMs > idmapMtime) { fresh = false; break; }
        }
      } catch { fresh = false; }
    }
    if (fresh) { skipped++; continue; }
  }

  try {
    const idx = JSON.parse(readFileSync(idxPath, "utf-8"));
    const idmap = {};
    for (const chunkFile of idx.chunks || []) {
      const chunkPath = join(DATA_DIR, chunkFile);
      if (!existsSync(chunkPath)) continue;
      const jobs = JSON.parse(readFileSync(chunkPath, "utf-8"));
      for (const j of jobs) {
        if (j && j.id !== undefined) idmap[String(j.id)] = chunkFile;
      }
    }
    writeFileSync(outPath, JSON.stringify(idmap));
    generated++;
  } catch (e) {
    console.error(`[gen-idmaps] falha em ${base}:`, e.message);
  }
}

console.log(`[gen-idmaps] ${generated} gerado(s), ${skipped} atualizado(s) — data/site/`);
