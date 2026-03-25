import '../styles/LogoutConfirmModal.css';

function LogoutConfirmModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="logout-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
      <div className="logout-confirm-card">
        <h3 id="logout-confirm-title">Confirm Logout</h3>
        <p>Are you sure you want to log out?</p>
        <div className="logout-confirm-actions">
          <button type="button" className="logout-confirm-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="logout-confirm-continue" onClick={onConfirm}>
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmModal;
