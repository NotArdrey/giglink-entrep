create or replace function public.default_profile_image_url(p_user_id uuid)
returns text
language sql
immutable
set search_path = public
as $$
  select 'https://randomuser.me/api/portraits/'
    || case when (sum_ascii % 2) = 0 then 'men' else 'women' end
    || '/'
    || ((sum_ascii % 90) + 1)::text
    || '.jpg'
  from (
    select sum(ascii(substr(p_user_id::text, position, 1)))::int as sum_ascii
    from generate_series(1, length(p_user_id::text)) as position
  ) hashed;
$$;

with identity_map(user_id, first_name, middle_name, last_name, full_name, photo_url, seller_name) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'Gabriel', null, 'Aquino', 'Gabriel Aquino', 'https://randomuser.me/api/portraits/men/32.jpg', 'Gabriel Aquino'),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'Allen', null, 'Bautista', 'Allen Bautista', 'https://randomuser.me/api/portraits/men/41.jpg', null),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'Joshua', 'Paul', 'Santos', 'Joshua Paul Santos', 'https://randomuser.me/api/portraits/men/52.jpg', null),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Beatriz', null, 'Ramos', 'Beatriz Ramos', 'https://randomuser.me/api/portraits/women/44.jpg', null),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Sofia', null, 'Cruz', 'Sofia Cruz', 'https://randomuser.me/api/portraits/women/65.jpg', 'Sofia Cruz'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Marco', null, 'Reyes', 'Marco Reyes', 'https://randomuser.me/api/portraits/men/75.jpg', 'Marco Reyes'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'Liza', null, 'Dela Cruz', 'Liza Dela Cruz', 'https://randomuser.me/api/portraits/women/68.jpg', 'Liza Dela Cruz'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Andrea', null, 'Navarro', 'Andrea Navarro', 'https://randomuser.me/api/portraits/women/12.jpg', 'Andrea Navarro'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Paolo', null, 'Mendoza', 'Paolo Mendoza', 'https://randomuser.me/api/portraits/men/68.jpg', 'Paolo Mendoza'),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'Carla', null, 'Manalo', 'Carla Manalo', 'https://randomuser.me/api/portraits/women/26.jpg', null)
)
update public.profiles p
set
  first_name = identity_map.first_name,
  middle_name = identity_map.middle_name,
  last_name = identity_map.last_name,
  full_name = identity_map.full_name,
  profile_photo = identity_map.photo_url,
  updated_at = now()
from identity_map
where p.user_id = identity_map.user_id;

with identity_map(user_id, full_name, photo_url, seller_name) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'Gabriel Aquino', 'https://randomuser.me/api/portraits/men/32.jpg', 'Gabriel Aquino'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Sofia Cruz', 'https://randomuser.me/api/portraits/women/65.jpg', 'Sofia Cruz'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Marco Reyes', 'https://randomuser.me/api/portraits/men/75.jpg', 'Marco Reyes'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'Liza Dela Cruz', 'https://randomuser.me/api/portraits/women/68.jpg', 'Liza Dela Cruz'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Andrea Navarro', 'https://randomuser.me/api/portraits/women/12.jpg', 'Andrea Navarro'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Paolo Mendoza', 'https://randomuser.me/api/portraits/men/68.jpg', 'Paolo Mendoza')
)
update public.sellers s
set
  display_name = identity_map.seller_name,
  profile_photo = identity_map.photo_url,
  avatar_url = identity_map.photo_url,
  search_meta = coalesce(s.search_meta, '{}'::jsonb)
    || jsonb_build_object('name', identity_map.seller_name),
  updated_at = now()
from identity_map
where s.user_id = identity_map.user_id;

with identity_map(user_id, full_name, photo_url) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'Gabriel Aquino', 'https://randomuser.me/api/portraits/men/32.jpg'),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'Allen Bautista', 'https://randomuser.me/api/portraits/men/41.jpg'),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'Joshua Paul Santos', 'https://randomuser.me/api/portraits/men/52.jpg'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Beatriz Ramos', 'https://randomuser.me/api/portraits/women/44.jpg'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Sofia Cruz', 'https://randomuser.me/api/portraits/women/65.jpg'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Marco Reyes', 'https://randomuser.me/api/portraits/men/75.jpg'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'Liza Dela Cruz', 'https://randomuser.me/api/portraits/women/68.jpg'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Andrea Navarro', 'https://randomuser.me/api/portraits/women/12.jpg'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Paolo Mendoza', 'https://randomuser.me/api/portraits/men/68.jpg'),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'Carla Manalo', 'https://randomuser.me/api/portraits/women/26.jpg')
)
update auth.users u
set raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object(
    'full_name', identity_map.full_name,
    'name', identity_map.full_name,
    'profile_photo', identity_map.photo_url,
    'avatar_url', identity_map.photo_url
  ),
  updated_at = now()
from identity_map
where u.id = identity_map.user_id;
