import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://findor.id";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                   lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${baseUrl}/search`,       lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${baseUrl}/about`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const supabase = await createClient();
    const { data: vendors } = await supabase
      .from("vendor_profiles")
      .select("slug, updated_at")
      .eq("is_active", true)
      .eq("is_verified", true)
      .order("updated_at", { ascending: false })
      .limit(1000); // max 1000 vendor di sitemap

    const vendorPages: MetadataRoute.Sitemap = (vendors ?? []).map((v) => ({
      url: `${baseUrl}/vendor/${v.slug}`,
      lastModified: new Date(v.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...vendorPages];
  } catch {
    return staticPages;
  }
}