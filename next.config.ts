/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "product-images-storage-bucket.s3.us-east-1.amazonaws.com",
      "product-images-storage-bucket.s3.amazonaws.com",
      "evershine-product.s3.us-east-1.amazonaws.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
