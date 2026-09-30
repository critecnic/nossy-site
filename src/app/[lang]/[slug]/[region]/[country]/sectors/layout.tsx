// Layout do segmento /sectors — server component mínimo cujo único papel é
// habilitar ISR de 1h para as páginas de setores (elas são "use client" e
// não podem exportar route segment config). Sem isso, cada visita a
// /sectors renderizava no servidor (1 invocation por request) — com o cache
// ativo, a Vercel serve o HTML da CDN e só revalida após 1h por URL.
export const revalidate = 3600;

// ISR on-demand (mesmo padrão do país/detalhe): [] + dynamicParams=true.
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export default function SectorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
