// Nomes COMPLETOS de continentes, países e locais de trabalho (padrão
// Premium 0220 — nenhuma abreviação na interface).
//
// Problema corrigido: os dados brutos e a UI exibiam formas abreviadas —
// região "EUA", estados americanos com sigla ("Austin, TX", "Seattle, WA")
// e país em inglês nas páginas em português ("Krakow, Poland",
// "Lahore, Pakistan"). Exibir a vaga em pt-br deve mostrar
// "Austin, Texas", "Cracóvia, Polônia", "Lahore, Paquistão".

import type { Lang } from './i18n';
import { COUNTRY_NAMES } from './country-names';
import { getRegionName } from './shared';

/** Siglas dos estados dos EUA -> nome completo (inglês). */
export const US_STATES_EN: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
};

/** Nome completo dos estados em português (mesma ordem da tabela EN). */
export const US_STATES_PT: Record<string, string> = {
  AL: 'Alabama', AK: 'Alasca', AZ: 'Arizona', AR: 'Arkansas', CA: 'Califórnia',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Flórida', GA: 'Geórgia',
  HI: 'Havaí', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'Nova Hampshire',
  NJ: 'Nova Jérsei', NM: 'Novo México', NY: 'Nova York', NC: 'Carolina do Norte',
  ND: 'Dakota do Norte', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon',
  PA: 'Pensilvânia', RI: 'Rhode Island', SC: 'Carolina do Sul',
  SD: 'Dakota do Sul', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virgínia', WA: 'Washington', WV: 'Virgínia Ocidental',
  WI: 'Wisconsin', WY: 'Wyoming', DC: 'Distrito de Columbia',
};

/** Nome completo dos estados em espanhol. */
export const US_STATES_ES: Record<string, string> = {
  ...US_STATES_EN,
  AK: 'Alaska', CA: 'California', FL: 'Florida', GA: 'Georgia', HI: 'Hawái',
  ME: 'Maine', NH: 'Nuevo Hampshire', NJ: 'Nueva Jersey', NM: 'Nuevo México',
  NY: 'Nueva York', NC: 'Carolina del Norte', ND: 'Dakota del Norte',
  OK: 'Oklahoma', PA: 'Pensilvania', SC: 'Carolina del Sur',
  SD: 'Dakota del Sur', VA: 'Virginia', WA: 'Washington',
  WV: 'Virginia Occidental', WY: 'Wyoming', CO: 'Colorado',
};

function usStatesFor(lang: string): Record<string, string> {
  if (lang === 'pt-br' || lang === 'pt-pt') return US_STATES_PT;
  if (lang === 'es') return US_STATES_ES;
  return US_STATES_EN;
}

/** Código de região dos dados ("EUA", "America do Norte") -> slug de URL. */
export function normalizeRegionCode(regiao: string | undefined | null): string {
  const r = (regiao || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  if (r === 'eua' || r === 'united states' || r === 'estados unidos') return 'eua';
  if (r === 'america do norte' || r === 'north america') return 'america-do-norte';
  if (r === 'europa' || r === 'europe') return 'europa';
  if (r === 'asia') return 'asia';
  if (r === 'oceania') return 'oceania';
  return r.replace(/\s+/g, '-');
}

/**
 * Localização com nomes COMPLETOS, no idioma da página.
 * Entradas reais dos dados: "Austin, TX" (sigla de estado),
 * "Krakow, Poland" (país em inglês), "Remote - Asia", "Tirana, Albania".
 * Saída: "Austin, Texas" / "Cracóvia, Polônia" (pt) / "Remoto - Ásia".
 */
export function formatJobLocation(
  location: string | undefined | null,
  opts: { countrySlug?: string; countryName?: string; lang?: string }
): string {
  const raw = (location || '').trim();
  if (!raw) return '';
  const lang = opts.lang || 'en';
  const slug = (opts.countrySlug || '').toLowerCase();

  // 1) "Remote - X" / "Remoto - X" -> rótulo traduzido + região completa
  const remoteMatch = raw.match(/^(remote|remoto|remota)\s*[-–]\s*(.+)$/i);
  if (remoteMatch) {
    const remoteLabel =
      lang === 'pt-br' || lang === 'pt-pt' ? 'Remoto'
      : lang === 'es' ? 'Remoto'
      : lang === 'fr' ? 'Télétravail'
      : lang === 'de' ? 'Remote'
      : lang === 'it' ? 'Remoto'
      : lang === 'ru' ? 'Удалённо'
      : lang === 'zh' ? '远程'
      : lang === 'ja' ? 'リモート'
      : lang === 'ko' ? '원격'
      : lang === 'hi' ? 'रिमोट'
      : lang === 'ar' ? 'عن بُعد'
      : lang === 'tr' ? 'Uzaktan'
      : lang === 'vi' ? 'Từ xa'
      : 'Remote';
    const rest = remoteMatch[2].trim();
    // Se o resto é região conhecida (ou slug), usa o nome completo traduzido
    const regionCode = normalizeRegionCode(rest);
    const regionFull = getRegionName(lang, regionCode);
    const restFinal = regionFull && regionFull.toLowerCase() !== regionCode.toLowerCase()
      ? regionFull
      : rest;
    return `${remoteLabel} - ${restFinal}`;
  }

  // 2) Sufixo ", XX" (sigla de estado dos EUA) -> estado por extenso
  const stateMatch = raw.match(/^(.*?),\s*([A-Z]{2})$/);
  if (stateMatch && slug === 'united-states') {
    const states = usStatesFor(lang);
    const full = states[stateMatch[2]];
    if (full) return `${stateMatch[1]}, ${full}`;
  }

  // 3) Sufixo ", {País}" em inglês (ou nome bruto dos dados) -> país traduzido
  const tailMatch = raw.match(/^(.*?),\s*([^,]+)$/);
  if (tailMatch && slug) {
    const tail = tailMatch[2].trim();
    const enName = (COUNTRY_NAMES['en']?.[slug] || '').toLowerCase();
    const dataName = (opts.countryName || '').toLowerCase();
    const ascii = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (tail && (ascii(tail) === ascii(enName) || ascii(tail) === ascii(dataName))) {
      const translated = COUNTRY_NAMES[lang]?.[slug];
      if (translated) return `${tailMatch[1]}, ${translated}`;
    }
  }

  return raw;
}
