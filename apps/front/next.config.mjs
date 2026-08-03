import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo pnpm: sem apontar a raiz, o file tracing do Next parte de
  // apps/front e deixa de fora binários nativos hasteados no node_modules/.pnpm
  // da raiz — como o libvips do sharp que o Payload usa, que então falha ao
  // carregar na função serverless da Vercel (ERR_DLOPEN_FAILED libvips-cpp.so).
  outputFileTracingRoot: path.join(dirname, '../../'),
  // O nft segue require/import de JS, mas não o dlopen que o .node do sharp faz
  // do libvips no nível do SO — o .so ficava fora da função e as rotas
  // dinâmicas (ex.: /produtos/[id], que carrega o payload.config em runtime)
  // quebravam com ERR_DLOPEN_FAILED. As páginas estáticas escapavam porque são
  // renderizadas no build. Com node-linker=hoisted esses pacotes são
  // diretórios reais na raiz (não symlinks), então incluí-los é seguro.
  outputFileTracingIncludes: {
    '/**': ['../../node_modules/sharp/**', '../../node_modules/@img/**'],
  },
  transpilePackages: ["@workspace/ui"],
  images: {
    // Hosts que o projeto controla ou que concentram a maior parte das imagens.
    // Demais hosts de terceiros caem no fallback `unoptimized` do ProductImage.
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'media.flixcar.com' },
      { protocol: 'https', hostname: 'melonbooks.akamaized.net' },
    ],
  },
}

export default withPayload(nextConfig)

