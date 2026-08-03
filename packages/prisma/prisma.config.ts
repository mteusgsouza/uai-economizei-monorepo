import "dotenv/config";
import { defineConfig } from 'prisma/config'

// `prisma generate` (no build) é codegen puro e não conecta em banco, mas o
// helper `env()` do Prisma lança se a variável não existir no carregamento da
// config. Lendo de `process.env` com um placeholder de URL válida, o generate
// passa sem DATABASE_URL_UNPOOLED; no runtime o `migrate deploy` recebe a URL
// real do ambiente (Render/Neon). O runtime da app não usa esta config.
const PLACEHOLDER_URL =
  'postgresql://placeholder:placeholder@localhost:5432/placeholder'

export default defineConfig({
  schema: './schema',
  migrations: {
    path: './migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? PLACEHOLDER_URL,
    ...(process.env.DATABASE_SHADOW_URL
      ? { shadowDatabaseUrl: process.env.DATABASE_SHADOW_URL }
      : {}),
  },
})
