import { useState, useEffect } from 'react';

function HeroSlider({ onGetStarted }) {
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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [prevBtnHovered, setPrevBtnHovered] = useState(false);
  const [nextBtnHovered, setNextBtnHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sliderImages.length]);

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

  const styles = {
    heroSlider: {
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 70px)',
      minHeight: '640px',
      overflow: 'hidden',
      marginTop: '70px',
    },
    sliderContainer: {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sliderImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    },
    sliderOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 22% 48%, rgba(37, 99, 235, 0.28), transparent 52%), linear-gradient(90deg, rgba(2, 6, 23, 0.62) 0%, rgba(2, 6, 23, 0.28) 52%, rgba(2, 6, 23, 0.48) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    sliderContent: {
      textAlign: 'center',
      color: '#ffffff',
      maxWidth: '760px',
      padding: '0 1.25rem',
    },
    sliderBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: '30px',
      border: '1px solid rgba(255, 255, 255, 0.36)',
      borderRadius: '999px',
      padding: '0 12px',
      fontSize: '0.78rem',
      letterSpacing: '0.04em',
      fontWeight: 700,
      textTransform: 'uppercase',
      background: 'rgba(15, 23, 42, 0.25)',
      marginBottom: '12px',
      color: '#ffffff',
    },
    sliderTitle: {
      fontSize: 'clamp(2.25rem, 4.8vw, 4rem)',
      fontWeight: 800,
      margin: '0 0 0.8rem 0',
      lineHeight: 1.08,
      letterSpacing: '-0.02em',
      textShadow: '0 10px 24px rgba(2, 6, 23, 0.45)',
    },
    sliderDescription: {
      fontSize: 'clamp(1.06rem, 1.8vw, 1.35rem)',
      margin: '0 auto 1.8rem',
      maxWidth: '620px',
      lineHeight: 1.5,
      textShadow: '0 4px 12px rgba(2, 6, 23, 0.5)',
    },
    sliderCtaButton: {
      background: ctaHovered
        ? 'linear-gradient(135deg, #1d4ed8 0%, #1546b0 100%)'
        : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: '#ffffff',
      border: 'none',
      minHeight: '46px',
      padding: '0.8rem 1.8rem',
      borderRadius: '0.55rem',
      fontSize: '1rem',
      fontWeight: 700,
      letterSpacing: '0.01em',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease',
      boxShadow: ctaHovered
        ? '0 14px 30px rgba(29, 78, 216, 0.5)'
        : '0 12px 28px rgba(29, 78, 216, 0.42)',
      transform: ctaHovered ? 'translateY(-2px)' : 'translateY(0)',
      filter: ctaHovered ? 'brightness(1.05)' : 'brightness(1)',
    },
    sliderButton: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: prevBtnHovered || nextBtnHovered 
        ? 'rgba(255, 255, 255, 1)' 
        : 'rgba(255, 255, 255, 0.82)',
      color: prevBtnHovered || nextBtnHovered ? '#2563eb' : '#1f2937',
      border: 'none',
      fontSize: '2.5rem',
      padding: '1rem 1.3rem',
      cursor: 'pointer',
      zIndex: 20,
      borderRadius: '0.6rem',
      transition: 'all 0.3s ease',
    },
    sliderButtonPrev: {
      left: '1rem',
    },
    sliderButtonNext: {
      right: '1rem',
    },
    sliderIndicators: {
      position: 'absolute',
      bottom: '1.35rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '0.8rem',
      zIndex: 20,
    },
    indicatorDot: (isActive) => ({
      width: isActive ? '1.32rem' : '0.72rem',
      height: '0.72rem',
      borderRadius: isActive ? '999px' : '50%',
      backgroundColor: isActive
        ? '#ffffff'
        : 'rgba(255, 255, 255, 0.5)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }),
  };

  return (
    <div style={styles.heroSlider}>
      <div style={styles.sliderContainer}>
        <img
          src={currentImage.url}
          alt={currentImage.alt}
          style={styles.sliderImage}
        />

        <div style={styles.sliderOverlay}>
          <div style={styles.sliderContent}>
            <span style={styles.sliderBadge}>{currentImage.badge}</span>
            <h2 style={styles.sliderTitle}>{currentImage.title}</h2>
            <p style={styles.sliderDescription}>{currentImage.description}</p>
            <button
              type="button"
              style={styles.sliderCtaButton}
              onClick={onGetStarted}
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        style={{ ...styles.sliderButton, ...styles.sliderButtonPrev }}
        aria-label="Previous slide"
        onMouseEnter={() => setPrevBtnHovered(true)}
        onMouseLeave={() => setPrevBtnHovered(false)}
      >
        &#8249;
      </button>

      <button
        onClick={nextSlide}
        style={{ ...styles.sliderButton, ...styles.sliderButtonNext }}
        aria-label="Next slide"
        onMouseEnter={() => setNextBtnHovered(true)}
        onMouseLeave={() => setNextBtnHovered(false)}
      >
        &#8250;
      </button>

      <div style={styles.sliderIndicators}>
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={styles.indicatorDot(index === currentSlide)}
            aria-label={`Go to slide ${index + 1}`}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = index === currentSlide
                ? '#ffffff'
                : 'rgba(255, 255, 255, 0.5)';
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;
