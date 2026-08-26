import { NextResponse } from "next/server";
import { needsServerTranslation, translateJobListFields, translateJobFull } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { promises as fsp } from "fs";
import path from "path";

export async function GET() {
  const report: Record<string, any> = { timestamp: new Date().toISOString() };

  // 1. Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  report.geminiApiKeySet = !!apiKey;
  report.geminiApiKeyPrefix = apiKey ? apiKey.slice(0, 8) + '...' : 'NOT SET';
  report.allEnvKeys = Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API') || k.includes('KEY'));

  // 2. Test actual Gemini call
  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Translate to English: Ola mundo' }] }],
          generationConfig: { temperature: 0.1 }
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      report.geminiHttpStatus = res.status;
      const body = await res.json().catch(() => null);
      report.geminiResponse = body ? {
        hasCandidates: !!body.candidates,
        text: body.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 100) || 'EMPTY',
        error: body.error || null,
      } : 'PARSE ERROR';
    } catch (e: any) {
      report.geminiTestError = e.message;
    }
  }

  // 3. Test translation function
  try {
    const testJob = { id: 999, title: 'Desenvolvedor Full Stack', company: 'Empresa Brasileira', location: 'Sao Paulo, Brasil' };
    const result = await translateJobListFields([testJob], 'en' as Lang);
    report.translationTest = {
      ok: result.ok,
      translatedTitle: result.map.get(999)?.title || 'NOT TRANSLATED',
      originalTitle: 'Desenvolvedor Full Stack',
    };
  } catch (e: any) {
    report.translationTestError = e.message;
  }

  // 4. Check data files
  const dataDir = path.join(process.cwd(), 'public', 'data');
  try {
    const files = await fsp.readdir(dataDir);
    const euaFiles = files.filter(f => f.startsWith('eua_'));
    report.dataFiles = {
      total: files.length,
      euaFiles: euaFiles,
      hasLatest20: files.includes('latest_20.json') || files.includes('latest_20.json.gz'),
    };
    if (euaFiles.length > 0) {
      const euaJson = euaFiles.find(f => f.endsWith('.json'));
      if (euaJson) {
        const raw = await fsp.readFile(path.join(dataDir, euaJson), 'utf-8');
        const jobs = JSON.parse(raw);
        report.euaJobsCount = jobs.length;
      }
    }
  } catch (e: any) {
    report.dataFilesError = e.message;
  }

  // 5. Check language config
  report.languages = LANGUAGES.map(l => l.code);
  report.needsTranslation = {
    'en': needsServerTranslation('en'),
    'fr': needsServerTranslation('fr'),
    'de': needsServerTranslation('de'),
    'pt-br': needsServerTranslation('pt-br'),
  };

  return NextResponse.json(report, {
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
  });
}
