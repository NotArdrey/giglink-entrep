import { useState } from 'react';

function Navigation({ onLoginClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [isNavLinkHovered, setIsNavLinkHovered] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
    hamburger: {
      display: 'none',
      flexDirection: 'column',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      gap: '0.5rem',
      zIndex: 101,
    },
    hamburgerLine: {
      width: '1.8rem',
      height: '0.25rem',
      backgroundColor: 'var(--text-primary)',
      borderRadius: '0.125rem',
      transition: 'all 0.3s ease',
    },
    navLinksMobile: {
      display: 'none',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1rem 2rem 1.5rem',
      backgroundColor: 'var(--bg-surface-soft)',
    },
    navLinkMobile: {
      color: 'var(--text-primary)',
      textDecoration: 'none',
      fontWeight: 500,
      transition: 'color 0.3s ease',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      textAlign: 'left',
    },
    navButtonMobile: {
      padding: '0.6rem 1rem',
      borderRadius: '0.4rem',
      fontWeight: 600,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: '#2563eb',
      color: '#ffffff',
    },
  };

  // Apply responsive styles based on viewport (simulated for inline)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;

  return (
    <nav style={styles.navigation}>
      <div style={styles.navContainer}>
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

        {/* Hamburger Menu Button */}
        <button
          style={!isDesktop ? styles.hamburger : { display: 'none' }}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && !isDesktop && (
        <div style={styles.navLinksMobile}>
          <a href="#browse" style={styles.navLinkMobile}>
            Browse Services
          </a>
          <button
            onClick={() => {
              onLoginClick();
              setIsMobileMenuOpen(false);
            }}
            style={styles.navButtonMobile}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#1d4ed8')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#2563eb')}
          >
            Login
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
