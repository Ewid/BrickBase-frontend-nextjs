/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true, // Removed as it's default/deprecated in Next.js 15
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.usegalileo.ai', // Add this if you plan to use the old image URLs too
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig 