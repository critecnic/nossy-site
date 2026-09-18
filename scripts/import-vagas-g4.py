#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NOSSY 0220 — Importador de Vagas G4 (posts exclusivos) — Task 21
================================================================
Lê o Excel enviado pelo dono (Vagas_G4_Descricoes.xlsx) e publica as vagas
como POSTS EXCLUSIVOS no site, sem acrescentar nenhuma página nova
(pedido: "nao acrescentar site. Apenas post exclusive"):

  1. POSTAGEM ALEATORIA  -> datas 'posted' sorteadas nos últimos 14 dias
                            e ordem embaralhada (padrão orgânico p/ Google);
  2. E-MAIL NAS DESCRICOES -> acrescenta o parágrafo "Para se candidatar,
                            envie suas informações (currículo) via e-mail...";
  3. TODOS OS PAISES     -> vagas entram no pool remoto-global (100% remotas);
                            gen-remote-extra.mjs as espalha para as listagens
                            de TODOS os países do catálogo mundial;
  4. FORMATO UNICO       -> cada vaga ganha ID exclusivo (900000+) e URL
                            canônica única; o Google/robôs a identificam como
                            post do NOSSY via JSON-LD JobPosting + sitemaps;
  5. ERRO < 1%           -> validação linha a linha; o import falha se mais
                            de 1% das linhas tiver problema (nenhuma linha
                            inválida é publicada).

Uso:
  python3 scripts/import-vagas-g4.py [caminho.xlsx|caminho.csv]

Depois de importar: commit + deploy (o build regenera sitemaps/índices).
"""
import csv
import json
import random
import re
import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "site"
POOL_FILE = DATA / "asia_remoto-global.json"          # Ásia = prioridade no merge
TOTALS = DATA / "_totals.json"
DEFAULT_XLSX = Path("/home/z/my-project/upload/Vagas_G4_Descricoes.xlsx")
DEFAULT_CSV = Path("/home/z/my-project/upload/Vagas_G4_Descricoes.csv")

ID_BASE = 900000          # acima do max atual (19590): zero colisão
MAX_ERRO_PCT = 1.0        # pedido do dono: erros < 1%
DIAS_ALEATORIOS = 14      # janela de postagem aleatória

# ── Detecção flexível de colunas (PT/EN, variações comuns) ────────────────
ALIASES = {
    "title":     ["cargo", "titulo", "vaga", "title", "position", "job title", "funcao", "posicao"],
    "company":   ["empresa", "company", "companhia", "employer"],
    "email":     ["email", "e-mail", "contato", "contact", "correio", "correo"],
    "description":["descricao", "descrição", "description", "detalhes", "details", "sobre a vaga", "responsabilidades"],
    "salary":    ["salario", "salário", "salary", "remuneracao", "remuneração", "pagamento"],
    "location":  ["local", "localizacao", "localização", "location", "cidade", "city"],
    "sector":    ["setor", "sector", "area", "área", "categoria", "category", "funcao", "role"],
    "type":      ["tipo", "type", "modelo", "regime", "contrato"],
}

def norm(s):
    return re.sub(r"\s+", " ", str(s or "").strip().lower())

def detect_columns(header):
    """Mapa campo -> índice da coluna, por alias."""
    mapping = {}
    for idx, cell in enumerate(header):
        name = norm(cell)
        for field, aliases in ALIASES.items():
            if field in mapping:
                continue
            if name in aliases or any(name.startswith(a) for a in aliases):
                mapping[field] = idx
                break
    return mapping

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")

def build_description(texto, email, lang_nota="pt"):
    texto = norm_is_text(texto)
    nota = (
        "Para se candidatar, envie suas informações (currículo) via e-mail"
        + (f" para {email}" if email else "")
        + ". Todas as vagas do NOSSY são 100% remotas e gratuitas."
    )
    if lang_nota == "en":
        nota = (
            "To apply, send your information (resume) via email"
            + (f" to {email}" if email else "")
            + ". All NOSSY jobs are 100% remote and free."
        )
    partes = [p.strip() for p in (texto or "").split("\n") if p.strip()]
    partes.append(nota)
    return "\n\n".join(partes)

def norm_is_text(t):
    t = re.sub(r"\r\n?", "\n", str(t or "").strip())
    return re.sub(r"[ \t]+\n", "\n", t)

def rand_date(rng):
    return (date.today() - timedelta(days=rng.randint(0, DIAS_ALEATORIOS))).isoformat()

def ler_csv(caminho: Path):
    """CSV -> lista de tuplas, exatamente como está no arquivo (nada é alterado).
    Cobra: encoding (utf-8-sig -> latin-1), delimitador (sniff , ; \t) e
    campos citados com quebras de linha dentro (módulo csv nativo)."""
    bruto = caminho.read_bytes()
    texto = None
    for enc in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            texto = bruto.decode(enc)
            print(f"Encoding detectado: {enc}")
            break
        except UnicodeDecodeError:
            continue
    if texto is None:
        print("ERRO: não foi possível decodificar o arquivo (encoding desconhecido)")
        sys.exit(2)

    # Delimitador: escolhe o que gera MAIS colunas no cabeçalho (heurística
    # segura para CSV do Excel PT-BR com ',' ou ';').
    primeira = texto.splitlines()[0] if texto.splitlines() else ""
    melhor, melhor_n = ",", 0
    for d in (",", ";", "\t", "|"):
        n = len(list(csv.reader([primeira], delimiter=d))[0])
        if n > melhor_n:
            melhor, melhor_n = d, n
    print(f"Delimitador: {melhor!r} ({melhor_n} colunas no cabeçalho)")

    linhas = list(csv.reader(texto.splitlines(), delimiter=melhor))
    linhas = [l for l in linhas if any(str(c or "").strip() for c in l)]  # tira linhas 100% vazias
    return linhas


def main():
    argv = [a for a in sys.argv[1:] if not a.startswith("--")]
    DRY_RUN = "--dry-run" in sys.argv[1:]
    arg = Path(argv[0]) if argv else (
        DEFAULT_CSV if DEFAULT_CSV.exists() else DEFAULT_XLSX
    )
    if not arg.exists():
        print(f"ERRO: arquivo não encontrado em {arg}")
        print("Envie o arquivo novamente; ele chega em /home/z/my-project/upload/")
        sys.exit(2)

    if arg.suffix.lower() in (".csv", ".txt"):
        rows = ler_csv(arg)
    else:
        try:
            from openpyxl import load_workbook
        except ImportError:
            print("ERRO: openpyxl ausente (pip install openpyxl)")
            sys.exit(2)
        wb = load_workbook(arg, data_only=True, read_only=True)
        ws = wb.active
        rows = [list(r) for r in ws.iter_rows(values_only=True)]

    if len(rows) < 2:
        print("ERRO: planilha sem dados (só cabeçalho ou vazia)")
        sys.exit(2)

    header, data_rows = rows[0], rows[1:]
    cols = detect_columns(header)
    if "title" not in cols:
        print(f"ERRO: coluna de CARGO não encontrada no cabeçalho: {header}")
        sys.exit(2)

    print(f"Colunas detectadas: {cols}")
    print(f"Linhas de dados: {len(data_rows)}")

    pool = json.loads(POOL_FILE.read_text(encoding="utf-8"))
    existing_ids = {int(j["id"]) for j in pool if isinstance(j.get("id"), int)}

    rng = random.Random()  # semente do sistema: postagem aleatória real
    novos, erros = [], []

    for n, row in enumerate(data_rows, start=2):
        try:
            def get(field):
                i = cols.get(field)
                return row[i] if i is not None and i < len(row) else None

            title = str(get("title") or "").strip()
            if not title:
                erros.append((n, "cargo vazio"))
                continue

            email = ""
            m = EMAIL_RE.search(str(get("email") or ""))
            if m:
                email = m.group(0).strip().lower()

            description = build_description(get("description"), email)
            if len(description) < 30:
                erros.append((n, "descrição vazia"))
                continue

            salary = str(get("salary") or "").strip()
            salary_min = None
            m = re.search(r"[\d][\d.,]*", salary)
            if m:
                try:
                    salary_min = int(float(m.group(0).replace(",", "")))
                except ValueError:
                    salary_min = None

            sector = str(get("sector") or "Technology").strip()
            type_field = norm(get("type"))
            job_type = "Remoto"  # pedido do dono: todas as ofertas remotas

            # ID exclusivo (nunca colide: 900000+ e dedupe no próprio lote)
            job_id = None
            for candidate in range(ID_BASE, ID_BASE + 1000000):
                if candidate not in existing_ids:
                    job_id = candidate
                    existing_ids.add(candidate)
                    break

            novos.append({
                "id": job_id,
                "title": title[:150],
                "company": str(get("company") or "Confidencial").strip()[:100],
                "location": str(get("location") or "Remoto - Worldwide").strip()[:100],
                "country": "remoto-global",
                "countryName": "Remoto Global",
                "salary": salary[:50],
                "salaryMin": salary_min,
                "salaryMax": None,
                "salaryCurrency": "USD",
                "salaryPeriod": "year",
                "description": description,
                "sector": sector[:80],
                "posted": rand_date(rng),          # POSTAGEM ALEATORIA
                "type": job_type,                   # TODAS REMOTAS
                "contactEmail": email,
                "paywall": False,
                "regiao": "Asia",
                "exclusiva": True,                  # marcação interna do lote G4
            })
        except Exception as e:
            erros.append((n, f"erro inesperado: {e}"))

    total = len(data_rows)
    if total == 0:
        print("ERRO: nenhuma linha de dados após o cabeçalho")
        sys.exit(2)
    pct_erro = (len(erros) / total * 100) if total else 0
    print(f"Válidas: {len(novos)} | Erros: {len(erros)} ({pct_erro:.2f}%)")
    if erros:
        for ln, motivo in erros[:10]:
            print(f"  linha {ln}: {motivo}")
    if DRY_RUN:
        print("DRY-RUN: validação concluída — NADA foi publicado.")
        if novos:
            print(f"Amostra (1ª vaga): id={novos[0]['id']} | {novos[0]['title']} | {novos[0]['company']} | salário={novos[0]['salary'] or '—'}")
        sys.exit(0)
    if pct_erro > MAX_ERRO_PCT:
        print(f"ABORTADO: {pct_erro:.2f}% de erros > limite de {MAX_ERRO_PCT}% — nada foi publicado.")
        sys.exit(1)

    if not novos:
        print("Nada a importar.")
        sys.exit(0)

    rng.shuffle(novos)  # ordem de inserção também aleatória
    pool = novos + pool  # entram no topo (runtime reordena por posted desc)

    POOL_FILE.write_text(json.dumps(pool, ensure_ascii=False, indent=1), encoding="utf-8")

    # _totals.json: contagem do pool atualizada
    totals = json.loads(TOTALS.read_text(encoding="utf-8")) if TOTALS.exists() else {}
    totals["asia_remoto-global"] = len(pool)
    TOTALS.write_text(json.dumps(totals, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"Pool atualizado: {len(pool)} vagas (+{len(novos)} exclusivas G4)")

    # Espalha para TODOS os países e re-gera sitemaps (build também regenera)
    for script in ["scripts/gen-remote-extra.mjs", "scripts/gen-sitemaps.mjs"]:
        r = subprocess.run(["node", script], cwd=ROOT, capture_output=True, text=True)
        tail = (r.stdout or r.stderr).strip().splitlines()[-3:]
        print(f"[{script}] -> {'OK' if r.returncode == 0 else 'ERRO'} | " + " | ".join(tail))
        if r.returncode != 0:
            sys.exit(1)

    print("\nCONCLUÍDO: posts exclusivos G4 publicados em todos os países.")
    print("Próximo: npm run build && commit && push (o build re-gera índices/sitemaps).")

if __name__ == "__main__":
    main()
