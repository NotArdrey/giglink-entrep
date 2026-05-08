import React from 'react';

function QrPreviewModal({
  isOpen,
  title,
  subtitle,
  imageSrc,
  imageAlt,
  primaryLabel,
  primaryValue,
  note,
  onClose,
  overlayStyle,
  modalStyle,
  bodyStyle,
  imageStyle,
  noteStyle,
  actionsStyle,
  closeButtonStyle,
}) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <h3 style={{ margin: '0 0 8px', color: '#111827', fontSize: '24px' }}>{title}</h3>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '15px', lineHeight: 1.45 }}>{subtitle}</p>

        <div style={bodyStyle}>
          <img src={imageSrc} alt={imageAlt} style={imageStyle} />
          <div>
            <p>
              <strong>{primaryLabel}:</strong> {primaryValue}
            </p>
            <p style={noteStyle}>{note}</p>
          </div>
        </div>

        <div style={actionsStyle}>
          <button style={closeButtonStyle} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default QrPreviewModal;
