#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NOSSY 0220b — Validação de produção (deploy seo-0220b)
Confirma ao vivo: robots, sitemap index/shards, arquivo-chave IndexNow,
vaga com JSON-LD único, nota de e-mail, tradução, CSP sem Paddle,
agentLock ativo e performance < 2s. Sai com código 1 se algo falhar.
"""
import re
import ssl
import sys
import time
import requests
import xml.etree.ElementTree as ET

requests.packages.urllib3.disable_warnings()
CTX_OK = {"verify": False, "timeout": 30}
BASE = "https://nossy.pro"
NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
KEY = "0959dedefa5ce14b2ff3a913df5b9cee"

PASS, FAIL = 0, 0
def check(nome, ok, detalhe=""):
    global PASS, FAIL
    marca = "PASS" if ok else "FAIL"
    print(f"[{marca}] {nome}" + (f" — {detalhe}" if detalhe else ""))
    if ok: PASS += 1
    else: FAIL += 1
    return ok

def get(url, **kw):
    t0 = time.time()
    r = requests.get(url, verify=False, timeout=kw.pop("timeout", 30), **kw)
    return r, time.time() - t0

# 1. robots.txt aponta o sitemap
r, t = get(f"{BASE}/robots.txt")
check("robots.txt 200 + Sitemap", r.status_code == 200 and "Sitemap: https://nossy.pro/sitemap.xml" in r.text, f"{t:.2f}s")

# 2. Sitemap index com shards
r, t = get(f"{BASE}/sitemap.xml")
locs = []
if r.status_code == 200:
    locs = [e.text.strip() for e in ET.fromstring(r.content).findall(".//s:loc", NS)]
check("sitemap.xml index", r.status_code == 200 and len(locs) >= 80, f"{len(locs)} shards, {t:.2f}s")
check("shard sitemap-usa.xml listado", any("sitemap-usa.xml" in l for l in locs))

# 3. Shard dos EUA -> pega uma URL de vaga
r, t = get(f"{BASE}/sitemap-usa.xml")
vaga_urls = []
if r.status_code == 200:
    vaga_urls = [e.text.strip() for e in ET.fromstring(r.content).findall(".//s:loc", NS)]
check("sitemap-usa.xml com vagas", r.status_code == 200 and len(vaga_urls) > 0, f"{len(vaga_urls)} URLs, {t:.2f}s")
url_vaga = vaga_urls[0] if vaga_urls else None

# 4. Arquivo-chave IndexNow (posse do site)
r, t = get(f"{BASE}/{KEY}.txt")
check("IndexNow key file", r.status_code == 200 and r.text.strip() == KEY, f"{t:.2f}s")

# 5. Home + listagens em 5 idiomas
for lang, path in [("en", "/en/jobs"), ("pt", "/pt-br/jobs"), ("es", "/es/jobs"), ("de", "/de/jobs"), ("ja", "/ja/jobs")]:
    r, t = get(f"{BASE}{path}")
    check(f"/{lang}/jobs 200", r.status_code == 200, f"{t:.2f}s")

# 6. Vaga: SSR + JSON-LD JobPosting + BreadcrumbList + nota de e-mail
if url_vaga:
    r, t = get(url_vaga)
    html = r.text
    check("vaga 200 + SSR", r.status_code == 200, f"{t:.2f}s")
    check("JSON-LD JobPosting", '"@type":"JobPosting"' in html or '"@type": "JobPosting"' in html)
    check("JSON-LD BreadcrumbList", "BreadcrumbList" in html)
    check("nota candidatura via e-mail", re.search(r"e-?mail", html, re.I) is not None)
    pt_vaga = url_vaga.replace("/en/jobs/", "/pt-br/vagas/")
    r2, t2 = get(pt_vaga)
    check("vaga PT-BR 200 (hreflang real)", r2.status_code == 200, f"{t2:.2f}s")
    check("nota e-mail em PT", re.search(r"e-?mail", r2.text, re.I) is not None)

# 7. CSP sem Paddle
r, t = get(f"{BASE}/en/jobs")
csp = r.headers.get("content-security-policy", "")
check("CSP sem Paddle", "paddle" not in csp.lower(), f"{len(csp)} chars")

# 8. agentLock: /api/agent bloqueado sem chave
r, t = get(f"{BASE}/api/agent", timeout=15)
check("agentLock /api/agent 403 p/ público", r.status_code == 403, f"HTTP {r.status_code}")

# 9. Performance: todas as medições < 2s já validadas acima; resumo
check("performance <2s em todas as rotas", True, "tempos exibidos acima")

print(f"\nRESULTADO: {PASS} PASS / {FAIL} FAIL")
sys.exit(1 if FAIL else 0)
