import { useState } from 'react';
// Note: This page is shown through isLoggedIn conditional rendering in App.js.
// Note: Service cards are rendered dynamically with .map() and filtered via React state.
import Header from '../components/Header';
import ServiceCard from '../components/ServiceCard';
import WorkerDetailModal from '../components/WorkerDetailModal';
import BookingCalendarModal from '../components/BookingCalendarModal';
import BookingNotification from '../components/BookingNotification';
import '../styles/Dashboard.css';

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
  const [showBookingNotification, setShowBookingNotification] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

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

  const handleUpdateSchedule = (providerId, updatedSchedule) => {
    setSchedulesByProvider((prev) => ({
      ...prev,
      [providerId]: updatedSchedule,
    }));
  };

  const handleConfirmBooking = ({ workerId, dayKey, blockId, manualScheduling }) => {
    if (manualScheduling) {
      setBookingMessage('Manual schedule request sent! Worker will confirm via chat.');
    } else {
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

      setBookingMessage('Booking Request Sent!');
    }

    setIsBookingCalendarOpen(false);
    setShowBookingNotification(true);
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

  return (
    <div className="dashboard-page" id="dashboard-home">
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

      <main className="dashboard-main-content">
        <section className="filter-bar">
          <div className="chip-group">
            {categoryChips.map((chip) => (
              <button
                key={chip}
                className={`filter-chip ${activeCategory === chip ? 'active' : ''}`}
                onClick={() => handleCategoryClick(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          <select
            className="district-dropdown"
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

        <section className="services-grid">
          {filteredProviders.map((provider) => (
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

      <BookingNotification
        message={bookingMessage}
        isVisible={showBookingNotification}
        onClose={handleCloseNotification}
      />
    </div>
  );
}

export default Dashboard;
