import { useMemo, useState } from 'react';
import CalendarAvailabilityModal from '../components/CalendarAvailabilityModal';
import SellerScheduleModal from '../components/SellerScheduleModal';
import LogoutConfirmModal from '../components/LogoutConfirmModal';


function WorkerDashboard({ sellerProfile, onBackToClient, onLogout }) {
  const workerName = sellerProfile?.fullName || 'New Seller';
  const serviceType =
    sellerProfile?.serviceType === 'Others'
      ? (sellerProfile?.customServiceType || 'General Service')
      : (sellerProfile?.serviceType || 'General Service');
  const city = sellerProfile?.city || 'Bulacan';
  const barangay = sellerProfile?.barangay || 'N/A';
  const pricingModel = sellerProfile?.pricingModel === 'inquiry'
    ? 'Inquiry Based'
    : `Fixed Price (₱${sellerProfile?.fixedPrice || '0'})`;
  const bookingMode = sellerProfile?.bookingMode || 'with-slots';
  const rateBasisLabelMap = {
    'per-hour': 'Per Hour Rate',
    'per-day': 'Per Day Rate',
    'per-week': 'Per Week Rate',
    'per-month': 'Per Month Rate',
    'per-project': 'Per Project Rate',
  };
  const rateBasis = rateBasisLabelMap[sellerProfile?.rateBasis] || 'Per Hour Rate';
  const afterServicePaymentType = sellerProfile?.afterServicePaymentType || 'both';
  const afterServiceLabel =
    afterServicePaymentType === 'cash-only'
      ? 'After Service (Cash)'
      : afterServicePaymentType === 'gcash-only'
        ? 'After Service (GCash)'
        : 'After Service (Cash/GCash)';

  const workerProvider = useMemo(
    () => [
      {
        id: 999,
        name: workerName,
        serviceType,
      },
    ],
    [workerName, serviceType]
  );

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCalendarOnlyModalOpen, setIsCalendarOnlyModalOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(999);
  const [availableDates, setAvailableDates] = useState([]);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState('');
  const [schedules, setSchedules] = useState({
    999: {
      manualScheduling: sellerProfile?.pricingModel === 'inquiry',
      operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      dayBlocks: {
        Mon: [
          {
            id: 'worker-default-1',
            startTime: '13:00',
            endTime: '15:00',
            capacity: 4,
            slotsLeft: 4,
          },
        ],
      },
    },
  });

  const updateSchedule = (providerId, updatedSchedule) => {
    setSchedules((prev) => ({
      ...prev,
      [providerId]: updatedSchedule,
    }));
  };

  const handleAddAvailableDate = (date) => {
    setAvailableDates((prev) => (prev.includes(date) ? prev : [...prev, date]));
  };

  const handleRemoveAvailableDate = (date) => {
    setAvailableDates((prev) => prev.filter((existingDate) => existingDate !== date));
  };

  const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f8fafc' },
    header: {
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.9rem 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.6rem',
      flexWrap: 'wrap',
    },
    logo: { textDecoration: 'none', color: '#0f172a', fontSize: '1.2rem', fontWeight: 800 },
    headerActions: { display: 'flex', gap: '0.5rem' },
    headerButton: {
      border: '1px solid #cbd5e1',
      borderRadius: '0.5rem',
      backgroundColor: '#ffffff',
      color: '#0f172a',
      padding: '0.5rem 0.8rem',
      cursor: 'pointer',
      fontWeight: 600,
    },
    logoutButton: { backgroundColor: '#b91c1c', borderColor: '#b91c1c', color: '#ffffff' },
    main: { maxWidth: '1050px', margin: '0 auto', padding: '1rem' },
    card: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.75rem',
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
    toolsButton: {
      border: 'none',
      borderRadius: '0.55rem',
      padding: '0.6rem 0.9rem',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontWeight: 700,
      cursor: 'pointer',
      marginTop: '0.3rem',
    },
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <a href="#worker-home" style={styles.logo}>GigLink Worker</a>
        <div style={styles.headerActions}>
          <button style={styles.headerButton} onClick={onBackToClient}>Client Dashboard</button>
          <button
            style={{ ...styles.headerButton, ...styles.logoutButton }}
            onClick={() => setIsLogoutConfirmOpen(true)}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main} id="worker-home">
        <section style={styles.card}>
          <h1>Welcome, {workerName}</h1>
          <p>Professional profile is now active.</p>
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
              <strong>Rate Basis:</strong> {rateBasis}
            </div>
            <div>
              <strong>Scheduling Type:</strong> {bookingMode === 'calendar-only' ? 'Calendar Only' : 'With Slots'}
            </div>
            <div>
              <strong>Payments:</strong>{' '}
              {sellerProfile?.paymentAdvance ? 'Advance (GCash)' : ''}
              {sellerProfile?.paymentAdvance && sellerProfile?.paymentAfterService ? ' / ' : ''}
              {sellerProfile?.paymentAfterService ? afterServiceLabel : ''}
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <h2>Availability & Booking Setup</h2>
          {bookingMode === 'calendar-only' ? (
            <>
              <p>Set available dates only. Clients will pick a date and coordinate exact time later.</p>
              <button
                style={{ ...styles.toolsButton, backgroundColor: hoveredButton === 'calendar' ? '#1d4ed8' : '#2563eb' }}
                onMouseEnter={() => setHoveredButton('calendar')}
                onMouseLeave={() => setHoveredButton('')}
                onClick={() => setIsCalendarOnlyModalOpen(true)}
              >
                Open Calendar Availability
              </button>
            </>
          ) : (
            <>
              <p>Configure operating days, time blocks, and slot capacities.</p>
              <button
                style={{ ...styles.toolsButton, backgroundColor: hoveredButton === 'slots' ? '#1d4ed8' : '#2563eb' }}
                onMouseEnter={() => setHoveredButton('slots')}
                onMouseLeave={() => setHoveredButton('')}
                onClick={() => setIsScheduleModalOpen(true)}
              >
                Open Slot Manager
              </button>
            </>
          )}
        </section>
      </main>

      <CalendarAvailabilityModal
        isOpen={isCalendarOnlyModalOpen}
        onClose={() => setIsCalendarOnlyModalOpen(false)}
        availableDates={availableDates}
        onAddDate={handleAddAvailableDate}
        onRemoveDate={handleRemoveAvailableDate}
      />

      <SellerScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        providers={workerProvider}
        selectedProviderId={selectedProviderId}
        onSelectProvider={setSelectedProviderId}
        schedules={schedules}
        onUpdateSchedule={updateSchedule}
      />

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          onLogout && onLogout();
        }}
      />
    </div>
  );
}

export default WorkerDashboard;
