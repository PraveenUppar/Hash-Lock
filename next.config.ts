import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Prevents browser from guessing the MIME type
          },
          {
            key: "X-Frame-Options",
            value: "DENY", // Prevents clickjacking (your site can't be put in an iframe)
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block", // Old school XSS protection
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload", // Forces HTTPS
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // Controls how much info you send to other sites
          },
        ],
      },
    ];
  },
};

export default nextConfig;