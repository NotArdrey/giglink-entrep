import { useState } from 'react';

function ForgotPasswordModal({ isOpen, onClose, onResetPassword }) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [hoveredButton, setHoveredButton] = useState('');

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem',
      border: '1px solid #d1d5db',
      padding: '2rem',
      maxWidth: '400px',
      width: '90%',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      position: 'relative',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: hoveredButton === 'close' ? '#111827' : '#6b7280',
      transition: 'color 0.3s ease',
    },
    heading: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.5rem',
      textAlign: 'center',
      margin: '0 0 0.5rem 0',
    },
    subheading: {
      fontSize: '0.875rem',
      color: '#4b5563',
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '1rem',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      color: '#111827',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: hoveredButton === 'submit' ? '#1d4ed8' : '#2563eb',
      color: '#ffffff',
    },
    secondaryButton: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      backgroundColor: 'transparent',
      color: '#4b5563',
      cursor: 'pointer',
      marginTop: '1rem',
      transition: 'all 0.2s',
    },
    secondaryButtonHover: {
      backgroundColor: '#f3f4f6',
      borderColor: '#d1d5db',
    },
    successMessage: {
      backgroundColor: '#f0fdf4',
      border: '1px solid #10b981',
      borderRadius: '0.375rem',
      padding: '1rem',
      marginBottom: '1.5rem',
    },
    successTitle: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#10b981',
      marginBottom: '0.5rem',
    },
    successText: {
      fontSize: '0.875rem',
      color: '#059669',
      lineHeight: '1.5',
    },
    errorMessage: {
      backgroundColor: '#fef2f2',
      border: '1px solid #ef4444',
      borderRadius: '0.375rem',
      padding: '0.75rem',
      marginBottom: '1rem',
      color: '#c33',
      fontSize: '0.875rem',
    },
    resetButton: {
      background: 'none',
      border: 'none',
      color: hoveredButton === 'reset' ? '#1d4ed8' : '#2563eb',
      cursor: 'pointer',
      textDecoration: hoveredButton === 'reset' ? 'underline' : 'none',
      padding: 0,
      font: 'inherit',
      fontWeight: '600',
      transition: 'color 0.3s ease',
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <button
          onClick={onClose}
          onMouseEnter={() => setHoveredButton('close')}
          onMouseLeave={() => setHoveredButton('')}
          style={styles.closeButton}
        >
          ✕
        </button>
        <h2 style={styles.heading}>Forgot Password?</h2>
        <p style={styles.subheading}>
          {isSubmitted ? 'Check your email for reset link' : 'Enter your email to receive a password reset link'}
        </p>

        {error && <div style={styles.errorMessage}>{error}</div>}

        {isSubmitted ? (
          <div>
            <div style={styles.successMessage}>
              <div style={styles.successTitle}>✓ Success!</div>
              <div style={styles.successText}>
                We've sent a password reset link to <strong>{email}</strong>. Click the button below to reset your password.
              </div>
            </div>

            <button
              onClick={() => {
                onResetPassword(
                  `mock_${Date.now()}_${email.replace(/[^a-zA-Z0-9]/g, '')}`,
                  email
                );
              }}
              onMouseEnter={() => setHoveredButton('submit')}
              onMouseLeave={() => setHoveredButton('')}
              style={styles.button}
            >
              Reset Password
            </button>

            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '1rem', textAlign: 'center' }}>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                  setError('');
                }}
                onMouseEnter={() => setHoveredButton('reset')}
                onMouseLeave={() => setHoveredButton('')}
                style={styles.resetButton}
              >
                try another email
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => setHoveredButton('submit')}
              onMouseLeave={() => setHoveredButton('')}
              style={{
                ...styles.button,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <button
          onClick={onClose}
          onMouseEnter={() => setHoveredButton('secondary')}
          onMouseLeave={() => setHoveredButton('')}
          style={hoveredButton === 'secondary' ? { ...styles.secondaryButton, ...styles.secondaryButtonHover } : styles.secondaryButton}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
