import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow ngrok for HMR
  allowedDevOrigins: ['brick-reply-unwed.ngrok-free.dev'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2000mb', // Aumentado para 2GB (efetivamente sem limite prático para arquivos comuns)
    },
  },
};

export default nextConfig;
