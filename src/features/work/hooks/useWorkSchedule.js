import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DAY_INDEX,
  DAY_ORDER,
  INITIAL_CALENDAR_AVAILABILITY,
  INITIAL_WEEKLY_SCHEDULE,
  addDays,
  buildSlotTimestamps,
  createServiceSlot,
  deleteServiceSlot,
  fetchSellerSlots,
  formatDateForDay,
  formatDateLabel,
  formatDateLong,
  getMonday,
  getSlotStatusColor,
  mapSlotRowToCalendarEntry,
  mapSlotsToSchedule,
  updateServiceSlot,
} from '../services/scheduleService';

export const useWorkSchedule = ({ sellerId, currentProfile } = {}) => {
  const [weeklySchedule, setWeeklySchedule] = useState(INITIAL_WEEKLY_SCHEDULE);
  const [calendarAvailability, setCalendarAvailability] = useState(INITIAL_CALENDAR_AVAILABILITY);
  const [weekOffset, setWeekOffset] = useState(0);
  const [editSlotModalOpen, setEditSlotModalOpen] = useState(false);
  const [editSlotData, setEditSlotData] = useState(null);
  const [editSlotDayKey, setEditSlotDayKey] = useState(null);
  const [editSlotId, setEditSlotId] = useState(null);
  const [slotModalType, setSlotModalType] = useState('edit');
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  const scheduleMode =
    (currentProfile?.bookingMode || 'with-slots').toLowerCase() === 'calendar-only'
      ? 'calendar-only'
      : 'with-slots';

  useEffect(() => {
    let isMounted = true;

    const loadSlots = async () => {
      if (!sellerId) {
        setWeeklySchedule(INITIAL_WEEKLY_SCHEDULE);
        setCalendarAvailability(INITIAL_CALENDAR_AVAILABILITY);
        return;
      }

      try {
        const slots = await fetchSellerSlots(sellerId);
        if (!isMounted) return;
        const mapped = mapSlotsToSchedule(slots);
        setCalendarAvailability(mapped.calendarAvailability);
        setWeeklySchedule(mapped.weeklySchedule);
      } catch (error) {
        console.warn('Failed to load seller slots', error);
      }
    };

    loadSlots();
    return () => {
      isMounted = false;
    };
  }, [sellerId]);

  const dayKeys = DAY_ORDER;
  const currentWeekMonday = useMemo(() => addDays(getMonday(new Date()), weekOffset * 7), [weekOffset]);
  const currentWeekSunday = useMemo(() => addDays(currentWeekMonday, 6), [currentWeekMonday]);
  const weekRangeLabel = `${formatDateLabel(currentWeekMonday)} - ${formatDateLabel(currentWeekSunday)}`;
  const weekDateByDay = useMemo(
    () => dayKeys.reduce((acc, day) => {
      acc[day] = addDays(currentWeekMonday, DAY_INDEX[day]);
      return acc;
    }, {}),
    [currentWeekMonday, dayKeys]
  );

  const getDateForDay = useCallback((dayKey) => formatDateForDay(currentWeekMonday, dayKey), [currentWeekMonday]);

  const closeSlotModal = useCallback(() => {
    setEditSlotModalOpen(false);
    setEditSlotData(null);
    setEditSlotDayKey(null);
    setEditSlotId(null);
    setSlotModalType('edit');
  }, []);

  const handleEditSlot = useCallback((dayKey, slotId) => {
    setSlotModalType('edit');

    if (scheduleMode === 'calendar-only') {
      const entry = calendarAvailability.find((item) => item.id === slotId);
      if (!entry) return;
      setEditSlotData(entry);
      setEditSlotDayKey(null);
      setEditSlotId(slotId);
      setEditSlotModalOpen(true);
      return;
    }

    const block = (weeklySchedule[dayKey] || []).find((item) => item.id === slotId);
    if (!block) return;
    setEditSlotData(block);
    setEditSlotDayKey(dayKey);
    setEditSlotId(slotId);
    setEditSlotModalOpen(true);
  }, [calendarAvailability, scheduleMode, weeklySchedule]);

  const handleSaveCalendarSlot = useCallback(async (updatedData) => {
    const currentService = currentProfile?.raw || null;

    if (slotModalType === 'add') {
      if (currentService && sellerId) {
        try {
          const inserted = await createServiceSlot({
            serviceId: currentService.id,
            sellerId,
            date: updatedData.date,
            startTime: '00:00',
            endTime: '23:59:59',
            capacity: updatedData.maxBookings || 1,
            note: updatedData.note || '',
          });
          setCalendarAvailability((prev) => [...prev, mapSlotRowToCalendarEntry(inserted)]);
          return;
        } catch (error) {
          console.error('Failed to create calendar service slot', error);
        }
      }

      return;
    }

    if (editSlotId && typeof editSlotId === 'number') {
      try {
        const existingEntry = calendarAvailability.find((item) => item.id === editSlotId);
        const existingMetadata = { ...(existingEntry?.raw?.metadata || {}) };
        delete existingMetadata.note;
        const nextMetadata = updatedData.note
          ? { ...existingMetadata, note: updatedData.note }
          : existingMetadata;
        const { startTs, endTs } = buildSlotTimestamps({
          date: updatedData.date,
          startTime: '00:00',
          endTime: '23:59:59',
        });
        const updatedRow = await updateServiceSlot({
          slotId: editSlotId,
          updates: {
            start_ts: startTs,
            end_ts: endTs,
            capacity: updatedData.maxBookings,
            note: updatedData.note || null,
            metadata: nextMetadata,
          },
        });
        setCalendarAvailability((prev) => prev.map((item) =>
          item.id === editSlotId ? mapSlotRowToCalendarEntry(updatedRow) : item
        ));
        return;
      } catch (error) {
        console.error('Failed to update calendar service slot', error);
      }
    }

    setCalendarAvailability((prev) =>
      prev.map((item) =>
        item.id === editSlotId
          ? {
              ...item,
              date: updatedData.date,
              maxBookings: updatedData.maxBookings,
              booked: Math.min(item.booked, updatedData.maxBookings),
              note: updatedData.note,
            }
          : item
      )
    );
  }, [calendarAvailability, currentProfile?.raw, editSlotId, sellerId, slotModalType]);

  const handleSaveWeeklySlot = useCallback(async (updatedData) => {
    const currentService = currentProfile?.raw || null;

    if (slotModalType === 'add') {
      if (currentService && sellerId && editSlotDayKey) {
        try {
          const inserted = await createServiceSlot({
            serviceId: currentService.id,
            sellerId,
            date: getDateForDay(editSlotDayKey),
            startTime: updatedData.startTime,
            endTime: updatedData.endTime,
            capacity: updatedData.capacity,
          });

          setWeeklySchedule((prev) => ({
            ...prev,
            [editSlotDayKey]: [
              ...(prev[editSlotDayKey] || []),
              {
                id: inserted.id,
                startTime: updatedData.startTime,
                endTime: updatedData.endTime,
                capacity: inserted.capacity || updatedData.capacity,
                slotsLeft: inserted.status === 'available' ? (inserted.capacity || updatedData.capacity) : 0,
                bookings: [],
                raw: inserted,
              },
            ],
          }));
        } catch (error) {
          console.error('Failed to add weekly service slot', error);
        }
      }

      return;
    }

    if (editSlotId && typeof editSlotId === 'number') {
      try {
        const sourceBlock = (weeklySchedule[editSlotDayKey] || []).find((item) => item.id === editSlotId);
        const sourceDate = sourceBlock?.raw?.start_ts ? String(sourceBlock.raw.start_ts).slice(0, 10) : null;
        const slotDate = sourceDate || getDateForDay(editSlotDayKey);
        const { startTs, endTs } = buildSlotTimestamps({
          date: slotDate,
          startTime: updatedData.startTime,
          endTime: updatedData.endTime,
        });
        const updatedRow = await updateServiceSlot({
          slotId: editSlotId,
          updates: {
            start_ts: startTs,
            end_ts: endTs,
            capacity: updatedData.capacity,
          },
        });

        setWeeklySchedule((prev) => ({
          ...prev,
          [editSlotDayKey]: (prev[editSlotDayKey] || []).map((item) =>
            item.id === editSlotId
              ? {
                  ...item,
                  startTime: updatedData.startTime,
                  endTime: updatedData.endTime,
                  capacity: updatedRow.capacity || updatedData.capacity,
                  slotsLeft: updatedRow.status === 'available'
                    ? (updatedRow.capacity || updatedData.capacity)
                    : Math.max(0, (updatedRow.capacity || updatedData.capacity) - (item.bookings || []).length),
                  raw: updatedRow,
                }
              : item
          ),
        }));
        return;
      } catch (error) {
        console.error('Failed to update weekly service slot', error);
      }
    }

    setWeeklySchedule((prev) => ({
      ...prev,
      [editSlotDayKey]: (prev[editSlotDayKey] || []).map((item) =>
        item.id === editSlotId
          ? {
              ...item,
              startTime: updatedData.startTime,
              endTime: updatedData.endTime,
              capacity: updatedData.capacity,
              slotsLeft: Math.max(0, updatedData.capacity - item.bookings.length),
            }
          : item
      ),
    }));
  }, [currentProfile?.raw, editSlotDayKey, editSlotId, getDateForDay, sellerId, slotModalType, weeklySchedule]);

  const handleSaveSlotEdit = useCallback(async (updatedData) => {
    if (scheduleMode === 'calendar-only') {
      await handleSaveCalendarSlot(updatedData);
    } else {
      await handleSaveWeeklySlot(updatedData);
    }
    closeSlotModal();
  }, [closeSlotModal, handleSaveCalendarSlot, handleSaveWeeklySlot, scheduleMode]);

  const handleDeleteSlot = useCallback((dayKey, slotId) => {
    if (scheduleMode === 'calendar-only') {
      const entry = calendarAvailability.find((item) => item.id === slotId);
      if (!entry) return;

      setDeleteConfirmTarget({
        mode: 'calendar-only',
        slotId,
        dayKey: null,
        label: `available date ${entry.date}`,
      });
      return;
    }

    const block = (weeklySchedule[dayKey] || []).find((item) => item.id === slotId);
    if (!block) return;

    setDeleteConfirmTarget({
      mode: 'with-slots',
      slotId,
      dayKey,
      label: `time slot ${dayKey} ${block.startTime}-${block.endTime}`,
    });
  }, [calendarAvailability, scheduleMode, weeklySchedule]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteConfirmTarget) return;

    const idToDelete = deleteConfirmTarget.slotId;

    const removeLocal = () => {
      if (deleteConfirmTarget.mode === 'calendar-only') {
        setCalendarAvailability((prev) => prev.filter((item) => item.id !== idToDelete));
      } else {
        setWeeklySchedule((prev) => ({
          ...prev,
          [deleteConfirmTarget.dayKey]: (prev[deleteConfirmTarget.dayKey] || []).filter(
            (item) => item.id !== idToDelete
          ),
        }));
      }
    };

    if (typeof idToDelete === 'number') {
      deleteServiceSlot(idToDelete)
        .catch((error) => {
          console.error('Failed to delete service slot', error);
        })
        .finally(removeLocal);
    } else {
      removeLocal();
    }

    setDeleteConfirmTarget(null);
  }, [deleteConfirmTarget]);

  const handleAddSlot = useCallback((dayKey) => {
    if (scheduleMode === 'calendar-only') {
      setSlotModalType('add');
      setEditSlotDayKey(null);
      setEditSlotId(null);
      setEditSlotData({
        date: '',
        maxBookings: 3,
        note: '',
      });
      setEditSlotModalOpen(true);
      return;
    }

    setSlotModalType('add');
    setEditSlotDayKey(dayKey);
    setEditSlotId(null);
    setEditSlotData({
      startTime: '09:00',
      endTime: '11:00',
      capacity: 3,
    });
    setEditSlotModalOpen(true);
  }, [scheduleMode]);

  return {
    calendarAvailability,
    closeSlotModal,
    currentWeekMonday,
    currentWeekSunday,
    dayKeys,
    deleteConfirmTarget,
    editSlotData,
    editSlotDayKey,
    editSlotId,
    editSlotModalOpen,
    formatDateForDay: getDateForDay,
    formatDateLong,
    getSlotStatusColor,
    handleAddSlot,
    handleConfirmDelete,
    handleDeleteSlot,
    handleEditSlot,
    handleSaveSlotEdit,
    scheduleMode,
    setDeleteConfirmTarget,
    setWeekOffset,
    slotModalType,
    weekDateByDay,
    weekOffset,
    weekRangeLabel,
    weeklySchedule,
  };
};

export default useWorkSchedule;
