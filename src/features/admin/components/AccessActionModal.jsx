/**
 * AccessActionModal - View Component
 * 
 * Modal for disabling or banning user accounts.
 * Pure presentation component - all state/logic managed by parent.
 */

import PropTypes from 'prop-types';

function AccessActionModal({
  isOpen,
  target,
  mode,
  reason,
  onReasonChange,
  durationValue,
  onDurationValueChange,
  durationUnit,
  onDurationUnitChange,
  onConfirm,
  onCancel,
  themeTokens,
  styles,
}) {
  if (!isOpen || !target) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: 'min(92vw, 560px)',
          backgroundColor: themeTokens.surface,
          border: `1px solid ${themeTokens.border}`,
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
          display: 'grid',
          gap: '14px',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
        }}
      >
        <div style={styles.panelTitleWrap}>
          <h2 style={styles.panelTitle}>{mode === 'ban' ? 'Ban Account' : 'Disable Account'}</h2>
          <p style={styles.panelDesc}>
            {mode === 'ban'
              ? `Suspend ${target.name} for a custom duration.`
              : `Soft-disable ${target.name} until an admin restores access.`}
          </p>
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          <label style={{ display: 'grid', gap: '6px', fontWeight: 700 }}>
            Reason
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={4}
              style={{
                borderRadius: '12px',
                border: `1px solid ${themeTokens.border}`,
                backgroundColor: themeTokens.surfaceAlt,
                color: themeTokens.textPrimary,
                padding: '12px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              placeholder="Add the admin reason for this action"
            />
          </label>

          {mode === 'ban' && (
            <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))' }}>
              <label style={{ display: 'grid', gap: '6px', fontWeight: 700 }}>
                Duration
                <input
                  type="number"
                  min="1"
                  value={durationValue}
                  onChange={(e) => onDurationValueChange(e.target.value)}
                  style={{
                    minHeight: '42px',
                    borderRadius: '12px',
                    border: `1px solid ${themeTokens.border}`,
                    backgroundColor: themeTokens.surfaceAlt,
                    color: themeTokens.textPrimary,
                    padding: '0 12px',
                    fontFamily: 'inherit',
                  }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px', fontWeight: 700 }}>
                Unit
                <select
                  value={durationUnit}
                  onChange={(e) => onDurationUnitChange(e.target.value)}
                  style={{
                    minHeight: '42px',
                    borderRadius: '12px',
                    border: `1px solid ${themeTokens.border}`,
                    backgroundColor: themeTokens.surfaceAlt,
                    color: themeTokens.textPrimary,
                    padding: '0 12px',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </label>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" style={{ ...styles.rowButton, ...styles.rowButtonMuted }} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            style={{
              ...styles.rowButton,
              backgroundColor: mode === 'ban' ? '#b45309' : '#dc2626',
            }}
            onClick={onConfirm}
          >
            {mode === 'ban' ? 'Ban Account' : 'Disable Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

AccessActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  target: PropTypes.object,
  mode: PropTypes.oneOf(['disable', 'ban']).isRequired,
  reason: PropTypes.string.isRequired,
  onReasonChange: PropTypes.func.isRequired,
  durationValue: PropTypes.string.isRequired,
  onDurationValueChange: PropTypes.func.isRequired,
  durationUnit: PropTypes.string.isRequired,
  onDurationUnitChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  themeTokens: PropTypes.object.isRequired,
  styles: PropTypes.object.isRequired,
};

export default AccessActionModal;
