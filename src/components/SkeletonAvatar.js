import { useEffect, useState } from 'react';

/**
 * SkeletonAvatar Component
 * Reusable skeleton placeholder for avatars/profile images
 */
function SkeletonAvatar({ size = 48 }) {
  const [shimmer, setShimmer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmer((prev) => (prev + 1) % 2);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const styles = {
    avatar: {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      flexShrink: 0,
    },
  };

  return <div style={styles.avatar} />;
}

export default SkeletonAvatar;
