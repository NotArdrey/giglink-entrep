import { useEffect, useState } from 'react';

/**
 * SkeletonChatMessage Component
 * Reusable skeleton placeholder for chat messages
 */
function SkeletonChatMessage({ isClient = false }) {
  const [shimmer, setShimmer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmer((prev) => (prev + 1) % 2);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const styles = {
    messageContainer: {
      display: 'flex',
      justifyContent: isClient ? 'flex-end' : 'flex-start',
      marginBottom: '12px',
      gap: '8px',
    },
    messageBubble: {
      background: `linear-gradient(90deg, #f0f0f0 ${shimmer ? '50%' : '25%'}, #e0e0e0 ${shimmer ? '51%' : '26%'}, #f0f0f0 100%)`,
      borderRadius: '12px',
      height: '40px',
      maxWidth: '70%',
      width: '60%',
      minWidth: '100px',
    },
  };

  return (
    <div style={styles.messageContainer}>
      <div style={styles.messageBubble} />
    </div>
  );
}

export default SkeletonChatMessage;
