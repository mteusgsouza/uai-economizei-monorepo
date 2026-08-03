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

