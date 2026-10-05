import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // El panel privado nunca debe indexarse.
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: "https://zonaaudio.com/sitemap.xml",
    host: "https://zonaaudio.com",
  };
}