// ═══════════════════════════════════════════════════════════════════════
// XSS-safe JSON-LD serialization (client-safe, no server imports)
// Escapes <, >, &, U+2028, U+2029 so scraped/untrusted job data can never
// break out of a <script> tag (prevents stored XSS via JSON-LD blocks).
// ═══════════════════════════════════════════════════════════════════════

export function safeJsonLd(schema: unknown): string {
  return JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
