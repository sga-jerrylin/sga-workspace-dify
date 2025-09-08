/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 生产环境配置
  // 使用SWC（Next.js默认）
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
