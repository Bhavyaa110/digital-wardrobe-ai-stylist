/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { enabled: true }
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
