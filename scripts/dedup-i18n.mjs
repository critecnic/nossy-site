// Remove chaves duplicadas dentro de cada bloco de idioma do dicionário
// i18n (mantém a ÚLTIMA ocorrência — mesmo comportamento do JS em runtime)
// e corrige inserções mal posicionadas.
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/lib/i18n.ts';
const lines = readFileSync(FILE, 'utf8').split('\n');

const LANGS = ["en","pt-br","pt-pt","es","fr","de","it","nl","pl","ru","zh","ja","ko","hi","bn","ar","tr","vi","th","ur","tl","sw"];
const KEY_RE = /^(\s*)"([A-Za-z0-9_-]+)":\s*("(?:[^"\\]|\\.)*")\s*,?\s*$/;

let removed = 0;
let currentLang = null;
let blockDepth = 0;
// última posição (índice de linha) de cada chave no bloco atual
const seen = new Map(); // key -> [lineIdx...]

// 1ª passada: identifica blocos de idioma no nível 1 do dicionário i18n
const inI18n = { active: false };
let i18nStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('export const i18n')) { i18nStart = i; break; }
}

// processa linhas do dicionário i18n
let i = i18nStart;
let depth = 0;
let langLine = -1;
const langBlocks = []; // {lang, start, end}
for (let j = i; j < lines.length; j++) {
  const L = lines[j];
  if (langBlocks.length > 0 && langBlocks[langBlocks.length-1].end < 0) {
    // procura fim do bloco atual: linha '  },'
    if (/^  },\s*$/.test(L)) langBlocks[langBlocks.length-1].end = j;
    continue;
  }
  const m = L.match(/^  "([a-z-]+)": \{/);
  if (m && LANGS.includes(m[1])) {
    langBlocks.push({ lang: m[1], start: j, end: -1 });
  }
}

console.log(`blocos: ${langBlocks.length}, todos fechados: ${langBlocks.every(b => b.end > 0)}`);

// 2ª passada: dentro de cada bloco, acha chaves duplicadas e remove as
// ocorrências anteriores (mantém a última)
const toDelete = new Set();
for (const block of langBlocks) {
  const keyLines = new Map(); // key -> array de índices de linha
  for (let j = block.start + 1; j < block.end; j++) {
    const m = lines[j].match(KEY_RE);
    if (m) {
      const k = m[2];
      if (!keyLines.has(k)) keyLines.set(k, []);
      keyLines.get(k).push(j);
    }
  }
  for (const [k, idxs] of keyLines) {
    if (idxs.length > 1) {
      console.log(`  ${block.lang}.${k}: ${idxs.length} ocorrências -> mantém a última`);
      for (let x = 0; x < idxs.length - 1; x++) toDelete.add(idxs[x]);
      removed += idxs.length - 1;
    }
  }
}

const out = lines.filter((_, idx) => !toDelete.has(idx)).join('\n');
writeFileSync(FILE, out, 'utf8');
console.log(`Duplicatas removidas: ${removed}`);
