import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getRequest, getRequestIP } from "@tanstack/react-start/server";
import { getSql, type Sql } from "@/lib/db";

export async function db(): Promise<Sql> {
  return getSql();
}

export function uid(): string {
  return randomUUID();
}

export function reference(prefix: "EN" | "CR"): string {
  const now = new Date();
  const y = String(now.getUTCFullYear()).slice(2);
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${y}${m}${d}-${rand}`;
}

export function str(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function strOrNull(value: unknown): string | null {
  const text = str(value).trim();
  return text ? text : null;
}

export function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function bool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

export function blank(value: string | null | undefined): string | null {
  const text = (value ?? "").trim();
  return text ? text : null;
}

export async function logActivity(action: string, entity?: string, entityId?: string) {
  const sql = await db();
  await sql`
    insert into activity_log (id, action, entity, entity_id)
    values (${uid()}, ${action}, ${entity ?? null}, ${entityId ?? null})
  `;
}

export function assertSameOrigin() {
  const req = getRequest();
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") throw new Error("Invalid origin");
  const origin = req.headers.get("origin");
  const host =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || req.headers.get("host");
  if (!origin || !host) return;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new Error("Invalid origin");
  }
  if (originHost !== host) throw new Error("Invalid origin");
}

export async function consumeRate(bucket: string, limit: number): Promise<boolean> {
  const ip = getRequestIP({ xForwardedFor: true }) || "local";
  const key = createHash("sha256").update(`${bucket}:${ip}`).digest("hex");
  const sql = await db();
  const rows = await sql<{ count: number }>`
    insert into rate_limits (key, count, window_start)
    values (${key}, 1, now())
    on conflict (key) do update set
      count = case
        when rate_limits.window_start < now() - interval '15 minutes' then 1
        else rate_limits.count + 1
      end,
      window_start = case
        when rate_limits.window_start < now() - interval '15 minutes' then now()
        else rate_limits.window_start
      end
    returning count
  `;
  return num(rows[0]?.count) <= limit;
}

export type ImageRef = { url: string; alt: string | null };

export async function imagesByProject(ids?: string[]): Promise<Map<string, ImageRef[]>> {
  const sql = await db();
  const rows = await sql<{ project_id: string; url: string; alt: string | null; sort_order: number }>`
    select project_id, url, alt, sort_order from project_images order by sort_order asc, id asc
  `;
  const map = new Map<string, ImageRef[]>();
  const allow = ids ? new Set(ids) : null;
  for (const row of rows) {
    if (allow && !allow.has(row.project_id)) continue;
    const list = map.get(row.project_id) ?? [];
    list.push({ url: row.url, alt: strOrNull(row.alt) });
    map.set(row.project_id, list);
  }
  return map;
}
