import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating, isDark = false, size = 16 }) => {
  const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const filledStars = Math.round(normalizedRating);
  const starColor = isDark ? '#facc15' : '#f59e0b';
  const emptyColor = isDark ? '#64748b' : '#cbd5e1';

  return (
    <span
      aria-label={`${normalizedRating.toFixed(2)} out of 5 stars`}
      title={`${normalizedRating.toFixed(2)} / 5`}
      style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= filledStars;

        return (
          <Star
            key={star}
            size={size}
            fill={isFilled ? starColor : 'none'}
            color={isFilled ? starColor : emptyColor}
            strokeWidth={2}
            aria-hidden="true"
          />
        );
      })}
    </span>
  );
};

const formatRating = (rating) => {
  const value = Number(rating);

  if (!Number.isFinite(value)) return null;

  return value.toFixed(2).replace(/\.?0+$/, '');
};

const CompactRating = ({ rating, reviewCount = 0, isDark = false }) => {
  const displayRating = formatRating(rating);
  const color = isDark ? '#cbd5e1' : '#475569';

  if (!displayRating) return <span>New</span>;

  return (
    <span
      aria-label={`${displayRating} out of 5 stars from ${reviewCount} reviews`}
      title={`${displayRating} / 5`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color,
        fontSize: 13,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      <Star size={14} fill={color} color={color} strokeWidth={2.5} aria-hidden="true" />
      <span>{displayRating}</span>
      <span>({reviewCount})</span>
    </span>
  );
};

const ReviewsModal = ({
  isOpen,
  onClose,
  provider,
  reviews = [],
  isLoading = false,
  appTheme = 'light',
}) => {
  if (!isOpen || !provider) return null;

  const isDark = appTheme === 'dark';
  const overlay = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1400,
    background: isDark ? 'rgba(10,12,16,0.7)' : 'rgba(0,0,0,0.35)',
  };

  const card = {
    width: 'min(820px, 96vw)',
    maxHeight: '86vh',
    overflowY: 'auto',
    borderRadius: 12,
    padding: 18,
    background: isDark ? '#2b333b' : '#fff',
    border: `1px solid ${isDark ? '#3f4750' : '#e6eef8'}`,
  };

  const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 };
  const title = { margin: 0, fontSize: 18, fontWeight: 800 };
  const subtitle = { margin: 0, fontSize: 13, color: isDark ? '#c7ceda' : '#64748b' };
  const reviewShell = { padding: 12, borderRadius: 8, background: isDark ? '#32383f' : '#f8fbff' };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(event) => event.stopPropagation()}>
        <div style={header}>
          <div>
            <h3 style={title}>{provider.name} - Reviews</h3>
            <p style={subtitle}>
              <CompactRating rating={provider.rating} reviewCount={provider.reviews || 0} isDark={isDark} />
            </p>
          </div>
          <div>
            <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isLoading ? (
            <div style={reviewShell}>Loading reviews...</div>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review.id || `${review.rating}-${review.date}-${review.comment}`}
                style={{
                  ...reviewShell,
                  border: `1px solid ${isDark ? '#3f4750' : '#e6eef8'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>{review.clientName || 'Client'}</div>
                  <RatingStars rating={review.rating} isDark={isDark} />
                </div>
                <div style={{ marginTop: 6, color: isDark ? '#c7ceda' : '#334155' }}>{review.comment}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: isDark ? '#9aa5b5' : '#64748b' }}>{review.date}</div>
              </div>
            ))
          ) : (
            <div style={reviewShell}>No reviews yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;
