import type { NextConfig } from "next";
const backend = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/sanctum/:path*", destination: `${backend}/sanctum/:path*` },
      { source: "/auth/:path*", destination: `${backend}/auth/:path*` },
      { source: "/media/:path*", destination: `${backend}/media/:path*` },
      {
        source:
          "/:page(product|public-profile|user|ride-share|help_support|terms-and-conditions|complete-profile|google-login|google-callback|register-fcm-token|index|superadmin|rider_agent_management|logout).php",
        destination: `${backend}/:page.php`,
      },
    ];
  },
};
export default config;
