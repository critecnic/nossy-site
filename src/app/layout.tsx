import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
  description: "Find your next career opportunity worldwide. W-W connects talented professionals with companies across the globe.",
  keywords: ["W-W", "World of Work", "jobs", "careers", "global employment", "hiring"],
  authors: [{ name: "W-W Team" }],
  openGraph: {
    title: "W-W | World of Work",
    description: "Global job platform connecting talent with opportunity worldwide.",
    type: "website",
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
        <Toaster />
      </body>
    </html>
  );
}
