# Become a Seller / Worker Portal Mock Data Guide

This file is a temporary reference for the current mock-data driven worker-side, home-page, and booking/chat flows.

Do not delete the mock data yet. The goal is to preserve the current demo behavior while we transition these screens to live Supabase-backed seller data.

## Scope covered

- Home page / landing page
- Worker portal / My Work / Worker Dashboard
- My Bookings / Chat flow
- Service card actions in the marketplace
- Slot selection and payment / refund flow

## Main mock-data sources

### 1) `src/features/work/data/MockWorkers.js`
Contains the core worker demo dataset:

- `MOCK_WORKERS`
  - Multiple seller profiles with different pricing models
  - Rate basis examples:
    - `per-hour`
    - `per-day`
    - `per-project`
  - Booking modes:
    - `with-slots`
    - `calendar-only`
  - Location data
  - Payment preferences
  - GCash numbers

- Weekly and calendar schedules
  - `HOURLY_WORKER_SCHEDULE`
  - `DAILY_WORKER_CALENDAR`
  - `PROJECT_WORKER_CALENDAR`
  - `DAILY_SLOTS_SCHEDULE`
  - `PROJECT_SLOTS_SCHEDULE`
  - `HOURLY_CALENDAR`

- Transaction demo data
  - Payment states
  - Cash confirmation review states
  - Refund states
  - Recurring monthly subscription examples
  - Completed / pending / denied / approved examples

### 2) `src/features/work/pages/MyWork.jsx`
Contains the worker-side demo dashboard behavior:

- Dummy inquiries shown to the seller
- Dummy schedules / slot management
- Payment confirmation queues
- Refund handling queues
- Monthly recurring transaction logic
- Slot add / edit / delete actions
- Chat launch for inquiries

Important current UI actions:

- `Respond` / inquiry chat
  - Opens chat for a specific inquiry
  - Used to reply to client questions and negotiate

- Slot management
  - Add slot
  - Edit slot
  - Delete slot
  - Confirm slot edits

- Payment review
  - Approve cash confirmation
  - Mark transaction done
  - Toggle paid / done states depending on payment rules

- Refund review
  - Approve refund
  - Track requested / processing / approved refunds

### 3) `src/features/work/pages/WorkerDashboard.jsx`
Contains the worker home / dashboard summary:

- Active seller summary card
- Service type, location, pricing, rate basis, scheduling type
- Availability & booking setup section
- Buttons:
  - `Open Calendar Availability`
  - `Open Slot Manager`

This page is the current entry point for the seller-facing home/dashboard experience.

### 4) `src/features/bookings/pages/MyBookings.jsx`
Contains the client booking flow and post-booking controls:

- Initial state goes directly into chat
- Booking list / filter handling
- Chat launch per booking
- Slot selection flow
- Payment proof upload / reference flow
- Rating flow
- Refund flow
- Cash confirmation synchronization
- Refund synchronization

Important current UI actions:

- `Open Chat`
  - Opens the conversation for a selected booking

- `Choose Slot`
  - Switches from chat to slot selection

- `Submit Payment Proof`
  - Records receipt / reference details

- `Leave Rating`
  - Opens the rating modal for the completed booking

- `Request Refund`
  - Opens refund request flow

- `Confirm Refund Received`
  - Client-side confirmation after refund approval

### 5) `src/features/bookings/components/ChatWindow.jsx`
Contains the simulated booking chat behavior:

- Client and worker message threads
- Quote approval flow
- Refund request flow
- Reject quote flow
- Rating submission flow

Important current actions:

- Approve quote
  - Moves booking toward slot / calendar selection

- Reject quote
  - Lets the client reject a worker quote

- Stop service / refund dialogs
  - Supports refund-related conversation states

- Leave rating
  - Sends feedback after service completion

### 6) `src/features/bookings/components/SlotSelectionModal.jsx`
Contains simulated slot selection behavior:

- Calendar date picker
- Available time slots per day
- Full slot / available slot states
- Confirm selected date + slot

This is still mock-driven and should later read real worker schedule data.

### 7) `src/features/marketplace/components/ServiceCard.jsx`
Contains the marketplace service card actions:

- `View Service`
  - Opens the service / provider detail modal

- `Reviews`
  - Opens review-related details for the provider

Current card content priorities:

- service type
- description
- price
- availability
- rating
- location
- provider identity

### 8) `src/features/landing/pages/LandingPage.jsx`
Contains landing page / footer navigation links relevant to seller flow:

- `Become a Seller`
- `Manage Your Slots`
- `My Work Dashboard`

These links are important because they connect the home page to the worker-side flow.

## Current relationship map

### Home page
Should eventually route users into:

- browse services
- view service details
- open reviews
- become a seller
- go to seller tools / dashboard

### Worker portal
Should eventually use live seller data for:

- seller profile
- current inquiries
- chat threads
- availability / slots
- payment review
- refund handling
- completed work tracking
- rating outcomes

### My Bookings / Chat
Should eventually be connected to the same seller data for:

- quote approval
- slot selection
- payment proof tracking
- refund requests
- rating submission
- ongoing conversations

## Future live-data replacement targets

When we replace the mock data, these screens should pull from the seller schema and booking/chat tables:

- seller profile from `sellers` and `profiles`
- service listings from `services`
- photos from `service_photos` / storage URLs
- availability from `seller_availability` and `service_slots`
- inquiries / conversations from `conversations` and `messages`
- bookings from `bookings`
- reviews from `reviews` and `seller_rating_aggregates`
- payment / refund state from booking metadata or dedicated payment records if added later

## Buttons and what they currently mean

### Marketplace
- `View Service` = open the provider/service detail modal
- `Reviews` = show provider reviews and reputation details

### Worker dashboard
- `Open Calendar Availability` = manage date-based availability
- `Open Slot Manager` = manage time blocks and slot capacity

### My Work
- `Respond` / inquiry chat = open client conversation
- `Add Slot` = create a new time slot
- `Edit Slot` = update an existing slot
- `Delete Slot` = remove a slot
- `Approve Cash` = approve a cash payment confirmation
- `Approve Refund` = approve a refund request
- `Mark Done` = mark a job or transaction complete

### My Bookings / Chat
- `Open Chat` = continue the booking conversation
- `Choose Slot` = move to slot selection
- `Submit Payment Proof` = attach proof / reference
- `Leave Rating` = submit a review after completion
- `Request Refund` = start refund flow
- `Confirm Refund Received` = close out approved refund

## Reminder

This guide exists so the mock-data structure stays documented before the live seller system replaces it.

When the backend is ready, we can remove the mock data gradually, screen by screen, without losing the intended UI behavior.

## Mapping checklist (what to show in the demo)

- Service metadata keys the UI reads:
  - `metadata.rate_basis` — canonical values: `per-hour`, `per-day`, `per-week`, `per-month`, `per-project`.
  - `metadata.booking_mode` — values: `with-slots` (default) or `calendar-only` (calendar-only opens date selection without prebuilt time blocks).
  - `base_price` — used as the canonical price for the chosen `rate_basis`.

- Booking availability source:
  - `service_slots` table is the authoritative source for demo/live slot data. Each row must include `service_id`, `seller_id`, `start_ts`, `end_ts`, `capacity`, and `status` (`available`/`booked`/`cancelled`).

- UI mappings we rely on during the demo:
  - `Dashboard` maps `services` → `provider` objects and exposes `rateBasis`, `hourlyRate`, `dailyRate`, `weeklyRate`, `monthlyRate`, `projectRate`, `bookingMode`, and `actionType` (inquire/book).
  - `BookingCalendarModal` consumes a `schedule` object; for best presentation seed `service_slots` for specific dates so the calendar shows date-specific slots.

## Demo seeding (quick SQL examples)

Use these examples in Supabase SQL editor to create a demo service and a few date-specific slots (replace `<SELLER_UUID>` with your seller user_id and adjust `service_id` if your services already exist):

-- 1) Create a service (if you don't have one already)
INSERT INTO public.services (seller_id, title, slug, short_description, price_type, base_price, metadata)
VALUES (
  '<SELLER_UUID>',
  'Demo Tutoring — Presentation',
  'demo-tutoring-preso',
  'Demo service to showcase calendar-driven booking.',
  'fixed',
  800.00,
  '{"rate_basis":"per-week","booking_mode":"with-slots","service_type":"Tutor"}'::jsonb
)
RETURNING id;

-- Note the returned `id` (e.g. 123). Use that as `service_id` below.

-- 2) Insert date-specific slots for the demo service (replace service_id and seller_id)
INSERT INTO public.service_slots (service_id, seller_id, start_ts, end_ts, capacity, status)
VALUES
  (123, '<SELLER_UUID>', '2026-05-12T09:00:00+08', '2026-05-12T11:00:00+08', 3, 'available'),
  (123, '<SELLER_UUID>', '2026-05-12T14:00:00+08', '2026-05-12T16:00:00+08', 2, 'available'),
  (123, '<SELLER_UUID>', '2026-05-13T09:00:00+08', '2026-05-13T11:00:00+08', 3, 'available');

-- 3) Verify: SELECT * FROM public.service_slots WHERE service_id = 123 ORDER BY start_ts;

## Calendar behavior — current vs recommended

- Current: Dashboard aggregates `service_slots` into weekly/day-block shapes (by weekday) when building the schedule object for `BookingCalendarModal`. This makes it easy to show recurring patterns, but the calendar can look aggregated rather than date-explicit.
- Recommended for your demo: seed date-specific `service_slots` (see SQL above). The Dashboard already fetches `service_slots` and will surface availability; for the clearest presentation, show the BookingCalendarModal with seeded dates so attendees see exact dates and times.
- Optional improvement (after demo): update `BookingCalendarModal` to treat `service_slots` as exact-date blocks (keyed by ISO date strings) so the modal shows blocks per date rather than aggregating by weekday.

## What to prepare before the presentation

- Create 2–4 demo services using the Create Service UI in `My Work` or by inserting into `public.services` with `metadata.rate_basis` set to `per-week` / `per-month` for at least one service.
- Seed several `service_slots` rows for those service ids (use the SQL example) across the demo date range you will show.
- Open the Dashboard, click a service card, and open `Book` to confirm the seeded date-specific slots appear.

If you want, I can seed a small set of slots for your first DB-backed service now (tell me the `seller_id` or the service `id`) and also convert the calendar modal to show slots keyed by exact date strings instead of weekday aggregation.
