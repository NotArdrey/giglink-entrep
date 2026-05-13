import React from 'react';
import { getThemeTokens } from '../../../shared/styles/themeTokens';

const fieldStyle = {
  padding: 8,
  borderRadius: 8,
  border: '1px solid #ddd',
};

const CreateServiceModal = ({
  isOpen,
  newService,
  onChange,
  onClose,
  onSubmit,
  appTheme = 'light',
}) => {
  if (!isOpen) return null;
  const themeTokens = getThemeTokens(appTheme);
  const inputStyle = {
    ...fieldStyle,
    border: `1px solid ${themeTokens.inputBorder}`,
    background: themeTokens.inputBg,
    color: themeTokens.inputText,
  };
  const chevronColor = appTheme === 'dark' ? '%23cbd5e1' : '%23475569';
  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    background: `${themeTokens.inputBg} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${chevronColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center`,
    backgroundSize: '16px 16px',
    paddingRight: 36,
    flex: '1 1 160px',
    minWidth: 0,
  };

  return (
    <div data-testid="create-service-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 3000, padding: 12, overflowY: 'auto' }}>
      <div style={{ width: 'min(760px, 100%)', maxHeight: 'calc(100vh - 24px)', overflowY: 'auto', background: themeTokens.surface, color: themeTokens.textPrimary, border: `1px solid ${themeTokens.border}`, borderRadius: 12, padding: 18, boxShadow: themeTokens.shadow }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Add New Service</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            placeholder="Title"
            value={newService.title}
            onChange={(event) => onChange('title', event.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Short description"
            value={newService.shortDescription}
            onChange={(event) => onChange('shortDescription', event.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="Detailed description"
            value={newService.description}
            onChange={(event) => onChange('description', event.target.value)}
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              placeholder="Price"
              type="number"
              value={newService.basePrice}
              onChange={(event) => onChange('basePrice', event.target.value)}
              style={{ ...inputStyle, flex: '1 1 140px', minWidth: 0 }}
            />
            <select
              aria-label="Price type"
              value={newService.priceType}
              onChange={(event) => onChange('priceType', event.target.value)}
              style={selectStyle}
            >
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
              <option value="package">Package</option>
              <option value="custom">Custom</option>
              <option value="inquiry">Inquiry</option>
            </select>
            <select
              aria-label="Rate basis"
              value={newService.rateBasis}
              onChange={(event) => onChange('rateBasis', event.target.value)}
              style={selectStyle}
            >
              <option value="per-hour">Per hour</option>
              <option value="per-day">Per day</option>
              <option value="per-week">Per week</option>
              <option value="per-month">Per month</option>
              <option value="per-project">Per project</option>
            </select>
            <select
              aria-label="Booking mode"
              value={newService.bookingMode}
              onChange={(event) => onChange('bookingMode', event.target.value)}
              style={selectStyle}
            >
              <option value="with-slots">Book with slots</option>
              <option value="calendar-only">Book by day (calendar)</option>
            </select>
            <input
              placeholder="Duration (min)"
              type="number"
              value={newService.durationMinutes}
              onChange={(event) => onChange('durationMinutes', event.target.value)}
              style={{ ...inputStyle, flex: '1 1 140px', minWidth: 0 }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, background: themeTokens.surfaceAlt, color: themeTokens.textPrimary, border: `1px solid ${themeTokens.border}` }}>
            Cancel
          </button>
          <button type="button" onClick={onSubmit} style={{ padding: '8px 12px', borderRadius: 8, background: themeTokens.accent, color: '#fff', border: 'none' }}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceModal;
