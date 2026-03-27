import { useEffect, useState } from 'react';

/**
 * SkeletonServiceCard Component
 * Reusable skeleton placeholder for service/worker cards
 */
function SkeletonServiceCard() {
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
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    imagePlaceholder: {
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      width: '100%',
      height: '160px',
    },
    content: {
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      flex: 1,
    },
    titleLine: {
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      height: '18px',
      borderRadius: '4px',
      width: '80%',
    },
    textLine: {
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      height: '14px',
      borderRadius: '4px',
      width: '100%',
    },
    priceAndButton: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px',
    },
    priceLine: {
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      height: '16px',
      borderRadius: '4px',
      width: '60px',
    },
    buttonPlaceholder: {
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      height: '36px',
      borderRadius: '6px',
      flex: 1,
      minWidth: '80px',
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.imagePlaceholder} />
      <div style={styles.content}>
        <div style={styles.titleLine} />
        <div style={styles.textLine} />
        <div style={{ ...styles.textLine, width: '90%' }} />
        <div style={styles.priceAndButton}>
          <div style={styles.priceLine} />
          <div style={styles.buttonPlaceholder} />
        </div>
      </div>
    </div>
  );
}

export default SkeletonServiceCard;
