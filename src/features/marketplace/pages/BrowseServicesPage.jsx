import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpDown,
  BriefcaseBusiness,
  CalendarCheck,
  Filter,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import DashboardNavigation from '../../../shared/components/DashboardNavigation';
import SuccessNotification from '../../../shared/components/SuccessNotification';
import ErrorNotification from '../../../shared/components/ErrorNotification';
import { createClientBooking } from '../../bookings/services/bookingService';
import { fetchAllActiveServices } from '../../../shared/services/authService';
import { supabase } from '../../../shared/services/supabaseClient';
import BookingCalendarModal from '../../bookings/components/BookingCalendarModal';
import PaymentModal from '../../bookings/components/PaymentModal';
import ServiceCard from '../components/ServiceCard';
import WorkerDetailModal from '../components/WorkerDetailModal';
import ReviewsModal from '../components/ReviewsModal';
import {
  buildWeeklyScheduleFromSlots,
  createScheduleForProvider,
  getDisplayServiceType,
  getProviderQuoteAmount,
  normalizeServiceRecord,
} from '../utils/serviceNormalizer';

const DEFAULT_CATEGORIES = ['All', 'Tutor', 'Technician', 'Cleaner', 'More Services'];

function BrowseServicesPage({
  mode = 'authenticated',
  appTheme = 'light',
  currentView = 'browse-services',
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  onRequireLogin,
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
  const isPublic = mode === 'public';
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [sortMode, setSortMode] = useState('recommended');
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isBookingCalendarOpen, setIsBookingCalendarOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [reviewsTarget, setReviewsTarget] = useState(null);
  const [schedulesByProvider, setSchedulesByProvider] = useState({});

  const searchQuery = isPublic ? localSearchQuery : externalSearchQuery;

  useEffect(() => {
    let mounted = true;

    const loadServices = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const rows = await fetchAllActiveServices(80);
        if (!mounted) return;
        setServices((rows || []).map((row) => normalizeServiceRecord(row, sellerProfile || {})));
      } catch (error) {
        if (!mounted) return;
        setLoadError(error?.message || 'Unable to load services right now.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadServices();
    return () => {
      mounted = false;
    };
  }, [sellerProfile]);

  useEffect(() => {
    let mounted = true;

    const loadSlots = async () => {
      const serviceIds = services.map((item) => item.rawService?.id).filter(Boolean);

      setSchedulesByProvider((prev) => {
        const next = { ...prev };
        services.forEach((provider) => {
          if (!next[provider.id]) next[provider.id] = createScheduleForProvider(provider);
        });
        return next;
      });

      if (serviceIds.length === 0) return;

      const { data, error } = await supabase
        .from('service_slots')
        .select('*')
        .in('service_id', serviceIds)
        .order('start_ts', { ascending: true });

      if (error || !mounted) return;

      const slotsByService = {};
      (data || []).forEach((slot) => {
        if (!slotsByService[slot.service_id]) slotsByService[slot.service_id] = [];
        slotsByService[slot.service_id].push(slot);
      });

      setSchedulesByProvider((prev) => {
        const next = { ...prev };
        services.forEach((provider) => {
          const slots = slotsByService[provider.rawService?.id] || [];
          next[provider.id] = buildWeeklyScheduleFromSlots(slots, provider);
        });
        return next;
      });
    };

    loadSlots();
    return () => {
      mounted = false;
    };
  }, [services]);

  const categories = useMemo(() => {
    const dynamic = services
      .map(getDisplayServiceType)
      .filter(Boolean)
      .filter((value) => !DEFAULT_CATEGORIES.includes(value));
    return [...DEFAULT_CATEGORIES, ...Array.from(new Set(dynamic)).slice(0, 5)];
  }, [services]);

  const districts = useMemo(() => {
    const items = services.map((service) => service.location).filter(Boolean);
    return ['All Districts', ...Array.from(new Set(items))];
  }, [services]);

  const filteredServices = useMemo(() => {
    const normalizedSearch = String(searchQuery || '').trim().toLowerCase();
    const core = ['Tutor', 'Technician', 'Cleaner'];

    const filtered = services.filter((provider) => {
      const serviceLabel = getDisplayServiceType(provider);
      const haystack = [
        provider.name,
        provider.title,
        serviceLabel,
        provider.description,
        provider.location,
      ].join(' ').toLowerCase();

      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const isCore = core.includes(serviceLabel);
      const matchesCategory = activeCategory === 'All'
        || (activeCategory === 'More Services' ? !isCore : serviceLabel === activeCategory);
      const matchesDistrict = selectedDistrict === 'All Districts' || provider.location === selectedDistrict;

      return matchesSearch && matchesCategory && matchesDistrict;
    });

    return filtered.sort((a, b) => {
      if (sortMode === 'price-low') return getProviderQuoteAmount(a) - getProviderQuoteAmount(b);
      if (sortMode === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortMode === 'newest') return new Date(b.rawService?.created_at || 0) - new Date(a.rawService?.created_at || 0);
      return (b.reviews || 0) - (a.reviews || 0);
    });
  }, [activeCategory, searchQuery, selectedDistrict, services, sortMode]);

  const handleSearchChange = (event) => {
    if (isPublic) {
      setLocalSearchQuery(event.target.value);
      return;
    }
    onSearchChange?.(event);
  };

  const handleViewProfile = (provider) => {
    setSelectedWorker(provider);
    setIsWorkerModalOpen(true);
  };

  const handleBookNow = (worker) => {
    if (isPublic) {
      setIsWorkerModalOpen(false);
      onRequireLogin?.();
      return;
    }

    if (worker.actionType === 'inquire') {
      setIsWorkerModalOpen(false);
      setBookingMessage(`Inquiry started with ${worker.name}.`);
      return;
    }

    setIsWorkerModalOpen(false);
    setIsBookingCalendarOpen(true);
  };

  const handleConfirmBooking = ({ workerId, date, dayKey, blockId, manualScheduling }) => {
    const worker = services.find((item) => item.id === workerId) || selectedWorker;
    if (!worker) return;

    const schedule = schedulesByProvider[workerId] || createScheduleForProvider(worker);
    const selectedBlock = manualScheduling
      ? { id: `manual-${workerId}-${date}`, startTime: 'Manual', endTime: 'Schedule', capacity: 1, slotsLeft: 1 }
      : ((schedule.dayBlocks?.[date] || schedule.dayBlocks?.[dayKey] || []).find((block) => block.id === blockId));

    setPendingBooking({
      workerId,
      serviceId: worker.rawService?.id,
      sellerId: worker.rawService?.seller_id,
      rawService: worker.rawService,
      workerName: worker.name,
      serviceType: getDisplayServiceType(worker),
      quoteAmount: getProviderQuoteAmount(worker),
      selectedSlot: {
        date,
        dateKey: date,
        dayKey,
        blockId: selectedBlock?.id || blockId,
        slotId: selectedBlock?.rawSlot?.id || null,
        rawSlot: selectedBlock?.rawSlot || null,
        timeBlock: selectedBlock,
      },
      allowGcashAdvance: true,
      allowAfterService: true,
      afterServicePaymentType: 'both',
    });

    setIsBookingCalendarOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handleSelectPayment = async (selectedPaymentMethod) => {
    if (!pendingBooking) return;

    const { workerId, selectedSlot } = pendingBooking;
    const { dateKey, dayKey, blockId } = selectedSlot;
    const worker = services.find((item) => item.id === workerId) || selectedWorker;

    try {
      setIsBookingSubmitting(true);
      setBookingError('');
      await createClientBooking({
        provider: worker,
        pendingBooking,
        paymentMethod: selectedPaymentMethod,
      });
    } catch (error) {
      setBookingError(error?.message || 'Unable to create booking.');
      setIsBookingSubmitting(false);
      return;
    }

    setSchedulesByProvider((prev) => {
      const providerSchedule = prev[workerId] || {};
      const applyDecrement = (blocks = []) =>
        blocks.map((block) => (
          block.id === blockId ? { ...block, slotsLeft: Math.max(0, (block.slotsLeft || 0) - 1) } : block
        ));

      return {
        ...prev,
        [workerId]: {
          ...providerSchedule,
          dayBlocks: {
            ...providerSchedule.dayBlocks,
            ...(dateKey ? { [dateKey]: applyDecrement(providerSchedule.dayBlocks?.[dateKey] || []) } : {}),
            ...(dayKey ? { [dayKey]: applyDecrement(providerSchedule.dayBlocks?.[dayKey] || []) } : {}),
          },
        },
      };
    });

    const paymentLabel =
      selectedPaymentMethod === 'gcash-advance'
        ? 'GCash advance payment'
        : selectedPaymentMethod === 'after-service-cash'
          ? 'cash after-service payment'
          : 'GCash after-service payment';

    setBookingMessage(`Booking confirmed with ${paymentLabel}.`);
    setIsPaymentModalOpen(false);
    setPendingBooking(null);
    setSelectedWorker(null);
    setIsBookingSubmitting(false);
  };

  const stats = [
    { label: 'Live services', value: services.length || 0 },
    { label: 'Categories', value: Math.max(categories.length - 2, 0) },
    { label: 'Visible now', value: filteredServices.length || 0 },
  ];

  return (
    <div className="gl-page" data-testid={isPublic ? 'public-browse-services' : 'app-browse-services'}>
      {!isPublic && (
        <DashboardNavigation
          appTheme={appTheme}
          currentView={currentView}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
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
      )}

      <main className="gl-shell gl-page-pad">
        <section className="browse-hero gl-card">
          <div>
            <span className="gl-eyebrow"><Sparkles size={15} /> Browse Services</span>
            <h1 className="gl-title">Find trusted local help without the clutter.</h1>
            <p className="gl-subtitle">
              Search live services, compare availability, and choose the right provider for the work you need.
            </p>
          </div>
          <div className="gl-kpi-grid browse-kpis">
            {stats.map((item) => (
              <div className="gl-kpi gl-card" key={item.label}>
                <p className="gl-kpi-value">{item.value}</p>
                <p className="gl-kpi-label">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="browse-marketplace" aria-label="Service marketplace">
          <aside className="browse-filter-rail gl-card" aria-label="Browse filters">
            <div className="browse-filter-head">
              <Filter size={17} aria-hidden="true" />
              <strong>Filters</strong>
            </div>

            <div className="browse-filter-group">
              <span>Category</span>
              <div className="browse-filter-options" aria-label="Service categories">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`browse-filter-option ${activeCategory === category ? 'active' : ''}`}
                    type="button"
                    aria-label={category}
                    onClick={() => setActiveCategory(category)}
                  >
                    <span>{category}</span>
                    <small>{category === 'All' ? services.length : services.filter((item) => {
                      const serviceLabel = getDisplayServiceType(item);
                      const core = ['Tutor', 'Technician', 'Cleaner'];
                      return category === 'More Services' ? !core.includes(serviceLabel) : serviceLabel === category;
                    }).length}</small>
                  </button>
                ))}
              </div>
            </div>

            <label className="browse-filter-group">
              <span>District</span>
              <select className="gl-select" value={selectedDistrict} onChange={(event) => setSelectedDistrict(event.target.value)}>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="gl-button secondary browse-clear-button"
              onClick={() => {
                setActiveCategory('All');
                setSelectedDistrict('All Districts');
                setSortMode('recommended');
                if (isPublic) setLocalSearchQuery('');
                else onSearchChange?.({ target: { value: '' } });
              }}
            >
              Clear filters
            </button>
          </aside>

          <section className="browse-results-panel">
            <div className="browse-toolbar gl-card">
              <div className="browse-search">
                <Search size={18} aria-hidden="true" />
                <input
                  className="gl-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search services, providers, or locations"
                />
              </div>

              <label className="browse-select-label">
                <ArrowUpDown size={16} aria-hidden="true" />
                <select className="gl-select" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                  <option value="recommended">Recommended</option>
                  <option value="rating">Highest rated</option>
                  <option value="price-low">Lowest price</option>
                  <option value="newest">Newest</option>
                </select>
              </label>
            </div>

            <div className="browse-results-head">
              <p>{isLoading ? 'Loading services...' : `${filteredServices.length} matching services`}</p>
              <div>
                <span><BriefcaseBusiness size={15} aria-hidden="true" /> {activeCategory}</span>
                <span><MapPin size={15} aria-hidden="true" /> {selectedDistrict}</span>
                <span><CalendarCheck size={15} aria-hidden="true" /> {sortMode}</span>
              </div>
            </div>

            {loadError && (
              <div className="gl-empty" role="alert">{loadError}</div>
            )}

            {isLoading ? (
              <section className="browse-results-list">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div className="browse-skeleton gl-card" key={`service-skeleton-${index}`}>
                    <span />
                    <strong />
                    <p />
                    <p />
                    <button />
                  </div>
                ))}
              </section>
            ) : filteredServices.length > 0 ? (
              <section className="browse-results-list">
                {filteredServices.map((provider) => (
                  <ServiceCard
                    key={provider.id}
                    provider={provider}
                    onViewProfile={handleViewProfile}
                    onViewReviews={setReviewsTarget}
                  />
                ))}
              </section>
            ) : (
              <div className="gl-empty">
                <strong>No services match these filters yet.</strong>
                <p>Try a broader search, another district, or the All category.</p>
              </div>
            )}
          </section>
        </section>
      </main>

      <WorkerDetailModal
        isOpen={isWorkerModalOpen}
        worker={selectedWorker}
        onClose={() => {
          setIsWorkerModalOpen(false);
          setSelectedWorker(null);
        }}
        onBookNow={handleBookNow}
      />

      <BookingCalendarModal
        isOpen={isBookingCalendarOpen}
        onClose={() => setIsBookingCalendarOpen(false)}
        worker={selectedWorker}
        schedule={selectedWorker ? (schedulesByProvider[selectedWorker.id] || createScheduleForProvider(selectedWorker)) : null}
        onConfirmBooking={handleConfirmBooking}
      />

      {isPaymentModalOpen && pendingBooking && (
        <PaymentModal
          booking={pendingBooking}
          onSelectPayment={handleSelectPayment}
          onCancel={() => {
            if (isBookingSubmitting) return;
            setIsPaymentModalOpen(false);
            setPendingBooking(null);
          }}
        />
      )}

      <ReviewsModal
        isOpen={Boolean(reviewsTarget)}
        provider={reviewsTarget}
        onClose={() => setReviewsTarget(null)}
        reviews={reviewsTarget ? [
          { clientName: 'Client A', rating: 5, comment: 'Excellent service, on time and professional.', date: '2026-02-11' },
          { clientName: 'Client B', rating: 4, comment: 'Good quality and easy to coordinate with.', date: '2026-01-22' },
        ] : []}
        appTheme={appTheme}
      />

      <SuccessNotification
        message={bookingMessage}
        isVisible={Boolean(bookingMessage)}
        onClose={() => setBookingMessage('')}
      />
      <ErrorNotification
        message={loadError || bookingError}
        isVisible={Boolean(loadError || bookingError)}
        onClose={() => {
          setLoadError('');
          setBookingError('');
        }}
      />
    </div>
  );
}

export default BrowseServicesPage;
