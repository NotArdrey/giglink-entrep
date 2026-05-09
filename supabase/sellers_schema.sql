-- ============================================================================
-- BECOME A SELLER FEATURE - Seller Tables & RLS Policies
-- ============================================================================
-- This file extends the main schema.sql with seller-related tables for the
-- "become a seller" feature. It includes sellers, services, slots, and related data.

-- 1) Sellers table - extends profiles for seller-specific info
create table if not exists public.sellers (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  display_name text,
  headline text,
  tagline text,
  about text,
  is_verified boolean not null default false,
  verification_status text not null default 'pending' check (verification_status in ('pending','approved','rejected')),
  response_time_minutes int default 1440,
  languages text[],
  default_currency text default 'PHP',
  business_hours jsonb,
  search_meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sellers_search_meta_idx on public.sellers using gin (search_meta);
create index if not exists sellers_languages_idx on public.sellers using gin (languages);

-- 2) Services offered by sellers
create table if not exists public.services (
  id bigserial primary key,
  seller_id uuid not null references public.sellers (user_id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  short_description text,
  category_id int,
  price_type text not null default 'fixed' check (price_type in ('fixed','hourly','custom','package')),
  base_price numeric(12,2),
  currency text default 'PHP',
  duration_minutes int,
  active boolean not null default true,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, slug)
);

create index if not exists services_fulltext_idx on public.services using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(short_description,'') || ' ' || coalesce(description,'')));
create index if not exists services_seller_idx on public.services (seller_id);
create index if not exists services_active_idx on public.services (active);

-- 3) Service categories
create table if not exists public.service_categories (
  id serial primary key,
  name text not null,
  slug text not null unique,
  parent_id int references public.service_categories (id) on delete set null
);

-- 4) Service photos
create table if not exists public.service_photos (
  id bigserial primary key,
  service_id bigint not null references public.services (id) on delete cascade,
  storage_path text,
  public_url text,
  caption text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create index if not exists service_photos_service_idx on public.service_photos (service_id);

-- 5) Portfolio items
create table if not exists public.portfolio_items (
  id bigserial primary key,
  seller_id uuid not null references public.sellers (user_id) on delete cascade,
  title text,
  description text,
  media jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_items_seller_idx on public.portfolio_items (seller_id);

-- 6) Seller certifications
create table if not exists public.seller_certifications (
  id bigserial primary key,
  seller_id uuid not null references public.sellers (user_id) on delete cascade,
  name text not null,
  issuing_organization text,
  issue_date date,
  expiry_date date,
  document_path text,
  verified boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists seller_certifications_seller_idx on public.seller_certifications (seller_id);

-- 7) Seller availability rules
create table if not exists public.seller_availability (
  id bigserial primary key,
  seller_id uuid not null references public.sellers (user_id) on delete cascade,
  type text not null default 'recurring' check (type in ('recurring','oneoff','blocked')),
  day_of_week int check (day_of_week between 0 and 6),
  start_time time,
  end_time time,
  start_date date,
  end_date date,
  timezone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seller_availability_seller_idx on public.seller_availability (seller_id);

-- 8) Service slots
create table if not exists public.service_slots (
  id bigserial primary key,
  service_id bigint not null references public.services (id) on delete cascade,
  seller_id uuid not null references public.sellers (user_id) on delete cascade,
  start_ts timestamptz not null,
  end_ts timestamptz not null,
  capacity int default 1,
  status text not null default 'available' check (status in ('available','booked','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_slots_time_idx on public.service_slots (seller_id, start_ts, end_ts);

-- 9) Bookings (client bookings of services)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id bigint not null references public.services (id) on delete restrict,
  seller_id uuid not null references public.sellers (user_id) on delete restrict,
  buyer_id uuid not null references public.profiles (user_id) on delete restrict,
  slot_id bigint references public.service_slots (id) on delete set null,
  start_ts timestamptz,
  end_ts timestamptz,
  status text not null default 'pending' check (status in ('pending','confirmed','in_progress','completed','cancelled','refunded')),
  total_amount numeric(12,2),
  currency text default 'PHP',
  payment_reference text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_seller_idx on public.bookings (seller_id);
create index if not exists bookings_buyer_idx on public.bookings (buyer_id);

-- 10) Conversations (chats with sellers about services)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  seller_id uuid references public.sellers (user_id) on delete cascade,
  buyer_id uuid references public.profiles (user_id) on delete cascade,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists conversations_seller_idx on public.conversations (seller_id);
create index if not exists conversations_buyer_idx on public.conversations (buyer_id);

-- 11) Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (user_id) on delete cascade,
  body text,
  attachments jsonb,
  read_by jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- 12) Reviews & ratings
create table if not exists public.reviews (
  id bigserial primary key,
  seller_id uuid not null references public.sellers (user_id) on delete cascade,
  reviewer_id uuid not null references public.profiles (user_id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  title text,
  body text,
  helpful_count int default 0,
  published boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_seller_idx on public.reviews (seller_id);
create index if not exists reviews_rating_idx on public.reviews (seller_id, rating);

-- 13) Seller rating aggregates
create table if not exists public.seller_rating_aggregates (
  seller_id uuid primary key references public.sellers (user_id) on delete cascade,
  avg_rating numeric(3,2) default 0,
  rating_count int default 0,
  updated_at timestamptz not null default now()
);

-- Function to maintain rating aggregates
create or replace function public.refresh_seller_rating_aggregate() returns trigger as $$
begin
  if (TG_OP = 'DELETE') then
    with agg as (
      select coalesce(avg(rating),0) as avg_rating, count(*) as cnt from public.reviews where seller_id = OLD.seller_id
    )
    update public.seller_rating_aggregates
    set avg_rating = agg.avg_rating, rating_count = agg.cnt, updated_at = now()
    from agg
    where seller_id = OLD.seller_id;
    return OLD;
  else
    with agg as (
      select coalesce(avg(rating),0) as avg_rating, count(*) as cnt from public.reviews where seller_id = NEW.seller_id
    )
    insert into public.seller_rating_aggregates (seller_id, avg_rating, rating_count, updated_at)
    values (NEW.seller_id, agg.avg_rating, agg.cnt, now())
    on conflict (seller_id) do update
      set avg_rating = excluded.avg_rating, rating_count = excluded.rating_count, updated_at = excluded.updated_at;
    return NEW;
  end if;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_reviews_refresh_agg on public.reviews;
create trigger trg_reviews_refresh_agg
after insert or update or delete on public.reviews
for each row execute procedure public.refresh_seller_rating_aggregate();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Sellers table RLS
alter table if exists public.sellers enable row level security;

drop policy if exists sellers_select_public on public.sellers;
create policy sellers_select_public
  on public.sellers
  for select
  using (true);

drop policy if exists sellers_insert_own on public.sellers;
create policy sellers_insert_own
  on public.sellers
  for insert
  with check (auth.uid() = user_id);

drop policy if exists sellers_update_own on public.sellers;
create policy sellers_update_own
  on public.sellers
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists sellers_delete_own on public.sellers;
create policy sellers_delete_own
  on public.sellers
  for delete
  using (auth.uid() = user_id);

-- Services table RLS
alter table if exists public.services enable row level security;

drop policy if exists services_select_public on public.services;
create policy services_select_public
  on public.services
  for select
  using (active = true);

drop policy if exists services_select_own on public.services;
create policy services_select_own
  on public.services
  for select
  using (auth.uid() = seller_id);

drop policy if exists services_insert_own on public.services;
create policy services_insert_own
  on public.services
  for insert
  with check (
    auth.uid() = seller_id
    and exists (select 1 from public.sellers s where s.user_id = auth.uid() and s.user_id = seller_id)
  );

drop policy if exists services_update_own on public.services;
create policy services_update_own
  on public.services
  for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists services_delete_own on public.services;
create policy services_delete_own
  on public.services
  for delete
  using (auth.uid() = seller_id);

-- Service photos RLS
alter table if exists public.service_photos enable row level security;

drop policy if exists service_photos_select_public on public.service_photos;
create policy service_photos_select_public
  on public.service_photos
  for select
  using (true);

drop policy if exists service_photos_insert_own on public.service_photos;
create policy service_photos_insert_own
  on public.service_photos
  for insert
  with check (
    exists (
      select 1 from public.services svc
      where svc.id = service_id
        and svc.seller_id = auth.uid()
    )
  );

drop policy if exists service_photos_update_own on public.service_photos;
create policy service_photos_update_own
  on public.service_photos
  for update
  using (
    exists (
      select 1 from public.services svc
      where svc.id = service_id
        and svc.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.services svc
      where svc.id = service_id
        and svc.seller_id = auth.uid()
    )
  );

drop policy if exists service_photos_delete_own on public.service_photos;
create policy service_photos_delete_own
  on public.service_photos
  for delete
  using (
    exists (
      select 1 from public.services svc
      where svc.id = service_id
        and svc.seller_id = auth.uid()
    )
  );

-- Service slots RLS
alter table if exists public.service_slots enable row level security;

drop policy if exists service_slots_select_public on public.service_slots;
create policy service_slots_select_public
  on public.service_slots
  for select
  using (status = 'available');

drop policy if exists service_slots_select_own on public.service_slots;
create policy service_slots_select_own
  on public.service_slots
  for select
  using (auth.uid() = seller_id);

drop policy if exists service_slots_insert_own on public.service_slots;
create policy service_slots_insert_own
  on public.service_slots
  for insert
  with check (auth.uid() = seller_id);

drop policy if exists service_slots_update_own on public.service_slots;
create policy service_slots_update_own
  on public.service_slots
  for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists service_slots_delete_own on public.service_slots;
create policy service_slots_delete_own
  on public.service_slots
  for delete
  using (auth.uid() = seller_id);

-- Bookings RLS
alter table if exists public.bookings enable row level security;

drop policy if exists bookings_select_own_sell on public.bookings;
create policy bookings_select_own_sell
  on public.bookings
  for select
  using (auth.uid() = seller_id);

drop policy if exists bookings_select_own_buy on public.bookings;
create policy bookings_select_own_buy
  on public.bookings
  for select
  using (auth.uid() = buyer_id);

drop policy if exists bookings_insert_buyer on public.bookings;
create policy bookings_insert_buyer
  on public.bookings
  for insert
  with check (auth.uid() = buyer_id);

drop policy if exists bookings_update_seller on public.bookings;
create policy bookings_update_seller
  on public.bookings
  for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists bookings_update_buyer on public.bookings;
create policy bookings_update_buyer
  on public.bookings
  for update
  using (auth.uid() = buyer_id)
  with check (auth.uid() = buyer_id);

-- Conversations RLS
alter table if exists public.conversations enable row level security;

drop policy if exists conversations_select_own on public.conversations;
create policy conversations_select_own
  on public.conversations
  for select
  using (auth.uid() = seller_id or auth.uid() = buyer_id);

drop policy if exists conversations_insert_own on public.conversations;
create policy conversations_insert_own
  on public.conversations
  for insert
  with check (auth.uid() = seller_id or auth.uid() = buyer_id);

drop policy if exists conversations_update_own on public.conversations;
create policy conversations_update_own
  on public.conversations
  for update
  using (auth.uid() = seller_id or auth.uid() = buyer_id)
  with check (auth.uid() = seller_id or auth.uid() = buyer_id);

-- Messages RLS
alter table if exists public.messages enable row level security;

drop policy if exists messages_select_participants on public.messages;
create policy messages_select_participants
  on public.messages
  for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.seller_id = auth.uid() or c.buyer_id = auth.uid())
    )
  );

drop policy if exists messages_insert_own on public.messages;
create policy messages_insert_own
  on public.messages
  for insert
  with check (auth.uid() = sender_id);

-- Portfolio items RLS
alter table if exists public.portfolio_items enable row level security;

drop policy if exists portfolio_items_select_public on public.portfolio_items;
create policy portfolio_items_select_public
  on public.portfolio_items
  for select
  using (true);

drop policy if exists portfolio_items_insert_own on public.portfolio_items;
create policy portfolio_items_insert_own
  on public.portfolio_items
  for insert
  with check (auth.uid() = seller_id);

drop policy if exists portfolio_items_update_own on public.portfolio_items;
create policy portfolio_items_update_own
  on public.portfolio_items
  for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists portfolio_items_delete_own on public.portfolio_items;
create policy portfolio_items_delete_own
  on public.portfolio_items
  for delete
  using (auth.uid() = seller_id);

-- Reviews RLS
alter table if exists public.reviews enable row level security;

drop policy if exists reviews_select_public on public.reviews;
create policy reviews_select_public
  on public.reviews
  for select
  using (published = true);

drop policy if exists reviews_insert_buyer on public.reviews;
create policy reviews_insert_buyer
  on public.reviews
  for insert
  with check (auth.uid() = reviewer_id);

-- Certifications RLS
alter table if exists public.seller_certifications enable row level security;

drop policy if exists certifications_select_public on public.seller_certifications;
create policy certifications_select_public
  on public.seller_certifications
  for select
  using (true);

drop policy if exists certifications_insert_own on public.seller_certifications;
create policy certifications_insert_own
  on public.seller_certifications
  for insert
  with check (auth.uid() = seller_id);

drop policy if exists certifications_update_own on public.seller_certifications;
create policy certifications_update_own
  on public.seller_certifications
  for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists certifications_delete_own on public.seller_certifications;
create policy certifications_delete_own
  on public.seller_certifications
  for delete
  using (auth.uid() = seller_id);

-- Availability RLS
alter table if exists public.seller_availability enable row level security;

drop policy if exists seller_availability_select_own on public.seller_availability;
create policy seller_availability_select_own
  on public.seller_availability
  for select
  using (auth.uid() = seller_id);

drop policy if exists seller_availability_insert_own on public.seller_availability;
create policy seller_availability_insert_own
  on public.seller_availability
  for insert
  with check (auth.uid() = seller_id);

drop policy if exists seller_availability_update_own on public.seller_availability;
create policy seller_availability_update_own
  on public.seller_availability
  for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists seller_availability_delete_own on public.seller_availability;
create policy seller_availability_delete_own
  on public.seller_availability
  for delete
  using (auth.uid() = seller_id);
