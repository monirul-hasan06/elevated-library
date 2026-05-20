import type { MetadataRoute } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/categories",
    "/coming-soon",
    "/how-it-works",
    "/faq",
    "/contact",
    "/terms",
    "/privacy",
    "/refund-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  try {
    const supabase = createSupabaseAdminClient();

    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("status", "active")
      .is("deleted_at", null);

    const { data: categories } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("status", "active")
      .is("deleted_at", null);

    const productRoutes: MetadataRoute.Sitemap =
      products?.map((product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: product.updated_at
          ? new Date(product.updated_at)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })) || [];

    const categoryRoutes: MetadataRoute.Sitemap =
      categories?.map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: category.updated_at
          ? new Date(category.updated_at)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.75,
      })) || [];

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch {
    return staticRoutes;
  }
}