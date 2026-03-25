import { useState } from 'react';
// Note: Using className for styling and camelCase for event handlers (onClick, onChange)
// Note: External CSS imported from styles/
import '../styles/Navigation.css';

function Navigation({ onLoginClick }) {
  // Note: Using React useState to simulate hamburger menu interactivity
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <h1>GigLink</h1>
        </div>

        {/* Desktop Navigation Links */}
        <div className="nav-links-desktop">
          <a href="#browse" className="nav-link">
            Browse Services
          </a>
          <button
            onClick={onLoginClick}
            className="nav-buttons-login"
          >
            Login
          </button>
        </div>

        {/* Hamburger Menu Button */}
        <button
          className="hamburger"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="nav-links-mobile">
          <a href="#browse" className="nav-link-mobile">
            Browse Services
          </a>
          <button
            onClick={() => {
              onLoginClick();
              setIsMobileMenuOpen(false);
            }}
            className="nav-link-mobile nav-button-mobile"
          >
            Login
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
