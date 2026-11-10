import { createHash, randomBytes } from "node:crypto";
import { deleteCookie, getCookie, getRequestProtocol, setCookie } from "@tanstack/react-start/server";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { assertSameOrigin, blank, consumeRate, db, logActivity, uid } from "@/lib/server/util";
import { parseBody, loginSchema, setupSchema } from "@/lib/schemas";

const COOKIE = "gc_session";
const MAX_AGE = 60 * 60 * 24 * 14;

export type AdminUser = { id: string; email: string; name: string };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function currentAdmin(): Promise<AdminUser | null> {
  const token = getCookie(COOKIE);
  if (!token) return null;
  const sql = await db();
  const rows = await sql<{ id: string; email: string; name: string }>`
    select a.id, a.email, a.name
    from admin_sessions s
    join admins a on a.id = s.admin_id
    where s.token_hash = ${hashToken(token)}
      and s.expires_at > now()
    limit 1
  `;
  return rows[0] ?? null;
}

export async function adminConfigured(): Promise<boolean> {
  const sql = await db();
  const rows = await sql<{ n: number }>`select count(*)::int as n from admins`;
  return (rows[0]?.n ?? 0) > 0;
}

async function startSession(adminId: string) {
  const token = randomBytes(32).toString("hex");
  const sql = await db();
  await sql`
    insert into admin_sessions (id, admin_id, token_hash, expires_at)
    values (${uid()}, ${adminId}, ${hashToken(token)}, now() + interval '14 days')
  `;
  setCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: getRequestProtocol({ xForwardedProto: true }) === "https",
    maxAge: MAX_AGE,
  });
}

export async function gate() {
  const [admin, configured] = await Promise.all([currentAdmin(), adminConfigured()]);
  return {
    configured,
    admin: admin ? { id: admin.id, name: admin.name, email: admin.email } : null,
  };
}

export async function setup(input: unknown) {
  assertSameOrigin();
  if (!(await consumeRate("setup", 6))) {
    return { ok: false as const, message: "Too many attempts. Try again shortly." };
  }
  if (await adminConfigured()) {
    return { ok: false as const, message: "An administrator already exists." };
  }
  const parsed = parseBody(setupSchema, input);
  if (!parsed.ok) return parsed;
  const sql = await db();
  const id = uid();
  const passwordHash = await hashPassword(parsed.data.password);
  await sql`
    insert into admins (id, email, password_hash, name)
    values (${id}, ${parsed.data.email.toLowerCase()}, ${passwordHash}, ${parsed.data.name.trim()})
  `;
  await startSession(id);
  await logActivity("Administrator account created", "admin", id);
  return { ok: true as const, message: "Studio desk is ready." };
}

export async function login(input: unknown) {
  assertSameOrigin();
  if (!(await consumeRate("login", 8))) {
    return { ok: false as const, message: "Too many sign-in attempts. Try again shortly." };
  }
  const parsed = parseBody(loginSchema, input);
  if (!parsed.ok) return parsed;
  const sql = await db();
  const rows = await sql<{ id: string; password_hash: string }>`
    select id, password_hash from admins where email = ${parsed.data.email.toLowerCase()} limit 1
  `;
  const row = rows[0];
  if (!row || !(await verifyPassword(parsed.data.password, row.password_hash))) {
    return { ok: false as const, message: "Email or password is not recognised." };
  }
  await startSession(row.id);
  await logActivity("Signed in", "admin", row.id);
  return { ok: true as const };
}

export async function logout() {
  assertSameOrigin();
  const token = getCookie(COOKIE);
  if (token) {
    const sql = await db();
    await sql`delete from admin_sessions where token_hash = ${hashToken(token)}`;
  }
  deleteCookie(COOKIE, { path: "/" });
  return { ok: true as const };
}

export async function mustAdmin(): Promise<AdminUser | { ok: false; message: string }> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, message: "Your session has ended. Sign in again." };
  return admin;
}

export function isAdmin(value: AdminUser | { ok: false; message: string }): value is AdminUser {
  return "email" in value && !("ok" in value);
}

export { blank };
