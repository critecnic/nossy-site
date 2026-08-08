#!/bin/bash
# Teste completo de todas as rotas do Work Versaly

BASE="http://localhost:3000"
PASSED=0
FAILED=0
FAIL_LIST=""

check() {
    local url="$1"
    local label="$2"
    local code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" 2>/dev/null)
    if [ "$code" = "200" ]; then
        echo "  ✅ $label → $code"
        PASSED=$((PASSED + 1))
    else
        echo "  ❌ $label → $code"
        FAILED=$((FAILED + 1))
        FAIL_LIST="$FAIL_LIST\n  - $label ($url) → $code"
    fi
}

echo "=== TESTE COMPLETO WORK VERSALY ==="
echo ""

# 1. Homepage em todos os 22 idiomas
echo "[1/5] HOMEPAGES (22 idiomas)"
check "$BASE/pt-br/vagas" "pt-br homepage"
check "$BASE/en/jobs" "en homepage"
check "$BASE/es/empleos" "es homepage"
check "$BASE/fr/emplois" "fr homepage"
check "$BASE/de/stellenangebote" "de homepage"
check "$BASE/it/offerte-di-lavoro" "it homepage"
check "$BASE/nl/vacatures" "nl homepage"
check "$BASE/pl/oferty-pracy" "pl homepage"
check "$BASE/ro/locuri-de-munca" "ro homepage"
check "$BASE/tr/is-ilanlari" "tr homepage"
check "$BASE/zh-cn/jobs-cn" "zh-cn homepage"
check "$BASE/ja/jobs-ja" "ja homepage"
check "$BASE/ko/jobs-ko" "ko homepage"
check "$BASE/ar/jobs-ar" "ar homepage"
check "$BASE/hi/jobs-in" "hi homepage"
check "$BASE/ru/vacancy" "ru homepage"
check "$BASE/sv/lediga-jobb" "sv homepage"
check "$BASE/cs/prace" "cs homepage"
check "$BASE/da/job-i-danmark" "da homepage"
check "$BASE/pt/vagas-pt" "pt homepage"
check "$BASE/hu/allaskereso" "hu homepage"
check "$BASE/uk/vacancy-uk" "uk homepage"

# 2. Páginas de região (3 regiões × 5 idiomas principais)
echo ""
echo "[2/5] REGION PAGES (15 testes)"
check "$BASE/pt-br/vagas/europa" "europa pt-br"
check "$BASE/pt-br/vagas/asia" "asia pt-br"
check "$BASE/pt-br/vagas/eua" "eua pt-br"
check "$BASE/en/jobs/europa" "europa en"
check "$BASE/en/jobs/asia" "asia en"
check "$BASE/en/jobs/eua" "eua en"
check "$BASE/es/empleos/europa" "europa es"
check "$BASE/es/empleos/asia" "asia es"
check "$BASE/fr/emplois/europa" "europa fr"
check "$BASE/de/stellenangebote/europa" "europa de"
check "$BASE/it/offerte-di-lavoro/europa" "europa it"
check "$BASE/nl/vacatures/europa" "europa nl"
check "$BASE/ja/jobs-ja/asia" "asia ja"
check "$BASE/ko/jobs-ko/asia" "asia ko"
check "$BASE/zh-cn/jobs-cn/asia" "asia zh-cn"

# 3. Páginas de país (10 países principais)
echo ""
echo "[3/5] COUNTRY PAGES (10 testes)"
check "$BASE/pt-br/vagas/europa/alemanha" "alemanha pt-br"
check "$BASE/pt-br/vagas/europa/portugal" "portugal pt-br"
check "$BASE/pt-br/vagas/europa/franca" "franca pt-br"
check "$BASE/pt-br/vagas/europa/espanha" "espanha pt-br"
check "$BASE/pt-br/vagas/europa/italia" "italia pt-br"
check "$BASE/pt-br/vagas/europa/reino-unido" "reino-unido pt-br"
check "$BASE/en/jobs/eua/estados-unidos" "USA en"
check "$BASE/pt-br/vagas/asia/japao" "japao pt-br"
check "$BASE/pt-br/vagas/asia/india" "india pt-br"
check "$BASE/pt-br/vagas/asia/china" "china pt-br"

# 4. Verificações de conteúdo (logo, vagas, componentes)
echo ""
echo "[4/5] CONTENT CHECKS (8 testes)"

# Verifica se a homepage tem as 20 vagas
JOBS_COUNT=$(curl -s "$BASE/pt-br/vagas" | grep -o 'job-card' | wc -l)
if [ "$JOBS_COUNT" -ge 20 ]; then
    echo "  ✅ 20+ job cards found → $JOBS_COUNT"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ Job cards insufficient → $JOBS_COUNT (expected ≥20)"
    FAILED=$((FAILED + 1))
    FAIL_LIST="$FAIL_LIST\n  - Job cards: $JOBS_COUNT (expected ≥20)"
fi

# Verifica se tem o logo WV
LOGO_CHECK=$(curl -s "$BASE/pt-br/vagas" | grep -c 'WV\|Work Versaly\|work-versaly')
if [ "$LOGO_CHECK" -gt 0 ]; then
    echo "  ✅ WV Logo/branding present → $LOGO_CHECK occurrences"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ WV Logo/branding NOT found"
    FAILED=$((FAILED + 1))
    FAIL_LIST="$FAIL_LIST\n  - WV Logo missing from homepage"
fi

# Verifica seletor de idiomas
LANG_CHECK=$(curl -s "$BASE/pt-br/vagas" | grep -c 'lang-selector\|language\|langOption\|selectedLang')
if [ "$LANG_CHECK" -gt 0 ]; then
    echo "  ✅ Language selector present → $LANG_CHECK occurrences"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ Language selector NOT found"
    FAILED=$((FAILED + 1))
    FAIL_LIST="$FAIL_LIST\n  - Language selector missing"
fi

# Verifica hero section
HERO_CHECK=$(curl -s "$BASE/pt-br/vagas" | grep -c 'hero\|Hero\|bg-blue')
if [ "$HERO_CHECK" -gt 0 ]; then
    echo "  ✅ Hero section present → $HERO_CHECK occurrences"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ Hero section NOT found"
    FAILED=$((FAILED + 1))
    FAIL_LIST="$FAIL_LIST\n  - Hero section missing"
fi

# Verifica region cards
REGION_CHECK=$(curl -s "$BASE/pt-br/vagas" | grep -c 'europa\|asia\|eua')
if [ "$REGION_CHECK" -ge 3 ]; then
    echo "  ✅ Region cards present → $REGION_CHECK occurrences"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ Region cards insufficient → $REGION_CHECK (expected ≥3)"
    FAILED=$((FAILED + 1))
    FAIL_LIST="$FAIL_LIST\n  - Region cards: $REGION_CHECK"
fi

# Verifica filtros na página de país
FILTER_CHECK=$(curl -s "$BASE/pt-br/vagas/europa/alemanha" | grep -c 'filter\|Filter\|placeholder\|search')
if [ "$FILTER_CHECK" -ge 3 ]; then
    echo "  ✅ Search/Filter controls present → $FILTER_CHECK occurrences"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ Search/Filter controls insufficient → $FILTER_CHECK"
    FAILED=$((FAILED + 1))
    FAIL_LIST="$FAIL_LIST\n  - Filter controls: $FILTER_CHECK"
fi

# Verifica paginação
PAGE_CHECK=$(curl -s "$BASE/pt-br/vagas/europa/alemanha" | grep -c 'pagination\|next\|prev\|page')
if [ "$PAGE_CHECK" -ge 1 ]; then
    echo "  ✅ Pagination present → $PAGE_CHECK occurrences"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ Pagination NOT found"
    FAILED=$((FAILED + 1))
    FAIL_LIST="$FAIL_LIST\n  - Pagination missing"
fi

# Verifica paywall modal
PAYWALL_CHECK=$(curl -s "$BASE/pt-br/vagas/europa/alemanha" | grep -c 'premium\|paywall\|stripe\|checkout\|unlock')
if [ "$PAYWALL_CHECK" -ge 1 ]; then
    echo "  ✅ Paywall/Stripe integration present → $PAYWALL_CHECK occurrences"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ Paywall/Stripe NOT found"
    FAILED=$((FAILED + 1))
    FAIL_LIST="$FAIL_LIST\n  - Paywall missing"
fi

# 5. Páginas de país em idiomas adicionais
echo ""
echo "[5/5] ADDITIONAL LANGUAGE COUNTRY PAGES (6 testes)"
check "$BASE/de/stellenangebote/europa/deutschland" "deutschland de"
check "$BASE/fr/emplois/europa/france" "france fr"
check "$BASE/es/empleos/europa/espana" "espana es"
check "$BASE/it/offerte-di-lavoro/europa/italia" "italia it"
check "$BASE/nl/vacatures/europa/nederland" "nederland nl"
check "$BASE/sv/lediga-jobb/europa/sverige" "sverige sv"

# RESULTADO FINAL
echo ""
echo "========================================"
echo "  RESULTADO FINAL"
echo "========================================"
TOTAL=$((PASSED + FAILED))
RATE=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc 2>/dev/null || echo "N/A")
echo "  Total de testes: $TOTAL"
echo "  Aprovados: ✅ $PASSED"
echo "  Falharam: ❌ $FAILED"
echo "  Taxa de sucesso: ${RATE}%"
echo "========================================"
if [ -n "$FAIL_LIST" ]; then
    echo ""
    echo "Falhas detalhadas:"
    echo -e "$FAIL_LIST"
fi
