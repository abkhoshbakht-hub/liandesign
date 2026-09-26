import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://liandesign.ir";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/checkout", "/api", "/customize"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
