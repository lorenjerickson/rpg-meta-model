import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Memoizes components and hooks automatically at build time.
  reactCompiler: true,
};

export default nextConfig;
