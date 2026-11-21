import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1 builds only the marketing site as static files for GitHub
 * Pages (see scripts/build-static.sh). The app itself needs a server.
 */
const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";

async function headers() {
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
}

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  ...(STATIC_EXPORT
    ? {
        output: "export",
        basePath: process.env.BASE_PATH || undefined,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : { output: "standalone", headers }),
};

export default nextConfig;
