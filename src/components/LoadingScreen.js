// Note: LoadingScreen component for displaying during transitions
// Note: Using className for styling and external CSS from styles/
import '../styles/LoadingScreen.css';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
