insert into projects (
  id, slug, name, location, category, description, status, progress,
  completion_date, featured, featured_order, published
) values
  ('prj-besant-nagar-refresh', 'besant-nagar-interior-refresh', 'Besant Nagar Interior Refresh',
   'Besant Nagar, Chennai', 'interior',
   'A considered interior renovation that brings warmer materials, better storage and softer light to a family apartment.',
   'ongoing', null, null, false, 0, true),
  ('prj-velachery-villa', 'velachery-villa-renovation', 'Velachery Villa Renovation',
   'Velachery, Chennai', 'residential',
   'A phased renovation focused on a new kitchen, updated bathrooms and a more connected ground-floor living space.',
   'ongoing', null, null, false, 0, true)
on conflict (id) do nothing;

insert into project_images (id, project_id, url, alt, sort_order) values
  ('img-besant-1', 'prj-besant-nagar-refresh', '/media/interior.jpg',
   'Warm contemporary apartment interior with a dining table and layered lighting.', 1),
  ('img-besant-2', 'prj-besant-nagar-refresh', '/media/design.jpg',
   'Interior material palette and drawings prepared for the Besant Nagar renovation.', 2),
  ('img-velachery-1', 'prj-velachery-villa', '/media/hero-work.jpg',
   'Bright villa living room with a calm material palette and garden connection.', 1),
  ('img-velachery-2', 'prj-velachery-villa', '/media/residential.jpg',
   'Residential facade study for the Velachery villa renovation.', 2)
on conflict (id) do nothing;
