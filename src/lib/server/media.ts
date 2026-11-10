import { createHash } from "node:crypto";
import { isAdmin, mustAdmin } from "@/lib/server/auth-admin";
import { assertSameOrigin, blank, db, logActivity, str, strOrNull, uid } from "@/lib/server/util";
import { parseBody, uploadSchema } from "@/lib/schemas";

const MAX_BYTES = 1_800_000;

function magicOk(bytes: Buffer, mime: string): boolean {
  const hex = bytes.subarray(0, 12).toString("hex");
  if (mime === "image/jpeg") return hex.startsWith("ffd8ff");
  if (mime === "image/png") return hex.startsWith("89504e47");
  if (mime === "image/webp") return hex.startsWith("52494646") && bytes.subarray(8, 12).toString() === "WEBP";
  return false;
}

async function cloudinaryUrl(bytes: Buffer, mime: string): Promise<string | null> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) return null;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1").update(`timestamp=${timestamp}${secret}`).digest("hex");
  const body = new FormData();
  body.set("file", `data:${mime};base64,${bytes.toString("base64")}`);
  body.set("api_key", key);
  body.set("timestamp", String(timestamp));
  body.set("signature", signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body,
  });
  if (!response.ok) throw new Error("The image host rejected the upload.");
  const json = (await response.json()) as { secure_url?: string };
  if (!json.secure_url) throw new Error("The image host did not return an address.");
  return json.secure_url;
}

export async function listMedia() {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const rows = await sql<{
    id: string;
    filename: string;
    mime_type: string;
    url: string | null;
    alt: string | null;
    byte_size: number | null;
    storage: string;
    created_at: string;
  }>`
    select id, filename, mime_type, url, alt, byte_size, storage,
           to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
    from media_assets
    order by created_at desc
    limit 200
  `;
  return {
    ok: true as const,
    items: rows.map((row) => ({
      id: row.id,
      filename: row.filename,
      mimeType: row.mime_type,
      url: row.url || `/api/media/${row.id}`,
      alt: strOrNull(row.alt),
      byteSize: row.byte_size,
      storage: row.storage,
      createdAt: str(row.created_at),
    })),
  };
}

export async function uploadMedia(input: unknown) {
  assertSameOrigin();
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const parsed = parseBody(uploadSchema, input);
  if (!parsed.ok) return parsed;
  const bytes = Buffer.from(parsed.data.base64, "base64");
  if (!bytes.length || bytes.length > MAX_BYTES) {
    return { ok: false as const, message: "Images must be under 1.8 MB." };
  }
  if (!magicOk(bytes, parsed.data.mime)) {
    return { ok: false as const, message: "The file is not a valid JPEG, PNG, or WebP image." };
  }
  const id = uid();
  const filename = parsed.data.filename.replace(/[^\w.\- ]+/g, "").slice(0, 80) || "image";
  let storage = "database";
  let url = `/api/media/${id}`;
  let data: string | null = parsed.data.base64;
  const hosted = await cloudinaryUrl(bytes, parsed.data.mime);
  if (hosted) {
    storage = "cloudinary";
    url = hosted;
    data = null;
  }
  const sql = await db();
  await sql`
    insert into media_assets (id, filename, mime_type, data_base64, url, alt, byte_size, storage)
    values (${id}, ${filename}, ${parsed.data.mime}, ${data}, ${url}, ${blank(parsed.data.alt)}, ${bytes.length}, ${storage})
  `;
  await logActivity("Image uploaded", "media", id);
  return { ok: true as const, item: { id, url, alt: blank(parsed.data.alt), filename } };
}

export async function deleteMedia(id: string) {
  assertSameOrigin();
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const rows = await sql<{ url: string | null }>`select url from media_assets where id = ${id} limit 1`;
  const row = rows[0];
  if (!row) return { ok: false as const, message: "Image not found." };
  const url = row.url || `/api/media/${id}`;
  const used = await sql<{ n: number }>`
    select (
      (select count(*)::int from services where image_url = ${url}) +
      (select count(*)::int from project_images where url = ${url}) +
      (select count(*)::int from team_members where photo_url = ${url}) +
      (select count(*)::int from blog_posts where featured_image = ${url}) +
      (select count(*)::int from hero_slides where image_url = ${url})
    ) as n
  `;
  if ((used[0]?.n ?? 0) > 0) {
    return { ok: false as const, message: "This image is still used on the site. Remove it there first." };
  }
  await sql`delete from media_assets where id = ${id}`;
  await logActivity("Image deleted", "media", id);
  return { ok: true as const };
}

export async function readMedia(id: string) {
  const sql = await db();
  const rows = await sql<{ mime_type: string; data_base64: string | null; url: string | null }>`
    select mime_type, data_base64, url from media_assets where id = ${id} limit 1
  `;
  return rows[0] ?? null;
}
