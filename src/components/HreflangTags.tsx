// Server component for automatic hreflang tag generation
// Generates <link rel="alternate" hrefLang="..."> for all language-country combos

import { COUNTRIES } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";

interface HreflangTagsProps {
  currentCountry?: string;
  currentLang?: string;
}

const BASE_URL = "https://ww.jobs";

export function HreflangTags({ currentCountry, currentLang }: HreflangTagsProps) {
  const links: { rel: string; hreflang: string; href: string }[] = [];

  if (currentCountry) {
    for (const lang of LANGUAGES) {
      links.push({
        rel: "alternate",
        hreflang: lang.code,
        href: `${BASE_URL}/${lang.code}/${LANG_SLUGS[lang.code]}/${currentCountry}`,
      });
    }
    links.push({ rel: "alternate", hreflang: "x-default", href: `${BASE_URL}/en/jobs/${currentCountry}` });
  } else {
    for (const lang of LANGUAGES) {
      links.push({
        rel: "alternate",
        hreflang: lang.code,
        href: `${BASE_URL}/${lang.code}/${LANG_SLUGS[lang.code]}`,
      });
    }
    links.push({ rel: "alternate", hreflang: "x-default", href: `${BASE_URL}/en/jobs` });
  }

  return (
    <>
      {links.map((link, i) => (
        <link key={`${link.hreflang}-${i}`} rel={link.rel} hrefLang={link.hreflang} href={link.href} />
      ))}
    </>
  );
}