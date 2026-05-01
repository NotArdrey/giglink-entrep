import { useState, useEffect } from 'react';
// ============================================================================
// DASHBOARD PAGE - Service-First Discovery Interface
// ============================================================================
// Purpose: Main post-login page for clients to browse and search for services
// Parent: App.js (rendered when currentView === 'client-dashboard' and isLoggedIn === true)
// Architecture: Page-level parent component that manages:
//   - Service provider list (mock data)
//   - Search/category/district filtering
//   - Modal states (worker detail, booking calendar, payment)
//   - Booking workflow orchestration
// Design Principle: Service-First (What user needs?) → Price/Availability → Provider Identity
// This addresses professor feedback: "Users should see if you have what they want on first glance"
// ============================================================================

// Import shared navigation component
import DashboardNavigation from '../../../shared/components/DashboardNavigation';

// Import marketplace components
import ServiceCard from '../../marketplace/components/ServiceCard';
import WorkerDetailModal from '../../marketplace/components/WorkerDetailModal';

// Import booking workflow components
import BookingCalendarModal from '../../bookings/components/BookingCalendarModal';
import PaymentModal from '../../bookings/components/PaymentModal';
import BookingNotification from '../../bookings/components/BookingNotification';
import { getThemeTokens } from '../../../shared/styles/themeTokens';

// SERVICE CATEGORY CONSTANTS - Core + additional service categories
const CORE_SERVICE_CHIPS = ['Tutor', 'Technician', 'Cleaner'];

// DISPLAY SERVICE TYPE HELPER FUNCTION
// Converts raw serviceType to human-readable format
// Special handling: Maps serviceType="Others" + customServiceType to display label
// Example: { serviceType: "Others", customServiceType: "Valorant Booster" } → displays "Valorant Booster"
const getDisplayServiceType = (provider) => {
  const rawType = provider.serviceType || '';
  const normalizedType = rawType.trim();

  // If service is "Others", use the customServiceType value instead
  if (normalizedType.toLowerCase() === 'others') {
    const customType = (provider.customServiceType || '').trim();
    return customType || 'General Service';
  }

  return normalizedType || 'General Service';
};


function Dashboard({ appTheme = 'light', onLogout, onBecomeSeller, onOpenMyBookings, sellerProfile, onOpenMyWork, onOpenProfile, onOpenAccountSettings, onOpenSettings }) {
  // ============================================================================
  // MOCK DATA - Service Provider List (Static for skeleton/demo)
  // ============================================================================
  // This represents the database of service providers that would be fetched from backend
  // In production: Replace with API call (useEffect + setState) to fetch providers
  // Structure: Array of provider objects with service details, pricing, availability, etc.
  // ============================================================================
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

  // ============================================================================
  // REACT STATE - Dashboard UI State Management
  // ============================================================================
  // Following React Hooks best practice: useState for component-level state
  // Each state variable controls specific UI behavior or data filtering
  
  // SEARCH & FILTERING STATE
  const [searchQuery, setSearchQuery] = useState(''); // User text input for service/provider search
  const [activeCategory, setActiveCategory] = useState('All'); // Selected service category chip (All, Tutor, Technician, Cleaner, More Services)
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts'); // Selected location filter dropdown

  // MODAL & BOOKING WORKFLOW STATE
  const [selectedWorker, setSelectedWorker] = useState(null); // Provider selected from card (used by WorkerDetailModal)
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false); // Controls WorkerDetailModal visibility
  const [isBookingCalendarOpen, setIsBookingCalendarOpen] = useState(false); // Controls BookingCalendarModal (date/time selection)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // Controls PaymentModal (payment method selection)
  const [pendingBooking, setPendingBooking] = useState(null); // Holds booking data being processed (workerId, selectedSlot, etc.)
  
  // NOTIFICATION & UI STATE
  const [showBookingNotification, setShowBookingNotification] = useState(false); // Controls success notification display
  const [bookingMessage, setBookingMessage] = useState(''); // Message text for notification (e.g., "Booking confirmed with GCash advance")
  const [hoveredChip, setHoveredChip] = useState(''); // Tracks which category chip is hovered (for visual feedback)
  const [isLoadingCards, setIsLoadingCards] = useState(true); // Loading skeleton animation state
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  ); // Mobile breakpoint: 768px (tablets and below)

  // ============================================================================
  // SCHEDULES BY PROVIDER - Availability Calendar State
  // ============================================================================
  // Complex nested structure: Provider → Days → Time Slots → Available Capacity
  // This represents the booking availability calendar for each service provider
  // Structure:
  //   schedulesByProvider[providerId] = {
  //     manualScheduling: boolean (true if inquiry-based, false if calendar booking)
  //     operatingDays: ['Mon', 'Tue', ..., 'Fri']
  //     dayBlocks: { 'Mon': [slot1, slot2, ...], 'Tue': [...], ... }
  //   }
  // Note: In production, this would be fetched from backend via API
  // ============================================================================
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

  // ============================================================================
  // EFFECTS - Page Initialization & Responsive Behavior
  // ============================================================================
  
  // EFFECT 1: Simulate loading skeleton animation (mimics data fetch delay)
  // In production: Call API here and setIsLoadingCards(false) after data arrives
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingCards(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // EFFECT 2: Handle window resize for responsive mobile layout
  // Updates isMobile state when viewport width changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================================================
  // DERIVED DATA - Computed values from state (React best practice)
  // ============================================================================
  // These are recalculated on each render based on current state
  // Keeps data in sync without extra state variables
  
  const topLevelChips = ['All', ...CORE_SERVICE_CHIPS, 'More Services'];
  const districts = ['All Districts', ...new Set(providers.map((provider) => provider.location))];

  // ============================================================================
  // EVENT HANDLERS - User Interactions (Search, Filter, Modal)
  // ============================================================================
  // Each handler updates state, triggering re-render with new filtered/modal data
  
  // HANDLER 1: Search input change (user typing in search box)
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // HANDLER 2: Category chip click (user clicks Tutor/Technician/Cleaner/More Services)
  const handleCategoryClick = (chip) => {
    setActiveCategory(chip);
  };

  // HANDLER 3: District dropdown change (user selects location filter)
  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
  };

  // HANDLER 4: Service card click - Opens WorkerDetailModal with provider info
  const handleViewProfile = (provider) => {
    setSelectedWorker(provider);
    setIsWorkerModalOpen(true);
  };

  // HANDLER 5: Close provider detail modal
  const handleCloseWorkerModal = () => {
    setIsWorkerModalOpen(false);
    setSelectedWorker(null);
  };

  // HANDLER 6: "Book Now" button in WorkerDetailModal - Opens BookingCalendarModal
  const handleBookNow = (worker) => {
    setIsWorkerModalOpen(false);
    setSelectedWorker(worker);
    setIsBookingCalendarOpen(true);
  };

  // HANDLER 7: Close booking calendar modal
  const handleCloseBookingCalendar = () => {
    setIsBookingCalendarOpen(false);
    setSelectedWorker(null);
  };

  // HANDLER 8: Confirm booking selection (date/time) - Advances to payment modal
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

  // HANDLER 11: Close success notification
  const handleCloseNotification = () => {
    setShowBookingNotification(false);
  };

  // ============================================================================
  // FILTERING & COMPUTED DISPLAY VALUES
  // ============================================================================
  // These computed values are recalculated on every render based on current state
  // Provides real-time filtering across three dimensions: search, category, district
  
  // FILTER LOGIC: Applies all three filters and returns matching providers
  const filteredProviders = providers.filter((provider) => {
    // SEARCH FILTER: Matches user text input against provider name OR service type
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const serviceLabel = getDisplayServiceType(provider);
    const matchesSearch =
      normalizedQuery.length === 0 ||
      provider.name.toLowerCase().includes(normalizedQuery) ||
      serviceLabel.toLowerCase().includes(normalizedQuery);

    // CATEGORY FILTER: Matches active chip (All, Tutor, Technician, Cleaner, or More Services)
    // "More Services" = anything NOT in the core chips (custom services like "Valorant Booster")
    const isCoreService = CORE_SERVICE_CHIPS.includes(serviceLabel);
    const matchesCategory =
      activeCategory === 'All' ||
      (activeCategory === 'More Services' ? !isCoreService : serviceLabel === activeCategory);

    // DISTRICT FILTER: Matches location selection dropdown
    const matchesDistrict = selectedDistrict === 'All Districts' || provider.location === selectedDistrict;

    // Return provider only if ALL three filters pass
    return matchesSearch && matchesCategory && matchesDistrict;
  });

  // LABEL COMPUTATION: Human-readable text for current category
  // Used in "Showing X services" text and empty state messages
  const selectedCategoryLabel =
    activeCategory === 'All'
      ? 'services'
      : activeCategory === 'More Services'
        ? 'additional services'
        : activeCategory;

  // EMPTY STATE MESSAGE: Contextual text when no results found
  // Changes based on what filter is active to give helpful guidance
  const noResultsMessage =
    activeCategory === 'All'
      ? 'No services found for this filter. Try another district or clear your search.'
      : `No ${selectedCategoryLabel} found in this district. Try nearby or view all services.`;

  // ============================================================================
  // PAGE STYLING - Responsive inline CSS styles
  // ============================================================================
  // All styling is done with inline style objects (no external CSS file for Dashboard)
  // Responsive values adjust based on isMobile breakpoint
  
  const themeTokens = getThemeTokens(appTheme);

  const styles = {
    // PAGE LAYOUT
    page: {
      minHeight: '100vh',
      backgroundColor: themeTokens.pageBg,
      color: themeTokens.textPrimary,
    },
    
    // MAIN CONTENT CONTAINER - Centered column with responsive padding
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0.75rem' : '1.2rem',
    },
    
    // HERO SECTION - Service-first headline and intro text
    introSection: {
      backgroundColor: themeTokens.surface,
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '1rem',
      padding: isMobile ? '1rem' : '1.35rem 1.45rem',
      marginBottom: '0.85rem',
      boxShadow: `0 10px 25px ${appTheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(15, 23, 42, 0.06)'}`,
    },
    introHeading: {
      margin: 0,
      color: themeTokens.textPrimary,
      fontWeight: 800,
      fontSize: isMobile ? '1.25rem' : '1.75rem',
      letterSpacing: '-0.02em',
    },
    introSubHeading: {
      margin: '0.4rem 0 0.2rem',
      color: themeTokens.textPrimary,
      fontWeight: 600,
      fontSize: isMobile ? '0.95rem' : '1rem',
    },
    introText: {
      margin: '0.15rem 0 0',
      color: themeTokens.textSecondary,
      fontSize: isMobile ? '0.86rem' : '0.92rem',
      lineHeight: 1.45,
    },
    // FILTER BAR - Chips and district dropdown on one row
    filterBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '0.75rem',
      flexWrap: 'wrap',
      backgroundColor: themeTokens.surface,
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '0.7rem',
      padding: isMobile ? '0.9rem' : '1rem',
      marginBottom: '1rem',
      boxShadow: `0 6px 18px ${appTheme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(15, 23, 42, 0.04)'}`,
    },
    
    // CATEGORY CHIPS GROUP - Horizontal flex for All/Tutor/Technician/Cleaner/More Services
    chipGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
    },
    
    // INDIVIDUAL CHIP - Clickable service category button (inactive state)
    chip: {
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '999px',
      backgroundColor: themeTokens.surface,
      color: themeTokens.textPrimary,
      padding: isMobile ? '0.45rem 0.85rem' : '0.55rem 1rem',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: isMobile ? '0.84rem' : '0.93rem',
      transition: 'all 0.2s ease',
    },
    
    // ACTIVE CHIP STATE - Selected category highlighted in blue with shadow
    chipActive: {
      backgroundColor: themeTokens.accent,
      borderColor: themeTokens.accent,
      color: '#ffffff',
      boxShadow: `0 6px 14px ${appTheme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.24)'}`,
    },
    
    // MUTED CHIP STATE - "More Services" chip with dashed border when inactive
    chipMuted: {
      backgroundColor: appTheme === 'dark' ? '#1f2937' : '#f8fafc',
      borderStyle: 'dashed',
    },
    
    // DISTRICT DROPDOWN - Location filter selector
    districtDropdown: {
      minWidth: isMobile ? '100%' : '190px',
      width: isMobile ? '100%' : 'auto',
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '0.5rem',
      padding: '0.45rem 0.6rem',
      backgroundColor: themeTokens.surface,
      color: themeTokens.textPrimary,
      fontWeight: 600,
    },
    resultSummary: {
      marginBottom: '0.85rem',
      color: themeTokens.textSecondary,
      fontSize: '0.92rem',
      fontWeight: 600,
    },
    
    // SERVICE GRID - Responsive auto-fit grid for service cards
    // Desktop: auto-fit 4 columns | Mobile: 1 column
    // Tracks are wider so cards hold badges/text more naturally while staying compact
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(290px, 1fr))',
      columnGap: '1.6rem',
      rowGap: '4.2rem',
    },
    
    // SKELETON LOADING CARD - Animated placeholder while data loads
    // Shows 6 cards with gray placeholder lines
    loadingCard: {
      backgroundColor: themeTokens.surface,
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '0.75rem',
      padding: '0.9rem',
      minHeight: '180px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.7rem',
    },
    
    // SKELETON LINE - Gray animated placeholder for text content
    loadingLine: {
      height: '12px',
      borderRadius: '4px',
      backgroundColor: `${appTheme === 'dark' ? '#374151' : '#e2e8f0'}`,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    
    // EMPTY STATE MESSAGE - Shows when no providers match the filters
    emptyState: {
      backgroundColor: themeTokens.surface,
      border: `1px dashed ${themeTokens.border}`,
      borderRadius: '0.75rem',
      padding: '1.25rem',
      color: themeTokens.textSecondary,
      gridColumn: '1 / -1', // Spans full width of grid
    },
    
    emptyTitle: {
      margin: 0,
      fontSize: '1rem',
      fontWeight: 700,
      color: themeTokens.textPrimary,
    },
    
    emptyText: {
      margin: '0.35rem 0 0',
      lineHeight: 1.5,
      color: themeTokens.textSecondary,
    },
  };

  // ============================================================================
  // RENDER - Main Dashboard Page Layout
  // ============================================================================
  // Structure:
  // 1. Sticky Header (navigation & search)
  // 2. Hero Section (service-first headline)
  // 3. Filter Bar (category chips + location dropdown)
  // 4. Result Summary (count of filtered providers)
  // 5. Service Grid (cards or skeleton or empty state)
  // 6. Modals (WorkerDetail, BookingCalendar, Payment, Notification)
  // ============================================================================
  return (
    <div style={styles.page} id="dashboard-home">
      {/* NAVIGATION BAR - Dashboard-specific header (Facebook-like) */}
      <DashboardNavigation
        appTheme={appTheme}
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
        {/* SECTION 1: HERO/INTRO - Service-first headline and call to action */}
        <section style={styles.introSection}>
          <h1 style={styles.introHeading}>Find Services You Need Today</h1>
          <p style={styles.introSubHeading}>What service are you looking for today?</p>
          <p style={styles.introText}>Choose a category to see available providers instantly.</p>
        </section>

        {/* SECTION 2: FILTER BAR - Category chips and location dropdown */}
        <section style={styles.filterBar}>
          {/* Category chips: All, Tutor, Technician, Cleaner, More Services */}
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

          {/* District/Location filter dropdown */}
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

        {/* SECTION 3: RESULT SUMMARY - Shows count and filter context */}
        <p style={styles.resultSummary}>
          Showing {filteredProviders.length} {selectedCategoryLabel}
          {selectedDistrict !== 'All Districts' ? ` in ${selectedDistrict}` : ''}
        </p>

        {/* SECTION 4: SERVICE CARDS GRID
            Shows loading skeleton → actual cards → empty state based on loading state */}
        <section style={styles.grid}>
          {isLoadingCards
            ? // LOADING STATE: Show 6 skeleton placeholder cards
              Array.from({ length: 6 }).map((_, index) => (
                <div key={`loading-card-${index}`} style={styles.loadingCard} aria-label="Loading service card">
                  <div style={{ ...styles.loadingLine, width: '52%' }} />
                  <div style={{ ...styles.loadingLine, width: '70%' }} />
                  <div style={{ ...styles.loadingLine, width: '92%' }} />
                  <div style={{ ...styles.loadingLine, width: '65%' }} />
                  <div style={{ ...styles.loadingLine, width: '40%', marginTop: 'auto' }} />
                </div>
              ))
            : filteredProviders.length > 0
              ? // DATA STATE: Show actual service cards
                filteredProviders.map((provider) => (
                  <ServiceCard key={provider.id} provider={provider} onViewProfile={handleViewProfile} />
                ))
              : // EMPTY STATE: Show message when no results match filters
                (
                <div style={styles.emptyState}>
                  <p style={styles.emptyTitle}>No match for this service view yet.</p>
                  <p style={styles.emptyText}>{noResultsMessage}</p>
                </div>
              )}
        </section>
      </main>

      {/* ========================================================================
          MODAL LAYER 1: WORKER DETAIL MODAL
          ========================================================================
          Triggered by: ServiceCard click → handleViewProfile
          Shows: Provider bio, pricing details, ratings, action buttons (Book/Inquire)
          Closed by: handleCloseWorkerModal (user clicks back or outside modal)
      */}
      <WorkerDetailModal
        isOpen={isWorkerModalOpen}
        worker={selectedWorker}
        onClose={handleCloseWorkerModal}
        onBookNow={handleBookNow}
      />

      {/* ========================================================================
          MODAL LAYER 2: BOOKING CALENDAR MODAL
          ========================================================================
          Triggered by: "Book Now" button in WorkerDetailModal → handleBookNow
          Shows: Date/day selector and time slot picker with availability
          Closed by: handleCloseBookingCalendar (user clicks back)
          Next: Advances to PaymentModal → handleConfirmBooking
      */}
      <BookingCalendarModal
        isOpen={isBookingCalendarOpen}
        onClose={handleCloseBookingCalendar}
        worker={selectedWorker}
        schedule={selectedWorker ? schedulesByProvider[selectedWorker.id] : null}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* ========================================================================
          MODAL LAYER 3: PAYMENT METHOD MODAL
          ========================================================================
          Triggered by: Confirm button in BookingCalendarModal → handleConfirmBooking
          Shows: Payment method options (GCash advance, After-service cash, etc.)
          Closed by: handleCancelPayment (user clicks back)
          Completion: Triggers success notification → handleSelectPayment
      */}
      {isPaymentModalOpen && pendingBooking && (
        <PaymentModal
          booking={pendingBooking}
          onSelectPayment={handleSelectPayment}
          onCancel={handleCancelPayment}
        />
      )}

      {/* ========================================================================
          SUCCESS NOTIFICATION
          ========================================================================
          Triggered by: handleSelectPayment (after payment method selected)
          Shows: Toast notification with booking confirmation message
          Auto-dismisses: After 3 seconds or user clicks close
      */}
      />
    </div>
  );
}

export default Dashboard;
