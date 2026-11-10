update faqs set
  question = 'Can you help with CMDA approvals and permits?',
  answer = 'Yes. We identify the approvals relevant to the site and coordinate the drawing and documentation requirements with the appointed consultants. Timelines depend on the property and authority review.'
where id = 'faq-1';

update faqs set
  question = 'How long does a typical home project take?',
  answer = 'A new home commonly takes 10 to 16 months from approved drawings to handover. The programme is refined after the site, scope, approvals and material decisions are confirmed.'
where id = 'faq-2';

update faqs set
  question = 'What should I prepare before the first meeting?',
  answer = 'Share the site location, available documents, a rough budget range and the spaces you need. A finished design is not required; we use the first conversation to shape the brief.'
where id = 'faq-3';

update faqs set
  question = 'How are fees and construction bills staged?',
  answer = 'Design fees are agreed before the drawing stage. Construction payments are tied to documented milestones such as foundation, structure, masonry, services and finishes, with changes discussed before extra work proceeds.'
where id = 'faq-4';

update faqs set
  question = 'Do you handle renovations and interior upgrades?',
  answer = 'Yes. We can scope a renovation, interior refresh or full fit-out after reviewing the existing condition, access, services and the way the space is used.'
where id = 'faq-5';

update faqs set
  question = 'Where do you take on projects?',
  answer = 'The studio is based in Perambur and works across Chennai, including Anna Nagar, Adyar, Besant Nagar, ECR and nearby neighbourhoods. Share the location and we will confirm whether the brief is a fit.'
where id = 'faq-6';

update project_images set alt = case project_id
  when 'prj-adyar-courtyard' then 'Modern two-storey residence facade in Adyar featuring timber louvers and exposed concrete'
  when 'prj-anna-nagar-workplace' then 'Contemporary Anna Nagar workplace with warm timber desks and generous daylight'
  when 'prj-perambur-residence' then 'Perambur family residence under construction with a strong concrete frame'
  when 'prj-ecr-retreat' then 'Coastal retreat concept with an open living room and calm natural materials'
  else alt
end;

update testimonials set
  quote = 'The team understood how we wanted our home to feel and kept every decision clear from the first drawing to handover.',
  author_name = 'Ananya R.',
  author_role = 'Residential client',
  location = 'Adyar, Chennai'
where id = 'test-1';

update testimonials set
  quote = 'Our new workplace feels calm, practical and unmistakably ours. The site coordination made a complex fit-out feel manageable.',
  author_name = 'Karthik S.',
  author_role = 'Commercial client',
  location = 'Anna Nagar, Chennai'
where id = 'test-2';

update testimonials set
  quote = 'The renovation gave our old rooms a completely new rhythm without losing the character of the house.',
  author_name = 'Meera P.',
  author_role = 'Interior renovation client',
  location = 'Besant Nagar, Chennai'
where id = 'test-3';
