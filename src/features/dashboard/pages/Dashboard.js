import { useState, useEffect } from 'react';
// Note: This page is shown through isLoggedIn conditional rendering in App.js.
// Note: Service cards are rendered dynamically with .map() and filtered via React state.
import Header from '../../../shared/components/Header';
import ServiceCard from '../../marketplace/components/ServiceCard';
import WorkerDetailModal from '../../marketplace/components/WorkerDetailModal';
import BookingCalendarModal from '../../bookings/components/BookingCalendarModal';
import PaymentModal from '../../bookings/components/PaymentModal';
import BookingNotification from '../../bookings/components/BookingNotification';


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

  const categoryChips = ['All', 'Tutors', 'Technicians', 'Cleaners'];

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
    const matchesSearch =
      normalizedQuery.length === 0 ||
      provider.name.toLowerCase().includes(normalizedQuery) ||
      provider.serviceType.toLowerCase().includes(normalizedQuery);

    const chipToCategory = {
      All: 'All',
      Tutors: 'Tutor',
      Technicians: 'Technician',
      Cleaners: 'Cleaner',
    };

    const selectedCategory = chipToCategory[activeCategory];
    const matchesCategory = selectedCategory === 'All' || provider.serviceType === selectedCategory;
    const matchesDistrict = selectedDistrict === 'All Districts' || provider.location === selectedDistrict;

    return matchesSearch && matchesCategory && matchesDistrict;
  });

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0.75rem' : '1rem',
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
      padding: '0.75rem',
      marginBottom: '1rem',
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
      padding: '0.4rem 0.8rem',
      cursor: 'pointer',
      fontWeight: 600,
    },
    chipActive: {
      backgroundColor: '#2563eb',
      borderColor: '#2563eb',
      color: '#ffffff',
    },
    districtDropdown: {
      minWidth: isMobile ? '100%' : '190px',
      width: isMobile ? '100%' : 'auto',
      border: '1px solid #cbd5e1',
      borderRadius: '0.5rem',
      padding: '0.45rem 0.6rem',
      backgroundColor: '#ffffff',
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
      />

      <main style={styles.main}>
        <section style={styles.filterBar}>
          <div style={styles.chipGroup}>
            {categoryChips.map((chip) => (
              <button
                key={chip}
                style={{
                  ...styles.chip,
                  ...(activeCategory === chip ? styles.chipActive : {}),
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
            : filteredProviders.map((provider) => (
                <ServiceCard key={provider.id} provider={provider} onViewProfile={handleViewProfile} />
              ))}
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
