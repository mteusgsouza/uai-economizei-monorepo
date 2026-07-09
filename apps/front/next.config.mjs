/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    domains: ["melonbooks.akamaized.net"],
  },
}

export default nextConfig
