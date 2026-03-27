import { useEffect, useState } from 'react';

/**
 * SkeletonText Component
 * Reusable skeleton placeholder for text content
 * Supports multiple lines and custom width
 */
function SkeletonText({ lines = 3, width = '100%' }) {
  const [shimmer, setShimmer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmer((prev) => (prev + 1) % 2);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const styles = {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    line: {
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      height: '14px',
      borderRadius: '4px',
      width: '100%',
    },
  };

  return (
    <div style={styles.wrapper}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            ...styles.line,
            width: i === lines - 1 ? width : '100%',
          }}
        />
      ))}
    </div>
  );
}

export default SkeletonText;
