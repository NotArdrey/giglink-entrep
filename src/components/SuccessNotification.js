import { useEffect } from 'react';
// Note: Using className for styling and external CSS from styles/
import '../styles/SuccessNotification.css';

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
    <div className="notification">
      <div className="notification-content">
        {/* Success Icon */}
        <span className="notification-icon">✓</span>
        {/* Note: Using curly braces {} for dynamic message data */}
        <p className="notification-message">{message}</p>
      </div>
    </div>
  );
}

export default SuccessNotification;
