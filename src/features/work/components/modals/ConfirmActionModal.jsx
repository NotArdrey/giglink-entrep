import React from 'react';

function ConfirmActionModal({
  isOpen,
  title,
  children,
  note,
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  overlayStyle,
  modalStyle,
  noteStyle,
  actionsStyle,
  cancelButtonStyle,
  confirmButtonStyle,
  onConfirmMouseEnter,
  onConfirmMouseLeave,
}) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <h3 style={{ margin: '0 0 8px', color: '#111827', fontSize: '24px' }}>{title}</h3>
        {children}
        {note ? <p style={noteStyle}>{note}</p> : null}
        <div style={actionsStyle}>
          <button style={cancelButtonStyle} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            style={confirmButtonStyle}
            onMouseEnter={onConfirmMouseEnter}
            onMouseLeave={onConfirmMouseLeave}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmActionModal;
