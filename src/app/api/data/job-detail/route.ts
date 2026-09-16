import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation, translateJobFull } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { shouldHavePaywall } from "@/lib/shared";
import { maskJobIfLocked } from "@/lib/paywall-mask";
import { findJobFastAsync } from "@/lib/job-lookup";
import { expandLocationNames } from "@/lib/location-names";


const apiRateLimits: Record<string, number[]> = {};
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!apiRateLimits[ip]) apiRateLimits[ip] = [];
  apiRateLimits[ip] = apiRateLimits[ip].filter(t => now - t < 60000);
  if (apiRateLimits[ip].length >= 60) return true;
  apiRateLimits[ip].push(now);
  return false;
}

async function findJob(baseName: string, jobId: string): Promise<any | null> {
  // Busca rápida: índice id->chunk gerado no build + cache em memória
  // (sem isso, países fatiados como os EUA exigiam até 19 leituras JSON)
  return findJobFastAsync<any>(baseName, jobId);
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const file = req.nextUrl.searchParams.get("file");
  const jobId = req.nextUrl.searchParams.get("id");
  const langCode = req.nextUrl.searchParams.get("lang") || 'pt-br';
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || 'pt-br') as Lang;

  if (!file || !jobId) {
    return NextResponse.json({ error: "Missing file or id" }, { status: 400 });
  }

  const baseName = file.replace('.json', '');

  // Validate base name
  if (!/^[a-z0-9][a-z0-9\-_]*$/.test(baseName)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const job = await findJob(baseName, jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Premium 0220: vagas com paywall têm resposta POR-USUÁRIO (máscara
    // server-side + cache privado) — nunca público/CDN, senão a resposta
    // mascarada ou desbloqueada vazaría para outros visitantes.
    const paywalled = shouldHavePaywall(job).paywall;
    const cacheForJob = (paywalled: boolean) =>
      paywalled ? "private, no-store" : "public, s-maxage=3600, stale-while-revalidate=600";

    // Portuguese - retorna sem traduzir
    if (!needsServerTranslation(lang)) {
      // Nomes COMPLETOS no texto da vaga (requisito do dono): expande
      // abreviações de estado/país na descrição e na localização
      const expanded = {
        ...job,
        description: expandLocationNames(job.description, {
          countrySlug: job.country,
          countryName: job.countryName,
          lang,
        }),
        location: expandLocationNames(job.location, {
          countrySlug: job.country,
          countryName: job.countryName,
          lang,
        }),
      };
      const safe = maskJobIfLocked(expanded, (n) => req.cookies.get(n)?.value);
      return new NextResponse(JSON.stringify(safe), {
        headers: { "Content-Type": "application/json", "Cache-Control": cacheForJob(paywalled) },
      });
    }

    // Traduz via Google GTX + MyMemory
    console.log(`[NOSSY API] Job detail id=${jobId} file=${file} lang=${lang}`);
    const translated = await translateJobFull(job, lang);

    const result = {
      ...job,
      title: translated.title,
      description: expandLocationNames(translated.description, {
        countrySlug: job.country,
        countryName: job.countryName,
        lang,
      }),
      company: translated.company,
      location: expandLocationNames(translated.location, {
        countrySlug: job.country,
        countryName: job.countryName,
        lang,
      }),
    };

    // Máscara DEPOIS da tradução (o campo company traduzido não pode vazar)
    const safe = maskJobIfLocked(result, (n) => req.cookies.get(n)?.value);

    const cacheHeader = translated.ok && !paywalled
      ? "public, s-maxage=3600, stale-while-revalidate=600"
      : "no-store";

    return new NextResponse(JSON.stringify(safe), {
      headers: { "Content-Type": "application/json", "Cache-Control": cacheHeader },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Job detail error:', err.message);
    // On error, return job without translation rather than 404
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
