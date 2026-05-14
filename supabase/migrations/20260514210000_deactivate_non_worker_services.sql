update public.services service_row
set
  active = false,
  updated_at = now()
where service_row.active = true
  and exists (
    select 1
    from public.profiles profile_row
    where profile_row.user_id = service_row.seller_id
      and (
        coalesce(profile_row.role, 'client') <> 'worker'
        or coalesce(profile_row.is_worker, false) = false
      )
  );

delete from public.reviews review_row
where exists (
  select 1
  from public.profiles profile_row
  where profile_row.user_id = review_row.seller_id
    and (
      coalesce(profile_row.role, 'client') <> 'worker'
      or coalesce(profile_row.is_worker, false) = false
    )
);

delete from public.seller_rating_aggregates aggregate_row
where exists (
  select 1
  from public.profiles profile_row
  where profile_row.user_id = aggregate_row.seller_id
    and (
      coalesce(profile_row.role, 'client') <> 'worker'
      or coalesce(profile_row.is_worker, false) = false
    )
);
