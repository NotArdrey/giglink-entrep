import { useState, useEffect } from 'react';
// Note: Using className for styling and external CSS from styles/
// Note: Using React useState for managing slider state and auto-rotation
import '../styles/HeroSlider.css';

function HeroSlider({ onGetStarted }) {
  // Note: Slider images array for dynamic rendering
  const sliderImages = [
    {
      url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&h=900&fit=crop',
      alt: 'GigLink welcome',
      title: 'Welcome to GigLink',
      description: 'Find and book expert services from professionals in your area.',
      badge: 'Local Services Marketplace',
    },
    {
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop',
      alt: 'Services',
      title: 'Connect & Get Things Done',
      description: 'Find the help you need or offer your skills to earn',
      badge: 'Trusted Local Marketplace',
    },
    {
      url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&h=600&fit=crop',
      alt: 'Services',
      title: 'Your Marketplace Awaits',
      description: 'Browse services or showcase your talent today',
      badge: 'Built for Professionals',
    },
    {
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
      alt: 'Services',
      title: 'Opportunities at Your Fingertips',
      description: 'Join our community and start making a difference',
      badge: 'Fast and Transparent',
    },
  ];

  // Note: Using useState hooks for tracking current slide and managing manual/auto transitions
  const [currentSlide, setCurrentSlide] = useState(0);

  // Note: useEffect with dependency array to auto-rotate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Note: camelCase for event handlers
  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const currentImage = sliderImages[currentSlide];

  return (
    <div className="hero-slider">
      {/* Main Slider Image Container */}
      <div className="slider-container">
        <img
          src={currentImage.url}
          alt={currentImage.alt}
          className="slider-image"
        />

        {/* Text Overlay */}
        <div className="slider-overlay">
          <div className="slider-content">
            <span className="slider-badge">{currentImage.badge}</span>
            <h2 className="slider-title">{currentImage.title}</h2>
            <p className="slider-description">{currentImage.description}</p>
            <button
              type="button"
              className="slider-cta-button"
              onClick={onGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Previous Button */}
      <button
        onClick={prevSlide}
        className="slider-button slider-button-prev"
        aria-label="Previous slide"
      >
        &#8249;
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="slider-button slider-button-next"
        aria-label="Next slide"
      >
        &#8250;
      </button>

      {/* Slide Indicators (Dots) */}
      <div className="slider-indicators">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`indicator-dot ${
              index === currentSlide ? 'active' : ''
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;
