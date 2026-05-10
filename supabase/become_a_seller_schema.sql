-- BEGIN: Become-a-Seller feature schema
-- Note: This is standalone SQL. Adjust schema names, enums, and FK targets to fit your DB.
-- Recommended storage buckets (Supabase): "seller-photos", "service-photos", "seller-certificates"

-- 1) Seller core (extends existing profiles)
create table if not exists public.sellers (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  display_name text,
  headline text,
  tagline text,
  about text,
  is_verified boolean not null default false,
  verification_status text not null default 'pending' check (verification_status in ('pending','approved','rejected')),
  response_time_minutes int default 1440, -- expected average response time
  languages text[], -- e.g. ['en','tl']
  default_currency text default 'PHP',
  business_hours jsonb, -- optional flexible schedule summary
  search_meta jsonb, -- denormalized searchable fields (cache)
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
  category_id int, -- FK to categories (below)
  price_type text not null default 'fixed' check (price_type in ('fixed','hourly','custom','package')),
  base_price numeric(12,2), -- preferred base price
  currency text default 'PHP',
  duration_minutes int, -- typical service length
  active boolean not null default true,
  metadata jsonb, -- flexible options, attributes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_id, slug)
);

create index if not exists services_fulltext_idx on public.services using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(short_description,'') || ' ' || coalesce(description,'')));

-- 3) Service categories & tags
create table if not exists public.service_categories (
  id serial primary key,
  name text not null,
  slug text not null unique,
  parent_id int references public.service_categories (id) on delete set null
);

create table if not exists public.service_tags (
  id serial primary key,
  name text not null unique
);

create table if not exists public.service_tag_map (
  service_id bigint not null references public.services (id) on delete cascade,
  tag_id int not null references public.service_tags (id) on delete cascade,
  primary key (service_id, tag_id)
);

-- 4) Service photos & portfolio items (media URLs point to storage)
create table if not exists public.service_photos (
  id bigserial primary key,
  service_id bigint not null references public.services (id) on delete cascade,
  storage_path text, -- e.g. 'service-photos/<seller_id>/<filename>'
  public_url text, -- optional public URL (signed or public)
  caption text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_items (
  id bigserial primary key,
  seller_id uuid not null references public.sellers (user_id) on delete cascade,
  title text,
  description text,
  media jsonb, -- array of {storage_path, public_url, mime}
  created_at timestamptz not null default now()
);

-- 5) Certifications / credentials
create table if not exists public.seller_certifications (
  id bigserial primary key,
  seller_id uuid not null references public.sellers (user_id) on delete cascade,
  name text not null,
  issuing_organization text,
  issue_date date,
  expiry_date date,
  document_path text, -- stored in "seller-certificates" bucket
  verified boolean default false,
  created_at timestamptz not null default now()
);

-- 6) Availability rules (recurring or one-off) and explicit blocked windows
create table if not exists public.seller_availability (
  id bigserial primary key,
  seller_id uuid not null references public.sellers (user_id) on delete cascade,
  type text not null default 'recurring' check (type in ('recurring','oneoff','blocked')),
  -- for recurring: day_of_week 0-6 (null for oneoff)
  day_of_week int check (day_of_week between 0 and 6),
  start_time time, -- local time
  end_time time,
  start_date date, -- for oneoff/range begin
  end_date date,   -- for oneoff/range end
  timezone text, -- IANA tz
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seller_availability_seller_idx on public.seller_availability (seller_id);

-- 7) Derived slots (optional table used when seller publishes time slots for bookings)
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

-- 8) Bookings (integration point with buyer/checkout flow)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id bigint not null references public.services (id) on delete restrict,
  seller_id uuid not null references public.sellers (user_id) on delete restrict,
  buyer_id uuid not null references public.profiles (user_id) on delete restrict,
  slot_id bigserial references public.service_slots (id) on delete set null,
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

-- 9) Reviews & ratings
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

-- Denormalized aggregate table for fast dashboard display
create table if not exists public.seller_rating_aggregates (
  seller_id uuid primary key references public.sellers (user_id) on delete cascade,
  avg_rating numeric(3,2) default 0,
  rating_count int default 0,
  updated_at timestamptz not null default now()
);

-- Function + trigger to maintain aggregates
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

-- 10) Chat / conversation integration (link chats to bookings / seller)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  seller_id uuid references public.sellers (user_id) on delete cascade,
  buyer_id uuid references public.profiles (user_id) on delete cascade,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (user_id) on delete cascade,
  body text,
  attachments jsonb, -- array of {storage_path, public_url, mime}
  read_by jsonb default '[]'::jsonb, -- array of user ids who read
  created_at timestamptz not null default now()
);

create index if not exists conv_seller_idx on public.conversations (seller_id);
create index if not exists msg_conv_idx on public.messages (conversation_id, created_at);

-- 11) Skills / seller tags (faceted search)
create table if not exists public.skills (
  id serial primary key,
  name text not null unique
);

create table if not exists public.seller_skills (
  seller_id uuid not null references public.sellers (user_id) on delete cascade,
  skill_id int not null references public.skills (id) on delete cascade,
  proficiency text, -- beginner/intermediate/expert
  years_experience numeric(4,2),
  primary key (seller_id, skill_id)
);

-- 12) Service options / add-ons
create table if not exists public.service_options (
  id bigserial primary key,
  service_id bigint not null references public.services (id) on delete cascade,
  title text not null,
  description text,
  price numeric(12,2),
  currency text default 'PHP',
  created_at timestamptz not null default now()
);

-- 13) Audit / activity log (optional)
create table if not exists public.seller_activity_logs (
  id bigserial primary key,
  seller_id uuid not null references public.sellers (user_id) on delete cascade,
  actor_id uuid references public.profiles (user_id),
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- Useful indexes for dashboard filters (top-rated, new, verified)
create index if not exists sellers_verified_idx on public.sellers (is_verified);
create index if not exists services_active_idx on public.services (active);

-- RLS EXAMPLES (apply as-needed)
-- Enable row-level security on tables that will be modified by clients
-- e.g. for sellers and services:
-- alter table public.sellers enable row level security;
-- create policy "sellers_update_own" on public.sellers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- create policy "services_insert_own" on public.services for insert with check (auth.uid() = seller_id and auth.uid() = seller_id);
-- create policy "service_photos_insert" on public.service_photos for insert with check (exists (select 1 from public.sellers s where s.user_id = auth.uid() and s.user_id = new.service_id));

-- END: Become-a-Seller feature schema

-- === Become-a-Seller: Final RLS policies ===
-- Run this AFTER creating the Become-a-Seller tables.

-- 1) Sellers
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


-- 2) Services
alter table if exists public.services enable row level security;

drop policy if exists services_select_public on public.services;
create policy services_select_public
  on public.services
  for select
  using (active = true);

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


-- 3) Service photos
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


-- 4) Portfolio items
alter table if exists public.portfolio_items enable row level security;

drop policy if exists portfolio_select_public on public.portfolio_items;
create policy portfolio_select_public
  on public.portfolio_items
  for select
  using (true);

drop policy if exists portfolio_insert_own on public.portfolio_items;
create policy portfolio_insert_own
  on public.portfolio_items
  for insert
  with check (auth.uid() = seller_id);

drop policy if exists portfolio_update_own on public.portfolio_items;
create policy portfolio_update_own
  on public.portfolio_items
  for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists portfolio_delete_own on public.portfolio_items;
create policy portfolio_delete_own
  on public.portfolio_items
  for delete
  using (auth.uid() = seller_id);


-- 5) Certifications
alter table if exists public.seller_certifications enable row level security;

drop policy if exists certs_select_public on public.seller_certifications;
create policy certs_select_public
  on public.seller_certifications
  for select
  using (true);

drop policy if exists certs_mutate_own on public.seller_certifications;
create policy certs_mutate_own
  on public.seller_certifications
  for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);


-- 6) Availability
alter table if exists public.seller_availability enable row level security;

drop policy if exists availability_select_public on public.seller_availability;
create policy availability_select_public
  on public.seller_availability
  for select
  using (true);

drop policy if exists availability_mutate_own on public.seller_availability;
create policy availability_mutate_own
  on public.seller_availability
  for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);


-- 7) Service slots
alter table if exists public.service_slots enable row level security;

drop policy if exists slots_select_public on public.service_slots;
create policy slots_select_public
  on public.service_slots
  for select
  using (status = 'available');

drop policy if exists slots_mutate_own on public.service_slots;
create policy slots_mutate_own
  on public.service_slots
  for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);


-- 8) Bookings
alter table if exists public.bookings enable row level security;

drop policy if exists bookings_insert_buyer on public.bookings;
create policy bookings_insert_buyer
  on public.bookings
  for insert
  with check (auth.uid() = buyer_id);

drop policy if exists bookings_select_participant on public.bookings;
create policy bookings_select_participant
  on public.bookings
  for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists bookings_update_participant on public.bookings;
create policy bookings_update_participant
  on public.bookings
  for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id)
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);


-- 9) Reviews
alter table if exists public.reviews enable row level security;

drop policy if exists reviews_select_public on public.reviews;
create policy reviews_select_public
  on public.reviews
  for select
  using (published = true);

drop policy if exists reviews_insert_verified_buyer on public.reviews;
create policy reviews_insert_verified_buyer
  on public.reviews
  for insert
  with check (
    auth.uid() = reviewer_id
    and (
      booking_id is null
      or exists (select 1 from public.bookings b where b.id = booking_id and b.buyer_id = auth.uid())
    )
  );

drop policy if exists reviews_update_owner on public.reviews;
create policy reviews_update_owner
  on public.reviews
  for update
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);

drop policy if exists reviews_delete_owner on public.reviews;
create policy reviews_delete_owner
  on public.reviews
  for delete
  using (auth.uid() = reviewer_id);


-- 10) Chat (conversations + messages)
alter table if exists public.conversations enable row level security;

drop policy if exists conversations_select_participant on public.conversations;
create policy conversations_select_participant
  on public.conversations
  for select
  using (auth.uid() = seller_id or auth.uid() = buyer_id);

drop policy if exists conversations_insert_participant on public.conversations;
create policy conversations_insert_participant
  on public.conversations
  for insert
  with check (auth.uid() = seller_id or auth.uid() = buyer_id);

drop policy if exists conversations_update_participant on public.conversations;
create policy conversations_update_participant
  on public.conversations
  for update
  using (auth.uid() = seller_id or auth.uid() = buyer_id)
  with check (auth.uid() = seller_id or auth.uid() = buyer_id);

alter table if exists public.messages enable row level security;

drop policy if exists messages_select_participant on public.messages;
create policy messages_select_participant
  on public.messages
  for select
  using (
    exists (select 1 from public.conversations c where c.id = conversation_id and (c.seller_id = auth.uid() or c.buyer_id = auth.uid()))
  );

drop policy if exists messages_insert_sender on public.messages;
create policy messages_insert_sender
  on public.messages
  for insert
  with check (
    auth.uid() = sender_id
    and exists (select 1 from public.conversations c where c.id = conversation_id and (c.seller_id = auth.uid() or c.buyer_id = auth.uid()))
  );

drop policy if exists messages_update_participant on public.messages;
create policy messages_update_participant
  on public.messages
  for update
  using (
    exists (select 1 from public.conversations c where c.id = conversation_id and (c.seller_id = auth.uid() or c.buyer_id = auth.uid()))
  )
  with check (
    exists (select 1 from public.conversations c where c.id = conversation_id and (c.seller_id = auth.uid() or c.buyer_id = auth.uid()))
  );


-- 11) Skills / seller_skills
alter table if exists public.seller_skills enable row level security;

drop policy if exists seller_skills_mutate_own on public.seller_skills;
create policy seller_skills_mutate_own
  on public.seller_skills
  for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists seller_skills_select_public on public.seller_skills;
create policy seller_skills_select_public
  on public.seller_skills
  for select
  using (true);


-- 12) Service options
alter table if exists public.service_options enable row level security;

drop policy if exists service_options_mutate_own on public.service_options;
create policy service_options_mutate_own
  on public.service_options
  for all
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


-- 13) Activity logs (service-role)
alter table if exists public.seller_activity_logs enable row level security;

drop policy if exists seller_activity_logs_insert_service_role on public.seller_activity_logs;
create policy seller_activity_logs_insert_service_role
  on public.seller_activity_logs
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists seller_activity_logs_select_admin on public.seller_activity_logs;
create policy seller_activity_logs_select_admin
  on public.seller_activity_logs
  for select
  using (auth.role() = 'service_role' or auth.uid() = seller_id);


-- 14) Aggregates (read-only; mutate only by service role)
alter table if exists public.seller_rating_aggregates enable row level security;

drop policy if exists seller_rating_aggregates_select_public on public.seller_rating_aggregates;
create policy seller_rating_aggregates_select_public
  on public.seller_rating_aggregates
  for select
  using (true);

drop policy if exists seller_rating_aggregates_mutate_service_role on public.seller_rating_aggregates;
create policy seller_rating_aggregates_mutate_service_role
  on public.seller_rating_aggregates
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- === End RLS policies ===



with expected(table_name) as (
  values
    ('sellers'),
    ('services'),
    ('service_categories'),
    ('service_tags'),
    ('service_tag_map'),
    ('service_photos'),
    ('portfolio_items'),
    ('seller_certifications'),
    ('seller_availability'),
    ('service_slots'),
    ('bookings'),
    ('reviews'),
    ('seller_rating_aggregates'),
    ('conversations'),
    ('messages'),
    ('skills'),
    ('seller_skills'),
    ('service_options'),
    ('seller_activity_logs')
),
existing as (
  select table_name
  from information_schema.tables
  where table_schema = 'public'
)
select
  e.table_name,
  case
    when x.table_name is null then 'MISSING'
    else 'FOUND'
  end as status
from expected e
left join existing x
  on x.table_name = e.table_name
order by e.table_name;