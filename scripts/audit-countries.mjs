// Auditoria 2: nomes de países/continentes por idioma
import { readFileSync } from 'fs';
import { transpileModule, ModuleKind } from 'typescript';

function loadTS(path) {
  const src = readFileSync(path, 'utf8');
  const js = transpileModule(src, { compilerOptions: { module: ModuleKind.CommonJS, target: 99 } }).outputText;
  const mod = { exports: {} };
  const pathMod = { resolve: (...a) => a.join('/'), join: (...a) => a.join('/') };
  const requireShim = (name) => {
    if (name.startsWith('./') || name.startsWith('../')) {
      const resolved = new URL('.', 'file://' + process.cwd() + '/' + path).pathname + name.replace('./', '');
      const cands = [resolved, resolved + '.ts', resolved + '.tsx', resolved + '.json'];
      for (const c of cands) { try { return loadTS(c); } catch { /* tenta json */ } }
      return {};
    }
    return {};
  };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, requireShim);
  return mod.exports;
}

const langs = ['en','pt-br','pt-pt','es','fr','de','it','nl','pl','ru','zh','ja','ko','hi','bn','ar','tr','vi','th','ur','tl','sw'];

// country-names-full.ts
try {
  const cnf = loadTS('src/lib/country-names-full.ts');
  const exports0 = Object.keys(cnf);
  console.log('country-names-full.ts exports:', exports0.join(', '));
  for (const name of exports0) {
    const v = cnf[name];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const subKeys = Object.keys(v);
      console.log(`  ${name}: ${subKeys.length} entradas; chaves primeiras: ${subKeys.slice(0,6).join(', ')}`);
      // se for por idioma
      if (subKeys.some(k => langs.includes(k))) {
        for (const l of langs) {
          const n = v[l] ? Object.keys(v[l]).length : -1;
          console.log(`    ${l}: ${n}`);
        }
      }
    }
  }
} catch (e) { console.log('country-names-full erro:', e.message); }

// country-names.ts
try {
  const cn = loadTS('src/lib/country-names.ts');
  console.log('\ncountry-names.ts exports:', Object.keys(cn).join(', '));
  for (const name of Object.keys(cn)) {
    const v = cn[name];
    if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).some(k => langs.includes(k))) {
      console.log(`  ${name}:`);
      for (const l of langs) console.log(`    ${l}: ${v[l] ? (Array.isArray(v[l]) ? v[l].length : Object.keys(v[l]).length) : 'AUSENTE'}`);
    }
  }
} catch (e) { console.log('country-names erro:', e.message); }

// countries.ts + shared.ts REGIONS
const cs = loadTS('src/lib/countries.ts');
console.log('\ncountries.ts exports:', Object.keys(cs).join(', '));
const sh = loadTS('src/lib/shared.ts');
console.log('shared.ts exports:', Object.keys(sh).join(', '));
if (sh.REGIONS) console.log('REGIONS:', JSON.stringify(sh.REGIONS).slice(0, 400));
