import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  api: {
    bodyParser: {
      sizeLimit: "100mb", // Adjust size limit as needed
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
