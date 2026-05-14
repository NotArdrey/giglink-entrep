create or replace function public.default_profile_image_url(p_user_id uuid)
returns text
language sql
immutable
set search_path = public
as $$
  select photos[
    (
      (
        select sum(ascii(substr(p_user_id::text, position, 1)))::int
        from generate_series(1, length(p_user_id::text)) as position
      ) % array_length(photos, 1)
    ) + 1
  ]
  from (
    select array[
      'https://images.pexels.com/photos/18166927/pexels-photo-18166927.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
      'https://images.pexels.com/photos/20687407/pexels-photo-20687407.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
      'https://images.pexels.com/photos/18924728/pexels-photo-18924728.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
      'https://images.pexels.com/photos/5363274/pexels-photo-5363274.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
      'https://images.pexels.com/photos/2411795/pexels-photo-2411795.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
      'https://images.pexels.com/photos/10501790/pexels-photo-10501790.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
      'https://images.pexels.com/photos/8840560/pexels-photo-8840560.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
      'https://images.pexels.com/photos/36130657/pexels-photo-36130657.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
      'https://images.pexels.com/photos/6445627/pexels-photo-6445627.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256',
      'https://images.pexels.com/photos/13883040/pexels-photo-13883040.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'
    ] as photos
  ) photo_pool;
$$;

with portrait_map(user_id, photo_url) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'https://images.pexels.com/photos/18166927/pexels-photo-18166927.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'https://images.pexels.com/photos/20687407/pexels-photo-20687407.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'https://images.pexels.com/photos/2411795/pexels-photo-2411795.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'https://images.pexels.com/photos/10501790/pexels-photo-10501790.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'https://images.pexels.com/photos/6445627/pexels-photo-6445627.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'https://images.pexels.com/photos/5363274/pexels-photo-5363274.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'https://images.pexels.com/photos/36130657/pexels-photo-36130657.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'https://images.pexels.com/photos/8840560/pexels-photo-8840560.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'https://images.pexels.com/photos/18924728/pexels-photo-18924728.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'https://images.pexels.com/photos/13883040/pexels-photo-13883040.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256')
)
update public.profiles p
set
  profile_photo = portrait_map.photo_url,
  updated_at = now()
from portrait_map
where p.user_id = portrait_map.user_id;

with portrait_map(user_id, photo_url) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'https://images.pexels.com/photos/18166927/pexels-photo-18166927.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'https://images.pexels.com/photos/20687407/pexels-photo-20687407.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'https://images.pexels.com/photos/2411795/pexels-photo-2411795.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'https://images.pexels.com/photos/10501790/pexels-photo-10501790.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'https://images.pexels.com/photos/6445627/pexels-photo-6445627.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'https://images.pexels.com/photos/5363274/pexels-photo-5363274.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'https://images.pexels.com/photos/36130657/pexels-photo-36130657.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'https://images.pexels.com/photos/8840560/pexels-photo-8840560.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'https://images.pexels.com/photos/18924728/pexels-photo-18924728.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'https://images.pexels.com/photos/13883040/pexels-photo-13883040.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256')
)
update public.sellers s
set
  profile_photo = portrait_map.photo_url,
  avatar_url = portrait_map.photo_url,
  updated_at = now()
from portrait_map
where s.user_id = portrait_map.user_id;

with portrait_map(user_id, photo_url) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'https://images.pexels.com/photos/18166927/pexels-photo-18166927.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'https://images.pexels.com/photos/20687407/pexels-photo-20687407.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'https://images.pexels.com/photos/2411795/pexels-photo-2411795.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'https://images.pexels.com/photos/10501790/pexels-photo-10501790.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'https://images.pexels.com/photos/6445627/pexels-photo-6445627.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'https://images.pexels.com/photos/5363274/pexels-photo-5363274.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'https://images.pexels.com/photos/36130657/pexels-photo-36130657.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'https://images.pexels.com/photos/8840560/pexels-photo-8840560.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'https://images.pexels.com/photos/18924728/pexels-photo-18924728.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256'),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'https://images.pexels.com/photos/13883040/pexels-photo-13883040.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=256&w=256')
)
update auth.users u
set
  raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object(
      'profile_photo', portrait_map.photo_url,
      'avatar_url', portrait_map.photo_url
    ),
  updated_at = now()
from portrait_map
where u.id = portrait_map.user_id;
