import { createFileRoute } from "@tanstack/react-router";
import { getRequestUrl } from "@tanstack/react-start/server";

export const Route = createFileRoute("/api/media/$id")({
  server: {
    handlers: {
      GET: async () => {
        const url = getRequestUrl();
        const id = decodeURIComponent(url.pathname.split("/").pop() || "");
        const { readMedia } = await import("@/lib/server/media");
        const row = await readMedia(id);
        if (!row) return new Response("Not found", { status: 404 });
        if (!row.data_base64 && row.url) return Response.redirect(row.url, 302);
        if (!row.data_base64) return new Response("Not found", { status: 404 });
        const bytes = Buffer.from(row.data_base64, "base64");
        return new Response(bytes, {
          headers: {
            "content-type": row.mime_type,
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
