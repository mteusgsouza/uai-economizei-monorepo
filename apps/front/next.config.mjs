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
  // O nft do Next segue import/require de JS, mas não o dlopen que o .node do
  // sharp faz do libvips no nível do SO — então o .so ficava fora da função.
  // Inclui explicitamente os binários linux-x64 do sharp e do libvips (as duas
  // versões da árvore: 0.34.x do Next e 0.35.x do Payload). Paths relativos a
  // apps/front; `../../` alcança o node_modules/.pnpm da raiz do monorepo.
  outputFileTracingIncludes: {
    '/**': [
      '../../node_modules/.pnpm/@img+sharp-linux-x64*/node_modules/@img/**',
      '../../node_modules/.pnpm/@img+sharp-libvips-linux-x64*/node_modules/@img/**',
    ],
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

