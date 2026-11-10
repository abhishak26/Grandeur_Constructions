import { consultationSchema, enquirySchema, httpsOrNull, parseBody } from "@/lib/schemas";
import { assertSameOrigin, blank, consumeRate, db, logActivity, reference, uid } from "@/lib/server/util";

async function notify(kind: "enquiry" | "consultation", payload: Record<string, string>) {
  const sql = await db();
  const rows = await sql<{ notify_webhook_url: string | null }>`
    select notify_webhook_url from website_settings where id = 1
  `;
  const url = httpsOrNull(rows[0]?.notify_webhook_url);
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: kind, ...payload }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // The record is already stored. Delivery is best-effort.
  }
}

export async function submitEnquiry(input: unknown) {
  assertSameOrigin();
  const parsed = parseBody(enquirySchema, input);
  if (!parsed.ok) return parsed;
  if ((parsed.data.companyUrl ?? "").trim()) {
    return { ok: true as const, reference: reference("EN") };
  }
  if (!(await consumeRate("enquiry", 8))) {
    return { ok: false as const, message: "Too many submissions from this network. Please try again shortly." };
  }
  const code = reference("EN");
  const id = uid();
  const sql = await db();
  await sql`
    insert into enquiries (
      id, reference, full_name, email, phone, project_type, project_location,
      estimated_budget, project_description, preferred_contact, privacy_consent, status
    ) values (
      ${id}, ${code}, ${parsed.data.fullName}, ${parsed.data.email.toLowerCase()}, ${parsed.data.phone},
      ${parsed.data.projectType}, ${parsed.data.projectLocation}, ${blank(parsed.data.estimatedBudget)},
      ${parsed.data.projectDescription}, ${parsed.data.preferredContact}, true, 'new'
    )
  `;
  await logActivity("Enquiry received", "enquiry", id);
  await notify("enquiry", { reference: code, email: parsed.data.email, name: parsed.data.fullName });
  return { ok: true as const, reference: code };
}

export async function submitConsultation(input: unknown) {
  assertSameOrigin();
  const parsed = parseBody(consultationSchema, input);
  if (!parsed.ok) return parsed;
  if ((parsed.data.companyUrl ?? "").trim()) {
    return { ok: true as const, reference: reference("CR") };
  }
  if (!(await consumeRate("consultation", 8))) {
    return { ok: false as const, message: "Too many submissions from this network. Please try again shortly." };
  }
  const code = reference("CR");
  const id = uid();
  const sql = await db();
  await sql`
    insert into consultation_requests (
      id, reference, full_name, email, phone, project_type, project_location,
      preferred_window, message, preferred_contact, privacy_consent, status
    ) values (
      ${id}, ${code}, ${parsed.data.fullName}, ${parsed.data.email.toLowerCase()}, ${parsed.data.phone},
      ${parsed.data.projectType}, ${blank(parsed.data.projectLocation)}, ${blank(parsed.data.preferredWindow)},
      ${parsed.data.message}, ${parsed.data.preferredContact}, true, 'new'
    )
  `;
  await logActivity("Consultation request received", "consultation", id);
  await notify("consultation", { reference: code, email: parsed.data.email, name: parsed.data.fullName });
  return { ok: true as const, reference: code };
}
