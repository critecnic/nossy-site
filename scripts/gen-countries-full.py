#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera o catálogo mundial de países do NOSSY (pedido do dono):
 - TODOS os ~195 países da lista do dono
 - Nomes COMPLETOS (sem abreviações, sem parênteses, sem bandeiras/emojis)
 - Separados por CONTINENTE (África, América do Norte, América do Sul, Ásia,
   Europa, Oceania)
 - Todos os países recebem as vagas REMOTAS (pool remoto global)

Saídas:
 1. src/data/countries.json  — catálogo {name(EN), namePt(PT), slug, region, continent, count}
 2. src/lib/country-names-full.ts — mapa PT dos países para i18n
"""
import json
import os

SITE = os.path.dirname(os.path.abspath(__file__)) + "/.."

# (PT, EN, slug, continente) — lista do dono, nomes inteiros, sem abreviações
COUNTRIES = [
    # A
    ("Afeganistão", "Afghanistan", "afghanistan", "asia"),
    ("África do Sul", "South Africa", "south-africa", "africa"),
    ("Albânia", "Albania", "albania", "europa"),
    ("Alemanha", "Germany", "germany", "europa"),
    ("Andorra", "Andorra", "andorra", "europa"),
    ("Angola", "Angola", "angola", "africa"),
    ("Antígua e Barbuda", "Antigua and Barbuda", "antigua-and-barbuda", "america-do-norte"),
    ("Arábia Saudita", "Saudi Arabia", "saudi-arabia", "asia"),
    ("Argélia", "Algeria", "algeria", "africa"),
    ("Argentina", "Argentina", "argentina", "america-do-sul"),
    ("Armênia", "Armenia", "armenia", "asia"),
    ("Austrália", "Australia", "australia", "oceania"),
    ("Áustria", "Austria", "austria", "europa"),
    ("Azerbaijão", "Azerbaijan", "azerbaijan", "asia"),
    # B
    ("Bahamas", "Bahamas", "bahamas", "america-do-norte"),
    ("Bangladesh", "Bangladesh", "bangladesh", "asia"),
    ("Barbados", "Barbados", "barbados", "america-do-norte"),
    ("Barein", "Bahrain", "bahrain", "asia"),
    ("Bélgica", "Belgium", "belgium", "europa"),
    ("Belize", "Belize", "belize", "america-do-norte"),
    ("Benin", "Benin", "benin", "africa"),
    ("Bielorrússia", "Belarus", "belarus", "europa"),
    ("Bolívia", "Bolivia", "bolivia", "america-do-sul"),
    ("Bósnia e Herzegovina", "Bosnia and Herzegovina", "bosnia-and-herzegovina", "europa"),
    ("Botsuana", "Botswana", "botswana", "africa"),
    ("Brasil", "Brazil", "brazil", "america-do-sul"),
    ("Brunei", "Brunei", "brunei", "asia"),
    ("Bulgária", "Bulgaria", "bulgaria", "europa"),
    ("Burkina Faso", "Burkina Faso", "burkina-faso", "africa"),
    ("Burundi", "Burundi", "burundi", "africa"),
    ("Butão", "Bhutan", "bhutan", "asia"),
    # C
    ("Cabo Verde", "Cabo Verde", "cabo-verde", "africa"),
    ("Camarões", "Cameroon", "cameroon", "africa"),
    ("Camboja", "Cambodia", "cambodia", "asia"),
    ("Canadá", "Canada", "canada", "america-do-norte"),
    ("Catar", "Qatar", "qatar", "asia"),
    ("Cazaquistão", "Kazakhstan", "kazakhstan", "asia"),
    ("Chade", "Chad", "chad", "africa"),
    ("Chile", "Chile", "chile", "america-do-sul"),
    ("China", "China", "china", "asia"),
    ("Chipre", "Cyprus", "cyprus", "europa"),
    ("Colômbia", "Colombia", "colombia", "america-do-sul"),
    ("Comores", "Comoros", "comoros", "africa"),
    ("Coreia do Norte", "North Korea", "north-korea", "asia"),
    ("Coreia do Sul", "South Korea", "coreia-do-sul", "asia"),
    ("Costa do Marfim", "Côte d'Ivoire", "ivory-coast", "africa"),
    ("Costa Rica", "Costa Rica", "costa-rica", "america-do-norte"),
    ("Croácia", "Croatia", "croatia", "europa"),
    ("Cuba", "Cuba", "cuba", "america-do-norte"),
    # D
    ("Dinamarca", "Denmark", "denmark", "europa"),
    ("Djibuti", "Djibouti", "djibouti", "africa"),
    ("Dominica", "Dominica", "dominica", "america-do-norte"),
    # E
    ("Egito", "Egypt", "egypt", "africa"),
    ("El Salvador", "El Salvador", "el-salvador", "america-do-norte"),
    ("Emirados Árabes Unidos", "United Arab Emirates", "united-arab-emirates", "asia"),
    ("Equador", "Ecuador", "ecuador", "america-do-sul"),
    ("Eritreia", "Eritrea", "eritrea", "africa"),
    ("Eslováquia", "Slovakia", "slovakia", "europa"),
    ("Eslovênia", "Slovenia", "slovenia", "europa"),
    ("Espanha", "Spain", "spain", "europa"),
    ("Estados Unidos", "United States", "united-states", "america-do-norte"),
    ("Estônia", "Estonia", "estonia", "europa"),
    ("Eswatini", "Eswatini", "eswatini", "africa"),
    ("Etiópia", "Ethiopia", "ethiopia", "africa"),
    # F
    ("Fiji", "Fiji", "fiji", "oceania"),
    ("Filipinas", "Philippines", "filipinas", "asia"),
    ("Finlândia", "Finland", "finland", "europa"),
    ("França", "France", "france", "europa"),
    # G
    ("Gabão", "Gabon", "gabon", "africa"),
    ("Gâmbia", "Gambia", "gambia", "africa"),
    ("Gana", "Ghana", "ghana", "africa"),
    ("Geórgia", "Georgia", "georgia", "europa"),
    ("Granada", "Grenada", "grenada", "america-do-norte"),
    ("Grécia", "Greece", "greece", "europa"),
    ("Guatemala", "Guatemala", "guatemala", "america-do-norte"),
    ("Guiana", "Guyana", "guyana", "america-do-sul"),
    ("Guiné", "Guinea", "guinea", "africa"),
    ("Guiné-Bissau", "Guinea-Bissau", "guinea-bissau", "africa"),
    ("Guiné Equatorial", "Equatorial Guinea", "equatorial-guinea", "africa"),
    # H
    ("Haiti", "Haiti", "haiti", "america-do-norte"),
    ("Honduras", "Honduras", "honduras", "america-do-norte"),
    ("Hungria", "Hungary", "hungary", "europa"),
    # I
    ("Iêmen", "Yemen", "yemen", "asia"),
    ("Ilhas Marshall", "Marshall Islands", "marshall-islands", "oceania"),
    ("Ilhas Salomão", "Solomon Islands", "solomon-islands", "oceania"),
    ("Índia", "India", "india", "asia"),
    ("Indonésia", "Indonesia", "indonesia", "asia"),
    ("Irã", "Iran", "iran", "asia"),
    ("Iraque", "Iraq", "iraq", "asia"),
    ("Irlanda", "Ireland", "ireland", "europa"),
    ("Islândia", "Iceland", "iceland", "europa"),
    ("Israel", "Israel", "israel", "asia"),
    ("Itália", "Italy", "italy", "europa"),
    # J
    ("Jamaica", "Jamaica", "jamaica", "america-do-norte"),
    ("Japão", "Japan", "japao", "asia"),
    ("Jordânia", "Jordan", "jordan", "asia"),
    # K
    ("Kiribati", "Kiribati", "kiribati", "oceania"),
    ("Kuwait", "Kuwait", "kuwait", "asia"),
    # L
    ("Laos", "Laos", "laos", "asia"),
    ("Lesoto", "Lesotho", "lesotho", "africa"),
    ("Letônia", "Latvia", "latvia", "europa"),
    ("Líbano", "Lebanon", "lebanon", "asia"),
    ("Libéria", "Liberia", "liberia", "africa"),
    ("Líbia", "Libya", "libya", "africa"),
    ("Liechtenstein", "Liechtenstein", "liechtenstein", "europa"),
    ("Lituânia", "Lithuania", "lithuania", "europa"),
    ("Luxemburgo", "Luxembourg", "luxembourg", "europa"),
    # M
    ("Macedônia do Norte", "North Macedonia", "north-macedonia", "europa"),
    ("Madagascar", "Madagascar", "madagascar", "africa"),
    ("Malásia", "Malaysia", "malasia", "asia"),
    ("Malaui", "Malawi", "malawi", "africa"),
    ("Maldivas", "Maldives", "maldives", "asia"),
    ("Mali", "Mali", "mali", "africa"),
    ("Malta", "Malta", "malta", "europa"),
    ("Marrocos", "Morocco", "morocco", "africa"),
    ("Maurício", "Mauritius", "mauritius", "africa"),
    ("Mauritânia", "Mauritania", "mauritania", "africa"),
    ("México", "Mexico", "mexico", "america-do-norte"),
    ("Mianmar", "Myanmar", "myanmar", "asia"),
    ("Micronésia", "Micronesia", "micronesia", "oceania"),
    ("Moçambique", "Mozambique", "mozambique", "africa"),
    ("Moldávia", "Moldova", "moldova", "europa"),
    ("Mônaco", "Monaco", "monaco", "europa"),
    ("Mongólia", "Mongolia", "mongolia", "asia"),
    ("Montenegro", "Montenegro", "montenegro", "europa"),
    # N
    ("Namíbia", "Namibia", "namibia", "africa"),
    ("Nauru", "Nauru", "nauru", "oceania"),
    ("Nepal", "Nepal", "nepal", "asia"),
    ("Nicarágua", "Nicaragua", "nicaragua", "america-do-norte"),
    ("Níger", "Niger", "niger", "africa"),
    ("Nigéria", "Nigeria", "nigeria", "africa"),
    ("Noruega", "Norway", "norway", "europa"),
    ("Nova Zelândia", "New Zealand", "nova-zelandia", "oceania"),
    # O
    ("Omã", "Oman", "oman", "asia"),
    # P
    ("Países Baixos", "Netherlands", "netherlands", "europa"),
    ("Palau", "Palau", "palau", "oceania"),
    ("Palestina", "Palestine", "palestine", "asia"),
    ("Panamá", "Panama", "panama", "america-do-norte"),
    ("Papua-Nova Guiné", "Papua New Guinea", "papua-new-guinea", "oceania"),
    ("Paquistão", "Pakistan", "paquistao", "asia"),
    ("Paraguai", "Paraguay", "paraguay", "america-do-sul"),
    ("Peru", "Peru", "peru", "america-do-sul"),
    ("Polônia", "Poland", "poland", "europa"),
    ("Portugal", "Portugal", "portugal", "europa"),
    # Q
    ("Quênia", "Kenya", "kenya", "africa"),
    ("Quirguistão", "Kyrgyzstan", "kyrgyzstan", "asia"),
    # R
    ("Reino Unido", "United Kingdom", "united-kingdom", "europa"),
    ("República Centro-Africana", "Central African Republic", "central-african-republic", "africa"),
    ("República Democrática do Congo", "Democratic Republic of the Congo", "dr-congo", "africa"),
    ("República do Congo", "Republic of the Congo", "republic-of-the-congo", "africa"),
    ("República Dominicana", "Dominican Republic", "dominican-republic", "america-do-norte"),
    ("República Tcheca", "Czech Republic", "czech-republic", "europa"),
    ("Romênia", "Romania", "romania", "europa"),
    ("Ruanda", "Rwanda", "rwanda", "africa"),
    ("Rússia", "Russia", "russia", "europa"),
    # S
    ("Samoa", "Samoa", "samoa", "oceania"),
    ("San Marino", "San Marino", "san-marino", "europa"),
    ("Santa Lúcia", "Saint Lucia", "saint-lucia", "america-do-norte"),
    ("São Cristóvão e Névis", "Saint Kitts and Nevis", "saint-kitts-and-nevis", "america-do-norte"),
    ("São Tomé e Príncipe", "São Tomé and Príncipe", "sao-tome-and-principe", "africa"),
    ("São Vicente e Granadinas", "Saint Vincent and the Grenadines", "saint-vincent-and-the-grenadines", "america-do-norte"),
    ("Senegal", "Senegal", "senegal", "africa"),
    ("Serra Leoa", "Sierra Leone", "sierra-leone", "africa"),
    ("Sérvia", "Serbia", "serbia", "europa"),
    ("Seicheles", "Seychelles", "seychelles", "africa"),
    ("Singapura", "Singapore", "singapura", "asia"),
    ("Síria", "Syria", "syria", "asia"),
    ("Somália", "Somalia", "somalia", "africa"),
    ("Sri Lanka", "Sri Lanka", "sri-lanka", "asia"),
    ("Sudão", "Sudan", "sudan", "africa"),
    ("Sudão do Sul", "South Sudan", "south-sudan", "africa"),
    ("Suécia", "Sweden", "sweden", "europa"),
    ("Suíça", "Switzerland", "switzerland", "europa"),
    ("Suriname", "Suriname", "suriname", "america-do-sul"),
    # T
    ("Tadjiquistão", "Tajikistan", "tajikistan", "asia"),
    ("Tailândia", "Thailand", "tailandia", "asia"),
    ("Taiwan", "Taiwan", "taiwan", "asia"),
    ("Tanzânia", "Tanzania", "tanzania", "africa"),
    ("Timor-Leste", "Timor-Leste", "timor-leste", "asia"),
    ("Togo", "Togo", "togo", "africa"),
    ("Tonga", "Tonga", "tonga", "oceania"),
    ("Trinidad e Tobago", "Trinidad and Tobago", "trinidad-and-tobago", "america-do-norte"),
    ("Tunísia", "Tunisia", "tunisia", "africa"),
    ("Turcomenistão", "Turkmenistan", "turkmenistan", "asia"),
    ("Turquia", "Turkey", "turkey", "asia"),
    ("Tuvalu", "Tuvalu", "tuvalu", "oceania"),
    # U
    ("Ucrânia", "Ukraine", "ukraine", "europa"),
    ("Uganda", "Uganda", "uganda", "africa"),
    ("Uruguai", "Uruguay", "uruguay", "america-do-sul"),
    ("Uzbequistão", "Uzbekistan", "uzbekistan", "asia"),
    # V
    ("Vanuatu", "Vanuatu", "vanuatu", "oceania"),
    ("Vaticano", "Vatican City", "vatican-city", "europa"),
    ("Venezuela", "Venezuela", "venezuela", "america-do-sul"),
    ("Vietnã", "Vietnam", "vietna", "asia"),
    # Z
    ("Zâmbia", "Zambia", "zambia", "africa"),
    ("Zimbábue", "Zimbabwe", "zimbabwe", "africa"),
]

# Hong Kong tem dados reais mas não estava na lista do dono — mantém.
EXTRA_EXISTING = [
    ("Hong Kong", "Hong Kong", "hong-kong", "asia"),
]

# Entradas virtuais do pool remoto (URLs/SEO já existentes)
REMOTE_ENTRIES = [
    {"name": "Global Remote", "namePt": "Remoto Global", "slug": "remoto-global", "region": "asia", "continent": "asia"},
    {"name": "Global Remote", "namePt": "Remoto Global", "slug": "remoto-global", "region": "europa", "continent": "europa"},
]

CONTINENT_ORDER = ["africa", "america-do-norte", "america-do-sul", "asia", "europa", "oceania"]


def load_totals():
    """Total por region_slug: _index.json (países fatiados) ou _totals.json
    (arquivos base). Chunks p1..pN são ignorados (pertencem ao índice)."""
    totals = {}
    p = os.path.join(SITE, "data/site/_totals.json")
    with open(p) as f:
        for k, v in json.load(f).items():
            if not k.endswith(("_p1", "_p2", "_p3", "_p4", "_p5", "_p6", "_p7", "_p8", "_p9", "_p10",
                               "_p11", "_p12", "_p13", "_p14", "_p15", "_p16", "_p17", "_p18", "_p19", "_p20")):
                totals[k] = v
    data_dir = os.path.join(SITE, "data/site")
    for f in os.listdir(data_dir):
        if f.endswith("_index.json"):
            base = f[: -len("_index.json")]
            try:
                idx = json.load(open(os.path.join(data_dir, f)))
                if isinstance(idx, dict) and "totalJobs" in idx:
                    totals[base] = idx["totalJobs"]
            except Exception:
                pass
    return totals


def pool_unique_count():
    a = json.load(open(os.path.join(SITE, "data/site/asia_remoto-global.json")))
    e = json.load(open(os.path.join(SITE, "data/site/europa_remoto-global.json")))
    ids = set()
    for j in a + e:
        ids.add(j["id"])
    return len(ids)


def main():
    totals = load_totals()
    pool_count = pool_unique_count()

    catalog = []
    pt_names = {}

    for pt, en, slug, continent in COUNTRIES + EXTRA_EXISTING:
        pt_names[slug] = pt
        # região de dados: slugs existentes mantêm a região original
        # (o nome do arquivo de dados é {region}_{slug}.json)
        existing_region = None
        for reg in ("asia", "europa", "eua", "oceania", "america-do-norte"):
            key = f"{reg}_{slug}"
            if key in totals or os.path.exists(os.path.join(SITE, f"data/site/{key}.json")):
                existing_region = reg
                break
        region = existing_region or continent
        if existing_region:
            count = totals.get(f"{existing_region}_{slug}", 0)
        else:
            count = pool_count  # país novo: recebe o pool remoto global
        catalog.append({
            "name": en,
            "namePt": pt,
            "slug": slug,
            "region": region,
            "continent": continent,
            "count": count,
        })

    for r in REMOTE_ENTRIES:
        catalog.append({
            "name": r["name"],
            "namePt": r["namePt"],
            "slug": r["slug"],
            "region": r["region"],
            "continent": r["continent"],
            "count": totals.get(f"{r['region']}_{r['slug']}", 0),
        })

    # ordena por continente (ordem fixa) e count desc dentro do continente
    catalog.sort(key=lambda c: (CONTINENT_ORDER.index(c["continent"]), c["region"], -c["count"], c["slug"]))

    os.makedirs(os.path.join(SITE, "src/data"), exist_ok=True)
    with open(os.path.join(SITE, "src/data/countries.json"), "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=1)

    # country-names-full.ts (mapa PT completo)
    lines = ["// Mapa PT-BR/PT-PT dos países do catálogo mundial (nomes INTEIROS,",
             "// sem abreviações) — gerado por scripts/gen-countries-full.py.",
             "// Para outros idiomas o fallback é o campo `name` (EN) do catálogo.",
             "",
             "export const COUNTRY_PT_FULL: Record<string, string> = {"]
    for slug, pt in pt_names.items():
        lines.append(f'  "{slug}": {json.dumps(pt, ensure_ascii=False)},')
    lines.append('  "remoto-global": "Remoto Global",')
    lines.append("};")
    lines.append("")
    with open(os.path.join(SITE, "src/lib/country-names-full.ts"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    # estatísticas
    real = [c for c in catalog if c["slug"] != "remoto-global"]
    by_cont = {}
    for c in real:
        by_cont.setdefault(c["continent"], []).append(c)

    # Continente = vagas ÚNICAS: soma dos dados locais dos países com arquivo
    # + o pool remoto contado UMA VEZ se o continente tiver países pool-only.
    continents = []
    for cont in CONTINENT_ORDER:
        cs = by_cont.get(cont, [])
        local_sum = sum(x["count"] for x in cs if x["count"] != pool_count)
        has_pool = any(x["count"] == pool_count for x in cs)
        continents.append({"code": cont, "count": local_sum + (pool_count if has_pool else 0)})
    os.makedirs(os.path.join(SITE, "src/data"), exist_ok=True)
    with open(os.path.join(SITE, "src/data/continents.json"), "w", encoding="utf-8") as f:
        json.dump(continents, f, ensure_ascii=False, indent=1)

    print(f"Catálogo: {len(real)} países reais + {len(REMOTE_ENTRIES)} entradas remotas")
    for cont in continents:
        cs = by_cont.get(cont["code"], [])
        pool_only = sum(1 for x in cs if x["count"] == pool_count)
        print(f"  {cont['code']}: {len(cs)} países | vagas únicas={cont['count']} | pool-only={pool_only}")
    print(f"Pool remoto único: {pool_count} vagas")


if __name__ == "__main__":
    main()
