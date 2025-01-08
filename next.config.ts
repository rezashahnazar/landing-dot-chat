import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/promotions/leele-coder",
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
