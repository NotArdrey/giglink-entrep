import { useState } from 'react';
import { useResetPasswordController } from '../hooks';

function ResetPasswordModal({ isOpen, token, email, onClose, onBack }) {
  // Initialize controller hook
  const controller = useResetPasswordController(
    async (result) => {
      // Callback when password is successfully reset
      if (onClose) {
        try {
          await onClose();
        } catch (error) {
          console.error('Reset password success callback error:', error);
        }
      }
    }
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      color: '#111827',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
    },
    toggleButton: {
      position: 'absolute',
      right: '0.75rem',
      background: 'none',
      border: 'none',
      color: '#6b7280',
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
      backgroundColor: hoveredButton === 'submit' ? 'var(--gl-blue-2)' : 'var(--gl-blue)',
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
      color: '#059669',
      marginBottom: '1.5rem',
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
    passwordRequirements: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.5rem',
      lineHeight: '1.6',
    },
  };

  const validatePassword = (pwd) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    controller.setError('');

    if (!controller.newPassword) {
      controller.setError('Please enter a new password');
      return;
    }

    if (!validatePassword(controller.newPassword)) {
      controller.setError('Password must be at least 8 characters with uppercase and numbers');
      return;
    }

    if (controller.newPassword !== controller.confirmPassword) {
      controller.setError('Passwords do not match');
      return;
    }

    try {
      await controller.handleResetWithToken(email);
    } catch (error) {
      // Error is already set in controller
      console.error('Reset password error:', error);
    }
  };

  if (!isOpen) return null;

  if (controller.isSuccess) {
    return (
      <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onBack()}>
        <div style={styles.modal}>
          <button
            onClick={onBack}
            onMouseEnter={() => setHoveredButton('close')}
            onMouseLeave={() => setHoveredButton('')}
            style={styles.closeButton}
          >
            ✕
          </button>
          <div style={styles.successMessage}>
            <div style={styles.successIcon}>✓</div>
            <div style={styles.successTitle}>Password Reset Successful!</div>
            <div style={styles.successText}>Your password has been updated. You can now log in with your new password.</div>
            <button
              onClick={onBack}
              onMouseEnter={() => setHoveredButton('submit')}
              onMouseLeave={() => setHoveredButton('')}
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
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onBack()}>
      <div style={styles.modal}>
        <button
          onClick={onBack}
          onMouseEnter={() => setHoveredButton('close')}
          onMouseLeave={() => setHoveredButton('')}
          style={styles.closeButton}
        >
          ✕
        </button>
        <h2 style={styles.heading}>Reset Password</h2>
        <p style={styles.subheading}>Enter your new password below</p>

        {controller.error && <div style={styles.errorMessage}>{controller.error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.inputContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={controller.newPassword}
                onChange={(e) => controller.setNewPassword(e.target.value)}
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
                value={controller.confirmPassword}
                onChange={(e) => controller.setConfirmPassword(e.target.value)}
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
            disabled={controller.isLoading}
            onMouseEnter={() => setHoveredButton('submit')}
            onMouseLeave={() => setHoveredButton('')}
            style={{
              ...styles.button,
              opacity: controller.isLoading ? 0.7 : 1,
              cursor: controller.isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {controller.isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <button
          onClick={onBack}
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

export default ResetPasswordModal;
