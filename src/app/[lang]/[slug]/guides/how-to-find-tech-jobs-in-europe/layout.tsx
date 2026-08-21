import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";

const GUIDE_SLUG = "how-to-find-tech-jobs-in-europe";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: langCode, slug } = await params;
  const url = `https://nossy.pro/${langCode}/${slug}/guides/${GUIDE_SLUG}`;
  const alternates: Record<string, string> = { "x-default": `/en/jobs/guides/${GUIDE_SLUG}` };
  for (const l of LANGUAGES) { alternates[l.code] = `/${l.code}/${LANG_SLUGS[l.code]}/guides/${GUIDE_SLUG}`; }
  return {
    title: "How to Find Tech Jobs in Europe (2025 Complete Guide) | NOSSY",
    description: "Complete 2025 guide to finding tech jobs in Europe. Learn about EU Blue Card, top hiring countries (Germany, Netherlands, Ireland), visa requirements, salary expectations, and job search strategies for software engineers.",
    alternates: { canonical: url, languages: alternates },
    robots: { index: true, follow: true },
  };
}

export default function GuideLayout({ children }: { children: React.ReactNode }) { return children; }
