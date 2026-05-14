import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  MessageCircle,
  ReceiptText,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import DashboardNavigation from '../../../shared/components/DashboardNavigation';
import { fetchClientDashboardSnapshot } from '../../bookings/services/bookingService';

const quickActions = [
  {
    id: 'browse',
    title: 'Browse Services',
    description: 'Search active listings, compare providers, and book from the refreshed marketplace.',
    icon: Search,
    accent: 'blue',
  },
  {
    id: 'bookings',
    title: 'My Bookings',
    description: 'Review quote requests, schedule changes, payment status, refunds, chats, and ratings.',
    icon: CalendarCheck,
    accent: 'emerald',
  },
  {
    id: 'work',
    title: 'My Work',
    description: 'Manage service listings, inquiries, availability, and payouts from the seller desk.',
    icon: BriefcaseBusiness,
    accent: 'amber',
  },
  {
    id: 'profile',
    title: 'Profile',
    description: 'Keep your public details, location, and account preferences current.',
    icon: UserRound,
    accent: 'slate',
  },
];

const terminalStatuses = new Set(['Completed Service', 'Service Stopped', 'Cancelled', 'Cancelled (Cash)', 'Refunded']);
const scheduledStatuses = new Set([
  'Service Scheduled',
  'Payment Confirmed',
  'Payment Submitted',
  'Cash Verification Pending',
  'Cash Verification Denied',
  'Active Service',
]);
const paymentStatuses = new Set([
  'Payment Pending',
  'Slot Selected - Payment Pending',
  'Service Scheduled',
  'Payment Confirmed',
  'Payment Submitted',
  'Cash Verification Pending',
  'Cash Verification Denied',
  'Refund Processing',
  'Refunded',
]);

const emptyDashboardData = {
  user: null,
  bookings: [],
  conversations: [],
  messages: [],
  unreadMessageCount: 0,
};

const getRawBooking = (booking = {}) => booking.raw?.booking || {};

const getBookingUpdatedAt = (booking = {}) => {
  const raw = getRawBooking(booking);
  return raw.updated_at || raw.created_at || booking.requestDate || null;
};

const getBookingStartDate = (booking = {}) => {
  const raw = getRawBooking(booking);
  const rawStart = raw.start_ts || booking.startTs;

  if (rawStart) {
    const parsed = new Date(rawStart);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const selectedSlot = booking.selectedSlot || {};
  const selectedDate = selectedSlot.date || selectedSlot.dateKey;
  const startTime = selectedSlot.timeBlock?.startTime;

  if (!selectedDate) return null;

  const parsed = new Date(`${selectedDate}T${startTime || '00:00'}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDayLabel = (date) => {
  if (!date) return 'Coordinated through chat';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatSchedule = (booking) => {
  const startDate = getBookingStartDate(booking);
  if (!startDate) return 'Coordinated through chat';

  const time = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${formatDayLabel(startDate)}, ${time}`;
};

const formatTimeAgo = (value) => {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (today.getTime() === target.getTime()) return 'Today';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const hasPaymentActivity = (booking = {}) => (
  paymentStatuses.has(booking.status)
  || Boolean(
    booking.paymentMethod
      || booking.paymentReference
      || booking.transactionId
      || booking.paymentProofSubmitted
      || booking.refundStatus
      || booking.refundReference
      || booking.cashConfirmationStatus
  )
);

const getMessagePreview = (message = {}) => {
  if (message.attachments?.type === 'quote' || message.message_type === 'quote') return 'Quote sent in chat';
  const body = String(message.body ?? message.content ?? '').trim();
  return body || 'New message in chat';
};

const buildDashboardModel = (data, isLoading) => {
  const bookings = data.bookings || [];
  const conversations = data.conversations || [];
  const messages = data.messages || [];
  const now = new Date();
  const bookingById = Object.fromEntries(bookings.map((booking) => [String(booking.id), booking]));
  const conversationById = Object.fromEntries(conversations.map((conversation) => [String(conversation.id), conversation]));
  const activeBookings = bookings.filter((booking) => !terminalStatuses.has(booking.status));
  const awaitingReplyCount = activeBookings.filter((booking) => (
    booking.status === 'Negotiating'
    || booking.status === 'Awaiting Slot Selection'
    || booking.status === 'Payment Pending'
    || booking.status === 'Slot Selected - Payment Pending'
  )).length;
  const upcomingBookings = bookings
    .map((booking) => ({ booking, startDate: getBookingStartDate(booking) }))
    .filter(({ booking, startDate }) => (
      !terminalStatuses.has(booking.status)
      && (scheduledStatuses.has(booking.status) || Boolean(startDate))
      && (!startDate || startDate.getTime() >= now.getTime() - 86400000)
    ))
    .sort((a, b) => {
      if (!a.startDate && !b.startDate) return 0;
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return a.startDate.getTime() - b.startDate.getTime();
    })
    .slice(0, 3)
    .map(({ booking }) => ({
      service: booking.serviceType || 'Service',
      provider: booking.workerName || 'Provider',
      schedule: formatSchedule(booking),
      status: booking.status || 'Pending',
    }));
  const paymentCount = bookings.filter(hasPaymentActivity).length;
  const nextBookingDetail = upcomingBookings[0]
    ? `Next service ${upcomingBookings[0].schedule.toLowerCase()}`
    : 'No scheduled services';
  const metrics = [
    {
      label: 'Active requests',
      value: isLoading && bookings.length === 0 ? '...' : String(activeBookings.length),
      detail: isLoading && bookings.length === 0 ? 'Loading bookings' : `${awaitingReplyCount} awaiting provider reply`,
      icon: Clock3,
      accent: 'blue',
    },
    {
      label: 'Upcoming bookings',
      value: isLoading && bookings.length === 0 ? '...' : String(upcomingBookings.length),
      detail: isLoading && bookings.length === 0 ? 'Loading schedule' : nextBookingDetail,
      icon: CalendarCheck,
      accent: 'emerald',
    },
    {
      label: 'Unread messages',
      value: isLoading && messages.length === 0 ? '...' : String(data.unreadMessageCount || 0),
      detail: isLoading && messages.length === 0 ? 'Loading chats' : 'Across active chats',
      icon: MessageCircle,
      accent: 'amber',
    },
    {
      label: 'Payments tracked',
      value: isLoading && bookings.length === 0 ? '...' : String(paymentCount),
      detail: isLoading && bookings.length === 0 ? 'Loading payments' : 'Receipts and refunds',
      icon: ReceiptText,
      accent: 'slate',
    },
  ];
  const messageUpdates = messages.map((message) => {
    const conversation = conversationById[String(message.conversation_id)] || {};
    const booking = bookingById[String(conversation.booking_id)] || {};
    const fromCurrentUser = data.user?.id && String(message.sender_id) === String(data.user.id);

    return {
      id: `message-${message.id}`,
      title: fromCurrentUser ? 'Message sent' : 'Provider message received',
      detail: `${booking.serviceType || 'Booking'} - ${getMessagePreview(message)}`,
      time: formatTimeAgo(message.created_at),
      sortDate: message.created_at,
    };
  });
  const bookingUpdates = bookings.map((booking) => ({
    id: `booking-${booking.id}`,
    title: booking.status === 'Refund Processing'
      ? 'Refund request updated'
      : booking.paymentProofSubmitted
        ? 'Payment proof received'
        : booking.canRate
          ? 'Review window open'
          : 'Booking updated',
    detail: `${booking.serviceType || 'Service'} - ${booking.status || 'Updated'}`,
    time: formatTimeAgo(getBookingUpdatedAt(booking)),
    sortDate: getBookingUpdatedAt(booking),
  }));
  const recentUpdates = [...messageUpdates, ...bookingUpdates]
    .sort((a, b) => new Date(b.sortDate || 0).getTime() - new Date(a.sortDate || 0).getTime())
    .slice(0, 3);

  return {
    metrics,
    upcomingBookings,
    recentUpdates,
  };
};

function Dashboard({
  appTheme = 'light',
  themeMode = 'system',
  onThemeChange,
  currentView = 'client-dashboard',
  searchQuery = '',
  onSearchChange,
  onLogout,
  onBecomeSeller,
  onOpenMyBookings,
  onOpenChatPage,
  sellerProfile,
  onOpenMyWork,
  onOpenProfile,
  onOpenAccountSettings,
  onOpenSettings,
  onOpenSellerSetup,
  onOpenDashboard,
  onOpenBrowseServices,
  onOpenAdminDashboard,
}) {
  const [dashboardData, setDashboardData] = useState(emptyDashboardData);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const normalizedRole = String(sellerProfile?.role || '').trim().toLowerCase();
  const hasSellerProfile = normalizedRole === 'worker'
    || (!normalizedRole && Boolean(
      sellerProfile?.isWorker
        || sellerProfile?.sellerId
        || sellerProfile?.workerProfileId
    ));

  const displayName = sellerProfile?.firstName
    || sellerProfile?.fullName
    || sellerProfile?.full_name
    || 'there';

  const actionHandlers = {
    browse: onOpenBrowseServices,
    bookings: onOpenMyBookings,
    work: onOpenMyWork,
    profile: onOpenProfile,
  };
  const dashboardModel = useMemo(
    () => buildDashboardModel(dashboardData, isDashboardLoading),
    [dashboardData, isDashboardLoading]
  );

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setIsDashboardLoading(true);
        setDashboardError('');
        const snapshot = await fetchClientDashboardSnapshot();

        if (isMounted) {
          setDashboardData(snapshot || emptyDashboardData);
        }
      } catch (error) {
        if (isMounted) {
          setDashboardError(error?.message || 'Unable to load dashboard activity.');
          setDashboardData(emptyDashboardData);
        }
      } finally {
        if (isMounted) {
          setIsDashboardLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [sellerProfile?.userId]);

  return (
    <div className="gl-page" data-testid="client-home-dashboard">
      <DashboardNavigation
        appTheme={appTheme}
        themeMode={themeMode}
        onThemeChange={onThemeChange}
        currentView={currentView}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onLogout={onLogout}
        onOpenSellerSetup={onOpenSellerSetup || onBecomeSeller}
        onOpenMyBookings={onOpenMyBookings}
        onOpenChatPage={onOpenChatPage}
        sellerProfile={sellerProfile}
        onOpenMyWork={onOpenMyWork}
        onOpenProfile={onOpenProfile}
        onOpenAccountSettings={onOpenAccountSettings}
        onOpenSettings={onOpenSettings}
        onOpenDashboard={onOpenDashboard}
        onOpenBrowseServices={onOpenBrowseServices}
        isAdminView={false}
        onToggleAdminView={onOpenAdminDashboard}
      />

      <main className="gl-shell gl-page-pad dashboard-launchpad">
        <section className="dashboard-overview" aria-labelledby="dashboard-title">
          <div className="dashboard-overview-head">
            <div>
              <span className="gl-eyebrow">
                <LayoutDashboard size={15} aria-hidden="true" />
                Client dashboard
              </span>
              <h1 id="dashboard-title" className="gl-title">Good to see you, {displayName}.</h1>
              <p className="gl-subtitle">
                Your booking activity, provider messages, and service requests are organized here.
              </p>
              {dashboardError && (
                <p className="gl-subtitle" role="status">
                  {dashboardError}
                </p>
              )}
            </div>
            <div className="dashboard-hero-actions">
              <button className="gl-button primary" type="button" onClick={onOpenBrowseServices}>
                <Search size={17} aria-hidden="true" />
                Browse Services
              </button>
              {hasSellerProfile && (
                <button className="gl-button secondary" type="button" onClick={onOpenMyWork}>
                  <BriefcaseBusiness size={17} aria-hidden="true" />
                  Open My Work
                </button>
              )}
            </div>
          </div>

          <div className="dashboard-metric-grid">
            {dashboardModel.metrics.map((item) => {
              const Icon = item.icon;
              return (
                <article className={`dashboard-metric-card accent-${item.accent}`} key={item.label}>
                  <span className="dashboard-metric-icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="dashboard-metric-value">{item.value}</p>
                    <h2>{item.label}</h2>
                    <span>{item.detail}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="dashboard-workspace-grid" aria-label="Dashboard workspace">
          <article className="dashboard-main-panel gl-card">
            <div className="dashboard-panel-head">
              <div>
                <h2>Upcoming bookings</h2>
                <p>Keep the next appointments easy to scan.</p>
              </div>
              <button className="gl-icon-button" type="button" onClick={onOpenMyBookings} aria-label="Open bookings" title="Open bookings">
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="dashboard-booking-list">
              {dashboardModel.upcomingBookings.length > 0 ? dashboardModel.upcomingBookings.map((booking) => (
                <div className="dashboard-booking-row" key={`${booking.service}-${booking.schedule}`}>
                  <span className="dashboard-booking-icon">
                    <CalendarCheck size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{booking.service}</strong>
                    <p>{booking.provider} - {booking.schedule}</p>
                  </div>
                  <span className="dashboard-status-pill">{booking.status}</span>
                </div>
              )) : (
                <div className="dashboard-booking-row">
                  <span className="dashboard-booking-icon">
                    <CalendarCheck size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{isDashboardLoading ? 'Loading bookings...' : 'No upcoming bookings'}</strong>
                    <p>{isDashboardLoading ? 'Checking your latest schedule.' : 'Confirmed appointments will appear here.'}</p>
                  </div>
                </div>
              )}
            </div>
          </article>

          <aside className="dashboard-side-panel gl-card" aria-label="Recent updates">
            <div className="dashboard-panel-head">
              <div>
                <h2>Recent updates</h2>
                <p>Latest account activity.</p>
              </div>
            </div>
            <div className="dashboard-update-list">
              {dashboardModel.recentUpdates.length > 0 ? dashboardModel.recentUpdates.map((update) => (
                <div className="dashboard-update-row" key={update.id || `${update.title}-${update.time}`}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  <div>
                    <strong>{update.title}</strong>
                    <p>{update.detail}</p>
                  </div>
                  <time>{update.time}</time>
                </div>
              )) : (
                <div className="dashboard-update-row">
                  <CheckCircle2 size={17} aria-hidden="true" />
                  <div>
                    <strong>{isDashboardLoading ? 'Loading activity...' : 'No recent updates'}</strong>
                    <p>{isDashboardLoading ? 'Checking bookings and chats.' : 'Booking and chat activity will appear here.'}</p>
                  </div>
                  <time>{isDashboardLoading ? '' : 'Now'}</time>
                </div>
              )}
            </div>
          </aside>
        </section>

        <section className="dashboard-action-grid" aria-label="Primary dashboard actions">
          {quickActions.filter((action) => action.id !== 'work' || hasSellerProfile).map((action) => {
            const Icon = action.icon;
            const handler = actionHandlers[action.id];

            return (
              <article className={`dashboard-action-card gl-card accent-${action.accent}`} key={action.id}>
                <div className="dashboard-action-icon">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <div>
                  <h2>{action.title}</h2>
                  <p>{action.description}</p>
                </div>
                <button className="gl-icon-button" type="button" onClick={handler} aria-label="Open launchpad action" title={action.title}>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </section>

        <section className="dashboard-wide-panel gl-card">
          <div>
            <span className="dashboard-inline-icon">
              <ShieldCheck size={18} aria-hidden="true" />
              Account health
            </span>
            <h2>Profile and booking details are ready</h2>
            <p>Keep your contact information, saved locations, and notification preferences up to date.</p>
          </div>
          <div className="dashboard-panel-actions">
            <button className="gl-button secondary" type="button" onClick={onOpenProfile}>
              <UserRound size={17} aria-hidden="true" />
              Review Profile
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
