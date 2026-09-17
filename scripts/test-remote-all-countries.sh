#!/bin/bash
# Testes E2E locais — padrão 1874: remoto em TODOS os países
# Uso: bash scripts/test-remote-all-countries.sh <porta>
PORT="${1:-3000}"
BASE="http://localhost:$PORT"
PASS=0; FAIL=0

check() { # check <nome> <esperado> <obtido>
  if [ "$2" == "$3" ]; then PASS=$((PASS+1)); echo "PASS  $1 (=$3)";
  else FAIL=$((FAIL+1)); echo "FAIL  $1 — esperado=$2 obtido=$3"; fi
}

py() { python3 -c "$1"; }

echo "== 1. Índia: total local+pool = 4570 =="
R=$(curl -s "$BASE/api/data/country?file=asia_india.json&page=1&limit=18")
check "india total" "4570" "$(echo "$R" | py "import json,sys; d=json.load(sys.stdin); print(d['total'])")"
check "india page1 18 jobs" "18" "$(echo "$R" | py "import json,sys; print(len(json.load(sys.stdin)['jobs']))")"

echo "== 2. Índia: fronteira local->pool (local=3005) =="
R=$(curl -s "$BASE/api/data/country?file=asia_india.json&page=167&limit=18")
# offset=3000 -> 5 locais + 13 do pool
check "india p167 jobs" "18" "$(echo "$R" | py "import json,sys; print(len(json.load(sys.stdin)['jobs']))")"
R=$(curl -s "$BASE/api/data/country?file=asia_india.json&page=168&limit=18")
# offset=3018 -> só pool
FIRST=$(echo "$R" | py "import json,sys; d=json.load(sys.stdin); j=d['jobs'][0]; print(j['id'], len(d['jobs']))")
echo "  (india p168 primeira vaga: $FIRST)"

echo "== 3. EUA: fronteira (local=18983, extra=36, total=19019) =="
R=$(curl -s "$BASE/api/data/country?file=eua_united-states.json&page=1055&limit=18")
check "eua p1055 jobs" "18" "$(echo "$R" | py "import json,sys; print(len(json.load(sys.stdin)['jobs']))")"
# última página: ceil(19019/18)=1057 -> 19019-1054*18... offset=1056*18=19008 -> 11 jobs (36 extra: poolStart=25..36)
check "eua p1057 jobs (última)" "11" "$(curl -s "$BASE/api/data/country?file=eua_united-states.json&page=1057&limit=18" | py "import json,sys; print(len(json.load(sys.stdin)['jobs']))")"
check "eua total" "19019" "$(curl -s "$BASE/api/data/country?file=eua_united-states.json&page=1&limit=18" | py "import json,sys; print(json.load(sys.stdin)['total'])")"
echo "== 3b. Austrália rebalanceada: página 480 (offset 8562 -> 17 local + 1 pool) =="
check "australia total" "9451" "$(curl -s "$BASE/api/data/country?file=oceania_australia.json&page=1&limit=18" | py "import json,sys; print(json.load(sys.stdin)['total'])")"
check "australia p477 jobs (offset 8562)" "18" "$(curl -s "$BASE/api/data/country?file=oceania_australia.json&page=477&limit=18" | py "import json,sys; print(len(json.load(sys.stdin)['jobs']))")"

echo "== 4. Extra ids: sem colisão com locais =="
check "india extra=1565" "1565" "$(py "import json; print(len(json.load(open('data/site/asia_india_remote-extra.json'))))")"
check "eua extra=36" "36" "$(py "import json; print(len(json.load(open('data/site/eua_united-states_remote-extra.json'))))")"

echo "== 5. Detalhe: vaga do pool via URL da Índia =="
PID=$(py "import json; print(json.load(open('data/site/asia_india_remote-extra.json'))[0])")
R=$(curl -s "$BASE/api/data/job-detail?file=asia_india.json&id=$PID")
check "detalhe pool india 200" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/data/job-detail?file=asia_india.json&id=$PID")"
T=$(echo "$R" | py "import json,sys; d=json.load(sys.stdin); print(d.get('title','ERRO')[:60])")
echo "  (pool job $PID via india: $T)"
# deve ser igual à vaga do pool
T2=$(py "import json; pool=json.load(open('data/site/asia_remoto-global.json'))+json.load(open('data/site/europa_remoto-global.json')); m={str(j['id']):j for j in pool}; print(m['$PID']['title'][:60])")
check "detalhe pool = vaga do pool" "$T2" "$T"

echo "== 6. Detalhe: id colidente 10005 nos EUA deve ser o LOCAL (Google) =="
R=$(curl -s "$BASE/api/data/job-detail?file=eua_united-states.json&id=10005")
C=$(echo "$R" | py "import json,sys; d=json.load(sys.stdin); print(d.get('company','ERRO'))")
echo "  (eua 10005 company: $C)"
check "colisao 10005 = Google (local prioriza)" "Google" "$C"
PID_EUA=$(py "import json; print(json.load(open('data/site/eua_united-states_remote-extra.json'))[0])")
R2=$(curl -s "$BASE/api/data/job-detail?file=eua_united-states.json&id=$PID_EUA")
C2=$(echo "$R2" | py "import json,sys; d=json.load(sys.stdin); print(d.get('title','ERRO')[:50])")
T2=$(py "import json; pool=json.load(open('data/site/asia_remoto-global.json'))+json.load(open('data/site/europa_remoto-global.json')); m={str(j['id']):j for j in pool}; print(m['$PID_EUA']['title'][:50])")
check "detalhe pool eua = vaga do pool" "$T2" "$C2"
echo "  (eua pool extra $PID_EUA: $C2)"

echo "== 7. Setores: Índia totalJobs = 4570, EUA = 19019 =="
check "sectors india total" "4570" "$(curl -s "$BASE/api/data/sectors?file=asia_india.json" | py "import json,sys; print(json.load(sys.stdin)['totalJobs'])")"
check "sectors eua total" "19019" "$(curl -s "$BASE/api/data/sectors?file=eua_united-states.json" | py "import json,sys; print(json.load(sys.stdin)['totalJobs'])")"

echo "== 8. País somente-pool continua ok (Angola=1565) =="
check "angola total" "1565" "$(curl -s "$BASE/api/data/country?file=africa_angola.json&page=1&limit=18" | py "import json,sys; print(json.load(sys.stdin)['total'])")"

echo "== 9. Setor filtrado atravessa local->pool (Índia, setor 'Other') =="
R=$(curl -s "$BASE/api/data/country?file=asia_india.json&page=1&limit=18&sector=Other")
TOT=$(echo "$R" | py "import json,sys; print(json.load(sys.stdin)['total'])")
echo "  (india setor Other total=$TOT — deve ser >0)"

echo "== 10. Paywall: vaga com contactEmail mascarada na listagem =="
R=$(curl -s "$BASE/api/data/country?file=asia_india.json&page=1&limit=100")
echo "$R" | py "
import json,sys
d=json.load(sys.stdin)
masked=[j for j in d['jobs'] if j.get('company')=='***']
free=[j for j in d['jobs'] if j.get('contactEmail') and '@' in str(j['contactEmail'])]
nolock=[j for j in d['jobs'] if j.get('company') not in ('***',) and (not j.get('contactEmail'))]
print('mascaradas(company=***):', len(masked), '| com email livre:', len(free), '| livres sem email:', len(nolock))
leak=[j for j in d['jobs'] if j.get('company')=='***' and j.get('contactEmail')]
print('vazamento (company=*** mas email presente):', len(leak))
"
echo "== 11. Concorrentes: zero na listagem/detalhe =="
R=$(curl -s "$BASE/api/data/country?file=asia_india.json&page=1&limit=100")
N=$(echo "$R" | py "import json,sys; d=json.load(sys.stdin); import re; print(sum(1 for j in d['jobs'] if re.search(r'linkedin|indeed|glassdoor|seek limited|weworkremotely|jobstreet|computrabajo|jooble|ziprecruiter', (str(j.get('company',''))+str(j.get('companyUrl',''))), re.I)))")
check "concorrentes listagem india" "0" "$N"

echo "== 12. Páginas HTML: país com dados e somente-pool respondem 200 =="
check "pagina india" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/pt-br/vagas/asia/india")"
check "pagina angola" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/pt-br/vagas/africa/angola")"
check "pagina detalhe pool india" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/pt-br/vagas/asia/india/$PID")"
check "pagina detalhe local eua" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/pt-br/vagas/eua/united-states/10005")"
check "pagina detalhe pool eua (extra)" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/pt-br/vagas/eua/united-states/$(py "import json; print(json.load(open('data/site/eua_united-states_remote-extra.json'))[0])")")"

echo ""
echo "RESULTADO: PASS=$PASS FAIL=$FAIL"
[ $FAIL -eq 0 ] && echo "TODOS OS TESTES PASSARAM" || echo "HÁ FALHAS ACIMA"
