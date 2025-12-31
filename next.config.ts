import type { NextConfig } from "next"
import withPWA from "next-pwa"

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
}

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig as any)
