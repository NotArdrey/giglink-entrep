import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  LayoutDashboard,
  Search,
  Sparkles,
  Store,
  UserRound,
} from 'lucide-react';
import DashboardNavigation from '../../../shared/components/DashboardNavigation';

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
    description: 'Track quotes, schedules, payments, refunds, chats, and ratings in one workspace.',
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
  const normalizedRole = String(sellerProfile?.role || '').trim().toLowerCase();
  const hasSellerProfile = normalizedRole === 'worker'
    || (!normalizedRole && Boolean(
      sellerProfile?.isWorker
        || sellerProfile?.sellerId
        || sellerProfile?.serviceType
        || sellerProfile?.workerProfileId
    ));

  const displayName = sellerProfile?.firstName
    || sellerProfile?.fullName
    || sellerProfile?.full_name
    || 'there';

  const actionHandlers = {
    browse: onOpenBrowseServices,
    bookings: onOpenMyBookings,
    work: hasSellerProfile ? onOpenMyWork : (onBecomeSeller || onOpenSellerSetup),
    profile: onOpenProfile,
  };

  const stats = [
    { label: 'Marketplace', value: 'Live', detail: 'Active provider listings' },
    { label: 'Bookings', value: 'Ready', detail: 'Schedules and messages' },
    { label: 'Seller tools', value: hasSellerProfile ? 'Enabled' : 'Available', detail: hasSellerProfile ? 'Manage your services' : 'Set up in minutes' },
  ];

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
        <section className="dashboard-hero gl-card">
          <div className="dashboard-hero-copy">
            <span className="gl-eyebrow">
              <Sparkles size={15} aria-hidden="true" />
              GigLink Home
            </span>
            <h1 className="gl-title">Good to see you, {displayName}.</h1>
            <p className="gl-subtitle">
              Jump into the marketplace, check active bookings, or manage your seller workspace from a calmer home base.
            </p>
            <div className="dashboard-hero-actions">
              <button className="gl-button primary" type="button" onClick={onOpenBrowseServices}>
                <Search size={17} aria-hidden="true" />
                Browse Services
              </button>
              <button className="gl-button secondary" type="button" onClick={hasSellerProfile ? onOpenMyWork : (onBecomeSeller || onOpenSellerSetup)}>
                <Store size={17} aria-hidden="true" />
                {hasSellerProfile ? 'Open My Work' : 'Become a Seller'}
              </button>
            </div>
          </div>

          <div className="dashboard-status-panel gl-card">
            <div className="dashboard-status-head">
              <LayoutDashboard size={18} aria-hidden="true" />
              <span>Today</span>
            </div>
            <div className="gl-kpi-grid">
              {stats.map((item) => (
                <div className="gl-kpi" key={item.label}>
                  <p className="gl-kpi-value">{item.value}</p>
                  <p className="gl-kpi-label">{item.label}</p>
                  <span>{item.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-action-grid" aria-label="Primary workspace actions">
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
      </main>
    </div>
  );
}

export default Dashboard;
