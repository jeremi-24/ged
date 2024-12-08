/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'], // Ajouter le domaine ici
  },
  experimental: {
    cache: true, // Active le cache de build
  },
};

export default nextConfig;
