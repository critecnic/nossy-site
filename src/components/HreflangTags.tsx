// Server component for automatic hreflang tag generation
// Generates <link rel="alternate" hrefLang="..."> for all country-language combos

import { COUNTRIES } from "@/lib/countries";

interface HreflangTagsProps {
  currentCountry?: string;
}

const BASE_URL = "https://ww.jobs";

export function HreflangTags({ currentCountry }: HreflangTagsProps) {
  const links: { rel: string; hreflang: string; href: string }[] = [];

  if (currentCountry) {
    const country = COUNTRIES.find(c => c.code === currentCountry);
    if (country) {
      for (const hl of country.hreflang) {
        links.push({ rel: "alternate", hreflang: hl, href: `${BASE_URL}/${country.code}` });
      }
    }
  }

  links.push({ rel: "alternate", hreflang: "x-default", href: BASE_URL });

  if (!currentCountry) {
    for (const country of COUNTRIES) {
      for (const hl of country.hreflang) {
        links.push({ rel: "alternate", hreflang: hl, href: `${BASE_URL}/${country.code}` });
      }
    }
  }

  return (
    <>
      {links.map((link, i) => (
        <link key={`${link.hreflang}-${i}`} rel={link.rel} hrefLang={link.hreflang} href={link.href} />
      ))}
    </>
  );
}
