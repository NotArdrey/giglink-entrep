-- Clean booking and chat records for Sofia Garcia Cruz and Paolo Rivera Mendoza.
-- Keep the user/profile/provider rows intact; only remove booking/chat history tied
-- to either account as buyer or seller.

do $$
begin
  create temp table if not exists cleanup_target_users (
    user_id uuid primary key
  ) on commit drop;

  create temp table if not exists cleanup_target_bookings (
    id uuid primary key
  ) on commit drop;

  create temp table if not exists cleanup_target_conversations (
    id uuid primary key
  ) on commit drop;

  insert into cleanup_target_users (user_id)
  values
    ('00000000-0000-4000-8000-000000000101'::uuid), -- Sofia Garcia Cruz
    ('00000000-0000-4000-8000-000000000103'::uuid)  -- Paolo Rivera Mendoza
  on conflict do nothing;

  insert into cleanup_target_bookings (id)
  select booking.id
  from public.bookings booking
  where booking.buyer_id in (select user_id from cleanup_target_users)
     or booking.seller_id in (select user_id from cleanup_target_users)
  on conflict do nothing;

  insert into cleanup_target_conversations (id)
  select conversation.id
  from public.conversations conversation
  where conversation.buyer_id in (select user_id from cleanup_target_users)
     or conversation.seller_id in (select user_id from cleanup_target_users)
     or conversation.booking_id in (select id from cleanup_target_bookings)
  on conflict do nothing;

  delete from public.messages message
  where message.sender_id in (select user_id from cleanup_target_users)
     or message.conversation_id in (select id from cleanup_target_conversations);

  delete from public.conversations conversation
  where conversation.id in (select id from cleanup_target_conversations);

  delete from public.reviews review
  where review.booking_id in (select id from cleanup_target_bookings);

  delete from public.bookings booking
  where booking.id in (select id from cleanup_target_bookings);
end $$;
