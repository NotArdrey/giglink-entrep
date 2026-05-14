update public.bookings booking
set
  total_amount = coalesce(service.base_price, booking.total_amount),
  metadata = coalesce(booking.metadata, '{}'::jsonb)
    || jsonb_build_object(
      'client_name', buyer.full_name,
      'worker_name', seller.display_name,
      'service_type', service.title,
      'service_name', service.title,
      'description', coalesce(service.short_description, service.description, seller.about, 'Service booking request'),
      'quote_amount', coalesce(service.base_price, booking.total_amount, 0),
      'expected_cash_amount', coalesce(service.base_price, booking.total_amount, 0),
      'booking_mode', coalesce(service.metadata ->> 'booking_mode', seller.search_meta ->> 'booking_mode', 'with-slots'),
      'booking_mode_label',
        case
          when coalesce(service.metadata ->> 'booking_mode', seller.search_meta ->> 'booking_mode', 'with-slots') = 'calendar-only'
            then 'Request booking'
          else 'Time-slot booking'
        end
    ),
  updated_at = now()
from public.profiles buyer,
     public.sellers seller,
     public.services service
where buyer.user_id = booking.buyer_id
  and seller.user_id = booking.seller_id
  and service.id = booking.service_id;

update public.conversations conversation
set metadata = coalesce(conversation.metadata, '{}'::jsonb)
  || jsonb_build_object(
    'buyer_name', buyer.full_name,
    'seller_name', seller.display_name,
    'service_title', service.title
  )
from public.bookings booking,
     public.profiles buyer,
     public.sellers seller,
     public.services service
where conversation.booking_id = booking.id
  and buyer.user_id = booking.buyer_id
  and seller.user_id = booking.seller_id
  and service.id = booking.service_id;
