// Auditoria do sistema de tradução NOSSY
// 1. Compara chaves do dicionário i18n entre os 22 idiomas
// 2. Verifica tradução de nomes de países (country-names-full.ts)
// 3. Verifica setores (sectorNames)
import { readFileSync } from 'fs';

const src = readFileSync('src/lib/i18n.ts', 'utf8');

// Converte o TS em JS: usa o transform do TypeScript nativo
import { transpileModule, ModuleKind } from 'typescript';
const js = transpileModule(src, { compilerOptions: { module: ModuleKind.CommonJS, target: 99 } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', js)(mod, mod.exports);
const { i18n, sectorNames, LANGUAGES } = mod.exports;

const langs = LANGUAGES.map(l => l.code);
const enKeys = Object.keys(i18n['en']).sort();

console.log(`== Dicionário i18n: ${langs.length} idiomas, ${enKeys.length} chaves em "en" ==`);
let totalMissing = 0;
for (const lang of langs) {
  const keys = Object.keys(i18n[lang] || {});
  const missing = enKeys.filter(k => !(k in (i18n[lang] || {})));
  const extra = keys.filter(k => !enKeys.includes(k));
  // chaves com valor idêntico ao inglês (possível não-tradução, só sinaliza se idioma != en)
  const sameAsEn = keys.filter(k => k in i18n['en'] && i18n[lang][k] === i18n['en'][k] && /[a-zA-Z]{4,}/.test(i18n['en'][k]) && lang !== 'en');
  totalMissing += missing.length;
  console.log(`${lang.padEnd(6)} chaves=${keys.length} faltando=${missing.length} extras=${extra.length} iguais-ao-en=${sameAsEn.length}`);
  if (missing.length) console.log(`   FALTANDO: ${missing.join(', ')}`);
  if (extra.length) console.log(`   EXTRAS: ${extra.join(', ')}`);
  if (sameAsEn.length && sameAsEn.length <= 12) console.log(`   IGUAIS-EN: ${sameAsEn.join(', ')}`);
}

// Setores
console.log(`\n== Setores (sectorNames) ==`);
const enSectors = Object.keys(sectorNames['en']).sort();
for (const lang of langs) {
  const keys = Object.keys(sectorNames[lang] || {});
  const missing = enSectors.filter(k => !(k in (sectorNames[lang] || {})));
  console.log(`${lang.padEnd(6)} setores=${keys.length} faltando=${missing.length}${missing.length ? ' -> ' + missing.join(', ') : ''}`);
}

// Valores vazios ou placeholders suspeitos
console.log(`\n== Valores suspeitos (vazios, "TODO", "[object") ==`);
let sus = 0;
for (const lang of langs) {
  for (const [k, v] of Object.entries(i18n[lang] || {})) {
    if (typeof v !== 'string' || !v.trim() || /^(TODO|TBD|\{0\}|\[object)/.test(v.trim())) {
      console.log(`   ${lang}.${k} = ${JSON.stringify(v)}`);
      sus++;
    }
  }
}
if (!sus) console.log('   nenhum');

// Chaves usadas no código mas ausentes no dicionário en
console.log(`\n== Chaves t('...') usadas no código vs dicionário en ==`);
import { execSync } from 'child_process';
const out = execSync(`grep -rhoE "t\\(['\\\`][A-Za-z0-9_]+['\\\`]\\)" src/app src/components --include='*.tsx' --include='*.ts' 2>/dev/null || true`, { encoding: 'utf8' });
const used = new Set([...out.matchAll(/t\(['"`]([A-Za-z0-9_]+)['"`]\)/g)].map(m => m[1]));
const unknown = [...used].filter(k => !(k in i18n['en']));
console.log(`usadas=${used.size}, ausentes-no-en=${unknown.length}${unknown.length ? ' -> ' + unknown.join(', ') : ''}`);
