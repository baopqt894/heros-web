import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@payos/node"],
  async redirects() {
    return [
      { source: "/v1", destination: "/", permanent: true },
      { source: "/v2", destination: "/", permanent: true },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
