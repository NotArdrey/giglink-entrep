-- Database-centered booking creation used by the web marketplace.
-- Keeps slot capacity checks and booked counts in the database instead of local UI state.

alter table public.bookings alter column slot_id drop default;
alter table public.bookings alter column slot_id drop not null;

create or replace function public.create_service_booking(
  p_service_id bigint,
  p_slot_id bigint default null,
  p_payment_method text default null,
  p_total_amount numeric default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buyer_id uuid := auth.uid();
  v_service public.services%rowtype;
  v_slot public.service_slots%rowtype;
  v_booked_count integer := 0;
  v_capacity integer := 1;
  v_booking public.bookings;
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
begin
  if v_buyer_id is null then
    raise exception 'Authentication required to create a booking'
      using errcode = '28000';
  end if;

  if p_payment_method is not null
    and p_payment_method not in ('gcash-advance', 'after-service-cash', 'after-service-gcash') then
    raise exception 'Invalid payment method'
      using errcode = '22023';
  end if;

  select *
  into v_service
  from public.services
  where id = p_service_id
    and active = true;

  if not found then
    raise exception 'Service is not available for booking'
      using errcode = 'P0002';
  end if;

  if p_slot_id is not null then
    select *
    into v_slot
    from public.service_slots
    where id = p_slot_id
      and service_id = p_service_id
      and seller_id = v_service.seller_id
    for update;

    if not found then
      raise exception 'Selected slot does not belong to this service'
        using errcode = 'P0002';
    end if;

    if v_slot.status <> 'available' then
      raise exception 'Selected slot is no longer available'
        using errcode = '23514';
    end if;

    select count(*)::integer
    into v_booked_count
    from public.bookings
    where slot_id = p_slot_id
      and status not in ('cancelled', 'refunded');

    v_capacity := greatest(coalesce(v_slot.capacity, 1), 1);

    if v_booked_count >= v_capacity then
      raise exception 'Selected slot is full'
        using errcode = '23514';
    end if;
  end if;

  insert into public.bookings (
    service_id,
    seller_id,
    buyer_id,
    slot_id,
    start_ts,
    end_ts,
    status,
    total_amount,
    currency,
    payment_reference,
    metadata
  )
  values (
    v_service.id,
    v_service.seller_id,
    v_buyer_id,
    p_slot_id,
    case when p_slot_id is null then null else v_slot.start_ts end,
    case when p_slot_id is null then null else v_slot.end_ts end,
    'confirmed',
    coalesce(p_total_amount, v_service.base_price),
    coalesce(v_service.currency, 'PHP'),
    null,
    v_metadata
      || jsonb_build_object(
        'payment_method', p_payment_method,
        'quote_approved', true,
        'created_via', 'create_service_booking'
      )
  )
  returning * into v_booking;

  if p_slot_id is not null then
    update public.service_slots
    set
      status = case when (v_booked_count + 1) >= v_capacity then 'booked' else status end,
      metadata = jsonb_set(
        coalesce(metadata, '{}'::jsonb),
        '{booked_count}',
        to_jsonb(v_booked_count + 1),
        true
      ),
      updated_at = now()
    where id = p_slot_id;
  end if;

  return v_booking;
end;
$$;

revoke all on function public.create_service_booking(bigint, bigint, text, numeric, jsonb) from public;
grant execute on function public.create_service_booking(bigint, bigint, text, numeric, jsonb) to authenticated;
