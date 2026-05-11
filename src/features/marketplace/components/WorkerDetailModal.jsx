import { useEffect, useState } from 'react';
import {
  BadgeDollarSign,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { getDisplayServiceType, getProviderQuoteAmount } from '../utils/serviceNormalizer';

const fallbackGallery = [
  'https://via.placeholder.com/900x600?text=Sample+Work+1',
  'https://via.placeholder.com/900x600?text=Sample+Work+2',
  'https://via.placeholder.com/900x600?text=Sample+Work+3',
];

const formatRate = (worker = {}) => {
  if (worker.pricingType === 'inquiry' || worker.actionType === 'inquire') {
    return 'Rate upon inquiry';
  }

  const amount = getProviderQuoteAmount(worker);
  if (!amount) return 'Custom pricing';

  const suffixMap = {
    'per-hour': 'hour',
    'per-day': 'day',
    'per-week': 'week',
    'per-month': 'month',
    'per-project': 'project',
  };

  return `PHP ${amount}/${suffixMap[worker.rateBasis] || 'service'}`;
};

const getRateBadge = (worker = {}) => {
  const labelMap = {
    'per-hour': 'Hourly Rate',
    'per-day': 'Daily Rate',
    'per-week': 'Weekly Rate',
    'per-month': 'Monthly Rate',
    'per-project': 'Project Rate',
  };

  if (worker.pricingType === 'inquiry' || worker.actionType === 'inquire') return 'Inquiry Based';
  return labelMap[worker.rateBasis] || 'Service Rate';
};

function WorkerDetailModal({ isOpen, worker, onClose, onBookNow }) {
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (!isOpen || !worker) return undefined;

    setIsLoadingDetails(true);
    setGalleryIndex(0);
    const timer = setTimeout(() => {
      setIsLoadingDetails(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [isOpen, worker]);

  if (!isOpen || !worker) return null;

  const gallery = (worker.gallery && worker.gallery.length > 0)
    ? worker.gallery
    : (worker.uploadedPhotos && worker.uploadedPhotos.length > 0)
      ? worker.uploadedPhotos
      : (worker.photos && worker.photos.length > 0)
        ? worker.photos
        : (worker.photo ? [worker.photo] : fallbackGallery);

  const serviceType = getDisplayServiceType(worker);
  const isInquiry = worker.actionType === 'inquire';
  const rating = worker.rating || 'New';
  const reviews = worker.reviews || 0;
  const selectedImage = gallery[galleryIndex] || worker.photo || fallbackGallery[0];

  const showPrev = () => setGalleryIndex((index) => (index - 1 + gallery.length) % gallery.length);
  const showNext = () => setGalleryIndex((index) => (index + 1) % gallery.length);

  return (
    <div className="worker-modal-overlay" role="dialog" aria-modal="true" aria-label={`${worker.name || 'Provider'} details`}>
      <div className="worker-modal gl-card">
        <button type="button" className="worker-modal-close gl-icon-button" onClick={onClose} aria-label="Close service details">
          <X size={18} aria-hidden="true" />
        </button>

        <div className="worker-modal-gallery">
          {isLoadingDetails ? (
            <div className="worker-modal-skeleton">
              <UserRound size={46} aria-hidden="true" />
            </div>
          ) : (
            <>
              <img src={selectedImage} alt={`${worker.name || 'Provider'} work sample`} />
              {gallery.length > 1 && (
                <>
                  <button type="button" className="worker-gallery-nav prev" onClick={showPrev} aria-label="Previous image">
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <button type="button" className="worker-gallery-nav next" onClick={showNext} aria-label="Next image">
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                  <div className="worker-gallery-thumbs" aria-label="Gallery thumbnails">
                    {gallery.map((image, index) => (
                      <button
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${image}-${index}`}
                        type="button"
                        className={index === galleryIndex ? 'active' : ''}
                        onClick={() => setGalleryIndex(index)}
                        aria-label={`Show image ${index + 1}`}
                      >
                        <img src={image} alt="" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="worker-modal-details">
          {isLoadingDetails ? (
            <div className="worker-detail-loading">
              <span />
              <strong />
              <p />
              <p />
              <button />
            </div>
          ) : (
            <>
              <span className="gl-eyebrow">{serviceType}</span>
              <h2>{worker.title || serviceType}</h2>
              <p className="worker-provider-name">{worker.name || 'Service Provider'}</p>

              <div className="worker-modal-meta">
                <span><Star size={15} fill="currentColor" aria-hidden="true" /> {rating} ({reviews})</span>
                <span><BadgeDollarSign size={15} aria-hidden="true" /> {getRateBadge(worker)}</span>
                <span><CalendarCheck size={15} aria-hidden="true" /> {isInquiry ? 'Manual scheduling' : 'Bookable'}</span>
                {worker.location && <span><MapPin size={15} aria-hidden="true" /> {worker.location}</span>}
              </div>

              <p className="worker-modal-description">
                {worker.description || 'Professional service available through GigLink.'}
              </p>

              <div className="worker-modal-rate gl-card">
                <span>Service rate</span>
                <strong>{formatRate(worker)}</strong>
              </div>

              {worker.experience ? (
                <p className="worker-modal-note">{worker.experience}+ years of listed experience.</p>
              ) : (
                <p className="worker-modal-note">Verified local provider details are available before booking.</p>
              )}

              <button type="button" className="gl-button primary" onClick={() => onBookNow?.(worker)}>
                {isInquiry ? 'Inquire Now' : 'Book Now'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkerDetailModal;
