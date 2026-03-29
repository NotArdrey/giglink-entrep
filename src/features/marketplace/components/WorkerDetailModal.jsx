import { useEffect, useState } from 'react';

// Note: Modal component for displaying worker details
// Note: Uses inline style objects with camelCase event handlers.


function WorkerDetailModal({ isOpen, worker, onClose, onBookNow }) {
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  useEffect(() => {
    if (!isOpen || !worker) return undefined;

    setIsLoadingDetails(true);
    const timer = setTimeout(() => {
      setIsLoadingDetails(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isOpen, worker]);

  if (!isOpen || !worker) return null;

  const isInquiry = worker.actionType === 'inquire';
  
  // Determine rate text based on rate basis
  let rateText = 'Rate upon inquiry';
  let ratingBadge = '';
  
  if (worker.rateBasis === 'per-hour' && worker.hourlyRate) {
    rateText = `₱${worker.hourlyRate}/hour`;
    ratingBadge = 'Hourly Rate';
  } else if (worker.rateBasis === 'per-day' && worker.dailyRate) {
    rateText = `₱${worker.dailyRate}/day`;
    ratingBadge = 'Daily Rate';
  } else if (worker.rateBasis === 'per-project' && worker.projectRate) {
    rateText = `₱${worker.projectRate}/project`;
    ratingBadge = 'Project-Based';
  } else if (worker.pricingType === 'inquiry') {
    rateText = 'Rate upon inquiry';
  } else if (worker.hourlyRate) {
    rateText = `₱${worker.hourlyRate}/hr`;
  }

  const badgeColors = {
    'per-hour': { backgroundColor: '#dbeafe', color: '#1d4ed8' },
    'per-day': { backgroundColor: '#dcfce7', color: '#166534' },
    'per-project': { backgroundColor: '#ede9fe', color: '#6d28d9' },
  };

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 220,
      padding: '1rem',
    },
    content: {
      backgroundColor: '#ffffff',
      width: 'min(92vw, 760px)',
      borderRadius: '0.9rem',
      boxShadow: '0 18px 45px rgba(15, 23, 42, 0.26)',
      display: 'grid',
      gridTemplateColumns: 'minmax(220px, 280px) 1fr',
      gap: '1.2rem',
      padding: '1.5rem',
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: '0.8rem',
      right: '0.8rem',
      width: '34px',
      height: '34px',
      borderRadius: '999px',
      border: '1px solid #cbd5e1',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      fontSize: '1.05rem',
      color: '#0f172a',
    },
    imageContainer: {
      borderRadius: '0.7rem',
      overflow: 'hidden',
      minHeight: '280px',
      backgroundColor: '#f1f5f9',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    imageSkeletonWrap: {
      width: '100%',
      minHeight: '280px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#e2e8f0',
    },
    avatarPlaceholder: {
      width: '132px',
      height: '132px',
      borderRadius: '999px',
      backgroundColor: '#cbd5e1',
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      color: '#0f172a',
    },
    name: { margin: 0, fontSize: '1.6rem' },
    service: { margin: 0, color: '#334155', fontWeight: 600 },
    rateBadge: { marginTop: '0.15rem' },
    badge: {
      display: 'inline-block',
      borderRadius: '999px',
      padding: '0.2rem 0.65rem',
      fontSize: '0.78rem',
      fontWeight: 700,
    },
    rating: { display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' },
    stars: { color: '#f59e0b' },
    ratingValue: { fontWeight: 700 },
    reviews: { color: '#64748b', fontSize: '0.9rem' },
    description: { margin: '0.35rem 0', color: '#334155', lineHeight: 1.45 },
    info: { display: 'flex', gap: '0.35rem', alignItems: 'baseline' },
    label: { fontWeight: 700, color: '#1e293b' },
    value: { color: '#334155' },
    detailsSkeletonGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.7rem',
      marginTop: '0.2rem',
    },
    textPlaceholder: {
      height: '12px',
      borderRadius: '999px',
      backgroundColor: '#e2e8f0',
    },
    bookButton: {
      marginTop: '0.6rem',
      border: 'none',
      borderRadius: '0.55rem',
      padding: '0.8rem 1rem',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontWeight: 700,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={styles.closeButton}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Worker Photo */}
        <div style={styles.imageContainer}>
          {isLoadingDetails ? (
            <div style={styles.imageSkeletonWrap}>
              <div style={styles.avatarPlaceholder} />
            </div>
          ) : (
            <img
              src={worker.photo}
              alt={worker.name}
              style={styles.image}
            />
          )}
        </div>

        {/* Worker Details */}
        <div style={styles.details}>
          {isLoadingDetails ? (
            <>
              <div style={{ ...styles.textPlaceholder, width: '55%' }} />
              <div style={{ ...styles.textPlaceholder, width: '42%' }} />
              <div style={styles.detailsSkeletonGroup}>
                <div style={{ ...styles.textPlaceholder, width: '80%' }} />
                <div style={{ ...styles.textPlaceholder, width: '65%' }} />
                <div style={{ ...styles.textPlaceholder, width: '72%' }} />
                <div style={{ ...styles.textPlaceholder, width: '60%' }} />
              </div>
            </>
          ) : (
            <>
              {/* Name */}
              <h2 style={styles.name}>{worker.name}</h2>

              {/* Service Type */}
              <p style={styles.service}>{worker.serviceType}</p>

              {/* Rate Basis Badge */}
              {ratingBadge && (
                <div style={styles.rateBadge}>
                  <span
                    style={{
                      ...styles.badge,
                      ...(badgeColors[worker.rateBasis] || { backgroundColor: '#e2e8f0', color: '#334155' }),
                    }}
                  >
                    {ratingBadge}
                  </span>
                </div>
              )}

              {/* Rating */}
              <div style={styles.rating}>
                <span style={styles.stars}>★★★★★</span>
                <span style={styles.ratingValue}>{worker.rating}</span>
                <span style={styles.reviews}>({worker.reviews} reviews)</span>
              </div>

              {/* Description */}
              <p style={styles.description}>
                {worker.description}
              </p>

              {/* Experience */}
              <div style={styles.info}>
                <span style={styles.label}>Experience:</span>
                <span style={styles.value}>{worker.experience} years</span>
              </div>

              {/* Location */}
              <div style={styles.info}>
                <span style={styles.label}>Location:</span>
                <span style={styles.value}>{worker.location}</span>
              </div>

              {/* Rate */}
              <div style={styles.info}>
                <span style={styles.label}>Rate:</span>
                <span style={styles.value}>{rateText}</span>
              </div>

              {/* Book/Inquire Button */}
              {/* Note: camelCase for onClick event handler */}
              <button
                onClick={() => onBookNow(worker)}
                style={styles.bookButton}
              >
                {isInquiry ? 'Inquire Now' : 'Book Now'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkerDetailModal;
