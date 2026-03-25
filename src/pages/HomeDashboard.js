import { useState } from 'react';
// Note: Using functional components with JSX and className for styling
// Note: External CSS imported from styles/
import ServiceCard from '../components/ServiceCard';
import WorkerDetailModal from '../components/WorkerDetailModal';
import BookingNotification from '../components/BookingNotification';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import { MOCK_WORKERS } from '../data/MockWorkers';
import '../styles/HomeDashboard.css';

function HomeDashboard({ onLogout }) {
  // Note: Comprehensive mock data with multiple rate basis types
  // Data includes per-hour, per-day, and per-project rate workers
  const dummyProviders = [
    {
      id: MOCK_WORKERS[0].id,
      name: MOCK_WORKERS[0].fullName,
      serviceType: MOCK_WORKERS[0].serviceType,
      rating: 4.9,
      reviews: 187,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      description: MOCK_WORKERS[0].description,
      experience: 5,
      location: `${MOCK_WORKERS[0].location.city}, ${MOCK_WORKERS[0].location.province}`,
      hourlyRate: MOCK_WORKERS[0].hourlyRate,
      rateBasis: 'per-hour',
    },
    {
      id: MOCK_WORKERS[1].id,
      name: MOCK_WORKERS[1].fullName,
      serviceType: MOCK_WORKERS[1].serviceType,
      rating: 4.8,
      reviews: 92,
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      description: MOCK_WORKERS[1].description,
      experience: 8,
      location: `${MOCK_WORKERS[1].location.city}, ${MOCK_WORKERS[1].location.province}`,
      hourlyRate: MOCK_WORKERS[1].hourlyRate,
      rateBasis: 'per-hour',
    },
    {
      id: MOCK_WORKERS[2].id,
      name: MOCK_WORKERS[2].fullName,
      serviceType: MOCK_WORKERS[2].serviceType,
      rating: 4.7,
      reviews: 156,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      description: MOCK_WORKERS[2].description,
      experience: 7,
      location: `${MOCK_WORKERS[2].location.city}, ${MOCK_WORKERS[2].location.province}`,
      dailyRate: MOCK_WORKERS[2].dailyRate,
      rateBasis: 'per-day',
    },
    {
      id: MOCK_WORKERS[3].id,
      name: MOCK_WORKERS[3].fullName,
      serviceType: MOCK_WORKERS[3].serviceType,
      rating: 4.9,
      reviews: 203,
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      description: MOCK_WORKERS[3].description,
      experience: 6,
      location: `${MOCK_WORKERS[3].location.city}, ${MOCK_WORKERS[3].location.province}`,
      projectRate: MOCK_WORKERS[3].projectRate,
      rateBasis: 'per-project',
    },
    {
      id: MOCK_WORKERS[4].id,
      name: MOCK_WORKERS[4].fullName,
      serviceType: MOCK_WORKERS[4].serviceType,
      rating: 4.8,
      reviews: 134,
      photo: 'https://images.unsplash.com/photo-1507539803627-c150f650b237?w=400&h=400&fit=crop',
      description: MOCK_WORKERS[4].description,
      experience: 9,
      location: `${MOCK_WORKERS[4].location.city}, ${MOCK_WORKERS[4].location.province}`,
      dailyRate: MOCK_WORKERS[4].dailyRate,
      rateBasis: 'per-day',
    },
    {
      id: MOCK_WORKERS[5].id,
      name: MOCK_WORKERS[5].fullName,
      serviceType: MOCK_WORKERS[5].serviceType,
      rating: 4.7,
      reviews: 98,
      photo: 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=400&h=400&fit=crop',
      description: MOCK_WORKERS[5].description,
      experience: 4,
      location: `${MOCK_WORKERS[5].location.city}, ${MOCK_WORKERS[5].location.province}`,
      projectRate: MOCK_WORKERS[5].projectRate,
      rateBasis: 'per-project',
    },
  ];

  // Note: Using React useState to manage filters, modals, and notifications
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [showBookingNotification, setShowBookingNotification] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Note: camelCase for event handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleViewProfile = (provider) => {
    setSelectedWorker(provider);
    setIsWorkerModalOpen(true);
  };

  const handleCloseWorkerModal = () => {
    setIsWorkerModalOpen(false);
    setSelectedWorker(null);
  };

  // Note: Simulated booking - shows success notification
  const handleBookNow = (worker) => {
    setIsWorkerModalOpen(false);
    setBookingMessage(`Booking request sent to ${worker.name}!`);
    setShowBookingNotification(true);
    setSelectedWorker(null);
  };

  const handleCloseNotification = () => {
    setShowBookingNotification(false);
  };

  // Note: Filter providers based on search and category
  const filteredProviders = dummyProviders.filter((provider) => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'All' || provider.location === selectedLocation;
    const matchesCategory = selectedCategory === 'All' || provider.serviceType === selectedCategory;

    return matchesSearch && matchesLocation && matchesCategory;
  });

  // Note: Extract unique locations and service categories
  const locations = ['All', ...new Set(dummyProviders.map((p) => p.location))];
  const categories = ['All', ...new Set(dummyProviders.map((p) => p.serviceType))];

  return (
    <div className="home-dashboard">
      {/* Header with Logout */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">Browse Services</h1>
          <button onClick={() => setIsLogoutConfirmOpen(true)} className="dashboard-logout-button">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Search & Filter Section */}
        <section className="search-filter-section">
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name or service..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="filter-container">
            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={handleLocationChange}
              className="filter-dropdown"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location === 'All' ? 'All Locations' : location}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="filter-dropdown"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Results Count */}
        <section className="results-info">
          <p className="results-count">
            Showing {filteredProviders.length} result{filteredProviders.length !== 1 ? 's' : ''}
          </p>
        </section>

        {/* Service Grid */}
        {/* Note: Using .map() to render ServiceCard for each provider */}
        <section className="services-grid">
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <ServiceCard
                key={provider.id}
                provider={provider}
                onViewProfile={handleViewProfile}
              />
            ))
          ) : (
            <div className="no-results">
              <p>No services found. Try adjusting your filters.</p>
            </div>
          )}
        </section>
      </main>

      {/* Worker Detail Modal */}
      <WorkerDetailModal
        isOpen={isWorkerModalOpen}
        worker={selectedWorker}
        onClose={handleCloseWorkerModal}
        onBookNow={handleBookNow}
      />

      {/* Booking Notification */}
      <BookingNotification
        message={bookingMessage}
        isVisible={showBookingNotification}
        onClose={handleCloseNotification}
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

export default HomeDashboard;
