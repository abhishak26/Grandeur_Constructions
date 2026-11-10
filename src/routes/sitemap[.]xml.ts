import { createFileRoute } from "@tanstack/react-router";
import { getRequestUrl } from "@tanstack/react-start/server";
import { getSitemapData } from "@/lib/public.functions";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const data = await getSitemapData();
        const requestUrl = getRequestUrl({ xForwardedHost: true, xForwardedProto: true });
        const origin = (data.origin || requestUrl.origin).replace(/\/$/, "");
        const paths = [
          "/",
          "/about",
          "/services",
          "/projects",
          "/team",
          "/testimonials",
          "/blog",
          "/contact",
          "/consultation",
          "/privacy",
          "/terms",
          ...data.services.map((slug) => `/services/${slug}`),
          ...data.projects.map((slug) => `/projects/${slug}`),
          ...data.posts.map((slug) => `/blog/${slug}`),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(xml, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
