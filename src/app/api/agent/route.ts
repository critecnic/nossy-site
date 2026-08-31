import { NextRequest, NextResponse } from "next/server";
import { promises as fsp } from "fs";
import path from "path";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "nossy-admin-2024";
const DATA_DIR = path.join(process.cwd(), "public", "data");

function auth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token === ADMIN_TOKEN;
}

// ═══════════════════════════════════════════════════════════════════════
// NOSSY AGENT — Comunicação direta para diagnóstico e reparo em tempo real
// ═══════════════════════════════════════════════════════════════════════
//
// GET  /api/agent                  → Diagnóstico completo
// POST /api/agent                  → Executar ação específica
//
// AÇÕES (POST body { action: "..." }):
//   ping              → Teste de conexão
//   diagnose          → Mesmo que GET
//   test-gemini       → Testa API Gemini com tradução real
//   test-translation  → Testa pipeline completa de tradução
//   test-usa          → Testa endpoint EUA (deve retornar 200)
//   test-route        → Testa qualquer rota API { route: "/api/data/latest?lang=en" }
//   env-info          → Mostra quais env vars estão configuradas
//   list-files        → Lista arquivos de dados com tamanhos
//   split-files       → Divide arquivos JSON >4MB em chunks
//   file-info         → Info de um arquivo específico { file: "nome.json" }
//   i18n-check        → Verifica chaves i18n para uma língua { lang: "en" }
//
// Auth: Authorization: Bearer <ADMIN_TOKEN>
// ═══════════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return diagnose(req);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { action } = body;
    switch (action) {
      case "ping": return NextResponse.json({ status: "ok", time: new Date().toISOString(), uptime: Math.round(process.uptime()), agent: "nossy-agent-v1" });
      case "diagnose": return diagnose(req);
      case "test-gemini": return testGemini();
      case "test-translation": return testTranslation(req);
      case "test-usa": return testUSA(req);
      case "test-route": return testRoute(body, req);
      case "env-info": return envInfo();
      case "list-files": return listFiles();
      case "split-files": return splitLargeFiles();
      case "file-info": return fileInfo(body);
      case "i18n-check": return i18nCheck(body);
      default: return NextResponse.json({ error: `Ação desconhecida: ${action}`, validActions: ["ping","diagnose","test-gemini","test-translation","test-usa","test-route","env-info","list-files","split-files","file-info","i18n-check"] }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.slice(0, 300) }, { status: 500 });
  }
}

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get("host") || "nossy.pro";
  return `https://${host}`;
}

// ─── DIAGNOSE COMPLETO ────────────────────────────────────────────────
async function diagnose(req: NextRequest): Promise<NextResponse> {
  const results: Record<string, any> = {};
  const start = Date.now();
  const baseUrl = getBaseUrl(req);

  // 1. Gemini - test multiple models
  const geminiKey = process.env.GEMINI_API_KEY;
  let geminiStatus = "NOT_SET";
  let geminiLatency = 0;
  const MODEL_LIST = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  if (geminiKey) {
    for (const model of MODEL_LIST) {
      try {
        const t0 = Date.now();
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Say OK' }] }] }),
          signal: AbortSignal.timeout(5000),
        });
        geminiLatency = Date.now() - t0;
        if (res.ok) { geminiStatus = `WORKING (${model})`; break; }
        geminiStatus = `HTTP_${res.status} (${model})`;
      } catch (e: any) { geminiStatus = `ERROR (${model}): ${e.message.slice(0, 60)}`; }
    }
  }
  results.gemini = { status: geminiStatus, keySet: !!geminiKey, latencyMs: geminiLatency, modelsTested: MODEL_LIST };

  // 2. Arquivos de dados
  try {
    const files = await fsp.readdir(DATA_DIR);
    const directFiles = files.filter((f) => f.endsWith(".json") && !f.includes("_backup") && !f.includes("_index") && !f.includes("_p"));
    const chunkFiles = files.filter((f) => f.includes("_p") && f.endsWith(".json"));
    const indexFiles = files.filter((f) => f.includes("_index.json"));
    const largeFiles: string[] = [];
    let totalSize = 0;
    for (const f of directFiles) {
      const stat = await fsp.stat(path.join(DATA_DIR, f));
      const sizeMB = stat.size / (1024 * 1024);
      totalSize += stat.size;
      if (sizeMB > 4) largeFiles.push(`${f} (${Math.round(sizeMB * 100) / 100}MB)`);
    }
    results.dataFiles = { directFiles: directFiles.length, chunkFiles: chunkFiles.length, indexFiles: indexFiles.length, largeFilesOver4MB: largeFiles, totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100 };
  } catch (e: any) { results.dataFiles = { error: e.message }; }

  // 3. USA chunks
  try {
    const idxRaw = await fsp.readFile(path.join(DATA_DIR, "eua_united-states_index.json"), "utf-8");
    const idx = JSON.parse(idxRaw);
    results.usaChunks = { indexed: true, totalJobs: idx.totalJobs, chunks: idx.chunks.length, chunkSize: idx.chunkSize };
  } catch { results.usaChunks = { indexed: false }; }

  // 4. Testes de rota (self-call)
  const routeTests: Record<string, any> = {};
  try {
    const [usaRes, latestRes] = await Promise.all([
      fetch(`${baseUrl}/api/data/country?file=eua_united-states.json&lang=pt-br&page=1&limit=3`, { signal: AbortSignal.timeout(10000) }).then(r => ({ status: r.status, cache: r.headers.get("cache-control") || "" })).catch(e => ({ status: 0, error: e.message })),
      fetch(`${baseUrl}/api/data/latest?lang=en`, { signal: AbortSignal.timeout(10000) }).then(async r => {
        const cache = r.headers.get("cache-control") || "";
        const body = await r.json().catch(() => []);
        return { status: r.status, cache, firstTitle: body[0]?.title || null, jobsCount: Array.isArray(body) ? body.length : 0 };
      }).catch(e => ({ status: 0, error: e.message })),
    ]);
    routeTests.usa = { status: usaRes.status, ok: usaRes.status === 200, problem: usaRes.status === 413 ? "FILE_TOO_LARGE" : null };
    const lCache = (latestRes as any).cache || "";
    routeTests.latest = { status: latestRes.status, cache: lCache, translationWorking: lCache.includes("s-maxage"), firstTitle: (latestRes as any).firstTitle || null };
  } catch (e: any) { routeTests.error = e.message; }
  results.routeTests = routeTests;

  // 5. Ambiente
  results.environment = { nodeEnv: process.env.NODE_ENV, vercel: !!process.env.VERCEL, region: process.env.VERCEL_REGION || "local", geminiKeySet: !!process.env.GEMINI_API_KEY, adminTokenCustom: !!process.env.ADMIN_TOKEN };

  // 6. Resumo
  const problems: string[] = [];
  const actions: string[] = [];
  if (!geminiKey) { problems.push("GEMINI_API_KEY ausente"); actions.push("Adicionar GEMINI_API_KEY no Vercel"); }
  else if (geminiStatus !== "WORKING") { problems.push(`Gemini: ${geminiStatus}`); actions.push("Verificar GEMINI_API_KEY"); }
  else { actions.push("Gemini OK"); }
  if (results.dataFiles?.largeFilesOver4MB?.length > 0) { problems.push(`Arquivos grandes: ${results.dataFiles.largeFilesOver4MB.join(", ")}`); actions.push("Executar split-files"); }
  if (routeTests.usa?.status === 413) { problems.push("EUA retorna 413"); actions.push("Executar split-files ou verificar chunks"); }
  if (routeTests.latest?.translationWorking === false) { problems.push("Tradução falhando (no-store)"); actions.push("Verificar GEMINI_API_KEY"); }
  else if (routeTests.latest?.translationWorking) { actions.push("Tradução OK"); }

  results.summary = { score: Math.max(0, 100 - problems.length * 20), problems, actions, diagnosticTimeMs: Date.now() - start };
  return NextResponse.json(results, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

// ─── TEST GEMINI ───────────────────────────────────────────────────────
async function testGemini(): Promise<NextResponse> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ status: "KEY_NOT_SET", message: "GEMINI_API_KEY nao configurada" });
  try {
    const t0 = Date.now();
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: "Translate to English" }] }, contents: [{ role: "user", parts: [{ text: JSON.stringify([{ id: 1, title: "Engenheiro de Software", company: "Google", location: "Sao Paulo" }]) }] }], generationConfig: { temperature: 0.1, responseMimeType: "application/json" } }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ status: res.ok ? "WORKING" : `HTTP_${res.status}`, latencyMs: Date.now() - t0, preview: translated ? translated.slice(0, 300) : null, error: res.ok ? null : data });
  } catch (e: any) { return NextResponse.json({ status: "ERROR", message: e.message }); }
}

// ─── TEST TRANSLATION (pipeline real) ─────────────────────────────────
async function testTranslation(req: NextRequest): Promise<NextResponse> {
  const baseUrl = getBaseUrl(req);
  const results: Record<string, any> = {};
  const langs = ["pt-br", "en", "es"];
  for (const lang of langs) {
    try {
      const t0 = Date.now();
      const res = await fetch(`${baseUrl}/api/data/latest?lang=${lang}`, { signal: AbortSignal.timeout(12000) });
      const cache = res.headers.get("cache-control") || "";
      const body = await res.json();
      results[lang] = { status: res.status, latencyMs: Date.now() - t0, cache, ok: res.status === 200, translated: cache.includes("s-maxage"), firstTitle: body[0]?.title, jobsCount: Array.isArray(body) ? body.length : 0 };
    } catch (e: any) { results[lang] = { error: e.message }; }
  }
  return NextResponse.json({ action: "test-translation", results });
}

// ─── TEST USA ──────────────────────────────────────────────────────────
async function testUSA(req: NextRequest): Promise<NextResponse> {
  const baseUrl = getBaseUrl(req);
  try {
    const t0 = Date.now();
    const res = await fetch(`${baseUrl}/api/data/country?file=eua_united-states.json&lang=pt-br&page=1&limit=5`, { signal: AbortSignal.timeout(12000) });
    const body = await res.json();
    return NextResponse.json({ status: res.status, latencyMs: Date.now() - t0, ok: res.status === 200, problem: res.status === 413 ? "FILE_TOO_LARGE" : null, jobsReturned: body?.jobs?.length || 0, totalJobs: body?.total, cache: res.headers.get("cache-control") || "" });
  } catch (e: any) { return NextResponse.json({ error: e.message }); }
}

// ─── TEST ROUTE (qualquer rota) ───────────────────────────────────────
async function testRoute(body: any, req: NextRequest): Promise<NextResponse> {
  const route = body.route;
  if (!route) return NextResponse.json({ error: "Missing 'route' param" }, { status: 400 });
  const baseUrl = getBaseUrl(req);
  try {
    const t0 = Date.now();
    const res = await fetch(`${baseUrl}${route.startsWith("/") ? route : "/" + route}`, { signal: AbortSignal.timeout(12000) });
    const contentType = res.headers.get("content-type") || "";
    const cache = res.headers.get("cache-control") || "";
    let bodyText: string | null = null;
    let bodyJson: any = null;
    if (contentType.includes("json")) {
      bodyText = await res.text();
      try { bodyJson = JSON.parse(bodyText); } catch {}
    }
    return NextResponse.json({ route, status: res.status, latencyMs: Date.now() - t0, contentType, cache, bodyPreview: bodyText ? bodyText.slice(0, 500) : null, json: bodyJson });
  } catch (e: any) { return NextResponse.json({ route, error: e.message }); }
}

// ─── ENV INFO ──────────────────────────────────────────────────────────
function envInfo(): NextResponse {
  return NextResponse.json({ environment: { GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `SET (${process.env.GEMINI_API_KEY.length} chars, starts: ${process.env.GEMINI_API_KEY.slice(0, 4)}...)` : "NOT SET", ADMIN_TOKEN: process.env.ADMIN_TOKEN ? "SET (custom)" : "NOT SET (using default)", DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET", NODE_ENV: process.env.NODE_ENV || "unknown", VERCEL: process.env.VERCEL ? "YES" : "NO", VERCEL_REGION: process.env.VERCEL_REGION || "N/A", } });
}

// ─── LIST FILES ────────────────────────────────────────────────────────
async function listFiles(): Promise<NextResponse> {
  try {
    const files = await fsp.readdir(DATA_DIR);
    const infos: Array<{file:string;sizeBytes:number;sizeKB:number;type:string}> = [];
    for (const f of files.sort()) {
      if (!f.endsWith(".json")) continue;
      const stat = await fsp.stat(path.join(DATA_DIR, f));
      infos.push({ file: f, sizeBytes: stat.size, sizeKB: Math.round(stat.size / 1024), type: f.includes("_p") ? "chunk" : f.includes("_index") ? "index" : "data" });
    }
    return NextResponse.json({ files: infos, total: infos.length });
  } catch (e: any) { return NextResponse.json({ error: e.message }); }
}

// ─── FILE INFO ─────────────────────────────────────────────────────────
async function fileInfo(body: any): Promise<NextResponse> {
  const file = body.file;
  if (!file) return NextResponse.json({ error: "Missing 'file' param" }, { status: 400 });
  if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  try {
    const fp = path.join(DATA_DIR, file);
    const stat = await fsp.stat(fp);
    const raw = await fsp.readFile(fp, "utf-8");
    const data = JSON.parse(raw);
    const jobs = Array.isArray(data) ? data : null;
    return NextResponse.json({ file, sizeBytes: stat.size, sizeMB: Math.round(stat.size / 1024 / 1024 * 100) / 100, type: jobs ? "job_array" : typeof data === "object" ? "index/meta" : "unknown", jobCount: jobs ? jobs.length : null, sampleId: jobs?.[0]?.id, sampleTitle: jobs?.[0]?.title });
  } catch (e: any) { return NextResponse.json({ error: e.message }); }
}

// ─── I18N CHECK ────────────────────────────────────────────────────────
async function i18nCheck(body: any): Promise<NextResponse> {
  const lang = body.lang || "en";
  try {
    // Dynamic import to avoid build issues
    const { i18n, LANGUAGES } = await import("@/lib/i18n");
    const langData = i18n[lang as keyof typeof i18n];
    if (!langData) return NextResponse.json({ error: `Language '${lang}' not found`, availableLanguages: LANGUAGES.map(l => l.code) }, { status: 404 });
    const requiredKeys = ["backToJobs", "companyRegister", "companyRegisterSub", "companySection", "createAccount", "companyName", "companyContactEmail", "companyPassword", "jobSection", "jobTitle", "jobLocation", "selectCountry2", "jobDescription", "jobSector", "allFunctions", "jobType", "salaryMinLabel", "salaryMaxLabel", "currency", "publishJob", "jobPublished", "jobPublishedSub", "postAnother"];
    const missing = requiredKeys.filter(k => !langData[k]);
    const totalKeys = Object.keys(langData).length;
    return NextResponse.json({ lang, totalKeys, requiredChecked: requiredKeys.length, missingKeys: missing, allPresent: missing.length === 0, sampleKeys: Object.keys(langData).slice(0, 15) });
  } catch (e: any) { return NextResponse.json({ error: e.message }); }
}

// ─── SPLIT LARGE FILES ────────────────────────────────────────────────
async function splitLargeFiles(): Promise<NextResponse> {
  const CHUNK = 1000;
  const results: Array<Record<string, any>> = [];
  try {
    const files = await fsp.readdir(DATA_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json") && !f.includes("_backup") && !f.includes("_index") && !f.includes("_p"));
    for (const f of jsonFiles) {
      const fp = path.join(DATA_DIR, f);
      const stat = await fsp.stat(fp);
      const sizeMB = stat.size / (1024 * 1024);
      if (sizeMB <= 4) { results.push({ file: f, skipped: true, reason: "under 4MB" }); continue; }
      const baseName = f.replace(".json", "");
      const indexPath = path.join(DATA_DIR, `${baseName}_index.json`);
      const hasIndex = await fsp.access(indexPath).then(() => true).catch(() => false);
      if (hasIndex) { results.push({ file: f, skipped: true, reason: "already chunked" }); continue; }
      const raw = await fsp.readFile(fp, "utf-8");
      const jobs = JSON.parse(raw);
      const chunks: string[] = [];
      for (let i = 0; i < jobs.length; i += CHUNK) {
        const chunkFile = `${baseName}_p${Math.floor(i / CHUNK) + 1}.json`;
        await fsp.writeFile(path.join(DATA_DIR, chunkFile), JSON.stringify(jobs.slice(i, i + CHUNK)));
        chunks.push(chunkFile);
      }
      await fsp.writeFile(indexPath, JSON.stringify({ original: f, totalJobs: jobs.length, chunkSize: CHUNK, chunks, totalPages: chunks.length }));
      await fsp.unlink(fp);
      results.push({ file: f, sizeMB: Math.round(sizeMB * 100) / 100, totalJobs: jobs.length, chunksCreated: chunks.length, action: "split" });
    }
    return NextResponse.json({ action: "split-files", processed: results.length, results });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
