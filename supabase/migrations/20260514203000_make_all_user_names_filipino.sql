with filipino_identity_map(user_id, first_name, middle_name, last_name, full_name, city, barangay, province) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'Gabriel', 'Santos', 'Aquino', 'Gabriel Santos Aquino', 'Baliuag', 'Sabang', 'Bulacan'),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'Allan', 'Reyes', 'Bautista', 'Allan Reyes Bautista', 'Meycauayan', 'Poblacion', 'Bulacan'),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'Joshua', 'Paul', 'Santos', 'Joshua Paul Santos', 'Malolos', 'Tikay', 'Bulacan'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Beatriz', 'Dizon', 'Ramos', 'Beatriz Dizon Ramos', 'San Jose del Monte', 'Tungkong Mangga', 'Bulacan'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Sofia', 'Garcia', 'Cruz', 'Sofia Garcia Cruz', 'Baliwag', 'Sabang', 'Bulacan'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Marco', 'Villanueva', 'Reyes', 'Marco Villanueva Reyes', 'Baliuag', 'San Jose', 'Bulacan'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'Liza', 'Santos', 'Dela Cruz', 'Liza Santos Dela Cruz', 'Meycauayan', 'Camalig', 'Bulacan'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Andrea', 'Mendoza', 'Navarro', 'Andrea Mendoza Navarro', 'Marilao', 'Lias', 'Bulacan'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Paolo', 'Rivera', 'Mendoza', 'Paolo Rivera Mendoza', 'Baliwag', 'Poblacion', 'Bulacan'),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'Carla', 'Lopez', 'Manalo', 'Carla Lopez Manalo', 'Malolos', 'Guinhawa', 'Bulacan')
)
update public.profiles p
set
  first_name = filipino_identity_map.first_name,
  middle_name = filipino_identity_map.middle_name,
  last_name = filipino_identity_map.last_name,
  full_name = filipino_identity_map.full_name,
  city = filipino_identity_map.city,
  barangay = filipino_identity_map.barangay,
  province = filipino_identity_map.province,
  address = coalesce(nullif(p.address, ''), filipino_identity_map.barangay || ', ' || filipino_identity_map.city || ', ' || filipino_identity_map.province),
  updated_at = now()
from filipino_identity_map
where p.user_id = filipino_identity_map.user_id;

with filipino_identity_map(user_id, full_name, city, barangay, province) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'Gabriel Santos Aquino', 'Baliuag', 'Sabang', 'Bulacan'),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'Allan Reyes Bautista', 'Meycauayan', 'Poblacion', 'Bulacan'),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'Joshua Paul Santos', 'Malolos', 'Tikay', 'Bulacan'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Beatriz Dizon Ramos', 'San Jose del Monte', 'Tungkong Mangga', 'Bulacan'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Sofia Garcia Cruz', 'Baliwag', 'Sabang', 'Bulacan'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Marco Villanueva Reyes', 'Baliuag', 'San Jose', 'Bulacan'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'Liza Santos Dela Cruz', 'Meycauayan', 'Camalig', 'Bulacan'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Andrea Mendoza Navarro', 'Marilao', 'Lias', 'Bulacan'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Paolo Rivera Mendoza', 'Baliwag', 'Poblacion', 'Bulacan'),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'Carla Lopez Manalo', 'Malolos', 'Guinhawa', 'Bulacan')
)
update public.sellers s
set
  display_name = filipino_identity_map.full_name,
  search_meta = coalesce(s.search_meta, '{}'::jsonb)
    || jsonb_build_object(
      'name', filipino_identity_map.full_name,
      'location', jsonb_build_object(
        'city', filipino_identity_map.city,
        'barangay', filipino_identity_map.barangay,
        'province', filipino_identity_map.province
      )
    ),
  updated_at = now()
from filipino_identity_map
where s.user_id = filipino_identity_map.user_id;

with filipino_identity_map(user_id, first_name, middle_name, last_name, full_name, city, barangay, province) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'Gabriel', 'Santos', 'Aquino', 'Gabriel Santos Aquino', 'Baliuag', 'Sabang', 'Bulacan'),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'Allan', 'Reyes', 'Bautista', 'Allan Reyes Bautista', 'Meycauayan', 'Poblacion', 'Bulacan'),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'Joshua', 'Paul', 'Santos', 'Joshua Paul Santos', 'Malolos', 'Tikay', 'Bulacan'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Beatriz', 'Dizon', 'Ramos', 'Beatriz Dizon Ramos', 'San Jose del Monte', 'Tungkong Mangga', 'Bulacan'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Sofia', 'Garcia', 'Cruz', 'Sofia Garcia Cruz', 'Baliwag', 'Sabang', 'Bulacan'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Marco', 'Villanueva', 'Reyes', 'Marco Villanueva Reyes', 'Baliuag', 'San Jose', 'Bulacan'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'Liza', 'Santos', 'Dela Cruz', 'Liza Santos Dela Cruz', 'Meycauayan', 'Camalig', 'Bulacan'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Andrea', 'Mendoza', 'Navarro', 'Andrea Mendoza Navarro', 'Marilao', 'Lias', 'Bulacan'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Paolo', 'Rivera', 'Mendoza', 'Paolo Rivera Mendoza', 'Baliwag', 'Poblacion', 'Bulacan'),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'Carla', 'Lopez', 'Manalo', 'Carla Lopez Manalo', 'Malolos', 'Guinhawa', 'Bulacan')
)
update auth.users u
set raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object(
    'first_name', filipino_identity_map.first_name,
    'middle_name', filipino_identity_map.middle_name,
    'last_name', filipino_identity_map.last_name,
    'full_name', filipino_identity_map.full_name,
    'name', filipino_identity_map.full_name,
    'city', filipino_identity_map.city,
    'barangay', filipino_identity_map.barangay,
    'province', filipino_identity_map.province
  ),
  updated_at = now()
from filipino_identity_map
where u.id = filipino_identity_map.user_id;
