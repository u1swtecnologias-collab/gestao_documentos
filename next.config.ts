import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow ngrok for HMR
  allowedDevOrigins: ['brick-reply-unwed.ngrok-free.dev'],
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
