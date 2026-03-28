import { useState } from 'react';

function Navigation({ onLoginClick }) {
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [isNavLinkHovered, setIsNavLinkHovered] = useState(false);

  const styles = {
    navigation: {
      position: 'fixed',
      top: 0,
      width: '100%',
      backgroundColor: 'var(--bg-surface)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
      padding: 0,
    },
    navContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
    },
    navLogo: {
      h1: {
        fontSize: '1.8rem',
        color: '#2563eb',
        margin: 0,
        fontWeight: 700,
        fontFamily: "'Times New Roman', Georgia, serif",
      },
    },
    navLinksDesktop: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
    },
    navLink: {
      color: isNavLinkHovered ? '#2563eb' : 'var(--text-primary)',
      textDecoration: 'none',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
    navButtonsLogin: {
      backgroundColor: isLoginHovered ? '#1d4ed8' : '#2563eb',
      color: '#ffffff',
      border: 'none',
      padding: '0.6rem 1.2rem',
      borderRadius: '0.4rem',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'background-color 0.3s ease',
    },
    mobileHeaderActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      marginLeft: 'auto',
      justifyContent: 'flex-end',
    },
    mobileLoginIconBtn: {
      width: '42px',
      height: '36px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.45rem',
      cursor: 'pointer',
    },
    mobileLoginIcon: {
      width: '18px',
      height: '18px',
      display: 'block',
    },
  };

  // Apply responsive styles based on viewport (simulated for inline)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;

  return (
    <nav style={styles.navigation}>
      <div style={isDesktop ? styles.navContainer : { ...styles.navContainer, padding: '1rem 1.25rem' }}>
        {/* Logo */}
        <div>
          <h1 style={styles.navLogo.h1}>GigLink</h1>
        </div>

        {/* Desktop Navigation Links */}
        <div style={isDesktop ? styles.navLinksDesktop : { display: 'none' }}>
          <a
            href="#browse"
            style={styles.navLink}
            onMouseEnter={() => setIsNavLinkHovered(true)}
            onMouseLeave={() => setIsNavLinkHovered(false)}
          >
            Browse Services
          </a>
          <button
            onClick={onLoginClick}
            style={styles.navButtonsLogin}
            onMouseEnter={() => setIsLoginHovered(true)}
            onMouseLeave={() => setIsLoginHovered(false)}
          >
            Login
          </button>
        </div>

        {!isDesktop && (
          <div style={styles.mobileHeaderActions}>
            <button onClick={onLoginClick} style={styles.mobileLoginIconBtn} aria-label="Login">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.mobileLoginIcon}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
