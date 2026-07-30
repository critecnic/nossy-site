import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "W-W | World of Work - Global Job Platform",
  description: "Find your next career opportunity worldwide. Jobs in 20+ countries with local salary information. India, USA, China, Brazil and more.",
  keywords: ["W-W", "World of Work", "jobs", "careers", "global employment", "hiring", "jobs in India", "jobs in USA", "jobs in China", "international jobs"],
  authors: [{ name: "W-W Team" }],
  openGraph: {
    title: "W-W | World of Work - Global Job Platform",
    description: "Connect with top companies across 20+ countries. Multi-currency salaries, hreflang SEO, Google Jobs optimized.",
    type: "website",
    siteName: "W-W World of Work",
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
  alternates: {
    canonical: "https://ww.jobs",
    languages: {
      "en-in": "https://ww.jobs/in",
      "hi-in": "https://ww.jobs/in",
      "en-us": "https://ww.jobs/us",
      "zh-cn": "https://ww.jobs/cn",
      "pt-br": "https://ww.jobs/br",
      "en-gb": "https://ww.jobs/gb",
      "de-de": "https://ww.jobs/de",
      "fr-fr": "https://ww.jobs/fr",
      "ja-jp": "https://ww.jobs/jp",
      "en-ca": "https://ww.jobs/ca",
      "en-au": "https://ww.jobs/au",
      "es-mx": "https://ww.jobs/mx",
      "id-id": "https://ww.jobs/id",
      "ko-kr": "https://ww.jobs/kr",
      "ar-sa": "https://ww.jobs/sa",
      "en-ae": "https://ww.jobs/ae",
      "es-es": "https://ww.jobs/es",
      "it-it": "https://ww.jobs/it",
      "pt-pt": "https://ww.jobs/pt",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
