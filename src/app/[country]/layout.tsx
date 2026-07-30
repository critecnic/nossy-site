import { Metadata } from "next";
import { COUNTRIES, getCountry } from "@/lib/countries";

// Pre-generate all country pages for static generation
export function generateStaticParams() {
  return COUNTRIES.map(c => ({ country: c.code }));
}

// Dynamic metadata per country for Google SEO
export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country: code } = await params;
  const country = getCountry(code);

  if (!country) {
    return { title: 'Country Not Found | W-W' };
  }

  const title = country.seoTitle;
  const description = country.seoDescription;
  const url = `https://ww.jobs/${country.code}`;

  // Build hreflang for this specific country page
  const hreflangMap: Record<string, string> = { "x-default": url };
  COUNTRIES.forEach(c => {
    c.hreflang.forEach(hl => {
      hreflangMap[hl] = `https://ww.jobs/${c.code}`;
    });
  });

  return {
    title,
    description,
    keywords: country.seoKeywords,
    alternates: {
      canonical: url,
      languages: hreflangMap,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'W-W World of Work',
      locale: country.hreflang[0]?.replace('-', '_') || 'en_US',
      images: [{
        url: `https://ww.jobs/og-${country.code}.png`,
        width: 1200,
        height: 630,
        alt: `${country.name} Jobs - W-W World of Work`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://ww.jobs/og-${country.code}.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function CountryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
