import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { COUNTRIES, TOTAL_JOBS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const langCodes = LANGUAGES.map(l => l.code);

// Build hreflang alternates for all 12 countries x all 14 languages
const hreflangMap: Record<string, string> = {};
COUNTRIES.forEach(c => {
  LANGUAGES.forEach(l => {
    hreflangMap[`${l.code}-${c.code}`] = `https://workversely.com/${l.code}/${LANG_SLUGS[l.code]}/${c.code}`;
  });
});

// Language-only alternates
LANGUAGES.forEach(l => {
  hreflangMap[l.code] = `https://workversely.com/${l.code}/${LANG_SLUGS[l.code]}`;
});

export const metadata: Metadata = {
  title: {
    default: "Work Versaly | Jobs in 12 Countries | Free Global Job Platform",
    template: "%s | Work Versaly",
  },
  description: "Work Versaly by CRITECNIC: Browse 40,700+ job vacancies across USA, UK, Germany, Canada, Australia, Japan, Switzerland, France, Netherlands, Singapore, UAE, Brazil. Free job search with real salaries and top companies.",
  keywords: [
    "jobs", "job search", "careers", "employment", "hiring", "vacancies",
    "job portal", "job board", "job listings", "apply for jobs", "work abroad",
    "international jobs", "remote jobs", "job vacancies 2025",
    "jobs in USA", "jobs in UK", "jobs in Germany", "jobs in Canada",
    "jobs in Australia", "jobs in Japan", "jobs in Switzerland",
    "jobs in France", "jobs in Netherlands", "jobs in Singapore",
    "jobs in UAE", "jobs in Brazil",
    "Work Versaly", "CRITECNIC", "workversely.com", "global job platform",
  ],
  authors: [{ name: "CRITECNIC" }],
  creator: "CRITECNIC",
  publisher: "CRITECNIC",
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL("https://workversely.com"),
  alternates: {
    canonical: "/en/jobs",
    languages: {
      "x-default": "https://workversely.com/en/jobs",
      ...hreflangMap,
    },
  },
  openGraph: {
    title: "Work Versaly | Jobs in 12 Countries",
    description: "Browse 22,200+ job vacancies across 12 developed countries. Free job search with real salaries and top companies.",
    type: "website",
    siteName: "Work Versaly",
    url: "https://workversely.com",
    locale: "en_US",
    images: [{ url: "https://workversely.com/og-image.png", width: 1200, height: 630, alt: "Work Versaly - Global Job Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work Versaly | Jobs in 12 Countries",
    description: "Browse 22,200+ job vacancies across 12 countries. Free global job search.",
    images: ["https://workversely.com/og-image.png"],
    creator: "@workversely",
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: { google: "google-site-verification=YOUR_VERIFICATION_CODE" },
  category: "employment",
  classification: "job search portal",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CRITECNIC",
    "legalName": "CRITECNIC",
    "alternateName": ["Work Versaly"],
    "url": "https://workversely.com",
    "logo": "https://workversely.com/logo.png",
    "description": "Global job platform by CRITECNIC connecting talent with opportunities in 12 developed countries. Free job search with 22,200+ vacancies.",
    "sameAs": [],
    "foundingDate": "2025",
    "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 10, "maxValue": 50 },
  });

  const websiteLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Work Versaly",
    "alternateName": "Work Versaly by CRITECNIC",
    "url": "https://workversely.com",
    "description": "Global job platform with 22,200+ vacancies in 12 countries",
    "inLanguage": langCodes,
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": "https://workversely.com/search?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  });

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://workversely.com/en/jobs" },
      { "@type": "ListItem", "position": 2, "name": "All Countries", "item": "https://workversely.com/en/jobs#countries" },
    ],
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationLd }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteLd }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbLd }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
