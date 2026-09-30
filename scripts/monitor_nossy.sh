#!/usr/bin/env bash
# NOSSY 0220 — Monitor de reativação da Vercel (pós-pausa HTTP 402)
# ================================================================
# A conta Hobby pausou (1.005.028/1.000.000 invocations). O reset do ciclo
# ocorre no dia 1º do mês (00:00 UTC). Este script:
#   1. Verifica nossy.pro a cada 5 minutos;
#   2. Ao detectar HTTP 200 (fora da pausa), checa se o build com as
#      otimizações (ISR) já está no ar — marcador: Cache-Control com
#      s-maxage na página de país (código antigo = no-store);
#   3. Se o site voltou com código ANTIGO, envia 1 commit vazio para a main
#      (dispara build novo na Vercel) e continua checando até confirmar;
#   4. Loga tudo em /home/z/my-project/monitor-nossy.log e sai no sucesso.
LOG=/home/z/my-project/monitor-nossy.log
REPO=/home/z/my-project/nossy-site
FLAG=/home/z/my-project/.redeploy-enviado
HOME_URL="https://nossy.pro/en/jobs"
COUNTRY_URL="https://nossy.pro/en/jobs/europa/germany"

log() { echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $*" >> "$LOG"; }

log "=== MONITOR INICIADO (intervalo 300s; reset Vercel esperado 01/10 00:00 UTC) ==="
log "estado do repo no início: $(cd "$REPO" && git log --oneline -1)"
while true; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$HOME_URL")
  if [ "$code" = "200" ]; then
    log "SITE RESPONDEU 200 — saindo da pausa!"
    cc=$(curl -s -o /dev/null -D - --max-time 30 "$COUNTRY_URL" | grep -i "^cache-control" | head -1 | tr -d '\r')
    xv=$(curl -s -o /dev/null -D - --max-time 30 "$COUNTRY_URL" | grep -i "^x-vercel-cache" | head -1 | tr -d '\r')
    log "página país -> $cc | $xv"
    if echo "$cc" | grep -q "s-maxage"; then
      log "=== SUCESSO: SITE NO AR COM CÓDIGO NOVO (ISR ativo, s-maxage presente). Monitor concluído. ==="
      exit 0
    fi
    if [ ! -f "$FLAG" ]; then
      log "código ANTIGO no ar (sem s-maxage) — enviando commit vazio para disparar build novo..."
      cd "$REPO" || exit 1
      if git commit --allow-empty -m "redeploy-0220: dispara build com as otimizacoes de invocations apos reativacao da conta" >/dev/null 2>&1 \
         && git push origin main >/dev/null 2>&1; then
        log "push vazio enviado — aguardando build da Vercel (~2-5 min)"
        touch "$FLAG"
      else
        log "FALHA no push vazio (verificar git/credenciais manualmente)"
      fi
      cd /home/z/my-project
    else
      log "aguardando build do redeploy... (próxima checagem em 5 min)"
    fi
  elif [ "$code" = "402" ]; then
    log "pausado: HTTP 402 (aguardando reset do ciclo Vercel)"
  else
    log "estado intermediário: HTTP $code (pode ser build em progresso)"
  fi
  sleep 300
done
