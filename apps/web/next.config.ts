import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Memoizes components and hooks automatically at build time.
  reactCompiler: true,
  // A self-contained server for the Docker image, traced from the monorepo root so workspace
  // packages are included.
  output: 'standalone',
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
};

export default nextConfig;
