import { useState } from 'react';
// Note: Using functional components with JSX and className for styling
// Note: External CSS imported from styles/
import ServiceCard from '../components/ServiceCard';
import WorkerDetailModal from '../components/WorkerDetailModal';
import BookingNotification from '../components/BookingNotification';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import { MOCK_WORKERS } from '../data/MockWorkers';


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

  const [logoutBtnHovered, setLogoutBtnHovered] = useState(false);
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
  const styles = {
    homeDashboard: {
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
    },
    dashboardHeader: {
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    },
    dashboardHeaderContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dashboardTitle: {
      fontSize: '1.8rem',
      color: '#1f2937',
      margin: 0,
      fontWeight: 700,
    },
    dashboardLogoutButton: {
      backgroundColor: logoutBtnHovered ? '#dc2626' : '#ef4444',
      color: '#ffffff',
      border: 'none',
      padding: '0.6rem 1.2rem',
      borderRadius: '0.4rem',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'background-color 0.3s ease',
    },
    dashboardMain: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
    },
    searchFilterSection: {
      backgroundColor: '#ffffff',
      padding: '1.5rem',
      borderRadius: '0.8rem',
      marginBottom: '2rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    searchContainer: {
      marginBottom: '1.5rem',
    },
    searchInput: {
      width: '100%',
      padding: '0.9rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.4rem',
      fontSize: '1rem',
      fontFamily: 'inherit',
      transition: 'all 0.3s ease',
      backgroundColor: '#ffffff',
      color: '#000',
    },
    filterContainer: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    filterDropdown: {
      flex: 1,
      minWidth: '200px',
      padding: '0.7rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.4rem',
      fontSize: '0.95rem',
      fontFamily: 'inherit',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: '#000',
    },
    resultsInfo: {
      marginBottom: '1.5rem',
    },
    resultsCount: {
      fontSize: '1rem',
      color: '#6b7280',
      margin: 0,
      fontWeight: 500,
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      animation: 'fadeIn 0.3s ease',
    },
    noResults: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: '3rem 2rem',
      backgroundColor: '#ffffff',
      borderRadius: '0.8rem',
      color: '#6b7280',
    },
    noResultsP: {
      fontSize: '1.1rem',
      margin: 0,
    },
  };

  return (
    <div style={styles.homeDashboard}>
      <div style={styles.dashboardHeader}>
        <div style={styles.dashboardHeaderContent}>
          <h1 style={styles.dashboardTitle}>Browse Services</h1>
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            style={styles.dashboardLogoutButton}
            onMouseEnter={() => setLogoutBtnHovered(true)}
            onMouseLeave={() => setLogoutBtnHovered(false)}
          >
            Logout
          </button>
        </div>
      </div>

      <main style={styles.dashboardMain}>
        <section style={styles.searchFilterSection}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name or service..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={styles.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.filterContainer}>
            <select
              value={selectedLocation}
              onChange={handleLocationChange}
              style={styles.filterDropdown}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location === 'All' ? 'All Locations' : location}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={styles.filterDropdown}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section style={styles.resultsInfo}>
          <p style={styles.resultsCount}>
            Showing {filteredProviders.length} result{filteredProviders.length !== 1 ? 's' : ''}
          </p>
        </section>

        <section style={styles.servicesGrid}>
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <ServiceCard
                key={provider.id}
                provider={provider}
                onViewProfile={handleViewProfile}
              />
            ))
          ) : (
            <div style={styles.noResults}>
              <p style={styles.noResultsP}>No services found. Try adjusting your filters.</p>
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
