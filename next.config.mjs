/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Fail build on TypeScript errors (project already uses JS but keeping for future)
    ignoreBuildErrors: false,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization: serve WebP/AVIF, enable lazy loading, long-lived CDN cache
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Tree-shake lucide-react so only used icons land in the JS bundle
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Long-lived caching for immutable static assets + security headers
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      // Only set Cache-Control on static assets in production.
      // In development Next.js manages this header itself; overriding it
      // breaks HMR and triggers a warning.
      ...(isProd
        ? [
            {
              source: '/_next/static/(.*)',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable',
                },
              ],
            },
          ]
        : []),
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
