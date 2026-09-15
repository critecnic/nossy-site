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
| padrao-0916   | 16/09/2026 | ver tag    | Segurança (8 correções) + exclusão de concorrentes + pagamentos Paddle |

---

## padrao-0916 — Detalhamento

Definido em 16/09/2026 sobre o commit `56e0e95`
("security: fix 8 vulnerabilities found in audit — padrao-0220 preserved").

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

### 3. Sistema de pagamento

- Paddle integrado (US$ 7 por vaga) com melhoria de segurança no webhook
  (validação HMAC) e fluxo de publicação de vaga testado.

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
