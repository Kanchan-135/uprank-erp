/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" } : {}),
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  }
};

export default nextConfig;
