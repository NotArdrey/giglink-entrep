import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../shared/services/supabaseClient';
import {
  buildWeeklyScheduleFromSlots,
  createScheduleForProvider,
} from '../../marketplace/utils/serviceNormalizer';

const getDayKey = (dateString) => {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
};

const formatDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateRange = () => {
  const dates = [];
  const today = new Date();
  for (let index = 1; index <= 45; index += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() + index);
    dates.push(formatDateValue(date));
  }
  return dates;
};

const buildWorkerFromBooking = (booking = {}) => ({
  id: booking.workerId || booking.serviceId || booking.id,
  name: booking.workerName || 'Service Provider',
  actionType: 'book',
});

const SlotSelectionModal = ({ booking, onConfirmSlot, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [hoveredKey, setHoveredKey] = useState('');
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 720 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => setIsMobile(window.innerWidth <= 720);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSlots = async () => {
      if (!booking?.serviceId) {
        setSlots([]);
        setLoadError('This booking is missing a service ID, so live slots cannot be loaded.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError('');
        const { data, error } = await supabase
          .from('service_slots')
          .select('*')
          .eq('service_id', booking.serviceId)
          .gte('start_ts', new Date().toISOString())
          .order('start_ts', { ascending: true });

        if (error) throw error;
        if (mounted) setSlots(data || []);
      } catch (error) {
        if (mounted) setLoadError(error?.message || 'Unable to load available slots.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadSlots();
    return () => {
      mounted = false;
    };
  }, [booking?.serviceId]);

  const worker = useMemo(() => buildWorkerFromBooking(booking), [booking]);
  const schedule = useMemo(() => {
    if (!slots.length) return createScheduleForProvider(worker);
    return buildWeeklyScheduleFromSlots(slots, worker);
  }, [slots, worker]);

  const availableDates = useMemo(() => {
    const dateRange = getDateRange();
    return dateRange.map((dateString) => {
      const blocks = schedule.dayBlocks?.[dateString] || [];
      const slotsLeft = blocks.reduce((sum, block) => sum + Math.max(0, block.slotsLeft || 0), 0);
      return {
        dateString,
        slotsLeft,
        canSelect: slotsLeft > 0,
      };
    });
  }, [schedule]);

  const dayBlocks = selectedDate ? (schedule.dayBlocks?.[selectedDate] || []) : [];
  const selectedBlock = dayBlocks.find((block) => String(block.id) === String(selectedBlockId));

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    setSelectedBlockId('');
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedBlock) {
      setLoadError('Please select an available date and time slot.');
      return;
    }

    const rawSlot = selectedBlock.rawSlot || null;
    onConfirmSlot({
      date: selectedDate,
      displayDate: formatDate(selectedDate),
      dayName: getDayKey(selectedDate),
      dayKey: getDayKey(selectedDate),
      dateKey: selectedDate,
      blockId: selectedBlock.id,
      slotId: rawSlot?.id || selectedBlock.id,
      rawSlot,
      startTs: rawSlot?.start_ts || null,
      endTs: rawSlot?.end_ts || null,
      timeBlock: {
        id: selectedBlock.id,
        startTime: selectedBlock.startTime,
        endTime: selectedBlock.endTime,
        capacity: selectedBlock.capacity,
        slotsLeft: selectedBlock.slotsLeft,
        rawSlot,
      },
    });
  };

  const styles = {
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.54)', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', zIndex: 280, padding: isMobile ? '0.75rem' : '1rem', overflowY: 'auto' },
    card: { width: 'min(100%, 980px)', maxHeight: isMobile ? 'calc(100svh - 24px)' : '94vh', overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--gl-border)', backgroundColor: 'var(--gl-surface)', color: 'var(--gl-text)', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.25)' },
    header: { display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '0.75rem', padding: isMobile ? '0.75rem' : '0.85rem 1rem', borderBottom: '1px solid var(--gl-border)', backgroundColor: 'var(--gl-surface-2)' },
    subtitle: { margin: '0.2rem 0 0', color: 'var(--gl-text-3)' },
    closeButton: { width: '34px', height: '34px', borderRadius: '8px', border: '1px solid var(--gl-border-strong)', backgroundColor: 'var(--gl-surface)', color: 'var(--gl-text)', cursor: 'pointer' },
    content: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(260px, 1fr) minmax(320px, 1.2fr)', gap: '0.8rem', padding: isMobile ? '0.75rem' : '1rem' },
    section: { border: '1px solid var(--gl-border)', borderRadius: '8px', backgroundColor: 'var(--gl-surface)', padding: '0.75rem' },
    dateGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(74px, 100%), 1fr))', gap: '0.45rem', marginTop: '0.55rem' },
    dateButton: { border: '1px solid var(--gl-border-strong)', borderRadius: '8px', backgroundColor: 'var(--gl-surface)', cursor: 'pointer', padding: '0.45rem', textAlign: 'center', color: 'var(--gl-text)' },
    dateDay: { fontSize: '0.78rem', color: 'var(--gl-text-3)' },
    dateNum: { fontSize: '1.05rem', fontWeight: 700 },
    noSlots: { border: '1px dashed var(--gl-border-strong)', borderRadius: '8px', padding: '0.8rem', color: 'var(--gl-text-3)', textAlign: 'center' },
    hint: { marginTop: '0.2rem', fontSize: '0.86rem' },
    slotList: { display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.55rem' },
    slotButton: { border: '1px solid var(--gl-border-strong)', borderRadius: '8px', backgroundColor: 'var(--gl-surface)', padding: '0.6rem', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '0.5rem' },
    slotTime: { fontWeight: 700, color: 'var(--gl-text)' },
    slotInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
    slotsCount: { color: 'var(--gl-green)', fontSize: '0.84rem' },
    selectedIndicator: { color: 'var(--gl-green)', fontWeight: 700, fontSize: '0.82rem' },
    fullText: { color: 'var(--gl-text-3)', fontWeight: 700 },
    placeholder: { border: '1px dashed var(--gl-border-strong)', borderRadius: '8px', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gl-text-3)', textAlign: 'center', padding: '0.8rem' },
    confirmationBar: { display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--gl-border)', backgroundColor: 'var(--gl-accent-soft)', padding: isMobile ? '0.75rem' : '0.8rem 1rem', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row' },
    confirmButton: { border: 'none', borderRadius: '8px', backgroundColor: 'var(--gl-blue)', color: '#ffffff', fontWeight: 700, cursor: 'pointer', padding: '0.55rem 0.85rem', width: isMobile ? '100%' : 'auto' },
    hintBar: { borderTop: '1px solid var(--gl-border)', backgroundColor: 'var(--gl-surface-2)', color: 'var(--gl-text-3)', padding: '0.7rem 1rem', fontWeight: 600 },
    error: { margin: '0.75rem 1rem 0', color: 'var(--gl-red)', fontWeight: 700 },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0 }}>Select a Slot</h2>
            <p style={styles.subtitle}>Choose from live availability for {booking?.workerName || 'this provider'}</p>
          </div>
          <button type="button" style={styles.closeButton} onClick={onCancel} aria-label="Close slot selection">
            x
          </button>
        </div>

        {loadError && <p style={styles.error}>{loadError}</p>}

        {isLoading ? (
          <div style={styles.placeholder}>
            <p>Loading available slots...</p>
          </div>
        ) : (
          <div style={styles.content}>
            <div style={styles.section}>
              <h3>Select Date</h3>
              <div style={styles.dateGrid}>
                {availableDates.map(({ dateString, slotsLeft, canSelect }) => (
                  <button
                    key={dateString}
                    type="button"
                    style={{
                      ...styles.dateButton,
                      ...(selectedDate === dateString ? { backgroundColor: 'var(--gl-accent-soft)', borderColor: 'var(--gl-blue)' } : {}),
                      ...(hoveredKey === `date-${dateString}` && selectedDate !== dateString && canSelect ? { backgroundColor: 'var(--gl-surface-2)' } : {}),
                      ...(!canSelect ? { cursor: 'not-allowed', opacity: 0.55 } : {}),
                    }}
                    onClick={() => canSelect && handleDateSelect(dateString)}
                    onMouseEnter={() => setHoveredKey(`date-${dateString}`)}
                    onMouseLeave={() => setHoveredKey('')}
                    disabled={!canSelect}
                  >
                    <div style={styles.dateDay}>{getDayKey(dateString)}</div>
                    <div style={styles.dateNum}>
                      {new Date(`${dateString}T00:00:00`).getDate()}
                    </div>
                    <small>{slotsLeft} slot{slotsLeft === 1 ? '' : 's'}</small>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.section}>
              {selectedDate ? (
                <>
                  <h3>Available Slots on {formatDate(selectedDate)}</h3>
                  {dayBlocks.length === 0 ? (
                    <div style={styles.noSlots}>
                      <p>No available slots on {getDayKey(selectedDate)}</p>
                      <p style={styles.hint}>Please select another date.</p>
                    </div>
                  ) : (
                    <div style={styles.slotList}>
                      {dayBlocks.map((timeBlock) => {
                        const isFull = timeBlock.slotsLeft <= 0;
                        const isSelected = String(selectedBlockId) === String(timeBlock.id);
                        return (
                          <button
                            key={timeBlock.id}
                            type="button"
                            style={{
                              ...styles.slotButton,
                              ...(isFull ? { backgroundColor: 'var(--gl-surface-2)', color: 'var(--gl-text-3)', cursor: 'not-allowed' } : { backgroundColor: 'var(--gl-success-soft)', borderColor: 'var(--gl-success-border)' }),
                              ...(isSelected ? { borderColor: 'var(--gl-green)', boxShadow: 'inset 0 0 0 1px var(--gl-green)' } : {}),
                            }}
                            onClick={() => !isFull && setSelectedBlockId(timeBlock.id)}
                            disabled={isFull}
                            aria-pressed={isSelected}
                          >
                            <div style={styles.slotTime}>
                              {timeBlock.startTime} - {timeBlock.endTime}
                            </div>
                            <div style={styles.slotInfo}>
                              {isFull ? (
                                <span style={styles.fullText}>FULL</span>
                              ) : (
                                <>
                                  <span style={styles.slotsCount}>
                                    {timeBlock.slotsLeft} of {timeBlock.capacity} slots left
                                  </span>
                                  {isSelected && <span style={styles.selectedIndicator}>Selected</span>}
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div style={styles.placeholder}>
                  <p>Select a date to view live slots.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedDate && selectedBlock && (
          <div style={styles.confirmationBar}>
            <div>
              <p style={{ margin: 0 }}>
                <strong>Selected:</strong> {formatDate(selectedDate)} at {selectedBlock.startTime}
              </p>
            </div>
            <button
              type="button"
              style={{
                ...styles.confirmButton,
                backgroundColor: hoveredKey === 'confirm-slot' ? 'var(--gl-blue-2)' : 'var(--gl-blue)',
              }}
              onClick={handleConfirm}
              onMouseEnter={() => setHoveredKey('confirm-slot')}
              onMouseLeave={() => setHoveredKey('')}
            >
              Confirm and Continue
            </button>
          </div>
        )}

        {selectedDate && !selectedBlock && (
          <div style={styles.hintBar}>
            <p style={{ margin: 0 }}>Please select a time slot above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotSelectionModal;
