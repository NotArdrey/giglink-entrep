import React, { useState } from 'react';
import SimulatedChat from '../components/SimulatedChat';
import SlotEditModal from '../components/SlotEditModal';
import ProfileEditModal from '../components/ProfileEditModal';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import {
  MOCK_WORKERS,
  HOURLY_WORKER_SCHEDULE,
  DAILY_WORKER_CALENDAR,
  PROJECT_WORKER_CALENDAR,
  DAILY_SLOTS_SCHEDULE,
  PROJECT_SLOTS_SCHEDULE,
  HOURLY_CALENDAR,
  COMPREHENSIVE_TRANSACTIONS,
} from '../data/MockWorkers';
import '../styles/MyWork.css';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_INDEX = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

const getMonday = (baseDate = new Date()) => {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (baseDate, days) => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date;
};

const formatDateLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const formatDateLong = (date) =>
  date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const INITIAL_WEEKLY_SCHEDULE = {
  Mon: [
    {
      id: 'mon-1',
      startTime: '09:00',
      endTime: '11:00',
      capacity: 3,
      slotsLeft: 1,
      bookings: [
        { clientName: 'Alice Wong', service: 'Tutoring' },
        { clientName: 'Bob Lee', service: 'Tutoring' },
      ],
    },
    {
      id: 'mon-2',
      startTime: '14:00',
      endTime: '16:00',
      capacity: 2,
      slotsLeft: 2,
      bookings: [],
    },
  ],
  Tue: [
    {
      id: 'tue-1',
      startTime: '10:00',
      endTime: '12:00',
      capacity: 3,
      slotsLeft: 0,
      bookings: [
        { clientName: 'Carol Kim', service: 'Tutoring' },
        { clientName: 'Diana Ng', service: 'Tutoring' },
        { clientName: 'Eva dela Cruz', service: 'Tutoring' },
      ],
    },
  ],
  Wed: [
    {
      id: 'wed-1',
      startTime: '09:00',
      endTime: '11:00',
      capacity: 3,
      slotsLeft: 2,
      bookings: [
        { clientName: 'Frank Santos', service: 'Tutoring' },
      ],
    },
    {
      id: 'wed-2',
      startTime: '15:00',
      endTime: '17:00',
      capacity: 2,
      slotsLeft: 1,
      bookings: [
        { clientName: 'Grace Reyes', service: 'Tutoring' },
      ],
    },
  ],
  Thu: [
    {
      id: 'thu-1',
      startTime: '13:00',
      endTime: '15:00',
      capacity: 3,
      slotsLeft: 3,
      bookings: [],
    },
  ],
  Fri: [
    {
      id: 'fri-1',
      startTime: '09:00',
      endTime: '11:00',
      capacity: 2,
      slotsLeft: 0,
      bookings: [
        { clientName: 'Henry Lopez', service: 'Tutoring' },
        { clientName: 'Iris Tan', service: 'Tutoring' },
      ],
    },
    {
      id: 'fri-2',
      startTime: '14:00',
      endTime: '16:00',
      capacity: 3,
      slotsLeft: 1,
      bookings: [
        { clientName: 'Jack Santos', service: 'Tutoring' },
        { clientName: 'Kate Flores', service: 'Tutoring' },
      ],
    },
  ],
};

const INITIAL_CALENDAR_AVAILABILITY = [
  { id: 'cal-1', date: '2026-03-24', maxBookings: 3, booked: 2, note: 'Morning to afternoon' },
  { id: 'cal-2', date: '2026-03-26', maxBookings: 2, booked: 1, note: 'Flexible schedule' },
  { id: 'cal-3', date: '2026-03-28', maxBookings: 4, booked: 0, note: 'Weekend slots open' },
];

const INITIAL_TRANSACTIONS = [
  { id: 'txn-1', clientName: 'Alice Wong', service: 'Tutoring', scheduleRef: 'mon-1', paymentMode: 'Advance', isPaid: true, isDone: false, weekOffset: 0 },
  { id: 'txn-2', clientName: 'Bob Lee', service: 'Tutoring', scheduleRef: 'mon-1', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: 0 },
  { id: 'txn-3', clientName: 'Carol Kim', service: 'Tutoring', scheduleRef: 'tue-1', paymentMode: 'Advance', isPaid: true, isDone: true, weekOffset: 0 },
  { id: 'txn-4', clientName: 'Diana Ng', service: 'Tutoring', scheduleRef: 'tue-1', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: 0 },
  { id: 'txn-5', clientName: 'Grace Reyes', service: 'Tutoring', scheduleRef: 'wed-2', paymentMode: 'Advance', isPaid: true, isDone: false, weekOffset: 0 },
  { id: 'txn-6', clientName: 'Mika Ramos', service: 'Consultation', scheduleRef: 'cal-1', paymentMode: 'Advance', isPaid: false, isDone: false, weekOffset: 0 },
  { id: 'txn-7', clientName: 'Noel Santos', service: 'Consultation', scheduleRef: 'cal-2', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: 0 },
  { id: 'txn-8', clientName: 'Paolo Diaz', service: 'Tutoring', scheduleRef: 'fri-2', paymentMode: 'Advance', isPaid: false, isDone: false, weekOffset: 1 },
  { id: 'txn-9', clientName: 'Rina Sy', service: 'Consultation', scheduleRef: 'cal-3', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: -1 },
  // Monthly recurring (Advance): once first payment is checked, all cycle entries are paid and locked.
  { id: 'sub-advance-1', clientName: 'Bob Lee', service: 'Monthly Tutor Plan', scheduleRef: 'mon-1', paymentMode: 'Advance', isPaid: false, isDone: false, weekOffset: 0, recurringCycle: 'monthly', subscriptionId: 'monthly-bob-2026-03', cycleOrder: 1, paymentLocked: false, cycleStart: '2026-03-21', cycleEnd: '2026-04-21' },
  { id: 'sub-advance-2', clientName: 'Bob Lee', service: 'Monthly Tutor Plan', scheduleRef: 'mon-1', paymentMode: 'Advance', isPaid: false, isDone: false, weekOffset: 1, recurringCycle: 'monthly', subscriptionId: 'monthly-bob-2026-03', cycleOrder: 2, paymentLocked: false, cycleStart: '2026-03-21', cycleEnd: '2026-04-21' },
  { id: 'sub-advance-3', clientName: 'Bob Lee', service: 'Monthly Tutor Plan', scheduleRef: 'mon-1', paymentMode: 'Advance', isPaid: false, isDone: false, weekOffset: 2, recurringCycle: 'monthly', subscriptionId: 'monthly-bob-2026-03', cycleOrder: 3, paymentLocked: false, cycleStart: '2026-03-21', cycleEnd: '2026-04-21' },
  { id: 'sub-advance-4', clientName: 'Bob Lee', service: 'Monthly Tutor Plan', scheduleRef: 'mon-1', paymentMode: 'Advance', isPaid: false, isDone: false, weekOffset: 3, recurringCycle: 'monthly', subscriptionId: 'monthly-bob-2026-03', cycleOrder: 4, paymentLocked: false, cycleStart: '2026-03-21', cycleEnd: '2026-04-21' },
  // Monthly recurring (After Service): when last cycle entry is marked done and paid, previous weeks become paid.
  { id: 'sub-after-1', clientName: 'Diana Ng', service: 'Monthly Tutor Plan', scheduleRef: 'tue-1', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: 0, recurringCycle: 'monthly', subscriptionId: 'monthly-diana-2026-03', cycleOrder: 1, paymentLocked: false, cycleStart: '2026-03-21', cycleEnd: '2026-04-21' },
  { id: 'sub-after-2', clientName: 'Diana Ng', service: 'Monthly Tutor Plan', scheduleRef: 'tue-1', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: 1, recurringCycle: 'monthly', subscriptionId: 'monthly-diana-2026-03', cycleOrder: 2, paymentLocked: false, cycleStart: '2026-03-21', cycleEnd: '2026-04-21' },
  { id: 'sub-after-3', clientName: 'Diana Ng', service: 'Monthly Tutor Plan', scheduleRef: 'tue-1', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: 2, recurringCycle: 'monthly', subscriptionId: 'monthly-diana-2026-03', cycleOrder: 3, paymentLocked: false, cycleStart: '2026-03-21', cycleEnd: '2026-04-21' },
  { id: 'sub-after-4', clientName: 'Diana Ng', service: 'Monthly Tutor Plan', scheduleRef: 'tue-1', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: 3, recurringCycle: 'monthly', subscriptionId: 'monthly-diana-2026-03', cycleOrder: 4, paymentLocked: false, cycleStart: '2026-03-21', cycleEnd: '2026-04-21' },
];

/**
 * MyWork Component
 * 
 * SELLER'S MANAGEMENT HUB
 * 
 * Displays active inquiries, schedule, and work management for sellers.
 * 
 * DUMMY DATA ARRAYS:
 * - This component uses hardcoded arrays to simulate a database for demo purposes.
 * - In production, these would be fetched from an API based on sellerProfile.id
 * - Conditional rendering checks the "hasService" flag to show Empty vs. Active states
 * 
 * STATE MACHINE:
 * - If hasService === false: Show "Welcome! Setup your profile" banner
 * - If hasService === true: Show Active Inquiries + Schedule sections
 * - isSelectedChat: Controls which inquiry's chat is displayed (null = no chat open)
 * 
 * DEMO DATA STRUCTURE:
 * inquiries: [{ id, clientName, service, status, requestDate }, ...]
 * schedules: { 'Mon': [...timeBlocks], 'Tue': [...], ... }
 */
const MyWork = ({ sellerProfile, onBackToDashboard, onLogout }) => {
  // ============ STATE MANAGEMENT ============
  
  // Default Joshua Paul Santos profile if sellerProfile not provided
  const defaultSellerProfile = {
    fullName: 'Joshua Paul Santos',
    serviceType: 'Pilot Service for Valorant',
    description: 'Professional Valorant coaching and rank support services',
    pricingModel: 'hourly',
    hourlyRate: 250,
    paymentAdvance: true,
    paymentAfterService: true,
    afterServicePaymentType: 'both',
    gcashNumber: '09054891105',
    bookingMode: 'with-slots',
    location: {
      barangay: 'Sabang',
      city: 'Baliwag',
      province: 'Bulacan'
    }
  };

  const [currentProfile, setCurrentProfile] = useState(sellerProfile || defaultSellerProfile);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState(INITIAL_WEEKLY_SCHEDULE);
  const [calendarAvailability, setCalendarAvailability] = useState(INITIAL_CALENDAR_AVAILABILITY);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [weekOffset, setWeekOffset] = useState(0);
  const [doneConfirmTarget, setDoneConfirmTarget] = useState(null);
  const [editSlotModalOpen, setEditSlotModalOpen] = useState(false);
  const [editSlotData, setEditSlotData] = useState(null);
  const [editSlotDayKey, setEditSlotDayKey] = useState(null);
  const [editSlotId, setEditSlotId] = useState(null);
  const [slotModalType, setSlotModalType] = useState('edit');
  const [profileEditModalOpen, setProfileEditModalOpen] = useState(false);
  const [isGcashPreviewOpen, setIsGcashPreviewOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [selectedWorkerIndex, setSelectedWorkerIndex] = useState(0);
  
  // Helper function to get the appropriate schedule based on worker index
  const getWorkerScheduleData = (workerIndex) => {
    switch (workerIndex) {
      case 0: // Joshua - hourly with slots
        return {
          profile: MOCK_WORKERS[0],
          schedule: HOURLY_WORKER_SCHEDULE,
          calendar: null,
          bookingMode: 'with-slots',
        };
      case 1: // Maria - hourly with calendar
        return {
          profile: MOCK_WORKERS[1],
          schedule: null,
          calendar: HOURLY_CALENDAR,
          bookingMode: 'calendar-only',
        };
      case 2: // Carlos - daily with calendar
        return {
          profile: MOCK_WORKERS[2],
          schedule: null,
          calendar: DAILY_WORKER_CALENDAR,
          bookingMode: 'calendar-only',
        };
      case 3: // Angela - project with calendar
        return {
          profile: MOCK_WORKERS[3],
          schedule: null,
          calendar: PROJECT_WORKER_CALENDAR,
          bookingMode: 'calendar-only',
        };
      case 4: // Roberto - daily with slots
        return {
          profile: MOCK_WORKERS[4],
          schedule: DAILY_SLOTS_SCHEDULE,
          calendar: null,
          bookingMode: 'with-slots',
        };
      case 5: // Sofia - project with slots
        return {
          profile: MOCK_WORKERS[5],
          schedule: PROJECT_SLOTS_SCHEDULE,
          calendar: null,
          bookingMode: 'with-slots',
        };
      default:
        return {
          profile: MOCK_WORKERS[0],
          schedule: HOURLY_WORKER_SCHEDULE,
          calendar: null,
          bookingMode: 'with-slots',
        };
    }
  };

  // Get current worker data
  const currentWorkerData = getWorkerScheduleData(selectedWorkerIndex);
  const workerProfile = currentWorkerData.profile;
  const workerBookingMode = currentWorkerData.bookingMode;
  
  const scheduleMode = workerBookingMode || 'with-slots';
  
  // For demo, set hasService to true to show active data immediately
  // In production, this would be: const hasService = !!sellerProfile?.serviceType;
  const hasService = true;
  
  // ============ DUMMY DATA ARRAYS (Simulates Database) ============
  
  /**
   * DUMMY INQUIRIES
   * Simulates client inquiries for this seller's services.
   * Each inquiry can be responded to via chat.
   */
  const dummyInquiries = [
    {
      id: 101,
      clientName: 'Juan Dela Cruz',
      clientPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      clientRating: 4.7,
      service: 'Math Tutoring - High School',
      description: 'Looking for help with Algebra and Calculus',
      status: 'Pending Response',
      requestDate: '2026-03-20',
      proposedBudget: '₱800/hour',
      messages: 0,
    },
    {
      id: 102,
      clientName: 'Maria Clara Santos',
      clientPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      clientRating: 4.9,
      service: 'Laptop Repair',
      description: 'Laptop not turning on - need diagnostics',
      status: 'Waiting for Reply',
      requestDate: '2026-03-19',
      proposedBudget: 'Call or estimate',
      messages: 1,
    },
    {
      id: 103,
      clientName: 'Roberto Cruz',
      clientPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      clientRating: 4.8,
      service: 'House Cleaning',
      description: '3-bedroom house, full cleaning service needed',
      status: 'Negotiating Price',
      requestDate: '2026-03-18',
      proposedBudget: '₱2,500 negotiable',
      messages: 3,
    },
  ];
  
  /**
   * DUMMY SCHEDULE
   * Simulates the seller's weekly slot availability (Mon-Fri)
   * Each day has time blocks with capacity and filled slots
   */
  const dayKeys = DAY_ORDER;
  const currentWeekMonday = addDays(getMonday(new Date()), weekOffset * 7);
  const currentWeekSunday = addDays(currentWeekMonday, 6);
  const weekRangeLabel = `${formatDateLabel(currentWeekMonday)} - ${formatDateLabel(currentWeekSunday)}`;
  const weekDateByDay = dayKeys.reduce((acc, day) => {
    acc[day] = addDays(currentWeekMonday, DAY_INDEX[day]);
    return acc;
  }, {});
  const weekTransactions = transactions.filter((txn) => txn.weekOffset === weekOffset);

  const getTransactionForBooking = (scheduleRef, clientName) => {
    const matches = weekTransactions.filter(
      (txn) => txn.scheduleRef === scheduleRef && txn.clientName === clientName
    );

    if (matches.length === 0) return undefined;

    if (currentProfile?.rateBasis === 'per-month') {
      const monthlyMatch = matches.find((txn) => txn.recurringCycle === 'monthly');
      if (monthlyMatch) return monthlyMatch;
    }

    return matches[0];
  };

  const isMonthlyRecurringTxn = (txn) => txn?.recurringCycle === 'monthly' && !!txn?.subscriptionId;

  const getSubscriptionTransactions = (subscriptionId) =>
    transactions.filter((txn) => txn.subscriptionId === subscriptionId);

  const isLastCycleEntry = (txn) => {
    if (!isMonthlyRecurringTxn(txn)) return false;
    const cycleEntries = getSubscriptionTransactions(txn.subscriptionId);
    const maxOrder = Math.max(...cycleEntries.map((entry) => entry.cycleOrder || 0));
    return (txn.cycleOrder || 0) === maxOrder;
  };

  const canTogglePaid = (txn) => {
    if (!txn) return false;
    if (!isMonthlyRecurringTxn(txn)) return true;
    if (txn.paymentLocked) return false;

    if (txn.paymentMode === 'Advance') {
      return !txn.isPaid;
    }

    if (txn.paymentMode === 'After Service') {
      return isLastCycleEntry(txn) && txn.isDone;
    }

    return true;
  };

  const canMarkDone = (txn) => {
    if (!txn) return false;
    if (!isMonthlyRecurringTxn(txn)) return !txn.isDone;

    if (txn.paymentMode === 'After Service') {
      return !txn.isDone && isLastCycleEntry(txn);
    }

    return !txn.isDone;
  };

  const closeSlotModal = () => {
    setEditSlotModalOpen(false);
    setEditSlotData(null);
    setEditSlotDayKey(null);
    setEditSlotId(null);
    setSlotModalType('edit');
  };
  
  // ============ EVENT HANDLERS ============
  
  /**
   * handleRespondClick(inquiryId)
   * Opens the chat modal for a specific inquiry
   */
  const handleRespondClick = (inquiryId) => {
    setSelectedChatId(inquiryId);
  };
  
  /**
   * handleCloseChat()
   * Closes the chat modal
   */
  const handleCloseChat = () => {
    setSelectedChatId(null);
  };
  
  /**
   * handleEditSlot(dayKey, slotId)
   * Opens the edit modal for a time slot or calendar date
   */
  const handleEditSlot = (dayKey, slotId) => {
    setSlotModalType('edit');
    if (scheduleMode === 'calendar-only') {
      const entry = calendarAvailability.find((item) => item.id === slotId);
      if (!entry) return;
      setEditSlotData(entry);
      setEditSlotDayKey(null);
      setEditSlotId(slotId);
      setEditSlotModalOpen(true);
    } else {
      const block = (weeklySchedule[dayKey] || []).find((item) => item.id === slotId);
      if (!block) return;
      setEditSlotData(block);
      setEditSlotDayKey(dayKey);
      setEditSlotId(slotId);
      setEditSlotModalOpen(true);
    }
  };

  const handleSaveSlotEdit = (updatedData) => {
    if (scheduleMode === 'calendar-only') {
      if (slotModalType === 'add') {
        setCalendarAvailability((prev) => [
          ...prev,
          {
            id: `cal-${Date.now()}`,
            date: updatedData.date,
            maxBookings: updatedData.maxBookings,
            booked: 0,
            note: updatedData.note || '',
          },
        ]);
      } else {
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
      }
    } else {
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
    }
      closeSlotModal();
  };
  
  /**
   * handleDeleteSlot(dayKey, slotId)
   * Simulated delete action for a time slot
   */
  const handleDeleteSlot = (dayKey, slotId) => {
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
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.mode === 'calendar-only') {
      setCalendarAvailability((prev) =>
        prev.filter((item) => item.id !== deleteConfirmTarget.slotId)
      );
    } else {
      setWeeklySchedule((prev) => ({
        ...prev,
        [deleteConfirmTarget.dayKey]: (prev[deleteConfirmTarget.dayKey] || []).filter(
          (item) => item.id !== deleteConfirmTarget.slotId
        ),
      }));
    }

    setDeleteConfirmTarget(null);
  };

  const handleAddSlot = (dayKey) => {
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

    const startTime = window.prompt(`New slot start time for ${dayKey} (HH:MM):`, '09:00');
    if (!startTime) return;
    const endTime = window.prompt(`New slot end time for ${dayKey} (HH:MM):`, '11:00');
    if (!endTime) return;
    const capacity = window.prompt('Slot capacity:', '3');
    if (!capacity || Number(capacity) < 1) return;

    const newBlock = {
      id: `${dayKey.toLowerCase()}-${Date.now()}`,
      startTime,
      endTime,
      capacity: Number(capacity),
      slotsLeft: Number(capacity),
      bookings: [],
    };

    setWeeklySchedule((prev) => ({
      ...prev,
      [dayKey]: [...(prev[dayKey] || []), newBlock],
    }));
  };

  const handleTogglePaid = (transactionId) => {
    const target = transactions.find((txn) => txn.id === transactionId);
    if (!target) return;

    // Monthly recurring rules:
    // 1) Advance: first paid marks whole cycle paid + locks paid toggle.
    // 2) After Service: only last cycle entry can trigger paid state for all previous weeks.
    if (isMonthlyRecurringTxn(target)) {
      if (!canTogglePaid(target)) return;

      if (target.paymentMode === 'Advance') {
        setTransactions((prev) =>
          prev.map((txn) =>
            txn.subscriptionId === target.subscriptionId
              ? { ...txn, isPaid: true, paymentLocked: true }
              : txn
          )
        );
        return;
      }

      if (target.paymentMode === 'After Service') {
        setTransactions((prev) =>
          prev.map((txn) =>
            txn.subscriptionId === target.subscriptionId
              ? { ...txn, isPaid: true, paymentLocked: true }
              : txn
          )
        );
        return;
      }
    }

    setTransactions((prev) =>
      prev.map((txn) => {
        if (txn.id !== transactionId) return txn;
        return { ...txn, isPaid: !txn.isPaid };
      })
    );
  };

  const handleOpenDoneModal = (transaction) => {
    setDoneConfirmTarget(transaction);
  };

  const handleConfirmDone = () => {
    if (!doneConfirmTarget) return;

    // Monthly after-service rule: if final cycle entry is marked done,
    // mark whole cycle paid and lock the paid state.
    if (isMonthlyRecurringTxn(doneConfirmTarget) && doneConfirmTarget.paymentMode === 'After Service' && isLastCycleEntry(doneConfirmTarget)) {
      setTransactions((prev) =>
        prev.map((txn) => {
          if (txn.subscriptionId === doneConfirmTarget.subscriptionId) {
            return {
              ...txn,
              isPaid: true,
              paymentLocked: true,
              isDone: txn.isDone || txn.id === doneConfirmTarget.id,
            };
          }

          if (txn.id === doneConfirmTarget.id) {
            return {
              ...txn,
              isDone: true,
            };
          }

          return txn;
        })
      );
      setDoneConfirmTarget(null);
      return;
    }

    setTransactions((prev) =>
      prev.map((txn) =>
        txn.id === doneConfirmTarget.id
          ? {
              ...txn,
              isDone: true,
              isPaid: txn.isPaid || doneConfirmTarget.paymentMode === 'Advance',
            }
          : txn
      )
    );
    setDoneConfirmTarget(null);
  };

  const handleOpenProfileEdit = () => {
    setProfileEditModalOpen(true);
  };

  const handleSaveProfileEdit = (updatedData) => {
    setCurrentProfile((prev) => ({
      ...prev,
      ...updatedData,
    }));
    setProfileEditModalOpen(false);
  };

  const handleOpenGcashPreview = () => {
    setIsGcashPreviewOpen(true);
  };

  const handleCloseGcashPreview = () => {
    setIsGcashPreviewOpen(false);
  };

  const gcashNumber = currentProfile?.gcashNumber || '09054891105';
  const gcashQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`GCash-${gcashNumber}`)}`;
  
  // ============ HELPER FUNCTIONS ============
  
  /**
   * getInquiryById(id)
   * Retrieves inquiry data for a specific ID
   */
  const getInquiryById = (id) => dummyInquiries.find(inq => inq.id === id);
  
  /**
   * getSlotStatusColor(slotsLeft, capacity)
   * Returns CSS class for slot availability coloring
   */
  const getSlotStatusColor = (slotsLeft, capacity) => {
    if (slotsLeft === 0) return 'slot-full';
    if (slotsLeft <= capacity / 2) return 'slot-half';
    return 'slot-available';
  };
  
  /**
   * getStatusBadgeColor(status)
   * Returns CSS class for inquiry status badge color
   */
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending Response': return 'status-pending';
      case 'Waiting for Reply': return 'status-waiting';
      case 'Negotiating Price': return 'status-negotiating';
      default: return 'status-default';
    }
  };
  
  // Currently selected inquiry for chat
  const selectedInquiry = selectedChatId ? getInquiryById(selectedChatId) : null;
  
  // ============ RENDER ============
  
  return (
    <div className="my-work-page">
      {/* HEADER BAR */}
      <div className="my-work-header-bar">
        <button className="back-to-dashboard-btn" onClick={onBackToDashboard}>
          ← Back to Dashboard
        </button>
        <h1 className="my-work-title">My Work Portal</h1>
        <button className="logout-btn" onClick={() => setIsLogoutConfirmOpen(true)}>Logout</button>
      </div>
      
      {/* MAIN CONTENT */}
      <main className="my-work-main">
        
        {/* CONDITIONAL: EMPTY STATE */}
        {!hasService && (
          <div className="empty-state-banner">
            <h2>Welcome! Setup your profile</h2>
            <p>Complete your service profile to start receiving inquiries from clients.</p>
            <button className="btn-primary">Edit Profile</button>
          </div>
        )}
        
        {/* CONDITIONAL: ACTIVE STATE */}
        {hasService && (
          <>
            {/* PROFILE SUMMARY CARD */}
            <div className="profile-summary-card">
              <div className="profile-info">
                <div className="profile-avatar">
                  {currentProfile?.fullName?.charAt(0) || '?'}
                </div>
                <div className="profile-details">
                  <button
                    className="profile-name-link"
                    onClick={handleOpenProfileEdit}
                    title="Edit profile details"
                  >
                    {currentProfile?.fullName || 'Service Provider'}
                  </button>
                  <p className="service-type">{currentProfile?.serviceType || 'Service Type'}</p>
                  <p className="location">
                    📍 {currentProfile?.location?.barangay || 'Sabang'}, {currentProfile?.location?.city || 'Baliwag'}, {currentProfile?.location?.province || 'Bulacan'}
                  </p>
                  <p className="service-mode-tag">
                    Scheduling: {scheduleMode === 'calendar-only' ? 'Calendar Only' : 'With Slots'}
                  </p>
                  <button className="gcash-qr-btn profile-gcash-btn" onClick={handleOpenGcashPreview}>
                    GCash QR
                  </button>
                </div>
              </div>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{dummyInquiries.length}</span>
                  <span className="stat-label">Active Inquiries</span>
                </div>
                <div className="stat">
                  <span className="stat-number">4.8</span>
                  <span className="stat-label">Avg Rating</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{weekTransactions.filter((txn) => txn.isDone).length}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
            </div>
            
            {/* SECTION: ACTIVE INQUIRIES */}
            <section className="inquiries-section">
              <div className="section-header">
                <h2>Active Inquiries ({dummyInquiries.length})</h2>
                <p className="section-subtitle">Clients waiting for your response</p>
              </div>
              
              <div className="inquiries-grid">
                {dummyInquiries.map(inquiry => (
                  <div key={inquiry.id} className="inquiry-card">
                    <div className="inquiry-header">
                      <div className="client-info">
                        <img
                          src={inquiry.clientPhoto}
                          alt={inquiry.clientName}
                          className="client-photo"
                        />
                        <div>
                          <h3>{inquiry.clientName}</h3>
                          <p className="client-rating">
                            ⭐ {inquiry.clientRating} rating
                          </p>
                        </div>
                      </div>
                      <span className={`status-badge ${getStatusBadgeColor(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </div>
                    
                    <div className="inquiry-body">
                      <p className="inquiry-service">{inquiry.service}</p>
                      <p className="inquiry-description">{inquiry.description}</p>
                      <div className="inquiry-meta">
                        <span>💰 {inquiry.proposedBudget}</span>
                        <span>📅 {inquiry.requestDate}</span>
                      </div>
                    </div>
                    
                    <div className="inquiry-actions">
                      <button
                        className="btn-respond"
                        onClick={() => handleRespondClick(inquiry.id)}
                      >
                        💬 Respond {inquiry.messages > 0 && `(${inquiry.messages})`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* SECTION: WEEKLY SCHEDULE */}
            <section className="schedule-section">
              <div className="section-header">
                <h2>{scheduleMode === 'calendar-only' ? 'Calendar Availability' : 'Weekly Schedule'}</h2>
                <p className="section-subtitle">
                  {scheduleMode === 'calendar-only'
                    ? 'Manage available dates for manual coordination'
                    : 'Manage your availability and time-slot bookings'}
                </p>
              </div>

              <div className="week-slider">
                <button className="week-nav-btn" onClick={() => setWeekOffset((prev) => prev - 1)}>
                  ← Previous Week
                </button>
                <div className="week-range">
                  <strong>{weekRangeLabel}</strong>
                  <span>{weekOffset === 0 ? 'Current Week' : `${weekOffset > 0 ? '+' : ''}${weekOffset} week`}</span>
                </div>
                <button className="week-nav-btn" onClick={() => setWeekOffset((prev) => prev + 1)}>
                  Next Week →
                </button>
              </div>

              {scheduleMode === 'calendar-only' ? (
                <div className="calendar-availability-grid">
                  {calendarAvailability
                    .filter((entry) => {
                      const entryDate = new Date(`${entry.date}T00:00:00`);
                      return entryDate >= currentWeekMonday && entryDate <= currentWeekSunday;
                    })
                    .map((entry) => {
                      const entryTransactions = weekTransactions.filter((txn) => txn.scheduleRef === entry.id);
                      return (
                        <div key={entry.id} className="calendar-day-card">
                          <h3 className="calendar-date">📅 {entry.date}</h3>
                          <p className="calendar-booked">Booked: {entry.booked}/{entry.maxBookings}</p>
                          <p className="calendar-note">{entry.note || 'No notes added'}</p>

                          {entryTransactions.length > 0 && (
                            <div className="calendar-bookings-list">
                              {entryTransactions.map((txn) => (
                                <div key={txn.id} className="booking-item">
                                  <span className="booking-name">👤 {txn.clientName}</span>
                                  {isMonthlyRecurringTxn(txn) && (
                                    <span className="recurring-cycle-pill">
                                      Monthly {txn.cycleOrder}/4 ({txn.cycleStart} to {txn.cycleEnd})
                                    </span>
                                  )}
                                  <div className="booking-inline-actions">
                                    <label className="check-toggle compact">
                                      <input
                                        type="checkbox"
                                        checked={txn.isPaid}
                                        disabled={!canTogglePaid(txn)}
                                        onChange={() => handleTogglePaid(txn.id)}
                                      />
                                      <span>{txn.isPaid ? '✅ Paid' : '⬜ Paid'}</span>
                                    </label>
                                    {isMonthlyRecurringTxn(txn) && !canTogglePaid(txn) && (
                                      <span className="lock-hint">🔒 Locked for monthly cycle</span>
                                    )}
                                    {txn.isDone ? (
                                      <span className="done-pill">✅ Done</span>
                                    ) : (
                                      <button
                                        className="mark-done-btn"
                                        disabled={!canMarkDone(txn)}
                                        onClick={() => handleOpenDoneModal(txn)}
                                      >
                                        Mark Done
                                      </button>
                                    )}
                                    {isMonthlyRecurringTxn(txn) && txn.paymentMode === 'After Service' && !isLastCycleEntry(txn) && (
                                      <span className="lock-hint">Finalize on last cycle entry</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="block-actions">
                            <button
                              className="action-btn edit-btn"
                              title="Edit date"
                              onClick={() => handleEditSlot(null, entry.id)}
                            >
                              ✏️
                            </button>
                            <button
                              className="action-btn delete-btn"
                              title="Delete date"
                              onClick={() => handleDeleteSlot(null, entry.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  <button className="btn-add-slot" onClick={() => handleAddSlot('calendar')}>
                    + Add Available Date
                  </button>
                </div>
              ) : (
                <div className="schedule-grid">
                  {dayKeys.map((dayKey) => {
                    const timeBlocks = weeklySchedule[dayKey] || [];
                    return (
                      <div key={dayKey} className="schedule-day-card">
                        <h3 className="day-header">{dayKey}</h3>
                        <p className="day-date">{formatDateLong(weekDateByDay[dayKey])}</p>

                        {timeBlocks.length === 0 ? (
                          <p className="no-slots">No slots scheduled</p>
                        ) : (
                          <div className="time-blocks">
                            {timeBlocks.map((block) => (
                              <div
                                key={block.id}
                                className={`time-block ${getSlotStatusColor(block.slotsLeft, block.capacity)}`}
                              >
                                <div className="block-time">
                                  <strong>
                                    {block.startTime} - {block.endTime}
                                  </strong>
                                </div>

                                <div className="block-status">
                                  <span className="slots-counter">
                                    {block.capacity - block.slotsLeft}/{block.capacity} Filled
                                  </span>
                                  <div className="status-bar">
                                    <div
                                      className="filled-bar"
                                      style={{
                                        width: `${((block.capacity - block.slotsLeft) / block.capacity) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>

                                {block.bookings.length > 0 && (
                                  <div className="bookings-preview">
                                    {block.bookings.map((booking, idx) => {
                                      const bookingTxn = getTransactionForBooking(block.id, booking.clientName);
                                      return (
                                        <div key={idx} className="booking-item">
                                          <span className="booking-name">👤 {booking.clientName}</span>
                                          {bookingTxn ? (
                                            <div className="booking-inline-actions">
                                              {isMonthlyRecurringTxn(bookingTxn) && (
                                                <span className="recurring-cycle-pill">
                                                  Monthly {bookingTxn.cycleOrder}/4 ({bookingTxn.cycleStart} to {bookingTxn.cycleEnd})
                                                </span>
                                              )}
                                              <label className="check-toggle compact">
                                                <input
                                                  type="checkbox"
                                                  checked={bookingTxn.isPaid}
                                                  disabled={!canTogglePaid(bookingTxn)}
                                                  onChange={() => handleTogglePaid(bookingTxn.id)}
                                                />
                                                <span>{bookingTxn.isPaid ? '✅ Paid' : '⬜ Paid'}</span>
                                              </label>
                                              {isMonthlyRecurringTxn(bookingTxn) && !canTogglePaid(bookingTxn) && (
                                                <span className="lock-hint">🔒 Locked for monthly cycle</span>
                                              )}
                                              {bookingTxn.isDone ? (
                                                <span className="done-pill">✅ Done</span>
                                              ) : (
                                                <button
                                                  className="mark-done-btn"
                                                  disabled={!canMarkDone(bookingTxn)}
                                                  onClick={() => handleOpenDoneModal(bookingTxn)}
                                                >
                                                  Mark Done
                                                </button>
                                              )}
                                              {isMonthlyRecurringTxn(bookingTxn) && bookingTxn.paymentMode === 'After Service' && !isLastCycleEntry(bookingTxn) && (
                                                <span className="lock-hint">Finalize on last cycle entry</span>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="booking-item-checks">No transaction record</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                <div className="block-actions">
                                  <button
                                    className="action-btn edit-btn"
                                    title="Edit slot"
                                    onClick={() => handleEditSlot(dayKey, block.id)}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="action-btn delete-btn"
                                    title="Delete slot"
                                    onClick={() => handleDeleteSlot(dayKey, block.id)}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <button className="btn-add-slot" onClick={() => handleAddSlot(dayKey)}>
                          + Add Slot
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            
            {/* STATS FOOTER */}
            <section className="stats-footer">
              <div className="stat-card">
                <h4>Response Rate</h4>
                <p className="stat-value">92%</p>
                <p className="stat-desc">Avg response within 2 hours</p>
              </div>
              <div className="stat-card">
                <h4>This Week</h4>
                <p className="stat-value">8 hours</p>
                <p className="stat-desc">Total scheduled time</p>
              </div>
              <div className="stat-card">
                <h4>Earnings</h4>
                <p className="stat-value">₱3,600</p>
                <p className="stat-desc">Pending completion</p>
              </div>
            </section>
          </>
        )}
      </main>

      {doneConfirmTarget && (
        <div className="done-confirm-overlay">
          <div className="done-confirm-modal">
            <h3>Confirm Service Completion</h3>
            <p>
              Mark <strong>{doneConfirmTarget.clientName}</strong> as completed?
            </p>
            <p className="done-confirm-note">
              This confirms that the worker has completed the service for this transaction.
            </p>
            <div className="done-confirm-actions">
              <button className="done-cancel-btn" onClick={() => setDoneConfirmTarget(null)}>
                Cancel
              </button>
              <button className="done-confirm-btn" onClick={handleConfirmDone}>
                Confirm Done
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmTarget && (
        <div className="done-confirm-overlay">
          <div className="done-confirm-modal">
            <h3>Confirm Deletion</h3>
            <p>
              Delete <strong>{deleteConfirmTarget.label}</strong>?
            </p>
            <p className="done-confirm-note">
              This action cannot be undone.
            </p>
            <div className="done-confirm-actions">
              <button className="done-cancel-btn" onClick={() => setDeleteConfirmTarget(null)}>
                Cancel
              </button>
              <button className="delete-confirm-btn" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isGcashPreviewOpen && (
        <div className="done-confirm-overlay">
          <div className="done-confirm-modal gcash-preview-modal">
            <h3>GCash Face-to-Face Payment</h3>
            <p>Show this QR to your client during meetup.</p>

            <div className="gcash-preview-body">
              <img src={gcashQrImageUrl} alt="GCash QR" className="gcash-preview-qr" />
              <div className="gcash-preview-details">
                <p><strong>GCash Number:</strong> {gcashNumber}</p>
                <p className="done-confirm-note">
                  Ask your client to scan this QR or send payment to the number above.
                </p>
              </div>
            </div>

            <div className="done-confirm-actions">
              <button className="done-cancel-btn" onClick={handleCloseGcashPreview}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CHAT MODAL */}
      {selectedChatId && selectedInquiry && (
        <SimulatedChat
          inquiry={selectedInquiry}
          onClose={handleCloseChat}
        />
      )}

      {/* SLOT EDIT MODAL */}
      <SlotEditModal
        isOpen={editSlotModalOpen}
        mode={scheduleMode}
        slotData={editSlotData}
        dayLabel={editSlotDayKey || 'Calendar Date'}
        modalTitle={
          scheduleMode === 'calendar-only'
            ? slotModalType === 'add'
              ? 'Add Available Date'
              : 'Edit Available Date'
            : `Edit Time Slot - ${editSlotDayKey || 'Day'}`
        }
        submitLabel={slotModalType === 'add' ? 'Add Date' : 'Save Changes'}
        onSave={handleSaveSlotEdit}
        onClose={closeSlotModal}
      />

      {/* PROFILE EDIT MODAL */}
      <ProfileEditModal
        isOpen={profileEditModalOpen}
        profileData={currentProfile}
        onSave={handleSaveProfileEdit}
        onClose={() => setProfileEditModalOpen(false)}
      />

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          onLogout && onLogout();
        }}
      />
    </div>
  );
};

export default MyWork;
