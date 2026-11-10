update team_members
set photo_url = case id
  when 'team-1' then 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=85'
  when 'team-2' then 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=85'
  when 'team-3' then 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=85'
  else photo_url
end
where id in ('team-1', 'team-2', 'team-3');
