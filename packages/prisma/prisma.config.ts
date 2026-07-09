import "dotenv/config";
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: './schema',
  migrations:{
    path: './migrations',
  },
  datasource: {
    url: env("DATABASE_URL_UNPOOLED"),
    ...(process.env.DATABASE_SHADOW_URL
      ? { shadowDatabaseUrl: env("DATABASE_SHADOW_URL") }
      : {}),
  },
})
