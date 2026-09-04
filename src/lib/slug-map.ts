// TODO: Import in country page when fixing localized URL slugs (Padrao 0220 item 1)
// Maps localized slugs to English slugs for data file lookup
export const SLUG_TO_ENGLISH: Record<string, string> = {
  // Europa
  "alemanha": "germany", "portugal": "portugal", "franca": "france",
  "espanha": "spain", "italia": "italy", "reino-unido": "united-kingdom",
  "irlanda": "ireland", "paises-baixos": "netherlands", "belgica": "belgium",
  "suecia": "sweden", "noruega": "norway", "dinamarca": "denmark",
  "finlandia": "finland", "suiça": "switzerland", "austria": "austria",
  "polonia": "poland", "republica-tcheca": "czech-republic", "hungria": "hungary",
  "romenia": "romania", "grecia": "greece", "croacia": "croatia",
  "bulgaria": "bulgaria", "eslovaquia": "slovakia", "eslovenia": "slovenia",
  "lituania": "lithuania", "letonia": "latvia", "estonia": "estonia",
  "luxemburgo": "luxembourg", "malta": "malta", "chipre": "cyprus",
  "islandia": "iceland", "servia": "serbia", "bosnia-and-herzegovina": "bosnia-and-herzegovina",
  "montenegro": "montenegro", "moldavia": "moldova", "albania": "albania",
  "macedonia-do-norte": "north-macedonia", "ucrania": "ukraine", "georgia": "georgia",
  "remoto-global": "remoto-global",
  // Asia
  "japao": "japan", "india": "india", "china": "china",
  "coreia-do-sul": "south-korea", "singapura": "singapore",
  "hong-kong": "hong-kong", "taiwan": "taiwan", "malasia": "malaysia",
  "tailandia": "thailand", "vietna": "vietnam", "indonesia": "indonesia",
  "filipinas": "philippines", "paquistao": "pakistan", "bangladesh": "bangladesh",
  "sri-lanka": "sri-lanka", "nepal": "nepal",
  // EUA
  "estados-unidos": "united-states",
};
