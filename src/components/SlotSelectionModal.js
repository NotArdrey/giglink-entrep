import React, { useState } from 'react';
import '../styles/SlotSelectionModal.css';

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
  
  return (
    <div className="slot-selection-overlay">
      <div className="slot-selection-card">
        {/* Header */}
        <div className="slot-header">
          <h2>Select a Slot</h2>
          <p className="slot-subtitle">Choose your preferred date and time</p>
          <button className="slot-close-btn" onClick={onCancel}>✕</button>
        </div>
        
        {/* Main Content */}
        <div className="slot-content">
          {/* LEFT: Calendar Date Picker */}
          <div className="slot-calendar-section">
            <h3>Select Date</h3>
            <div className="date-picker-grid">
              {dateRange.map((dateString) => (
                <button
                  key={dateString}
                  className={`date-picker-btn ${selectedDate === dateString ? 'active' : ''}`}
                  onClick={() => handleDateSelect(dateString)}
                >
                  <div className="date-day">{getDayName(dateString).substring(0, 3)}</div>
                  <div className="date-num">
                    {new Date(dateString + 'T00:00:00').getUTCDate()}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* RIGHT: Time Slot Selector */}
          <div className="slot-timeslot-section">
            {selectedDate ? (
              <>
                <h3>Available Slots on {formatDate(selectedDate)}</h3>
                
                {availableSlots.length === 0 ? (
                  <div className="no-slots-message">
                    <p>No available slots on {dayName}</p>
                    <p className="hint">Please select another date</p>
                  </div>
                ) : (
                  <div className="timeslot-list">
                    {availableSlots.map((timeBlock) => (
                      // Show explicit selected state so users can clearly see chosen slot.
                      <button
                        key={timeBlock.id}
                        className={`timeslot-btn ${
                          timeBlock.slotsLeft === 0 ? 'full' : 'available'
                        } ${
                          selectedTimeSlot?.id === timeBlock.id ? 'selected' : ''
                        }`}
                        onClick={() => handleSlotSelect(timeBlock)}
                        disabled={timeBlock.slotsLeft === 0}
                        aria-pressed={selectedTimeSlot?.id === timeBlock.id}
                      >
                        <div className="timeslot-time">
                          {timeBlock.startTime} - {timeBlock.endTime}
                        </div>
                        <div className="timeslot-slots">
                          {timeBlock.slotsLeft > 0 ? (
                            <>
                              <span className="slots-count">
                                {timeBlock.slotsLeft} of {timeBlock.capacity} slots left
                              </span>
                              {selectedTimeSlot?.id === timeBlock.id && (
                                <span className="slot-selected-indicator" aria-hidden="true">
                                  ✓ Selected
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="slots-full">FULL</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="slot-placeholder">
                <p>👈 Select a date to view available slots</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Selection Summary and Confirm Button */}
        {selectedDate && selectedTimeSlot && (
          <div className="slot-confirmation-bar">
            <div className="confirmation-summary">
              <p>
                <strong>✓ Selected:</strong> {formatDate(selectedDate)} at{' '}
                {selectedTimeSlot.startTime}
              </p>
            </div>
            <button
              className="btn-confirm-slot"
              onClick={handleConfirm}
            >
              Confirm & Continue to Payment
            </button>
          </div>
        )}
        
        {/* Show message if partial selection */}
        {selectedDate && !selectedTimeSlot && (
          <div className="slot-hint-bar">
            <p>⏰ Please select a time slot above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotSelectionModal;
