import { httpsOrNull, safeGa } from "@/lib/schemas";
import { bool, db, imagesByProject, num, str, strOrNull } from "@/lib/server/util";

function mapSettings(row: Record<string, unknown> | undefined) {
  return {
    companyName: str(row?.company_name) || "Grandeur Constructions",
    tagline: str(row?.tagline) || "Building Trust. Creating Legacies.",
    address:
      str(row?.address) ||
      "No.24, 10, Paul Varghese St, Vetri Nagar, Perambur, Chennai, Tamil Nadu 600082.",
    phone: strOrNull(row?.phone),
    email: strOrNull(row?.email),
    whatsapp: strOrNull(row?.whatsapp),
    mapsEmbedUrl: httpsOrNull(strOrNull(row?.maps_embed_url)),
    publicSiteUrl: httpsOrNull(strOrNull(row?.public_site_url)),
    facebook: httpsOrNull(strOrNull(row?.facebook)),
    instagram: httpsOrNull(strOrNull(row?.instagram)),
    linkedin: httpsOrNull(strOrNull(row?.linkedin)),
    youtube: httpsOrNull(strOrNull(row?.youtube)),
    seoTitle: strOrNull(row?.seo_title),
    seoDescription: strOrNull(row?.seo_description),
    gaMeasurementId: safeGa(strOrNull(row?.ga_measurement_id)),
    notifyEmail: strOrNull(row?.notify_email),
    notifyWebhookUrl: httpsOrNull(strOrNull(row?.notify_webhook_url)),
  };
}

function mapHome(row: Record<string, unknown> | undefined) {
  return {
    heroHeading: str(row?.hero_heading) || "Homes and workplaces, built to last.",
    heroHighlight: strOrNull(row?.hero_highlight),
    heroDescription: str(row?.hero_description),
    primaryCtaText: str(row?.primary_cta_text) || "Get a Quote",
    primaryCtaHref: str(row?.primary_cta_href) || "/contact",
    secondaryCtaText: str(row?.secondary_cta_text) || "Explore Projects",
    secondaryCtaHref: str(row?.secondary_cta_href) || "/projects",
    aboutHeading: str(row?.about_heading),
    aboutBody: str(row?.about_body),
    mission: strOrNull(row?.mission),
    vision: strOrNull(row?.vision),
    founderName: strOrNull(row?.founder_name),
    founderBio: strOrNull(row?.founder_bio),
    consultationHeading: str(row?.consultation_heading),
    consultationBody: str(row?.consultation_body),
  };
}

function mapService(row: Record<string, unknown>) {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
    summary: str(row.summary),
    description: str(row.description),
    imageUrl: strOrNull(row.image_url),
    imageAlt: strOrNull(row.image_alt),
    displayOrder: num(row.display_order),
    published: bool(row.published),
  };
}

async function settingsRow() {
  const sql = await db();
  const rows = await sql<Record<string, unknown>>`select * from website_settings where id = 1`;
  return mapSettings(rows[0]);
}

async function mapProjectRows(rows: Record<string, unknown>[]) {
  const images = await imagesByProject(rows.map((row) => str(row.id)));
  return rows.map((row) => ({
    id: str(row.id),
    slug: str(row.slug),
    name: str(row.name),
    location: strOrNull(row.location),
    category: str(row.category),
    description: str(row.description),
    status: str(row.status),
    progress: row.progress == null ? null : num(row.progress),
    completionDate: strOrNull(row.completion_date),
    featured: bool(row.featured),
    featuredOrder: num(row.featured_order),
    published: bool(row.published),
    updatedAt: str(row.updated_at),
    images: images.get(str(row.id)) ?? [],
  }));
}

const PROJECT_COLUMNS = `id, slug, name, location, category, description, status, progress,
  completion_date::text as completion_date, featured, featured_order, published,
  to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`;

async function attachProjects(whereSql: string) {
  const sql = await db();
  const rows = await sql.query<Record<string, unknown>>(
    `select ${PROJECT_COLUMNS} from projects ${whereSql}`,
  );
  return mapProjectRows(rows);
}

export async function loadSeo() {
  const settings = await settingsRow();
  return {
    gaMeasurementId: settings.gaMeasurementId,
    title: settings.seoTitle || `${settings.companyName} | ${settings.tagline}`,
    description: settings.seoDescription || settings.tagline,
    companyName: settings.companyName,
    publicSiteUrl: settings.publicSiteUrl,
  };
}

export async function loadChrome() {
  const sql = await db();
  const [settings, services] = await Promise.all([
    settingsRow(),
    sql<Record<string, unknown>>`
      select slug, title from services where published = true order by display_order asc, title asc
    `,
  ]);
  return {
    settings,
    services: services.map((row) => ({ slug: str(row.slug), title: str(row.title) })),
  };
}

export async function loadHome() {
  const sql = await db();
  const [settings, homeRows, slides, services, principles, faqs, steps, featured, ongoing, designs, testimonials, team] =
    await Promise.all([
      settingsRow(),
      sql<Record<string, unknown>>`select * from homepage_content where id = 1`,
      sql<Record<string, unknown>>`
        select image_url, alt from hero_slides where active = true order by sort_order asc, id asc
      `,
      sql<Record<string, unknown>>`
        select * from services where published = true order by display_order asc, title asc
      `,
      sql<Record<string, unknown>>`select title, body from principles order by sort_order asc, id asc`,
      sql<Record<string, unknown>>`
        select question, answer from faqs where published = true order by sort_order asc, id asc
      `,
      sql<Record<string, unknown>>`
        select step_number, title, body from process_steps order by sort_order asc, id asc
      `,
      attachProjects(
        `where published = true and featured = true order by featured_order asc, updated_at desc limit 6`,
      ),
      attachProjects(
        `where published = true and status = 'ongoing' order by updated_at desc limit 6`,
      ),
      attachProjects(
        `where published = true and (status = 'design' or category in ('architectural', 'interior'))
         order by updated_at desc limit 6`,
      ),
      sql<Record<string, unknown>>`
        select quote, author_name, author_role, location
        from testimonials where published = true
        order by display_order asc, created_at desc
      `,
      sql<Record<string, unknown>>`
        select name, designation, bio, photo_url
        from team_members where published = true
        order by display_order asc, name asc
      `,
    ]);

  return {
    settings,
    home: mapHome(homeRows[0]),
    slides: slides.map((row) => ({ imageUrl: str(row.image_url), alt: strOrNull(row.alt) })),
    services: services.map(mapService),
    principles: principles.map((row) => ({ title: str(row.title), body: str(row.body) })),
    faqs: faqs.map((row) => ({ question: str(row.question), answer: str(row.answer) })),
    steps: steps.map((row) => ({
      number: num(row.step_number),
      title: str(row.title),
      body: str(row.body),
    })),
    featured,
    ongoing,
    designs,
    testimonials: testimonials.map((row) => ({
      quote: str(row.quote),
      authorName: str(row.author_name),
      authorRole: strOrNull(row.author_role),
      location: strOrNull(row.location),
    })),
    team: team.map((row) => ({
      name: str(row.name),
      designation: str(row.designation),
      bio: strOrNull(row.bio),
      photoUrl: strOrNull(row.photo_url),
    })),
  };
}

export async function loadServices() {
  const sql = await db();
  const [chrome, rows] = await Promise.all([
    loadChrome(),
    sql<Record<string, unknown>>`
      select * from services where published = true order by display_order asc, title asc
    `,
  ]);
  return { ...chrome, servicesFull: rows.map(mapService) };
}

export async function loadService(slug: string) {
  const sql = await db();
  const rows = await sql<Record<string, unknown>>`
    select * from services where slug = ${slug} and published = true limit 1
  `;
  if (!rows[0]) return null;
  const chrome = await loadChrome();
  return { ...chrome, service: mapService(rows[0]) };
}

export async function loadProjects() {
  const chrome = await loadChrome();
  const projects = await attachProjects(
    `where published = true order by featured desc, featured_order asc, updated_at desc`,
  );
  return { ...chrome, projects };
}

export async function loadProject(slug: string) {
  const sql = await db();
  const rows = await sql<Record<string, unknown>>`
    select id, slug, name, location, category, description, status, progress,
           completion_date::text as completion_date, featured, featured_order, published,
           to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
    from projects
    where published = true and slug = ${slug}
    limit 1
  `;
  const mapped = await mapProjectRows(rows);
  const project = mapped[0];
  if (!project) return null;
  const chrome = await loadChrome();
  return { ...chrome, project };
}

export async function loadTeamPage() {
  const sql = await db();
  const chrome = await loadChrome();
  const rows = await sql<Record<string, unknown>>`
    select name, designation, bio, photo_url from team_members
    where published = true order by display_order asc, name asc
  `;
  return {
    ...chrome,
    team: rows.map((row) => ({
      name: str(row.name),
      designation: str(row.designation),
      bio: strOrNull(row.bio),
      photoUrl: strOrNull(row.photo_url),
    })),
  };
}

export async function loadTestimonialsPage() {
  const sql = await db();
  const chrome = await loadChrome();
  const rows = await sql<Record<string, unknown>>`
    select quote, author_name, author_role, location from testimonials
    where published = true order by display_order asc, created_at desc
  `;
  return {
    ...chrome,
    testimonials: rows.map((row) => ({
      quote: str(row.quote),
      authorName: str(row.author_name),
      authorRole: strOrNull(row.author_role),
      location: strOrNull(row.location),
    })),
  };
}

export async function loadPosts() {
  const sql = await db();
  const chrome = await loadChrome();
  const rows = await sql<Record<string, unknown>>`
    select p.slug, p.title, p.excerpt, p.featured_image,
           to_char(p.published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as published_at,
           c.name as category_name
    from blog_posts p
    left join blog_categories c on c.id = p.category_id
    where p.status = 'published'
    order by p.published_at desc nulls last, p.created_at desc
  `;
  return {
    ...chrome,
    posts: rows.map((row) => ({
      slug: str(row.slug),
      title: str(row.title),
      excerpt: strOrNull(row.excerpt),
      featuredImage: strOrNull(row.featured_image),
      publishedAt: strOrNull(row.published_at),
      categoryName: strOrNull(row.category_name),
    })),
  };
}

export async function loadPost(slug: string) {
  const sql = await db();
  const rows = await sql<Record<string, unknown>>`
    select p.title, p.slug, p.excerpt, p.content, p.featured_image, p.seo_title, p.seo_description,
           to_char(p.published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as published_at,
           c.name as category_name
    from blog_posts p
    left join blog_categories c on c.id = p.category_id
    where p.slug = ${slug} and p.status = 'published'
    limit 1
  `;
  if (!rows[0]) return null;
  const row = rows[0];
  const chrome = await loadChrome();
  return {
    ...chrome,
    post: {
      title: str(row.title),
      slug: str(row.slug),
      excerpt: strOrNull(row.excerpt),
      content: str(row.content),
      featuredImage: strOrNull(row.featured_image),
      seoTitle: strOrNull(row.seo_title),
      seoDescription: strOrNull(row.seo_description),
      publishedAt: strOrNull(row.published_at),
      categoryName: strOrNull(row.category_name),
    },
  };
}

export async function loadSitemap() {
  const sql = await db();
  const [services, projects, posts, settings] = await Promise.all([
    sql<{ slug: string }>`select slug from services where published = true`,
    sql<{ slug: string }>`select slug from projects where published = true`,
    sql<{ slug: string }>`select slug from blog_posts where status = 'published'`,
    settingsRow(),
  ]);
  return {
    origin: settings.publicSiteUrl,
    services: services.map((row) => row.slug),
    projects: projects.map((row) => row.slug),
    posts: posts.map((row) => row.slug),
  };
}
