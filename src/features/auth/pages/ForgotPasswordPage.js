import { useState } from 'react';

function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      padding: '1rem',
    },
    card: {
      backgroundColor: '#1e293b',
      borderRadius: '0.5rem',
      border: '1px solid #334155',
      padding: '2rem',
      maxWidth: '400px',
      width: '100%',
    },
    heading: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#f1f5f9',
      marginBottom: '0.5rem',
      textAlign: 'center',
    },
    subheading: {
      fontSize: '0.875rem',
      color: '#cbd5e1',
      textAlign: 'center',
      marginBottom: '2rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#cbd5e1',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '1rem',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '0.375rem',
      color: '#f1f5f9',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
    },
    inputFocus: {
      borderColor: '#3b82f6',
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
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
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
    buttonHover: {
      backgroundColor: '#2563eb',
    },
    backButton: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '0.375rem',
      border: '1px solid #334155',
      backgroundColor: 'transparent',
      color: '#cbd5e1',
      cursor: 'pointer',
      marginTop: '1rem',
      transition: 'all 0.2s',
    },
    backButtonHover: {
      backgroundColor: '#1e293b',
      borderColor: '#475569',
    },
    successMessage: {
      backgroundColor: '#064e3b',
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
      color: '#d1fae5',
      lineHeight: '1.5',
    },
    resetLink: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontWeight: '600',
      cursor: 'pointer',
    },
    resetLinkHover: {
      textDecoration: 'underline',
    },
    errorMessage: {
      backgroundColor: '#7f1d1d',
      border: '1px solid #ef4444',
      borderRadius: '0.375rem',
      padding: '0.75rem',
      marginBottom: '1rem',
      color: '#fca5a5',
      fontSize: '0.875rem',
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Mock API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Forgot Password?</h1>
        <p style={styles.subheading}>
          {isSubmitted
            ? 'Check your email for reset link'
            : 'Enter your email to receive a password reset link'}
        </p>

        {error && <div style={styles.errorMessage}>{error}</div>}

        {isSubmitted ? (
          <div>
            <div style={styles.successMessage}>
              <div style={styles.successTitle}>✓ Success!</div>
              <div style={styles.successText}>
                We've sent a password reset link to <strong>{email}</strong>. Click the link below to reset your password:
              </div>
            </div>

            <div
              style={{
                ...styles.formGroup,
                backgroundColor: '#0f172a',
                padding: '1rem',
                borderRadius: '0.375rem',
                border: '1px solid #334155',
                wordBreak: 'break-all',
              }}
            >
              <button
                onClick={() => {
                  // In a real app, this would be a link from the email
                  window.location.href = `?view=reset-password&token=mock_${Date.now()}_${email.replace(/[^a-zA-Z0-9]/g, '')}`;
                }}
                style={{
                  ...styles.resetLink,
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Reset Password
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '1rem', textAlign: 'center' }}>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  font: 'inherit',
                }}
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
                onFocus={(e) => (e.target.style.cssText = Object.entries({ ...styles.input, ...styles.inputFocus }).map(([k, v]) => k === 'cssText' ? '' : `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join(';'))}
                onBlur={(e) => (e.target.style.cssText = Object.entries(styles.input).map(([k, v]) => k === 'cssText' ? '' : `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join(';'))}
                style={styles.input}
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
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
          onClick={onBack}
          onMouseEnter={(e) => (e.target.style.cssText = Object.entries({ ...styles.backButton, ...styles.backButtonHover }).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join(';'))}
          onMouseLeave={(e) => (e.target.style.cssText = Object.entries(styles.backButton).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join(';'))}
          style={styles.backButton}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
