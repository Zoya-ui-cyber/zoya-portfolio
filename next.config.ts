import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/little-table",
        destination: "/little-table/index.html",
        permanent: false,
      },
      {
        source: "/kairos",
        destination: "/kairos/index.html",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      // 共此刻 Demo 需要摄像头（必须排在全站规则之后）
      {
        source: "/kairos/:path*",
        headers: [{ key: "Permissions-Policy", value: "camera=(self), microphone=(self)" }],
      },
    ];
  },
};

export default nextConfig;
