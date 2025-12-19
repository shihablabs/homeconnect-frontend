import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'images.unsplash.com',
      'picsum.photos',
      'via.placeholder.com',
      'localhost',
      'yourdomain.com',
      // Add other domains you use for images
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
