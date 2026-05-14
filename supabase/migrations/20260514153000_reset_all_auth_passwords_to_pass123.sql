-- Development-only password reset.
-- Sets every Supabase Auth user's password to: pass123
--
-- Apply only in a demo/development database. This touches auth.users directly.

create extension if not exists pgcrypto with schema extensions;

update auth.users
set
  encrypted_password = extensions.crypt('pass123', extensions.gen_salt('bf')),
  updated_at = now()
where email is not null;
