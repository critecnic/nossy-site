import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";

const GUIDE_SLUG = "top-tech-skills-demand";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: langCode, slug } = await params;
  const url = `https://nossy.pro/${langCode}/${slug}/guides/${GUIDE_SLUG}`;
  const alternates: Record<string, string> = { "x-default": `/en/jobs/guides/${GUIDE_SLUG}` };
  for (const l of LANGUAGES) { alternates[l.code] = `/${l.code}/${LANG_SLUGS[l.code]}/guides/${GUIDE_SLUG}`; }
  return {
    title: "Top Tech Skills in Demand 2025: AI, Cloud, Cybersecurity & More | NOSSY",
    description: "Discover the most in-demand tech skills for 2025. AI/ML, cloud computing, cybersecurity, full-stack development, data engineering, and platform engineering. Career paths, learning resources, and job market outlook.",
    alternates: { canonical: url, languages: alternates },
    robots: { index: true, follow: true },
  };
}

export default function GuideLayout({ children }: { children: React.ReactNode }) { return children; }
