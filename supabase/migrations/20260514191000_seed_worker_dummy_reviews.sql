create or replace function public.refresh_seller_rating_aggregate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_seller_id uuid;
begin
  target_seller_id := coalesce(new.seller_id, old.seller_id);

  insert into public.seller_rating_aggregates (
    seller_id,
    avg_rating,
    rating_count,
    updated_at
  )
  select
    target_seller_id,
    coalesce(avg(r.rating), 0)::numeric(3, 2),
    count(r.id)::int,
    now()
  from public.reviews r
  where r.seller_id = target_seller_id
    and r.published is not false
  on conflict (seller_id) do update
    set avg_rating = excluded.avg_rating,
        rating_count = excluded.rating_count,
        updated_at = excluded.updated_at;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_reviews_refresh_agg on public.reviews;
create trigger trg_reviews_refresh_agg
after insert or update or delete on public.reviews
for each row execute function public.refresh_seller_rating_aggregate();

with workers as (
  select
    p.user_id,
    row_number() over (order by p.created_at, p.user_id) as worker_idx
  from public.profiles p
  join public.sellers s on s.user_id = p.user_id
  where p.role = 'worker'
     or coalesce(p.is_worker, false) = true
),
clients as (
  select
    p.user_id,
    row_number() over (order by p.created_at, p.user_id) as client_idx,
    count(*) over () as client_count
  from public.profiles p
  where p.role <> 'worker'
    and coalesce(p.is_worker, false) = false
),
existing as (
  select seller_id, count(*)::int as review_count
  from public.reviews
  group by seller_id
),
review_slots as (
  select
    w.user_id as seller_id,
    c.user_id as reviewer_id,
    slot.n,
    w.worker_idx,
    coalesce(e.review_count, 0) as existing_count
  from workers w
  cross join generate_series(1, 3) as slot(n)
  join clients c
    on c.client_idx = (((w.worker_idx + slot.n - 2)::int % c.client_count) + 1)
  left join existing e on e.seller_id = w.user_id
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
  now() - ((worker_idx * 3 + n)::int * interval '1 day'),
  now() - ((worker_idx * 3 + n)::int * interval '1 day')
from review_slots
where n > existing_count;

with worker_sellers as (
  select p.user_id
  from public.profiles p
  join public.sellers s on s.user_id = p.user_id
  where p.role = 'worker'
     or coalesce(p.is_worker, false) = true
)
insert into public.seller_rating_aggregates (
  seller_id,
  avg_rating,
  rating_count,
  updated_at
)
select
  w.user_id,
  coalesce(avg(r.rating), 0)::numeric(3, 2),
  count(r.id)::int,
  now()
from worker_sellers w
left join public.reviews r
  on r.seller_id = w.user_id
 and r.published is not false
group by w.user_id
on conflict (seller_id) do update
  set avg_rating = excluded.avg_rating,
      rating_count = excluded.rating_count,
      updated_at = excluded.updated_at;
