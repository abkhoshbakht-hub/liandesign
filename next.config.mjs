/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  transpilePackages: ["framer-motion"],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
