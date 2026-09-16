// Premium 0220 — suíte de validação (HTTP + dados)
// Uso: iniciar o servidor antes (next start) e rodar `node scripts/test-premium-0220.mjs`
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const BASE = process.env.TEST_BASE || 'http://localhost:3000';
let pass = 0, fail = 0;
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log('PASS  ' + name + (extra ? ' — ' + extra : '')); }
  else { fail++; console.log('FAIL  ' + name + (extra ? ' — ' + extra : '')); }
}

// ── 1. Health: integração Paddle (config efetiva) ─────────────────
const health = await (await fetch(BASE + '/api/payment/health')).json();
check('health.ok', health.ok === true);
check('health.paddle.env=sandbox', health.paddle?.env === 'sandbox', health.paddle?.apiUrl);
check('health.paddle.priceIdConfigured', health.paddle?.priceIdConfigured === true);
check('health.webhookUrl aponta para /api/webhook', String(health.webhookUrl || '').endsWith('/api/webhook'), health.webhookUrl);

const hasKey = health.paddle?.apiKeyConfigured === true;
if (hasKey) {
  check('health.paddle.api.ok — chave real valida o preço', health.paddle?.api?.ok === true, JSON.stringify(health.paddle?.api));
  check('health.paddle.api.priceStatus=active', health.paddle?.api?.priceStatus === 'active');
  check('health.paddle.api.amount=7 (USD 7,00)', health.paddle?.api?.amount === '7');
  check('health.paddle.api.currency=USD', health.paddle?.api?.currency === 'USD');
} else {
  check('modo sem chave: health honesto (api not ok)', health.paddle?.api?.ok === false, health.paddle?.api?.code);
}

// ── 2. Checkout (comporta-se conforme a chave configurada) ───────────
// Com chave: enquanto o "default payment link" não for definido no dashboard
// Paddle, a API recusa a transação; o site deve repassar o código do erro.
// Sem chave: checkout deve responder 503 honesto de configuração pendente.
const coRes = await fetch(BASE + '/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'premium0220-test@nossy.pro',
    jobId: 1010,
    jobTitle: 'Premium 0220 Checkout Test',
    lang: 'pt-br',
    jobUrl: '/pt-br/jobs/america/brasil/1010',
  }),
});
const coBody = await coRes.json().catch(() => ({}));
if (coRes.status === 200 && coBody.url) {
  check('checkout 200 → URL de checkout do Paddle', String(coBody.url).includes('paddle'), String(coBody.url).slice(0, 90));
} else if (!hasKey) {
  check('checkout 503 honesto (sem chave configurada)', coRes.status === 503, coRes.status + ' ' + JSON.stringify(coBody).slice(0, 120));
} else {
  check('checkout repassa erro de config do Paddle (default payment link)', coRes.status >= 400 && /checkout_url|payment_link|paddle/i.test(JSON.stringify(coBody)), coRes.status + ' ' + JSON.stringify(coBody).slice(0, 170));
}

// ── 3. Dados: paywall em ~10% das vagas remotas ───────────────────────
const dir = 'data/site';
let remote = 0, locked = 0;
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.json') || f === 'countries.json' || f === 'latest_20.json') continue;
  let jobs;
  try { jobs = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { continue; }
  if (!Array.isArray(jobs)) continue;
  for (const j of jobs) {
    const t = String(j.type || '').toLowerCase();
    if (t === 'remote' || t === 'remoto') {
      remote++;
      if (Number(j.id || 0) % 10 === 0) locked++;
    }
  }
}
check('vagas remotas detectadas nos dados', remote > 1000, String(remote));
const pct = remote ? (locked / remote) * 100 : 0;
check('paywall em ~10% das remotas (determinístico id%10)', pct >= 8 && pct <= 12, pct.toFixed(2) + '% (' + locked + '/' + remote + ')');

console.log('\nRESULTADO: ' + pass + ' PASS, ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
