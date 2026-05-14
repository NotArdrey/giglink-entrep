with restored_non_workers(user_id, role, is_worker) as (
  values
    ('bd777cf3-e9e0-464f-8a84-6d549aebf75b'::uuid, 'client', false),
    ('ea51cddf-a53c-4373-b44f-ed45528ec180'::uuid, 'client', false),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'admin', false),
    ('00000000-0000-4000-8000-000000000101'::uuid, 'client', false),
    ('d3fd6012-12a5-428c-b756-fa9127703d52'::uuid, 'admin', true),
    ('fb812c63-8ffe-4f80-8e19-d65721409ba9'::uuid, 'client', false)
)
update public.profiles p
set
  role = restored_non_workers.role,
  is_worker = restored_non_workers.is_worker,
  updated_at = now()
from restored_non_workers
where p.user_id = restored_non_workers.user_id;

with non_worker_providers as (
  select p.user_id
  from public.profiles p
  where p.role <> 'worker'
)
update public.services service
set
  active = false,
  updated_at = now()
from non_worker_providers
where service.seller_id = non_worker_providers.user_id;

with non_worker_providers as (
  select p.user_id
  from public.profiles p
  where p.role <> 'worker'
)
delete from public.seller_rating_aggregates aggregate_row
using non_worker_providers
where aggregate_row.seller_id = non_worker_providers.user_id;

with non_worker_providers as (
  select p.user_id
  from public.profiles p
  where p.role <> 'worker'
)
delete from public.reviews review
using non_worker_providers
where review.seller_id = non_worker_providers.user_id;

with worker_service_map(
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
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Computer & Printer Repair', 'Computer & Printer Repair', 'Repairs computer setups, printer issues, cable problems, and small office hardware on site.', 600::numeric, 'per-project', 'with-slots'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Wall Painting & Touch-ups', 'Wall Painting & Touch-ups', 'Handles small wall painting jobs, patch touch-ups, scuff cleanup, and room refresh work.', 1200::numeric, 'per-project', 'with-slots'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Handyman Home Repairs', 'Handyman Home Repairs', 'Fixes loose hinges, broken handles, shelves, simple carpentry issues, and other household repair tasks.', 650::numeric, 'per-project', 'with-slots')
)
update public.profiles p
set
  is_worker = true,
  role = 'worker',
  bio = worker_service_map.service_description,
  updated_at = now()
from worker_service_map
where p.user_id = worker_service_map.user_id;

with worker_service_map(
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
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Computer & Printer Repair', 'Computer & Printer Repair', 'Repairs computer setups, printer issues, cable problems, and small office hardware on site.', 600::numeric, 'per-project', 'with-slots'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Wall Painting & Touch-ups', 'Wall Painting & Touch-ups', 'Handles small wall painting jobs, patch touch-ups, scuff cleanup, and room refresh work.', 1200::numeric, 'per-project', 'with-slots'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Handyman Home Repairs', 'Handyman Home Repairs', 'Fixes loose hinges, broken handles, shelves, simple carpentry issues, and other household repair tasks.', 650::numeric, 'per-project', 'with-slots')
)
insert into public.worker_profiles (
  user_id,
  service_type,
  custom_service_type,
  bio,
  pricing_model,
  fixed_price,
  booking_mode,
  rate_basis,
  payment_advance,
  payment_after_service,
  after_service_payment_type,
  verification_status,
  updated_at
)
select
  user_id,
  service_type,
  null,
  service_description,
  'fixed',
  base_price,
  booking_mode,
  rate_basis,
  false,
  true,
  'both',
  'approved',
  now()
from worker_service_map
on conflict (user_id) do update
  set service_type = excluded.service_type,
      custom_service_type = excluded.custom_service_type,
      bio = excluded.bio,
      pricing_model = excluded.pricing_model,
      fixed_price = excluded.fixed_price,
      booking_mode = excluded.booking_mode,
      rate_basis = excluded.rate_basis,
      payment_advance = excluded.payment_advance,
      payment_after_service = excluded.payment_after_service,
      after_service_payment_type = excluded.after_service_payment_type,
      verification_status = excluded.verification_status,
      updated_at = excluded.updated_at;

with worker_service_map(
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
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Computer & Printer Repair', 'Computer & Printer Repair', 'Repairs computer setups, printer issues, cable problems, and small office hardware on site.', 600::numeric, 'per-project', 'with-slots'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Wall Painting & Touch-ups', 'Wall Painting & Touch-ups', 'Handles small wall painting jobs, patch touch-ups, scuff cleanup, and room refresh work.', 1200::numeric, 'per-project', 'with-slots'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Handyman Home Repairs', 'Handyman Home Repairs', 'Fixes loose hinges, broken handles, shelves, simple carpentry issues, and other household repair tasks.', 650::numeric, 'per-project', 'with-slots')
)
update public.sellers s
set
  headline = worker_service_map.service_type,
  tagline = worker_service_map.service_description,
  about = worker_service_map.service_description,
  is_verified = true,
  verification_status = 'approved',
  search_meta = coalesce(s.search_meta, '{}'::jsonb)
    || jsonb_build_object(
      'name', s.display_name,
      'service_type', worker_service_map.service_type,
      'bio', worker_service_map.service_description,
      'booking_mode', worker_service_map.booking_mode
    ),
  updated_at = now()
from worker_service_map
where s.user_id = worker_service_map.user_id;

with worker_service_map(
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
    ('89d4cadd-d482-45a3-aea8-a817d1ff92ed'::uuid, 'Computer & Printer Repair', 'Computer & Printer Repair', 'Repairs computer setups, printer issues, cable problems, and small office hardware on site.', 600::numeric, 'per-project', 'with-slots'),
    ('5f829a3e-b2a4-4b85-9294-336fd1344a69'::uuid, 'Wall Painting & Touch-ups', 'Wall Painting & Touch-ups', 'Handles small wall painting jobs, patch touch-ups, scuff cleanup, and room refresh work.', 1200::numeric, 'per-project', 'with-slots'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Handyman Home Repairs', 'Handyman Home Repairs', 'Fixes loose hinges, broken handles, shelves, simple carpentry issues, and other household repair tasks.', 650::numeric, 'per-project', 'with-slots')
),
ranked_services as (
  select
    service.id,
    service.seller_id,
    row_number() over (partition by service.seller_id order by service.active desc, service.created_at, service.id) as service_rank
  from public.services service
  join worker_service_map on worker_service_map.user_id = service.seller_id
)
update public.services service
set
  title = worker_service_map.service_title,
  slug = lower(regexp_replace(worker_service_map.service_title || '-' || worker_service_map.user_id::text, '[^a-z0-9]+', '-', 'g')),
  description = worker_service_map.service_description,
  short_description = worker_service_map.service_description,
  price_type = 'fixed',
  base_price = worker_service_map.base_price,
  currency = 'PHP',
  duration_minutes = null,
  active = true,
  rate_basis = worker_service_map.rate_basis,
  metadata = coalesce(service.metadata, '{}'::jsonb)
    || jsonb_build_object(
      'available', true,
      'pricing_model', 'fixed',
      'rate_basis', worker_service_map.rate_basis,
      'booking_mode', worker_service_map.booking_mode,
      'service_type', worker_service_map.service_type
    ),
  updated_at = now()
from ranked_services
join worker_service_map on worker_service_map.user_id = ranked_services.seller_id
where service.id = ranked_services.id
  and ranked_services.service_rank = 1;

with worker_sellers as (
  select user_id
  from public.profiles
  where role = 'worker'
),
existing_reviews as (
  select seller_id, count(*)::int as review_count
  from public.reviews
  group by seller_id
),
needed_reviews as (
  select
    worker_sellers.user_id as seller_id,
    greatest(0, 3 - coalesce(existing_reviews.review_count, 0)) as needed_count,
    row_number() over (order by worker_sellers.user_id) as seller_idx
  from worker_sellers
  left join existing_reviews on existing_reviews.seller_id = worker_sellers.user_id
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

insert into public.seller_rating_aggregates (
  seller_id,
  avg_rating,
  rating_count,
  updated_at
)
select
  worker_sellers.user_id,
  coalesce(avg(review.rating), 0)::numeric(3, 2),
  count(review.id)::int,
  now()
from (
  select user_id
  from public.profiles
  where role = 'worker'
) worker_sellers
left join public.reviews review
  on review.seller_id = worker_sellers.user_id
 and review.published is not false
group by worker_sellers.user_id
on conflict (seller_id) do update
  set avg_rating = excluded.avg_rating,
      rating_count = excluded.rating_count,
      updated_at = excluded.updated_at;
