/**
 * MockWorkers.js
 * 
 * Comprehensive mock data for multiple workers with different:
 * - Rate basis types (per-hour, per-day, per-project)
 * - Booking modes (with-slots, calendar-only)
 * - Schedules and availability
 * - Transaction history
 */

// ============ MULTIPLE WORKERS WITH DIFFERENT RATE BASIS ============

export const MOCK_WORKERS = [
  {
    id: 1,
    fullName: 'Joshua Paul Santos',
    serviceType: 'Pilot Service for Valorant',
    customServiceType: null,
    description: 'Professional Valorant coaching and rank support services',
    pricingModel: 'hourly',
    hourlyRate: 250,
    dailyRate: null,
    projectRate: null,
    paymentAdvance: true,
    paymentAfterService: true,
    afterServicePaymentType: 'both',
    gcashNumber: '09054891105',
    bookingMode: 'with-slots',
    rateBasis: 'per-hour',
    location: { barangay: 'Sabang', city: 'Baliwag', province: 'Bulacan' },
  },
  {
    id: 2,
    fullName: 'Maria Garcia',
    serviceType: 'Tutor',
    customServiceType: null,
    description: 'Expert Math and Science tutor for high school and college students',
    pricingModel: 'hourly',
    hourlyRate: 300,
    dailyRate: null,
    projectRate: null,
    paymentAdvance: false,
    paymentAfterService: true,
    afterServicePaymentType: 'cash-only',
    gcashNumber: '09123456789',
    bookingMode: 'with-slots',
    rateBasis: 'per-hour',
    location: { barangay: 'Binakayan', city: 'Kawit', province: 'Cavite' },
  },
  {
    id: 3,
    fullName: 'Carlos Reyes',
    serviceType: 'Cleaner',
    customServiceType: null,
    description: 'Professional house and office cleaning services',
    pricingModel: 'fixed',
    hourlyRate: null,
    dailyRate: 1500,
    projectRate: null,
    paymentAdvance: true,
    paymentAfterService: true,
    afterServicePaymentType: 'both',
    gcashNumber: '09198765432',
    bookingMode: 'calendar-only',
    rateBasis: 'per-day',
    location: { barangay: 'Malabon', city: 'Malabon', province: 'NCR' },
  },
  {
    id: 4,
    fullName: 'Angela Cruz',
    serviceType: 'Designer',
    customServiceType: null,
    description: 'Graphic design, UI/UX, and branding specialist',
    pricingModel: 'inquiry',
    hourlyRate: null,
    dailyRate: null,
    projectRate: 5000,
    paymentAdvance: true,
    paymentAfterService: true,
    afterServicePaymentType: 'gcash-only',
    gcashNumber: '09234567890',
    bookingMode: 'calendar-only',
    rateBasis: 'per-project',
    location: { barangay: 'Makati', city: 'Makati', province: 'NCR' },
  },
  {
    id: 5,
    fullName: 'Roberto Santos',
    serviceType: 'Technician',
    customServiceType: null,
    description: 'Electronics repair and troubleshooting specialist',
    pricingModel: 'fixed',
    hourlyRate: null,
    dailyRate: 2000,
    projectRate: null,
    paymentAdvance: false,
    paymentAfterService: true,
    afterServicePaymentType: 'both',
    gcashNumber: '09345678901',
    bookingMode: 'with-slots',
    rateBasis: 'per-day',
    location: { barangay: 'Quezon City', city: 'Quezon City', province: 'NCR' },
  },
  {
    id: 6,
    fullName: 'Sofia Mendez',
    serviceType: 'Web Developer',
    customServiceType: null,
    description: 'Full-stack web development and custom application solutions',
    pricingModel: 'inquiry',
    hourlyRate: null,
    dailyRate: null,
    projectRate: 15000,
    paymentAdvance: true,
    paymentAfterService: true,
    afterServicePaymentType: 'gcash-only',
    gcashNumber: '09456789012',
    bookingMode: 'calendar-only',
    rateBasis: 'per-project',
    location: { barangay: 'Taguig', city: 'Taguig', province: 'NCR' },
  },
];

// ============ HOURLY RATE WORKER SLOTS (Joshua Paul Santos) ============

export const HOURLY_WORKER_SCHEDULE = {
  Mon: [
    {
      id: 'mon-1',
      startTime: '09:00',
      endTime: '11:00',
      capacity: 3,
      slotsLeft: 1,
      bookings: [
        { clientName: 'Alice Wong', service: 'Coaching Session' },
        { clientName: 'Bob Lee', service: 'Coaching Session' },
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
        { clientName: 'Carol Kim', service: 'Rank Support' },
        { clientName: 'Diana Ng', service: 'Rank Support' },
        { clientName: 'Eva dela Cruz', service: 'Strategy Session' },
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
        { clientName: 'Frank Santos', service: 'Coaching Session' },
      ],
    },
    {
      id: 'wed-2',
      startTime: '15:00',
      endTime: '17:00',
      capacity: 2,
      slotsLeft: 1,
      bookings: [
        { clientName: 'Grace Reyes', service: 'Rank Support' },
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
        { clientName: 'Henry Lopez', service: 'Coaching Session' },
        { clientName: 'Iris Tan', service: 'Strategy Session' },
      ],
    },
    {
      id: 'fri-2',
      startTime: '14:00',
      endTime: '16:00',
      capacity: 3,
      slotsLeft: 1,
      bookings: [
        { clientName: 'Jack Santos', service: 'Rank Support' },
        { clientName: 'Kate Flores', service: 'Coaching Session' },
      ],
    },
  ],
  Sat: [
    {
      id: 'sat-1',
      startTime: '10:00',
      endTime: '12:00',
      capacity: 2,
      slotsLeft: 0,
      bookings: [
        { clientName: 'Liam Chen', service: 'Coaching Session' },
        { clientName: 'Mona Torres', service: 'Rank Support' },
      ],
    },
  ],
  Sun: [],
};

// ============ DAILY RATE WORKER CALENDAR (Carlos Reyes - Cleaner) ============

export const DAILY_WORKER_CALENDAR = [
  {
    id: 'cal-dayrate-1',
    date: '2026-03-24',
    maxBookings: 4,
    booked: 3,
    note: '09:00 AM - 05:00 PM • Available for 3-4 bedroom houses',
    service: 'House Cleaning',
  },
  {
    id: 'cal-dayrate-2',
    date: '2026-03-25',
    maxBookings: 3,
    booked: 1,
    note: '08:00 AM - 12:00 PM • Morning slots for office cleaning',
    service: 'Office Cleaning',
  },
  {
    id: 'cal-dayrate-3',
    date: '2026-03-26',
    maxBookings: 4,
    booked: 2,
    note: '09:00 AM - 05:00 PM • Full day available',
    service: 'House Cleaning',
  },
  {
    id: 'cal-dayrate-4',
    date: '2026-03-27',
    maxBookings: 2,
    booked: 0,
    note: 'Flexible scheduling - day off available',
    service: 'Cleaning',
  },
  {
    id: 'cal-dayrate-5',
    date: '2026-03-28',
    maxBookings: 4,
    booked: 3,
    note: '09:00 AM - 05:00 PM • Almost full',
    service: 'House Cleaning',
  },
  {
    id: 'cal-dayrate-6',
    date: '2026-03-29',
    maxBookings: 3,
    booked: 2,
    note: '08:00 AM - 04:00 PM • Morning availability',
    service: 'Home Decluttering',
  },
  {
    id: 'cal-dayrate-7',
    date: '2026-03-30',
    maxBookings: 4,
    booked: 1,
    note: '09:00 AM - 05:00 PM • Multiple slots open',
    service: 'Office Cleaning',
  },
];

// ============ PROJECT RATE WORKER CALENDAR (Angela Cruz - Designer) ============

export const PROJECT_WORKER_CALENDAR = [
  {
    id: 'cal-proj-1',
    date: '2026-03-24',
    maxBookings: 2,
    booked: 1,
    note: 'Consultation available • Logo design project in progress',
    service: 'Logo Design',
  },
  {
    id: 'cal-proj-2',
    date: '2026-03-25',
    maxBookings: 1,
    booked: 0,
    note: 'Free for UI/UX consultation',
    service: 'UI/UX Design',
  },
  {
    id: 'cal-proj-3',
    date: '2026-03-27',
    maxBookings: 2,
    booked: 2,
    note: 'Fully booked • Branding consultation + Website design',
    service: 'Branding',
  },
  {
    id: 'cal-proj-4',
    date: '2026-03-28',
    maxBookings: 1,
    booked: 1,
    note: 'Consultation slot taken • Social media kit project',
    service: 'Social Media Kit',
  },
  {
    id: 'cal-proj-5',
    date: '2026-03-29',
    maxBookings: 2,
    booked: 0,
    note: 'Available for new projects',
    service: 'Any Design Service',
  },
  {
    id: 'cal-proj-6',
    date: '2026-03-30',
    maxBookings: 1,
    booked: 0,
    note: 'Open for consultations and project quotes',
    service: 'Design Consultation',
  },
];

// ============ DAILY RATE WITH SLOTS (Roberto Santos - Technician) ============

export const DAILY_SLOTS_SCHEDULE = {
  Mon: [
    {
      id: 'techmon-1',
      startTime: '08:00',
      endTime: '12:00',
      capacity: 2,
      slotsLeft: 0,
      bookings: [
        { clientName: 'Paul Aquino', service: 'Phone Repair' },
        { clientName: 'Quinn Lee', service: 'Laptop Repair' },
      ],
    },
    {
      id: 'techmon-2',
      startTime: '13:00',
      endTime: '17:00',
      capacity: 2,
      slotsLeft: 1,
      bookings: [
        { clientName: 'Rita Domingo', service: 'TV Repair' },
      ],
    },
  ],
  Tue: [
    {
      id: 'techtue-1',
      startTime: '08:00',
      endTime: '12:00',
      capacity: 2,
      slotsLeft: 1,
      bookings: [
        { clientName: 'Samuel Torres', service: 'Phone Repair' },
      ],
    },
  ],
  Wed: [
    {
      id: 'techwed-1',
      startTime: '09:00',
      endTime: '13:00',
      capacity: 2,
      slotsLeft: 2,
      bookings: [],
    },
    {
      id: 'techwed-2',
      startTime: '14:00',
      endTime: '18:00',
      capacity: 1,
      slotsLeft: 0,
      bookings: [
        { clientName: 'Tanya Villanueva', service: 'Laptop Repair' },
      ],
    },
  ],
  Thu: [
    {
      id: 'techthu-1',
      startTime: '08:00',
      endTime: '12:00',
      capacity: 2,
      slotsLeft: 1,
      bookings: [
        { clientName: 'Ulysses Castro', service: 'Phone Repair' },
      ],
    },
  ],
  Fri: [
    {
      id: 'techfri-1',
      startTime: '08:00',
      endTime: '12:00',
      capacity: 2,
      slotsLeft: 2,
      bookings: [],
    },
  ],
};

// ============ PROJECT RATE WITH SLOTS (Sofia Mendez - Developer) ============

export const PROJECT_SLOTS_SCHEDULE = {
  Mon: [
    {
      id: 'devmon-1',
      startTime: '10:00',
      endTime: '13:00',
      capacity: 1,
      slotsLeft: 0,
      bookings: [
        { clientName: 'Victor Reyes', service: 'Web App Consultation' },
      ],
    },
  ],
  Tue: [
    {
      id: 'devtue-1',
      startTime: '14:00',
      endTime: '17:00',
      capacity: 1,
      slotsLeft: 1,
      bookings: [],
    },
  ],
  Wed: [
    {
      id: 'devwed-1',
      startTime: '09:00',
      endTime: '12:00',
      capacity: 1,
      slotsLeft: 0,
      bookings: [
        { clientName: 'Wendy Santos', service: 'Database Design' },
      ],
    },
  ],
  Thu: [
    {
      id: 'devthu-1',
      startTime: '10:00',
      endTime: '13:00',
      capacity: 1,
      slotsLeft: 1,
      bookings: [],
    },
  ],
  Fri: [
    {
      id: 'devfri-1',
      startTime: '14:00',
      endTime: '17:00',
      capacity: 1,
      slotsLeft: 0,
      bookings: [
        { clientName: 'Xavier Gonzalez', service: 'Frontend Development' },
      ],
    },
  ],
};

// ============ HOURLY WORKER CALENDAR (Maria Garcia - Tutor) ============

export const HOURLY_CALENDAR = [
  {
    id: 'cal-hourly-1',
    date: '2026-03-24',
    maxBookings: 3,
    booked: 2,
    note: 'Evening sessions 6-9 PM available',
    service: 'Math Tutoring',
  },
  {
    id: 'cal-hourly-2',
    date: '2026-03-25',
    maxBookings: 3,
    booked: 1,
    note: 'Morning and afternoon slots open',
    service: 'Science Tutoring',
  },
  {
    id: 'cal-hourly-3',
    date: '2026-03-26',
    maxBookings: 2,
    booked: 0,
    note: 'Full day available for individual or group sessions',
    service: 'Tutoring',
  },
  {
    id: 'cal-hourly-4',
    date: '2026-03-27',
    maxBookings: 4,
    booked: 3,
    note: 'Almost full - one slot remaining',
    service: 'Math Tutoring',
  },
  {
    id: 'cal-hourly-5',
    date: '2026-03-28',
    maxBookings: 3,
    booked: 2,
    note: 'Flexible hours - can accommodate special requests',
    service: 'Science Tutoring',
  },
];

// ============ COMPREHENSIVE TRANSACTION HISTORY ============

export const COMPREHENSIVE_TRANSACTIONS = [
  // Hourly rate (Joshua - Valorant Coach)
  { id: 'txn-1', clientName: 'Alice Wong', service: 'Coaching Session', scheduleRef: 'mon-1', paymentMode: 'Advance', isPaid: true, isDone: true, weekOffset: 0 },
  { id: 'txn-2', clientName: 'Bob Lee', service: 'Coaching Session', scheduleRef: 'mon-1', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: 0 },
  { id: 'txn-3', clientName: 'Carol Kim', service: 'Rank Support', scheduleRef: 'tue-1', paymentMode: 'Advance', isPaid: true, isDone: true, weekOffset: 0 },
  { id: 'txn-4', clientName: 'Diana Ng', service: 'Rank Support', scheduleRef: 'tue-1', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: 0 },
  { id: 'txn-5', clientName: 'Frank Santos', service: 'Coaching Session', scheduleRef: 'wed-1', paymentMode: 'Advance', isPaid: true, isDone: false, weekOffset: 0 },
  { id: 'txn-6', clientName: 'Henry Lopez', service: 'Coaching Session', scheduleRef: 'fri-1', paymentMode: 'Advance', isPaid: false, isDone: false, weekOffset: 0 },

  // Daily rate (Carlos - Cleaner)
  { id: 'txn-7', clientName: 'Miguel Reyes', service: 'House Cleaning', scheduleRef: 'cal-dayrate-1', paymentMode: 'Advance', isPaid: true, isDone: true, weekOffset: 0 },
  { id: 'txn-8', clientName: 'Nina Flores', service: 'Office Cleaning', scheduleRef: 'cal-dayrate-2', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: 0 },
  { id: 'txn-9', clientName: 'Oscar Cruz', service: 'House Cleaning', scheduleRef: 'cal-dayrate-3', paymentMode: 'Advance', isPaid: true, isDone: true, weekOffset: 0 },

  // Project rate (Angela - Designer)
  { id: 'txn-10', clientName: 'Paul Gutierrez', service: 'Logo Design', scheduleRef: 'cal-proj-1', paymentMode: 'Advance', isPaid: true, isDone: false, weekOffset: 0 },
  { id: 'txn-11', clientName: 'Rita Santiago', service: 'Branding', scheduleRef: 'cal-proj-3', paymentMode: 'Advance', isPaid: true, isDone: true, weekOffset: 0 },

  // Daily rate with slots (Roberto - Technician)
  { id: 'txn-12', clientName: 'Paul Aquino', service: 'Phone Repair', scheduleRef: 'techmon-1', paymentMode: 'After Service', isPaid: false, isDone: true, weekOffset: 0 },
  { id: 'txn-13', clientName: 'Quinn Lee', service: 'Laptop Repair', scheduleRef: 'techmon-1', paymentMode: 'Advance', isPaid: true, isDone: false, weekOffset: 0 },
  { id: 'txn-14', clientName: 'Rita Domingo', service: 'TV Repair', scheduleRef: 'techmon-2', paymentMode: 'Advance', isPaid: true, isDone: true, weekOffset: 0 },

  // Project rate with slots (Sofia - Developer)
  { id: 'txn-15', clientName: 'Victor Reyes', service: 'Web App Consultation', scheduleRef: 'devmon-1', paymentMode: 'Advance', isPaid: true, isDone: false, weekOffset: 0 },
  { id: 'txn-16', clientName: 'Wendy Santos', service: 'Database Design', scheduleRef: 'devwed-1', paymentMode: 'Advance', isPaid: true, isDone: true, weekOffset: 0 },

  // Hourly calendar (Maria - Tutor)
  { id: 'txn-17', clientName: 'Xavier Chen', service: 'Math Tutoring', scheduleRef: 'cal-hourly-1', paymentMode: 'After Service', isPaid: false, isDone: false, weekOffset: 0 },
  { id: 'txn-18', clientName: 'Yuki Nakamura', service: 'Science Tutoring', scheduleRef: 'cal-hourly-2', paymentMode: 'Advance', isPaid: true, isDone: true, weekOffset: 0 },
];

export default {
  MOCK_WORKERS,
  HOURLY_WORKER_SCHEDULE,
  DAILY_WORKER_CALENDAR,
  PROJECT_WORKER_CALENDAR,
  DAILY_SLOTS_SCHEDULE,
  PROJECT_SLOTS_SCHEDULE,
  HOURLY_CALENDAR,
  COMPREHENSIVE_TRANSACTIONS,
};
