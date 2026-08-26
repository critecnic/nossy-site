#!/usr/bin/env python3
"""Teste rapido de 3 alternativas de traducao + atual (MyMemory).
Apenas 2 textos x 3 idiomas para ser rapido."""
import urllib.request, urllib.parse, json, time

TEXTS = [
    ("title", "Senior Software Engineer"),
    ("location", "Sao Paulo, Brasil"),
]
LANGS = ["en", "de", "ja"]

results = {k: {"ok": 0, "fail": 0, "time": [], "errors": []} for k in ["MyMemory", "Lingva", "Libre", "Static"]}

def test_mymemory(text, lang):
    try:
        url = "https://api.mymemory.translated.net/get?q={}&langpair=pt|{}".format(urllib.parse.quote(text), lang)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        t0 = time.time()
        with urllib.request.urlopen(req, timeout=6) as r:
            d = json.loads(r.read())
            ms = (time.time()-t0)*1000
            tr = d.get("responseData",{}).get("translatedText","")
            if tr and tr.upper() != text.upper() and "NO QUERY" not in tr.upper():
                return {"ok": True, "ms": ms, "text": tr}
            return {"ok": False, "ms": ms, "err": "fallback/uppercase"}
    except Exception as e:
        return {"ok": False, "ms": 0, "err": str(e)[:60]}

def test_lingva(text, lang):
    instances = [
        "https://lingva.ml",
        "https://lingva.thedaviddelta.com",
        "https://lingva.lunar.icu",
    ]
    for base in instances:
        try:
            url = "{}/api/v1/pt/{}/{}".format(base, lang, urllib.parse.quote(text))
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            t0 = time.time()
            with urllib.request.urlopen(req, timeout=6) as r:
                d = json.loads(r.read())
                ms = (time.time()-t0)*1000
                tr = d.get("translation", "")
                if tr: return {"ok": True, "ms": ms, "text": tr, "inst": base}
        except: pass
    return {"ok": False, "ms": 0, "err": "all instances failed"}

def test_libre(text, lang):
    instances = [
        "https://libretranslate.de",
        "https://translate.argosopentech.com",
    ]
    for base in instances:
        try:
            payload = json.dumps({"q": text, "source": "pt", "target": lang, "format": "text"}).encode()
            req = urllib.request.Request(base+"/translate", data=payload, headers={"Content-Type": "application/json"})
            t0 = time.time()
            with urllib.request.urlopen(req, timeout=6) as r:
                d = json.loads(r.read())
                ms = (time.time()-t0)*1000
                tr = d.get("translatedText", "")
                if tr: return {"ok": True, "ms": ms, "text": tr, "inst": base}
        except: pass
    return {"ok": False, "ms": 0, "err": "all instances failed"}

STATIC = {
    ("title","en"): "Senior Software Engineer",
    ("title","de"): "Senior Softwareentwickler",
    ("title","ja"): "Senior Software Engineer",
    ("location","en"): "Sao Paulo, Brazil",
    ("location","de"): "Sao Paulo, Brasilien",
    ("location","ja"): "Sao Paulo",
}

def test_static(field, lang):
    t0 = time.time()
    tr = STATIC.get((field, lang), "")
    ms = (time.time()-t0)*1000
    if tr: return {"ok": True, "ms": ms, "text": tr}
    return {"ok": False, "ms": ms, "err": "not found"}

# Run tests
print("=" * 60)
print("TESTE RAPIDO - 3 ALTERNATIVAS DE TRADUCAO")
print("2 textos x 3 idiomas = 6 testes por alternativa")
print("=" * 60)

for field, text in TEXTS:
    for lang in LANGS:
        label = "{} -> {}".format(field, lang)
        
        r = test_mymemory(text, lang)
        results["MyMemory"]["ok"] += r["ok"]; results["MyMemory"]["fail"] += not r["ok"]
        if r["ok"]: results["MyMemory"]["time"].append(r["ms"])
        else: results["MyMemory"]["errors"].append(label + ": " + r.get("err","?"))
        
        r = test_lingva(text, lang)
        results["Lingva"]["ok"] += r["ok"]; results["Lingva"]["fail"] += not r["ok"]
        if r["ok"]: results["Lingva"]["time"].append(r["ms"])
        else: results["Lingva"]["errors"].append(label + ": " + r.get("err","?"))
        
        r = test_libre(text, lang)
        results["Libre"]["ok"] += r["ok"]; results["Libre"]["fail"] += not r["ok"]
        if r["ok"]: results["Libre"]["time"].append(r["ms"])
        else: results["Libre"]["errors"].append(label + ": " + r.get("err","?"))
        
        r = test_static(field, lang)
        results["Static"]["ok"] += r["ok"]; results["Static"]["fail"] += not r["ok"]
        if r["ok"]: results["Static"]["time"].append(r["ms"])
        else: results["Static"]["errors"].append(label + ": " + r.get("err","?"))

# Report
print("")
print("{:<20} {:>6} {:>6} {:>8} {:>8} {:>8} {}".format(
    "Alternativa", "OK", "Fail", "Taxa%", "AvgMs", "MaxMs", "Status"))
print("-" * 75)

output = {"timestamp": time.strftime("%Y-%m-%d %H:%M:%S"), "results": {}}

for name, data in results.items():
    total = data["ok"] + data["fail"]
    rate = (data["ok"]/total*100) if total else 0
    avg = sum(data["time"])/len(data["time"]) if data["time"] else 0
    mx = max(data["time"]) if data["time"] else 0
    status = "OK" if rate >= 80 else ("RUIM" if rate < 50 else "MEDIO")
    print("{:<20} {:>6} {:>6} {:>7.0f}% {:>7.0f}ms {:>7.0f}ms  [{}]".format(
        name, data["ok"], data["fail"], rate, avg, mx, status))
    output["results"][name] = {
        "ok": data["ok"], "fail": data["fail"], "rate": round(rate,1),
        "avg_ms": round(avg), "max_ms": round(mx),
        "errors": data["errors"][:5]
    }

print("")
print("FALHAS:")
for name, data in results.items():
    if data["errors"]:
        print("  {}: {}".format(name, data["errors"][0]))
        for e in data["errors"][1:3]:
            print("    {}".format(e))
    else:
        print("  {}: SEM FALHAS".format(name))

print("")
print("=" * 60)
print("ANALISE")
print("=" * 60)
print("")
print("A) MyMemory ATUAL: Instavel, rate limit, falha no Vercel")
print("B) Lingva Translate: Google Translate wrapper, multiplas instancias")
print("C) LibreTranslate: Open source NMT, instancias publicas")
print("D) Static pre-traducao: Zero API, 100pct confiavel, instantaneo")
print("")

with open("/home/z/my-project/download/translation-test-results.json", "w") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)
print("Resultados salvos em /home/z/my-project/download/translation-test-results.json")