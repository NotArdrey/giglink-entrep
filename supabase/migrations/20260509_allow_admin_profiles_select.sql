-- Migration: Allow admin users to SELECT all profiles
-- Uses the helper function `public.is_current_user_admin()` to avoid recursive
-- policies that query the `profiles` table from within RLS checks.

begin;

-- Replace the SELECT policy for profiles so admins can view all accounts
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_admin_or_own"
  on public.profiles
  for select
  using (
    auth.uid() = user_id
    or public.is_current_user_admin()
  );

commit;

-- Note: Run this migration in the Supabase SQL editor for the project.
-- This change requires that the live DB has the `is_current_user_admin()` function
-- defined (see `supabase/schema.sql`) which checks the caller's own profile role.
