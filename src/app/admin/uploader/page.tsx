"use client";

import React, { useEffect, useState } from "react";

// NOSSY 0220 — Uploader privado do dono (Task 20-c)
// Página protegida pelo agentLock (rota sob /admin): só o dono (IP whitelist
// ou chave de acesso) chega aqui. Envia o arquivo de vagas direto do PC para
// o repositório — caminho alternativo ao anexo do chat, que está falhando.

export default function UploaderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string; link?: string } | null>(null);
  const [ip, setIp] = useState<string>("carregando...");
  const [key, setKey] = useState<string>("");

  useEffect(() => {
    // Chave de acesso presente na URL? (ex.: /admin/uploader?acesso=nossy-...)
    const params = new URLSearchParams(window.location.search);
    setKey(params.get("acesso") || params.get("key") || "");
    fetch("/api/security/ip")
      .then((r) => r.json())
      .then((d) => setIp(d.ip || "indisponível"))
      .catch(() => setIp("indisponível"));
  }, []);

  async function enviar() {
    if (!file || sending) return;
    setSending(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const url = key ? `/api/admin/upload?acesso=${encodeURIComponent(key)}` : "/api/admin/upload";
      const res = await fetch(url, { method: "POST", body: form });
      const data = await res.json();
      setResult({
        ok: Boolean(data.ok),
        text: data.ok ? (data.message as string) : (data.error as string),
        link: (data.url_direta as string) || (data.url_pagina as string) || undefined,
      });
    } catch (e) {
      setResult({ ok: false, text: `Falha de rede: ${e instanceof Error ? e.message : String(e)}` });
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">NOSSY · área do dono</p>
        <h1 className="mt-1 text-2xl font-bold">Enviar arquivo de vagas</h1>
        <p className="mt-2 text-sm text-gray-600">
          Escolha o arquivo do seu PC (Excel ou CSV) e clique em <b>Enviar</b>. Ele vai direto para o
          repositório do site — não depende do chat. Depois, diga no chat: <i>&quot;enviei o arquivo&quot;</i>.
        </p>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo (.csv, .xlsx, .xls, .txt — até 4 MB)</label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.txt"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={enviar}
          disabled={!file || sending}
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {sending ? "Enviando..." : "Enviar arquivo"}
        </button>

        {result && (
          <div
            className={
              "mt-5 rounded-lg border p-4 text-sm " +
              (result.ok ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800")
            }
          >
            {result.ok ? "✅ " : "❌ "}
            {result.text}
            {result.ok && result.link && (
              <p className="mt-2 break-all">
                <span className="font-medium">Link do arquivo (copie se o agente pedir):</span>
                <br />
                <code className="rounded bg-white px-1.5 py-0.5 text-xs">{result.link}</code>
              </p>
            )}
          </div>
        )}

        <div className="mt-6 border-t border-gray-100 pt-4 text-sm text-gray-600">
          <span className="font-medium text-gray-700">Seu IP público atual:</span>{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5">{ip}</code>
          <p className="mt-1 text-xs text-gray-500">
            Envie esse número no chat para ele entrar na lista de acesso do site.
          </p>
        </div>
      </div>
    </main>
  );
}
