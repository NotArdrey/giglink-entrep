// Note: Functional component for displaying individual service provider card
// Note: Using inline style objects with dynamic hover state.
import { useState } from 'react';

const styles = {
  card: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '0.8rem',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHover: {
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-4px)',
  },
  imageContainer: {
    width: '100%',
    height: '250px',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-surface-soft)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  imageHover: {
    transform: 'scale(1.05)',
  },
  cardContent: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    flexGrow: 1,
  },
  cardName: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  serviceType: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    margin: 0,
    fontWeight: 500,
  },
  rateBadgeWrap: {
    display: 'flex',
    gap: '0.5rem',
  },
  badgeBase: {
    display: 'inline-block',
    padding: '0.4rem 0.8rem',
    borderRadius: '0.25rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  cardRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  ratingStars: {
    color: '#fbbf24',
    fontSize: '0.9rem',
    letterSpacing: '1px',
  },
  ratingValue: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '0.7rem 1.2rem',
    borderRadius: '0.4rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: 'auto',
  },
  buttonHover: {
    backgroundColor: '#1d4ed8',
    transform: 'scale(1.02)',
  },
};

const badgeColors = {
  'per-hour': '#3b82f6',
  'per-day': '#10b981',
  'per-project': '#f59e0b',
};

function ServiceCard({ provider, onViewProfile }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const badgeStyle = {
    ...styles.badgeBase,
    backgroundColor: badgeColors[provider.rateBasis] || '#2563eb',
  };

  return (
    <div
      style={{ ...styles.card, ...(isHovered ? styles.cardHover : {}) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsButtonHovered(false);
      }}
    >
      {/* Provider Photo */}
      <div style={styles.imageContainer}>
        <img
          src={provider.photo}
          alt={provider.name}
          style={{ ...styles.image, ...(isHovered ? styles.imageHover : {}) }}
        />
      </div>

      {/* Card Content */}
      <div style={styles.cardContent}>
        {/* Provider Name */}
        <h3 style={styles.cardName}>{provider.name}</h3>

        {/* Service Type */}
        <p style={styles.serviceType}>{provider.serviceType}</p>

        {/* Rate Basis Badge */}
        {provider.rateBasis && (
          <div style={styles.rateBadgeWrap}>
            {provider.rateBasis === 'per-hour' && (
              <span style={badgeStyle}>₱{provider.hourlyRate}/hr</span>
            )}
            {provider.rateBasis === 'per-day' && (
              <span style={badgeStyle}>₱{provider.dailyRate}/day</span>
            )}
            {provider.rateBasis === 'per-project' && (
              <span style={badgeStyle}>₱{provider.projectRate}/project</span>
            )}
          </div>
        )}

        {/* Rating */}
        <div style={styles.cardRating}>
          <span style={styles.ratingStars}>★★★★★</span>
          <span style={styles.ratingValue}>{provider.rating}</span>
        </div>

        {/* View Profile Button */}
        {/* Note: camelCase for onClick event handler */}
        <button
          onClick={() => onViewProfile(provider)}
          style={{ ...styles.button, ...(isButtonHovered ? styles.buttonHover : {}) }}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

export default ServiceCard;
