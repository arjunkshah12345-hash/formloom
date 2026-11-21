import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/", "/f/"], disallow: ["/forms", "/account", "/preview", "/api"] },
  };
}
