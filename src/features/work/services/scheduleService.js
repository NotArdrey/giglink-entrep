import { supabase } from '../../../shared/services/supabaseClient';

export const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const DAY_INDEX = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
export const createEmptyWeeklySchedule = () =>
  DAY_ORDER.reduce((schedule, dayKey) => {
    schedule[dayKey] = [];
    return schedule;
  }, {});
export const createEmptyAvailabilityTemplate = createEmptyWeeklySchedule;
export const INITIAL_WEEKLY_SCHEDULE = createEmptyWeeklySchedule();
export const INITIAL_CALENDAR_AVAILABILITY = [];
const SLOT_TIMEZONE_OFFSET_MS = 8 * 60 * 60 * 1000;
const DEFAULT_AVAILABILITY_WEEKS = 7;

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

const toMinutes = (timeValue) => {
  const [hours, minutes] = String(timeValue || '').split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

export const formatDateOnly = (date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

export const formatDateForDay = (weekMonday, dayKey) => {
  const index = DAY_INDEX[dayKey] ?? 0;
  const date = addDays(weekMonday, index);
  return formatDateOnly(date);
};

const getSlotDateInServiceTimezone = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() + SLOT_TIMEZONE_OFFSET_MS);
};

export const getSlotDateKey = (timestamp) => {
  const serviceDate = getSlotDateInServiceTimezone(timestamp);
  if (!serviceDate) return '';
  const year = serviceDate.getUTCFullYear();
  const month = pad(serviceDate.getUTCMonth() + 1);
  const day = pad(serviceDate.getUTCDate());
  return `${year}-${month}-${day}`;
};

export const toLocalTimeValue = (dateOrTimestamp) => {
  const serviceDate = getSlotDateInServiceTimezone(dateOrTimestamp);
  if (!serviceDate) return '00:00';
  return `${pad(serviceDate.getUTCHours())}:${pad(serviceDate.getUTCMinutes())}`;
};

export const buildSlotTimestamps = ({ date, startTime = '00:00', endTime = '23:59:59' }) => ({
  startTs: `${date}T${startTime.length === 5 ? `${startTime}:00` : startTime}+08`,
  endTs: `${date}T${endTime.length === 5 ? `${endTime}:00` : endTime}+08`,
});

export const normalizeAvailabilityTemplate = (availability = {}) =>
  DAY_ORDER.reduce((schedule, dayKey) => {
    const slots = Array.isArray(availability?.[dayKey]) ? availability[dayKey] : [];
    schedule[dayKey] = slots
      .map((slot, index) => ({
        id: slot.id || `${dayKey.toLowerCase()}-${index}`,
        startTime: String(slot.startTime || '').slice(0, 5),
        endTime: String(slot.endTime || '').slice(0, 5),
        capacity: Math.max(1, Number(slot.capacity) || 1),
      }))
      .filter((slot) => {
        const startMinutes = toMinutes(slot.startTime);
        const endMinutes = toMinutes(slot.endTime);
        return startMinutes != null && endMinutes != null && endMinutes > startMinutes;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return schedule;
  }, {});

export const getAvailabilitySlotCount = (availability = {}) => {
  const normalized = normalizeAvailabilityTemplate(availability);
  return DAY_ORDER.reduce((total, dayKey) => total + normalized[dayKey].length, 0);
};

export const buildServiceSlotRowsFromAvailability = ({
  serviceId,
  sellerId,
  availability,
  weekMonday = getMonday(new Date()),
  weeksToCreate = DEFAULT_AVAILABILITY_WEEKS,
} = {}) => {
  if (!serviceId || !sellerId) return [];

  const normalized = normalizeAvailabilityTemplate(availability);
  const weekCount = Math.max(1, Math.min(12, Number(weeksToCreate) || DEFAULT_AVAILABILITY_WEEKS));
  const nowMs = Date.now();
  const rows = [];

  for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
    const weekStart = addDays(weekMonday, weekIndex * 7);

    DAY_ORDER.forEach((dayKey) => {
      const date = formatDateForDay(weekStart, dayKey);
      (normalized[dayKey] || []).forEach((slot) => {
        const { startTs, endTs } = buildSlotTimestamps({
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });

        const startMs = Date.parse(startTs.replace(/\+08$/, '+08:00'));
        if (Number.isFinite(startMs) && startMs < nowMs) return;

        rows.push({
          service_id: serviceId,
          seller_id: sellerId,
          start_ts: startTs,
          end_ts: endTs,
          capacity: slot.capacity,
          status: 'available',
          metadata: {
            createdVia: 'service-create-availability',
            template_day: dayKey,
            template_start_time: slot.startTime,
            template_end_time: slot.endTime,
          },
        });
      });
    });
  }

  return rows;
};

export const mapSlotRowToCalendarEntry = (slot) => ({
  id: slot.id,
  date: getSlotDateKey(slot.start_ts),
  maxBookings: slot.capacity || 1,
  booked: slot.status === 'booked'
    ? (slot.capacity || 0)
    : Number(slot.metadata?.booked_count || slot.metadata?.bookedCount || 0),
  note: slot.note || slot.metadata?.note || '',
  raw: slot,
});

export const mapSlotRowToWeeklyBlock = (slot) => {
  return {
    id: slot.id,
    startTime: toLocalTimeValue(slot.start_ts),
    endTime: toLocalTimeValue(slot.end_ts),
    capacity: slot.capacity || 1,
    slotsLeft: slot.status === 'available'
      ? Math.max(0, (slot.capacity || 1) - Number(slot.metadata?.booked_count || slot.metadata?.bookedCount || 0))
      : 0,
    bookings: [],
    raw: slot,
  };
};

export const mapSlotsToSchedule = (slots = [], { weekMonday = null } = {}) => {
  const weekly = createEmptyWeeklySchedule();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayByDate = weekMonday
    ? DAY_ORDER.reduce((acc, dayKey) => {
        acc[formatDateForDay(weekMonday, dayKey)] = dayKey;
        return acc;
      }, {})
    : null;
  const calendarAvailability = [];

  (slots || []).forEach((slot) => {
    const slotDateKey = getSlotDateKey(slot.start_ts);
    if (!slotDateKey) return;

    const serviceDate = getSlotDateInServiceTimezone(slot.start_ts);
    const dayName = dayByDate ? dayByDate[slotDateKey] : dayNames[serviceDate.getUTCDay()];

    calendarAvailability.push(mapSlotRowToCalendarEntry(slot));

    if (weekly[dayName]) {
      weekly[dayName].push(mapSlotRowToWeeklyBlock(slot));
    }
  });

  Object.keys(weekly).forEach((dayKey) => {
    weekly[dayKey].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return {
    calendarAvailability: calendarAvailability.sort((a, b) => (
      a.date === b.date
        ? String(a.raw?.start_ts || '').localeCompare(String(b.raw?.start_ts || ''))
        : a.date.localeCompare(b.date)
    )),
    weeklySchedule: weekly,
  };
};

export const fetchSellerSlots = async (sellerIdOrOptions) => {
  const options =
    typeof sellerIdOrOptions === 'object' && sellerIdOrOptions !== null
      ? sellerIdOrOptions
      : { sellerId: sellerIdOrOptions };
  const { sellerId, serviceId, startTs, endTs } = options;

  if (!sellerId) return [];

  let query = supabase
    .from('service_slots')
    .select('*')
    .eq('seller_id', sellerId);

  if (serviceId) query = query.eq('service_id', serviceId);
  if (startTs) query = query.gte('start_ts', startTs);
  if (endTs) query = query.lt('start_ts', endTs);

  const { data, error } = await query.order('start_ts', { ascending: true });

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

export const createServiceSlotsFromAvailability = async ({
  serviceId,
  sellerId,
  availability,
  weekMonday,
  weeksToCreate = DEFAULT_AVAILABILITY_WEEKS,
}) => {
  const rows = buildServiceSlotRowsFromAvailability({
    serviceId,
    sellerId,
    availability,
    weekMonday,
    weeksToCreate,
  });

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from('service_slots')
    .insert(rows)
    .select('*');

  if (error) throw error;
  return data || [];
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
  WEEKDAY_ORDER,
  INITIAL_CALENDAR_AVAILABILITY,
  INITIAL_WEEKLY_SCHEDULE,
  addDays,
  buildServiceSlotRowsFromAvailability,
  buildSlotTimestamps,
  createServiceSlotsFromAvailability,
  createServiceSlot,
  createEmptyAvailabilityTemplate,
  createEmptyWeeklySchedule,
  deleteServiceSlot,
  fetchSellerSlots,
  formatDateOnly,
  formatDateForDay,
  formatDateLabel,
  formatDateLong,
  getAvailabilitySlotCount,
  getSlotDateKey,
  getMonday,
  getSlotStatusColor,
  mapSlotsToSchedule,
  normalizeAvailabilityTemplate,
  updateServiceSlot,
};

export default scheduleService;
