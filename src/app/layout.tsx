import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { COUNTRIES, TOTAL_JOBS } from "@/lib/countries";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Build hreflang alternates for all 20 countries dynamically
const hreflangMap: Record<string, string> = {};
COUNTRIES.forEach(c => {
  c.hreflang.forEach(hl => {
    hreflangMap[hl] = `https://ww.jobs/${c.code}`;
  });
});

export const metadata: Metadata = {
  title: {
    default: "W-W | World of Work - Find Jobs in 20 Countries | Free Global Job Platform",
    template: "%s | W-W World of Work",
  },
  description: "W-W World of Work: Browse 15,400+ job vacancies across 20 countries. Free job search in India, USA, Brazil, China, Germany, France, Japan & more. Real salaries, top companies. No paywall on job details.",
  keywords: [
    // Global keywords
    "jobs", "job search", "careers", "employment", "hiring", "vacancies",
    "job portal", "job board", "job listings", "apply for jobs", "work abroad",
    "international jobs", "global employment", "remote jobs", "job vacancies 2025",
    // Country-specific (high volume)
    "jobs in India", "vagas de emprego Brasil", "jobs in Nigeria", "jobs in Indonesia",
    "jobs in Mexico", "jobs in Turkey", "empleo España", "travail France",
    "Stellenangebote Deutschland", "offerte di lavoro Italia", "emprego Portugal",
    // Sector keywords
    "technology jobs", "finance jobs", "healthcare jobs", "engineering jobs",
    "data science jobs", "marketing jobs", "design jobs", "management jobs",
    // W-W brand
    "W-W", "World of Work", "ww.jobs", "global job platform",
  ],
  authors: [{ name: "W-W World of Work" }],
  creator: "W-W World of Work",
  publisher: "W-W World of Work",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ww.jobs"),
  alternates: {
    canonical: "/",
    languages: {
      "x-default": "https://ww.jobs/",
      ...hreflangMap,
    },
  },
  openGraph: {
    title: "W-W | World of Work - Find Jobs in 20 Countries",
    description: "Browse 15,400+ job vacancies across 20 countries. Free global job search with real salaries and top companies.",
    type: "website",
    siteName: "W-W World of Work",
    url: "https://ww.jobs",
    locale: "en_US",
    images: [{
      url: "https://ww.jobs/og-image.png",
      width: 1200,
      height: 630,
      alt: "W-W World of Work - Global Job Platform",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "W-W | World of Work - Find Jobs in 20 Countries",
    description: "Browse 15,400+ job vacancies across 20 countries. Free global job search.",
    images: ["https://ww.jobs/og-image.png"],
    creator: "@wwjobs",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification=YOUR_VERIFICATION_CODE",
  },
  category: "employment",
  classification: "job search portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate Organization + WebSite + SearchAction JSON-LD for Google
  const organizationLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "W-W World of Work",
    "alternateName": ["W-W", "World of Work", "WW Jobs"],
    "url": "https://ww.jobs",
    "logo": "https://ww.jobs/logo.png",
    "description": "Global job platform connecting talent with opportunities in 20 countries worldwide. Free job search with 15,400+ vacancies.",
    "sameAs": [],
    "foundingDate": "2025",
    "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 10, "maxValue": 50 },
  });

  const websiteLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "W-W World of Work",
    "alternateName": "W-W",
    "url": "https://ww.jobs",
    "description": "Global job platform with 15,400+ vacancies in 20 countries",
    "inLanguage": ["en", "pt", "es", "fr", "de", "zh", "ja", "ar", "hi", "ko", "it", "id", "tr"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://ww.jobs/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  });

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ww.jobs/" },
      { "@type": "ListItem", "position": 2, "name": "All Countries", "item": "https://ww.jobs/#countries" },
    ],
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="google-adsense-account" content="" />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* Global JSON-LD for Google Rich Results */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationLd }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteLd }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbLd }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
