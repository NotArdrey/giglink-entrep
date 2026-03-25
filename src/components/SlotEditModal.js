import React, { useState, useEffect } from 'react';
import '../styles/SlotEditModal.css';

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

  return (
    <div className="slot-edit-modal-overlay">
      <div className="slot-edit-modal">
        <div className="slot-edit-header">
          <h2>
            {modalTitle || (mode === 'calendar-only' ? 'Edit Available Date' : `Edit Time Slot - ${dayLabel}`)}
          </h2>
          <button className="slot-edit-close" onClick={onClose}>✕</button>
        </div>

        <div className="slot-edit-body">
          {error && <div className="slot-edit-error">{error}</div>}

          {mode === 'calendar-only' ? (
            <>
              <div className="slot-edit-field">
                <label htmlFor="edit-date">Available Date</label>
                <input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div className="slot-edit-field">
                <label htmlFor="edit-max-bookings">Max Bookings</label>
                <input
                  id="edit-max-bookings"
                  type="number"
                  min="1"
                  value={maxBookings}
                  onChange={(e) => setMaxBookings(e.target.value)}
                />
              </div>

              <div className="slot-edit-field">
                <label htmlFor="edit-note">Note (Optional)</label>
                <input
                  id="edit-note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Morning slots only"
                />
              </div>
            </>
          ) : (
            <>
              <div className="slot-edit-row">
                <div className="slot-edit-field">
                  <label htmlFor="edit-start">Start Time</label>
                  <input
                    id="edit-start"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="slot-edit-field">
                  <label htmlFor="edit-end">End Time</label>
                  <input
                    id="edit-end"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="slot-edit-field">
                <label htmlFor="edit-capacity">Slot Capacity</label>
                <input
                  id="edit-capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>

              {startTime && endTime && (
                <div className="slot-edit-preview">
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

        <div className="slot-edit-actions">
          <button className="slot-edit-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="slot-edit-save" onClick={handleSave}>
            {submitLabel || 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotEditModal;
