import DashboardNavigation from '../../../shared/components/DashboardNavigation';

function WorkerDashboard({
  appTheme = 'light',
  themeMode = 'system',
  onThemeChange,
  currentView,
  searchQuery,
  onSearchChange,
  onLogout,
  onOpenSellerSetup,
  onOpenMyBookings,
  sellerProfile,
  onOpenMyWork,
  onOpenProfile,
  onOpenAccountSettings,
  onOpenSettings,
  onOpenDashboard,
  onOpenBrowseServices,
  onOpenAdminDashboard,
}) {
  const workerName = sellerProfile?.fullName || 'New Seller';
  const serviceType =
    sellerProfile?.serviceType === 'Others'
      ? (sellerProfile?.customServiceType || 'General Service')
      : (sellerProfile?.serviceType || 'General Service');
  const city = sellerProfile?.city || sellerProfile?.location?.city || 'Bulacan';
  const barangay = sellerProfile?.barangay || sellerProfile?.location?.barangay || 'N/A';
  const bookingMode = sellerProfile?.bookingMode === 'calendar-only' ? 'Request booking' : 'Time-slot booking';
  const fixedPrice = sellerProfile?.fixedPrice || sellerProfile?.projectRate || sellerProfile?.hourlyRate || '0';
  const pricingModel = sellerProfile?.pricingModel === 'inquiry' ? 'Inquiry based' : `PHP ${fixedPrice}`;

  const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f8fafc' },
    main: { maxWidth: '1050px', margin: '0 auto', padding: '1rem' },
    card: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
    },
    profileGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '0.6rem',
      marginTop: '0.75rem',
      color: '#334155',
    },
    actionButton: {
      border: 'none',
      borderRadius: '8px',
      padding: '0.65rem 0.95rem',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontWeight: 800,
      cursor: 'pointer',
      marginTop: '0.6rem',
    },
  };

  return (
    <div style={styles.page}>
      <DashboardNavigation
        appTheme={appTheme}
        themeMode={themeMode}
        onThemeChange={onThemeChange}
        currentView={currentView}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onLogout={onLogout}
        onOpenSellerSetup={onOpenSellerSetup}
        onOpenMyBookings={onOpenMyBookings}
        sellerProfile={sellerProfile}
        onOpenMyWork={onOpenMyWork}
        onOpenProfile={onOpenProfile}
        onOpenAccountSettings={onOpenAccountSettings}
        onOpenSettings={onOpenSettings}
        onOpenDashboard={onOpenDashboard}
        onOpenBrowseServices={onOpenBrowseServices}
        isAdminView={false}
        onToggleAdminView={() => { if (typeof onOpenAdminDashboard === 'function') onOpenAdminDashboard(); }}
      />

      <main style={styles.main} id="worker-home">
        <section style={styles.card}>
          <h1>Welcome, {workerName}</h1>
          <p>Professional profile is active.</p>
          <div style={styles.profileGrid}>
            <div>
              <strong>Service Type:</strong> {serviceType}
            </div>
            <div>
              <strong>Location:</strong> {city}, {barangay}
            </div>
            <div>
              <strong>Pricing:</strong> {pricingModel}
            </div>
            <div>
              <strong>Booking:</strong> {bookingMode}
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <h2>Service Management</h2>
          <p>Pricing, booking method, and availability are managed per service.</p>
          <button type="button" style={styles.actionButton} onClick={() => onOpenMyWork?.()}>
            Open My Work
          </button>
        </section>
      </main>
    </div>
  );
}

export default WorkerDashboard;
