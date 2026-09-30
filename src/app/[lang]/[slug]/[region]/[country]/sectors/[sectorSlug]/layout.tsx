// Layout do segmento /sectors/[sectorSlug] — server component mínimo que
// registra a rota na máquina de ISR (a página é "use client" e não pode
// exportar route segment config). Sem isso, cada visita a um setor de um
// país renderizava no servidor (1 invocation por request).
// 1h: mesma janela da listagem de país (rotação de 6h consistente com API).
export const revalidate = 3600;

export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export default function SectorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
