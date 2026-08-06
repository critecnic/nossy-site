import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { TOTAL_JOBS } from "@/lib/countries";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Work Versaly | " + TOTAL_JOBS.toLocaleString() + "+ Tech Jobs Worldwide | CRITECNIC",
  description: "Work Versaly by CRITECNIC: Browse " + TOTAL_JOBS.toLocaleString() + "+ tech job vacancies across Europe, Asia and USA. Free global job search with real salaries and top companies.",
  keywords: ["jobs", "tech jobs", "job search", "careers", "remote jobs", "Work Versaly", "CRITECNIC", "jobs in Europe", "jobs in Asia", "jobs in USA"],
  authors: [{ name: "CRITECNIC" }],
  creator: "CRITECNIC",
  publisher: "CRITECNIC",
  metadataBase: new URL("https://workversely.com"),
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={geistSans.variable + " antialiased bg-gray-50 text-gray-900"}>
        {children}
      </body>
    </html>
  );
}
