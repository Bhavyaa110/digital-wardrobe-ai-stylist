/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { enabled: true }
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
