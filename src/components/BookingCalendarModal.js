import { useEffect, useState } from 'react';
// Note: Nested data structure is read as schedule.dayBlocks[dayKey] where each block stores capacity and slotsLeft.
// Note: Available slots use Emerald Green and full slots use Light Gray per requirement.
import '../styles/BookingCalendarModal.css';

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonthHeading(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatLongDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    weekday: 'long',
  }).format(date);
}

function getMonthCells(monthDate) {
  const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startOffset = startOfMonth.getDay();
  const firstGridDate = new Date(startOfMonth);
  firstGridDate.setDate(startOfMonth.getDate() - startOffset);

  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(firstGridDate);
    cellDate.setDate(firstGridDate.getDate() + index);
    cells.push({
      date: cellDate,
      isCurrentMonth: cellDate.getMonth() === monthDate.getMonth(),
    });
  }

  return cells;
}

function formatTime(time24) {
  const [hourString, minute] = time24.split(':');
  const hour = Number(hourString);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${suffix}`;
}

function getDayKeyFromDate(dateString) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  return DAY_KEYS[date.getDay()];
}

function getDateMeta(schedule, dateValue) {
  if (!schedule || !dateValue) {
    return {
      canBookDate: false,
      slotCount: 0,
      isOperatingDay: false,
      dayBlocks: [],
      manualScheduling: false,
    };
  }

  const dayKey = getDayKeyFromDate(dateValue);
  const isOperatingDay = dayKey ? schedule.operatingDays.includes(dayKey) : false;
  const dayBlocks = !dayKey || !isOperatingDay ? [] : (schedule.dayBlocks[dayKey] || []);

  if (!isOperatingDay) {
    return {
      canBookDate: false,
      slotCount: 0,
      isOperatingDay,
      dayBlocks,
      manualScheduling: schedule.manualScheduling,
    };
  }

  if (schedule.manualScheduling) {
    return {
      canBookDate: true,
      slotCount: 1,
      isOperatingDay,
      dayBlocks,
      manualScheduling: true,
    };
  }

  const slotCount = dayBlocks.reduce((sum, block) => sum + Math.max(0, block.slotsLeft || 0), 0);
  return {
    canBookDate: slotCount > 0,
    slotCount,
    isOperatingDay,
    dayBlocks,
    manualScheduling: false,
  };
}

function BookingCalendarModal({ isOpen, onClose, worker, schedule, onConfirmBooking }) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate('');
      setSelectedBlockId('');
      setIsConfirmModalOpen(false);
      const now = new Date();
      setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    }
  }, [isOpen, worker?.id]);

  if (!isOpen || !worker || !schedule) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthCells = getMonthCells(visibleMonth);

  const selectedDayKey = getDayKeyFromDate(selectedDate);
  const selectedDateMeta = getDateMeta(schedule, selectedDate);
  const isOperatingDay = selectedDateMeta.isOperatingDay;
  const dayBlocks = selectedDateMeta.dayBlocks;

  const selectedBlock = dayBlocks.find((block) => block.id === selectedBlockId);
  const canConfirmManual = schedule.manualScheduling && Boolean(selectedDate);
  const canConfirmFixed = !schedule.manualScheduling && Boolean(selectedDate) && selectedBlock && selectedBlock.slotsLeft > 0;
  const canOpenConfirm = canConfirmManual || canConfirmFixed;

  const selectDateFromCell = (dateValue) => {
    const dateMeta = getDateMeta(schedule, dateValue);
    if (!dateMeta.canBookDate) return;
    setSelectedDate(dateValue);
    setSelectedBlockId('');
  };

  const handleConfirm = () => {
    onConfirmBooking({
      workerId: worker.id,
      date: selectedDate,
      dayKey: selectedDayKey,
      blockId: selectedBlockId,
      manualScheduling: schedule.manualScheduling,
    });

    setSelectedDate('');
    setSelectedBlockId('');
    setIsConfirmModalOpen(false);
  };

  const handleOpenConfirm = () => {
    if (!canOpenConfirm) return;
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="calendar-modal-overlay">
      <div className="calendar-modal-content">
        <button className="calendar-close-button" onClick={onClose} aria-label="Close booking calendar">
          x
        </button>

        <h2 className="calendar-title">Book with {worker.name}</h2>

        <div className="month-nav-row">
          <button
            className="month-nav-btn"
            onClick={() => {
              const prev = new Date(visibleMonth);
              prev.setMonth(prev.getMonth() - 1);
              setVisibleMonth(prev);
            }}
          >
            ←
          </button>
          <h3 className="month-heading">{formatMonthHeading(visibleMonth)}</h3>
          <button
            className="month-nav-btn"
            onClick={() => {
              const next = new Date(visibleMonth);
              next.setMonth(next.getMonth() + 1);
              setVisibleMonth(next);
            }}
          >
            →
          </button>
        </div>

        <div className="calendar-grid-wrap">
          <div className="calendar-week-headings">
            {DAY_LABELS.map((dayLabel) => (
              <div key={dayLabel} className="calendar-week-heading">{dayLabel}</div>
            ))}
          </div>

          <div className="calendar-date-grid">
            {monthCells.map((cell) => {
              const dateValue = formatDateValue(cell.date);
              const dateMeta = getDateMeta(schedule, dateValue);
              const isPast = cell.date < today;
              const isDisabled = !cell.isCurrentMonth || isPast || !dateMeta.canBookDate;
              const isSelected = selectedDate === dateValue;

              return (
                <button
                  key={dateValue}
                  className={`calendar-day-cell ${
                    cell.isCurrentMonth ? 'current-month' : 'adjacent-month'
                  } ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                  disabled={isDisabled}
                  onClick={() => selectDateFromCell(dateValue)}
                >
                  <span className="day-number">{cell.date.getDate()}</span>
                  <span className="day-slots">
                    {dateMeta.manualScheduling ? 'Open' : `${dateMeta.slotCount} slots`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="selected-date-label">
          {selectedDate ? `Selected Date: ${formatLongDate(selectedDate)}` : 'Select an available date to continue.'}
        </p>

        {schedule.manualScheduling ? (
          <div className="manual-scheduling-note">
            Worker uses manual scheduling. Pick a date and they will confirm an exact time via chat.
          </div>
        ) : (
          <div className="slot-section">
            <h3>Available Time Slots</h3>
            {!selectedDate && <p className="slot-helper-text">Pick a date to view available slots.</p>}
            {selectedDate && !isOperatingDay && (
              <p className="slot-helper-text">No availability on this day.</p>
            )}
            {selectedDate && isOperatingDay && dayBlocks.length === 0 && (
              <p className="slot-helper-text">No time blocks configured for this day.</p>
            )}

            <div className="slot-list-grid">
              {dayBlocks.map((block) => {
                const isFull = block.slotsLeft <= 0;
                const isSelected = selectedBlockId === block.id;
                return (
                  <button
                    key={block.id}
                    className={`calendar-slot ${isFull ? 'full' : 'available'} ${isSelected ? 'selected' : ''}`}
                    disabled={isFull}
                    onClick={() => setSelectedBlockId(block.id)}
                    aria-pressed={isSelected}
                  >
                    <span className="calendar-slot-label">
                      {formatTime(block.startTime)} - {formatTime(block.endTime)} [{block.slotsLeft} slots left]
                    </span>
                    {isSelected && <span className="calendar-slot-check">✓ Selected</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          className="calendar-confirm-button"
          onClick={handleOpenConfirm}
          disabled={!canOpenConfirm}
        >
          Confirm Booking
        </button>

        {isConfirmModalOpen && (
          <div className="booking-confirm-overlay">
            <div className="booking-confirm-content">
              <h3>Confirm Booking Request</h3>
              <p>
                <strong>Worker:</strong> {worker.name}
              </p>
              <p>
                <strong>Date:</strong> {formatLongDate(selectedDate)}
              </p>
              {!schedule.manualScheduling && selectedBlock && (
                <p>
                  <strong>Time Slot:</strong> {formatTime(selectedBlock.startTime)} - {formatTime(selectedBlock.endTime)}
                </p>
              )}
              {schedule.manualScheduling && (
                <p className="confirm-note">Time slot will be confirmed by the worker via chat.</p>
              )}

              <div className="confirm-actions">
                <button className="confirm-cancel-btn" onClick={() => setIsConfirmModalOpen(false)}>
                  Cancel
                </button>
                <button className="confirm-submit-btn" onClick={handleConfirm}>
                  Submit Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingCalendarModal;
