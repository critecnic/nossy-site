// Premium 0220 — diretório PRIVADO dos dados reais.
//
// Antes: os JSONs com empresa/contato reais ficavam em public/data/ e eram
// servidos estaticamente (https://nossy.pro/data/asia_china.json) — qualquer
// visitante baixava o arquivo bruto e lia os dados de TODAS as vagas com
// paywall, burlando a máscara server-side das APIs.
//
// Agora: os arquivos vivem em data/site/ (fora de public/, nunca publicados
// pelo servidor estático). Somente as rotas de API os leem e aplicam a
// máscara antes de responder. O next.config.ts garante o empacotamento dos
// arquivos no deploy (outputFileTracingIncludes) e bloqueia qualquer acesso
// estático residual a /data/* (rewrite beforeFiles -> /api/data-blocked).
import path from "path";

export const DATA_DIR = path.join(process.cwd(), "data", "site");
