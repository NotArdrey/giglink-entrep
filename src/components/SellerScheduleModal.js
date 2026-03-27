import { useState } from 'react';
// Note: Nested data structure used here is Days > Time Blocks > Slot Capacity via schedules[providerId].dayBlocks[day].
// Note: Uses inline style objects and camelCase handlers for dynamic UI.


const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function SellerScheduleModal({
  isOpen,
  onClose,
  providers,
  selectedProviderId,
  onSelectProvider,
  schedules,
  onUpdateSchedule,
}) {
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('15:00');
  const [maxSlots, setMaxSlots] = useState(4);
  const [editingBlock, setEditingBlock] = useState(null);
  const [hoveredButton, setHoveredButton] = useState('');

  if (!isOpen) return null;

  const currentSchedule = schedules[selectedProviderId] || {
    manualScheduling: false,
    operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    dayBlocks: {},
  };

  const allBlocks = DAYS.flatMap((day) =>
    (currentSchedule.dayBlocks[day] || []).map((block) => ({
      day,
      ...block,
    }))
  );

  const toggleOperatingDay = (day) => {
    const hasDay = currentSchedule.operatingDays.includes(day);
    const updatedDays = hasDay
      ? currentSchedule.operatingDays.filter((existingDay) => existingDay !== day)
      : [...currentSchedule.operatingDays, day];

    onUpdateSchedule(selectedProviderId, {
      ...currentSchedule,
      operatingDays: updatedDays,
    });
  };

  const handleManualToggle = () => {
    onUpdateSchedule(selectedProviderId, {
      ...currentSchedule,
      manualScheduling: !currentSchedule.manualScheduling,
    });
  };

  const resetBlockForm = () => {
    setSelectedDay('Mon');
    setStartTime('13:00');
    setEndTime('15:00');
    setMaxSlots(4);
    setEditingBlock(null);
  };

  const handleAddOrUpdateBlock = () => {
    if (!startTime || !endTime || Number(maxSlots) < 1) return;

    const currentDayBlocks = currentSchedule.dayBlocks[selectedDay] || [];
    let updatedDayBlocks = [];

    if (editingBlock) {
      updatedDayBlocks = currentDayBlocks.map((block) => {
        if (block.id !== editingBlock.id) return block;

        const newCapacity = Number(maxSlots);
        return {
          ...block,
          startTime,
          endTime,
          capacity: newCapacity,
          slotsLeft: Math.min(block.slotsLeft, newCapacity),
        };
      });
    } else {
      updatedDayBlocks = [
        ...currentDayBlocks,
        {
          id: `block-${Date.now()}`,
          startTime,
          endTime,
          capacity: Number(maxSlots),
          slotsLeft: Number(maxSlots),
        },
      ];
    }

    onUpdateSchedule(selectedProviderId, {
      ...currentSchedule,
      operatingDays: currentSchedule.operatingDays.includes(selectedDay)
        ? currentSchedule.operatingDays
        : [...currentSchedule.operatingDays, selectedDay],
      dayBlocks: {
        ...currentSchedule.dayBlocks,
        [selectedDay]: updatedDayBlocks,
      },
    });

    resetBlockForm();
  };

  const handleEditBlock = (row) => {
    setSelectedDay(row.day);
    setStartTime(row.startTime);
    setEndTime(row.endTime);
    setMaxSlots(row.capacity);
    setEditingBlock({ id: row.id, day: row.day });
  };

  const handleDeleteBlock = (row) => {
    const currentDayBlocks = currentSchedule.dayBlocks[row.day] || [];
    const updatedDayBlocks = currentDayBlocks.filter((block) => block.id !== row.id);

    onUpdateSchedule(selectedProviderId, {
      ...currentSchedule,
      dayBlocks: {
        ...currentSchedule.dayBlocks,
        [row.day]: updatedDayBlocks,
      },
    });

    if (editingBlock && editingBlock.id === row.id) {
      resetBlockForm();
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 250,
      padding: '1rem',
    },
    content: {
      backgroundColor: '#ffffff',
      width: 'min(94vw, 880px)',
      maxHeight: '92vh',
      overflowY: 'auto',
      borderRadius: '0.85rem',
      boxShadow: '0 18px 34px rgba(15, 23, 42, 0.25)',
      padding: '1.2rem',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.9rem',
    },
    close: {
      position: 'absolute',
      right: '0.8rem',
      top: '0.8rem',
      border: '1px solid #cbd5e1',
      borderRadius: '999px',
      width: '32px',
      height: '32px',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
    },
    title: { margin: 0, fontSize: '1.4rem', color: '#0f172a' },
    sectionCard: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.65rem',
      padding: '0.8rem',
      backgroundColor: '#f8fafc',
    },
    input: {
      width: '100%',
      border: '1px solid #cbd5e1',
      borderRadius: '0.45rem',
      padding: '0.45rem 0.55rem',
      backgroundColor: '#ffffff',
      marginTop: '0.3rem',
    },
    dayGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))',
      gap: '0.5rem',
      marginTop: '0.4rem',
    },
    dayLabel: {
      display: 'flex',
      gap: '0.4rem',
      alignItems: 'center',
      border: '1px solid #cbd5e1',
      borderRadius: '0.45rem',
      padding: '0.35rem 0.45rem',
      backgroundColor: '#ffffff',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
      gap: '0.5rem',
      marginTop: '0.45rem',
    },
    formActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.6rem',
      flexWrap: 'wrap',
    },
    button: {
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.52rem 0.8rem',
      color: '#ffffff',
      cursor: 'pointer',
      fontWeight: 700,
    },
    list: { display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' },
    item: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '0.5rem',
      flexWrap: 'wrap',
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      backgroundColor: '#ffffff',
      padding: '0.55rem',
    },
    itemMain: { display: 'flex', gap: '0.7rem', flexWrap: 'wrap', color: '#334155' },
    itemActions: { display: 'flex', gap: '0.45rem' },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <button style={styles.close} onClick={onClose} aria-label="Close setup">
          x
        </button>

        <h2 style={styles.title}>Service Scheduling Setup</h2>

        <div style={styles.sectionCard}>
          <label htmlFor="workerSelect">Worker Profile</label>
          <select
            id="workerSelect"
            value={selectedProviderId}
            onChange={(event) => onSelectProvider(Number(event.target.value))}
            style={styles.input}
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ ...styles.sectionCard, display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <label htmlFor="manualScheduling">Manual Scheduling</label>
          <input
            id="manualScheduling"
            type="checkbox"
            checked={currentSchedule.manualScheduling}
            onChange={handleManualToggle}
          />
        </div>

        <div style={styles.sectionCard}>
          <h3>Operating Days</h3>
          <div style={styles.dayGrid}>
            {DAYS.map((day) => (
              <label key={day} style={styles.dayLabel}>
                <input
                  type="checkbox"
                  checked={currentSchedule.operatingDays.includes(day)}
                  onChange={() => toggleOperatingDay(day)}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.sectionCard}>
          <h3>{editingBlock ? 'Edit Time Block' : 'Add Time Block'}</h3>
          <div style={styles.formGrid}>
            <select value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)} style={styles.input}>
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} style={styles.input} />
            <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} style={styles.input} />
            <input
              type="number"
              min="1"
              value={maxSlots}
              onChange={(event) => setMaxSlots(Number(event.target.value))}
              placeholder="Max slots"
              style={styles.input}
            />
          </div>
          <div style={styles.formActions}>
            <button
              style={{ ...styles.button, backgroundColor: hoveredButton === 'add' ? '#1d4ed8' : '#2563eb' }}
              onMouseEnter={() => setHoveredButton('add')}
              onMouseLeave={() => setHoveredButton('')}
              onClick={handleAddOrUpdateBlock}
            >
              {editingBlock ? 'Save Block' : 'Add Time Block'}
            </button>
            {editingBlock && (
              <button
                style={{ ...styles.button, backgroundColor: '#64748b' }}
                onClick={resetBlockForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div style={styles.sectionCard}>
          <h3>Current Time Blocks</h3>
          {allBlocks.length === 0 ? (
            <p style={{ color: '#64748b' }}>No time blocks yet. Add one to start accepting bookings.</p>
          ) : (
            <div style={styles.list}>{allBlocks.map((row) => (
              <div key={row.id} style={styles.item}>
                <div style={styles.itemMain}>
                  <strong>{row.day}</strong>
                  <span>
                    {row.startTime} - {row.endTime}
                  </span>
                  <span>{row.slotsLeft} / {row.capacity} slots left</span>
                </div>
                <div style={styles.itemActions}>
                  <button style={{ ...styles.button, backgroundColor: '#2563eb' }} onClick={() => handleEditBlock(row)}>Edit</button>
                  <button style={{ ...styles.button, backgroundColor: '#dc2626' }} onClick={() => handleDeleteBlock(row)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerScheduleModal;
