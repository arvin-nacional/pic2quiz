import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*" },
      {
        protocol: "http",
        hostname: "*",
      },
    ],
  },
  transpilePackages: ["@mdxeditor/editor"],
};

export default nextConfig;
