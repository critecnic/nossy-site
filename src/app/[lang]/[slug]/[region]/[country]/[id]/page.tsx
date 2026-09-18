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
