/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['@tailwindcss/postcss', 'geist'],
  },
 
  optimizeFonts: true,
}

module.exports = nextConfig