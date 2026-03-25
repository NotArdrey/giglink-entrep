// Note: Functional component for displaying individual service provider card
// Note: Using className for styling and camelCase for event handlers (onClick)
// Note: External CSS imported from styles/
import '../styles/ServiceCard.css';

function ServiceCard({ provider, onViewProfile }) {
  return (
    <div className="service-card">
      {/* Provider Photo */}
      <div className="card-image-container">
        <img
          src={provider.photo}
          alt={provider.name}
          className="card-image"
        />
      </div>

      {/* Card Content */}
      <div className="card-content">
        {/* Provider Name */}
        <h3 className="card-name">{provider.name}</h3>

        {/* Service Type */}
        <p className="card-service-type">{provider.serviceType}</p>

        {/* Rate Basis Badge */}
        {provider.rateBasis && (
          <div className="rate-basis-badge">
            {provider.rateBasis === 'per-hour' && (
              <span className="badge-hourly">₱{provider.hourlyRate}/hr</span>
            )}
            {provider.rateBasis === 'per-day' && (
              <span className="badge-daily">₱{provider.dailyRate}/day</span>
            )}
            {provider.rateBasis === 'per-project' && (
              <span className="badge-project">₱{provider.projectRate}/project</span>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="card-rating">
          <span className="rating-stars">★★★★★</span>
          <span className="rating-value">{provider.rating}</span>
        </div>

        {/* View Profile Button */}
        {/* Note: camelCase for onClick event handler */}
        <button
          onClick={() => onViewProfile(provider)}
          className="card-button"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

export default ServiceCard;
