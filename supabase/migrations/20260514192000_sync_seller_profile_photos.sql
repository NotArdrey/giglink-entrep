update public.sellers s
set
  profile_photo = coalesce(nullif(s.profile_photo, ''), p.profile_photo),
  avatar_url = coalesce(nullif(s.avatar_url, ''), p.profile_photo),
  updated_at = now()
from public.profiles p
where p.user_id = s.user_id
  and nullif(p.profile_photo, '') is not null
  and (
    nullif(s.profile_photo, '') is null
    or nullif(s.avatar_url, '') is null
  );
