import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const LOCAL_ORIGINS = [
  'http://localhost:5173', // dashboard
  'http://localhost:3000', // frontend
];

/**
 * Origens permitidas pelo CORS: o que vier em `CORS_ORIGIN` (lista separada por
 * vírgula) **mais** os hosts locais, que entram sempre — inclusive em produção.
 *
 * Manter o localhost liberado é o que permite apontar o front rodando na
 * máquina para a API publicada sem mexer em variável de ambiente. E não abre
 * nada: a autenticação é bearer token no header `Authorization`, guardado no
 * storage da origem do site. Uma página servida de localhost não tem credencial
 * ambiente nenhuma para reaproveitar — sem token, a API responde 401.
 *
 * Cada entrada aceita `*`, que casa com qualquer trecho dentro do mesmo host —
 * é assim que as URLs de preview da Vercel entram sem virar uma lista infinita:
 * `https://uai-economizei-monorepo-front-*.vercel.app`.
 */
export function resolveAllowedOrigins(
  corsOrigin = process.env.CORS_ORIGIN,
): string[] {
  const fromEnv = (corsOrigin ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...fromEnv, ...LOCAL_ORIGINS])];
}

/** `*` casa com qualquer sequência sem `/`, para não vazar para outro host. */
function matchesOrigin(pattern: string, origin: string): boolean {
  if (!pattern.includes('*')) return pattern === origin;

  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '[^/]*');

  return new RegExp(`^${escaped}$`).test(origin);
}

export function buildCorsOptions(
  allowed = resolveAllowedOrigins(),
): CorsOptions {
  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const ok =
        !origin || allowed.some((pattern) => matchesOrigin(pattern, origin));

      if (ok) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };
}
