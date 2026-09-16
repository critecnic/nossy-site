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

/** Siglas das províncias do Canadá -> nome completo (inglês). */
export const CA_PROVINCES_EN: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories',
  NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec',
  SK: 'Saskatchewan', YT: 'Yukon',
};

/** Províncias do Canadá em português. */
export const CA_PROVINCES_PT: Record<string, string> = {
  AB: 'Alberta', BC: 'Colúmbia Britânica', MB: 'Manitoba', NB: 'Nova Brunswick',
  NL: 'Terra Nova e Labrador', NS: 'Nova Escócia', NT: 'Territórios do Noroeste',
  NU: 'Nunavut', ON: 'Ontário', PE: 'Ilha do Príncipe Eduardo', QC: 'Quebeque',
  SK: 'Saskatchewan', YT: 'Yukon',
};

/** Províncias do Canadá em espanhol. */
export const CA_PROVINCES_ES: Record<string, string> = {
  ...CA_PROVINCES_EN,
  BC: 'Columbia Británica', NB: 'Nuevo Brunswick', NL: 'Terranova y Labrador',
  NS: 'Nueva Escocia', NT: 'Territorios del Noroeste', ON: 'Ontario',
  PE: 'Isla del Príncipe Eduardo', QC: 'Quebec',
};

function caProvincesFor(lang: string): Record<string, string> {
  if (lang === 'pt-br' || lang === 'pt-pt') return CA_PROVINCES_PT;
  if (lang === 'es') return CA_PROVINCES_ES;
  return CA_PROVINCES_EN;
}

/** Abreviações de PAÍS usadas como sufixo nos dados (", USA", ", UK"). */
const COUNTRY_ABBREV_SLUG: Record<string, string> = {
  usa: 'united-states', us: 'united-states', 'u.s.': 'united-states',
  'u.s.a.': 'united-states', uk: 'united-kingdom', 'u.k.': 'united-kingdom',
};

/** Nome de país em inglês -> slug (busca reversa, construída uma vez). */
const COUNTRY_SLUG_BY_EN_NAME: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const ascii = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  for (const [slug, name] of Object.entries(COUNTRY_NAMES['en'] || {})) {
    const key = ascii(String(name));
    if (key && !(key in map)) map[key] = slug;
  }
  return map;
})();

/** Código de região dos dados ("EUA", "America do Norte") -> slug de URL. */
export function normalizeRegionCode(regiao: string | undefined | null): string {
  const r = (regiao || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  if (r === 'eua' || r === 'united states' || r === 'estados unidos' || r === 'usa' || r === 'us') return 'eua';
  if (r === 'worldwide' || r === 'global' || r === 'mundial' || r === 'remoto global') return 'remoto-global';
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
    const asciiRest = rest.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    // "Remote - Worldwide" / "Remote - Global" -> rótulo regional traduzido
    if (asciiRest === 'worldwide' || asciiRest === 'global' || asciiRest === 'mundial') {
      const regionFull = getRegionName(lang, 'remoto-global');
      const tail = regionFull.includes(' - ') ? regionFull.split(' - ').pop()! : regionFull;
      return `${remoteLabel} - ${tail}`;
    }

    // Se o resto é região conhecida ("Asia", "US"/"USA", "Europe"), usa o
    // nome completo traduzido (ex.: "Remote - USA" -> "Remoto - Estados Unidos")
    const regionCode = normalizeRegionCode(rest);
    const regionFull = getRegionName(lang, regionCode);
    if (regionFull && regionFull.toLowerCase() !== regionCode.toLowerCase()
        && regionFull.toLowerCase() !== asciiRest) {
      return `${remoteLabel} - ${regionFull}`;
    }

    // Abreviação de país ("Remote - UK") -> país completo traduzido
    const abbrevSlug = COUNTRY_ABBREV_SLUG[asciiRest];
    if (abbrevSlug) {
      const countryFull = COUNTRY_NAMES[lang]?.[abbrevSlug];
      if (countryFull) return `${remoteLabel} - ${countryFull}`;
    }

    // Formato "Província, País" ("Remote - Ontario, Canada") -> expande
    // recursivamente o trecho (província por extenso + país traduzido)
    return `${remoteLabel} - ${formatJobLocation(rest, { ...opts, countrySlug: undefined, countryName: undefined })}`;
  }

  // 2) Sufixo ", XX" (sigla de estado/província) -> nome por extenso.
  // EUA: "Austin, TX" -> "Austin, Texas". Canadá: "Toronto, ON" -> "Toronto, Ontário".
  const stateMatch = raw.match(/^(.*?),\s*([A-Z]{2})$/);
  if (stateMatch) {
    if (slug === 'united-states') {
      const full = usStatesFor(lang)[stateMatch[2]];
      if (full) return `${stateMatch[1]}, ${full}`;
    }
    if (slug === 'canada') {
      const full = caProvincesFor(lang)[stateMatch[2]];
      if (full) return `${stateMatch[1]}, ${full}`;
    }
  }

  // 3) Sufixo ", {País}" — resolve o país do sufixo em três estratégias:
  //    a) sigla ("Austin, USA", "London, UK", "New York, US");
  //    b) nome em inglês/slug da vaga ("Krakow, Poland");
  //    c) busca reversa pelo nome em inglês ("Remote - Ontario, Canada").
  //    O sufixo é então traduzido para o idioma da página.
  const tailMatch = raw.match(/^(.*?),\s*([^,]+)$/);
  if (tailMatch) {
    const tail = tailMatch[2].trim();
    const ascii = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const asciiTail = ascii(tail);
    let tailSlug: string | null = null;
    if (COUNTRY_ABBREV_SLUG[asciiTail]) {
      tailSlug = COUNTRY_ABBREV_SLUG[asciiTail];
    } else {
      const enName = ascii(COUNTRY_NAMES['en']?.[slug] || '');
      const dataName = ascii(opts.countryName || '');
      if (slug && asciiTail && (asciiTail === enName || asciiTail === dataName)) {
        tailSlug = slug;
      } else {
        tailSlug = COUNTRY_SLUG_BY_EN_NAME[asciiTail] || null;
      }
    }
    if (tailSlug) {
      const translated = COUNTRY_NAMES[lang]?.[tailSlug];
      if (translated) return `${tailMatch[1]}, ${translated}`;
    }
  }

  return raw;
}
