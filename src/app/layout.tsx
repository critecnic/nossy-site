import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NOSSY | 44,000+ Tech Jobs Worldwide",
  description: "Find tech jobs in 60 countries across Europe, Asia and the USA. Remote, hybrid and on-site positions at top companies. Available in 22 languages.",
  keywords: ["tech jobs", "software engineering jobs", "remote jobs", "jobs in Europe", "jobs in Asia", "IT jobs", "developer jobs", "NOSSY"],
  authors: [{ name: "NOSSY" }],
  metadataBase: new URL("https://nossy.pro"),
  openGraph: {
    type: "website",
    siteName: "NOSSY",
    title: "NOSSY | 44,000+ Tech Jobs Worldwide",
    description: "Find tech jobs in 60 countries. Remote, hybrid and on-site positions at top companies.",
    url: "https://nossy.pro",
    images: [{ url: "/og/og-default.png", width: 1200, height: 630, alt: "NOSSY - Tech Jobs Worldwide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOSSY | 44,000+ Tech Jobs Worldwide",
    description: "Find tech jobs in 60 countries. Remote, hybrid and on-site positions.",
    images: ["/og/og-default.png"],
  },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><meta name="google" content="notranslate" /></head>
      <body className={geist.className} style={{ margin: 0 }}>
        <ErrorBoundary>{children}</ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
