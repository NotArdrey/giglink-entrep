import { useEffect } from 'react';

const styles = {
  notification: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 400,
  },
  notificationContent: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    padding: '1rem 1.5rem',
    borderRadius: '0.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
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

function ErrorNotification({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={styles.notification}>
      <div style={styles.notificationContent}>
        <span style={styles.notificationIcon}>✕</span>
        <p style={styles.notificationMessage}>{message}</p>
      </div>
    </div>
  );
}

export default ErrorNotification;
