import { useState } from 'react';
// Note: Conditional rendering is used for the Profile Dropdown menu via isProfileMenuOpen state.
// Note: Using className and camelCase handlers (onClick, onChange) with external CSS from styles/.
import LogoutConfirmModal from './LogoutConfirmModal';
import '../styles/Header.css';

function Header({ searchQuery, onSearchChange, onLogout, onOpenSellerSetup, onOpenMyBookings, sellerProfile, onOpenMyWork, onGoHome, onOpenProfile, onOpenAccountSettings, onOpenSettings }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Payment Successful',
      message: 'Your GCash payment for Tutoring was confirmed.',
      time: '2m ago',
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Booking Confirmed',
      message: 'Carlo Mendoza accepted your Aircon Cleaning booking.',
      time: '15m ago',
      isRead: false,
    },
    {
      id: 'notif-3',
      title: 'Upcoming Schedule',
      message: 'Reminder: Pet Grooming service is scheduled tomorrow at 2:00 PM.',
      time: '1h ago',
      isRead: true,
    },
  ]);

  const toggleProfileMenu = () => {
    setIsNotificationOpen(false);
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleNotifications = () => {
    setIsProfileMenuOpen(false);
    setIsNotificationOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenus = () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsNotificationOpen(false);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleNotificationClick = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const requestLogout = () => {
    closeMenus();
    setIsLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    onLogout && onLogout();
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">
        <a
          href="#dashboard-home"
          className="dashboard-logo"
          onClick={(event) => {
            closeMenus();
            if (onGoHome) {
              event.preventDefault();
              onGoHome();
            }
          }}
        >
          GigLink
        </a>

        <div className="dashboard-search desktop-only">
          <input
            type="text"
            placeholder="Search for services..."
            value={searchQuery}
            onChange={onSearchChange}
            className="dashboard-search-input"
          />
        </div>

        <div className="dashboard-actions desktop-only">
          {sellerProfile ? (
            <button className="become-seller-button my-work-button" onClick={onOpenMyWork}>
              My Work
            </button>
          ) : (
            <button className="become-seller-button" onClick={onOpenSellerSetup}>
              Become a Seller
            </button>
          )}

          <div className="notification-wrapper">
            <button
              className="notification-button"
              aria-label="Notifications"
              onClick={toggleNotifications}
            >
              <span className="notification-bell" aria-hidden="true">&#128276;</span>
              {unreadCount > 0 && <span className="notification-dot"></span>}
            </button>

            {isNotificationOpen && (
              <div className="notification-dropdown-menu">
                <div className="notification-header-row">
                  <p>Notifications</p>
                  <button
                    type="button"
                    className="notification-mark-read"
                    onClick={markAllNotificationsRead}
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <p className="notification-empty">No notifications yet.</p>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`notification-item ${item.isRead ? '' : 'unread'}`}
                        onClick={() => handleNotificationClick(item.id)}
                      >
                        <div className="notification-item-top">
                          <span className="notification-item-title">{item.title}</span>
                          <span className="notification-item-time">{item.time}</span>
                        </div>
                        <span className="notification-item-message">{item.message}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="profile-menu-wrapper">
            <button
              className="profile-avatar-button"
              onClick={toggleProfileMenu}
              aria-label="Profile menu"
            >
              JL
            </button>

            {isProfileMenuOpen && (
              <div className="profile-dropdown-menu">
                <button className="profile-menu-item" onClick={() => { closeMenus(); onGoHome && onGoHome(); }}>Home</button>
                <button className="profile-menu-item" onClick={() => { closeMenus(); onOpenProfile && onOpenProfile(); }}>Profile</button>
                <button className="profile-menu-item" onClick={onOpenMyBookings}>My Bookings</button>
                <button className="profile-menu-item" onClick={() => { closeMenus(); onOpenProfile && onOpenProfile(); }}>Account Settings</button>
                <button className="profile-menu-item" onClick={() => { closeMenus(); onOpenSettings && onOpenSettings(); }}>Preferences</button>
                <button className="profile-menu-item logout" onClick={requestLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <button className="mobile-menu-button mobile-only" onClick={toggleMobileMenu} aria-label="Toggle menu">
          <span className="mobile-menu-line"></span>
          <span className="mobile-menu-line"></span>
          <span className="mobile-menu-line"></span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="dashboard-search">
            <input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={onSearchChange}
              className="dashboard-search-input"
            />
          </div>

          <div className="mobile-actions">
            {sellerProfile ? (
              <button className="become-seller-button my-work-button" onClick={onOpenMyWork}>
                My Work
              </button>
            ) : (
              <button className="become-seller-button" onClick={onOpenSellerSetup}>
                Become a Seller
              </button>
            )}
            <button className="profile-menu-item" onClick={() => { closeMenus(); onGoHome && onGoHome(); }}>Home</button>
            <button className="profile-menu-item" onClick={() => { closeMenus(); onOpenProfile && onOpenProfile(); }}>Profile</button>
            <button className="profile-menu-item" onClick={onOpenMyBookings}>My Bookings</button>
            <button className="profile-menu-item" onClick={() => { closeMenus(); onOpenProfile && onOpenProfile(); }}>Account Settings</button>
            <button className="profile-menu-item" onClick={() => { closeMenus(); onOpenSettings && onOpenSettings(); }}>Preferences</button>
            <button className="profile-menu-item logout" onClick={requestLogout}>
              Logout
            </button>
          </div>
        </div>
      )}

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </header>
  );
}

export default Header;
