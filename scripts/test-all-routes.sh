#!/bin/bash
# Comprehensive route testing for Work Versaly

BASE="http://localhost:3111"
PASS=0
FAIL=0

check() {
  code=$(curl -s -o /dev/null -w '%{http_code}' "$1")
  if [ "$code" = "200" ]; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
    echo "FAIL [$code]: $1"
  fi
}

# 1. Homepage in all 22 languages
echo "=== 1. HOMEPAGES (22 languages) ==="
for lang in en pt-br pt-pt es fr de it nl pl ru zh ja ko hi bn ar tr vi th ur tl sw; do
  slug=$(curl -s "$BASE/$lang/jobs" | head -c 100)
  check "$BASE/$lang/jobs"
done

# 2. Region pages (3 regions x 3 languages)
echo "=== 2. REGION PAGES ==="
for lang in en pt-br es; do
  for region in europa asia eua; do
    check "$BASE/$lang/jobs/$region"
  done
done

# 3. ALL 58 country pages (sampled via countries.json)
echo "=== 3. COUNTRY PAGES (all 58) ==="
countries=$(curl -s "$BASE/data/countries.json")
echo "$countries" | python3 -c "
import sys, json
cs = json.load(sys.stdin)
for c in cs:
    print(f'{c[\"region\"]} {c[\"slug\"]}')
" | while read region slug; do
  check "$BASE/pt-br/vagas/$region/$slug"
done

# 4. Data files
echo "=== 4. DATA FILES ==="
check "$BASE/data/countries.json"
check "$BASE/data/latest_20.json"

# 5. API endpoints
echo "=== 5. API ENDPOINTS ==="
check_post() {
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$1")
  if [ "$code" = "400" ] || [ "$code" = "200" ]; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
    echo "FAIL [$code]: $1"
  fi
}
check_post "$BASE/api/checkout"

# 6. Static assets
check "$BASE/favicon.ico"

# 7. Content verification
echo "=== 6. CONTENT VERIFICATION ==="
# Check pt-br has correct title
if curl -s "$BASE/pt-br/vagas" | grep -q 'Ache Aqui o Emprego'; then
  PASS=$((PASS+1))
else
  FAIL=$((FAIL+1))
  echo "FAIL: pt-br title missing"
fi

# Check no WW text
if curl -s "$BASE/pt-br/vagas" | grep -q '>WW<'; then
  FAIL=$((FAIL+1))
  echo "FAIL: WW text found"
else
  PASS=$((PASS+1))
fi

# Check Work Versaly branding
if curl -s "$BASE/pt-br/vagas" | grep -q 'Work Versaly'; then
  PASS=$((PASS+1))
else
  FAIL=$((FAIL+1))
  echo "FAIL: Work Versaly branding missing"
fi

# Check CRITECNIC footer
if curl -s "$BASE/pt-br/vagas" | grep -q 'CRITECNIC'; then
  PASS=$((PASS+1))
else
  FAIL=$((FAIL+1))
  echo "FAIL: CRITECNIC footer missing"
fi

echo ""
echo "========================="
echo "RESULTS: $PASS passed, $FAIL failed"
echo "========================="
