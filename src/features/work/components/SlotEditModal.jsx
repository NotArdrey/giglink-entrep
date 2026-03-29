import React, { useState, useEffect } from 'react';


/**
 * SlotEditModal Component
 * 
 * Allows editing of time slots or calendar availability dates
 * Supports both 'with-slots' and 'calendar-only' modes
 */
const SlotEditModal = ({
  isOpen,
  mode, // 'with-slots' or 'calendar-only'
  slotData, // { startTime, endTime, capacity, date, maxBookings, note, ... }
  dayLabel,
  modalTitle,
  submitLabel,
  onSave,
  onClose,
}) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [capacity, setCapacity] = useState('3');
  const [date, setDate] = useState('');
  const [maxBookings, setMaxBookings] = useState('3');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [hoveredButton, setHoveredButton] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'calendar-only') {
      setDate(slotData?.date || '');
      setMaxBookings(String(slotData?.maxBookings || 3));
      setNote(slotData?.note || '');
    } else {
      setStartTime(slotData?.startTime || '09:00');
      setEndTime(slotData?.endTime || '11:00');
      setCapacity(String(slotData?.capacity || 3));
    }
    setError('');
  }, [slotData, isOpen, mode]);

  const handleSave = () => {
    setError('');

    if (mode === 'calendar-only') {
      if (!date.trim()) {
        setError('Please enter a date (YYYY-MM-DD)');
        return;
      }
      if (!maxBookings.trim() || Number(maxBookings) < 1) {
        setError('Max bookings must be at least 1');
        return;
      }

      onSave({
        date,
        maxBookings: Number(maxBookings),
        note,
      });
    } else {
      if (!startTime.trim() || !endTime.trim()) {
        setError('Please enter both start and end times');
        return;
      }
      if (!capacity.trim() || Number(capacity) < 1) {
        setError('Capacity must be at least 1');
        return;
      }

      onSave({
        startTime,
        endTime,
        capacity: Number(capacity),
      });
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 270,
      padding: '1rem',
    },
    modal: {
      width: 'min(94vw, 620px)',
      backgroundColor: '#ffffff',
      borderRadius: '0.8rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 18px 35px rgba(15, 23, 42, 0.24)',
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.8rem 1rem',
    },
    close: {
      border: '1px solid #cbd5e1',
      borderRadius: '999px',
      width: '32px',
      height: '32px',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
    },
    body: { padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' },
    field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
    input: { border: '1px solid #cbd5e1', borderRadius: '0.45rem', padding: '0.5rem 0.55rem' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' },
    error: {
      borderRadius: '0.4rem',
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      padding: '0.4rem 0.55rem',
      fontSize: '0.9rem',
    },
    preview: {
      border: '1px solid #bfdbfe',
      backgroundColor: '#eff6ff',
      borderRadius: '0.45rem',
      padding: '0.5rem 0.6rem',
      color: '#1e3a8a',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.5rem',
      borderTop: '1px solid #e2e8f0',
      padding: '0.75rem 1rem',
    },
    cancel: {
      border: '1px solid #cbd5e1',
      borderRadius: '0.45rem',
      backgroundColor: '#ffffff',
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
      fontWeight: 600,
    },
    save: {
      border: 'none',
      borderRadius: '0.45rem',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
      fontWeight: 700,
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>
            {modalTitle || (mode === 'calendar-only' ? 'Edit Available Date' : `Edit Time Slot - ${dayLabel}`)}
          </h2>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          {error && <div style={styles.error}>{error}</div>}

          {mode === 'calendar-only' ? (
            <>
              <div style={styles.field}>
                <label htmlFor="edit-date">Available Date</label>
                <input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="edit-max-bookings">Max Bookings</label>
                <input
                  id="edit-max-bookings"
                  type="number"
                  min="1"
                  value={maxBookings}
                  onChange={(e) => setMaxBookings(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="edit-note">Note (Optional)</label>
                <input
                  id="edit-note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Morning slots only"
                  style={styles.input}
                />
              </div>
            </>
          ) : (
            <>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label htmlFor="edit-start">Start Time</label>
                  <input
                    id="edit-start"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label htmlFor="edit-end">End Time</label>
                  <input
                    id="edit-end"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label htmlFor="edit-capacity">Slot Capacity</label>
                <input
                  id="edit-capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  style={styles.input}
                />
              </div>

              {startTime && endTime && (
                <div style={styles.preview}>
                  <p>
                    <strong>Time Block:</strong> {startTime} - {endTime}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {capacity} slot{capacity !== '1' ? 's' : ''}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.actions}>
          <button style={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{ ...styles.save, backgroundColor: hoveredButton === 'save' ? '#1d4ed8' : '#2563eb' }}
            onMouseEnter={() => setHoveredButton('save')}
            onMouseLeave={() => setHoveredButton('')}
            onClick={handleSave}
          >
            {submitLabel || 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotEditModal;
