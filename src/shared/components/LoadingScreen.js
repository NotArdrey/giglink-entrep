// Note: LoadingScreen component for displaying during transitions
import { useEffect, useState } from 'react';

const styles = {
  loadingScreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, var(--gl-page) 0%, var(--gl-surface-3) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '5px solid var(--gl-accent-soft)',
    borderTop: '5px solid var(--gl-blue)',
    borderRadius: '50%',
  },
  loadingText: {
    fontSize: '1.2rem',
    color: 'var(--gl-blue)',
    fontWeight: 600,
    margin: 0,
    letterSpacing: '2px',
  },
};

function LoadingScreen() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotation((prev) => (prev + 8) % 360);
    }, 16);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={styles.loadingScreen}>
      <div style={styles.loadingSpinner}>
        <div style={{ ...styles.spinner, transform: `rotate(${rotation}deg)` }}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
