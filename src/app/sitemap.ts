import type { MetadataRoute } from "next";

const SITIO = "https://zonaaudio.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();

  return [
    {
      url: SITIO,
      lastModified: ahora,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITIO}/admin/login`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];
}