import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "images.pexels.com",      // your compare images
      "skybee.vercel.app",      // your profile/icon assets
      "lh3.googleusercontent.com", // Google OAuth profile images
    ],
  },
};

export default nextConfig;
