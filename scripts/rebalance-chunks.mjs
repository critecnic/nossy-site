#!/usr/bin/env node
// PADRÃO 1874 — Rebalanceamento de chunks (correção de bug de produção).
//
// A limpeza de concorrentes (Task 16) removeu linhas de chunks individuais
// sem rebalancear. A API /api/data/country pagina assumindo CHUNK_SIZE=1000
// por arquivo: com chunks irregulares, o mapeamento posição->chunk quebra
// (páginas intermediárias vazias/deslocadas e a fronteira local->pool do
// remoto global errada). EUA tinha p1=937; Austrália, 8 chunks irregulares.
//
// Este script reescreve os chunks de TODOS os países com _index.json:
//   - 1000 linhas por arquivo (exceto o último), na ordem original;
//   - _index.json atualizado (chunks + totalJobs);
//   - _idmap.json regenerado (id -> chunk) para o job-lookup rápido;
//   - arquivos p* órfãos apagados.
//
// Execução: node scripts/rebalance-chunks.mjs

import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data", "site");
const CHUNK_SIZE = 1000; // MESMO valor de CHUNK_SIZE em /api/data/country

const indexes = readdirSync(DATA).filter((f) => f.endsWith("_index.json"));

for (const idxFile of indexes) {
  const base = idxFile.slice(0, -"_index.json".length);
  const idx = JSON.parse(readFileSync(path.join(DATA, idxFile), "utf-8"));

  // 1. Concatena todas as linhas na ordem do índice
  const rows = [];
  for (const chunk of idx.chunks) {
    const jobs = JSON.parse(readFileSync(path.join(DATA, chunk), "utf-8"));
    rows.push(...jobs);
  }

  // 2. Reescreve p1..pN com 1000 linhas cada
  const newChunks = [];
  const total = rows.length;
  const fileCount = Math.max(1, Math.ceil(total / CHUNK_SIZE));
  for (let i = 1; i <= fileCount; i++) {
    const name = `${base}_p${i}.json`;
    writeFileSync(path.join(DATA, name), JSON.stringify(rows.slice((i - 1) * CHUNK_SIZE, i * CHUNK_SIZE)));
    newChunks.push(name);
  }

  // 3. Apaga arquivos p* órfãos (além de pN) ou os antigos fora do padrão
  const used = new Set(newChunks);
  for (const f of readdirSync(DATA)) {
    if (f.startsWith(`${base}_p`) && f.endsWith(".json") && !used.has(f)) {
      unlinkSync(path.join(DATA, f));
    }
  }

  // 4. _index.json + _idmap.json
  writeFileSync(path.join(DATA, idxFile), JSON.stringify({ chunks: newChunks, totalJobs: total }));
  const idmap = {};
  for (let i = 0; i < newChunks.length; i++) {
    const slice = rows.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    for (const j of slice) idmap[String(j.id)] = newChunks[i];
  }
  writeFileSync(path.join(DATA, `${base}_idmap.json`), JSON.stringify(idmap));

  const before = idx.totalJobs;
  console.log(`${base}: ${idx.chunks.length} chunks (totalJobs=${before}) -> ${newChunks.length} chunks (totalJobs=${total})${before === total ? "" : " ⚠ totalJobs mudou"}`);
}
console.log("Rebalanceamento concluído.");
