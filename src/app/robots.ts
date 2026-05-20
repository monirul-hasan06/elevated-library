import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/categories",
          "/coming-soon",
          "/how-it-works",
          "/faq",
          "/contact",
          "/terms",
          "/privacy",
          "/refund-policy",
        ],
        disallow: [
          "/admin",
          "/dashboard",
          "/checkout",
          "/download",
          "/api",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}