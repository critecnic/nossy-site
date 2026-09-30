// PADRÃO 0220 — Server Component (SEO): busca a vaga DIRETO dos dados
// privados com a MESMA fonte do JSON-LD/metadata (job-lookup + pool remoto)
// e entrega o HTML inicial COMPLETO ao Google e robôs — título, empresa,
// salário, descrição e contatos já presentes no 1º render (antes a página
// nascia com skeleton client-side e o conteúdo só aparecia após o fetch).
// A versão traduzida no idioma da URL chega em background via JobDetailClient.
import { findJobFast } from "@/lib/job-lookup";
import { findJobInPoolsSync } from "@/lib/remote-pool";
import { isCompetitorJob } from "@/lib/competitors";
import JobDetailClient from "./JobDetailClient";

// OTIMIZAÇÃO VERCEL (2026-09-30): esta rota era 100% dinâmica (sem revalidate
// e sem generateStaticParams) — cada fetch de robô/usuário = 1 invocação de
// função; com 62.687 URLs nos sitemaps, estourou 1M invocações/mês na Vercel
// Hobby (pausa 402). Padrão ISR sob demanda: 1º request renderiza e cacheia
// na CDN por 24h (conteúdo da vaga não muda); demais requests = cache hit com
// ZERO invocações. generateStaticParams([]) é o que ativa o ISR no Next 15.
export const revalidate = 86400;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number | null; salaryMax: number | null;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  paywall: boolean; contactEmail: string; regiao?: string;
  contactPhone?: string;
}

export default async function JobDetailPage({ params }: {
  params: Promise<{ lang: string; slug: string; region: string; country: string; id: string }>;
}) {
  const { lang: langCode, region: rc, country: cc, id: jobId } = await params;

  // Mesma busca do layout (JSON-LD): índice id->chunk do build + pool remoto
  // global para países do catálogo mundial sem arquivo próprio.
  const job = (findJobFast<Job>(`${rc}_${cc}`, jobId) || findJobInPoolsSync(jobId)) as Job | null;

  // Portais concorrentes não exibem vaga (metadata noindex fica no layout)
  if (job && isCompetitorJob(job)) {
    return <JobDetailClient initialJob={null} blocked langCode={langCode} rc={rc} cc={cc} jobId={jobId} />;
  }

  return <JobDetailClient initialJob={job} langCode={langCode} rc={rc} cc={cc} jobId={jobId} />;
}
