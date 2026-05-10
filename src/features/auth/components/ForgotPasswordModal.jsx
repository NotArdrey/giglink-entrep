import { useState } from 'react';
import { useForgotPasswordController } from '../hooks';

function ForgotPasswordModal({ isOpen, onClose, onSubmit, onBackToLogin }) {
  // Initialize controller hook
  const controller = useForgotPasswordController(
    async (email) => {
      // Callback when reset email is sent successfully
      if (onSubmit) {
        try {
          await onSubmit(email);
        } catch (error) {
          console.error('Forgot password submission error in parent:', error);
        }
      }
    }
  );

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
    controller.setError('');

    if (!controller.email) {
      controller.setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(controller.email)) {
      controller.setError('Please enter a valid email address');
      return;
    }

    try {
      await controller.handleSubmit(controller.email);
    } catch (submitError) {
      // Error is already set in controller
      console.error('Forgot password submission error:', submitError);
    }
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
          {controller.isSubmitted ? 'Check your email for reset link' : 'Enter your email to receive a password reset link'}
        </p>

        {controller.isSubmitted ? (
          <div>
            <div style={styles.successMessage}>
              <div style={styles.successTitle}>✓ Success!</div>
              <div style={styles.successText}>
                We've sent a password reset link to <strong>{controller.email}</strong>. Open the link from your email to create a new password.
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '1rem', textAlign: 'center' }}>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  controller.resetForm();
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
                value={controller.email}
                onChange={(e) => controller.setEmail(e.target.value)}
                style={styles.input}
                placeholder="you@example.com"
              />
            </div>

            {controller.error && <div style={styles.errorMessage}>{controller.error}</div>}

            <button
              type="submit"
              disabled={controller.isLoading}
              onMouseEnter={() => setHoveredButton('submit')}
              onMouseLeave={() => setHoveredButton('')}
              style={{
                ...styles.button,
                opacity: controller.isLoading ? 0.7 : 1,
                cursor: controller.isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {controller.isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <button
          onClick={() => {
            if (typeof onBackToLogin === 'function') {
              onBackToLogin();
              return;
            }
            onClose();
          }}
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
