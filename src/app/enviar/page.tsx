"use client";

import React, { useState } from "react";

// NOSSY 0220 — Página PÚBLICA de envio do arquivo de vagas (Task 20-e).
// Objetivo: ZERO fricção para o dono — nossy.pro/enviar, escolher o arquivo
// Word e enviar. Sem senha, sem digitar URL longa, sem depender do chat
// (o anexo do chat não grava no servidor — 7 tentativas).

export default function EnviarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string; link?: string } | null>(null);

  async function enviar() {
    if (!file || sending) return;
    setSending(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/enviar-vagas", { method: "POST", body: form });
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
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">NOSSY · envio de vagas</p>
        <h1 className="mt-1 text-2xl font-bold">Enviar arquivo de vagas (Word, Excel ou CSV)</h1>
        <p className="mt-2 text-sm text-gray-600">
          1. Clique em <b>Escolher arquivo</b> e selecione o documento do seu PC.
          <br />
          2. Clique em <b>Enviar</b> e espere a confirmação verde.
          <br />
          3. Diga no chat: <i>&quot;enviei o arquivo&quot;</i>.
        </p>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Arquivo (.docx, .doc, .xlsx, .csv, .txt — até 4 MB)
          </label>
          <input
            type="file"
            accept=".docx,.doc,.xlsx,.xls,.csv,.txt"
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
            {result.ok ? "✔ " : "✖ "}
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

        <p className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-500">
          As vagas são publicadas no nossy.pro com empresa <b>G4 company</b> e contato{" "}
          <b>g4.companny@gmail.com</b>, exatamente como estão no arquivo.
        </p>
      </div>
    </main>
  );
}
