import React from 'react';
import { getThemeTokens } from '../styles/themeTokens';

function ConfirmActionModal({
  isOpen,
  title,
  description,
  children,
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  appTheme = 'light',
}) {
  if (!isOpen) return null;

  const themeTokens = getThemeTokens(appTheme);

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 300,
    },
    card: {
      width: 'min(92vw, 480px)',
      borderRadius: '0.9rem',
      border: `1px solid ${themeTokens.border}`,
      backgroundColor: themeTokens.surface,
      boxShadow: '0 18px 40px rgba(15, 23, 42, 0.24)',
      padding: '1rem',
      color: themeTokens.textPrimary,
    },
    title: {
      margin: '0 0 0.35rem',
      fontSize: '1.25rem',
      fontWeight: 800,
    },
    description: {
      margin: 0,
      color: themeTokens.textSecondary,
      lineHeight: 1.45,
    },
    body: {
      marginTop: '0.85rem',
      padding: '0.85rem',
      borderRadius: '0.7rem',
      backgroundColor: themeTokens.surfaceAlt,
      border: `1px solid ${themeTokens.border}`,
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.5rem',
      marginTop: '1rem',
      flexWrap: 'wrap',
    },
    cancel: {
      border: `1px solid ${themeTokens.border}`,
      backgroundColor: themeTokens.surfaceSoft,
      color: themeTokens.textPrimary,
      borderRadius: '0.55rem',
      padding: '0.65rem 0.95rem',
      fontWeight: 700,
      cursor: 'pointer',
    },
    confirm: {
      border: 'none',
      backgroundColor: themeTokens.accent,
      color: '#ffffff',
      borderRadius: '0.55rem',
      padding: '0.65rem 0.95rem',
      fontWeight: 700,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true">
      <div style={styles.card}>
        <h3 style={styles.title}>{title}</h3>
        {description ? <p style={styles.description}>{description}</p> : null}
        {children ? <div style={styles.body}>{children}</div> : null}
        <div style={styles.actions}>
          <button type="button" style={styles.cancel} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" style={styles.confirm} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmActionModal;
