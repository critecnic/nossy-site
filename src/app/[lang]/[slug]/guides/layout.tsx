import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: langCode, slug } = await params;
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const url = `https://nossy.pro/${langCode}/${slug}/guides`;

  return {
    title: `Tech Career Guides | NOSSY`,
    description: "Free guides on finding tech jobs, salary negotiation, remote work, and in-demand skills. Expert career advice for software engineers, data scientists, and tech professionals.",
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
