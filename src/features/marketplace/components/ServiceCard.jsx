// Note: Functional component for displaying individual service provider card
// Note: Using inline style objects with dynamic hover state.
import { useState } from 'react';

const styles = {
  card: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '0.8rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
  },
  cardHover: {
    boxShadow: '0 12px 22px rgba(15, 23, 42, 0.13)',
    transform: 'translateY(-3px)',
    borderColor: '#bfdbfe',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    flexGrow: 1,
  },
  serviceTypePill: {
    alignSelf: 'flex-start',
    borderRadius: '999px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '0.74rem',
    fontWeight: 800,
    letterSpacing: '0.03em',
    padding: '0.28rem 0.62rem',
    textTransform: 'uppercase',
  },
  serviceTypeHeading: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.2,
  },
  description: {
    margin: 0,
    fontSize: '0.9rem',
    lineHeight: 1.5,
    color: 'var(--text-secondary)',
  },
  rateBadgeWrap: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  badgeBase: {
    display: 'inline-block',
    padding: '0.32rem 0.7rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  neutralBadge: {
    backgroundColor: '#334155',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  ratingBadge: {
    border: '1px solid #cbd5e1',
    borderRadius: '999px',
    padding: '0.26rem 0.6rem',
    color: '#0f172a',
    fontSize: '0.78rem',
    fontWeight: 700,
  },
  providerRow: {
    marginTop: '0.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '999px',
    objectFit: 'cover',
    border: '2px solid #e2e8f0',
    backgroundColor: '#f1f5f9',
  },
  providerMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.08rem',
  },
  providerName: {
    margin: 0,
    fontSize: '0.88rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  providerSubline: {
    margin: 0,
    fontSize: '0.76rem',
    color: '#64748b',
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '0.7rem 0.95rem',
    borderRadius: '0.4rem',
    fontSize: '0.88rem',
    fontWeight: 700,
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

  const displayServiceType =
    provider.serviceType === 'Others'
      ? (provider.customServiceType || 'General Service')
      : provider.serviceType;

  const priceLabel =
    provider.rateBasis === 'per-hour'
      ? `P${provider.hourlyRate}/hr`
      : provider.rateBasis === 'per-day'
        ? `P${provider.dailyRate}/day`
        : provider.rateBasis === 'per-project'
          ? `P${provider.projectRate}/project`
          : provider.pricingType === 'inquiry'
            ? 'Price on inquiry'
            : provider.hourlyRate
              ? `P${provider.hourlyRate}/hr`
              : 'Custom pricing';

  const availabilityLabel = provider.actionType === 'inquire' ? 'Manual schedule' : 'Book now available';

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
      <div style={styles.cardContent}>
        <span style={styles.serviceTypePill}>Service</span>
        <h3 style={styles.serviceTypeHeading}>{displayServiceType}</h3>
        <p style={styles.description}>{provider.description}</p>

        <div style={styles.rateBadgeWrap}>
          <span style={provider.rateBasis ? badgeStyle : { ...styles.badgeBase, ...styles.neutralBadge }}>{priceLabel}</span>
          <span style={{ ...styles.badgeBase, ...styles.neutralBadge }}>{availabilityLabel}</span>
        </div>

        <div style={styles.metaRow}>
          <span style={styles.ratingBadge}>★ {provider.rating} ({provider.reviews} reviews)</span>
          {provider.location && <span style={styles.ratingBadge}>{provider.location}</span>}
        </div>

        <div style={styles.providerRow}>
          <img src={provider.photo} alt={provider.name} style={styles.avatar} />
          <div style={styles.providerMeta}>
            <p style={styles.providerName}>{provider.name}</p>
            <p style={styles.providerSubline}>{provider.experience}+ years experience</p>
          </div>
        </div>

        <button
          onClick={() => onViewProfile(provider)}
          style={{ ...styles.button, ...(isButtonHovered ? styles.buttonHover : {}) }}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          View Service
        </button>
      </div>
    </div>
  );
}

export default ServiceCard;
