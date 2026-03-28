import { useState } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(17, 24, 39, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 1200,
  },
  card: {
    width: 'min(560px, 94vw)',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 20px 48px rgba(15, 23, 42, 0.22)',
    padding: '22px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#0f172a',
  },
  text: {
    margin: '10px 0 0',
    color: '#475569',
    fontSize: '16px',
    lineHeight: 1.45,
  },
  actions: {
    marginTop: '18px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  buttonBase: {
    border: 'none',
    borderRadius: '8px',
    minHeight: '44px',
    padding: '10px 16px',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
  },
  cancelButton: {
    background: '#e5e7eb',
    color: '#1f2937',
  },
  confirmButton: {
    background: '#dc2626',
    color: '#ffffff',
  },
};

function LogoutConfirmModal({ isOpen, onConfirm, onCancel }) {
  const [isCancelHovered, setIsCancelHovered] = useState(false);
  const [isConfirmHovered, setIsConfirmHovered] = useState(false);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
      <div style={styles.card}>
        <h3 id="logout-confirm-title" style={styles.title}>Confirm Logout</h3>
        <p style={styles.text}>Are you sure you want to log out?</p>
        <div style={styles.actions}>
          <button
            type="button"
            style={{
              ...styles.buttonBase,
              ...styles.cancelButton,
              ...(isCancelHovered ? { background: '#d1d5db' } : {}),
            }}
            onMouseEnter={() => setIsCancelHovered(true)}
            onMouseLeave={() => setIsCancelHovered(false)}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            style={{
              ...styles.buttonBase,
              ...styles.confirmButton,
              ...(isConfirmHovered ? { background: '#b91c1c' } : {}),
            }}
            onMouseEnter={() => setIsConfirmHovered(true)}
            onMouseLeave={() => setIsConfirmHovered(false)}
            onClick={onConfirm}
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmModal;
