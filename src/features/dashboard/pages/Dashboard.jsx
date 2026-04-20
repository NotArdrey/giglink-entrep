import { useState, useEffect } from 'react';
// Note: This page is shown through isLoggedIn conditional rendering in App.js.
// Note: Service cards are rendered dynamically with .map() and filtered via React state.
import Header from '../../../shared/components/Header';
import ServiceCard from '../../marketplace/components/ServiceCard';
import WorkerDetailModal from '../../marketplace/components/WorkerDetailModal';
import BookingCalendarModal from '../../bookings/components/BookingCalendarModal';
import PaymentModal from '../../bookings/components/PaymentModal';
import BookingNotification from '../../bookings/components/BookingNotification';

const CORE_SERVICE_CHIPS = ['Tutor', 'Technician', 'Cleaner'];

const getDisplayServiceType = (provider) => {
  const rawType = provider.serviceType || '';
  const normalizedType = rawType.trim();

  if (normalizedType.toLowerCase() === 'others') {
    const customType = (provider.customServiceType || '').trim();
    return customType || 'General Service';
  }

  return normalizedType || 'General Service';
};


function Dashboard({ onLogout, onBecomeSeller, onOpenMyBookings, sellerProfile, onOpenMyWork, onOpenProfile, onOpenAccountSettings, onOpenSettings }) {
  const providers = [
    {
      id: 1,
      name: 'Arian Cortez',
      serviceType: 'Tutor',
      rating: 4.9,
      reviews: 142,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      description: 'Patient and structured tutoring sessions for students and skill-learners.',
      experience: 6,
      location: 'District 1',
      hourlyRate: 450,
      pricingType: 'fixed',
      actionType: 'book',
    },
    {
      id: 2,
      name: 'Mika Santos',
      serviceType: 'Technician',
      rating: 4.8,
      reviews: 96,
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      description: 'Reliable technical help for setup, troubleshooting, and maintenance tasks.',
      experience: 8,
      location: 'District 2',
      hourlyRate: null,
      pricingType: 'inquiry',
      actionType: 'inquire',
    },
    {
      id: 3,
      name: 'Daryl Ng',
      serviceType: 'Cleaner',
      rating: 4.7,
      reviews: 121,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      description: 'Efficient cleaning services with attention to detail for homes and spaces.',
      experience: 5,
      location: 'District 3',
      hourlyRate: 320,
      pricingType: 'fixed',
      actionType: 'book',
    },
    {
      id: 4,
      name: 'Jenna Lim',
      serviceType: 'Tutor',
      rating: 4.9,
      reviews: 178,
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      description: 'Interactive tutoring for communication, writing, and exam preparation.',
      experience: 7,
      location: 'District 2',
      hourlyRate: null,
      pricingType: 'inquiry',
      actionType: 'inquire',
    },
    {
      id: 5,
      name: 'Paolo Diaz',
      serviceType: 'Technician',
      rating: 4.8,
      reviews: 109,
      photo: 'https://images.unsplash.com/photo-1507539803627-c150f650b237?w=400&h=400&fit=crop',
      description: 'Hands-on technical support for devices, software, and network setups.',
      experience: 9,
      location: 'District 1',
      hourlyRate: 600,
      pricingType: 'fixed',
      actionType: 'book',
    },
    {
      id: 6,
      name: 'Lia Ramos',
      serviceType: 'Cleaner',
      rating: 4.8,
      reviews: 87,
      photo: 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=400&h=400&fit=crop',
      description: 'Thorough and flexible cleaning plans designed around your schedule.',
      experience: 4,
      location: 'District 3',
      hourlyRate: null,
      pricingType: 'inquiry',
      actionType: 'inquire',
    },
    {
      id: 7,
      name: 'Vince Tan',
      serviceType: 'Others',
      customServiceType: 'Valorant Account Booster',
      rating: 4.9,
      reviews: 63,
      photo: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=400&fit=crop',
      description: 'Secure and performance-focused account boosting sessions with transparent progress updates.',
      experience: 3,
      location: 'District 2',
      projectRate: 1200,
      pricingType: 'fixed',
      actionType: 'book',
      rateBasis: 'per-project',
    },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isBookingCalendarOpen, setIsBookingCalendarOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [showBookingNotification, setShowBookingNotification] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [hoveredChip, setHoveredChip] = useState('');
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  // Note: Nested scheduling structure is Provider > Days > Time Blocks > Slot Capacity.
  const [schedulesByProvider, setSchedulesByProvider] = useState(() => {
    const initialSchedules = {};

    providers.forEach((provider) => {
      const defaultDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const isManual = provider.actionType === 'inquire';
      const slotTemplates = [
        {
          id: `slot-${provider.id}-1`,
          startTime: '09:00',
          endTime: '11:00',
          capacity: 5,
          slotsLeft: 3,
        },
        {
          id: `slot-${provider.id}-2`,
          startTime: '11:30',
          endTime: '13:30',
          capacity: 4,
          slotsLeft: 1,
        },
        {
          id: `slot-${provider.id}-3`,
          startTime: '14:00',
          endTime: '16:00',
          capacity: 6,
          slotsLeft: 4,
        },
        {
          id: `slot-${provider.id}-4`,
          startTime: '16:30',
          endTime: '18:30',
          capacity: 3,
          slotsLeft: 0,
        },
      ];

      const dayBlocks = {};
      defaultDays.forEach((day, dayIndex) => {
        if (isManual) {
          dayBlocks[day] = [];
          return;
        }

        // Slightly vary slots per day so calendar shows realistic mixed availability.
        dayBlocks[day] = slotTemplates.map((slot, slotIndex) => ({
          ...slot,
          id: `${slot.id}-${day}`,
          slotsLeft: Math.max(0, Math.min(slot.capacity, slot.slotsLeft + ((dayIndex + slotIndex) % 2 === 0 ? 1 : 0))),
        }));
      });

      initialSchedules[provider.id] = {
        manualScheduling: isManual,
        operatingDays: defaultDays,
        dayBlocks,
      };
    });

    return initialSchedules;
  });

  // Simulate initial loading of service cards before data is shown.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingCards(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const topLevelChips = ['All', ...CORE_SERVICE_CHIPS, 'More Services'];

  const districts = ['All Districts', ...new Set(providers.map((provider) => provider.location))];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryClick = (chip) => {
    setActiveCategory(chip);
  };

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const handleViewProfile = (provider) => {
    setSelectedWorker(provider);
    setIsWorkerModalOpen(true);
  };

  const handleCloseWorkerModal = () => {
    setIsWorkerModalOpen(false);
    setSelectedWorker(null);
  };

  const handleBookNow = (worker) => {
    setIsWorkerModalOpen(false);
    setSelectedWorker(worker);
    setIsBookingCalendarOpen(true);
  };

  const handleCloseBookingCalendar = () => {
    setIsBookingCalendarOpen(false);
    setSelectedWorker(null);
  };

  const handleConfirmBooking = ({ workerId, date, dayKey, blockId, manualScheduling }) => {
    if (manualScheduling) {
      setBookingMessage('Manual schedule request sent! Worker will confirm via chat.');
      setIsBookingCalendarOpen(false);
      setShowBookingNotification(true);
      setSelectedWorker(null);
      return;
    }

    const worker = providers.find((provider) => provider.id === workerId);
    const selectedBlock = schedulesByProvider[workerId]?.dayBlocks?.[dayKey]?.find((block) => block.id === blockId);

    if (!worker || !selectedBlock) {
      setBookingMessage('Unable to continue booking. Please try again.');
      setIsBookingCalendarOpen(false);
      setShowBookingNotification(true);
      setSelectedWorker(null);
      return;
    }

    const quoteAmount = worker.hourlyRate || worker.dailyRate || worker.projectRate || 0;

    setPendingBooking({
      workerId,
      workerName: worker.name,
      serviceType: worker.serviceType,
      quoteAmount,
      selectedSlot: {
        date,
        dayKey,
        blockId,
        timeBlock: selectedBlock,
      },
      allowGcashAdvance: true,
      allowAfterService: true,
      afterServicePaymentType: 'both',
    });

    setIsBookingCalendarOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handleSelectPayment = (selectedPaymentMethod) => {
    if (!pendingBooking) return;

    const { workerId, selectedSlot } = pendingBooking;
    const { dayKey, blockId } = selectedSlot;

    setSchedulesByProvider((prev) => {
      const providerSchedule = prev[workerId];
      const currentBlocks = providerSchedule?.dayBlocks?.[dayKey] || [];
      const updatedBlocks = currentBlocks.map((block) => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          slotsLeft: Math.max(0, block.slotsLeft - 1),
        };
      });

      return {
        ...prev,
        [workerId]: {
          ...providerSchedule,
          dayBlocks: {
            ...providerSchedule.dayBlocks,
            [dayKey]: updatedBlocks,
          },
        },
      };
    });

    const paymentLabel =
      selectedPaymentMethod === 'gcash-advance'
        ? 'GCash advance payment'
        : selectedPaymentMethod === 'after-service-cash'
          ? 'Cash after-service payment'
          : 'GCash after-service payment';

    setBookingMessage(`Booking confirmed with ${paymentLabel}.`);
    setIsPaymentModalOpen(false);
    setPendingBooking(null);
    setShowBookingNotification(true);
    setSelectedWorker(null);
  };

  const handleCancelPayment = () => {
    setIsPaymentModalOpen(false);
    setPendingBooking(null);
    setSelectedWorker(null);
  };

  const handleCloseNotification = () => {
    setShowBookingNotification(false);
  };

  const filteredProviders = providers.filter((provider) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const serviceLabel = getDisplayServiceType(provider);
    const matchesSearch =
      normalizedQuery.length === 0 ||
      provider.name.toLowerCase().includes(normalizedQuery) ||
      serviceLabel.toLowerCase().includes(normalizedQuery);

    const isCoreService = CORE_SERVICE_CHIPS.includes(serviceLabel);
    const matchesCategory =
      activeCategory === 'All' ||
      (activeCategory === 'More Services' ? !isCoreService : serviceLabel === activeCategory);

    const matchesDistrict = selectedDistrict === 'All Districts' || provider.location === selectedDistrict;

    return matchesSearch && matchesCategory && matchesDistrict;
  });

  const selectedCategoryLabel =
    activeCategory === 'All'
      ? 'services'
      : activeCategory === 'More Services'
        ? 'additional services'
        : activeCategory;

  const noResultsMessage =
    activeCategory === 'All'
      ? 'No services found for this filter. Try another district or clear your search.'
      : `No ${selectedCategoryLabel} found in this district. Try nearby or view all services.`;

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0.75rem' : '1.2rem',
    },
    introSection: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '1rem',
      padding: isMobile ? '1rem' : '1.35rem 1.45rem',
      marginBottom: '0.85rem',
      boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)',
    },
    introHeading: {
      margin: 0,
      color: '#0f172a',
      fontWeight: 800,
      fontSize: isMobile ? '1.25rem' : '1.75rem',
      letterSpacing: '-0.02em',
    },
    introSubHeading: {
      margin: '0.4rem 0 0.2rem',
      color: '#1e293b',
      fontWeight: 600,
      fontSize: isMobile ? '0.95rem' : '1rem',
    },
    introText: {
      margin: '0.15rem 0 0',
      color: '#64748b',
      fontSize: isMobile ? '0.86rem' : '0.92rem',
      lineHeight: 1.45,
    },
    filterBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '0.75rem',
      flexWrap: 'wrap',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.7rem',
      padding: isMobile ? '0.9rem' : '1rem',
      marginBottom: '1rem',
      boxShadow: '0 6px 18px rgba(15, 23, 42, 0.04)',
    },
    chipGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
    },
    chip: {
      border: '1px solid #cbd5e1',
      borderRadius: '999px',
      backgroundColor: '#ffffff',
      color: '#334155',
      padding: isMobile ? '0.45rem 0.85rem' : '0.55rem 1rem',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: isMobile ? '0.84rem' : '0.93rem',
      transition: 'all 0.2s ease',
    },
    chipActive: {
      backgroundColor: '#2563eb',
      borderColor: '#2563eb',
      color: '#ffffff',
      boxShadow: '0 6px 14px rgba(37, 99, 235, 0.24)',
    },
    chipMuted: {
      backgroundColor: '#f8fafc',
      borderStyle: 'dashed',
    },
    districtDropdown: {
      minWidth: isMobile ? '100%' : '190px',
      width: isMobile ? '100%' : 'auto',
      border: '1px solid #cbd5e1',
      borderRadius: '0.5rem',
      padding: '0.45rem 0.6rem',
      backgroundColor: '#ffffff',
      color: '#0f172a',
      fontWeight: 600,
    },
    resultSummary: {
      marginBottom: '0.85rem',
      color: '#475569',
      fontSize: '0.92rem',
      fontWeight: 600,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
    },
    loadingCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.75rem',
      padding: '0.9rem',
      minHeight: '180px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.7rem',
    },
    loadingLine: {
      height: '12px',
      borderRadius: '999px',
      backgroundColor: '#e2e8f0',
    },
    emptyState: {
      backgroundColor: '#ffffff',
      border: '1px dashed #cbd5e1',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      color: '#475569',
      gridColumn: '1 / -1',
    },
    emptyTitle: {
      margin: 0,
      fontSize: '1rem',
      fontWeight: 700,
      color: '#0f172a',
    },
    emptyText: {
      margin: '0.35rem 0 0',
      lineHeight: 1.5,
    },
  };

  return (
    <div style={styles.page} id="dashboard-home">
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onLogout={onLogout}
        onOpenSellerSetup={onBecomeSeller}
        onOpenMyBookings={onOpenMyBookings}
        sellerProfile={sellerProfile}
        onOpenMyWork={onOpenMyWork}
        onOpenProfile={onOpenProfile}
        onOpenAccountSettings={onOpenAccountSettings}
        onOpenSettings={onOpenSettings}
        searchPlaceholder="Search service (e.g., Math Tutor, Aircon Cleaning, UI Design)"
      />

      <main style={styles.main}>
        <section style={styles.introSection}>
          <h1 style={styles.introHeading}>Find Services You Need Today</h1>
          <p style={styles.introSubHeading}>What service are you looking for today?</p>
          <p style={styles.introText}>Choose a category to see available providers instantly.</p>
        </section>

        <section style={styles.filterBar}>
          <div style={styles.chipGroup}>
            {topLevelChips.map((chip) => (
              <button
                key={chip}
                style={{
                  ...styles.chip,
                  ...(activeCategory === chip ? styles.chipActive : {}),
                  ...(chip === 'More Services' && activeCategory !== chip ? styles.chipMuted : {}),
                  ...(hoveredChip === chip && activeCategory !== chip ? { backgroundColor: '#f1f5f9' } : {}),
                }}
                onClick={() => handleCategoryClick(chip)}
                onMouseEnter={() => setHoveredChip(chip)}
                onMouseLeave={() => setHoveredChip('')}
              >
                {chip}
              </button>
            ))}
          </div>

          <select
            style={styles.districtDropdown}
            value={selectedDistrict}
            onChange={handleDistrictChange}
          >
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </section>

        <p style={styles.resultSummary}>
          Showing {filteredProviders.length} {selectedCategoryLabel}
          {selectedDistrict !== 'All Districts' ? ` in ${selectedDistrict}` : ''}
        </p>

        <section style={styles.grid}>
          {isLoadingCards
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={`loading-card-${index}`} style={styles.loadingCard} aria-label="Loading service card">
                  <div style={{ ...styles.loadingLine, width: '52%' }} />
                  <div style={{ ...styles.loadingLine, width: '70%' }} />
                  <div style={{ ...styles.loadingLine, width: '92%' }} />
                  <div style={{ ...styles.loadingLine, width: '65%' }} />
                  <div style={{ ...styles.loadingLine, width: '40%', marginTop: 'auto' }} />
                </div>
              ))
            : filteredProviders.length > 0
              ? filteredProviders.map((provider) => (
                  <ServiceCard key={provider.id} provider={provider} onViewProfile={handleViewProfile} />
                ))
              : (
                <div style={styles.emptyState}>
                  <p style={styles.emptyTitle}>No match for this service view yet.</p>
                  <p style={styles.emptyText}>{noResultsMessage}</p>
                </div>
              )}
        </section>
      </main>

      <WorkerDetailModal
        isOpen={isWorkerModalOpen}
        worker={selectedWorker}
        onClose={handleCloseWorkerModal}
        onBookNow={handleBookNow}
      />

      <BookingCalendarModal
        isOpen={isBookingCalendarOpen}
        onClose={handleCloseBookingCalendar}
        worker={selectedWorker}
        schedule={selectedWorker ? schedulesByProvider[selectedWorker.id] : null}
        onConfirmBooking={handleConfirmBooking}
      />

      {isPaymentModalOpen && pendingBooking && (
        <PaymentModal
          booking={pendingBooking}
          onSelectPayment={handleSelectPayment}
          onCancel={handleCancelPayment}
        />
      )}

      <BookingNotification
        message={bookingMessage}
        isVisible={showBookingNotification}
        onClose={handleCloseNotification}
      />
    </div>
  );
}

export default Dashboard;
