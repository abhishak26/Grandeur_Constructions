import { slugify } from "@/lib/format";
import {
  httpsOrNull,
  noteSchema,
  parseBody,
  postSchema,
  projectSchema,
  safeGa,
  safeHref,
  serviceSchema,
  settingsSchema,
  teamSchema,
  testimonialSchema,
  isSafeAssetUrl,
} from "@/lib/schemas";
import { isAdmin, mustAdmin } from "@/lib/server/auth-admin";
import {
  assertSameOrigin,
  blank,
  bool,
  db,
  imagesByProject,
  logActivity,
  num,
  str,
  strOrNull,
  uid,
} from "@/lib/server/util";

async function guard() {
  assertSameOrigin();
  return mustAdmin();
}

function progressValue(raw: string): number | null | "bad" {
  const text = raw.trim();
  if (!text) return null;
  if (!/^\d{1,3}$/.test(text)) return "bad";
  const value = Number(text);
  if (value < 0 || value > 100) return "bad";
  return value;
}

export async function overview() {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const counts = await sql<{
    projects: number;
    ongoing: number;
    enquiries: number;
    new_enquiries: number;
    consultations: number;
    new_consultations: number;
    testimonials: number;
  }>`
    select
      (select count(*)::int from projects) as projects,
      (select count(*)::int from projects where status = 'ongoing') as ongoing,
      (select count(*)::int from enquiries) as enquiries,
      (select count(*)::int from enquiries where status = 'new') as new_enquiries,
      (select count(*)::int from consultation_requests) as consultations,
      (select count(*)::int from consultation_requests where status = 'new') as new_consultations,
      (select count(*)::int from testimonials where published = true) as testimonials
  `;
  const activity = await sql<{ action: string; entity: string | null; created_at: string }>`
    select action, entity,
           to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
    from activity_log order by created_at desc limit 8
  `;
  const recent = await sql<{ reference: string; full_name: string; status: string; created_at: string }>`
    select reference, full_name, status,
           to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
    from enquiries order by created_at desc limit 5
  `;
  const row = counts[0];
  return {
    ok: true as const,
    stats: {
      projects: num(row?.projects),
      ongoing: num(row?.ongoing),
      enquiries: num(row?.enquiries),
      newEnquiries: num(row?.new_enquiries),
      consultations: num(row?.consultations),
      newConsultations: num(row?.new_consultations),
      testimonials: num(row?.testimonials),
    },
    activity: activity.map((item) => ({
      action: item.action,
      entity: strOrNull(item.entity),
      createdAt: str(item.created_at),
    })),
    recentEnquiries: recent.map((item) => ({
      reference: item.reference,
      fullName: item.full_name,
      status: item.status,
      createdAt: str(item.created_at),
    })),
  };
}

const PROJECT_LIST = `id, slug, name, location, category, description, status, progress,
  completion_date::text as completion_date, featured, featured_order, published,
  to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`;

function mapProject(row: Record<string, unknown>, images: { url: string; alt: string | null }[]) {
  return {
    id: str(row.id),
    slug: str(row.slug),
    name: str(row.name),
    location: str(row.location),
    category: str(row.category),
    description: str(row.description),
    status: str(row.status),
    progress: row.progress == null ? "" : String(num(row.progress)),
    completionDate: str(row.completion_date).slice(0, 10),
    featured: bool(row.featured),
    featuredOrder: num(row.featured_order),
    published: bool(row.published),
    updatedAt: str(row.updated_at),
    images,
  };
}

export async function listProjects() {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const rows = await sql.query<Record<string, unknown>>(
    `select ${PROJECT_LIST} from projects order by updated_at desc`,
  );
  const images = await imagesByProject();
  return { ok: true as const, projects: rows.map((row) => mapProject(row, images.get(str(row.id)) ?? [])) };
}

export async function getProject(id: string) {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  if (id === "new") {
    return {
      ok: true as const,
      project: {
        id: "",
        slug: "",
        name: "",
        location: "",
        category: "residential",
        description: "",
        status: "design",
        progress: "",
        completionDate: "",
        featured: false,
        featuredOrder: 0,
        published: false,
        updatedAt: "",
        images: [] as { url: string; alt: string | null }[],
      },
    };
  }
  const sql = await db();
  const rows = await sql.query<Record<string, unknown>>(`select ${PROJECT_LIST} from projects where id = $1`, [id]);
  const row = rows[0];
  if (!row) return { ok: false as const, message: "Project not found." };
  const images = await imagesByProject([id]);
  return { ok: true as const, project: mapProject(row, images.get(id) ?? []) };
}

export async function saveProject(input: unknown) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const parsed = parseBody(projectSchema, input);
  if (!parsed.ok) return parsed;
  const data = parsed.data;
  for (const image of data.images) {
    if (!isSafeAssetUrl(image.url)) return { ok: false as const, message: "One image address is not allowed." };
  }
  const progress = progressValue(data.progress ?? "");
  if (progress === "bad") return { ok: false as const, message: "Progress must be a number from 0 to 100, or empty." };
  const sql = await db();
  const id = data.id || uid();
  const clash = await sql<{ id: string }>`select id from projects where slug = ${data.slug} and id <> ${id} limit 1`;
  if (clash.length) return { ok: false as const, message: "Another project already uses that address." };
  const location = blank(data.location);
  const completion = blank(data.completionDate);
  if (data.id) {
    const existing = await sql`select id from projects where id = ${id}`;
    if (!existing.length) return { ok: false as const, message: "Project not found." };
    await sql`
      update projects set
        slug = ${data.slug}, name = ${data.name}, location = ${location}, category = ${data.category},
        description = ${data.description}, status = ${data.status}, progress = ${progress},
        completion_date = ${completion}, featured = ${data.featured}, featured_order = ${data.featuredOrder},
        published = ${data.published}, updated_at = now()
      where id = ${id}
    `;
  } else {
    await sql`
      insert into projects (
        id, slug, name, location, category, description, status, progress, completion_date,
        featured, featured_order, published
      ) values (
        ${id}, ${data.slug}, ${data.name}, ${location}, ${data.category}, ${data.description}, ${data.status},
        ${progress}, ${completion}, ${data.featured}, ${data.featuredOrder}, ${data.published}
      )
    `;
  }
  await sql`delete from project_images where project_id = ${id}`;
  for (let index = 0; index < data.images.length; index += 1) {
    const image = data.images[index];
    if (!image) continue;
    await sql`
      insert into project_images (id, project_id, url, alt, sort_order)
      values (${uid()}, ${id}, ${image.url}, ${blank(image.alt)}, ${index})
    `;
  }
  await logActivity(data.id ? "Project updated" : "Project added", "project", id);
  return { ok: true as const, id };
}

export async function deleteProject(id: string) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  await sql`delete from projects where id = ${id}`;
  await logActivity("Project deleted", "project", id);
  return { ok: true as const };
}

export async function listServices() {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const rows = await sql<Record<string, unknown>>`select * from services order by display_order asc, title asc`;
  return {
    ok: true as const,
    services: rows.map((row) => ({
      id: str(row.id),
      slug: str(row.slug),
      title: str(row.title),
      summary: str(row.summary),
      description: str(row.description),
      imageUrl: str(row.image_url),
      imageAlt: str(row.image_alt),
      displayOrder: num(row.display_order),
      published: bool(row.published),
    })),
  };
}

export async function saveService(input: unknown) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const parsed = parseBody(serviceSchema, input);
  if (!parsed.ok) return parsed;
  const data = parsed.data;
  if (data.imageUrl && !isSafeAssetUrl(data.imageUrl)) {
    return { ok: false as const, message: "Image address is not allowed." };
  }
  const sql = await db();
  const id = data.id || uid();
  const clash = await sql<{ id: string }>`select id from services where slug = ${data.slug} and id <> ${id} limit 1`;
  if (clash.length) return { ok: false as const, message: "Another service already uses that address." };
  if (data.id) {
    await sql`
      update services set
        slug = ${data.slug}, title = ${data.title}, summary = ${data.summary}, description = ${data.description},
        image_url = ${blank(data.imageUrl)}, image_alt = ${blank(data.imageAlt)}, published = ${data.published},
        display_order = ${data.displayOrder}, updated_at = now()
      where id = ${id}
    `;
  } else {
    await sql`
      insert into services (id, slug, title, summary, description, image_url, image_alt, display_order, published)
      values (
        ${id}, ${data.slug}, ${data.title}, ${data.summary}, ${data.description},
        ${blank(data.imageUrl)}, ${blank(data.imageAlt)}, ${data.displayOrder}, ${data.published}
      )
    `;
  }
  await logActivity("Service saved", "service", id);
  return { ok: true as const, id };
}

export async function deleteService(id: string) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  await sql`delete from services where id = ${id}`;
  await logActivity("Service deleted", "service", id);
  return { ok: true as const };
}

export async function reorderServices(ids: string[]) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  for (let index = 0; index < ids.length; index += 1) {
    await sql`update services set display_order = ${index + 1}, updated_at = now() where id = ${ids[index]}`;
  }
  return { ok: true as const };
}

function mapEnquiry(row: Record<string, unknown>) {
  return {
    id: str(row.id),
    reference: str(row.reference),
    fullName: str(row.full_name),
    email: str(row.email),
    phone: str(row.phone),
    projectType: str(row.project_type),
    projectLocation: str(row.project_location),
    estimatedBudget: strOrNull(row.estimated_budget),
    projectDescription: str(row.project_description),
    preferredContact: str(row.preferred_contact),
    status: str(row.status),
    internalNotes: str(row.internal_notes),
    createdAt: str(row.created_at),
  };
}

export async function listEnquiries(query: string, status: string) {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const q = query.trim();
  const rows = await sql<Record<string, unknown>>`
    select id, reference, full_name, email, phone, project_type, project_location, estimated_budget,
           project_description, preferred_contact, status, internal_notes,
           to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
    from enquiries
    where (${status} = '' or status = ${status})
      and (
        ${q} = ''
        or full_name ilike ${"%" + q + "%"}
        or email ilike ${"%" + q + "%"}
        or reference ilike ${"%" + q + "%"}
        or phone ilike ${"%" + q + "%"}
      )
    order by created_at desc
    limit 100
  `;
  return { ok: true as const, enquiries: rows.map(mapEnquiry) };
}

export async function getEnquiry(id: string) {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const rows = await sql<Record<string, unknown>>`
    select id, reference, full_name, email, phone, project_type, project_location, estimated_budget,
           project_description, preferred_contact, status, internal_notes,
           to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
    from enquiries where id = ${id} limit 1
  `;
  if (!rows[0]) return { ok: false as const, message: "Enquiry not found." };
  return { ok: true as const, enquiry: mapEnquiry(rows[0]) };
}

export async function updateEnquiry(input: unknown) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const parsed = parseBody(noteSchema, input);
  if (!parsed.ok) return parsed;
  const sql = await db();
  await sql`
    update enquiries set status = ${parsed.data.status}, internal_notes = ${blank(parsed.data.internalNotes)},
      updated_at = now()
    where id = ${parsed.data.id}
  `;
  await logActivity("Enquiry updated", "enquiry", parsed.data.id);
  return { ok: true as const };
}

export async function deleteEnquiry(id: string) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  await sql`delete from enquiries where id = ${id}`;
  await logActivity("Enquiry deleted", "enquiry", id);
  return { ok: true as const };
}

function mapConsult(row: Record<string, unknown>) {
  return {
    id: str(row.id),
    reference: str(row.reference),
    fullName: str(row.full_name),
    email: str(row.email),
    phone: str(row.phone),
    projectType: str(row.project_type),
    projectLocation: strOrNull(row.project_location),
    preferredWindow: strOrNull(row.preferred_window),
    message: str(row.message),
    preferredContact: str(row.preferred_contact),
    status: str(row.status),
    internalNotes: str(row.internal_notes),
    createdAt: str(row.created_at),
  };
}

export async function listConsultations(query: string, status: string) {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const q = query.trim();
  const rows = await sql<Record<string, unknown>>`
    select id, reference, full_name, email, phone, project_type, project_location, preferred_window,
           message, preferred_contact, status, internal_notes,
           to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
    from consultation_requests
    where (${status} = '' or status = ${status})
      and (
        ${q} = ''
        or full_name ilike ${"%" + q + "%"}
        or email ilike ${"%" + q + "%"}
        or reference ilike ${"%" + q + "%"}
      )
    order by created_at desc
    limit 100
  `;
  return { ok: true as const, consultations: rows.map(mapConsult) };
}

export async function getConsultation(id: string) {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const rows = await sql<Record<string, unknown>>`
    select id, reference, full_name, email, phone, project_type, project_location, preferred_window,
           message, preferred_contact, status, internal_notes,
           to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
    from consultation_requests where id = ${id} limit 1
  `;
  if (!rows[0]) return { ok: false as const, message: "Request not found." };
  return { ok: true as const, consultation: mapConsult(rows[0]) };
}

export async function updateConsultation(input: unknown) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const parsed = parseBody(noteSchema, input);
  if (!parsed.ok) return parsed;
  const sql = await db();
  await sql`
    update consultation_requests
    set status = ${parsed.data.status}, internal_notes = ${blank(parsed.data.internalNotes)}, updated_at = now()
    where id = ${parsed.data.id}
  `;
  await logActivity("Consultation updated", "consultation", parsed.data.id);
  return { ok: true as const };
}

export async function deleteConsultation(id: string) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  await sql`delete from consultation_requests where id = ${id}`;
  await logActivity("Consultation deleted", "consultation", id);
  return { ok: true as const };
}

export async function getHomepageAdmin() {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const [home, slides, faqs, principles, steps] = await Promise.all([
    sql<Record<string, unknown>>`select * from homepage_content where id = 1`,
    sql<Record<string, unknown>>`select image_url, alt, active from hero_slides order by sort_order asc, id asc`,
    sql<Record<string, unknown>>`select question, answer, published from faqs order by sort_order asc`,
    sql<Record<string, unknown>>`select title, body from principles order by sort_order asc`,
    sql<Record<string, unknown>>`select title, body from process_steps order by sort_order asc`,
  ]);
  const row = home[0];
  return {
    ok: true as const,
    home: {
      heroHeading: str(row?.hero_heading),
      heroHighlight: str(row?.hero_highlight),
      heroDescription: str(row?.hero_description),
      primaryCtaText: str(row?.primary_cta_text),
      primaryCtaHref: str(row?.primary_cta_href),
      secondaryCtaText: str(row?.secondary_cta_text),
      secondaryCtaHref: str(row?.secondary_cta_href),
      aboutHeading: str(row?.about_heading),
      aboutBody: str(row?.about_body),
      mission: str(row?.mission),
      vision: str(row?.vision),
      founderName: str(row?.founder_name),
      founderBio: str(row?.founder_bio),
      consultationHeading: str(row?.consultation_heading),
      consultationBody: str(row?.consultation_body),
      slides: slides.map((item) => ({
        imageUrl: str(item.image_url),
        alt: str(item.alt),
        active: bool(item.active),
      })),
      faqs: faqs.map((item) => ({
        question: str(item.question),
        answer: str(item.answer),
        published: bool(item.published),
      })),
      principles: principles.map((item) => ({ title: str(item.title), body: str(item.body) })),
      steps: steps.map((item) => ({ title: str(item.title), body: str(item.body) })),
    },
  };
}

export async function saveHomepage(input: unknown) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const data = input as ReturnType<typeof emptyHome>;
  if (!data?.heroHeading?.trim() || !data.heroDescription?.trim()) {
    return { ok: false as const, message: "The hero heading and description are required." };
  }
  const primary = safeHref(data.primaryCtaHref || "/contact");
  const secondary = safeHref(data.secondaryCtaHref || "/projects");
  if (!primary || !secondary) return { ok: false as const, message: "Button links must start with / or https." };
  for (const slide of data.slides ?? []) {
    if (slide.imageUrl && !isSafeAssetUrl(slide.imageUrl)) {
      return { ok: false as const, message: "A hero image address is not allowed." };
    }
  }
  const sql = await db();
  await sql`
    update homepage_content set
      hero_heading = ${data.heroHeading.trim()},
      hero_highlight = ${blank(data.heroHighlight)},
      hero_description = ${data.heroDescription.trim()},
      primary_cta_text = ${data.primaryCtaText.trim() || "Get a Quote"},
      primary_cta_href = ${primary},
      secondary_cta_text = ${data.secondaryCtaText.trim() || "Explore Projects"},
      secondary_cta_href = ${secondary},
      about_heading = ${data.aboutHeading.trim()},
      about_body = ${data.aboutBody.trim()},
      mission = ${blank(data.mission)},
      vision = ${blank(data.vision)},
      founder_name = ${blank(data.founderName)},
      founder_bio = ${blank(data.founderBio)},
      consultation_heading = ${data.consultationHeading.trim()},
      consultation_body = ${data.consultationBody.trim()},
      updated_at = now()
    where id = 1
  `;
  await sql`delete from hero_slides`;
  for (let index = 0; index < (data.slides ?? []).length; index += 1) {
    const slide = data.slides[index];
    if (!slide?.imageUrl) continue;
    await sql`
      insert into hero_slides (id, image_url, alt, sort_order, active)
      values (${uid()}, ${slide.imageUrl}, ${blank(slide.alt)}, ${index}, ${Boolean(slide.active)})
    `;
  }
  await sql`delete from faqs`;
  for (let index = 0; index < (data.faqs ?? []).length; index += 1) {
    const faq = data.faqs[index];
    if (!faq?.question?.trim() || !faq.answer?.trim()) continue;
    await sql`
      insert into faqs (id, question, answer, sort_order, published)
      values (${uid()}, ${faq.question.trim()}, ${faq.answer.trim()}, ${index}, ${Boolean(faq.published)})
    `;
  }
  await sql`delete from principles`;
  for (let index = 0; index < (data.principles ?? []).length; index += 1) {
    const item = data.principles[index];
    if (!item?.title?.trim()) continue;
    await sql`
      insert into principles (id, title, body, sort_order)
      values (${uid()}, ${item.title.trim()}, ${item.body.trim()}, ${index})
    `;
  }
  await sql`delete from process_steps`;
  for (let index = 0; index < (data.steps ?? []).length; index += 1) {
    const step = data.steps[index];
    if (!step?.title?.trim()) continue;
    await sql`
      insert into process_steps (id, step_number, title, body, sort_order)
      values (${uid()}, ${index + 1}, ${step.title.trim()}, ${step.body.trim()}, ${index})
    `;
  }
  await logActivity("Homepage updated", "homepage", "1");
  return { ok: true as const };
}

function emptyHome() {
  return {
    heroHeading: "",
    heroHighlight: "",
    heroDescription: "",
    primaryCtaText: "",
    primaryCtaHref: "",
    secondaryCtaText: "",
    secondaryCtaHref: "",
    aboutHeading: "",
    aboutBody: "",
    mission: "",
    vision: "",
    founderName: "",
    founderBio: "",
    consultationHeading: "",
    consultationBody: "",
    slides: [] as { imageUrl: string; alt: string; active: boolean }[],
    faqs: [] as { question: string; answer: string; published: boolean }[],
    principles: [] as { title: string; body: string }[],
    steps: [] as { title: string; body: string }[],
  };
}

export async function listTestimonials() {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const rows = await sql<Record<string, unknown>>`
    select * from testimonials order by display_order asc, created_at desc
  `;
  return {
    ok: true as const,
    testimonials: rows.map((row) => ({
      id: str(row.id),
      quote: str(row.quote),
      authorName: str(row.author_name),
      authorRole: str(row.author_role),
      location: str(row.location),
      published: bool(row.published),
      displayOrder: num(row.display_order),
    })),
  };
}

export async function saveTestimonial(input: unknown) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const parsed = parseBody(testimonialSchema, input);
  if (!parsed.ok) return parsed;
  const data = parsed.data;
  const sql = await db();
  const id = data.id || uid();
  if (data.id) {
    await sql`
      update testimonials set quote = ${data.quote}, author_name = ${data.authorName},
        author_role = ${blank(data.authorRole)}, location = ${blank(data.location)},
        published = ${data.published}, display_order = ${data.displayOrder}
      where id = ${id}
    `;
  } else {
    await sql`
      insert into testimonials (id, quote, author_name, author_role, location, published, display_order)
      values (${id}, ${data.quote}, ${data.authorName}, ${blank(data.authorRole)}, ${blank(data.location)}, ${data.published}, ${data.displayOrder})
    `;
  }
  await logActivity("Testimonial saved", "testimonial", id);
  return { ok: true as const, id };
}

export async function deleteTestimonial(id: string) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  await sql`delete from testimonials where id = ${id}`;
  await logActivity("Testimonial deleted", "testimonial", id);
  return { ok: true as const };
}

export async function listTeam() {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const rows = await sql<Record<string, unknown>>`select * from team_members order by display_order asc, name asc`;
  return {
    ok: true as const,
    team: rows.map((row) => ({
      id: str(row.id),
      name: str(row.name),
      designation: str(row.designation),
      bio: str(row.bio),
      photoUrl: str(row.photo_url),
      published: bool(row.published),
      displayOrder: num(row.display_order),
    })),
  };
}

export async function saveTeam(input: unknown) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const parsed = parseBody(teamSchema, input);
  if (!parsed.ok) return parsed;
  const data = parsed.data;
  if (data.photoUrl && !isSafeAssetUrl(data.photoUrl)) {
    return { ok: false as const, message: "Photo address is not allowed." };
  }
  const sql = await db();
  const id = data.id || uid();
  if (data.id) {
    await sql`
      update team_members set name = ${data.name}, designation = ${data.designation}, bio = ${blank(data.bio)},
        photo_url = ${blank(data.photoUrl)}, published = ${data.published}, display_order = ${data.displayOrder}
      where id = ${id}
    `;
  } else {
    await sql`
      insert into team_members (id, name, designation, bio, photo_url, published, display_order)
      values (${id}, ${data.name}, ${data.designation}, ${blank(data.bio)}, ${blank(data.photoUrl)}, ${data.published}, ${data.displayOrder})
    `;
  }
  await logActivity("Team member saved", "team", id);
  return { ok: true as const, id };
}

export async function deleteTeam(id: string) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  await sql`delete from team_members where id = ${id}`;
  await logActivity("Team member deleted", "team", id);
  return { ok: true as const };
}

export async function listPostsAdmin() {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const [posts, categories] = await Promise.all([
    sql<Record<string, unknown>>`
      select id, slug, title, status,
             to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
      from blog_posts order by updated_at desc
    `,
    sql<{ id: string; name: string; slug: string }>`select id, name, slug from blog_categories order by name asc`,
  ]);
  return {
    ok: true as const,
    posts: posts.map((row) => ({
      id: str(row.id),
      slug: str(row.slug),
      title: str(row.title),
      status: str(row.status),
      updatedAt: str(row.updated_at),
    })),
    categories,
  };
}

export async function getPost(id: string) {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const categories = await sql<{ id: string; name: string }>`select id, name from blog_categories order by name asc`;
  if (id === "new") {
    return {
      ok: true as const,
      categories,
      post: {
        id: "",
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        categoryId: "",
        featuredImage: "",
        status: "draft",
        seoTitle: "",
        seoDescription: "",
      },
    };
  }
  const rows = await sql<Record<string, unknown>>`select * from blog_posts where id = ${id} limit 1`;
  const row = rows[0];
  if (!row) return { ok: false as const, message: "Article not found." };
  return {
    ok: true as const,
    categories,
    post: {
      id: str(row.id),
      title: str(row.title),
      slug: str(row.slug),
      excerpt: str(row.excerpt),
      content: str(row.content),
      categoryId: str(row.category_id),
      featuredImage: str(row.featured_image),
      status: str(row.status) === "published" ? "published" : "draft",
      seoTitle: str(row.seo_title),
      seoDescription: str(row.seo_description),
    },
  };
}

export async function savePost(input: unknown) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const parsed = parseBody(postSchema, input);
  if (!parsed.ok) return parsed;
  const data = parsed.data;
  if (data.featuredImage && !isSafeAssetUrl(data.featuredImage)) {
    return { ok: false as const, message: "Featured image address is not allowed." };
  }
  const sql = await db();
  let categoryId = blank(data.categoryId);
  if (data.newCategory?.trim()) {
    const name = data.newCategory.trim();
    const slug = slugify(name);
    const existing = await sql<{ id: string }>`select id from blog_categories where slug = ${slug} limit 1`;
    if (existing[0]) categoryId = existing[0].id;
    else {
      categoryId = uid();
      await sql`insert into blog_categories (id, slug, name) values (${categoryId}, ${slug}, ${name})`;
    }
  }
  const id = data.id || uid();
  const clash = await sql<{ id: string }>`select id from blog_posts where slug = ${data.slug} and id <> ${id} limit 1`;
  if (clash.length) return { ok: false as const, message: "Another article already uses that address." };
  if (data.id) {
    await sql`
      update blog_posts set
        slug = ${data.slug}, title = ${data.title}, excerpt = ${blank(data.excerpt)}, content = ${data.content},
        category_id = ${categoryId}, featured_image = ${blank(data.featuredImage)}, status = ${data.status},
        seo_title = ${blank(data.seoTitle)}, seo_description = ${blank(data.seoDescription)},
        published_at = case
          when ${data.status} = 'published' then coalesce(published_at, now())
          else published_at
        end,
        updated_at = now()
      where id = ${id}
    `;
  } else {
    await sql`
      insert into blog_posts (
        id, slug, title, excerpt, content, category_id, featured_image, status, published_at, seo_title, seo_description
      ) values (
        ${id}, ${data.slug}, ${data.title}, ${blank(data.excerpt)}, ${data.content}, ${categoryId},
        ${blank(data.featuredImage)}, ${data.status},
        ${data.status === "published" ? new Date().toISOString() : null},
        ${blank(data.seoTitle)}, ${blank(data.seoDescription)}
      )
    `;
  }
  await logActivity("Article saved", "blog", id);
  return { ok: true as const, id };
}

export async function deletePost(id: string) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  await sql`delete from blog_posts where id = ${id}`;
  await logActivity("Article deleted", "blog", id);
  return { ok: true as const };
}

export async function getSettingsAdmin() {
  const admin = await mustAdmin();
  if (!isAdmin(admin)) return admin;
  const sql = await db();
  const rows = await sql<Record<string, unknown>>`select * from website_settings where id = 1`;
  const row = rows[0];
  return {
    ok: true as const,
    settings: {
      companyName: str(row?.company_name),
      tagline: str(row?.tagline),
      address: str(row?.address),
      phone: str(row?.phone),
      email: str(row?.email),
      whatsapp: str(row?.whatsapp),
      mapsEmbedUrl: str(row?.maps_embed_url),
      publicSiteUrl: str(row?.public_site_url),
      facebook: str(row?.facebook),
      instagram: str(row?.instagram),
      linkedin: str(row?.linkedin),
      youtube: str(row?.youtube),
      seoTitle: str(row?.seo_title),
      seoDescription: str(row?.seo_description),
      gaMeasurementId: str(row?.ga_measurement_id),
      notifyEmail: str(row?.notify_email),
      notifyWebhookUrl: str(row?.notify_webhook_url),
    },
  };
}

export async function saveSettings(input: unknown) {
  const admin = await guard();
  if (!isAdmin(admin)) return admin;
  const parsed = parseBody(settingsSchema, input);
  if (!parsed.ok) return parsed;
  const data = parsed.data;
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false as const, message: "Public email is not valid.", fieldErrors: { email: "Enter a valid email." } };
  }
  if (data.notifyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.notifyEmail)) {
    return { ok: false as const, message: "Notification email is not valid." };
  }
  if (data.phone && !/^[+0-9 ()-]{8,24}$/.test(data.phone)) {
    return { ok: false as const, message: "Phone number looks incomplete." };
  }
  if (data.whatsapp && data.whatsapp.replace(/[^\d]/g, "").length < 8) {
    return { ok: false as const, message: "WhatsApp number needs a country code and digits." };
  }
  if (data.gaMeasurementId && !safeGa(data.gaMeasurementId)) {
    return { ok: false as const, message: "Analytics ID should look like G-XXXX." };
  }
  const links = ["mapsEmbedUrl", "publicSiteUrl", "facebook", "instagram", "linkedin", "youtube", "notifyWebhookUrl"] as const;
  for (const key of links) {
    if (data[key] && !httpsOrNull(data[key])) {
      return { ok: false as const, message: `${key} must be an https address.` };
    }
  }
  const sql = await db();
  await sql`
    update website_settings set
      company_name = ${data.companyName},
      tagline = ${data.tagline},
      address = ${data.address},
      phone = ${blank(data.phone)},
      email = ${blank(data.email)},
      whatsapp = ${blank(data.whatsapp)},
      maps_embed_url = ${httpsOrNull(data.mapsEmbedUrl)},
      public_site_url = ${httpsOrNull(data.publicSiteUrl)},
      facebook = ${httpsOrNull(data.facebook)},
      instagram = ${httpsOrNull(data.instagram)},
      linkedin = ${httpsOrNull(data.linkedin)},
      youtube = ${httpsOrNull(data.youtube)},
      seo_title = ${blank(data.seoTitle)},
      seo_description = ${blank(data.seoDescription)},
      ga_measurement_id = ${safeGa(data.gaMeasurementId)},
      notify_email = ${blank(data.notifyEmail)},
      notify_webhook_url = ${httpsOrNull(data.notifyWebhookUrl)},
      updated_at = now()
    where id = 1
  `;
  await logActivity("Settings updated", "settings", "1");
  return { ok: true as const };
}
