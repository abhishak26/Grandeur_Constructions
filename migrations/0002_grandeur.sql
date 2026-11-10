-- Grandeur Constructions content schema. Facts are seeded; projects, people,
-- testimonials and articles stay empty until the studio publishes them.

create table if not exists admins (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists admin_sessions (
  id text primary key,
  admin_id text not null references admins(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists admin_sessions_admin_idx on admin_sessions (admin_id);

create table if not exists services (
  id text primary key,
  slug text not null unique,
  title text not null,
  summary text not null,
  description text not null,
  image_url text,
  image_alt text,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id text primary key,
  slug text not null unique,
  name text not null,
  location text,
  category text not null,
  description text not null,
  status text not null,
  progress int,
  completion_date date,
  featured boolean not null default false,
  featured_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_status_chk check (status in ('completed', 'ongoing', 'design')),
  constraint projects_progress_chk check (progress is null or (progress >= 0 and progress <= 100))
);
create index if not exists projects_status_idx on projects (status);
create index if not exists projects_featured_idx on projects (featured, featured_order);

create table if not exists project_images (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0
);
create index if not exists project_images_project_idx on project_images (project_id, sort_order);

create table if not exists enquiries (
  id text primary key,
  reference text not null unique,
  full_name text not null,
  email text not null,
  phone text not null,
  project_type text not null,
  project_location text not null,
  estimated_budget text,
  project_description text not null,
  preferred_contact text not null,
  privacy_consent boolean not null,
  status text not null default 'new',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enquiries_status_chk check (status in ('new', 'contacted', 'in_progress', 'completed', 'archived'))
);
create index if not exists enquiries_status_idx on enquiries (status, created_at desc);

create table if not exists consultation_requests (
  id text primary key,
  reference text not null unique,
  full_name text not null,
  email text not null,
  phone text not null,
  project_type text not null,
  project_location text,
  preferred_window text,
  message text not null,
  preferred_contact text not null,
  privacy_consent boolean not null,
  status text not null default 'new',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consult_status_chk check (status in ('new', 'contacted', 'in_progress', 'completed', 'archived'))
);
create index if not exists consult_status_idx on consultation_requests (status, created_at desc);

create table if not exists testimonials (
  id text primary key,
  quote text not null,
  author_name text not null,
  author_role text,
  location text,
  published boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  id text primary key,
  name text not null,
  designation text not null,
  bio text,
  photo_url text,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists blog_categories (
  id text primary key,
  slug text not null unique,
  name text not null
);

create table if not exists blog_posts (
  id text primary key,
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  category_id text references blog_categories(id) on delete set null,
  featured_image text,
  status text not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_status_chk check (status in ('draft', 'published'))
);
create index if not exists blog_posts_status_idx on blog_posts (status, published_at desc);

create table if not exists homepage_content (
  id int primary key default 1,
  hero_heading text not null,
  hero_highlight text,
  hero_description text not null,
  primary_cta_text text not null,
  primary_cta_href text not null,
  secondary_cta_text text not null,
  secondary_cta_href text not null,
  about_heading text not null,
  about_body text not null,
  mission text,
  vision text,
  founder_name text,
  founder_bio text,
  consultation_heading text not null,
  consultation_body text not null,
  updated_at timestamptz not null default now(),
  constraint homepage_singleton check (id = 1)
);

create table if not exists hero_slides (
  id text primary key,
  image_url text not null,
  alt text,
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists website_settings (
  id int primary key default 1,
  company_name text not null,
  tagline text not null,
  address text not null,
  phone text,
  email text,
  whatsapp text,
  maps_embed_url text,
  public_site_url text,
  facebook text,
  instagram text,
  linkedin text,
  youtube text,
  seo_title text,
  seo_description text,
  ga_measurement_id text,
  notify_email text,
  notify_webhook_url text,
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

create table if not exists faqs (
  id text primary key,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  published boolean not null default true
);

create table if not exists principles (
  id text primary key,
  title text not null,
  body text not null,
  sort_order int not null default 0
);

create table if not exists process_steps (
  id text primary key,
  step_number int not null,
  title text not null,
  body text not null,
  sort_order int not null default 0
);

create table if not exists media_assets (
  id text primary key,
  filename text not null,
  mime_type text not null,
  data_base64 text,
  url text,
  alt text,
  byte_size int,
  storage text not null default 'database',
  created_at timestamptz not null default now()
);

create table if not exists rate_limits (
  key text primary key,
  count int not null,
  window_start timestamptz not null
);

create table if not exists activity_log (
  id text primary key,
  action text not null,
  entity text,
  entity_id text,
  created_at timestamptz not null default now()
);
create index if not exists activity_log_created_idx on activity_log (created_at desc);

insert into website_settings (
  id, company_name, tagline, address, maps_embed_url, seo_title, seo_description
) values (
  1,
  'Grandeur Constructions',
  'Building Trust. Creating Legacies.',
  'AB 103 & 105, 3rd Floor, 4th Avenue, Shanthi Colony, Anna Nagar, Chennai - 600040.',
  'https://maps.google.com/maps?q=AB%20103%20%26%20105%2C%203rd%20Floor%2C%204th%20Avenue%2C%20Shanthi%20Colony%2C%20Anna%20Nagar%2C%20Chennai%20600040&z=16&output=embed',
  'Grandeur Constructions | Building Trust. Creating Legacies.',
  'Residential and commercial construction in Perambur, Chennai. Architectural design, interiors, renovation, engineering and turnkey building by Grandeur Constructions.'
) on conflict (id) do nothing;

insert into homepage_content (
  id, hero_heading, hero_highlight, hero_description,
  primary_cta_text, primary_cta_href, secondary_cta_text, secondary_cta_href,
  about_heading, about_body, mission, vision, founder_name, founder_bio,
  consultation_heading, consultation_body
) values (
  1,
  'Homes and workplaces, built to last.',
  'built to last',
  'Grandeur Constructions is a residential and commercial building practice in Perambur, Chennai, with more than ten years of experience. Tell us about a site, a renovation, or a structure you want to plan.',
  'Get a Free Quote',
  '/contact',
  'Explore Projects',
  '/projects',
  'A Chennai practice for building.',
  'The studio is based at AB 103 & 105, 3rd Floor, 4th Avenue, Shanthi Colony, Anna Nagar, Chennai. Work covers residential and commercial construction, from early planning through to handover. Project records, team profiles and client notes appear on this site only after they are published from the studio desk.',
  '',
  '',
  '',
  '',
  'Discuss a site, a drawing, or a building that needs work.',
  'Send a consultation request with a short note about the work. It is not a confirmed appointment until the studio replies.'
) on conflict (id) do nothing;

insert into hero_slides (id, image_url, alt, sort_order, active) values
  ('hs-1', '/media/hero-home.jpg', 'Reference photograph of a contemporary timber and concrete residence at dusk.', 1, true),
  ('hs-2', '/media/hero-work.jpg', 'Reference photograph of a calm open living space with timber and stone.', 2, true),
  ('hs-3', '/media/facade.jpg', 'Reference photograph of a composed two-storey street elevation.', 3, true)
on conflict (id) do nothing;

insert into services (id, slug, title, summary, description, image_url, image_alt, display_order, published) values
  ('svc-residential', 'residential-construction', 'Residential Construction',
   'New houses, additions and residential structures, planned and built to an agreed scope.',
   'Residential work covers new homes and alterations. Drawings, an estimate and the site programme are agreed before construction starts. Grandeur Constructions takes this work on from its studio in Perambur, Chennai.',
   '/media/residential.jpg', 'Reference photograph of a contemporary residence.', 1, true),
  ('svc-commercial', 'commercial-construction', 'Commercial Construction',
   'Workplaces and commercial buildings, scoped before the site is opened.',
   'Commercial construction covers offices and other business premises. The brief, drawings and estimate are settled with the client before work begins.',
   '/media/commercial.jpg', 'Reference photograph of a contemporary workplace interior.', 2, true),
  ('svc-design', 'architectural-design', 'Architectural Design',
   'Planning, drawings and design options prepared for review before construction.',
   'Architectural design is the drawing stage: understanding the site, testing options, and preparing drawings the client can approve. It can stand alone or lead into construction.',
   '/media/design.jpg', 'Reference photograph of drawings and a scale rule on a studio table.', 3, true),
  ('svc-interior', 'interior-design', 'Interior Design',
   'Interior planning for homes and workplaces, coordinated with the building work.',
   'Interior design covers layout, finishes and fittings inside a home or workplace. Selections are recorded so they can be priced and built with the rest of the project.',
   '/media/interior.jpg', 'Reference photograph of a furnished living room.', 4, true),
  ('svc-turnkey', 'turnkey-construction', 'Turnkey Construction',
   'One agreed scope that runs from planning through construction to handover.',
   'Turnkey construction means the studio coordinates the agreed scope from early planning to handover. What is included is written down at approval. It is not an open-ended promise.',
   '/media/site.jpg', 'Reference photograph of reinforcement on a construction deck.', 5, true),
  ('svc-structural', 'structural-engineering', 'Structural Engineering',
   'Structural drawings and coordination for the frame of a building.',
   'Structural engineering covers the frame: columns, beams, slabs and the drawings that describe them. It is coordinated with the architectural drawings before site work.',
   '/media/structure.jpg', 'Reference photograph of a curved concrete and glass structure.', 6, true),
  ('svc-renovation', 'renovation', 'Renovation',
   'Alterations to existing buildings, with the scope agreed before opening up the site.',
   'Renovation covers changes to a building that already exists. The condition of the structure and the agreed scope determine the programme. Surprises found on site are discussed before extra work proceeds.',
   '/media/facade.jpg', 'Reference photograph of a renovated modern street elevation.', 7, true),
  ('svc-civil', 'civil-engineering', 'Civil Engineering',
   'Site preparation and civil works that sit alongside a building project.',
   'Civil engineering here means the site works that support a building: levels, drainage and related ground works described in the estimate. The exact scope is project-specific.',
   '/media/site.jpg', 'Reference photograph of a prepared construction deck.', 8, true),
  ('svc-pm', 'project-management', 'Project Management',
   'A single point of contact for planning, estimation and site coordination.',
   'Project management is the coordination of an agreed programme: drawings, approvals, estimates and site communication. The studio does not publish unverified delivery statistics.',
   '/media/design.jpg', 'Reference photograph of construction drawings being marked up.', 9, true)
on conflict (id) do nothing;

insert into principles (id, title, body, sort_order) values
  ('pr-1', 'Commitment to the brief', 'Work is scoped against the requirements written down at the start of a project.', 1),
  ('pr-2', 'Quality of workmanship', 'Materials and finishes are specified before construction begins, so the site is not guessing.', 2),
  ('pr-3', 'Transparent communication', 'Progress is discussed with the client as the work proceeds, including changes to the brief.', 3),
  ('pr-4', 'A collaborative approach', 'Design and site decisions are reviewed with the people involved, not decided in isolation.', 4),
  ('pr-5', 'A clear handover', 'Handover follows a walkthrough of the agreed scope. It is not described as complete before that.', 5),
  ('pr-6', 'Project coordination', 'Planning, estimation and site work are coordinated through one studio contact.', 6)
on conflict (id) do nothing;

insert into process_steps (id, step_number, title, body, sort_order) values
  ('ps-1', 1, 'Initial Consultation', 'We listen to the site, any budget range you already have, and what the building needs to do.', 1),
  ('ps-2', 2, 'Requirement Analysis', 'The brief is written down so the scope, constraints and open questions are visible.', 2),
  ('ps-3', 3, 'Planning and Design', 'Drawings and design options are prepared for review.', 3),
  ('ps-4', 4, 'Estimation and Approval', 'A cost estimate is shared. Construction proceeds after that estimate is approved.', 4),
  ('ps-5', 5, 'Construction', 'Site work follows the agreed drawings and programme.', 5),
  ('ps-6', 6, 'Final Inspection and Handover', 'The finished work is inspected against the agreed scope and then handed over.', 6)
on conflict (id) do nothing;

insert into faqs (id, question, answer, sort_order, published) values
  ('faq-1', 'How do I request a consultation?',
   'Use the consultation form with your contact details and a short note about the site or building. The request is logged for the studio. It is not a confirmed appointment until someone from Grandeur Constructions contacts you.',
   1, true),
  ('faq-2', 'What should I include in an enquiry?',
   'Your name, a phone number or email, the type of work, the location, and a description of what you need. A budget is optional.',
   2, true),
  ('faq-3', 'Which kinds of work do you take on?',
   'Residential construction, commercial construction, architectural design, interior design, turnkey construction, structural engineering, renovation, civil engineering and project management.',
   3, true),
  ('faq-4', 'Where are you based?',
   'AB 103 & 105, 3rd Floor, 4th Avenue, Shanthi Colony, Anna Nagar, Chennai - 600040.',
   4, true),
  ('faq-5', 'Will I see completed projects on this website?',
   'Only projects the studio publishes from its desk are shown. If a gallery is empty, those records have not been added yet.',
   5, true),
  ('faq-6', 'How is a project typically organised?',
   'Initial consultation, requirement analysis, planning and design, estimation and approval, construction, then final inspection and handover. The sequence can change with the brief.',
   6, true)
on conflict (id) do nothing;
