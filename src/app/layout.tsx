import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { TOTAL_JOBS } from "@/lib/countries";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NOSSY | " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs Worldwide | Seek and you shall find.",
  description: "NOSSY - Seek and you shall find. Browse " + TOTAL_JOBS.toLocaleString() + "+ tech job vacancies across Europe, Asia and USA. Free global job search with real salaries and top companies. Find remote, hybrid and on-site positions in Software Engineering, Data Science, Cloud, AI and more.",
  keywords: ["jobs", "tech jobs", "job search", "careers", "remote jobs", "NOSSY", "seek and find", "jobs in Europe", "jobs in Asia", "jobs in USA", "software engineer jobs", "data science jobs", "cloud jobs", "AI jobs", "developer jobs", "IT vacancies 2025", "work from home jobs"],
  authors: [{ name: "NOSSY" }],
  creator: "NOSSY",
  publisher: "NOSSY",
  metadataBase: new URL("https://nossy.com"),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "NOSSY",
    title: "NOSSY | " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs Worldwide | Seek and you shall find.",
    description: "Browse " + TOTAL_JOBS.toLocaleString() + "+ tech job vacancies across Europe, Asia and USA. NOSSY - Seek and you shall find.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOSSY | " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs",
    description: "Find your dream tech job across Europe, Asia and USA. NOSSY - Seek and you shall find.",
  },
};

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NOSSY",
    "alternateName": "NOSSY Jobs",
    "url": "https://nossy.com",
    "description": "Browse " + TOTAL_JOBS + "+ tech job vacancies across Europe, Asia and USA",
    "publisher": { "@type": "Organization", "name": "NOSSY" },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nossy.com/en/jobs?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "inLanguage": ["en", "pt-br", "pt-pt", "es", "fr", "de", "it", "nl", "pl", "ru", "zh", "ja", "ko", "hi", "bn", "ar", "tr", "vi", "th", "ur", "tl", "sw"],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function HrefLangTags() {
  const links = [
    { hreflang: "en", href: "/en/jobs" },
    { hreflang: "pt-BR", href: "/pt-br/vagas" },
    { hreflang: "es", href: "/es/empleos" },
    { hreflang: "fr", href: "/fr/emplois" },
    { hreflang: "de", href: "/de/stellenangebote" },
    { hreflang: "x-default", href: "/en/jobs" },
  ];
  return <>{links.map(l => <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />)}</>;
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0f172a" />
        <HrefLangTags />
        <JsonLd />
      </head>
      <body className={geistSans.variable + " antialiased bg-gray-50 text-gray-900"}>
        {children}
      </body>
    </html>
  );
}
