// Note: Modal component for displaying worker details
// Note: Using className for styling and camelCase for event handlers (onClick, onChange)
// Note: External CSS imported from styles/
import '../styles/WorkerDetailModal.css';

function WorkerDetailModal({ isOpen, worker, onClose, onBookNow }) {
  if (!isOpen || !worker) return null;

  const isInquiry = worker.actionType === 'inquire';
  
  // Determine rate text based on rate basis
  let rateText = 'Rate upon inquiry';
  let ratingBadge = '';
  
  if (worker.rateBasis === 'per-hour' && worker.hourlyRate) {
    rateText = `₱${worker.hourlyRate}/hour`;
    ratingBadge = 'Hourly Rate';
  } else if (worker.rateBasis === 'per-day' && worker.dailyRate) {
    rateText = `₱${worker.dailyRate}/day`;
    ratingBadge = 'Daily Rate';
  } else if (worker.rateBasis === 'per-project' && worker.projectRate) {
    rateText = `₱${worker.projectRate}/project`;
    ratingBadge = 'Project-Based';
  } else if (worker.pricingType === 'inquiry') {
    rateText = 'Rate upon inquiry';
  } else if (worker.hourlyRate) {
    rateText = `₱${worker.hourlyRate}/hr`;
  }

  return (
    <div className="worker-modal-overlay">
      <div className="worker-modal-content">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="worker-modal-close-button"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Worker Photo */}
        <div className="worker-modal-image-container">
          <img
            src={worker.photo}
            alt={worker.name}
            className="worker-modal-image"
          />
        </div>

        {/* Worker Details */}
        <div className="worker-modal-details">
          {/* Name */}
          <h2 className="worker-modal-name">{worker.name}</h2>

          {/* Service Type */}
          <p className="worker-modal-service">{worker.serviceType}</p>

          {/* Rate Basis Badge */}
          {ratingBadge && (
            <div className="worker-modal-rate-badge">
              <span className={`badge-${worker.rateBasis}`}>{ratingBadge}</span>
            </div>
          )}

          {/* Rating */}
          <div className="worker-modal-rating">
            <span className="worker-modal-stars">★★★★★</span>
            <span className="worker-modal-rating-value">{worker.rating}</span>
            <span className="worker-modal-reviews">({worker.reviews} reviews)</span>
          </div>

          {/* Description */}
          <p className="worker-modal-description">
            {worker.description}
          </p>

          {/* Experience */}
          <div className="worker-modal-info">
            <span className="worker-modal-label">Experience:</span>
            <span className="worker-modal-value">{worker.experience} years</span>
          </div>

          {/* Location */}
          <div className="worker-modal-info">
            <span className="worker-modal-label">Location:</span>
            <span className="worker-modal-value">{worker.location}</span>
          </div>

          {/* Rate */}
          <div className="worker-modal-info">
            <span className="worker-modal-label">Rate:</span>
            <span className="worker-modal-value">{rateText}</span>
          </div>

          {/* Book/Inquire Button */}
          {/* Note: camelCase for onClick event handler */}
          <button
            onClick={() => onBookNow(worker)}
            className="worker-modal-book-button"
          >
            {isInquiry ? 'Inquire Now' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkerDetailModal;
