/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'product-images-storage-bucket.s3.us-east-1.amazonaws.com',
      'product-images-storage-bucket.s3.amazonaws.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig