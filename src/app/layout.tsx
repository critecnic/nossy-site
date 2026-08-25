import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { TOTAL_JOBS } from "@/lib/countries";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://nossy.pro"),
  title: {
    default: "NOSSY | " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs Worldwide | Seek and you shall find.",
    template: "%s | NOSSY",
  },
  description: "Browse " + TOTAL_JOBS.toLocaleString() + "+ tech job vacancies across 60 countries in Europe, Asia and USA. Remote, on-site and hybrid positions. Free to browse. Find your next career opportunity on NOSSY.",
  keywords: ["jobs", "tech jobs", "job search", "careers", "remote jobs", "NOSSY", "seek and find", "jobs in Europe", "jobs in Asia", "jobs in USA", "software engineer jobs", "data science jobs", "cloud jobs", "AI jobs", "developer jobs", "IT vacancies 2025", "work from home jobs"],
  authors: [{ name: "NOSSY" }],
  creator: "NOSSY",
  publisher: "NOSSY",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nossy.pro",
    siteName: "NOSSY",
    title: "NOSSY | " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs Worldwide",
    description: "Browse " + TOTAL_JOBS.toLocaleString() + "+ tech job vacancies across 60 countries. Remote, on-site and hybrid positions.",
    images: [{ url: "https://nossy.pro/og/og-default.png", width: 1200, height: 630, alt: "NOSSY - " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs Worldwide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOSSY | " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs",
    description: "Find your dream tech job across Europe, Asia and USA. NOSSY - Seek and you shall find.",
    images: ["https://nossy.pro/og/og-default.png"],
  },
  alternates: {
    canonical: "https://nossy.pro",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0f172a" />
        <JsonLd />
      </head>
      <body className={geistSans.variable + " antialiased bg-gray-50 text-gray-900"}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}