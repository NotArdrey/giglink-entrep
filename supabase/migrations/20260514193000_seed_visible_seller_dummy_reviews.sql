with visible_sellers as (
  select
    s.user_id,
    row_number() over (order by s.created_at, s.user_id) as seller_idx
  from public.sellers s
  where exists (
    select 1
    from public.services service
    where service.seller_id = s.user_id
      and service.active = true
  )
),
reviewers as (
  select
    p.user_id,
    row_number() over (order by p.created_at, p.user_id) as reviewer_idx,
    count(*) over () as reviewer_count
  from public.profiles p
),
existing as (
  select seller_id, count(*)::int as review_count
  from public.reviews
  group by seller_id
),
review_slots as (
  select
    seller.user_id as seller_id,
    reviewer.user_id as reviewer_id,
    slot.n,
    seller.seller_idx,
    coalesce(existing.review_count, 0) as existing_count
  from visible_sellers seller
  cross join generate_series(1, 3) as slot(n)
  join reviewers reviewer
    on reviewer.reviewer_idx = (((seller.seller_idx + slot.n - 2)::int % reviewer.reviewer_count) + 1)
  left join existing on existing.seller_id = seller.user_id
  where reviewer.user_id <> seller.user_id
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
    when 1 then 'Reliable and easy to work with'
    when 2 then 'Great service experience'
    else 'Solid work and fast replies'
  end,
  case n
    when 1 then 'Demo review: arrived prepared, communicated clearly, and delivered the service smoothly.'
    when 2 then 'Demo review: professional, friendly, and handled the requested work with care.'
    else 'Demo review: quick to respond, organized with scheduling, and produced a good result.'
  end,
  n - 1,
  true,
  now() - ((seller_idx * 3 + n)::int * interval '1 day'),
  now() - ((seller_idx * 3 + n)::int * interval '1 day')
from review_slots
where n > existing_count;

with visible_sellers as (
  select s.user_id
  from public.sellers s
  where exists (
    select 1
    from public.services service
    where service.seller_id = s.user_id
      and service.active = true
  )
)
insert into public.seller_rating_aggregates (
  seller_id,
  avg_rating,
  rating_count,
  updated_at
)
select
  seller.user_id,
  coalesce(avg(review.rating), 0)::numeric(3, 2),
  count(review.id)::int,
  now()
from visible_sellers seller
left join public.reviews review
  on review.seller_id = seller.user_id
 and review.published is not false
group by seller.user_id
on conflict (seller_id) do update
  set avg_rating = excluded.avg_rating,
      rating_count = excluded.rating_count,
      updated_at = excluded.updated_at;
