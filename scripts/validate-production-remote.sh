#!/bin/bash
# Validação E2E em PRODUÇÃO (nossy.pro) — Task 17: remoto em todos os países
B="https://nossy.pro"
CURL="curl -skL --max-time 30"
PASS=0; FAIL=0
check() { if [ "$2" == "$3" ]; then PASS=$((PASS+1)); echo "PASS  $1 (=$3)"; else FAIL=$((FAIL+1)); echo "FAIL  $1 — esperado=$2 obtido=$3"; fi; }
py() { python3 -c "$1"; }

echo "== 1. Totais local+pool em produção =="
check "india total 4570" "4570" "$($CURL "$B/api/data/country?file=asia_india.json&page=1&limit=18" | py "import json,sys; print(json.load(sys.stdin)['total'])")"
check "eua total 19019" "19019" "$($CURL "$B/api/data/country?file=eua_united-states.json&page=1&limit=18" | py "import json,sys; print(json.load(sys.stdin)['total'])")"
check "australia total 9451" "9451" "$($CURL "$B/api/data/country?file=oceania_australia.json&page=1&limit=18" | py "import json,sys; print(json.load(sys.stdin)['total'])")"
check "china total 3263" "3263" "$($CURL "$B/api/data/country?file=asia_china.json&page=1&limit=18" | py "import json,sys; print(json.load(sys.stdin)['total'])")"
check "angola (pool) 1565" "1565" "$($CURL "$B/api/data/country?file=africa_angola.json&page=1&limit=18" | py "import json,sys; print(json.load(sys.stdin)['total'])")"

echo "== 2. Fronteiras de paginação =="
check "india p167 (fronteira) = 18" "18" "$($CURL "$B/api/data/country?file=asia_india.json&page=167&limit=18" | py "import json,sys; print(len(json.load(sys.stdin)['jobs']))")"
check "eua p1055 (fronteira) = 18" "18" "$($CURL "$B/api/data/country?file=eua_united-states.json&page=1055&limit=18" | py "import json,sys; print(len(json.load(sys.stdin)['jobs']))")"
check "eua p1057 (última) = 11" "11" "$($CURL "$B/api/data/country?file=eua_united-states.json&page=1057&limit=18" | py "import json,sys; print(len(json.load(sys.stdin)['jobs']))")"
check "australia p477 = 18" "18" "$($CURL "$B/api/data/country?file=oceania_australia.json&page=477&limit=18" | py "import json,sys; print(len(json.load(sys.stdin)['jobs']))")"

echo "== 3. Detalhe: pool via Índia + colisão nos EUA =="
PID=$(py "import json; print(json.load(open('data/site/asia_india_remote-extra.json'))[0])")
POOLTITLE=$(py "import json; pool=json.load(open('data/site/asia_remoto-global.json'))+json.load(open('data/site/europa_remoto-global.json')); m={str(j['id']):j for j in pool}; print(m['$PID']['title'][:40])")
APITITLE=$($CURL "$B/api/data/job-detail?file=asia_india.json&id=$PID" | py "import json,sys; print(json.load(sys.stdin).get('title','ERRO')[:40])")
check "detalhe pool india = vaga do pool" "$POOLTITLE" "$APITITLE"
C=$($CURL "$B/api/data/job-detail?file=eua_united-states.json&id=10005" | py "import json,sys; print(json.load(sys.stdin).get('company','ERRO'))")
check "colisao 10005 = Google (local)" "Google" "$C"
PID_EUA=$(py "import json; print(json.load(open('data/site/eua_united-states_remote-extra.json'))[0])")
PT2=$(py "import json; pool=json.load(open('data/site/asia_remoto-global.json'))+json.load(open('data/site/europa_remoto-global.json')); m={str(j['id']):j for j in pool}; print(m['$PID_EUA']['title'][:40])")
AT2=$($CURL "$B/api/data/job-detail?file=eua_united-states.json&id=$PID_EUA" | py "import json,sys; print(json.load(sys.stdin).get('title','ERRO')[:40])")
check "detalhe pool eua = vaga do pool" "$PT2" "$AT2"

echo "== 4. Páginas HTML 200 =="
check "/pt-br/vagas/asia/india" "200" "$($CURL -o /dev/null -w '%{http_code}' "$B/pt-br/vagas/asia/india")"
check "/pt-br/vagas/asia/india/$PID (pool)" "200" "$($CURL -o /dev/null -w '%{http_code}' "$B/pt-br/vagas/asia/india/$PID")"
check "/pt-br/vagas/eua/united-states/10005" "200" "$($CURL -o /dev/null -w '%{http_code}' "$B/pt-br/vagas/eua/united-states/10005")"
check "/pt-br/vagas/africa/angola" "200" "$($CURL -o /dev/null -w '%{http_code}' "$B/pt-br/vagas/africa/angola")"
check "/en/jobs/asia/india" "200" "$($CURL -o /dev/null -w '%{http_code}' "$B/en/jobs/asia/india")"

echo "== 5. Setores (local+pool) =="
check "sectors india totalJobs" "4570" "$($CURL "$B/api/data/sectors?file=asia_india.json" | py "import json,sys; print(json.load(sys.stdin)['totalJobs'])")"
check "sectors eua totalJobs" "19019" "$($CURL "$B/api/data/sectors?file=eua_united-states.json" | py "import json,sys; print(json.load(sys.stdin)['totalJobs'])")"

echo "== 6. Paywall: máscara na listagem e no detalhe =="
PWID=$($CURL "$B/api/data/country?file=asia_india.json&page=1&limit=100" | py "import json,sys; d=json.load(sys.stdin); m=[j for j in d['jobs'] if j.get('company')=='***']; print(m[0]['id'] if m else 'NONE')")
if [ "$PWID" == "NONE" ]; then FAIL=$((FAIL+1)); echo "FAIL  nenhuma vaga mascarada na página 1 da Índia"; else PASS=$((PASS+1)); echo "PASS  vaga premium na listagem (id=$PWID, company=***)"; fi
D=$($CURL "$B/api/data/job-detail?file=asia_india.json&id=$PWID" | py "import json,sys; d=json.load(sys.stdin); print(d.get('company'), '|', repr(d.get('contactEmail')))"; )
echo "  (detalhe sem cookie: $D)"
OK=$($CURL "$B/api/data/job-detail?file=asia_india.json&id=$PWID" | py "import json,sys; d=json.load(sys.stdin); print('OK' if d.get('company')=='***' and not d.get('contactEmail') else 'LEAK')")
check "detalhe mascarado sem cookie" "OK" "$OK"

echo "== 7. Concorrentes =="
N=$($CURL "$B/api/data/country?file=asia_india.json&page=1&limit=100" | py "import json,sys,re; d=json.load(sys.stdin); print(sum(1 for j in d['jobs'] if re.search(r'linkedin|indeed|glassdoor|seek limited|weworkremotely|jooble|ziprecruiter', str(j.get('company',''))+str(j.get('companyUrl','')), re.I)))")
check "concorrentes na listagem india" "0" "$N"

echo "== 8. Tradução es + payment health =="
T=$($CURL "$B/api/data/country?file=asia_india.json&page=168&limit=3&lang=es" | py "import json,sys; d=json.load(sys.stdin); print(len(d['jobs']))")
check "listagem es do pool (3 jobs)" "3" "$T"
check "payment/status" "200" "$($CURL -o /dev/null -w '%{http_code}' "$B/api/payment/status?jobId=$PWID")"

echo ""
echo "RESULTADO PRODUÇÃO: PASS=$PASS FAIL=$FAIL"
[ $FAIL -eq 0 ] && echo "VALIDAÇÃO EM PRODUÇÃO: SEM ERROS" || echo "HÁ FALHAS ACIMA"
