import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' to enable SSR for auth
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
