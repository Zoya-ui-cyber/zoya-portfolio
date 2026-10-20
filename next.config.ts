import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/little-table",
        destination: "/little-table/index.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
