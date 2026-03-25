import { useMemo, useState } from 'react';
import CalendarAvailabilityModal from '../components/CalendarAvailabilityModal';
import SellerScheduleModal from '../components/SellerScheduleModal';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import '../styles/WorkerDashboard.css';

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
    : `Fixed Price (PHP ${sellerProfile?.fixedPrice || '0'})`;
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

  return (
    <div className="worker-dashboard-page">
      <header className="worker-dashboard-header">
        <a href="#worker-home" className="worker-logo">GigLink Worker</a>
        <div className="worker-header-actions">
          <button onClick={onBackToClient}>Client Dashboard</button>
          <button onClick={() => setIsLogoutConfirmOpen(true)} className="logout">
            Logout
          </button>
        </div>
      </header>

      <main className="worker-dashboard-main" id="worker-home">
        <section className="worker-profile-card">
          <h1>Welcome, {workerName}</h1>
          <p>Professional profile is now active.</p>
          <div className="worker-profile-grid">
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

        <section className="worker-tools-card">
          <h2>Availability & Booking Setup</h2>
          {bookingMode === 'calendar-only' ? (
            <>
              <p>Set available dates only. Clients will pick a date and coordinate exact time later.</p>
              <button className="manage-slots-button" onClick={() => setIsCalendarOnlyModalOpen(true)}>
                Open Calendar Availability
              </button>
            </>
          ) : (
            <>
              <p>Configure operating days, time blocks, and slot capacities.</p>
              <button className="manage-slots-button" onClick={() => setIsScheduleModalOpen(true)}>
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
