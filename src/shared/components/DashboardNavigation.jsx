import React, { useState, useEffect, useRef } from 'react';
import { getThemeTokens } from '../styles/themeTokens';
import LogoutConfirmModal from '../../features/auth/components/LogoutConfirmModal';

function DashboardNavigation({
  searchQuery,
  onSearchChange,
  onLogout,
  onOpenSellerSetup,
  onOpenMyBookings,
  sellerProfile,
  onOpenMyWork,
  onOpenProfile,
  onOpenAccountSettings,
  onOpenSettings,
  currentView,
  onOpenDashboard,
  appTheme = 'light',
}) {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Booking Update', message: 'Your latest booking has a new message.', isRead: false },
    { id: 'n2', title: 'Reminder', message: 'You have an upcoming schedule today.', isRead: false },
  ]);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Map currentView to active navigation item
  const getActiveFromView = (view) => {
    const viewMap = {
      'client-dashboard': 'home',
      'my-bookings': 'bookings',
      'my-work': 'my-work',
      'profile': 'profile',
      'account-settings': 'profile', // Account settings shows profile icon as active
      'settings': 'settings',
      'worker-dashboard': 'home',
    };
    return viewMap[view] || 'home';
  };

  const activeIcon = getActiveFromView(currentView);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedInNotification = notificationRef.current && notificationRef.current.contains(event.target);
      const clickedInProfile = profileRef.current && profileRef.current.contains(event.target);

      if (!clickedInNotification) {
        setIsNotificationOpen(false);
      }

      if (!clickedInProfile) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isDesktop = windowWidth > 600;
  const themeTokens = getThemeTokens(appTheme);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const styles = {
    nav: {
      position: 'sticky',
      top: 0,
      zIndex: 120,
      background: themeTokens.navBg,
      borderBottom: `1px solid ${themeTokens.navBorder}`,
      padding: isDesktop ? '0.45rem 1rem' : '0.45rem 0.75rem',
    },
    container: isDesktop
      ? {
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 560px) minmax(220px, 1fr)',
          alignItems: 'center',
          columnGap: '0.8rem',
        }
      : {
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.35rem',
        },
    left: { display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flexShrink: 0 },
    logo: {
      color: themeTokens.accent,
      fontWeight: 800,
      fontSize: isDesktop ? '1.85rem' : '1.25rem',
      margin: 0,
      lineHeight: 1,
      fontFamily: "'Times New Roman', Georgia, serif",
      whiteSpace: 'nowrap',
    },
    smallIconBtn: {
      width: '36px',
      height: '36px',
      borderRadius: '999px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      background: 'transparent',
      border: `1px solid transparent`,
      transition: 'all 0.2s ease',
    },
    smallIconBtnActive: {
      backgroundColor: themeTokens.badgeBg,
      borderColor: themeTokens.accent,
      boxShadow: `0 0 0 4px ${appTheme === 'dark' ? 'rgba(37, 99, 235, 0.22)' : 'rgba(37, 99, 235, 0.14)'}`,
      color: themeTokens.accent,
    },
    search: { flex: 1, minWidth: 0 },
    searchInput: { width: '100%', height: '44px', borderRadius: '999px', border: `1px solid ${themeTokens.inputBorder}`, padding: '0 1rem', fontSize: '1.08rem', backgroundColor: themeTokens.inputBg, color: themeTokens.inputText },
    center: {
      display: 'flex',
      alignItems: 'center',
      gap: isDesktop ? '1.15rem' : '0.2rem',
      justifyContent: 'center',
      flex: isDesktop ? 'none' : 1,
      minWidth: 0,
    },
    navItem: {
      cursor: 'pointer',
      width: isDesktop ? '52px' : '40px',
      height: isDesktop ? '48px' : '40px',
      borderRadius: '999px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: 700,
      color: themeTokens.textPrimary,
      background: 'transparent',
      border: 'none',
      flexShrink: 0,
    },
    navItemActive: { borderBottom: `3px solid ${themeTokens.accent}`, paddingBottom: '6px' },
    myWorkWrap: {
      width: isDesktop ? '58px' : '44px',
      height: isDesktop ? '58px' : '44px',
      borderRadius: '999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: themeTokens.surface,
      boxShadow: themeTokens.shadowSoft,
      cursor: 'pointer',
      border: `1px solid ${themeTokens.border}`,
      flexShrink: 0,
    },
    right: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', flexShrink: 0 },
    rightItemWrap: { position: 'relative' },
    roundIconBtn: {
      width: isDesktop ? '42px' : '36px',
      height: isDesktop ? '42px' : '36px',
      borderRadius: '999px',
      border: `1px solid ${themeTokens.border}`,
      backgroundColor: themeTokens.surfaceAlt,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: themeTokens.textPrimary,
      flexShrink: 0,
    },
    avatar: {
      width: isDesktop ? '42px' : '36px',
      height: isDesktop ? '42px' : '36px',
      borderRadius: '999px',
      background: themeTokens.surfaceSoft,
      border: `1px solid ${themeTokens.border}`,
      cursor: 'pointer',
      flexShrink: 0,
    },
    dropdown: {
      position: 'absolute',
      top: '52px',
      right: 0,
      width: '300px',
      maxWidth: '90vw',
      backgroundColor: themeTokens.surface,
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '0.65rem',
      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.2)',
      padding: '0.65rem',
      zIndex: 200,
    },
    dropdownHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' },
    dropdownTitle: { margin: 0, fontWeight: 700, color: themeTokens.textPrimary },
    textButton: { border: 'none', background: 'transparent', color: themeTokens.accent, cursor: 'pointer', fontWeight: 600 },
    notificationItem: {
      width: '100%',
      textAlign: 'left',
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '0.5rem',
      backgroundColor: themeTokens.surface,
      padding: '0.5rem',
      marginBottom: '0.4rem',
      cursor: 'pointer',
    },
    notificationUnread: { backgroundColor: themeTokens.badgeBg, borderColor: themeTokens.accent },
    profileMenu: {
      position: 'absolute',
      top: '52px',
      right: 0,
      minWidth: '160px',
      backgroundColor: themeTokens.surface,
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '0.65rem',
      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.2)',
      padding: '0.35rem',
      zIndex: 200,
    },
    profileItem: {
      width: '100%',
      border: 'none',
      backgroundColor: themeTokens.surface,
      textAlign: 'left',
      padding: '0.5rem 0.6rem',
      borderRadius: '0.45rem',
      cursor: 'pointer',
      color: themeTokens.textPrimary,
      fontWeight: 600,
    },
    profileDanger: {
      color: themeTokens.danger,
    },
  };

  const Icon = ({ name, size = 18 }) => {
    if (name === 'apps') return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3h4v4H3zM10 3h4v4h-4zM17 3h4v4h-4zM3 10h4v4H3zM10 10h4v4h-4zM17 10h4v4h-4zM3 17h4v4H3zM10 17h4v4h-4zM17 17h4v4h-4z"/></svg>);
    if (name === 'bell') return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V4a2 2 0 1 0-4 0v1.083A6 6 0 0 0 4 11v3.159c0 .538-.214 1.055-.595 1.436L2 17h5"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>);
    if (name === 'home') return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z"/></svg>);
    if (name === 'chat') return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>);
    if (name === 'work') return (<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6"><path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
    if (name === 'profile') return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
    if (name === 'settings') return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H22a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
    return null;
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const profileAvatarSrc = sellerProfile?.profilePhoto || '';
  const firstInitial = String(sellerProfile?.firstName || '').trim().charAt(0).toUpperCase();
  const lastInitial = String(sellerProfile?.lastName || '').trim().charAt(0).toUpperCase();
  const fullNameInitials = String(sellerProfile?.fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join('');
  const profileInitials = (firstInitial + lastInitial || fullNameInitials || 'U').slice(0, 2);

  const toggleNotifications = () => {
    setIsProfileMenuOpen(false);
    setIsNotificationOpen((prev) => !prev);
  };

  const toggleProfileMenu = () => {
    setIsNotificationOpen(false);
    setIsProfileMenuOpen((prev) => !prev);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleNotificationClick = (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
    setIsNotificationOpen(false);
    if (onOpenMyBookings) onOpenMyBookings();
  };

  return (
    <div style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.left}>
          <h1 style={styles.logo}>GigLink</h1>
          {isDesktop ? (
            <div style={styles.search}>
              <input
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e)}
                placeholder="Search service (e.g., Math Tutor, Aircon Cleaning)"
                style={styles.searchInput}
              />
            </div>
          ) : (
            <button
              aria-label="Open search"
              aria-pressed={showMobileSearch}
              onClick={() => setShowMobileSearch((s) => !s)}
              style={{
                ...styles.smallIconBtn,
                ...(showMobileSearch ? styles.smallIconBtnActive : {}),
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
          )}
        </div>

        <div style={styles.center}>
          <button
            aria-label="Home"
            style={{ ...styles.navItem, ...(activeIcon === 'home' ? styles.navItemActive : {}) }}
            onClick={() => { onOpenDashboard && onOpenDashboard(); }}
          >
            <Icon name="home" size={22} />
          </button>

          <button
            aria-label="My Chats"
            style={{ ...styles.navItem, ...(activeIcon === 'bookings' ? styles.navItemActive : {}) }}
            onClick={() => { onOpenMyBookings && onOpenMyBookings(); }}
          >
            <Icon name="chat" size={22} />
          </button>

          <button
            aria-label="My Work"
            style={styles.myWorkWrap}
            onClick={() => { onOpenMyWork && onOpenMyWork(); }}
            title="My Work"
          >
            <Icon name="work" />
          </button>

          <button
            aria-label="Account"
            style={{ ...styles.navItem, ...(activeIcon === 'profile' ? styles.navItemActive : {}) }}
            onClick={() => { onOpenProfile && onOpenProfile(); }}
          >
            <Icon name="profile" size={22} />
          </button>

          <button
            aria-label="Settings"
            style={{ ...styles.navItem, ...(activeIcon === 'settings' ? styles.navItemActive : {}) }}
            onClick={() => { onOpenSettings && onOpenSettings(); }}
          >
            <Icon name="settings" size={21} />
          </button>
        </div>

        <div style={styles.right}>
          <div style={styles.rightItemWrap} ref={notificationRef}>
            <button aria-label="Notifications" style={styles.roundIconBtn} onClick={toggleNotifications}>
              <Icon name="bell" />
              {unreadCount > 0 && (
                <span style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -6, right: -6, width: 10, height: 10, borderRadius: 999, background: '#ef4444', border: '2px solid #ffffff' }} />
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <p style={styles.dropdownTitle}>Notifications</p>
                  <button type="button" style={styles.textButton} onClick={markAllNotificationsRead}>Mark all read</button>
                </div>

                {notifications.length === 0 ? (
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No notifications yet.</p>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      style={{ ...styles.notificationItem, ...(!item.isRead ? styles.notificationUnread : {}) }}
                      onClick={() => handleNotificationClick(item.id)}
                    >
                      <strong style={{ display: 'block', marginBottom: '0.15rem' }}>{item.title}</strong>
                      <span style={{ color: '#334155', fontSize: '0.86rem' }}>{item.message}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={styles.rightItemWrap} ref={profileRef}>
            <button
              style={{
                ...styles.avatar,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: themeTokens.textPrimary,
                background: themeTokens.surfaceAlt,
                overflow: 'hidden',
                padding: 0,
              }}
              onClick={toggleProfileMenu}
              aria-label="Profile"
            >
              {profileAvatarSrc ? (
                <img
                  src={profileAvatarSrc}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                profileInitials
              )}
            </button>

            {isProfileMenuOpen && (
              <div style={styles.profileMenu}>
                <button
                  type="button"
                  style={{ ...styles.profileItem, ...styles.profileDanger }}
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile search expansion shown below nav when toggled */}
      {!isDesktop && showMobileSearch && (
        <div style={{ padding: '0.6rem', borderTop: `1px solid ${themeTokens.navBorder}`, background: themeTokens.navBg }}>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e)}
            placeholder="Search service (e.g., Math Tutor, Aircon Cleaning)"
            style={{ ...styles.searchInput, width: '100%', height: '44px' }}
          />
        </div>
      )}

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen} 
        onCancel={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          if (onLogout) onLogout();
        }} 
      />
    </div>
  );
}

export default DashboardNavigation;
