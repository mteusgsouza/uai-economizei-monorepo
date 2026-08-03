import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const DEFAULT_ORIGINS = [
  'http://localhost:5173', // dashboard
  'http://localhost:3000', // frontend
];

/**
 * Origens permitidas pelo CORS. Em produção vêm de `CORS_ORIGIN` (lista
 * separada por vírgula, ex.: os domínios do front na Vercel); sem a variável
 * caímos nos hosts locais de desenvolvimento.
 */
export function resolveAllowedOrigins(
  corsOrigin = process.env.CORS_ORIGIN,
): string[] {
  const fromEnv = (corsOrigin ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return fromEnv.length > 0 ? fromEnv : DEFAULT_ORIGINS;
}

export function buildCorsOptions(
  allowed = resolveAllowedOrigins(),
): CorsOptions {
  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };
}
