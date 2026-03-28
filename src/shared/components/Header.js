import { useEffect, useState } from 'react';
// Note: Conditional rendering is used for the Profile Dropdown menu via isProfileMenuOpen state.
// Note: Uses inline style objects and camelCase handlers (onClick, onChange).
import LogoutConfirmModal from '../../features/auth/components/LogoutConfirmModal';


function Header({ searchQuery, onSearchChange, onLogout, onOpenSellerSetup, onOpenMyBookings, sellerProfile, onOpenMyWork, onGoHome, onOpenProfile, onOpenAccountSettings, onOpenSettings, externalNotifications = [] }) {
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
  const [hoveredKey, setHoveredKey] = useState('');
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!externalNotifications || externalNotifications.length === 0) return;

    setNotifications((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));
      const incoming = externalNotifications.filter((item) => !existingIds.has(item.id));
      return incoming.length > 0 ? [...incoming, ...prev] : prev;
    });
  }, [externalNotifications]);

  const styles = {
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 120,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0.9rem 1.25rem',
    },
    inner: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '170px minmax(0, 1fr) auto',
      alignItems: 'center',
      gap: '1rem',
    },
    logo: {
      textDecoration: 'none',
      color: '#2563eb',
      fontWeight: 800,
      fontSize: '1.75rem',
      fontFamily: "'Times New Roman', Georgia, serif",
      marginRight: '0.5rem',
    },
    searchWrap: {
      width: '100%',
      minWidth: 0,
    },
    input: {
      width: '100%',
      height: '44px',
      boxSizing: 'border-box',
      border: '1px solid #cbd5e1',
      borderRadius: '999px',
      padding: '0 1rem',
      fontSize: '0.95rem',
      backgroundColor: '#ffffff',
      color: '#111827',
    },
    actions: {
      marginLeft: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem',
      position: 'relative',
      justifySelf: 'end',
      flexShrink: 0,
    },
    primaryButton: {
      border: 'none',
      borderRadius: '8px',
      padding: '0 1rem',
      height: '40px',
      backgroundColor: '#27ae60',
      color: '#ffffff',
      fontWeight: 700,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    notificationButton: {
      width: '40px',
      height: '40px',
      borderRadius: '999px',
      border: '1px solid #cbd5e1',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      position: 'relative',
      fontSize: '1rem',
    },
    dot: {
      position: 'absolute',
      top: '7px',
      right: '7px',
      width: '8px',
      height: '8px',
      borderRadius: '999px',
      backgroundColor: '#ef4444',
    },
    dropdown: {
      position: 'absolute',
      right: 0,
      top: '48px',
      width: '320px',
      maxWidth: '90vw',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.65rem',
      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.2)',
      padding: '0.7rem',
    },
    dropdownHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    textButton: { border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 600 },
    notificationItem: {
      width: '100%',
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      backgroundColor: '#ffffff',
      textAlign: 'left',
      padding: '0.5rem',
      marginBottom: '0.45rem',
      cursor: 'pointer',
    },
    unreadItem: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
    itemTop: { display: 'flex', justifyContent: 'space-between', gap: '0.5rem' },
    itemTitle: { fontWeight: 700, color: '#1e293b' },
    itemTime: { color: '#64748b', fontSize: '0.78rem' },
    itemMessage: { color: '#334155', fontSize: '0.85rem' },
    avatarButton: {
      width: '40px',
      height: '40px',
      borderRadius: '999px',
      border: 'none',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      fontWeight: 700,
      cursor: 'pointer',
    },
    profileMenu: {
      position: 'absolute',
      right: 0,
      top: '48px',
      minWidth: '180px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.65rem',
      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.2)',
      padding: '0.3rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
    },
    profileItem: {
      border: 'none',
      backgroundColor: '#ffffff',
      textAlign: 'left',
      padding: '0.5rem 0.55rem',
      borderRadius: '0.45rem',
      cursor: 'pointer',
      color: '#1e293b',
    },
    mobileToggle: {
      border: '1px solid #cbd5e1',
      borderRadius: '0.55rem',
      backgroundColor: '#ffffff',
      padding: '0.45rem 0.55rem',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
    },
    mobileLine: { display: 'block', width: '18px', height: '2px', backgroundColor: '#1e293b' },
    mobileDrawer: {
      marginTop: '0.7rem',
      borderTop: '1px solid #e2e8f0',
      paddingTop: '0.7rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.55rem',
    },
    mobileActions: { display: 'flex', flexDirection: 'column', gap: '0.45rem' },
  };

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
  const isDesktop = windowWidth >= 900;

  useEffect(() => {
    if (isDesktop && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isDesktop, isMobileMenuOpen]);

  const effectiveInnerStyle = isDesktop
    ? styles.inner
    : {
        ...styles.inner,
        gridTemplateColumns: '1fr auto',
      };

  const profileButtonStyle = (key, isLogout) => ({
    ...styles.profileItem,
    color: isLogout ? '#b91c1c' : '#1e293b',
    backgroundColor: hoveredKey === key ? '#f1f5f9' : '#ffffff',
  });

  const primaryActionTheme = sellerProfile
    ? { key: 'my-work', base: '#2563eb', hover: '#1d4ed8' }
    : { key: 'become-seller', base: '#27ae60', hover: '#219653' };

  const primaryActionStyle = {
    ...styles.primaryButton,
    backgroundColor:
      hoveredKey === primaryActionTheme.key ? primaryActionTheme.hover : primaryActionTheme.base,
  };

  return (
    <header style={styles.header}>
      <div style={effectiveInnerStyle}>
        <a
          href="#dashboard-home"
          style={styles.logo}
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

        {isDesktop && <div style={styles.searchWrap}>
          <input
            type="text"
            placeholder="Search for services..."
            value={searchQuery}
            onChange={onSearchChange}
            style={styles.input}
          />
        </div>}

        {isDesktop && <div style={styles.actions}>
          {sellerProfile ? (
            <button
              style={primaryActionStyle}
              onMouseEnter={() => setHoveredKey('my-work')}
              onMouseLeave={() => setHoveredKey('')}
              onClick={onOpenMyWork}
            >
              My Work
            </button>
          ) : (
            <button
              style={primaryActionStyle}
              onMouseEnter={() => setHoveredKey('become-seller')}
              onMouseLeave={() => setHoveredKey('')}
              onClick={onOpenSellerSetup}
            >
              Become a Seller
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button
              style={styles.notificationButton}
              aria-label="Notifications"
              onClick={toggleNotifications}
            >
              <span aria-hidden="true">&#128276;</span>
              {unreadCount > 0 && <span style={styles.dot}></span>}
            </button>

            {isNotificationOpen && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <p>Notifications</p>
                  <button
                    type="button"
                    style={styles.textButton}
                    onClick={markAllNotificationsRead}
                  >
                    Mark all as read
                  </button>
                </div>

                <div>
                  {notifications.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No notifications yet.</p>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        style={{ ...styles.notificationItem, ...(!item.isRead ? styles.unreadItem : {}) }}
                        onClick={() => handleNotificationClick(item.id)}
                      >
                        <div style={styles.itemTop}>
                          <span style={styles.itemTitle}>{item.title}</span>
                          <span style={styles.itemTime}>{item.time}</span>
                        </div>
                        <span style={styles.itemMessage}>{item.message}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              style={styles.avatarButton}
              onClick={toggleProfileMenu}
              aria-label="Profile menu"
            >
              JL
            </button>

            {isProfileMenuOpen && (
              <div style={styles.profileMenu}>
                <button style={profileButtonStyle('menu-home')} onMouseEnter={() => setHoveredKey('menu-home')} onMouseLeave={() => setHoveredKey('')} onClick={() => { closeMenus(); onGoHome && onGoHome(); }}>Home</button>
                <button style={profileButtonStyle('menu-profile')} onMouseEnter={() => setHoveredKey('menu-profile')} onMouseLeave={() => setHoveredKey('')} onClick={() => { closeMenus(); onOpenProfile && onOpenProfile(); }}>Profile</button>
                <button style={profileButtonStyle('menu-bookings')} onMouseEnter={() => setHoveredKey('menu-bookings')} onMouseLeave={() => setHoveredKey('')} onClick={onOpenMyBookings}>My Bookings</button>
                <button style={profileButtonStyle('menu-account')} onMouseEnter={() => setHoveredKey('menu-account')} onMouseLeave={() => setHoveredKey('')} onClick={() => { closeMenus(); onOpenProfile && onOpenProfile(); }}>Account Settings</button>
                <button style={profileButtonStyle('menu-pref')} onMouseEnter={() => setHoveredKey('menu-pref')} onMouseLeave={() => setHoveredKey('')} onClick={() => { closeMenus(); onOpenSettings && onOpenSettings(); }}>Preferences</button>
                <button style={profileButtonStyle('menu-logout', true)} onMouseEnter={() => setHoveredKey('menu-logout')} onMouseLeave={() => setHoveredKey('')} onClick={requestLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>}

        {!isDesktop && <button style={styles.mobileToggle} onClick={toggleMobileMenu} aria-label="Toggle menu">
          <span style={styles.mobileLine}></span>
          <span style={styles.mobileLine}></span>
          <span style={styles.mobileLine}></span>
        </button>
        }
      </div>

      {!isDesktop && isMobileMenuOpen && (
        <div style={styles.mobileDrawer}>
          <div style={styles.searchWrap}>
            <input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={onSearchChange}
              style={styles.input}
            />
          </div>

          <div style={styles.mobileActions}>
            {sellerProfile ? (
              <button
                style={{ ...styles.primaryButton, backgroundColor: primaryActionTheme.base }}
                onClick={() => {
                  closeMenus();
                  onOpenMyWork && onOpenMyWork();
                }}
              >
                My Work
              </button>
            ) : (
              <button
                style={{ ...styles.primaryButton, backgroundColor: primaryActionTheme.base }}
                onClick={() => {
                  closeMenus();
                  onOpenSellerSetup && onOpenSellerSetup();
                }}
              >
                Become a Seller
              </button>
            )}
            <button style={styles.profileItem} onClick={() => { closeMenus(); onGoHome && onGoHome(); }}>Home</button>
            <button style={styles.profileItem} onClick={() => { closeMenus(); onOpenProfile && onOpenProfile(); }}>Profile</button>
            <button style={styles.profileItem} onClick={onOpenMyBookings}>My Bookings</button>
            <button style={styles.profileItem} onClick={() => { closeMenus(); onOpenProfile && onOpenProfile(); }}>Account Settings</button>
            <button style={styles.profileItem} onClick={() => { closeMenus(); onOpenSettings && onOpenSettings(); }}>Preferences</button>
            <button style={{ ...styles.profileItem, color: '#b91c1c' }} onClick={requestLogout}>
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
