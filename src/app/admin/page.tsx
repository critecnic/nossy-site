"use client";

import React, { useState, useEffect, useCallback } from "react";

interface HealthResult {
  gemini: { status: string; keySet: boolean; keyPreview: string | null; latencyMs: number };
  dataFiles: { total: number; totalSizeMB: number; largeFiles: number; files: Array<{ file: string; sizeMB: number; problem: string | null }> };
  latestFile: { ok: boolean; count: number; sampleTitle: string | null };
  translationTest: { status: number; latencyMs: number; cacheControl: string; translated: boolean; translationWorking: boolean; diagnosis: string; enFirstTitle: string; ptFirstTitle: string; identicalResponse: boolean };
  usaTest: { status: number; ok: boolean; problem: string | null };
  build: { compiled: boolean; buildId?: string };
  environment: { nodeEnv: string; vercel: boolean; region: string; geminiKeySet: boolean };
  summary: { score: number; problems: string[]; ok: string[]; totalProblems: number; totalOk: number; diagnosticTimeMs: number };
}

const TOKEN = "nossy-admin-2024";

export default function AdminDashboard() {
  const [data, setData] = useState<HealthResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [repairLog, setRepairLog] = useState<string[]>([]);
  const [repairing, setRepairing] = useState(false);

  const runDiagnostics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/health", {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setRepairLog((prev) => [...prev, `Diagnostic error: ${e.message}`]);
    }
    setLoading(false);
  }, []);

  const runRepair = async (action: string) => {
    setRepairing(true);
    setRepairLog((prev) => [...prev, `Executing: ${action}...`]);
    try {
      const res = await fetch("/api/admin/repair", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      setRepairLog((prev) => [
        ...prev,
        `${action}: ${JSON.stringify(json).slice(0, 300)}`,
      ]);
    } catch (e: any) {
      setRepairLog((prev) => [...prev, `${action} error: ${e.message}`]);
    }
    setRepairing(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [runDiagnostics]);

  const scoreColor = data
    ? data.summary.score >= 75
      ? "text-emerald-500"
      : data.summary.score >= 50
        ? "text-amber-500"
        : "text-red-500"
    : "";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black">NOSSY Diagnostics</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time site health monitoring</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-50 transition"
            >
              {loading ? "Scanning..." : "Re-scan"}
            </button>
          </div>
        </div>

        {data && (
          <>
            {/* Score */}
            <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-black ${scoreColor}`}>{data.summary.score}</div>
                <div>
                  <div className="text-sm text-gray-400">Health Score</div>
                  <div className="text-xs text-gray-600">{data.summary.diagnosticTimeMs}ms diagnostic time</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-red-400 text-sm font-semibold">{data.summary.totalProblems} problems</div>
                  <div className="text-emerald-400 text-sm font-semibold">{data.summary.totalOk} ok</div>
                </div>
              </div>
            </div>

            {/* Problems */}
            {data.summary.problems.length > 0 && (
              <div className="bg-red-950/50 rounded-2xl p-6 mb-6 border border-red-900/50">
                <h2 className="text-red-400 font-bold text-sm mb-3">PROBLEMS</h2>
                <div className="space-y-2">
                  {data.summary.problems.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-red-500">X</span>
                      <span className="text-red-200">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OK Items */}
            {data.summary.ok.length > 0 && (
              <div className="bg-emerald-950/50 rounded-2xl p-6 mb-6 border border-emerald-900/50">
                <h2 className="text-emerald-400 font-bold text-sm mb-3">WORKING</h2>
                <div className="space-y-2">
                  {data.summary.ok.map((o, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-500">OK</span>
                      <span className="text-emerald-200">{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              {/* Gemini */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xs font-bold text-gray-400 mb-4">GEMINI API</h3>
                <div className="text-3xl font-black mb-1">
                  {data.gemini.keySet ? (
                    data.gemini.status === "WORKING" ? (
                      <span className="text-emerald-400">ONLINE</span>
                    ) : (
                      <span className="text-red-400">{data.gemini.status}</span>
                    )
                  ) : (
                    <span className="text-red-400">NO KEY</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {data.gemini.keySet ? `Key: ${data.gemini.keyPreview}` : "GEMINI_API_KEY not set"}
                </div>
                {data.gemini.latencyMs > 0 && (
                  <div className="text-xs text-gray-600 mt-1">Latency: {data.gemini.latencyMs}ms</div>
                )}
                <button
                  onClick={() => runRepair("test-gemini")}
                  disabled={repairing}
                  className="mt-4 px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-semibold hover:bg-gray-700 transition"
                >
                  Test Translation
                </button>
              </div>

              {/* Translation */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xs font-bold text-gray-400 mb-4">TRANSLATION</h3>
                <div className="text-3xl font-black mb-1">
                  {data.translationTest?.translationWorking ? (
                    <span className="text-emerald-400">WORKING</span>
                  ) : (
                    <span className="text-red-400">BROKEN</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {data.translationTest?.cacheControl}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  EN: {data.translationTest?.enFirstTitle?.slice(0, 40)}...
                </div>
                <div className="text-xs text-gray-600">
                  Identical: {data.translationTest?.identicalResponse ? "YES (bad)" : "NO (good)"}
                </div>
              </div>

              {/* USA Jobs */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xs font-bold text-gray-400 mb-4">USA JOBS</h3>
                <div className="text-3xl font-black mb-1">
                  {data.usaTest?.ok ? (
                    <span className="text-emerald-400">OK</span>
                  ) : (
                    <span className="text-red-400">{data.usaTest?.problem || "ERROR"}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  HTTP {data.usaTest?.status}
                </div>
                {data.usaTest?.problem === "FILE_TOO_LARGE" && (
                  <button
                    onClick={() => runRepair("split-large-files")}
                    disabled={repairing}
                    className="mt-4 px-3 py-1.5 rounded-lg bg-red-900 text-red-200 text-xs font-semibold hover:bg-red-800 transition"
                  >
                    Split Large Files
                  </button>
                )}
              </div>

              {/* Data Files */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xs font-bold text-gray-400 mb-4">DATA FILES</h3>
                <div className="text-3xl font-black mb-1">{data.dataFiles?.total}</div>
                <div className="text-xs text-gray-500">{data.dataFiles?.totalSizeMB}MB total</div>
                {data.dataFiles?.largeFiles > 0 && (
                  <div className="text-xs text-red-400 mt-1">
                    {data.dataFiles.largeFiles} file(s) too large
                  </div>
                )}
                {data.dataFiles?.files?.slice(0, 3).map((f, i) => (
                  <div key={i} className="text-xs text-gray-600 mt-1">
                    {f.file}: {f.sizeMB}MB {f.problem && <span className="text-red-400">[{f.problem}]</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Environment */}
            <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
              <h3 className="text-xs font-bold text-gray-400 mb-4">ENVIRONMENT</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div><span className="text-gray-500">Platform:</span> <span className="font-semibold">{data.environment.vercel ? "Vercel" : "Local"}</span></div>
                <div><span className="text-gray-500">Region:</span> <span className="font-semibold">{data.environment.region}</span></div>
                <div><span className="text-gray-500">Node:</span> <span className="font-semibold">{data.environment.nodeEnv}</span></div>
                <div><span className="text-gray-500">Built:</span> <span className={`font-semibold ${data.build.compiled ? "text-emerald-400" : "text-red-400"}`}>{data.build.compiled ? "Yes" : "No"}</span></div>
              </div>
            </div>

            {/* Repair Log */}
            {repairLog.length > 0 && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xs font-bold text-gray-400 mb-3">REPAIR LOG</h3>
                <div className="space-y-1 font-mono text-xs text-gray-400">
                  {repairLog.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <details className="mt-6">
              <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400">Raw JSON Response</summary>
              <pre className="mt-2 bg-gray-900 rounded-xl p-4 text-xs text-gray-500 overflow-auto max-h-96 border border-gray-800">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
