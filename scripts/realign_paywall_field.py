#!/usr/bin/env python3
"""Premium 0220 — realinha o campo `paywall` dos dados à regra ATUAL do padrão.

Regra (src/lib/shared.ts::shouldHavePaywall):
  1. Lista forçada PREMIUM_0220_FORCE_JOB_IDS -> sempre bloqueado (vazia hoje)
  2. Remota (type remote/remoto) && id % 10 == 0              -> bloqueado
  3. Caso contrário                                            -> livre

O campo estava com marcas do pipeline ANTIGO (9% remoto + salário + hash),
gerando 1.939 falsos "paywall" — campo não é lido em runtime, mas manter a
marca errada confunde auditorias de vazamento e pipelines futuros.
"""
import json, glob, os

def rule_paywall(job):
    jid = int(job.get('id') or 0)
    t = (job.get('type') or '').strip().lower()
    remote = t in ('remote', 'remoto')
    return remote and jid % 10 == 0

total_before = total_after = changed = 0
for f in sorted(glob.glob('data/site/*.json')):
    if 'countries' in os.path.basename(f):
        continue
    try:
        d = json.load(open(f, encoding='utf-8'))
    except Exception:
        continue
    if not isinstance(d, list):
        continue
    dirty = False
    for j in d:
        if not isinstance(j, dict) or 'paywall' not in j:
            continue
        total_before += 1
        new = rule_paywall(j)
        if bool(j.get('paywall')) != new:
            j['paywall'] = new
            changed += 1
            dirty = True
        if j.get('paywall'):
            total_after += 1
    if dirty:
        json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False)

print(f'vagas avaliadas: {total_before} | marcas corrigidas: {changed} | paywall pela regra: {total_after}')
