// PADRÃO 0220 — Server Component (SEO, 2026-09-19): a listagem do país nasce
// COM as vagas no HTML inicial (antes era client-side e o Google via só
// skeletons). A ordem vem de src/lib/country-listing.ts — a MESMA da API —
// com os anúncios exclusivos G4 COMPANY entre os 10 primeiros, remotas de
// todo o catálogo misturadas e rotação determinística por janela de 6h.
// A tradução do idioma chega em background via CountryJobsClient (mesmo
// padrão das páginas de detalhe) — SSR fica rápido, sem chamadas externas.
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getRegionName } from "@/lib/shared";
import { getCountryNameTranslated } from "@/lib/country-names";
import { getCountryListing } from "@/lib/country-listing";
import { safeJsonLd } from "@/lib/jsonld";
import countriesData from "@/data/countries.json";
import CountryJobsClient from "./CountryJobsClient";

const PER = 18;

// ISR de 1h: HTML servido da CDN (velocidade << 2s) e revalidado em
// background; a rotação de 6h da listagem permanece consistente com a API.
export const revalidate = 3600;

// OTIMIZAÇÃO VERCEL (2026-09-30): revalidate SEM generateStaticParams fazia
// o Next 15 tratar esta rota como dinâmica (no-store) — cada fetch de robô ou
// usuário gerava 1 invocação de função (1M/mês estourou na Vercel Hobby).
// Com dynamicParams + generateStaticParams([]) a rota vira ISR sob demanda:
// o 1º request renderiza e cacheia na CDN; os seguintes são cache hits com
// ZERO invocações até o revalidate expirar.
//
// REFINO (2026-10-02): em vez de [] (on-demand — a 1ª visita de cada
// país/idioma custava 1 invocation), o GSP ENUMERA os países COM arquivo de
// dados próprio (~58, lido de data/site no build) — × 22 idiomas do layout
// pai ≈ 1,3 mil páginas SSG ● PRERENDERIZADAS: HTML nasce no deploy e a
// borda responde HIT desde o 1º acesso (x-nextjs-cache MISS->HIT validado
// localmente). Países do catálogo mundial sem arquivo continuam ISR
// on-demand via dynamicParams. O regex casa só ARQUIVOS PRINCIPAIS:
// nomes com 2º "_" (remote-extra/idmap/index/chunks _pN) não casam porque
// a classe [a-z0-9-] não inclui "_"; all-digit (latest_20) é descartado.
export const dynamicParams = true;
export function generateStaticParams(): { region: string; country: string }[] {
  const dir = path.join(process.cwd(), "data", "site");
  const out: { region: string; country: string }[] = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      const m = f.match(/^([a-z0-9-]+)_([a-z0-9-]+)\.json$/i);
      if (!m || /^\d+$/.test(m[2])) continue;
      out.push({ region: m[1].toLowerCase(), country: m[2].toLowerCase() });
    }
  } catch {
    // sem data/site no build — segue ISR on-demand para todos
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; region: string; country: string }>;
}): Promise<Metadata> {
  const { lang: langCode, slug, region: rc, country: cc } = await params;
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const countryInfo = (countriesData as any[]).find(c => c.slug === cc);
  const countryName = getCountryNameTranslated(cc, lang, countryInfo?.name || cc);
  const regionName = getRegionName(lang, rc);
  const T = i18n[lang] || i18n["en"];

  const title = `${T.jobsIn.replace("{0}", countryName)} | NOSSY`;
  const description =
    lang === "en"
      ? `Tech jobs in ${countryName}, ${regionName}: software engineering, data science, cloud, AI and remote positions. Apply directly — no sign-up needed.`
      : `${T.jobsIn.replace("{0}", countryName)} — ${regionName}. NOSSY.`;

  const url = `https://nossy.pro/${langCode}/${slug}/${rc}/${cc}`;

  const alternates: Record<string, string> = { "x-default": `/en/jobs/${rc}/${cc}` };
  for (const l of LANGUAGES) {
    alternates[l.code] = `/${l.code}/${LANG_SLUGS[l.code]}/${rc}/${cc}`;
  }

  return {
    title,
    description,
    alternates: { canonical: url, languages: alternates },
    robots: { index: true, follow: true },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string; region: string; country: string }>;
}) {
  const { lang: langCode, slug, region: rc, country: cc } = await params;
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;

  let jobs: Record<string, any>[] = [];
  let total = 0;
  let totalPages = 1;
  try {
    const data = await getCountryListing(`${rc}_${cc}`, 1, PER);
    jobs = data.jobs;
    total = data.total;
    totalPages = data.totalPages;
  } catch {
    // fallback: cliente tenta via API (comportamento antigo)
  }

  const countryInfo = (countriesData as any[]).find(c => c.slug === cc);
  const countryName = getCountryNameTranslated(cc, lang, countryInfo?.name || cc);
  const regionName = getRegionName(lang, rc);
  const T = i18n[lang] || i18n["en"];

  const homeUrl = `https://nossy.pro/${langCode}/${slug}`;
  const regionUrl = `${homeUrl}/${rc}`;
  const countryUrl = `${regionUrl}/${cc}`;

  // ItemList do Google: as vagas do 1º render (G4 COMPANY incluídas no top 10)
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: T.jobsIn.replace("{0}", countryName),
    numberOfItems: jobs.length,
    itemListElement: jobs.slice(0, 10).map((j, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://nossy.pro/${langCode}/${slug}/${rc}/${cc}/${j.id}`,
      name: String(j.title || ""),
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "NOSSY", item: "https://nossy.pro/" },
      { "@type": "ListItem", position: 2, name: regionName, item: regionUrl },
      { "@type": "ListItem", position: 3, name: countryName, item: countryUrl },
    ],
  };

  return (
    <>
      {jobs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumb) }} />
      <CountryJobsClient
        initialJobs={jobs as any}
        initialTotal={total}
        initialTotalPages={totalPages}
        langCode={langCode}
        rc={rc}
        cc={cc}
      />
    </>
  );
}
