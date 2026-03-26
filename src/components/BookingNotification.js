// Note: Notification component for booking success
// Note: useEffect for auto-dismiss functionality
import { useEffect } from 'react';

const styles = {
  notification: {
    position: 'fixed',
    top: '1.25rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 300,
    width: 'min(560px, calc(100% - 2rem))',
  },
  notificationContent: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    padding: '1.2rem 1.8rem',
    borderRadius: '0.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.2rem',
    boxShadow: '0 8px 16px rgba(16, 185, 129, 0.4)',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  notificationIcon: {
    fontSize: '1.8rem',
    fontWeight: 700,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
  },
  notificationMessage: {
    margin: 0,
    lineHeight: 1.4,
  },
};

function BookingNotification({ message, isVisible, onClose }) {
  // Note: useEffect with dependency array to auto-dismiss notification after 3 seconds
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

export default BookingNotification;
