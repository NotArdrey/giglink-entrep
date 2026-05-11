import { supabase } from '../../../shared/services/supabaseClient';

export const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const DAY_INDEX = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };
export const INITIAL_WEEKLY_SCHEDULE = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] };
export const INITIAL_CALENDAR_AVAILABILITY = [];

export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const getMonday = (date) => {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const formatDateLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const formatDateLong = (date) =>
  date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const pad = (value) => String(value).padStart(2, '0');

export const formatDateForDay = (weekMonday, dayKey) => {
  const index = DAY_INDEX[dayKey] ?? 0;
  const date = addDays(weekMonday, index);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

export const toLocalTimeValue = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const buildSlotTimestamps = ({ date, startTime = '00:00', endTime = '23:59:59' }) => ({
  startTs: `${date}T${startTime.length === 5 ? `${startTime}:00` : startTime}+08`,
  endTs: `${date}T${endTime.length === 5 ? `${endTime}:00` : endTime}+08`,
});

export const mapSlotRowToCalendarEntry = (slot) => ({
  id: slot.id,
  date: (slot.start_ts || '').slice(0, 10),
  maxBookings: slot.capacity || 1,
  booked: slot.status === 'booked'
    ? (slot.capacity || 0)
    : Number(slot.metadata?.booked_count || slot.metadata?.bookedCount || 0),
  note: slot.note || slot.metadata?.note || '',
  raw: slot,
});

export const mapSlotRowToWeeklyBlock = (slot) => {
  const start = new Date(slot.start_ts);
  const end = new Date(slot.end_ts);
  return {
    id: slot.id,
    startTime: toLocalTimeValue(start),
    endTime: toLocalTimeValue(end),
    capacity: slot.capacity || 1,
    slotsLeft: slot.status === 'available'
      ? Math.max(0, (slot.capacity || 1) - Number(slot.metadata?.booked_count || slot.metadata?.bookedCount || 0))
      : 0,
    bookings: [],
    raw: slot,
  };
};

export const mapSlotsToSchedule = (slots = []) => {
  const dateMap = {};
  const weekly = { ...INITIAL_WEEKLY_SCHEDULE };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  (slots || []).forEach((slot) => {
    const start = new Date(slot.start_ts);
    if (Number.isNaN(start.getTime())) return;

    const dateKey = (slot.start_ts || '').slice(0, 10);
    const dayName = dayNames[start.getDay()];

    if (!dateMap[dateKey]) {
      dateMap[dateKey] = {
        id: `date-${dateKey}`,
        date: dateKey,
        maxBookings: 0,
        booked: 0,
        note: '',
        raw: [],
      };
    }

    dateMap[dateKey].maxBookings += slot.capacity || 1;
    dateMap[dateKey].booked += slot.status === 'booked' ? (slot.capacity || 1) : 0;
    dateMap[dateKey].raw.push(slot);

    if (weekly[dayName]) {
      weekly[dayName].push(mapSlotRowToWeeklyBlock(slot));
    }
  });

  return {
    calendarAvailability: Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date)),
    weeklySchedule: weekly,
  };
};

export const fetchSellerSlots = async (sellerId) => {
  if (!sellerId) return [];

  const { data, error } = await supabase
    .from('service_slots')
    .select('*')
    .eq('seller_id', sellerId)
    .order('start_ts', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createServiceSlot = async ({ serviceId, sellerId, date, startTime, endTime, capacity, note = '' }) => {
  const { startTs, endTs } = buildSlotTimestamps({ date, startTime, endTime });
  const payload = {
    service_id: serviceId,
    seller_id: sellerId,
    start_ts: startTs,
    end_ts: endTs,
    capacity: Number(capacity) || 1,
    status: 'available',
    note: note || null,
    metadata: note ? { note } : {},
  };

  const { data, error } = await supabase
    .from('service_slots')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateServiceSlot = async ({ slotId, updates }) => {
  const { data, error } = await supabase
    .from('service_slots')
    .update(updates)
    .eq('id', slotId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteServiceSlot = async (slotId) => {
  const { error } = await supabase
    .from('service_slots')
    .delete()
    .eq('id', slotId);

  if (error) throw error;
  return true;
};

export const getSlotStatusColor = (slotsLeft, capacity) => {
  if (slotsLeft === 0) return 'slot-full';
  if (slotsLeft <= capacity / 2) return 'slot-half';
  return 'slot-available';
};

const scheduleService = {
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
  mapSlotsToSchedule,
  updateServiceSlot,
};

export default scheduleService;
