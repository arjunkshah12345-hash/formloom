import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
