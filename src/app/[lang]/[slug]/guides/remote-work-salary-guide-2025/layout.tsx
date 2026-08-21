import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";

const GUIDE_SLUG = "remote-work-salary-guide-2025";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: langCode, slug } = await params;
  const url = `https://nossy.pro/${langCode}/${slug}/guides/${GUIDE_SLUG}`;
  const alternates: Record<string, string> = { "x-default": `/en/jobs/guides/${GUIDE_SLUG}` };
  for (const l of LANGUAGES) { alternates[l.code] = `/${l.code}/${LANG_SLUGS[l.code]}/guides/${GUIDE_SLUG}`; }
  return {
    title: "Remote Work Salary Guide 2025: Global Tech Pay Ranges | NOSSY",
    description: "Comprehensive 2025 remote work salary guide. Compare tech salaries across regions: US, Europe, Asia, Latin America. Software engineering, data science, DevOps, product management pay ranges and negotiation tips.",
    alternates: { canonical: url, languages: alternates },
    robots: { index: true, follow: true },
  };
}

export default function GuideLayout({ children }: { children: React.ReactNode }) { return children; }
