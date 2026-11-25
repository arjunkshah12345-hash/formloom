import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Server actions reject cross-origin posts. When the app sits behind a proxy on another
  // host (formloom.app forwards to the Worker), allow the public APP_URL host.
  experimental: {
    serverActions: {
      allowedOrigins: process.env.APP_URL ? [new URL(process.env.APP_URL).host] : [],
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    // Markdown copies of blog posts for AI agents: /blog/<slug>.md
    return [{ source: "/blog/:slug.md", destination: "/md/blog/:slug" }];
  },
  async headers() {
    return [
      {
        // Public forms are embeddable anywhere.
        source: "/f/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
      {
        source: "/((?!f/|embed.js).*)",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
};

export default nextConfig;
