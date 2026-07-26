import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
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

