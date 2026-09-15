# Workflows prontos para ativar (Premium 0220)

`sync-vercel-env.yml` sincroniza os secrets do repositório (GitHub Actions)
para as env vars do projeto na Vercel e dispara redeploy de produção.

Para ativar, o arquivo precisa viver em `.github/workflows/`. Isso exige um
token com escopo `workflow` (ou mover pelo próprio GitHub web UI):

  git mv ops/github-workflows/sync-vercel-env.yml .github/workflows/
  git commit -m "premium-0220: ativa workflow sync-vercel-env"
  git push

Enquanto não estiver ativado, a sincronização pode ser feita manualmente ou
pela API da Vercel (POST /v10/projects/{id}/env?upsert=true) usando o
VERCEL_TOKEN. Secrets do repositório já são criptografados e mantidos via API.
