import { useState } from 'react';
// Note: Calendar-only setup stores explicit availableDates array without slot blocks.
import '../styles/CalendarAvailabilityModal.css';

function CalendarAvailabilityModal({ isOpen, onClose, availableDates, onAddDate, onRemoveDate }) {
  const [selectedDate, setSelectedDate] = useState('');

  if (!isOpen) return null;

  const sortedDates = [...availableDates].sort();

  const handleAddDate = () => {
    if (!selectedDate) return;
    onAddDate(selectedDate);
    setSelectedDate('');
  };

  return (
    <div className="calendar-availability-overlay">
      <div className="calendar-availability-content">
        <button className="calendar-availability-close" onClick={onClose} aria-label="Close modal">
          x
        </button>

        <h2>Calendar Availability Setup</h2>
        <p>For services that do not require fixed time slots.</p>

        <div className="calendar-availability-add-row">
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
          <button onClick={handleAddDate}>Add Date</button>
        </div>

        <div className="calendar-availability-list">
          {sortedDates.length === 0 ? (
            <p>No available dates yet.</p>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="calendar-availability-item">
                <span>{date}</span>
                <button onClick={() => onRemoveDate(date)}>Remove</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarAvailabilityModal;
