import { useState } from 'react';

function ResetPasswordPage({ onBack, token, email }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    inputContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      paddingRight: '2.5rem',
      fontSize: '1rem',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '0.375rem',
      color: '#f1f5f9',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
    },
    toggleButton: {
      position: 'absolute',
      right: '0.75rem',
      background: 'none',
      border: 'none',
      color: '#94a3b8',
      cursor: 'pointer',
      fontSize: '1rem',
      padding: '0.25rem 0.5rem',
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
      padding: '1.5rem',
      textAlign: 'center',
    },
    successIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
    },
    successTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#10b981',
      marginBottom: '0.5rem',
    },
    successText: {
      fontSize: '0.875rem',
      color: '#d1fae5',
      marginBottom: '1.5rem',
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
    passwordRequirements: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      marginTop: '0.5rem',
      lineHeight: '1.6',
    },
  };

  const validatePassword = (pwd) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with uppercase and numbers');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Mock API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successMessage}>
            <div style={styles.successIcon}>✓</div>
            <div style={styles.successTitle}>Password Reset Successful!</div>
            <div style={styles.successText}>
              Your password has been updated. You can now log in with your new password.
            </div>
            <button
              onClick={onBack}
              onMouseEnter={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
              style={styles.button}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Reset Password</h1>
        <p style={styles.subheading}>Enter your new password below</p>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.inputContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleButton}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div style={styles.passwordRequirements}>
              • At least 8 characters<br />
              • One uppercase letter<br />
              • One number
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputContainer}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.toggleButton}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
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
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <button
          onClick={onBack}
          onMouseEnter={(e) => (e.target.style.backgroundColor = styles.backButtonHover.backgroundColor)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
          style={styles.backButton}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
