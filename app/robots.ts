import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://findor.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/vendor/", "/about", "/how-it-works"],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard",
          "/bookings",
          "/bookmarks",
          "/profile",
          "/vendor/dashboard",
          "/vendor/services",
          "/vendor/bookings",
          "/vendor/availability",
          "/vendor/analytics",
          "/vendor/register",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}