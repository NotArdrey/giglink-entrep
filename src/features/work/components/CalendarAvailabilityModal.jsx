import { useState } from 'react';
// Note: Calendar-only setup stores explicit availableDates array without slot blocks.


function CalendarAvailabilityModal({ isOpen, onClose, availableDates, onAddDate, onRemoveDate }) {
  const [selectedDate, setSelectedDate] = useState('');

  if (!isOpen) return null;

  const sortedDates = [...availableDates].sort();

  const handleAddDate = () => {
    if (!selectedDate) return;
    onAddDate(selectedDate);
    setSelectedDate('');
  };

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 220,
      padding: '1rem',
    },
    content: {
      width: 'min(92vw, 560px)',
      backgroundColor: '#ffffff',
      borderRadius: '0.85rem',
      boxShadow: '0 18px 35px rgba(15, 23, 42, 0.25)',
      padding: '1.2rem',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
    },
    close: {
      position: 'absolute',
      right: '0.75rem',
      top: '0.75rem',
      width: '32px',
      height: '32px',
      borderRadius: '999px',
      border: '1px solid #cbd5e1',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
    },
    addRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    input: {
      flex: '1 1 220px',
      border: '1px solid #cbd5e1',
      borderRadius: '0.5rem',
      padding: '0.55rem 0.6rem',
    },
    addButton: {
      border: 'none',
      borderRadius: '0.5rem',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontWeight: 700,
      cursor: 'pointer',
      padding: '0.55rem 0.85rem',
    },
    list: {
      maxHeight: '280px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.45rem',
    },
    item: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid #e2e8f0',
      borderRadius: '0.55rem',
      padding: '0.55rem 0.6rem',
      backgroundColor: '#f8fafc',
    },
    removeButton: {
      border: 'none',
      borderRadius: '0.4rem',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      cursor: 'pointer',
      padding: '0.4rem 0.65rem',
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <button style={styles.close} onClick={onClose} aria-label="Close modal">
          x
        </button>

        <h2>Calendar Availability Setup</h2>
        <p>For services that do not require fixed time slots.</p>

        <div style={styles.addRow}>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            style={styles.input}
          />
          <button style={styles.addButton} onClick={handleAddDate}>Add Date</button>
        </div>

        <div style={styles.list}>
          {sortedDates.length === 0 ? (
            <p>No available dates yet.</p>
          ) : (
            sortedDates.map((date) => (
              <div key={date} style={styles.item}>
                <span>{date}</span>
                <button style={styles.removeButton} onClick={() => onRemoveDate(date)}>Remove</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarAvailabilityModal;
