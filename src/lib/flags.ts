// Complete flag emoji mapping for all 57 country slugs
export const FLAGS: Record<string, string> = {
  // Europa
  "albania": "🇦🇱", "austria": "🇦🇹", "belgium": "🇧🇪",
  "bosnia-and-herzegovina": "🇧🇦", "bulgaria": "🇧🇬", "croatia": "🇭🇷",
  "cyprus": "🇨🇾", "czech-republic": "🇨🇿", "denmark": "🇩🇰",
  "estonia": "🇪🇪", "finland": "🇫🇮", "france": "🇫🇷",
  "georgia": "🇬🇪", "germany": "🇩🇪", "greece": "🇬🇷",
  "hungary": "🇭🇺", "iceland": "🇮🇸", "ireland": "🇮🇪",
  "italy": "🇮🇹", "latvia": "🇱🇻", "lithuania": "🇱🇹",
  "luxembourg": "🇱🇺", "malta": "🇲🇹", "moldova": "🇲🇩",
  "montenegro": "🇲🇪", "netherlands": "🇳🇱", "north-macedonia": "🇲🇰",
  "norway": "🇳🇴", "poland": "🇵🇱", "portugal": "🇵🇹",
  "romania": "🇷🇴", "serbia": "🇷🇸", "slovakia": "🇸🇰",
  "slovenia": "🇸🇮", "spain": "🇪🇸", "sweden": "🇸🇪",
  "switzerland": "🇨🇭", "ukraine": "🇺🇦", "united-kingdom": "🇬🇧",
  "remoto-global": "🌍",
  // Ásia
  "bangladesh": "🇧🇩", "china": "🇨🇳", "coreia-do-sul": "🇰🇷",
  "filipinas": "🇵🇭", "hong-kong": "🇭🇰", "india": "🇮🇳",
  "indonesia": "🇮🇩", "japao": "🇯🇵", "malasia": "🇲🇾",
  "nepal": "🇳🇵", "paquistao": "🇵🇰", "singapura": "🇸🇬",
  "sri-lanka": "🇱🇰", "tailandia": "🇹🇭", "taiwan": "🇹🇼",
  "vietna": "🇻🇳",
  // EUA
  "united-states": "🇺🇸",
};

export function getFlag(slug: string): string {
  return FLAGS[slug] || "🏳️";
}
