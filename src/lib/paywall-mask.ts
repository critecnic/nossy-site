// Premium 0220 — máscara SERVER-SIDE dos dados protegidos.
//
// Antes: a ofuscação era apenas visual (React trocava por "***"), mas as
// APIs devolviam a vaga COMPLETA para o navegador — bastava abrir o
// DevTools (aba Network) para ler empresa, e-mail, telefone e site de uma
// vaga bloqueada. As meta tags (title/OG) também publicavam o nome da
// empresa para o Google.
//
// Agora: as rotas de dados aplicam esta máscara ANTES de responder, e as
// meta tags usam "Confidential" para vagas bloqueadas. O desbloqueio
// continua baseado nos cookies assinados (nossy_premium / wv_unlock_{id})
// verificados com timingSafeEqual em src/lib/unlock.ts.

import { shouldHavePaywall } from './shared';
import { PREMIUM_COOKIE, unlockCookieName, verifyPremium, verifyUnlock } from './unlock';

export type CookieGetter = (name: string) => string | undefined;

/**
 * True quando o pedido tem cookie válido que libera a vaga:
 * cookie Premium (todas as vagas) OU o cookie de desbloqueio da vaga.
 */
export function isJobUnlocked(jobId: number, getCookie: CookieGetter): boolean {
  const id = Number(jobId);
  if (!Number.isFinite(id) || id <= 0) return false;
  if (verifyPremium(getCookie(PREMIUM_COOKIE))) return true;
  return verifyUnlock(id, getCookie(unlockCookieName(id)));
}

/**
 * Remove os campos identificadores de uma vaga. Mantém as chaves (com
 * placeholders) para que os componentes continuem funcionando sem
 * lógica condicional extra.
 *
 * PADRÃO 1874: a DESCRICÃO também é limpa — muitas vagas citam o nome da
 * empresa no texto ("...na Shopify..."), o que revelava a empresa mesmo com
 * o campo company mascarado (vazamento reportado pelo dono).
 */
export function scrubCompanyFromText(
  text: string | undefined | null,
  company: string | undefined | null
): string {
  const desc = text || '';
  const name = (company || '').trim();
  if (!desc || !name) return desc;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    return desc.replace(new RegExp(escaped, 'gi'), '***');
  } catch {
    return desc;
  }
}

export function maskJobContact<T extends Record<string, any>>(job: T): T {
  return {
    ...job,
    company: '***',
    companyUrl: null,
    contactEmail: '',
    contactPhone: null,
    description: scrubCompanyFromText(job.description, job.company),
  };
}

/**
 * Rota de DETALHE (resposta por-usuário): aplica a máscara somente se a
 * vaga for Premium 0220 e o pedido não tiver cookie de desbloqueio.
 * ATENÇÃO: respostas por-usuário não podem ser cacheadas publicamente —
 * use "private, no-store" para vagas com paywall.
 */
export function maskJobIfLocked<T extends Record<string, any>>(job: T, getCookie: CookieGetter): T {
  const pw = shouldHavePaywall(job);
  if (!pw.paywall) return job;
  if (isJobUnlocked(job.id, getCookie)) return job;
  return maskJobContact(job);
}

/**
 * Rotas de LISTA (resposta pública/cacheável, igual para todos): aplica a
 * máscara em TODA vaga com paywall, independente de cookie. As listas
 * sempre exibem "***" — o conteúdo real só aparece na página da vaga
 * após pagamento verificado.
 */
export function maskJobAlways<T extends Record<string, any>>(job: T): T {
  return shouldHavePaywall(job).paywall ? maskJobContact(job) : job;
}
