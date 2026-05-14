import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Plus, Trash2, X } from 'lucide-react';
import { getThemeTokens } from '../../../shared/styles/themeTokens';
import { DAY_ORDER, WEEKDAY_ORDER } from '../services/scheduleService';

const DAY_LABELS = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

const BOOKING_METHODS = [
  { value: 'with-slots', label: 'Time-slot booking' },
  { value: 'calendar-only', label: 'Request booking' },
];

const fieldStyle = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #ddd',
};

const createClientSlotId = (dayKey) =>
  `${dayKey.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getAvailabilitySnapshot = (availability = {}) =>
  DAY_ORDER.reduce((schedule, dayKey) => {
    schedule[dayKey] = Array.isArray(availability?.[dayKey])
      ? availability[dayKey].map((slot) => ({ ...slot }))
      : [];
    return schedule;
  }, {});

const cloneSlotForDay = (dayKey, slot, index = 0) => ({
  id: createClientSlotId(`${dayKey}-${index}`),
  startTime: slot.startTime || '09:00',
  endTime: slot.endTime || '17:00',
  capacity: slot.capacity || 1,
});

const isValidSlot = (slot) => Boolean(
  slot?.startTime &&
  slot?.endTime &&
  String(slot.endTime).slice(0, 5) > String(slot.startTime).slice(0, 5) &&
  Number(slot.capacity) > 0
);

const CreateServiceModal = ({
  isOpen,
  newService,
  onChange,
  onClose,
  onSubmit,
  appTheme = 'light',
}) => {
  const [expandedDays, setExpandedDays] = useState({ Mon: true });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setExpandedDays({ Mon: true });
    setLocalError('');
  }, [isOpen]);

  const availability = useMemo(
    () => getAvailabilitySnapshot(newService?.availability),
    [newService?.availability]
  );

  if (!isOpen) return null;

  const themeTokens = getThemeTokens(appTheme);
  const bookingMode = newService.bookingMode === 'calendar-only' ? 'calendar-only' : 'with-slots';
  const showAvailability = bookingMode === 'with-slots';
  const slotCount = DAY_ORDER.reduce(
    (total, dayKey) => total + (availability[dayKey] || []).filter(isValidSlot).length,
    0
  );
  const invalidSlotCount = DAY_ORDER.reduce(
    (total, dayKey) => total + (availability[dayKey] || []).filter((slot) => !isValidSlot(slot)).length,
    0
  );

  const inputStyle = {
    ...fieldStyle,
    border: `1px solid ${themeTokens.inputBorder}`,
    background: themeTokens.inputBg,
    color: themeTokens.inputText,
    width: '100%',
    boxSizing: 'border-box',
  };
  const chevronColor = appTheme === 'dark' ? '%23cbd5e1' : '%23475569';
  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    background: `${themeTokens.inputBg} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${chevronColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center`,
    backgroundSize: '16px 16px',
    paddingRight: 36,
  };
  const sectionStyle = {
    border: `1px solid ${themeTokens.border}`,
    borderRadius: 8,
    padding: 14,
    background: themeTokens.surfaceAlt,
  };
  const labelStyle = {
    display: 'grid',
    gap: 6,
    color: themeTokens.textPrimary,
    fontSize: 13,
    fontWeight: 700,
  };
  const helperStyle = {
    margin: '4px 0 0',
    color: themeTokens.textMuted,
    fontSize: 12,
    fontWeight: 600,
  };
  const secondaryButtonStyle = {
    minHeight: 36,
    padding: '8px 11px',
    borderRadius: 8,
    background: themeTokens.surface,
    color: themeTokens.textPrimary,
    border: `1px solid ${themeTokens.border}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    cursor: 'pointer',
    fontWeight: 700,
  };

  const updateAvailability = (updater) => {
    const next = getAvailabilitySnapshot(availability);
    updater(next);
    onChange('availability', next);
  };

  const handleAddSlot = (dayKey) => {
    updateAvailability((next) => {
      const lastSlot = next[dayKey]?.[next[dayKey].length - 1];
      next[dayKey] = [
        ...(next[dayKey] || []),
        {
          id: createClientSlotId(dayKey),
          startTime: lastSlot?.endTime || '09:00',
          endTime: lastSlot ? '17:00' : '11:00',
          capacity: lastSlot?.capacity || 1,
        },
      ];
    });
    setExpandedDays((prev) => ({ ...prev, [dayKey]: true }));
    setLocalError('');
  };

  const handleSlotChange = (dayKey, slotId, field, value) => {
    updateAvailability((next) => {
      next[dayKey] = (next[dayKey] || []).map((slot) => (
        slot.id === slotId ? { ...slot, [field]: value } : slot
      ));
    });
    setLocalError('');
  };

  const handleRemoveSlot = (dayKey, slotId) => {
    updateAvailability((next) => {
      next[dayKey] = (next[dayKey] || []).filter((slot) => slot.id !== slotId);
    });
    setLocalError('');
  };

  const copyMondayToDays = (targetDays) => {
    const mondaySlots = availability.Mon || [];
    if (mondaySlots.length === 0) return;

    updateAvailability((next) => {
      targetDays.forEach((dayKey) => {
        next[dayKey] = mondaySlots.map((slot, index) => cloneSlotForDay(dayKey, slot, index));
      });
    });
    setExpandedDays((prev) => targetDays.reduce((acc, dayKey) => ({ ...acc, [dayKey]: true }), { ...prev, Mon: true }));
    setLocalError('');
  };

  const handleSubmit = () => {
    if (showAvailability && slotCount === 0) {
      setLocalError('Add at least one valid availability slot before publishing.');
      return;
    }

    if (showAvailability && invalidSlotCount > 0) {
      setLocalError('Check availability times and capacity before publishing.');
      return;
    }

    onSubmit();
  };

  return (
    <div
      data-testid="create-service-modal"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 3000,
        padding: 12,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: 'min(820px, 100%)',
          maxHeight: 'calc(100vh - 24px)',
          overflowY: 'auto',
          background: themeTokens.surface,
          color: themeTokens.textPrimary,
          border: `1px solid ${themeTokens.border}`,
          borderRadius: 8,
          boxShadow: themeTokens.shadow,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 18px',
            borderBottom: `1px solid ${themeTokens.border}`,
          }}
        >
          <div>
            <p style={{ ...helperStyle, margin: 0 }}>Service Setup</p>
            <h3 style={{ margin: '3px 0 0', fontSize: 22 }}>Add New Service</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close service setup"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: `1px solid ${themeTokens.border}`,
              background: themeTokens.surfaceAlt,
              color: themeTokens.textPrimary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <div style={{ display: 'grid', gap: 12, padding: 18 }}>
          {localError && (
            <div
              role="alert"
              style={{
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#b91c1c',
                borderRadius: 8,
                padding: '9px 11px',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {localError}
            </div>
          )}

          <section style={sectionStyle}>
            <h4 style={{ margin: '0 0 10px', fontSize: 15 }}>Basic Info</h4>
            <div style={{ display: 'grid', gap: 10 }}>
              <label style={labelStyle}>
                Title
                <input
                  placeholder="Title"
                  value={newService.title}
                  onChange={(event) => onChange('title', event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Short Description
                <input
                  placeholder="Short description"
                  value={newService.shortDescription}
                  onChange={(event) => onChange('shortDescription', event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Detailed Description
                <textarea
                  placeholder="Detailed description"
                  value={newService.description}
                  onChange={(event) => onChange('description', event.target.value)}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                />
              </label>
            </div>
          </section>

          <section style={sectionStyle}>
            <h4 style={{ margin: '0 0 10px', fontSize: 15 }}>Pricing</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 10 }}>
              <label style={labelStyle}>
                Price
                <input
                  placeholder="Price"
                  type="number"
                  value={newService.basePrice}
                  onChange={(event) => onChange('basePrice', event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Price Type
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
              </label>
              <label style={labelStyle}>
                Rate Basis
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
              </label>
              <label style={labelStyle}>
                Duration
                <input
                  placeholder="Duration (min)"
                  type="number"
                  value={newService.durationMinutes}
                  onChange={(event) => onChange('durationMinutes', event.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          </section>

          <section style={sectionStyle}>
            <h4 style={{ margin: '0 0 10px', fontSize: 15 }}>Booking Setup</h4>
            <div role="radiogroup" aria-label="Booking mode" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: 8 }}>
              {BOOKING_METHODS.map((method) => {
                const isSelected = bookingMode === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    style={{
                      minHeight: 44,
                      borderRadius: 8,
                      border: `1px solid ${isSelected ? themeTokens.accent : themeTokens.border}`,
                      background: isSelected ? themeTokens.accentSoft : themeTokens.surface,
                      color: isSelected ? themeTokens.accent : themeTokens.textPrimary,
                      padding: '9px 12px',
                      textAlign: 'left',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                    onClick={() => onChange('bookingMode', method.value)}
                  >
                    {method.label}
                  </button>
                );
              })}
            </div>
          </section>

          {showAvailability && (
            <section style={sectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <h4 style={{ margin: '0 0 3px', fontSize: 15 }}>Availability Schedule</h4>
                  <p style={helperStyle}>{slotCount} valid slot{slotCount === 1 ? '' : 's'} configured</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    style={{
                      ...secondaryButtonStyle,
                      opacity: (availability.Mon || []).length === 0 ? 0.55 : 1,
                      cursor: (availability.Mon || []).length === 0 ? 'not-allowed' : 'pointer',
                    }}
                    disabled={(availability.Mon || []).length === 0}
                    onClick={() => copyMondayToDays(WEEKDAY_ORDER.filter((dayKey) => dayKey !== 'Mon'))}
                  >
                    <Copy size={15} aria-hidden="true" />
                    Apply to all weekdays
                  </button>
                  <button
                    type="button"
                    style={{
                      ...secondaryButtonStyle,
                      opacity: (availability.Mon || []).length === 0 ? 0.55 : 1,
                      cursor: (availability.Mon || []).length === 0 ? 'not-allowed' : 'pointer',
                    }}
                    disabled={(availability.Mon || []).length === 0}
                    onClick={() => copyMondayToDays(DAY_ORDER.filter((dayKey) => dayKey !== 'Mon'))}
                  >
                    <Copy size={15} aria-hidden="true" />
                    Copy Monday schedule
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {DAY_ORDER.map((dayKey) => {
                  const slots = availability[dayKey] || [];
                  const expanded = Boolean(expandedDays[dayKey]);
                  return (
                    <div key={dayKey} style={{ border: `1px solid ${themeTokens.border}`, borderRadius: 8, background: themeTokens.surface, overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setExpandedDays((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }))}
                        style={{
                          width: '100%',
                          border: 'none',
                          background: 'transparent',
                          color: themeTokens.textPrimary,
                          minHeight: 42,
                          padding: '9px 11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                          {expanded ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
                          {DAY_LABELS[dayKey]}
                        </span>
                        <span style={{ color: themeTokens.textMuted, fontSize: 12, fontWeight: 700 }}>
                          {slots.length} slot{slots.length === 1 ? '' : 's'}
                        </span>
                      </button>

                      {expanded && (
                        <div style={{ display: 'grid', gap: 8, padding: '0 11px 11px' }}>
                          {slots.map((slot) => (
                            <div
                              key={slot.id}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) auto',
                                gap: 8,
                                alignItems: 'end',
                              }}
                            >
                              <label style={labelStyle}>
                                Start
                                <input
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(event) => handleSlotChange(dayKey, slot.id, 'startTime', event.target.value)}
                                  style={inputStyle}
                                />
                              </label>
                              <label style={labelStyle}>
                                End
                                <input
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(event) => handleSlotChange(dayKey, slot.id, 'endTime', event.target.value)}
                                  style={inputStyle}
                                />
                              </label>
                              <label style={labelStyle}>
                                Capacity
                                <input
                                  type="number"
                                  min="1"
                                  value={slot.capacity}
                                  onChange={(event) => handleSlotChange(dayKey, slot.id, 'capacity', event.target.value)}
                                  style={inputStyle}
                                />
                              </label>
                              <button
                                type="button"
                                aria-label={`Remove ${DAY_LABELS[dayKey]} slot`}
                                title="Remove slot"
                                onClick={() => handleRemoveSlot(dayKey, slot.id)}
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: 8,
                                  border: '1px solid #fecaca',
                                  background: '#fff1f2',
                                  color: '#be123c',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                              >
                                <Trash2 size={15} aria-hidden="true" />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleAddSlot(dayKey)}
                            style={{ ...secondaryButtonStyle, color: themeTokens.accent, borderStyle: 'dashed', justifySelf: 'start' }}
                          >
                            <Plus size={15} aria-hidden="true" />
                            Add Time
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            padding: '12px 18px 16px',
            borderTop: `1px solid ${themeTokens.border}`,
            flexWrap: 'wrap',
          }}
        >
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              minHeight: 38,
              padding: '8px 13px',
              borderRadius: 8,
              background: themeTokens.accent,
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceModal;
