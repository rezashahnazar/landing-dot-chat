/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trustseal.enamad.ir",
        pathname: "/logo.aspx/**",
      },
    ],
  },
};

export default nextConfig;
