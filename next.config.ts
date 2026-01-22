import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // Auto-transform barrel imports to direct imports for better tree-shaking
    // Reduces bundle size and improves cold start times (bundle-barrel-imports)
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-toast',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
      '@tanstack/react-query',
      'next-safe-action',
    ],
  },
};

export default nextConfig;
