import { useEffect, useState } from 'react';

/**
 * SkeletonCard Component
 * Reusable skeleton placeholder for booking/service cards
 * Used during data loading with shimmer pulse effect
 */
function SkeletonCard() {
  const [shimmer, setShimmer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmer((prev) => (prev + 1) % 2);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const styles = {
    card: {
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      borderLeft: '4px solid #27ae60',
    },
    skeletonLine: {
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      height: '16px',
      borderRadius: '6px',
      marginBottom: '8px',
    },
    skeletonTitle: {
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      height: '20px',
      borderRadius: '6px',
      marginBottom: '12px',
      width: '70%',
    },
    skeletonAmount: {
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      height: '24px',
      borderRadius: '6px',
      width: '40%',
      marginTop: '8px',
    },
    skeletonButton: {
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      height: '40px',
      borderRadius: '8px',
      marginTop: '12px',
      width: '100%',
    },
    actions: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
    },
    actionButton: {
      flex: 1,
      height: '40px',
      borderRadius: '8px',
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.skeletonTitle} />
      <div style={styles.skeletonLine} />
      <div style={{ ...styles.skeletonLine, width: '80%' }} />
      <div style={styles.skeletonAmount} />
      <div style={styles.actions}>
        <div style={styles.actionButton} />
        <div style={styles.actionButton} />
      </div>
    </div>
  );
}

export default SkeletonCard;
