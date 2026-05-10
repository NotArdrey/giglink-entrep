// ============================================================================
// ServiceCard Component
// ============================================================================
// Purpose: Displays individual service provider card with service type-first hierarchy
// Parent: Dashboard.jsx (renders dynamically via .map() in the grid)
// State: isHovered (for hover effects), isButtonHovered (for button interactions)
// Props: provider (object with service details), onViewProfile (callback function)
// Architecture: Child component that receives data via props and calls parent callbacks
// ============================================================================

import { useState } from 'react';

// SERVICE CARD STYLING - Organized by component section
const styles = {
  // CARD CONTAINER - Main wrapper with responsive flex layout
  card: {
    backgroundColor: 'var(--giglink-surface)',
    borderRadius: '0.8rem',
    border: '1px solid var(--giglink-border)',
    boxShadow: 'var(--giglink-shadow-soft)',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.35rem', // Slightly taller again for better breathing room
  },
  
  // CARD HOVER STATE - Elevation and border highlight on mouseover
  cardHover: {
    boxShadow: 'var(--giglink-shadow)',
    transform: 'translateY(-3px)',
    borderColor: 'var(--giglink-accent)',
  },
  
  // CARD CONTENT WRAPPER - Flex column with increased gaps for breathing room
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem', // Add a bit more height to avoid cramped vertical stacking
    flexGrow: 1,
  },
  
  // SERVICE TYPE PILL - Small uppercase badge indicating "SERVICE"
  serviceTypePill: {
    alignSelf: 'flex-start',
    borderRadius: '999px',
    backgroundColor: 'transparent',
    border: '1px solid var(--giglink-accent)',
    color: 'var(--giglink-accent)',
    fontSize: '0.74rem',
    fontWeight: 800,
    letterSpacing: '0.03em',
    padding: '0.28rem 0.62rem',
    textTransform: 'uppercase',
  },
  
  // SERVICE TYPE HEADING - Primary headline showing what service is offered (Tutor, Cleaner, etc.)
  serviceTypeHeading: {
    fontSize: '1.45rem',
    fontWeight: 900,
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.15,
  },
  
  // DESCRIPTION - Service details paragraph that explains what the provider does
  description: {
    margin: 0,
    fontSize: '0.97rem',
    lineHeight: 1.4,
    color: 'var(--text-secondary)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  
  // RATE BADGE WRAPPER - Container for price and availability badges
  rateBadgeWrap: {
    display: 'flex',
    gap: '0.55rem',
    flexWrap: 'wrap',
  },
  
  // BASE BADGE STYLE - Reusable badge styling (price, availability, etc.)
  badgeBase: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '34px',
    padding: '0.34rem 0.8rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1,
  },
  
  // NEUTRAL BADGE - Dark gray badge for secondary information
  neutralBadge: {
    backgroundColor: 'var(--giglink-surface-soft)',
    color: 'var(--giglink-text-primary)',
    border: '1px solid var(--giglink-border)',
  },
  
  // META ROW - Horizontal flex container for rating, reviews, and location
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem', // Increased spacing between rating badges
    flexWrap: 'wrap',
  },
  
  // RATING BADGE - Star rating and review count display
  ratingBadge: {
    border: '1px solid var(--giglink-border)',
    borderRadius: '999px',
    padding: '0.32rem 0.72rem',
    color: 'var(--giglink-text-primary)',
    fontSize: '0.82rem',
    fontWeight: 700,
  },
  
  // PROVIDER ROW - Shows provider avatar, name, and experience (moved to bottom per service-first design)
  providerRow: {
    marginTop: '0.3rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  
  // AVATAR - Provider profile photo (compact 42px circle)
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '999px',
    objectFit: 'cover',
    border: '2px solid var(--giglink-border)',
    backgroundColor: 'var(--giglink-surface-soft)',
  },
  
  // PROVIDER META - Flex column for provider name and experience
  providerMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.08rem',
  },
  
  // PROVIDER NAME - Provider's display name
  providerName: {
    margin: 0,
    fontSize: '0.88rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  
  // PROVIDER SUBLINE - Experience text (e.g., "6+ years experience")
  providerSubline: {
    margin: 0,
    fontSize: '0.76rem',
    color: 'var(--giglink-text-secondary)',
  },
  
  // CALL-TO-ACTION BUTTON - "View Service" button at bottom of card
  button: {
    backgroundColor: 'var(--giglink-accent)',
    color: '#ffffff',
    border: 'none',
    padding: '0.62rem 0.95rem',
    borderRadius: '0.4rem',
    fontSize: '0.88rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: 'auto', // Pushes button to bottom of card
  },
  reviewButton: {
    backgroundColor: 'transparent',
    color: 'var(--giglink-accent)',
    border: '1px solid var(--giglink-border)',
    padding: '0.5rem 0.7rem',
    borderRadius: '0.4rem',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '0.5rem'
  },
  viewButtonLarge: {
    backgroundColor: 'var(--giglink-accent)',
    color: '#ffffff',
    border: 'none',
    padding: '0.62rem 0.95rem',
    borderRadius: '0.4rem',
    fontSize: '0.92rem',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    flex: 1,
    textAlign: 'center',
  },
  
  // BUTTON HOVER STATE - Darker blue and slight scale-up for interactivity feedback
  buttonHover: {
    backgroundColor: '#1d4ed8',
    transform: 'scale(1.02)',
  },
};

// BADGE COLOR MAPPING - Associates pricing models with brand colors
// per-hour: blue (#3b82f6) | per-day: green (#10b981) | per-project: amber (#f59e0b)
const badgeColors = {
  'per-hour': 'var(--giglink-accent)',
  'per-day': '#10b981',
  'per-project': '#f59e0b',
  'per-week': '#8b5cf6',
  'per-month': '#ef4444',
};

// ============================================================================
// ServiceCard Component Function
// ============================================================================
// Purpose: React functional component for displaying service provider information
// Props:
//   - provider: object with id, name, serviceType, customServiceType, rating, etc.
//   - onViewProfile: callback function passed from parent (Dashboard) to open detail modal
// State:
//   - isHovered: boolean flag for card elevation/highlight effect
//   - isButtonHovered: boolean flag for button visual feedback
// ============================================================================
function ServiceCard({ provider, onViewProfile, onViewReviews }) {
  // LOCAL STATE - Manages hover interactions for visual feedback
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // DISPLAY SERVICE TYPE COMPUTATION - Maps "Others" + customServiceType to readable label
  // Example: if provider.serviceType === "Others" and customServiceType === "Valorant Account Booster"
  // then displayServiceType becomes "Valorant Account Booster" (not just "Others")
  const displayServiceType =
    provider.serviceType === 'Others'
      ? (provider.customServiceType || 'General Service')
      : provider.serviceType;

  // PRICE LABEL COMPUTATION - Dynamic pricing text based on provider rate basis
  // Priority: per-hour → per-day → per-project → price on inquiry → custom pricing
  // Displays: "P450/hr" or "P320/day" or "P1200/project" or "Price on inquiry"
  const priceLabel =
    provider.rateBasis === 'per-hour'
      ? `P${provider.hourlyRate}/hr`
      : provider.rateBasis === 'per-day'
        ? `P${provider.dailyRate}/day`
        : provider.rateBasis === 'per-week'
          ? `P${provider.weeklyRate}/wk`
          : provider.rateBasis === 'per-month'
            ? `P${provider.monthlyRate}/mo`
        : provider.rateBasis === 'per-project'
          ? `P${provider.projectRate}/project`
          : provider.pricingType === 'inquiry'
            ? 'Price on inquiry'
            : provider.hourlyRate
              ? `P${provider.hourlyRate}/hr`
              : 'Custom pricing';

  // AVAILABILITY LABEL COMPUTATION - Indicates booking flexibility
  // "Manual schedule" if inquiry-based | "Book now available" if direct booking allowed
  const availabilityLabel = provider.actionType === 'inquire' ? 'Manual schedule' : 'Book now available';

  // BADGE STYLE COMPUTATION - Applies color based on pricing model (not hardcoded)
  // Falls back to default blue (#2563eb) if rateBasis is undefined
  const badgeStyle = {
    ...styles.badgeBase,
    backgroundColor: badgeColors[provider.rateBasis] || 'var(--giglink-accent)',
  };

  // ============================================================================
  // RENDER - Service Card UI Hierarchy (Service-First Design Per Professor Feedback)
  // ============================================================================
  // Hierarchy:
  // 1. Service Type (What do you need?) ← PRIMARY
  // 2. Description (What's included?)
  // 3. Price & Availability (Can I afford it? Is it available?)
  // 4. Rating & Location (Is this provider good? Where are they?)
  // 5. Provider Identity (Who is this provider?) ← SECONDARY
  // This order prioritizes answering user intent BEFORE showing the provider
  // ============================================================================
  return (
    <div
      // Main card container with hover elevation effect
      style={{ ...styles.card, ...(isHovered ? styles.cardHover : {}) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsButtonHovered(false);
      }}
    >
      <div style={styles.cardContent}>
        {/* SECTION 1: SERVICE TYPE LABEL - Small "SERVICE" pill indicator */}
        <span style={styles.serviceTypePill}>{displayServiceType || 'Service'}</span>

        {/* SECTION 2: SERVICE TITLE - Large primary headline (e.g., "Tutor 2:52am") */}
        <h3 style={styles.serviceTypeHeading}>{provider.title || displayServiceType}</h3>

        {/* SECTION 3: DESCRIPTION - What the provider offers (2-3 sentences) */}
        <p style={styles.description}>{provider.description}</p>

        {/* SECTION 4: PRICE & AVAILABILITY BADGES - Quick decision info */}
        <div style={styles.rateBadgeWrap}>
          <span style={provider.rateBasis ? badgeStyle : { ...styles.badgeBase, ...styles.neutralBadge }}>
            {priceLabel}
          </span>
          <span style={{ ...styles.badgeBase, ...styles.neutralBadge }}>
            {availabilityLabel}
          </span>
        </div>

        {/* SECTION 5: RATING & LOCATION - Trust signals and geography info */}
        <div style={styles.metaRow}>
          <span style={styles.ratingBadge}>★ {provider.rating} ({provider.reviews} reviews)</span>
          {provider.location && <span style={styles.ratingBadge}>{provider.location}</span>}
        </div>

        {/* SECTION 6: PROVIDER IDENTITY - Avatar, name, experience (moved to bottom per service-first design) */}
        <div style={styles.providerRow}>
          {provider.photo ? (
            <img src={provider.photo} alt={provider.name} style={styles.avatar} />
          ) : (
            <div style={{ ...styles.avatar, backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#999' }}>👤</div>
          )}
          <div style={styles.providerMeta}>
            <p style={styles.providerName}>{provider.name}</p>
            <p style={styles.providerSubline}>{provider.experience}+ years experience</p>
          </div>
        </div>

        {/* SECTION 7: ACTIONS - Reviews + View Service */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 'auto' }}>
          <button
            onClick={() => onViewProfile(provider)}
            style={{ ...styles.viewButtonLarge, ...(isButtonHovered ? styles.buttonHover : {}) }}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            View Service
          </button>

          <button
            onClick={() => onViewReviews && onViewReviews(provider)}
            style={styles.reviewButton}
            title="View provider reviews"
          >
            Reviews
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;
