-- GigAdvance v1 / GigLink Supabase schema
-- Run this in the Supabase SQL editor or via the CLI after linking the project.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone_number text,
  profile_photo text,
  bio text,
  province text,
  city text,
  barangay text,
  address text,
  is_client boolean not null default true,
  is_worker boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worker_profiles (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  service_type text,
  custom_service_type text,
  bio text,
  pricing_model text not null default 'fixed',
  fixed_price numeric,
  hourly_rate numeric,
  daily_rate numeric,
  weekly_rate numeric,
  monthly_rate numeric,
  booking_mode text not null default 'with-slots',
  rate_basis text not null default 'per-hour',
  payment_advance boolean not null default false,
  payment_after_service boolean not null default true,
  after_service_payment_type text not null default 'both',
  gcash_number text,
  qr_file_name text,
  verification_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.worker_profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "worker_profiles_select_own" on public.worker_profiles;
create policy "worker_profiles_select_own"
  on public.worker_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "worker_profiles_insert_own" on public.worker_profiles;
create policy "worker_profiles_insert_own"
  on public.worker_profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "worker_profiles_update_own" on public.worker_profiles;
create policy "worker_profiles_update_own"
  on public.worker_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    user_id,
    full_name,
    email,
    phone_number,
    profile_photo,
    bio,
    province,
    city,
    barangay,
    address,
    is_client,
    is_worker,
    created_at,
    updated_at
  ) values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    ),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone_number', ''),
    nullif(new.raw_user_meta_data ->> 'profile_photo', ''),
    nullif(new.raw_user_meta_data ->> 'bio', ''),
    nullif(new.raw_user_meta_data ->> 'province', ''),
    nullif(new.raw_user_meta_data ->> 'city', ''),
    nullif(new.raw_user_meta_data ->> 'barangay', ''),
    nullif(new.raw_user_meta_data ->> 'address', ''),
    true,
    false,
    now(),
    now()
  ) on conflict (user_id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone_number = excluded.phone_number,
    profile_photo = excluded.profile_photo,
    bio = excluded.bio,
    province = excluded.province,
    city = excluded.city,
    barangay = excluded.barangay,
    address = excluded.address,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
