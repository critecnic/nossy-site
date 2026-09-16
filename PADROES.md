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
  NEXT_PUBLIC_BASE_URL, UNLOCK_SECRET, VERIFICATION_SECRET,
  RESEND_FROM_EMAIL) já estão **criptografados nos Secrets do GitHub
  Actions** (criados via API de secrets — nunca no código; o Push
  Protection do GitHub bloqueia chaves commitadas).
- O workflow está pronto em `ops/github-workflows/sync-vercel-env.yml`:
  copia esses segredos para as variáveis da Vercel, dispara redeploy de
  produção e deixa a instrução de validação no log. Para ativá-lo é
  preciso mover para `.github/workflows/` com um token de escopo
  `workflow` (o PAT atual tem só `repo`). Enquanto o workflow não está
  ativo, a mesma operação pode ser feita pela API da Vercel
  (POST /v10/projects/{id}/env?upsert=true) com o VERCEL_TOKEN.
- Para migrar de sandbox → live: trocar PADDLE_API_KEY / PADDLE_ENV nos
  Secrets do GitHub e rodar o workflow (ou o mesmo upsert via API).

### Webhook (auditoria de pagamento)

- Handler: `POST /api/webhook` — valida assinatura HMAC `ts=...;h1=...`
  (timingSafeEqual) + anti-replay de ±5 min; sem secret responde 503.
  É stateless: apenas registra; o desbloqueio real ocorre em
  `/api/payment/verify` (consulta direta à API Paddle) quando o
  comprador volta pelo success_url.
- Alias `/api/webhook-0220` (rewrite no next.config.ts): destino
  distinto para o webhook gerido via API — a Paddle recusa criar um
  segundo webhook com o MESMO destino do webhook manual
  (`notification_setting_cannot_be_duplicate`) e o secret do manual não
  é legível via API (GET /notification-settings → 403 com a chave atual).
- Tentativa de criação do webhook via API com a chave atual → 403
  forbidden (a chave não tem permissão de notification-settings, apenas
  leitura de catálogo/transações). Dois caminhos: (a) colar o secret do
  webhook manual existente (`pdl_ntfset_...`); (b) criar nova chave API
  com permissões completas → aí a criação do webhook em
  /api/webhook-0220 e a captura do secret ficam 100% automatizadas.


### Máscara server-side (reforço 16/09/2026 — vazamento corrigido)

- Antes: a máscara "***" era só visual (React); as APIs devolviam a vaga
  COMPLETA (DevTools revelava empresa/e-mail/telefone) e as meta tags
  publicavam o nome da empresa para o Google. Além disso, clicar em
  "Desbloquear" revelava tudo antes do pagamento.
- Agora: `src/lib/paywall-mask.ts` aplica a máscara NO SERVIDOR:
  * `job-detail` (por-usuário): bloqueado sem cookie válido
    (`nossy_premium`/`wv_unlock_{id}`, HMAC timingSafeEqual); cache
    `private, no-store` em vagas com paywall.
  * `country`/`latest` (listas públicas): máscara sempre — respostas
    idênticas para todos, cache CDN seguro.
  * `layout.tsx` (title/meta/OG): "Confidential" para vagas bloqueadas.
  * Clicar em "Desbloquear" só abre o painel e-mail → 6 dígitos →
    pagamento; o conteúdo real aparece SOMENTE após o verify da API
    Paddle (cookie emitido + re-busca dos dados).
- Nomes COMPLETOS: `src/lib/location-names.ts` expande siglas de estados
  ("Austin, TX" -> "Austin, Texas"), traduz país do local
  ("Krakow, Poland" -> "Cracóvia, Polônia"), normaliza regiões
  ("EUA"/"America do Norte") e REGION_NAMES/TYPE_LABELS sem abreviações
  (ru em cirílico, acentos fr/pl/nl/vi/tr).

### Itens manuais remanescentes (não automatizáveis)

Confirmados por sondagem na API em 16/09/2026 (spec oficial tem 70
endpoints; NÃO existe endpoint para default payment link nem para
criar tokens Vercel — ambos são dashboard-only):

1. **VERCEL_TOKEN (uma única vez)**: gerar em vercel.com/account/tokens
   e enviar (ou adicionar como secret `VERCEL_TOKEN` no GitHub). Com ele
   as env vars de produção são aplicadas via API + redeploy, sem tocar
   no dashboard da Vercel.
2. **Paddle dashboard (sandbox)**: definir o *default payment link*
   (Checkout → General settings) → `https://nossy.pro`. Sem isso a API
   recusa criar transações (`transaction_default_checkout_url_not_set`,
   inclusive com override `checkout.url`). Configuração de CONTA —
   sem endpoint de API.
3. **Secret do webhook `pdl_ntfset_...`**: OU colar o secret do webhook
   manual existente (Paddle → Notifications), OU fornecer nova chave API
   com permissões completas (aí eu crio o webhook em /api/webhook-0220
   e capturo o secret sozinho). Sem isso o webhook responde 503, mas o
   desbloqueio por pagamento NÃO depende do webhook (verify via API).
4. **RESEND_API_KEY (login mágico)**: conta grátis em resend.com →
   criar API key → verificar domínio nossy.pro (registros DNS no
   painel dns-parking/Hostinger: SPF + DKIM). Sem isso o envio do
   código/link mágico responde 503 em produção. Enquanto não houver,
   o login por e-mail fica indisponível (fluxo de pagamento completo
   requer autenticação prévia).

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

### Dados PRIVADOS fora de public/ (reforço 16/09/2026 — vazamento estático corrigido)

- VAZAMENTO: os JSONs brutos ficavam em `public/data/` e eram servidos
  estaticamente (`https://nossy.pro/data/asia_china.json`) — qualquer visitante
  baixava empresa REAL das vagas com paywall, burlando a máscara das APIs.
- AGORA: os arquivos vivem em `data/site/` (fora de public/, nunca publicados
  como estático). Somente rotas de API os leem (src/lib/data-dir.ts) e aplicam
  a máscara antes de responder.
- `next.config.ts`:
  * `outputFileTracingIncludes` empacota `data/site/**` no deploy serverless
    (senão as APIs devolveriam 404 na Vercel);
  * rewrite `beforeFiles: /data/:path* -> /api/data-blocked` bloqueia qualquer
    acesso estático residual (rota dedicada responde 404).
- Rotas atualizadas para o diretório privado: job-detail, country, latest
  (inclusive o fallback de erro, que antes devolvia o arquivo BRUTO — vazamento
  corrigido), sectors, [file] (latest_20.json agora sempre mascarado),
  admin/health, admin/repair, agent, e o layout de meta tags da vaga.
- Campo `paywall` REALINHADO à regra do padrão (scripts/realign_paywall_field.py):
  o pipeline antigo marcava 1.979 vagas (9% remoto + salário + hash); a regra
  Premium 0220 (10% das remotas id%10==0 + lista forçada) resulta em 478.
  O campo não é lido em runtime, mas a marca errada confundia auditorias.
- Nomes completos ampliados (src/lib/location-names.ts): províncias do Canadá
  ("Toronto, ON" -> "Toronto, Ontário" pt/es/en), sufixos de país por sigla
  ("Austin, USA" -> "Austin, Estados Unidos", "London, UK" -> "London, Reino
  Unido"), "Remote - US/USA/UK" -> nome completo, "Remote - Worldwide" ->
  "Remoto - Mundial", busca reversa nome->slug e região "remoto-global"
  adicionada a REGION_NAMES nos 22 idiomas (com "Ásia" acentuada).
- Desbloqueio pós-pagamento mais resiliente: ao voltar do Paddle
  (?payment=success) a página mostra "Confirmando seu pagamento..." e, se a
  confirmação automática falhar (outro dispositivo/sessão perdida), o
  comprador digita o e-mail usado na compra para revalidar (i18n en/pt-br/
  pt-pt/es; demais idiomas caem no fallback EN).
- Suíte: scripts/test-premium-0220.mjs (11 PASS) + scripts/test-paywall-final.mjs
  (8 PASS) — vazamento estático 404, máscara por-usuário, cookie premium HMAC,
  listas públicas mascaradas, HTML sem empresa real.
