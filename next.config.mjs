/** @type {import('next').NextConfig} */

// Générer les informations de build
const buildDate = new Date().toLocaleDateString('fr-FR');
const buildTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_DATE: buildDate,
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'base44.app',
        pathname: '/api/apps/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'qtrypzzcjebvfcihiynt.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
