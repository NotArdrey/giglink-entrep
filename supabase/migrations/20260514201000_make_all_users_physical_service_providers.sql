with service_map(
  user_id,
  service_type,
  service_title,
  service_description,
  base_price,
  rate_basis,
  booking_mode
) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'Furniture Assembly & Minor Repairs', 'Furniture Assembly & Minor Repairs', 'Assembles shelves, cabinets, tables, and handles small household repairs on site.', 650::numeric, 'per-project', 'with-slots'),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'Plumbing Leak Repair', 'Plumbing Leak Repair', 'Fixes leaking faucets, clogged sinks, loose fittings, and basic bathroom or kitchen plumbing issues.', 550::numeric, 'per-project', 'with-slots'),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'Electrical Fixes', 'Electrical Fixes', 'Handles outlet replacement, light fixture installation, switch repairs, and basic electrical troubleshooting.', 700::numeric, 'per-project', 'with-slots'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Appliance Repair', 'Appliance Repair', 'Checks and repairs common appliance issues for fans, rice cookers, washing machines, and small home equipment.', 750::numeric, 'per-project', 'calendar-only'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Yard Cleanup & Home Organizing', 'Yard Cleanup & Home Organizing', 'Clears outdoor areas, organizes storage spaces, and helps prepare rooms for cleaning or repair work.', 500::numeric, 'per-day', 'calendar-only'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Computer & Printer Repair', 'Computer & Printer Repair', 'Repairs computer setups, printer issues, cable problems, and small office hardware on site.', 600::numeric, 'per-project', 'with-slots'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'Move-out Deep Cleaning', 'Move-out Deep Cleaning', 'Provides detailed cleaning for rooms, kitchens, bathrooms, floors, and move-out preparation.', 800::numeric, 'per-day', 'calendar-only'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Wall Painting & Touch-ups', 'Wall Painting & Touch-ups', 'Handles small wall painting jobs, patch touch-ups, scuff cleanup, and room refresh work.', 1200::numeric, 'per-project', 'with-slots'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Handyman Home Repairs', 'Handyman Home Repairs', 'Fixes loose hinges, broken handles, shelves, simple carpentry issues, and other household repair tasks.', 650::numeric, 'per-project', 'with-slots'),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'Laundry & General Cleaning', 'Laundry & General Cleaning', 'Provides laundry help, surface cleaning, room tidying, dishwashing, and general home cleaning support.', 500::numeric, 'per-day', 'with-slots')
),
profile_updates as (
  update public.profiles p
  set
    is_worker = true,
    role = case when p.role = 'admin' then 'admin' else 'worker' end,
    bio = coalesce(nullif(p.bio, ''), service_map.service_description),
    updated_at = now()
  from service_map
  where p.user_id = service_map.user_id
  returning p.user_id
)
insert into public.worker_profiles (
  user_id,
  service_type,
  custom_service_type,
  bio,
  pricing_model,
  fixed_price,
  hourly_rate,
  daily_rate,
  weekly_rate,
  monthly_rate,
  booking_mode,
  rate_basis,
  payment_advance,
  payment_after_service,
  after_service_payment_type,
  verification_status,
  updated_at
)
select
  service_map.user_id,
  service_map.service_type,
  null,
  service_map.service_description,
  'fixed',
  case when service_map.rate_basis = 'per-project' then service_map.base_price else null end,
  null,
  case when service_map.rate_basis = 'per-day' then service_map.base_price else null end,
  null,
  null,
  service_map.booking_mode,
  service_map.rate_basis,
  false,
  true,
  'both',
  'approved',
  now()
from service_map
on conflict (user_id) do update
  set service_type = excluded.service_type,
      custom_service_type = excluded.custom_service_type,
      bio = excluded.bio,
      pricing_model = excluded.pricing_model,
      fixed_price = excluded.fixed_price,
      hourly_rate = excluded.hourly_rate,
      daily_rate = excluded.daily_rate,
      weekly_rate = excluded.weekly_rate,
      monthly_rate = excluded.monthly_rate,
      booking_mode = excluded.booking_mode,
      rate_basis = excluded.rate_basis,
      payment_advance = excluded.payment_advance,
      payment_after_service = excluded.payment_after_service,
      after_service_payment_type = excluded.after_service_payment_type,
      verification_status = excluded.verification_status,
      updated_at = excluded.updated_at;

with service_map(
  user_id,
  service_type,
  service_title,
  service_description,
  base_price,
  rate_basis,
  booking_mode
) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'Furniture Assembly & Minor Repairs', 'Furniture Assembly & Minor Repairs', 'Assembles shelves, cabinets, tables, and handles small household repairs on site.', 650::numeric, 'per-project', 'with-slots'),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'Plumbing Leak Repair', 'Plumbing Leak Repair', 'Fixes leaking faucets, clogged sinks, loose fittings, and basic bathroom or kitchen plumbing issues.', 550::numeric, 'per-project', 'with-slots'),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'Electrical Fixes', 'Electrical Fixes', 'Handles outlet replacement, light fixture installation, switch repairs, and basic electrical troubleshooting.', 700::numeric, 'per-project', 'with-slots'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Appliance Repair', 'Appliance Repair', 'Checks and repairs common appliance issues for fans, rice cookers, washing machines, and small home equipment.', 750::numeric, 'per-project', 'calendar-only'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Yard Cleanup & Home Organizing', 'Yard Cleanup & Home Organizing', 'Clears outdoor areas, organizes storage spaces, and helps prepare rooms for cleaning or repair work.', 500::numeric, 'per-day', 'calendar-only'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Computer & Printer Repair', 'Computer & Printer Repair', 'Repairs computer setups, printer issues, cable problems, and small office hardware on site.', 600::numeric, 'per-project', 'with-slots'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'Move-out Deep Cleaning', 'Move-out Deep Cleaning', 'Provides detailed cleaning for rooms, kitchens, bathrooms, floors, and move-out preparation.', 800::numeric, 'per-day', 'calendar-only'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Wall Painting & Touch-ups', 'Wall Painting & Touch-ups', 'Handles small wall painting jobs, patch touch-ups, scuff cleanup, and room refresh work.', 1200::numeric, 'per-project', 'with-slots'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Handyman Home Repairs', 'Handyman Home Repairs', 'Fixes loose hinges, broken handles, shelves, simple carpentry issues, and other household repair tasks.', 650::numeric, 'per-project', 'with-slots'),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'Laundry & General Cleaning', 'Laundry & General Cleaning', 'Provides laundry help, surface cleaning, room tidying, dishwashing, and general home cleaning support.', 500::numeric, 'per-day', 'with-slots')
)
insert into public.sellers (
  user_id,
  display_name,
  headline,
  tagline,
  about,
  is_verified,
  verification_status,
  response_time_minutes,
  languages,
  default_currency,
  profile_photo,
  avatar_url,
  search_meta,
  updated_at
)
select
  p.user_id,
  p.full_name,
  service_map.service_type,
  service_map.service_description,
  service_map.service_description,
  true,
  'approved',
  120,
  array['en', 'fil'],
  'PHP',
  p.profile_photo,
  p.profile_photo,
  jsonb_build_object(
    'name', p.full_name,
    'service_type', service_map.service_type,
    'bio', service_map.service_description,
    'booking_mode', service_map.booking_mode,
    'location', jsonb_build_object(
      'city', coalesce(nullif(p.city, ''), 'Baliuag'),
      'province', coalesce(nullif(p.province, ''), 'Bulacan')
    )
  ),
  now()
from service_map
join public.profiles p on p.user_id = service_map.user_id
on conflict (user_id) do update
  set display_name = excluded.display_name,
      headline = excluded.headline,
      tagline = excluded.tagline,
      about = excluded.about,
      is_verified = excluded.is_verified,
      verification_status = excluded.verification_status,
      response_time_minutes = excluded.response_time_minutes,
      languages = excluded.languages,
      default_currency = excluded.default_currency,
      profile_photo = excluded.profile_photo,
      avatar_url = excluded.avatar_url,
      search_meta = excluded.search_meta,
      updated_at = excluded.updated_at;

with service_map(
  user_id,
  service_type,
  service_title,
  service_description,
  base_price,
  rate_basis,
  booking_mode
) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid, 'Furniture Assembly & Minor Repairs', 'Furniture Assembly & Minor Repairs', 'Assembles shelves, cabinets, tables, and handles small household repairs on site.', 650::numeric, 'per-project', 'with-slots'),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'Plumbing Leak Repair', 'Plumbing Leak Repair', 'Fixes leaking faucets, clogged sinks, loose fittings, and basic bathroom or kitchen plumbing issues.', 550::numeric, 'per-project', 'with-slots'),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'Electrical Fixes', 'Electrical Fixes', 'Handles outlet replacement, light fixture installation, switch repairs, and basic electrical troubleshooting.', 700::numeric, 'per-project', 'with-slots'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Appliance Repair', 'Appliance Repair', 'Checks and repairs common appliance issues for fans, rice cookers, washing machines, and small home equipment.', 750::numeric, 'per-project', 'calendar-only'),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Yard Cleanup & Home Organizing', 'Yard Cleanup & Home Organizing', 'Clears outdoor areas, organizes storage spaces, and helps prepare rooms for cleaning or repair work.', 500::numeric, 'per-day', 'calendar-only'),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Computer & Printer Repair', 'Computer & Printer Repair', 'Repairs computer setups, printer issues, cable problems, and small office hardware on site.', 600::numeric, 'per-project', 'with-slots'),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'Move-out Deep Cleaning', 'Move-out Deep Cleaning', 'Provides detailed cleaning for rooms, kitchens, bathrooms, floors, and move-out preparation.', 800::numeric, 'per-day', 'calendar-only'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Wall Painting & Touch-ups', 'Wall Painting & Touch-ups', 'Handles small wall painting jobs, patch touch-ups, scuff cleanup, and room refresh work.', 1200::numeric, 'per-project', 'with-slots'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Handyman Home Repairs', 'Handyman Home Repairs', 'Fixes loose hinges, broken handles, shelves, simple carpentry issues, and other household repair tasks.', 650::numeric, 'per-project', 'with-slots'),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'Laundry & General Cleaning', 'Laundry & General Cleaning', 'Provides laundry help, surface cleaning, room tidying, dishwashing, and general home cleaning support.', 500::numeric, 'per-day', 'with-slots')
),
ranked_services as (
  select
    service.id,
    service.seller_id,
    row_number() over (partition by service.seller_id order by service.active desc, service.created_at, service.id) as service_rank
  from public.services service
  join service_map on service_map.user_id = service.seller_id
),
updated_services as (
  update public.services service
  set
    title = service_map.service_title,
    slug = lower(regexp_replace(service_map.service_title || '-' || service_map.user_id::text, '[^a-z0-9]+', '-', 'g')),
    description = service_map.service_description,
    short_description = service_map.service_description,
    price_type = 'fixed',
    base_price = service_map.base_price,
    currency = 'PHP',
    duration_minutes = null,
    active = true,
    rate_basis = service_map.rate_basis,
    metadata = coalesce(service.metadata, '{}'::jsonb)
      || jsonb_build_object(
        'available', true,
        'pricing_model', 'fixed',
        'rate_basis', service_map.rate_basis,
        'booking_mode', service_map.booking_mode,
        'service_type', service_map.service_type
      ),
    updated_at = now()
  from ranked_services
  join service_map on service_map.user_id = ranked_services.seller_id
  where service.id = ranked_services.id
    and ranked_services.service_rank = 1
  returning service.seller_id
)
insert into public.services (
  seller_id,
  title,
  slug,
  description,
  short_description,
  price_type,
  base_price,
  currency,
  duration_minutes,
  active,
  rate_basis,
  metadata,
  created_at,
  updated_at
)
select
  service_map.user_id,
  service_map.service_title,
  lower(regexp_replace(service_map.service_title || '-' || service_map.user_id::text, '[^a-z0-9]+', '-', 'g')),
  service_map.service_description,
  service_map.service_description,
  'fixed',
  service_map.base_price,
  'PHP',
  null,
  true,
  service_map.rate_basis,
  jsonb_build_object(
    'available', true,
    'pricing_model', 'fixed',
    'rate_basis', service_map.rate_basis,
    'booking_mode', service_map.booking_mode,
    'service_type', service_map.service_type
  ),
  now(),
  now()
from service_map
where not exists (
  select 1 from updated_services where updated_services.seller_id = service_map.user_id
);

with service_map(user_id) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid),
    ('00000000-0000-4000-8000-000000000102'::uuid),
    ('00000000-0000-4000-8000-000000000101'::uuid),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid),
    ('00000000-0000-4000-8000-000000000103'::uuid),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid)
),
existing_reviews as (
  select seller_id, count(*)::int as review_count
  from public.reviews
  group by seller_id
),
needed_reviews as (
  select
    service_map.user_id as seller_id,
    greatest(0, 3 - coalesce(existing_reviews.review_count, 0)) as needed_count,
    row_number() over (order by service_map.user_id) as seller_idx
  from service_map
  left join existing_reviews on existing_reviews.seller_id = service_map.user_id
),
review_slots as (
  select
    needed_reviews.seller_id,
    reviewer.user_id as reviewer_id,
    slot.n,
    needed_reviews.seller_idx
  from needed_reviews
  cross join generate_series(1, needed_reviews.needed_count) as slot(n)
  cross join lateral (
    select p.user_id
    from public.profiles p
    where p.user_id <> needed_reviews.seller_id
    order by p.created_at, p.user_id
    offset ((needed_reviews.seller_idx + slot.n - 2)::int % greatest(1, (select count(*) from public.profiles p2 where p2.user_id <> needed_reviews.seller_id)))
    limit 1
  ) reviewer
)
insert into public.reviews (
  seller_id,
  reviewer_id,
  booking_id,
  rating,
  title,
  body,
  helpful_count,
  published,
  created_at,
  updated_at
)
select
  seller_id,
  reviewer_id,
  null,
  case when n = 3 then 4 else 5 end,
  case n
    when 1 then 'Reliable hands-on service'
    when 2 then 'Careful and professional'
    else 'Good repair and cleaning support'
  end,
  case n
    when 1 then 'Demo review: arrived prepared and handled the physical work neatly.'
    when 2 then 'Demo review: communicated clearly, brought the right tools, and finished the job well.'
    else 'Demo review: practical, punctual, and helpful for home repair or cleaning tasks.'
  end,
  n - 1,
  true,
  now() - ((seller_idx * 3 + n)::int * interval '1 day'),
  now() - ((seller_idx * 3 + n)::int * interval '1 day')
from review_slots;

with service_map(user_id) as (
  values
    ('55ed7c77-f8e8-4bfb-afd7-1a43421b1beb'::uuid),
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid),
    ('00000000-0000-4000-8000-000000000102'::uuid),
    ('00000000-0000-4000-8000-000000000101'::uuid),
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid),
    ('00000000-0000-4000-8000-000000000103'::uuid),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid)
)
insert into public.seller_rating_aggregates (
  seller_id,
  avg_rating,
  rating_count,
  updated_at
)
select
  service_map.user_id,
  coalesce(avg(review.rating), 0)::numeric(3, 2),
  count(review.id)::int,
  now()
from service_map
left join public.reviews review
  on review.seller_id = service_map.user_id
 and review.published is not false
group by service_map.user_id
on conflict (seller_id) do update
  set avg_rating = excluded.avg_rating,
      rating_count = excluded.rating_count,
      updated_at = excluded.updated_at;
