import type { MetadataRoute } from "next";
import type { CatalogCourseSummary } from "@/shared/api/catalog";
import { serverApiFetch } from "@/lib/api-server";
import { SITE_URL } from "@/lib/site";

// Built on request from the live catalog, so a newly published course is listed without a deploy.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/catalog`, changeFrequency: "daily", priority: 0.9 },
  ];
  try {
    const { courses } = await serverApiFetch<{ courses: CatalogCourseSummary[] }>("/api/v1/catalog", { token: null });
    for (const course of courses) {
      pages.push({ url: `${SITE_URL}/catalog/${course.slug}`, changeFrequency: "weekly", priority: 0.8 });
    }
  } catch {
    // The API being down should not break the sitemap; the two fixed pages are still listed.
  }
  return pages;
}
