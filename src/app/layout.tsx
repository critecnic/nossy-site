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
  metadataBase: new URL("https://nossy.pro"),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "NOSSY",
    title: "NOSSY | " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs Worldwide | Seek and you shall find.",
    description: "Browse " + TOTAL_JOBS.toLocaleString() + "+ tech job vacancies across Europe, Asia and USA. NOSSY - Seek and you shall find.",
    url: "https://nossy.pro",
    images: [{ url: "/og/og-default.png", width: 1200, height: 630, alt: "NOSSY - 45,039+ Tech Jobs Worldwide" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOSSY | " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs",
    description: "Find your dream tech job across Europe, Asia and USA. NOSSY - Seek and you shall find.",
    images: ["/og/og-default.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NOSSY",
    "alternateName": "NOSSY Jobs",
    "url": "https://nossy.pro",
    "description": "Browse " + TOTAL_JOBS + "+ tech job vacancies across Europe, Asia and USA",
    "publisher": { "@type": "Organization", "name": "NOSSY" },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nossy.pro/en/jobs?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "inLanguage": ["en", "pt-br", "pt-pt", "es", "fr", "de", "it", "nl", "pl", "ru", "zh", "ja", "ko", "hi", "bn", "ar", "tr", "vi", "th", "ur", "tl", "sw"],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function HrefLangTags() {
  const links = [
    { hreflang: "x-default", href: "https://nossy.pro/en/jobs" },
    { hreflang: "en", href: "https://nossy.pro/en/jobs" },
    { hreflang: "pt-br", href: "https://nossy.pro/pt-br/vagas" },
    { hreflang: "es", href: "https://nossy.pro/es/empleos" },
    { hreflang: "fr", href: "https://nossy.pro/fr/emplois" },
    { hreflang: "de", href: "https://nossy.pro/de/stellenangebote" },
    { hreflang: "it", href: "https://nossy.pro/it/lavoro" },
    { hreflang: "nl", href: "https://nossy.pro/nl/vacatures" },
    { hreflang: "pl", href: "https://nossy.pro/pl/praca" },
    { hreflang: "ru", href: "https://nossy.pro/ru/rabota" },
    { hreflang: "zh", href: "https://nossy.pro/zh/gongzuo" },
    { hreflang: "ja", href: "https://nossy.pro/ja/shigoto" },
    { hreflang: "ko", href: "https://nossy.pro/ko/chae-yong" },
    { hreflang: "hi", href: "https://nossy.pro/hi/naukri" },
    { hreflang: "bn", href: "https://nossy.pro/bn/chakri" },
    { hreflang: "ar", href: "https://nossy.pro/ar/wazaif" },
    { hreflang: "tr", href: "https://nossy.pro/tr/is-ilanlari" },
    { hreflang: "vi", href: "https://nossy.pro/vi/viec-lam" },
    { hreflang: "th", href: "https://nossy.pro/th/ngan-thai" },
    { hreflang: "ur", href: "https://nossy.pro/ur/mulazmat" },
    { hreflang: "tl", href: "https://nossy.pro/tl/trabaho" },
    { hreflang: "sw", href: "https://nossy.pro/sw/kazi" },
  ];
  return <>{links.map(l => <link key={l.hreflang} rel="alternate" hrefLang={l.hreflang} href={l.href} />)}</>;
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="google" content="notranslate" />
        <HrefLangTags />
        <JsonLd />
      </head>
      <body className={geistSans.variable + " antialiased bg-gray-50 text-gray-900"}>
        {children}
      </body>
    </html>
  );
}
