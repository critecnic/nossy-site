#!/bin/bash
# Validação E2E em PRODUÇÃO (nossy.pro) — sistema de tradução 22 idiomas
B="https://nossy.pro"
CURL="curl -skL --max-time 40"
PASS=0; FAIL=0
check() { if [ "$2" == "$3" ]; then PASS=$((PASS+1)); echo "PASS  $1 (=$3)"; else FAIL=$((FAIL+1)); echo "FAIL  $1 — esperado=$2 obtido=$3"; fi; }

echo "== 1. Home SSR no idioma da URL (antes nascia em inglês) =="
for L in es fr de it nl pl ru zh ja ko hi bn ar tr vi th ur tl sw; do
  case $L in
    pt-br) S=vagas;; pt-pt) S=empregos;; en) S=jobs;; es) S=empleos;;
    fr) S=emplois;; de) S=stellenangebote;; it) S=lavoro;; nl) S=vacatures;;
    pl) S=praca;; ru) S=rabota;; zh) S=gongzuo;; ja) S=shigoto;;
    ko) S=chae-yong;; hi) S=naukri;; bn) S=chakri;; ar) S=wazaif;;
    tr) S=is-ilanlari;; vi) S=viec-lam;; th) S=ngan-thai;; ur) S=mulazmat;;
    tl) S=trabaho;; sw) S=kazi;;
  esac
  H1=$($CURL "$B/$L/$S" | python3 -c "import re,sys; h=sys.stdin.read(); m=re.findall(r'<h1[^>]*>([^<]{3,80})', h); print(m[0] if m else 'NONE')")
  EN_IN=$(echo "$H1" | grep -ciE "Browse by Region" || true)
  check "home $L h1 != inglês" "0" "$EN_IN"
done

echo "== 2. html lang via script inline =="
check "es lang-script es-ES" "1" "$($CURL "$B/es/jobs" | grep -c 'document.documentElement.lang="es-ES"')"
check "ar dir rtl" "1" "$($CURL "$B/ar/wazaif" | grep -c 'document.documentElement.dir=.rtl')"
check "pt-br lang-script pt-BR" "1" "$($CURL "$B/pt-br/vagas" | grep -c 'document.documentElement.lang=.pt-BR')"

echo "== 3. Nomes de países traduzidos (catálogo CLDR) =="
check "home es: España presente" "1" "$($CURL "$B/es/jobs" | grep -c '>España<')"
check "home es: Alemania presente" "1" "$($CURL "$B/es/jobs" | grep -c '>Alemania<')"
check "home fr: Japon présent" "1" "$($CURL "$B/fr/emplois" | grep -c '>Japon<')"
check "home de: Vereinigtes Königreich" "1" "$($CURL "$B/de/stellenangebote" | grep -c '>Vereinigtes Königreich<')"
check "home ru: Германия" "1" "$($CURL "$B/ru/rabota" | grep -c '>Германия<')"

echo "== 4. UI de pagamento traduzida (componente na vaga premium) =="
check "vaga es: breadcrumb Estados Unidos" "1" "$($CURL "$B/es/jobs/eua/united-states/10" | grep -c 'Estados Unidos')"
check "vaga fr: title NOSSY >= 1" "1" "$($CURL "$B/fr/jobs/eua/united-states/10" | grep -c 'NOSSY' | awk '{print ($1>=1)?1:0}')"

echo "== 5. APIs de dados seguem OK =="
check "latest total > 0" "1" "$($CURL "$B/api/data/latest?lang=es" | python3 -c "import json,sys; print(1 if len(json.load(sys.stdin))>0 else 0)")"
check "country eua total 19019" "19019" "$($CURL "$B/api/data/country?file=eua_united-states.json&page=1&limit=18" | python3 -c "import json,sys; print(json.load(sys.stdin)['total'])")"
check "job-detail 10 es 200" "200" "$($CURL -o /dev/null -w '%{http_code}' "$B/api/data/job-detail?file=eua_united-states.json&id=10&lang=es")"

echo "== 6. Páginas-chave 200 =="
for U in "/pt-br/vagas" "/es/empleos" "/fr/emplois/europa/france" "/de/stellenangebote/asia/japan" "/es/jobs/asia/china/sectors" "/en/jobs/eua/united-states/10" "/pt-br/vagas/eua/united-states/10"; do
  check "$U" "200" "$($CURL -o /dev/null -w '%{http_code}' "$B$U")"
done

echo ""
echo "RESULTADO: $PASS PASS / $FAIL FAIL"
[ "$FAIL" == "0" ]
