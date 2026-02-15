/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Fail build on TypeScript errors (project already uses JS but keeping for future)
    ignoreBuildErrors: false,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
