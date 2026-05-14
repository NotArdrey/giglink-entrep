import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// Note: Nested data structure is read as schedule.dayBlocks[dayKey] where each block stores capacity and slotsLeft.
// Note: Available slots use Emerald Green and full slots use Light Gray per requirement.


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

  // Prefer exact-date slots when available (keys like '2026-05-12')
  const exactBlocks = schedule.dayBlocks && schedule.dayBlocks[dateValue];
  if (exactBlocks) {
    const slotCountExact = exactBlocks.reduce((sum, block) => sum + Math.max(0, block.slotsLeft || 0), 0);
    return {
      canBookDate: slotCountExact > 0 || schedule.manualScheduling,
      slotCount: slotCountExact || (schedule.manualScheduling ? 1 : 0),
      isOperatingDay: true,
      dayBlocks: exactBlocks,
      manualScheduling: schedule.manualScheduling,
    };
  }

  const dayKey = getDayKeyFromDate(dateValue);
  const isOperatingDay = dayKey ? (schedule.operatingDays || []).includes(dayKey) : false;
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
  const [hoveredButton, setHoveredButton] = useState('');

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

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 260,
      padding: '1rem',
    },
    content: {
      width: 'min(95vw, 860px)',
      maxHeight: '92vh',
      overflowY: 'auto',
      backgroundColor: 'var(--gl-surface)',
      borderRadius: '8px',
      boxShadow: '0 20px 42px rgba(15, 23, 42, 0.28)',
      padding: '0.8rem',
      position: 'relative',
      color: 'var(--gl-text)',
    },
    close: {
      position: 'absolute',
      right: '0.75rem',
      top: '0.75rem',
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      border: '1px solid var(--gl-border-strong)',
      backgroundColor: 'var(--gl-surface)',
      color: 'var(--gl-text)',
      cursor: 'pointer',
    },
    title: { marginTop: '0.1rem', marginBottom: '0.6rem' },
    monthNavRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem' },
    monthButton: {
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      border: '1px solid var(--gl-border-strong)',
      backgroundColor: 'var(--gl-surface)',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--gl-text-2)',
      padding: 0,
    },
    monthHeading: { margin: 0 },
    gridWrap: { marginTop: '0.5rem', border: '1px solid var(--gl-border)', borderRadius: '8px', overflow: 'hidden' },
    weekHeadings: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'var(--gl-surface-2)' },
    weekHeading: { padding: '0.35rem', fontWeight: 700, fontSize: '0.78rem', textAlign: 'center', color: 'var(--gl-text-2)' },
    dateGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' },
    dayCell: {
      minHeight: '64px',
      border: '1px solid var(--gl-border)',
      backgroundColor: 'var(--gl-surface)',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: '0.3rem',
    },
    dayNumber: { fontWeight: 700 },
    daySlots: { fontSize: '0.72rem', color: 'var(--gl-text-2)' },
    selectedDateLabel: { margin: '0.55rem 0', color: 'var(--gl-text-2)' },
    note: { borderRadius: '8px', backgroundColor: 'var(--gl-accent-soft)', color: 'var(--gl-blue)', padding: '0.65rem 0.75rem' },
    slotSection: { borderTop: '1px solid var(--gl-border)', paddingTop: '0.55rem' },
    helper: { color: 'var(--gl-text-3)', margin: '0.3rem 0' },
    slotGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.45rem', marginTop: '0.45rem' },
    slotButton: {
      border: '1px solid var(--gl-border-strong)',
      borderRadius: '8px',
      backgroundColor: 'var(--gl-surface)',
      padding: '0.6rem',
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    confirmButton: {
      marginTop: '0.6rem',
      width: '100%',
      border: 'none',
      borderRadius: '8px',
      padding: '0.62rem 0.85rem',
      fontWeight: 700,
      color: '#ffffff',
      cursor: 'pointer',
      backgroundColor: 'var(--gl-blue)',
      position: 'sticky',
      bottom: 0,
      zIndex: 2,
      boxShadow: '0 -6px 14px rgba(15, 23, 42, 0.06)',
    },
    confirmOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 280,
    },
    confirmContent: {
      width: 'min(92vw, 470px)',
      backgroundColor: 'var(--gl-surface)',
      borderRadius: '8px',
      border: '1px solid var(--gl-border)',
      padding: '1rem',
    },
    confirmActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.8rem' },
    cancelButton: { border: '1px solid var(--gl-border-strong)', borderRadius: '8px', backgroundColor: 'var(--gl-surface)', color: 'var(--gl-text)', padding: '0.5rem 0.8rem', cursor: 'pointer' },
    submitButton: { border: 'none', borderRadius: '8px', backgroundColor: 'var(--gl-blue)', color: '#ffffff', padding: '0.5rem 0.8rem', cursor: 'pointer' },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <button style={styles.close} onClick={onClose} aria-label="Close booking calendar">
          {'\u00D7'}
        </button>

        <h2 style={styles.title}>Book with {worker.name}</h2>

        <div style={styles.monthNavRow}>
          <button
            type="button"
            style={styles.monthButton}
            onClick={() => {
              const prev = new Date(visibleMonth);
              prev.setMonth(prev.getMonth() - 1);
              setVisibleMonth(prev);
            }}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <h3 style={styles.monthHeading}>{formatMonthHeading(visibleMonth)}</h3>
          <button
            type="button"
            style={styles.monthButton}
            onClick={() => {
              const next = new Date(visibleMonth);
              next.setMonth(next.getMonth() + 1);
              setVisibleMonth(next);
            }}
            aria-label="Next month"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div style={styles.gridWrap}>
          <div style={styles.weekHeadings}>
            {DAY_LABELS.map((dayLabel) => (
              <div key={dayLabel} style={styles.weekHeading}>{dayLabel}</div>
            ))}
          </div>

          <div style={styles.dateGrid}>
            {monthCells.map((cell) => {
              const dateValue = formatDateValue(cell.date);
              const dateMeta = getDateMeta(schedule, dateValue);
              const isPast = cell.date < today;
              const isDisabled = !cell.isCurrentMonth || isPast || !dateMeta.canBookDate;
              const isSelected = selectedDate === dateValue;

              return (
                <button
                  key={dateValue}
                  style={{
                    ...styles.dayCell,
                    ...(cell.isCurrentMonth ? {} : { backgroundColor: 'var(--gl-surface-2)', color: 'var(--gl-text-3)' }),
                    ...(isSelected ? { border: '1px solid var(--gl-blue)', backgroundColor: 'var(--gl-accent-soft)' } : {}),
                    ...(isDisabled ? { cursor: 'not-allowed', opacity: 0.6 } : {}),
                  }}
                  disabled={isDisabled}
                  onClick={() => selectDateFromCell(dateValue)}
                >
                  <span style={styles.dayNumber}>{cell.date.getDate()}</span>
                  <span style={styles.daySlots}>
                    {dateMeta.manualScheduling ? 'Open' : `${dateMeta.slotCount} slots`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p style={styles.selectedDateLabel}>
          {selectedDate ? `Selected Date: ${formatLongDate(selectedDate)}` : 'Select an available date to continue.'}
        </p>

        {schedule.manualScheduling ? (
          <div style={styles.note}>
            Worker uses manual scheduling. Pick a date and they will confirm an exact time via chat.
          </div>
        ) : (
          <div style={styles.slotSection}>
            <h3>Available Time Slots</h3>
            {!selectedDate && <p style={styles.helper}>Pick a date to view available slots.</p>}
            {selectedDate && !isOperatingDay && (
              <p style={styles.helper}>No availability on this day.</p>
            )}
            {selectedDate && isOperatingDay && dayBlocks.length === 0 && (
              <p style={styles.helper}>No time blocks configured for this day.</p>
            )}

            <div style={styles.slotGrid}>
              {dayBlocks.map((block) => {
                const isFull = block.slotsLeft <= 0;
                const isSelected = selectedBlockId === block.id;
                return (
                  <button
                    key={block.id}
                    style={{
                      ...styles.slotButton,
                      ...(isFull ? { backgroundColor: 'var(--gl-surface-2)', color: 'var(--gl-text-3)' } : { backgroundColor: 'var(--gl-success-soft)', borderColor: 'var(--gl-success-border)' }),
                      ...(isSelected ? { borderColor: 'var(--gl-green)', boxShadow: 'inset 0 0 0 1px var(--gl-green)' } : {}),
                    }}
                    disabled={isFull}
                    onClick={() => setSelectedBlockId(block.id)}
                    aria-pressed={isSelected}
                  >
                    <span>
                      {formatTime(block.startTime)} - {formatTime(block.endTime)} [{block.slotsLeft} slots left]
                    </span>
                    {isSelected && <span style={{ color: 'var(--gl-green)', fontWeight: 700 }}>- Selected</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          style={{
            ...styles.confirmButton,
            ...(canOpenConfirm ? { backgroundColor: hoveredButton === 'confirm' ? 'var(--gl-blue-2)' : 'var(--gl-blue)' } : { backgroundColor: '#94a3b8', cursor: 'not-allowed' }),
          }}
          onClick={handleOpenConfirm}
          disabled={!canOpenConfirm}
          onMouseEnter={() => setHoveredButton('confirm')}
          onMouseLeave={() => setHoveredButton('')}
        >
          Confirm Booking
        </button>

        {isConfirmModalOpen && (
          <div style={styles.confirmOverlay}>
            <div style={styles.confirmContent}>
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
                <p style={styles.note}>Time slot will be confirmed by the worker via chat.</p>
              )}

              <div style={styles.confirmActions}>
                <button style={styles.cancelButton} onClick={() => setIsConfirmModalOpen(false)}>
                  Cancel
                </button>
                <button style={styles.submitButton} onClick={handleConfirm}>
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
