import { useState } from 'react';
// Note: Nested data structure used here is Days > Time Blocks > Slot Capacity via schedules[providerId].dayBlocks[day].
// Note: Using className and camelCase handlers with external CSS from styles/.
import '../styles/SellerScheduleModal.css';

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

  return (
    <div className="schedule-modal-overlay">
      <div className="schedule-modal-content">
        <button className="schedule-modal-close" onClick={onClose} aria-label="Close setup">
          x
        </button>

        <h2 className="schedule-modal-title">Service Scheduling Setup</h2>

        <div className="schedule-worker-select">
          <label htmlFor="workerSelect">Worker Profile</label>
          <select
            id="workerSelect"
            value={selectedProviderId}
            onChange={(event) => onSelectProvider(Number(event.target.value))}
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div className="manual-toggle-row">
          <label htmlFor="manualScheduling">Manual Scheduling</label>
          <input
            id="manualScheduling"
            type="checkbox"
            checked={currentSchedule.manualScheduling}
            onChange={handleManualToggle}
          />
        </div>

        <div className="operating-days">
          <h3>Operating Days</h3>
          <div className="day-checkbox-grid">
            {DAYS.map((day) => (
              <label key={day} className="day-checkbox-item">
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

        <div className="slot-creator">
          <h3>{editingBlock ? 'Edit Time Block' : 'Add Time Block'}</h3>
          <div className="slot-form-grid">
            <select value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)}>
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
            <input
              type="number"
              min="1"
              value={maxSlots}
              onChange={(event) => setMaxSlots(Number(event.target.value))}
              placeholder="Max slots"
            />
          </div>
          <div className="slot-form-actions">
            <button className="slot-add-button" onClick={handleAddOrUpdateBlock}>
              {editingBlock ? 'Save Block' : 'Add Time Block'}
            </button>
            {editingBlock && (
              <button className="slot-cancel-button" onClick={resetBlockForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div className="slot-list">
          <h3>Current Time Blocks</h3>
          {allBlocks.length === 0 ? (
            <p className="slot-empty-text">No time blocks yet. Add one to start accepting bookings.</p>
          ) : (
            allBlocks.map((row) => (
              <div key={row.id} className="slot-list-item">
                <div className="slot-list-main">
                  <strong>{row.day}</strong>
                  <span>
                    {row.startTime} - {row.endTime}
                  </span>
                  <span>{row.slotsLeft} / {row.capacity} slots left</span>
                </div>
                <div className="slot-list-actions">
                  <button onClick={() => handleEditBlock(row)}>Edit</button>
                  <button className="delete" onClick={() => handleDeleteBlock(row)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerScheduleModal;
