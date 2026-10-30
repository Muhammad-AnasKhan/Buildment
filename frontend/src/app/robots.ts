import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Search engines may read the landing page and the public course pages. Everything behind a
// sign-in (lessons, workspaces, the API) stays out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/catalog", "/integrations"],
      disallow: ["/api/", "/courses/", "/dashboard", "/my-courses", "/my-questions", "/progress", "/settings", "/notifications", "/workspace", "/admin", "/enroll/", "/zz-"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
