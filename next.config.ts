import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "skybee.vercel.app"
    },
    {
      protocol: "https",
      hostname: "lh3.googleusercontent.com"
    },
    {
      protocol: "https",
      hostname: "images.pexels.com",
    }
  ],
}
};

export default nextConfig;
