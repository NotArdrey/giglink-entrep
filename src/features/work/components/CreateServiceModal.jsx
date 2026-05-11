import React from 'react';

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
}) => {
  if (!isOpen) return null;

  return (
    <div data-testid="create-service-modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
      <div style={{ width: 'min(760px, 92vw)', background: 'white', borderRadius: 12, padding: 18 }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Add New Service</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            placeholder="Title"
            value={newService.title}
            onChange={(event) => onChange('title', event.target.value)}
            style={fieldStyle}
          />
          <input
            placeholder="Short description"
            value={newService.shortDescription}
            onChange={(event) => onChange('shortDescription', event.target.value)}
            style={fieldStyle}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Price"
              type="number"
              value={newService.basePrice}
              onChange={(event) => onChange('basePrice', event.target.value)}
              style={{ ...fieldStyle, flex: 1 }}
            />
            <select
              aria-label="Price type"
              value={newService.priceType}
              onChange={(event) => onChange('priceType', event.target.value)}
              style={fieldStyle}
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
              style={fieldStyle}
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
              style={fieldStyle}
            >
              <option value="with-slots">Book with slots</option>
              <option value="calendar-only">Book by day (calendar)</option>
            </select>
            <input
              placeholder="Duration (min)"
              type="number"
              value={newService.durationMinutes}
              onChange={(event) => onChange('durationMinutes', event.target.value)}
              style={{ ...fieldStyle, width: 140 }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, background: '#eee', border: 'none' }}>
            Cancel
          </button>
          <button type="button" onClick={onSubmit} style={{ padding: '8px 12px', borderRadius: 8, background: '#1d4ed8', color: '#fff', border: 'none' }}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceModal;
