/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { enabled: true }
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
