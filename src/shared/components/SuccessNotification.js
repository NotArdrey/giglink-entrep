import { useEffect } from 'react';

const styles = {
  notification: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 300,
  },
  notificationContent: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '1rem 1.5rem',
    borderRadius: '0.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    fontWeight: 500,
    fontSize: '0.95rem',
  },
  notificationIcon: {
    fontSize: '1.5rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  notificationMessage: {
    margin: 0,
    lineHeight: 1.4,
  },
};

function SuccessNotification({ message, isVisible, onClose }) {
  // Note: Using useEffect with dependency array to auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={styles.notification}>
      <div style={styles.notificationContent}>
        {/* Success Icon */}
        <span style={styles.notificationIcon}>✓</span>
        {/* Note: Using curly braces {} for dynamic message data */}
        <p style={styles.notificationMessage}>{message}</p>
      </div>
    </div>
  );
}

export default SuccessNotification;
