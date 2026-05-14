update public.services
set
  title = 'Home Assistance Service',
  short_description = 'Reliable home support for everyday tasks and scheduled help.',
  description = 'Reliable home support for everyday tasks and scheduled help.',
  updated_at = now()
where id = 83;

update public.sellers
set
  headline = 'Home Assistance',
  tagline = 'Reliable home support for everyday tasks and scheduled help.',
  about = 'Reliable home support for everyday tasks and scheduled help.',
  search_meta = coalesce(search_meta, '{}'::jsonb)
    || jsonb_build_object(
      'service_type', 'Home Assistance',
      'bio', 'Reliable home support for everyday tasks and scheduled help.'
    ),
  updated_at = now()
where user_id = '00000000-0000-4000-8000-000000000103'::uuid;

update public.services
set
  title = 'Calendar Planning Support',
  short_description = 'Organized calendar setup and schedule coordination for local clients.',
  description = 'Organized calendar setup and schedule coordination for local clients.',
  updated_at = now()
where id = 84;

update public.sellers
set
  headline = 'Calendar Planning Support',
  tagline = 'Organized calendar setup and schedule coordination for local clients.',
  about = 'Organized calendar setup and schedule coordination for local clients.',
  search_meta = coalesce(search_meta, '{}'::jsonb)
    || jsonb_build_object(
      'service_type', 'Calendar Planning Support',
      'bio', 'Organized calendar setup and schedule coordination for local clients.'
    ),
  updated_at = now()
where user_id = '00000000-0000-4000-8000-000000000101'::uuid;
