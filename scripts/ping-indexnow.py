#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NOSSY 0220 — IndexNow: registro automático do site nos robôs de busca
======================================================================
Submete as URLs do nossy.pro ao endpoint compartilhado do IndexNow
(api.indexnow.org — distribui para Bing, Yandex, Seznam, Naver e Yep).

O Google NÃO participa do IndexNow (usa o Search Console), mas os demais
robôs descobrem as vagas em minutos em vez de semanas.

Como funciona:
  1. A chave fica em src/config/seo.json (indexNowKey);
  2. O arquivo public/<chave>.txt prova a posse do site;
  3. Este roteiro lê o sitemap index (https://nossy.pro/sitemap.xml),
     coleta os shards por país (sitemap-usa.xml, sitemap-germany.xml...)
     e submete as URLs em lotes de 1.000 (limite do protocolo: 10.000).

Uso:
  python3 scripts/ping-indexnow.py            # submete tudo (páginas + vagas)
  python3 scripts/ping-indexnow.py --max 500  # limita total de vagas por rodada
  python3 scripts/ping-indexnow.py --so-shards # só lista shards (dry-run parcial)

Rodar SEMPRE depois de um deploy com vagas novas (importador G4).
"""
import json
import sys
import time
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEO = json.loads((ROOT / "src" / "config" / "seo.json").read_text(encoding="utf-8"))
KEY = SEO["indexNowKey"].strip()
HOST = "nossy.pro"
ORIGIN = f"https://{HOST}"
ENDPOINT = "https://api.indexnow.org/IndexNow"
CHUNK = 1000          # protocolo IndexNow: até 10.000 URLs por POST; 1.000 é educado
PAUSA = 0.6           # segundos entre lotes

def http_get(url: str, timeout: int = 25) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "NOSSY-IndexNow/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

def locs_de_sitemap(url: str) -> list[str]:
    """Extrai <loc> de um sitemap (index ou shard)."""
    try:
        xml = http_get(url)
        root = ET.fromstring(xml)
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        return [e.text.strip() for e in root.findall(".//s:loc", ns) if e.text]
    except Exception as e:
        print(f"  ! falha lendo {url}: {e}")
        return []

def submeter(urls: list[str]) -> bool:
    """POST IndexNow de um lote. 200/202 = aceito."""
    payload = json.dumps({
        "host": HOST,
        "key": KEY,
        "keyLocation": f"{ORIGIN}/{KEY}.txt",
        "urlList": urls,
    }).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT, data=payload, method="POST",
        headers={"Content-Type": "application/json; charset=utf-8",
                 "User-Agent": "NOSSY-IndexNow/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(f"  POST {len(urls)} URLs -> HTTP {r.status}")
            return r.status in (200, 201, 202)
    except urllib.error.HTTPError as e:
        corpo = e.read()[:200].decode("utf-8", "replace")
        print(f"  POST {len(urls)} URLs -> HTTP {e.code} {corpo}")
        return False
    except Exception as e:
        print(f"  POST falhou: {e}")
        return False

def main():
    if not KEY:
        print("ERRO: indexNowKey vazia em src/config/seo.json")
        sys.exit(2)

    max_urls = 10000
    so_shards = "--so-shards" in sys.argv
    if "--max" in sys.argv:
        max_urls = int(sys.argv[sys.argv.index("--max") + 1])

    print(f"NOSSY IndexNow — chave {KEY[:8]}... — destino {ENDPOINT}")

    # 1) Sitemap index -> shards
    index_url = f"{ORIGIN}/sitemap.xml"
    shards = locs_de_sitemap(index_url)
    print(f"Sitemap index: {len(shards)} shards por país")
    if not shards:
        print("ERRO: nenhum shard encontrado — abortando (nada foi submetido).")
        sys.exit(1)
    if so_shards:
        for s in shards:
            print("  ", s)
        sys.exit(0)

    # 2) Páginas principais + listagens de idioma (prioridade máxima)
    paginas = [
        f"{ORIGIN}/",
        f"{ORIGIN}/en/jobs",
        f"{ORIGIN}/pt-br/jobs",
        f"{ORIGIN}/es/jobs",
    ]

    # 3) Vagas: shards são percorridos até atingir o teto
    vagas: list[str] = []
    for shard in shards:
        if len(vagas) >= max_urls:
            break
        vagas.extend(locs_de_sitemap(shard))
    vagas = vagas[:max_urls]
    print(f"URLs de vagas coletadas: {len(vagas)} (teto {max_urls})")

    # 4) Submissão em lotes
    lotes = [paginas] + [vagas[i:i + CHUNK] for i in range(0, len(vagas), CHUNK)]
    ok = 0
    for n, lote in enumerate(lotes, 1):
        if submeter(lote):
            ok += 1
        if n < len(lotes):
            time.sleep(PAUSA)

    total = sum(len(l) for l in lotes)
    print(f"\nCONCLUÍDO: {ok}/{len(lotes)} lotes aceitos — {total} URLs informadas aos robôs.")
    print(f"Posse do site: {ORIGIN}/{KEY}.txt")
    if ok < len(lotes):
        print("ATENÇÃO: algum lote falhou — rode de novo mais tarde.")
        sys.exit(1)

if __name__ == "__main__":
    main()
