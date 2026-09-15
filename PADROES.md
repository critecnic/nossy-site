# NOSSY — Registro de Padrões (Baseline Versions)

Este arquivo é o registro oficial dos números de padrão do site NOSSY.
Um "padrão" é um estado estável, verificado e marcado no histórico Git
(através de uma tag anotada), usado como ponto de referência e de
restauração (rollback) para deploy na Vercel.

## Convenção de numeração

- Formato: `padrao-MMDD` (mês + dia da data em que o padrão é definido).
- Cada padrão corresponde a uma tag Git anotada apontando para um commit específico.
- Nunca alterar um padrão existente: correções novas geram um padrão novo.

## Índice de padrões

| Padrão        | Data       | Commit     | Conteúdo resumido                                                      |
|---------------|------------|------------|------------------------------------------------------------------------|
| padrao-0220   | 20/02      | `31c42df`  | Baseline original do site (design e funcionalidades base preservados)  |
| padrao-0916   | 16/09/2026 | ver tag    | Segurança + exclusão de concorrentes + sistema de pagamento Paddle completo + paywall 10% + cadastro verificado |
| premium-0220  | 16/09/2026 | ver tag    | Padrão Premium: pagamento de US$ 7 via Paddle — 10% das vagas remotas com cadeado + anúncios designados manualmente |

---

## padrao-0916 — Detalhamento

Definido em 16/09/2026 (tag movida para incluir o sistema de pagamento
completo). Inclui os commits de segurança `56e0e95`, o registro `74ac58a`,
o sistema de pagamento `a848700` e as correções de paywall/cadastro
seguintes.

### 1. Segurança — 8 correções aplicadas (commit `56e0e95`)

- Token de administração removido do código e movido para variável de ambiente (`ADMIN_TOKEN`).
- SSRF corrigido em `getBaseUrl()` (header `Host` não é mais confiado cegamente).
- Vazamento de `keyPreview` removido do endpoint de health do admin.
- Rate limiting revisto (limite em memória substituído/complementado).
- Captcha reforçado (cálculo previsível com `Math.random()` endurecido).
- XSS via JSON-LD corrigido (`dangerouslySetInnerHTML` agora usa `safeJsonLd`).
- Webhook Paddle com HMAC validado via `timingSafeEqual`.
- Preservação integral do visual e funcionalidades do `padrao-0220`.

### 2. Exclusão de anúncios de concorrentes (todos os anúncios)

Implementado em `src/lib/shared.ts` e aplicado em todas as superfícies de
listagem de vagas (home, país, setor e página de detalhe da vaga):

- `COMPETITOR_DOMAINS`: lista de bloqueio de portais de emprego concorrentes
  (remotive, jobgether, indeed, linkedin/jobs, glassdoor, ziprecruiter,
  monster, naukri, stepstone, careerjet, jooble, adzuna, talent, lensa,
  simplyhired, seek, wellfound, weworkremotely, remoteok, flexjobs e outros).
- `getCompanyCareerUrl()`: qualquer link de vaga que aponte para um
  concorrente é substituído pela URL de carreira da própria empresa.
- `KNOWN_COMPANY_URLS`: mapa de grandes empresas com suas páginas de
  carreira oficiais (Google, Microsoft, Amazon, Apple, Meta, Netflix,
  Stripe, Shopify, Uber, Booking, Nvidia, Accenture, TCS, Infosys, etc.).
- `CAREER_HOST_DOMAINS`: whitelist de hosts legítimos de ATS/carreira
  (Greenhouse, Lever, Workday, SmartRecruiters, Ashby, Personio, etc.)
  que são mantidos como links diretos.
- O site não utiliza rede de anúncios de terceiros (não há AdSense nem
  scripts de publicidade externos) — nenhuma vaga/anúncio referencia
  páginas concorrentes de ofertas de emprego.

### 3. Sistema de pagamento — completo e testado (commit `a848700`+)

- Paddle Billing API integrada (US$ 7 por vaga; `PADDLE_ENV=sandbox|live`).
- Desbloqueio real da vaga após pagamento: `/api/payment/verify` confirma
  o pagamento com a API do Paddle (por `txn_` ou por e-mail + jobId) e
  emite cookie assinado HMAC válido por 1 ano (`/api/payment/status`).
- Sem banco de dados: o cookie é a prova de compra.
- Webhook Paddle com HMAC + anti-replay (ts ±5 min) como canal de auditoria.
- 15/15 testes automatizados aprovados (`scripts/test-payment.mjs`).

### 4. Paywall em 10% das vagas remotas

- Regra determinística: vaga remota com `id % 10 === 0` (era 1%).
- 90% das vagas remotas permanecem gratuitas; visual inalterado.

### 5. Cadastro (e-mail + código) verificado e corrigido

- BUG corrigido: o código ficava em memória dentro da função serverless
  de `send-code`; `verify-code` roda em outra função isolada na Vercel e
  nunca o via — o cadastro nunca concluía em produção.
- Modo assinado stateless: validade via cookie HMAC (`nossy_vcode`),
  uso único, ligado ao e-mail, expira em 10 minutos.
- Produção sem `RESEND_API_KEY` agora retorna erro 503 honesto (antes
  fingia sucesso). Envio com falha no Resend retorna 502.
- Testes aprovados: código correto, errado, reuso, e-mail trocado,
  rate limit (3/min), fallback em memória em dev.

---

## premium-0220 — Padrão Premium (sistema de pagamento US$ 7)

Número de padrão **exclusivo do sistema de pagamento**. Para aplicar o
sistema Premium a um anúncio/vaga específica, basta citar este número
("**Premium 0220**") — o mecanismo de aplicação está definido abaixo.

### O que este padrão entrega

- Pagamento único de **US$ 7,00** (Paddle Billing, price
  `pri_01m0bhvecckh078qxexjwest9x` — "Desbloqueio único de contato") para
  liberar, na página da vaga: **nome da empresa, e-mail de contato,
  telefone e site** (botão "Desbloquear Contato - $7 USD").
- Bloqueio automático em **10% das vagas remotas**, com regra
  determinística (`id % 10 === 0`): a mesma vaga é sempre Premium, a
  mesma é sempre gratuita — sem aleatoriedade entre carregamentos.
- Anúncios designados manualmente (de qualquer tipo, remoto ou não)
  ficam SEMPRE Premium — ver mecanismo abaixo.
- Fluxo: e-mail → código de 6 dígitos/link mágico → autenticado →
  checkout Paddle → pagamento aprovado → webhook seguro (HMAC) →
  status Premium (cookie assinado, 1 ano, sem banco de dados) →
  empresa/e-mail/contato liberados em todas as visitas.

### Como aplicar o Premium 0220 a um anúncio específico

1. Informe o **id da vaga** + o número do padrão ("Premium 0220").
2. O id é adicionado à lista `PREMIUM_0220_FORCE_JOB_IDS` em
   `src/lib/shared.ts` (sempre Premium, mesmo sem ser remota).
3. Commit + deploy (Vercel): a vaga passa a exibir o cadeado imediatamente.

### Diagnóstico e testes

- `GET /api/payment/health`: booleans de configuração + **checagem viva**
  da API do Paddle (valida chave + preço ativo US$ 7,00 USD), sem expor segredos.
- Suíte: `scripts/test-premium-0220.mjs` (12/12 PASS em 16/09/2026).
- Integração confirmada com chave sandbox real: preço `pri_01m0bhvecckh078qxexjwest9x`
  ativo na conta (produto `pro_01m0bh3pnhx1sazz47rhjxsmdh`).

### Configuração automática (GitHub Actions → Vercel)

- Os segredos do padrão (PADDLE_API_KEY, PADDLE_PRICE_ID, PADDLE_ENV,
  NEXT_PUBLIC_BASE_URL, UNLOCK_SECRET, VERIFICATION_SECRET) ficam
  **criptografados nos Secrets do GitHub Actions** — nunca no código
  (o Push Protection do GitHub bloqueia chaves commitadas).
- O workflow `.github/workflows/sync-vercel-env.yml` copia esses segredos
  para as variáveis da Vercel e dispara redeploy de produção — basta que
  o secret `VERCEL_TOKEN` exista no repo (criado uma única vez pelo dono).
- Sem `VERCEL_TOKEN`, o workflow avisa e sai sem falhar.
- Para migrar de sandbox → live: trocar o valor de PADDLE_API_KEY /
  PADDLE_ENV nos Secrets do GitHub e rodar o workflow.

### Itens manuais remanescentes (não automatizáveis)

1. **Paddle dashboard (sandbox)**: definir o *default payment link*
   (Checkout → General settings) → `https://nossy.pro`. Sem isso a API do
   Paddle recusa criar a transação
   (`transaction_default_checkout_url_not_set`). É configuração da CONTA
   Paddle — não existe endpoint de API nem via GitHub.
2. **VERCEL_TOKEN no GitHub (Secrets → Actions, uma única vez)**: token
   gerado em vercel.com/account/tokens. Com ele, o workflow sincroniza
   TODAS as variáveis (incluindo UNLOCK_SECRET já armazenado) e faz
   redeploy sozinho. Sem ele, seria preciso colar as variáveis à mão na
   Vercel — e o desbloqueio Premium não fica funcional sem UNLOCK_SECRET.
3. **Opcional — PADDLE_WEBHOOK_SECRET**: copiar o segredo do webhook criado
   no dashboard (pdl_ntfset_...) e adicionar como secret `PADDLE_WEBHOOK_SECRET`
   no GitHub (o workflow o leva para a Vercel). Sem ele o endpoint de
   webhook responde 503 (apenas o log de auditoria fica inativo; o
   desbloqueio por pagamento NÃO depende do webhook). Conferir também se
   o webhook está inscrito em `transaction.completed`.

---

## Como restaurar um padrão (rollback)

```bash
# Local
git checkout padrao-0916

# Vercel
# Deploy > escolher branch/tag "padrao-0916" e redeploy
```

## Como definir o próximo padrão

```bash
git tag -a padrao-MMDD -m "Descrição do novo padrão"
git push origin main --tags
```

Após criar a tag, atualizar a tabela "Índice de padrões" acima no mesmo
commit (ou em commit imediatamente posterior).
