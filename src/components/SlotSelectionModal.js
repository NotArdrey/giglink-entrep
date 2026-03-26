import React, { useState } from 'react';


/**
 * SlotSelectionModal Component
 * 
 * eGov-style calendar booking interface.
 * 
 * Flow:
 * 1. Display calendar with next 30 days
 * 2. When date is selected, show available time slots for that day
 * 3. Slots display with "Slots Left" counter (green if available, gray if full)
 * 4. Client selects a time slot and clicks "Confirm"
 * 5. Returns to MyBookings.js which transitions to payment modal
 * 
 * State Management:
 * - selectedDate: ISO date string (e.g., "2026-03-25")
 * - selectedTimeSlot: selected block object or null
 * 
 * Note: This uses simulated slot data. In production, this would query
 * the worker's actual schedule from the database.
 */
const SlotSelectionModal = ({ booking, onConfirmSlot, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState(''); // ISO format: YYYY-MM-DD
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [hoveredKey, setHoveredKey] = useState('');
  
  // ============ SIMULATED DATA ============
  // In production, this would come from the worker's SellerScheduleModal data
  const simulatedSchedule = {
    // 'Mon', 'Tue', etc. -> array of time blocks with slots
    'Mon': [
      { id: 1, startTime: '09:00', endTime: '11:00', capacity: 3, slotsLeft: 2 },
      { id: 2, startTime: '13:00', endTime: '15:00', capacity: 3, slotsLeft: 0 }, // Full
      { id: 3, startTime: '16:00', endTime: '18:00', capacity: 2, slotsLeft: 1 },
    ],
    'Tue': [
      { id: 4, startTime: '09:00', endTime: '11:00', capacity: 3, slotsLeft: 3 },
      { id: 5, startTime: '14:00', endTime: '16:00', capacity: 2, slotsLeft: 1 },
    ],
    'Wed': [
      { id: 6, startTime: '10:00', endTime: '12:00', capacity: 3, slotsLeft: 2 },
      { id: 7, startTime: '15:00', endTime: '17:00', capacity: 3, slotsLeft: 3 },
    ],
    'Thu': [
      { id: 8, startTime: '13:00', endTime: '15:00', capacity: 3, slotsLeft: 0 }, // Full
    ],
    'Fri': [
      { id: 9, startTime: '09:00', endTime: '11:00', capacity: 3, slotsLeft: 2 },
      { id: 10, startTime: '11:00', endTime: '13:00', capacity: 3, slotsLeft: 1 },
      { id: 11, startTime: '15:00', endTime: '17:00', capacity: 2, slotsLeft: 2 },
    ],
    'Sat': [
      { id: 12, startTime: '10:00', endTime: '12:00', capacity: 3, slotsLeft: 1 },
    ],
    'Sun': [], // No slots on Sunday
  };
  
  // ============ UTILITY FUNCTIONS ============
  
  /**
   * getDayName(dateString)
   * Returns the day name (Mon, Tue, etc.) for a given ISO date
   */
  const getDayName = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00'); // Force UTC to avoid timezone issues
    const dayIndex = date.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };
  
  /**
   * getDateRange()
   * Returns an array of 30 dates starting from tomorrow
   */
  const getDateRange = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const isoDate = date.toISOString().split('T')[0];
      dates.push(isoDate);
    }
    return dates;
  };
  
  /**
   * formatDate(dateString)
   * Converts YYYY-MM-DD to readable format (e.g., "Mar 25, Wed")
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };
  
  /**
   * getAvailableSlotsForSelected()
   * Returns time blocks for the selected date's day of week
   */
  const getAvailableSlotsForSelected = () => {
    if (!selectedDate) return [];
    const dayName = getDayName(selectedDate);
    return simulatedSchedule[dayName] || [];
  };
  
  // ============ EVENT HANDLERS ============
  
  /**
   * handleDateSelect(dateString)
   * User clicked a date in calendar
   * Clears any previously selected time slot
   */
  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    setSelectedTimeSlot(null); // Reset slot selection when date changes
  };
  
  /**
   * handleSlotSelect(timeBlock)
   * User clicked a time slot
   * Only allows selection if slot has availability (slotsLeft > 0)
   */
  const handleSlotSelect = (timeBlock) => {
    if (timeBlock.slotsLeft > 0) {
      setSelectedTimeSlot(timeBlock);
    }
  };
  
  /**
   * handleConfirm()
   * Transition: Slot Selection → Payment Modal
   * Validates selection and calls parent callback
   */
  const handleConfirm = () => {
    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select both a date and a time slot');
      return;
    }
    
    // Prepare slot info object
    const slotInfo = {
      date: formatDate(selectedDate),
      dayName: getDayName(selectedDate),
      isoDate: selectedDate,
      timeBlock: selectedTimeSlot,
    };
    
    // Call parent callback to transition to payment modal
    onConfirmSlot(slotInfo);
  };
  
  const availableSlots = getAvailableSlotsForSelected();
  const dateRange = getDateRange();
  const dayName = selectedDate ? getDayName(selectedDate) : '';

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.54)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 280,
      padding: '1rem',
    },
    card: {
      width: 'min(96vw, 980px)',
      maxHeight: '94vh',
      overflowY: 'auto',
      borderRadius: '0.9rem',
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      boxShadow: '0 18px 40px rgba(15, 23, 42, 0.25)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.85rem 1rem',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
    },
    subtitle: { margin: '0.2rem 0 0', color: '#64748b' },
    closeButton: {
      width: '34px',
      height: '34px',
      borderRadius: '999px',
      border: '1px solid #cbd5e1',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
    },
    content: {
      display: 'grid',
      gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 1.2fr)',
      gap: '0.8rem',
      padding: '1rem',
    },
    section: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.65rem',
      backgroundColor: '#ffffff',
      padding: '0.75rem',
    },
    dateGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(74px, 1fr))',
      gap: '0.45rem',
      marginTop: '0.55rem',
    },
    dateButton: {
      border: '1px solid #cbd5e1',
      borderRadius: '0.55rem',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      padding: '0.45rem',
      textAlign: 'center',
      color: '#1e293b',
    },
    dateDay: { fontSize: '0.78rem', color: '#64748b' },
    dateNum: { fontSize: '1.05rem', fontWeight: 700 },
    noSlots: {
      border: '1px dashed #cbd5e1',
      borderRadius: '0.55rem',
      padding: '0.8rem',
      color: '#64748b',
      textAlign: 'center',
    },
    hint: { marginTop: '0.2rem', fontSize: '0.86rem' },
    slotList: { display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.55rem' },
    slotButton: {
      border: '1px solid #cbd5e1',
      borderRadius: '0.55rem',
      backgroundColor: '#ffffff',
      padding: '0.6rem',
      cursor: 'pointer',
      textAlign: 'left',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.5rem',
    },
    slotTime: { fontWeight: 700, color: '#0f172a' },
    slotInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
    slotsCount: { color: '#166534', fontSize: '0.84rem' },
    selectedIndicator: { color: '#166534', fontWeight: 700, fontSize: '0.82rem' },
    fullText: { color: '#64748b', fontWeight: 700 },
    placeholder: {
      border: '1px dashed #cbd5e1',
      borderRadius: '0.55rem',
      minHeight: '180px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#64748b',
      textAlign: 'center',
      padding: '0.8rem',
    },
    confirmationBar: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '0.5rem',
      flexWrap: 'wrap',
      borderTop: '1px solid #e2e8f0',
      backgroundColor: '#eff6ff',
      padding: '0.8rem 1rem',
      alignItems: 'center',
    },
    confirmButton: {
      border: 'none',
      borderRadius: '0.55rem',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontWeight: 700,
      cursor: 'pointer',
      padding: '0.55rem 0.85rem',
    },
    hintBar: {
      borderTop: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      color: '#64748b',
      padding: '0.7rem 1rem',
      fontWeight: 600,
    },
  };
  
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h2>Select a Slot</h2>
          <p style={styles.subtitle}>Choose your preferred date and time</p>
          <button style={styles.closeButton} onClick={onCancel}>✕</button>
        </div>
        
        {/* Main Content */}
        <div style={styles.content}>
          {/* LEFT: Calendar Date Picker */}
          <div style={styles.section}>
            <h3>Select Date</h3>
            <div style={styles.dateGrid}>
              {dateRange.map((dateString) => (
                <button
                  key={dateString}
                  style={{
                    ...styles.dateButton,
                    ...(selectedDate === dateString ? { backgroundColor: '#dbeafe', borderColor: '#2563eb' } : {}),
                    ...(hoveredKey === `date-${dateString}` && selectedDate !== dateString ? { backgroundColor: '#f8fafc' } : {}),
                  }}
                  onClick={() => handleDateSelect(dateString)}
                  onMouseEnter={() => setHoveredKey(`date-${dateString}`)}
                  onMouseLeave={() => setHoveredKey('')}
                >
                  <div style={styles.dateDay}>{getDayName(dateString).substring(0, 3)}</div>
                  <div style={styles.dateNum}>
                    {new Date(dateString + 'T00:00:00').getUTCDate()}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* RIGHT: Time Slot Selector */}
          <div style={styles.section}>
            {selectedDate ? (
              <>
                <h3>Available Slots on {formatDate(selectedDate)}</h3>
                
                {availableSlots.length === 0 ? (
                  <div style={styles.noSlots}>
                    <p>No available slots on {dayName}</p>
                    <p style={styles.hint}>Please select another date</p>
                  </div>
                ) : (
                  <div style={styles.slotList}>
                    {availableSlots.map((timeBlock) => (
                      // Show explicit selected state so users can clearly see chosen slot.
                      <button
                        key={timeBlock.id}
                        style={{
                          ...styles.slotButton,
                          ...(timeBlock.slotsLeft === 0 ? { backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' } : { backgroundColor: '#ecfdf5', borderColor: '#86efac' }),
                          ...(selectedTimeSlot?.id === timeBlock.id ? { borderColor: '#16a34a', boxShadow: 'inset 0 0 0 1px #16a34a' } : {}),
                        }}
                        onClick={() => handleSlotSelect(timeBlock)}
                        disabled={timeBlock.slotsLeft === 0}
                        aria-pressed={selectedTimeSlot?.id === timeBlock.id}
                      >
                        <div style={styles.slotTime}>
                          {timeBlock.startTime} - {timeBlock.endTime}
                        </div>
                        <div style={styles.slotInfo}>
                          {timeBlock.slotsLeft > 0 ? (
                            <>
                              <span style={styles.slotsCount}>
                                {timeBlock.slotsLeft} of {timeBlock.capacity} slots left
                              </span>
                              {selectedTimeSlot?.id === timeBlock.id && (
                                <span style={styles.selectedIndicator} aria-hidden="true">
                                  ✓ Selected
                                </span>
                              )}
                            </>
                          ) : (
                            <span style={styles.fullText}>FULL</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={styles.placeholder}>
                <p>👈 Select a date to view available slots</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Selection Summary and Confirm Button */}
        {selectedDate && selectedTimeSlot && (
          <div style={styles.confirmationBar}>
            <div>
              <p>
                <strong>✓ Selected:</strong> {formatDate(selectedDate)} at{' '}
                {selectedTimeSlot.startTime}
              </p>
            </div>
            <button
              style={{
                ...styles.confirmButton,
                backgroundColor: hoveredKey === 'confirm-slot' ? '#1d4ed8' : '#2563eb',
              }}
              onClick={handleConfirm}
              onMouseEnter={() => setHoveredKey('confirm-slot')}
              onMouseLeave={() => setHoveredKey('')}
            >
              Confirm & Continue to Payment
            </button>
          </div>
        )}
        
        {/* Show message if partial selection */}
        {selectedDate && !selectedTimeSlot && (
          <div style={styles.hintBar}>
            <p>⏰ Please select a time slot above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotSelectionModal;
