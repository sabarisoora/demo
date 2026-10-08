import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { niches } from "@/niches";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...Object.keys(niches).map((n) => `/${n}`), "/signup", "/login", "/terms", "/privacy", "/refunds"];
  return paths.map((p) => ({ url: `${site.url}${p === "/" ? "" : p}`, changeFrequency: "weekly", priority: p === "/" ? 1 : 0.6 }));
}
