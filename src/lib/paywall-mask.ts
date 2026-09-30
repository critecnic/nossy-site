// PADRÃO 0220 — VAGAS LIVRES (2026-09-18, pedido do dono):
// "retire toda a área premium, deixe todos os anúncios livres".
//
// O paywall foi REMOVIDO do site. Este módulo existe apenas para manter as
// assinaturas antigas usadas por rotas de dados e layouts — agora como
// OPERAÇÃO NULA (no-op): nenhuma vaga é mascarada, nenhum texto é limpo,
// nenhum cookie de desbloqueio é consultado. Toda a informação da vaga
// (empresa, e-mail, telefone) é pública para todos os visitantes.
//
// Benefício colateral de performance: com a máscara nula, as respostas das
// APIs de dados tornam-se idênticas para todos os usuários e podem ser
// cacheadas na CDN (Cache-Control público), reduzindo custo e latência.

export type CookieGetter = (name: string) => string | undefined;

/** No-op: todas as vagas estão desbloqueadas. Mantido por compatibilidade. */
export function isJobUnlocked(_jobId: number, _getCookie?: CookieGetter): boolean {
  return true;
}

/** No-op: o texto volta intacto — o nome da empresa é público. */
export function scrubCompanyFromText(
  text: string | undefined | null,
  _company?: string | undefined | null
): string {
  return text || '';
}

/** No-op: vaga volta idêntica (nenhum campo é mascarado). */
export function maskJobContact<T extends Record<string, any>>(job: T): T {
  return job;
}

/** No-op: nenhuma vaga fica bloqueada, logo nada é mascarado. */
export function maskJobIfLocked<T extends Record<string, any>>(
  job: T,
  _getCookie?: CookieGetter
): T {
  return job;
}

/** No-op: nenhuma vaga tem paywall, logo nada é mascarado. */
export function maskJobAlways<T extends Record<string, any>>(job: T): T {
  return job;
}
