update website_settings
set phone = '+91 98408 22267',
    email = 'hello@grandeurconstructions.in',
    whatsapp = '+91 98408 22267',
    instagram = 'https://www.instagram.com/grandeurconstructions',
    facebook = 'https://www.facebook.com/grandeurconstructions',
    seo_title = 'Grandeur Constructions | Chennai Building & Design Studio',
    seo_description = 'Grandeur Constructions creates thoughtful homes, workplaces and interiors in Perambur and across Chennai.'
where id = 1;

update homepage_content
set primary_cta_text = 'Get a Quote'
where id = 1;

update homepage_content
set hero_heading = 'Thoughtful spaces, built for everyday life.',
    hero_highlight = 'built for everyday life',
    hero_description = 'From a first sketch to the final handover, Grandeur Constructions brings design, engineering and site execution together for homes and workplaces across Chennai.',
    about_heading = 'A hands-on building partner in Chennai.',
    about_body = 'We help families and businesses move from an idea to a finished space with clear drawings, considered materials and steady site coordination. Every project starts with a conversation about the brief, the site and the way the building needs to work.',
    mission = 'To make building feel considered, transparent and dependable from the first meeting to handover.',
    vision = 'To be Chennai''s trusted partner for spaces that age well and serve the people who use them.',
    founder_name = 'The Grandeur Studio',
    founder_bio = 'A close-knit team of designers, engineers and site professionals working from Perambur.',
    consultation_heading = 'Have a site, a drawing or a renovation in mind?',
    consultation_body = 'Share a few details and we will help you understand the next practical step, whether that is a site visit, a design conversation or an estimate.'
where id = 1;

insert into projects (
  id, slug, name, location, category, description, status, progress,
  completion_date, featured, featured_order, published
) values
  ('prj-adyar-courtyard', 'adyar-courtyard-home', 'Adyar Courtyard Home',
   'Adyar, Chennai', 'residential',
   'A warm, light-filled family home organised around a planted courtyard. The design balances privacy at the street edge with generous shared spaces inside.',
   'completed', null, '2024-11-15', true, 1, true),
  ('prj-anna-nagar-office', 'anna-nagar-workplace', 'Anna Nagar Workplace',
   'Anna Nagar, Chennai', 'commercial',
   'A calm, flexible workplace fit-out with meeting rooms, collaborative tables and a reception that reflects the character of the growing team.',
   'completed', null, '2025-03-28', true, 2, true),
  ('prj-perambur-residence', 'perambur-family-residence', 'Perambur Family Residence',
   'Perambur, Chennai', 'residential',
   'A compact urban home planned for cross-ventilation, easy maintenance and a connected family living area on a tight city plot.',
   'ongoing', 68, null, true, 3, true),
  ('prj-ecr-retreat', 'ecr-weekend-retreat', 'ECR Weekend Retreat',
   'East Coast Road, Chennai', 'architectural',
   'A low-maintenance retreat shaped around shade, sea air and indoor-outdoor living. The proposal is currently in design development.',
   'design', 35, null, true, 4, true)
on conflict (id) do nothing;

insert into project_images (id, project_id, url, alt, sort_order) values
  ('img-adyar-1', 'prj-adyar-courtyard', '/media/residential.jpg', 'Contemporary home with warm timber accents and a sheltered entrance.', 1),
  ('img-adyar-2', 'prj-adyar-courtyard', '/media/interior.jpg', 'Bright living space with timber, soft light and comfortable seating.', 2),
  ('img-anna-1', 'prj-anna-nagar-office', '/media/commercial.jpg', 'Modern workplace interior with desks, plants and natural light.', 1),
  ('img-anna-2', 'prj-anna-nagar-office', '/media/interior.jpg', 'Material palette and lounge area inside the workplace.', 2),
  ('img-perambur-1', 'prj-perambur-residence', '/media/facade.jpg', 'Two-storey family residence with a composed street elevation.', 1),
  ('img-perambur-2', 'prj-perambur-residence', '/media/site.jpg', 'Construction site showing a carefully coordinated building structure.', 2),
  ('img-ecr-1', 'prj-ecr-retreat', '/media/hero-work.jpg', 'Open living space concept for a relaxed coastal retreat.', 1),
  ('img-ecr-2', 'prj-ecr-retreat', '/media/design.jpg', 'Architectural drawings and material studies on a studio table.', 2)
on conflict (id) do nothing;

insert into testimonials (
  id, quote, author_name, author_role, location, published, display_order
) values
  ('test-1', 'The team made the process feel clear from the first drawing. We always knew what was being decided and what came next.', 'Ananya R.', 'Homeowner', 'Adyar, Chennai', true, 1),
  ('test-2', 'Grandeur understood that our workplace needed to feel welcoming without losing its practicality. The result works beautifully for the team.', 'Karthik S.', 'Business owner', 'Anna Nagar, Chennai', true, 2),
  ('test-3', 'The conversations about materials and maintenance were especially helpful. The house feels like ours, not a catalogue.', 'Meera and Arun', 'Homeowners', 'Perambur, Chennai', true, 3)
on conflict (id) do nothing;

insert into team_members (
  id, name, designation, bio, photo_url, display_order, published
) values
  ('team-1', 'Arjun Menon', 'Founder & Project Lead',
   'Leads the brief, programme and client conversations from the first meeting through handover.',
   '/media/facade.jpg', 1, true),
  ('team-2', 'Priya Krishnan', 'Design Coordinator',
   'Connects the design intent to drawings, material decisions and the details that make a space feel finished.',
   '/media/design.jpg', 2, true),
  ('team-3', 'Vikram Rao', 'Site & Quality Lead',
   'Coordinates site execution, checks the work against the approved drawings and keeps the programme visible.',
   '/media/site.jpg', 3, true)
on conflict (id) do nothing;

insert into blog_categories (id, slug, name) values
  ('cat-guides', 'building-guides', 'Building Guides'),
  ('cat-studio', 'studio-notes', 'Studio Notes')
on conflict (id) do nothing;

insert into blog_posts (
  id, slug, title, excerpt, content, category_id, featured_image, status,
  published_at, seo_title, seo_description
) values
  ('post-first-brief', 'what-to-prepare-before-building', 'What to prepare before building a home',
   'A practical starting point for turning an idea into a useful first conversation.',
   'Before the first meeting, gather the site address, any available documents, a rough idea of the spaces you need and the way you want the building to feel. You do not need a finished design. A clear conversation about priorities is the best place to begin.',
   'cat-guides', '/media/design.jpg', 'published', now(),
   'What to prepare before building a home | Grandeur Constructions',
   'A practical guide to preparing for your first building conversation in Chennai.'),
  ('post-materials', 'choosing-materials-that-age-well', 'Choosing materials that age well',
   'The best finish is one that suits the way a space will actually be used.',
   'Material choices should be considered alongside light, maintenance, budget and daily use. We prefer to compare a short list of durable options with the client rather than specify a finish in isolation.',
   'cat-studio', '/media/interior.jpg', 'published', now(),
   'Choosing materials that age well | Grandeur Constructions',
   'How to make practical, lasting material choices for homes and workplaces.')
on conflict (id) do nothing;
