// Note: Notification component for booking success
// Note: Using className for styling and external CSS from styles/
// Note: useEffect for auto-dismiss functionality
import { useEffect } from 'react';
import '../styles/BookingNotification.css';

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
    <div className="booking-notification">
      <div className="booking-notification-content">
        {/* Success Icon */}
        <span className="booking-notification-icon">✓</span>
        {/* Note: Using curly braces {} for dynamic message data */}
        <p className="booking-notification-message">{message}</p>
      </div>
    </div>
  );
}

export default BookingNotification;
