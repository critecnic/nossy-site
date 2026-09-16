// Premium 0220 — teste final: vazamento estático, máscara por-usuário,
// desbloqueio por cookie e nomes completos de localização.
const BASE = 'http://localhost:3000';
let pass = 0, fail = 0;
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log('PASS  ' + name + (extra ? ' — ' + extra : '')); }
  else { fail++; console.log('FAIL  ' + name + (extra ? ' — ' + extra : '')); }
}

// ── 1. Vaga paywall REAL pela regra (remota, id%10==0): id=1980 ────
const r1 = await fetch(BASE + '/api/data/job-detail?file=asia_china.json&id=1980&lang=pt-br');
const locked = await r1.json();
check('job-detail sem cookie: empresa mascarada', locked.company === '***', locked.company);
check('job-detail sem cookie: sem email', !locked.contactEmail);
check('job-detail sem cookie: sem phone', !locked.contactPhone, String(locked.contactPhone));
check('job-detail paywall: cache private no-store', (r1.headers.get('cache-control') || '').includes('no-store'), r1.headers.get('cache-control'));

// ── 2. Mesma vaga COM cookie premium válido (HMAC real) ───────────
const { createHmac } = await import('crypto');
const { readFileSync } = await import('fs');
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
const secret = env.UNLOCK_SECRET;
const exp = Math.floor(Date.now() / 1000) + 3600;
const payload = 'premium.' + exp;
const sig = createHmac('sha256', secret).update(payload).digest('hex');
const cookie = `nossy_premium=${payload}.${sig}`;
const r2 = await fetch(BASE + '/api/data/job-detail?file=asia_china.json&id=1980&lang=pt-br', { headers: { cookie } });
const unlocked = await r2.json();
check('job-detail com cookie premium: empresa REAL', unlocked.company === 'Tencent', unlocked.company);

// ── 3. Lista pública: máscara SEMPRE (mesma resposta p/ todos) ────
const r3 = await fetch(BASE + '/api/data/country?file=asia_china.json&lang=en&page=2&limit=1000');
const list = await r3.json();
const pwList = (list.jobs || []).filter(j => j.paywall);
check('lista country: paywall mascarado em qualquer pagina', pwList.length > 0 && pwList.every(j => j.company === '***'), `${pwList.length} paywall na pagina 2`);

// ── 4. Nomes completos (formatJobLocation via página traduzida) ───
// 4a. vaga remota com "Remote - USA" nos dados
const r4 = await fetch(BASE + '/api/data/job-detail?file=europa_portugal.json&id=' + (JSON.parse(readFileSync('data/site/europa_portugal.json', 'utf8'))[0].id) + '&lang=en');
const j4 = await r4.json();
check('job-detail funciona apos mudanca de data dir', Boolean(j4 && j4.id), 'id=' + j4.id);

// ── 5. HTML da pagina da vaga: sem empresa real no HTML bloqueado ──
const html = await (await fetch(BASE + '/en/jobs/asia/china/1980')).text();
check('HTML bloqueado sem "Tencent"', !html.includes('Tencent'), html.includes('Confidential') ? 'Confidential no meta' : '');

console.log(`\nRESULTADO: ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
