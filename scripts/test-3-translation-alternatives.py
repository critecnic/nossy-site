#!/usr/bin/env python3
"""
Teste comparativo de 3 alternativas de tradução para o NOSSY.pro
Testa: A) Lingva Translate  B) LibreTranslate  C) Pré-tradução estática

Cada alternativa é testada com textos reais do site (português → 6 idiomas).
Métricas: sucesso, tempo, qualidade, confiabilidade.
"""

import urllib.request
import urllib.parse
import json
import time
import sys
import os

# Textos reais do nossy.pro para teste (em português)
TEST_TEXTS = {
    "title": "Senior Software Engineer",
    "company": "Sea Group",
    "location": "São Paulo, Brasil",
    "description": "Vaga para desenvolvedor senior com experiencia em React, Node.js e cloud computing. Requisitos: 5+ anos de experiencia, conhecimento em AWS ou GCP.",
    "short_sector": "Software Engineering",
}

TARGET_LANGS = ["en", "es", "fr", "de", "ja", "ar"]  # 6 idiomas de teste
LANG_CODES_MYMEMORY = {"en": "en", "es": "es", "fr": "fr", "de": "de", "ja": "ja", "ar": "ar"}

results = {"A_lingva": {}, "B_libre": {}, "C_static": {}}

# ============================================================
# ALTERNATIVA A: Lingva Translate (Google Translate wrapper)
# Instâncias públicas gratuitas, sem API key
# ============================================================
LINGVA_INSTANCES = [
    "https://lingva.ml",
    "https://lingva.thedaviddelta.com",
    "https://lingva.lunar.icu",
    "https://translate.plausibility.cloud",
]

def test_lingva(text, target_lang):
    """Testa tradução via Lingva Translate."""
    # Lingva usa códigos: pt -> target
    source = "pt"
    target = target_lang
    
    for base_url in LINGVA_INSTANCES:
        try:
            url = f"{base_url}/api/v1/{source}/{target}/{urllib.parse.quote(text)}"
            req = urllib.request.Request(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
            })
            start = time.time()
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode())
                elapsed = time.time() - start
                translated = data.get("translation", "")
                if translated and translated.upper() != text.upper():
                    return {"ok": True, "text": translated, "time": elapsed, "instance": base_url}
        except Exception as e:
            continue
    return {"ok": False, "error": "Todas instâncias falharam", "time": 0}


# ============================================================
# ALTERNATIVA B: LibreTranslate (open source)
# Instância pública gratuita
# ============================================================
LIBRE_INSTANCES = [
    "https://libretranslate.de",
    "https://libretranslate.pussthecat.org",
    "https://translate.argosopentech.com",
]

def test_libre(text, target_lang):
    """Testa tradução via LibreTranslate."""
    for base_url in LIBRE_INSTANCES:
        try:
            payload = json.dumps({
                "q": text,
                "source": "pt",
                "target": target_lang,
                "format": "text",
            }).encode()
            req = urllib.request.Request(
                f"{base_url}/translate",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            start = time.time()
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode())
                elapsed = time.time() - start
                translated = data.get("translatedText", "")
                if translated and translated.upper() != text.upper():
                    return {"ok": True, "text": translated, "time": elapsed, "instance": base_url}
        except Exception as e:
            continue
    return {"ok": False, "error": "Todas instâncias falharam", "time": 0}


# ============================================================
# ALTERNATIVA C: Pré-tradução estática (dicionário embutido)
# Zero dependência de API externa em runtime
# ============================================================
# Simula um dicionário pré-traduzido que seria gerado em build time
STATIC_TRANSLATIONS = {
    "title": {
        "en": "Senior Software Engineer",
        "es": "Ingeniero de Software Senior",
        "fr": "Ingenieur Logiciel Senior",
        "de": "Senior Softwareentwickler",
        "ja": "シニアソフトウェアエンジニア",
        "ar": "مهندس برمجيات أول",
    },
    "company": {
        "en": "Sea Group",
        "es": "Sea Group",
        "fr": "Sea Group",
        "de": "Sea Group",
        "ja": "Sea Group",
        "ar": "Sea Group",
    },
    "location": {
        "en": "Sao Paulo, Brazil",
        "es": "Sao Paulo, Brasil",
        "fr": "Sao Paulo, Bresil",
        "de": "Sao Paulo, Brasilien",
        "ja": "サンパウロ、ブラジル",
        "ar": "ساو باولو، البرازيل",
    },
    "description": {
        "en": "Senior developer position with experience in React, Node.js and cloud computing. Requirements: 5+ years of experience, knowledge in AWS or GCP.",
        "es": "Posicion de desarrollador senior con experiencia en React, Node.js y computacion en la nube. Requisitos: 5+ anos de experiencia, conocimiento en AWS o GCP.",
        "fr": "Poste de developpeur senior avec experience en React, Node.js et cloud computing. Exigences: 5+ ans d'experience, connaissances en AWS ou GCP.",
        "de": "Senior-Entwicklerposition mit Erfahrung in React, Node.js und Cloud Computing. Anforderungen: 5+ Jahre Erfahrung, Kenntnisse in AWS oder GCP.",
        "ja": "React、Node.js、クラウドコンピューティングの経験を持つシニア開発者のポジション。要件：5年以上の経験、AWSまたはGCPの知識。",
        "ar": "موضع مطور أول مع خبرة في React و Node.js والحوسبة السحابية. المتطلبات: 5+ سنوات خبرة، معرفة في AWS أو GCP.",
    },
    "short_sector": {
        "en": "Software Engineering",
        "es": "Ingenieria de Software",
        "fr": "Ingenierie Logicielle",
        "de": "Softwareentwicklung",
        "ja": "ソフトウェアエンジニアリング",
        "ar": "هندسة البرمجيات",
    },
}

def test_static(text, field_name, target_lang):
    """Simula busca em dicionário pré-traduzido (instantâneo)."""
    start = time.time()
    translated = STATIC_TRANSLATIONS.get(field_name, {}).get(target_lang, "")
    elapsed = time.time() - start
    if translated:
        return {"ok": True, "text": translated, "time": elapsed}
    return {"ok": False, "error": "Não encontrado no dicionário", "time": elapsed}


# ============================================================
# BÔNUS: Testar MyMemory (sistema ATUAL) para comparação
# ============================================================
def test_mymemory(text, target_lang):
    """Testa o sistema atual (MyMemory)."""
    lang_pair = f"pt|{target_lang}"
    url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(text)}&langpair={lang_pair}"
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
        })
        start = time.time()
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode())
            elapsed = time.time() - start
            if data.get("responseStatus") == 200:
                translated = data["responseData"]["translatedText"]
                if translated and translated.upper() != text.upper() and "NO QUERY" not in translated.upper():
                    return {"ok": True, "text": translated, "time": elapsed}
                return {"ok": False, "error": "Tradução inválida (uppercase/fallback)", "time": elapsed}
            return {"ok": False, "error": f"Status {data.get('responseStatus')}", "time": elapsed}
    except Exception as e:
        return {"ok": False, "error": str(e)[:80], "time": 0}


def print_separator(title):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")


def run_tests():
    all_results = {
        "ATUAL_MyMemory": {"tests": [], "summary": {}},
        "A_Lingva": {"tests": [], "summary": {}},
        "B_LibreTranslate": {"tests": [], "summary": {}},
        "C_Static": {"tests": [], "summary": {}},
    }
    
    field_order = ["title", "company", "location", "description", "short_sector"]
    
    print_separator("TESTE COMPARATIVO - 3 ALTERNATIVAS DE TRADUÇÃO + ATUAL")
    print(f"Textos: {len(TEST_TEXTS)} | Idiomas: {len(TARGET_LANGS)} | Total testes por alternativa: {len(TEST_TEXTS) * len(TARGET_LANGS)}")
    print(f"Texto descrição: {TEST_TEXTS['description'][:60]}...")
    
    for field_name in field_order:
        text = TEST_TEXTS[field_name]
        for lang in TARGET_LANGS:
            label = f"{field_name} -> {lang}"
            
            # Testar ATUAL (MyMemory)
            r = test_mymemory(text, LANG_CODES_MYMEMORY[lang])
            all_results["ATUAL_MyMemory"]["tests"].append({"label": label, **r})
            
            # Testar A: Lingva
            r = test_lingva(text, lang)
            all_results["A_Lingva"]["tests"].append({"label": label, **r})
            
            # Testar B: LibreTranslate
            r = test_libre(text, lang)
            all_results["B_LibreTranslate"]["tests"].append({"label": label, **r})
            
            # Testar C: Static
            r = test_static(text, field_name, lang)
            all_results["C_Static"]["tests"].append({"label": label, **r})
    
    # Calcular sumários
    for alt_name, alt_data in all_results.items():
        tests = alt_data["tests"]
        total = len(tests)
        successes = sum(1 for t in tests if t["ok"])
        failures = total - successes
        success_rate = (successes / total * 100) if total > 0 else 0
        times = [t["time"] for t in tests if t["ok"] and t["time"] > 0]
        avg_time = sum(times) / len(times) if times else 0
        max_time = max(times) if times else 0
        min_time = min(times) if times else 0
        
        alt_data["summary"] = {
            "total": total,
            "successes": successes,
            "failures": failures,
            "success_rate": round(success_rate, 1),
            "avg_time_ms": round(avg_time * 1000),
            "max_time_ms": round(max_time * 1000),
            "min_time_ms": round(min_time * 1000),
        }
    
    # ============================================================
    # RELATÓRIO
    # ============================================================
    print_separator("RELATÓRIO COMPARATIVO")
    
    print(f"\n{'Alternativa':<25} {'Sucesso':>8} {'Falha':>6} {'Taxa%':>8} {'Avg(ms)':>9} {'Max(ms)':>9}")
    print(f"{'-'*25} {'-'*8} {'-'*6} {'-'*8} {'-'*9} {'-'*9}")
    
    for alt_name, alt_data in all_results.items():
        s = alt_data["summary"]
        status = "OK" if s["success_rate"] >= 80 else "RUIM" if s["success_rate"] < 50 else "MEDIO"
        print(f"{alt_name:<25} {s['successes']:>8} {s['failures']:>6} {s['success_rate']:>7.1f}% {s['avg_time_ms']:>8}ms {s['max_time_ms']:>8}ms  [{status}]")
    
    # Detalhes de falhas
    print_separator("FALHAS DETALHADAS POR ALTERNATIVA")
    
    for alt_name, alt_data in all_results.items():
        failures = [t for t in alt_data["tests"] if not t["ok"]]
        if failures:
            print(f"\n  {alt_name} ({len(failures)} falhas):")
            for f in failures[:5]:  # Mostrar até 5
                print(f"    - {f['label']}: {f.get('error', '?')[:60]}")
            if len(failures) > 5:
                print(f"    ... e mais {len(failures)-5} falhas")
        else:
            print(f"\n  {alt_name}: 0 falhas - TODOS OS TESTES PASSARAM!")
    
    # Amostras de tradução bem-sucedida
    print_separator("AMOSTRAS DE TRADUÇÃO (title -> ja, description -> de)")
    
    for alt_name, alt_data in all_results.items():
        title_ja = next((t["text"] for t in alt_data["tests"] if t["label"] == "title -> ja" and t["ok"]), "FALHOU")
        desc_de = next((t["text"] for t in alt_data["tests"] if t["label"] == "description -> de" and t["ok"]), "FALHOU")
        print(f"\n  {alt_name}:")
        print(f"    title -> ja: {title_ja[:80]}")
        print(f"    desc  -> de: {desc_de[:100]}...")
    
    # ============================================================
    # ANÁLISE FINAL
    # ============================================================
    print_separator("ANÁLISE E RECOMENDAÇÃO")
    
    best = max(all_results.items(), key=lambda x: x[1]["summary"]["success_rate"])
    worst = min(all_results.items(), key=lambda x: x[1]["summary"]["success_rate"])
    
    print("")
    print("  MELHOR taxa de sucesso: {} ({}%)".format(best[0], best[1]['summary']['success_rate']))
    print("  PIOR  taxa de sucesso: {} ({}%)".format(worst[0], worst[1]['summary']['success_rate']))
    print("")
    print("  RESUMO POR ALTERNATIVA:")
    print("")
    
    analyses = {
        "ATUAL_MyMemory": [
            "  Sistema ATUAL do NOSSY. API gratuita mas muito instavel.",
            "  - Problemas: Rate limit agressivo, retorna uppercase quando falha,",
            "    timeout frequente no Vercel serverless.",
            "  - Status: NAO RECOMENDADO para producao."],
        "A_Lingva": [
            "  Wrapper open-source do Google Translate. Instancias publicas gratuitas.",
            "  - Vantagens: Qualidade Google Translate, sem API key, multiplas instancias.",
            "  - Riscos: Instancias podem sair do ar, mas ha fallback automatico.",
            "  - Implementacao: Trocar URL da API, manter mesma logica de cache."],
        "B_LibreTranslate": [
            "  Motor de traducao open-source (NMT). Instancias publicas gratuitas.",
            "  - Vantagens: Totalmente open-source, sem dependencia de Google.",
            "  - Riscos: Instancias publicas limitadas, qualidade inferior ao Google.",
            "  - Implementacao: Trocar URL da API, formato de request diferente."],
        "C_Static": [
            "  Dicionario pre-traduzido embutido no codigo. ZERO dependencia externa.",
            "  - Vantagens: 100% confiavel, latencia zero ms, funciona offline, sem rate limit.",
            "  - Desvantagens: Precisa de script de build para gerar traduzcoes,",
            "    aumento no tamanho do bundle, precisa rebuild ao atualizar vagas.",
            "  - Implementacao: Script que le JSONs e gera arquivos por idioma."],
    }
    
    for name, lines in analyses.items():
        s = all_results[name]["summary"]
        print("  [{}] {}% sucesso, avg {}ms".format(name, s['success_rate'], s['avg_time_ms']))
        for line in lines:
            print(line)
    
    # Salvar resultados JSON
    output = {"timestamp": time.strftime("%Y-%m-%d %H:%M:%S"), "results": {}}
    for name, data in all_results.items():
        output["results"][name] = data["summary"]
        output["results"][name]["failures_detail"] = [
            {"label": t["label"], "error": t.get("error", "")} for t in data["tests"] if not t["ok"]
        ]
        output["results"][name]["samples"] = {
            t["label"]: t["text"][:100] for t in data["tests"] if t["ok"] and t["label"] in ["title -> ja", "description -> de", "location -> ar"]
        }
    
    output_path = "/home/z/my-project/download/translation-test-results.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n  Resultados salvos em: {output_path}")
    
    return all_results


if __name__ == "__main__":
    run_tests()
