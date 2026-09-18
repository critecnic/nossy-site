#!/bin/bash
# ============================================================
# NOSSY 0220 — Teste E2E da proteção IP Whitelisting (middleware)
# Uso: test-ip-whitelist.sh active|safe
#   active = security.json com lockEnabled=true  (+ IP 198.51.100.9)
#   safe   = security.json com lockEnabled=false (estado de produção)
# Requer build prévio com o JSON no estado correspondente.
# ============================================================
MODO="${1:-active}"
PORT=3111
BASE="http://127.0.0.1:$PORT"
KEY_JSON="nossy-0220-c14f1a97b598f963"
KEY_IP="198.51.100.9"
JAR="/tmp/nossy-jar.txt"
LOG="/tmp/nossy-server-$PORT.log"
BODY="/tmp/nossy-body.html"
HDRS="/tmp/nossy-headers.txt"
PASS=0; FAIL=0
SERVER_PID=""

cd /home/z/my-project/nossy-site || exit 1
rm -f "$JAR"

wait_up() {
  for i in $(seq 1 90); do
    if curl -s -o /dev/null "$BASE/api/security/ip" 2>/dev/null; then return 0; fi
    sleep 1
  done
  echo "ERRO: servidor não subiu (log: $LOG)"; tail -5 "$LOG"; exit 1
}

start_server() {
  kill_port
  npm start -- -p $PORT > "$LOG" 2>&1 &
  SERVER_PID=$!
  wait_up
}

kill_port() {
  # npm start deixa o child next-server órfão: matar por nome (lsof não vê
  # sockets neste ambiente) + fallbacks para outros ambientes
  pkill -f "next-server" 2>/dev/null
  fuser -k $PORT/tcp 2>/dev/null
  lsof -ti tcp:$PORT 2>/dev/null | xargs -r kill -9 2>/dev/null
  sleep 1
}

stop_server() {
  [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null
  kill_port
  SERVER_PID=""
}

t() { # t <nome> <status_esperado> <caminho> [extras curl...]
  local nome="$1" esperado="$2" caminho="$3"; shift 3
  local status
  status=$(curl -sL -o "$BODY" -w "%{http_code}" "$BASE$caminho" "$@" 2>/dev/null)
  if [ "$status" = "$esperado" ]; then PASS=$((PASS+1)); echo "PASS  $nome ($status)"
  else FAIL=$((FAIL+1)); echo "FAIL  $nome (esperado $esperado, veio $status)"; fi
}

t_not() { # t_not <nome> <status_proibido> <caminho> [extras]
  local nome="$1" proibido="$2" caminho="$3"; shift 3
  local status
  status=$(curl -sL -o "$BODY" -w "%{http_code}" "$BASE$caminho" "$@" 2>/dev/null)
  if [ "$status" != "$proibido" ]; then PASS=$((PASS+1)); echo "PASS  $nome ($status != $proibido)"
  else FAIL=$((FAIL+1)); echo "FAIL  $nome (veio $proibido, não deveria)"; fi
}

t_no() { # t_no <nome> <string_proibida_no_corpo> <caminho> [extras]
  local nome="$1" proibida="$2" caminho="$3"; shift 3
  local status
  status=$(curl -sL -o "$BODY" -w "%{http_code}" "$BASE$caminho" "$@" 2>/dev/null)
  if [ "$status" != "403" ] && ! grep -qi "$proibida" "$BODY" 2>/dev/null; then
    PASS=$((PASS+1)); echo "PASS  $nome (status $status, corpo sem '$proibida')"
  else
    FAIL=$((FAIL+1)); echo "FAIL  $nome (status $status ou corpo contem '$proibida')"
  fi
}

t_body() { # t_body <nome> <status> <caminho> <conteudo> [extras]
  local nome="$1" esperado="$2" caminho="$3" conteudo="$4"; shift 4
  local status
  status=$(curl -sL -o "$BODY" -w "%{http_code}" "$BASE$caminho" "$@" 2>/dev/null)
  if [ "$status" = "$esperado" ] && grep -q "$conteudo" "$BODY" 2>/dev/null; then
    PASS=$((PASS+1)); echo "PASS  $nome ($status + corpo OK)"
  else
    FAIL=$((FAIL+1)); echo "FAIL  $nome (status $status, esperado $esperado, ou corpo sem '$conteudo')"
  fi
}

if [ "$MODO" = "agent" ]; then
  KEY_IP_DONO="192.168.1.6"
  echo "========== MODO AGENT — produção (agentLock=true, IP dono $KEY_IP_DONO) =========="
  start_server

  t_body "D1  Página normal p/ qualquer visitante"     200 "/"        "html" -H "X-Forwarded-For: 8.8.8.8"
  t      "D2  /en/jobs normal p/ visitante"           200 "/en/jobs" -H "X-Forwarded-For: 8.8.8.8"
  t_body "D3  /api/agent BLOQUEADO p/ IP estranho"    403 "/api/agent" "Acesso restrito" -H "X-Forwarded-For: 8.8.8.8"
  t_not  "D4  /api/agent liberado p/ IP do dono"      403 "/api/agent" -H "X-Forwarded-For: $KEY_IP_DONO"
  t_not  "D5  /api/agent liberado via ?acesso="       403 "/api/agent?acesso=$KEY_JSON" -H "X-Forwarded-For: 8.8.8.8"
  t_not  "D6  /api/agent liberado via header x-nossy-key" 403 "/api/agent" -H "X-Forwarded-For: 8.8.8.8" -H "x-nossy-key: $KEY_JSON"
  t_not  "D7  /api/agent liberado via cookie"         403 "/api/agent" -H "X-Forwarded-For: 8.8.8.8" -b "nossy_acesso=$KEY_JSON"
  t_body "D8  /api/admin BLOQUEADO p/ IP estranho"    403 "/api/admin/health" "Acesso restrito" -H "X-Forwarded-For: 8.8.8.8"
  t_body "D9  Página /admin BLOQUEADA p/ IP estranho" 403 "/admin" "Acesso restrito" -H "X-Forwarded-For: 8.8.8.8"
  t      "D10 Página /admin liberada via ?acesso="    200 "/admin?acesso=$KEY_JSON" -H "X-Forwarded-For: 8.8.8.8"
  t_not  "D11 /api/translate segue aberta (site usa)" 403 "/api/translate" -H "X-Forwarded-For: 8.8.8.8"
  # /api/payment/status (3 segmentos) casa com /[lang]/[slug]/[region] e a
  # pagina dinamica responde 200 — o teste prova que NAO existe a API de
  # pagamento (corpo sem o payload de desbloqueio "unlocked").
  t_no   "D12 backend de pagamento removido (corpo sem unlocked)" "unlocked" "/api/payment/status" -H "X-Forwarded-For: 8.8.8.8"
  # /api/webhook (2 segmentos) casa com a rota dinamica /[lang]/[slug] do
  # site e devolve a pagina normal com 200 — o teste prova que NAO existe
  # backend Paddle (nenhuma mencao a paddle no corpo, nenhum bloqueio 403).
  t_no   "D13 zero comunicacao Paddle (corpo sem paddle)" "paddle" "/api/webhook" -H "X-Forwarded-For: 8.8.8.8"

  # Chave errada continua fora
  t_body "D14 /api/agent com chave ERRADA -> 403"     403 "/api/agent?acesso=errada" "Acesso restrito" -H "X-Forwarded-For: 8.8.8.8"

elif [ "$MODO" = "active" ]; then
  echo "========== MODO ATIVO — JSON (lockEnabled=true, IP $KEY_IP) =========="
  start_server

  t_body "B1  IP da whitelist acessa home"            200 "/"        "html" -H "X-Forwarded-For: $KEY_IP"
  t_body "B2  IP desconhecido é bloqueado"            403 "/"        "Acesso restrito" -H "X-Forwarded-For: 8.8.8.8"

  # B3 simula navegador real: 1a visita com ?acesso= grava cookie (jar) e o
  # redirect do home preserva a sessão — igual ao comportamento do browser.
  status=$(curl -sL -o "$BODY" -w "%{http_code}" -c "$JAR" -b "$JAR" "$BASE/?acesso=$KEY_JSON" -H "X-Forwarded-For: 8.8.8.8" 2>/dev/null)
  if [ "$status" = "200" ] && grep -q "html" "$BODY"; then PASS=$((PASS+1)); echo "PASS  B3  Chave de acesso libera (fluxo navegador) ($status)"
  else FAIL=$((FAIL+1)); echo "FAIL  B3  (status $status)"; fi

  t_body "B4  Chave ERRADA continua bloqueada"        403 "/?acesso=chave-errada" "Acesso restrito" -H "X-Forwarded-For: 8.8.8.8"

  curl -s -D "$HDRS" -o /dev/null "$BASE/?acesso=$KEY_JSON" -H "X-Forwarded-For: 8.8.8.8"
  if grep -qi "set-cookie: nossy_acesso=" "$HDRS"; then PASS=$((PASS+1)); echo "PASS  B5  Cookie nossy_acesso gravado (7 dias)"
  else FAIL=$((FAIL+1)); echo "FAIL  B5  Cookie não gravado"; fi

  t      "B6  Cookie substitui ?acesso="              200 "/" -H "X-Forwarded-For: 8.8.8.8" -b "nossy_acesso=$KEY_JSON"
  t_body "B7  IPv6-mapped normalizado (whitelist)"    200 "/"        "html" -H "X-Forwarded-For: ::ffff:$KEY_IP"
  t_body "B8  Diagnóstico isento mostra o IP"         200 "/api/security/ip" "8.8.8.8" -H "X-Forwarded-For: 8.8.8.8"
  t_not  "B9  /api/webhook isenta (Paddle servidor)"  403 "/api/webhook" -H "X-Forwarded-For: 8.8.8.8"
  t_not  "B10 /api/webhook-0220 isenta (alias)"       403 "/api/webhook-0220" -H "X-Forwarded-For: 8.8.8.8"
  t_not  "B11 /api/payment/health isenta"             403 "/api/payment/health" -H "X-Forwarded-For: 8.8.8.8"
  t      "B12 /robots.txt isenta"                     200 "/robots.txt" -H "X-Forwarded-For: 8.8.8.8"
  t_body "B13 /sitemap.xml BLOQUEADA (privacidade)"   403 "/sitemap.xml" "Acesso restrito" -H "X-Forwarded-For: 8.8.8.8"
  t_body "B14 Conexão local sem header libera (dev)"  200 "/"        "html"
  t_not  "B15 API pagamento OK p/ whitelist"          403 "/api/payment/status" -H "X-Forwarded-For: $KEY_IP"
  t      "B16 API pagamento bloqueada p/ estranho"    403 "/api/payment/status" -H "X-Forwarded-For: 8.8.8.8"

  curl -s -D "$HDRS" -o /dev/null "$BASE/" -H "X-Forwarded-For: $KEY_IP"
  if grep -qi "content-security-policy" "$HDRS"; then PASS=$((PASS+1)); echo "PASS  B17 CSP segue ativa para IP liberado"
  else FAIL=$((FAIL+1)); echo "FAIL  B17 CSP sumiu"; fi

else
  echo "========== MODO SEGURO — JSON (lockEnabled=false, produção) =========="
  start_server

  t_body "A1  IP desconhecido NAVEGA (modo seguro)"   200 "/"        "html" -H "X-Forwarded-For: 8.8.8.8"
  t      "A2  Sitemap aberta (modo seguro)"           200 "/sitemap.xml" -H "X-Forwarded-For: 8.8.8.8"
  t_not  "A3  API pagamento aberta"                   403 "/api/payment/status" -H "X-Forwarded-For: 8.8.8.8"
  t_body "A4  Diagnóstico funciona"                   200 "/api/security/ip" "ip" -H "X-Forwarded-For: 8.8.8.8"
  t      "A5  Robots aberta"                          200 "/robots.txt" -H "X-Forwarded-For: 8.8.8.8"

  curl -s -D "$HDRS" -o /dev/null "$BASE/" -H "X-Forwarded-For: 8.8.8.8"
  if grep -qi "content-security-policy" "$HDRS"; then PASS=$((PASS+1)); echo "PASS  A6 CSP ativa"
  else FAIL=$((FAIL+1)); echo "FAIL  A6 CSP sumiu"; fi
fi

stop_server
echo ""
echo "RESULTADO ($MODO): $PASS PASS / $FAIL FAIL"
[ $FAIL -eq 0 ] || echo "ATENCAO: ha falhas acima"
exit $FAIL
