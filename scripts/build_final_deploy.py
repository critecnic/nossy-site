#!/usr/bin/env python3
"""
NOSSY.PRO — Pacote de Deploy com Agente de Comunicação Direta
Gera um zip com todos os arquivos corrigidos para enviar ao GitHub.
Após o deploy, a IA consegue se comunicar diretamente com o site via /api/agent
"""
import zipfile
import os
import hashlib
import json
from datetime import datetime

PROJECT = "/home/z/my-project"
OUT = "/home/z/my-project/download"
ZIP = f"nossy-agent-deploy-{datetime.now().strftime('%Y%m%d-%H%M')}.zip"
ZIP_PATH = os.path.join(OUT, ZIP)

# Arquivos para incluir no deploy (caminho relativo ao root do projeto)
DEPLOY_FILES = [
    # FIX 1: Country route — chunks primeiro (corrige 413 EUA)
    "src/app/api/data/country/route.ts",
    # FIX 2: i18n — 23 chaves novas para company/post em 22 idiomas
    "src/lib/i18n.ts",
    # NOVO: Agente de comunicação direta (diagnóstico + reparo em tempo real)
    "src/app/api/agent/route.ts",
    # NOVO: Health check admin
    "src/app/api/admin/health/route.ts",
    # NOVO: Repair actions admin
    "src/app/api/admin/repair/route.ts",
]

def sha(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for c in iter(lambda: f.read(8192), b''): h.update(c)
    return h.hexdigest()[:10]

os.makedirs(OUT, exist_ok=True)

with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zf:
    manifest = []
    for rel in DEPLOY_FILES:
        full = os.path.join(PROJECT, rel)
        if not os.path.exists(full):
            print(f"  ERRO: {full} nao existe!")
            continue
        zf.write(full, rel)
        s = os.path.getsize(full)
        manifest.append({"path": rel, "size": s, "sha": sha(full)})
        print(f"  + {rel} ({s:,} bytes)")

    # Manifesto com instruções
    zf.writestr("DEPLOY.json", json.dumps({
        "version": "1.0",
        "generated": datetime.now().isoformat(),
        "agent_version": "nossy-agent-v1",
        "files": manifest,
        "what_was_fixed": [
            "country/route.ts: Agora tenta chunks ANTES do arquivo direto — corrige erro 413 nos EUA",
            "i18n.ts: 23 chaves de tradução adicionadas para a página company/post em todos 22 idiomas",
            "api/agent/route.ts: NOVO — Endpoint de agente com 11 ações de diagnóstico e reparo",
            "api/admin/health: NOVO — Health check autenticado",
            "api/admin/repair: NOVO — Ações de reparo autenticadas",
        ],
        "agent_actions": [
            {"action": "ping", "method": "GET/POST", "desc": "Teste de conexão"},
            {"action": "diagnose", "method": "GET/POST", "desc": "Diagnóstico completo do site"},
            {"action": "test-gemini", "method": "POST", "desc": "Testa API Gemini com tradução real"},
            {"action": "test-translation", "method": "POST", "desc": "Testa pipeline de tradução (pt/en/es)"},
            {"action": "test-usa", "method": "POST", "desc": "Testa endpoint EUA (deve ser 200)"},
            {"action": "test-route", "method": "POST", "desc": "Testa qualquer rota {route: \"/api/...\"}"},
            {"action": "env-info", "method": "POST", "desc": "Env vars configuradas"},
            {"action": "list-files", "method": "POST", "desc": "Lista arquivos de dados"},
            {"action": "file-info", "method": "POST", "desc": "Info de arquivo {file: \"nome\"}"},
            {"action": "i18n-check", "method": "POST", "desc": "Verifica chaves i18n {lang: \"en\"}"},
            {"action": "split-files", "method": "POST", "desc": "Divide arquivos >4MB em chunks"},
        ],
    }, indent=2, ensure_ascii=False))
    print(f"  + DEPLOY.json")

print(f"\n✅ Pacote criado: {ZIP_PATH}")
print(f"   Tamanho: {os.path.getsize(ZIP_PATH):,} bytes")
