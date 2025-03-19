import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb", // Increased limit to prevent 413 errors
    },
  },
  api: {
    bodyParser: {
      sizeLimit: "200mb", // Increase size limit for API routes
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
