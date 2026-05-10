// ============================================================================
// BOOKING SERVICE - Data and Operation Layer
// ============================================================================
// Purpose: Centralized booking data management and API operations
// Pattern: Service layer for MVC architecture - handles all data operations
// 
// Exports:
// - getMockBookings(): Initial booking data
// - Booking operation functions (approve, reject, payment, refund, rating, etc.)
// ============================================================================

// Mock Bookings Data - Extracted from MyBookings.jsx initial state
export const getMockBookings = () => [
  {
    id: 1,
    workerId: 101,
    workerName: 'Maria Santos',
    serviceType: 'House Cleaning',
    status: 'Negotiating',
    requestDate: '2026-03-20',
    description: 'Full house cleaning (3 bedrooms)',
    quoteAmount: 2500,
    quoteApproved: false,
    selectedSlot: null,
    paymentMethod: null,
    allowGcashAdvance: true,
    allowAfterService: true,
    afterServicePaymentType: 'both',
  },
  {
    id: 2,
    workerId: 102,
    workerName: 'Juan dela Cruz',
    serviceType: 'Tutoring',
    status: 'Active Service',
    requestDate: '2026-03-19',
    description: 'Math tutoring - High School Level (recurring weekly sessions)',
    quoteAmount: 3200,
    quoteApproved: true,
    selectedSlot: null,
    paymentMethod: 'after-service-gcash',
    allowGcashAdvance: true,
    allowAfterService: true,
    afterServicePaymentType: 'both',
    gcashNumber: '09054891105',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=png&data=09054891105',
    billingCycle: 'weekly',
    serviceActive: true,
    lastChargeDate: '2026-03-14',
    nextChargeDate: '2026-03-21',
    stopRequested: false,
    workerStopApproved: false,
  },
  {
    id: 3,
    workerId: 103,
    workerName: 'Ana Reyes',
    serviceType: 'Electrical Repair',
    status: 'Quote Sent',
    requestDate: '2026-03-15',
    description: 'Fix broken circuit breaker',
    quoteAmount: 1500,
    quoteApproved: false,
    selectedSlot: null,
    paymentMethod: null,
    allowGcashAdvance: true,
    allowAfterService: true,
    afterServicePaymentType: 'gcash-only',
  },
  {
    id: 4,
    workerId: 104,
    workerName: 'Carlo Mendoza',
    serviceType: 'Aircon Cleaning',
    status: 'Completed Service',
    requestDate: '2026-03-10',
    description: '1.5HP split-type indoor and outdoor cleaning',
    quoteAmount: 1800,
    quoteApproved: true,
    selectedSlot: {
      date: '2026-03-12',
      timeBlock: { id: 'morning', startTime: '09:00 AM', endTime: '11:00 AM', slotsLeft: 0 },
    },
    paymentMethod: 'gcash-advance',
    allowGcashAdvance: true,
    allowAfterService: true,
    afterServicePaymentType: 'both',
    gcashNumber: '09054891105',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=png&data=09054891105',
    paymentProofSubmitted: false,
    paymentReference: 'GCASH-TRX-20260312-4-8832',
    transactionId: 'GCASH-TRX-20260312-4-8832',
    canRate: false,
    rating: null,
    review: '',
  },
  {
    id: 5,
    workerId: 105,
    workerName: 'Joshua Paul Santos',
    serviceType: 'Pilot Service for Valorant',
    status: 'Awaiting GCash Payment',
    requestDate: '2026-03-20',
    description: 'Rank support session - one game set',
    quoteAmount: 200,
    quoteApproved: true,
    selectedSlot: {
      date: '2026-03-22',
      timeBlock: { id: 'night', startTime: '08:00 PM', endTime: '10:00 PM', slotsLeft: 0 },
    },
    paymentMethod: 'gcash-advance',
    allowGcashAdvance: true,
    allowAfterService: true,
    afterServicePaymentType: 'both',
    gcashNumber: '09054891105',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=png&data=09054891105',
    paymentProofSubmitted: false,
    paymentReference: '',
    canRate: false,
    rating: null,
    review: '',
  },
  {
    id: 6,
    workerId: 106,
    workerName: 'Lara De Jesus',
    serviceType: 'Pet Grooming',
    status: 'Service Scheduled',
    requestDate: '2026-03-21',
    description: 'Home service grooming for small breed dog',
    quoteAmount: 950,
    quoteApproved: true,
    selectedSlot: {
      date: '2026-03-23',
      timeBlock: { id: 'afternoon', startTime: '02:00 PM', endTime: '04:00 PM', slotsLeft: 0 },
    },
    paymentMethod: 'after-service-cash',
    allowGcashAdvance: false,
    allowAfterService: true,
    afterServicePaymentType: 'cash-only',
    paymentProofSubmitted: false,
    paymentReference: '',
    transactionId: '',
    cashConfirmationStatus: 'awaiting-client-scan',
    cashVerifierQrId: 'CASHQR-106-20260323',
    submittedCashAmount: null,
    canRate: false,
    rating: null,
    review: '',
  },
  {
    id: 7,
    workerId: 107,
    workerName: 'Ralph Mendoza',
    serviceType: 'Academic Mentoring',
    status: 'Active Service',
    requestDate: '2026-03-01',
    description: 'Monthly mentoring plan with weekly progress check-ins',
    quoteAmount: 12000,
    quoteApproved: true,
    selectedSlot: null,
    paymentMethod: 'after-service-gcash',
    allowGcashAdvance: true,
    allowAfterService: true,
    afterServicePaymentType: 'both',
    gcashNumber: '09054891105',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=png&data=09054891105',
    paymentProofSubmitted: false,
    paymentReference: '',
    canRate: false,
    rating: null,
    review: '',
    billingCycle: 'monthly',
    serviceActive: true,
    lastChargeDate: '2026-02-21',
    nextChargeDate: '2026-03-23',
    stopRequested: false,
    workerStopApproved: false,
  },
  {
    id: 8,
    workerId: 108,
    workerName: 'Diane Flores',
    serviceType: 'Home Plumbing Repair',
    status: 'Completed Service',
    requestDate: '2026-03-16',
    description: 'Kitchen sink leak fix with valve replacement.',
    quoteAmount: 1450,
    quoteApproved: true,
    selectedSlot: {
      date: '2026-03-18',
      timeBlock: { id: 'late-afternoon', startTime: '04:00 PM', endTime: '06:00 PM', slotsLeft: 0 },
    },
    paymentMethod: 'after-service-cash',
    allowGcashAdvance: false,
    allowAfterService: true,
    afterServicePaymentType: 'cash-only',
    paymentProofSubmitted: true,
    paymentReference: 'CASH-TRX-20260318-8-4517',
    transactionId: 'CASH-TRX-20260318-8-4517',
    cashConfirmationStatus: 'approved',
    cashVerifierQrId: 'CASHQR-108-20260318',
    submittedCashAmount: 1450,
    canRate: true,
    rating: 5,
    review: 'Secure and smooth payment confirmation flow.',
  },
  {
    id: 9,
    workerId: 109,
    workerName: 'Nico Alvarez',
    serviceType: 'Home Deep Cleaning',
    status: 'Cancelled (Cash)',
    requestDate: '2026-03-22',
    description: 'Client cancelled a cash-on-service booking before meetup.',
    quoteAmount: 2200,
    quoteApproved: true,
    selectedSlot: {
      date: '2026-03-24',
      timeBlock: { id: 'morning', startTime: '10:00 AM', endTime: '12:00 PM', slotsLeft: 0 },
    },
    paymentMethod: 'after-service-cash',
    allowGcashAdvance: false,
    allowAfterService: true,
    afterServicePaymentType: 'cash-only',
    cancellationReason: 'Client requested cancellation due to schedule conflict.',
    cancelledBy: 'Client',
    canRate: false,
    rating: null,
    review: '',
  },
  {
    id: 10,
    workerId: 110,
    workerName: 'Mara Lim',
    serviceType: 'Weekly Tutoring',
    status: 'Refund Processing',
    requestDate: '2026-03-17',
    description: 'Advance payment received, then service was cancelled and refund was initiated.',
    quoteAmount: 2800,
    quoteApproved: true,
    selectedSlot: {
      date: '2026-03-19',
      timeBlock: { id: 'night', startTime: '07:00 PM', endTime: '09:00 PM', slotsLeft: 0 },
    },
    paymentMethod: 'gcash-advance',
    allowGcashAdvance: true,
    allowAfterService: true,
    afterServicePaymentType: 'both',
    gcashNumber: '09054891105',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=png&data=09054891105',
    paymentProofSubmitted: true,
    paymentReference: 'GCASH-TRX-20260318-10-6821',
    transactionId: 'GCASH-TRX-20260318-10-6821',
    refundStatus: 'processing',
    refundAmount: 2800,
    refundReference: 'REFUND-REQ-20260324-10',
    refundReason: 'Worker unavailable for scheduled date.',
    canRate: false,
    rating: null,
    review: '',
  },
  {
    id: 11,
    workerId: 111,
    workerName: 'Rico Santos',
    serviceType: 'Website Design',
    status: 'Completed Service',
    requestDate: '2026-03-23',
    description: 'Landing page completed, but client requested a partial refund due to missing sections.',
    quoteAmount: 4200,
    quoteApproved: true,
    selectedSlot: {
      date: '2026-03-25',
      timeBlock: { id: 'afternoon', startTime: '01:00 PM', endTime: '03:00 PM', slotsLeft: 0 },
    },
    paymentMethod: 'gcash-advance',
    allowGcashAdvance: true,
    allowAfterService: false,
    afterServicePaymentType: 'gcash-only',
    paymentProofSubmitted: true,
    paymentReference: 'GCASH-TRX-20260325-11-8841',
    transactionId: 'GCASH-TRX-20260325-11-8841',
    refundEligible: true,
    refundStatus: null,
    refundReason: 'Client requested a partial refund after delivery review.',
    refundReference: null,
    canRate: true,
    rating: 4,
    review: 'Good work, but not everything requested was included.',
  },
];

// ============================================================================
// BOOKING OPERATIONS - Service methods (handlers for controllers)
// ============================================================================
// Note: These are currently mock operations. Later connect to Supabase.
// Each operation receives data and returns updated data structure.

export const bookingService = {
  // ========================================================================
  // QUOTE OPERATIONS
  // ========================================================================
  
  /**
   * Approve a quote
   * Updates booking: quoteApproved = true, status = 'Awaiting Slot Selection'
   */
  approveQuote: (bookingId) => {
    // Mock implementation - would call API in production
    return { bookingId, quoteApproved: true };
  },

  /**
   * Reject a quote
   * Updates booking: quoteApproved = false, status = 'Quote Rejected'
   */
  rejectQuote: (bookingId, reason) => {
    // Mock implementation
    return { bookingId, quoteApproved: false, quoteRejectionReason: reason };
  },

  // ========================================================================
  // SLOT OPERATIONS
  // ========================================================================
  
  /**
   * Confirm slot selection
   * Updates booking: selectedSlot, status = 'Slot Selected - Payment Pending'
   */
  confirmSlot: (bookingId, slotInfo) => {
    // Mock implementation
    return { bookingId, selectedSlot: slotInfo, status: 'Slot Selected - Payment Pending' };
  },

  // ========================================================================
  // PAYMENT OPERATIONS
  // ========================================================================
  
  /**
   * Submit payment proof (for GCash payments)
   * Updates booking: paymentProofSubmitted = true, paymentReference, status
   */
  submitPaymentProof: (bookingId, referenceNo, isRecurringBilling) => {
    // Mock implementation
    return {
      bookingId,
      paymentProofSubmitted: true,
      paymentReference: referenceNo,
      status: isRecurringBilling ? 'Active Service' : 'Payment Submitted',
    };
  },

  /**
   * Select payment method
   * Updates booking: paymentMethod, status, cashConfirmationStatus (if cash)
   */
  selectPaymentMethod: (bookingId, paymentMethod) => {
    // Mock implementation
    const updates = {
      bookingId,
      paymentMethod,
      status: paymentMethod === 'gcash-advance' ? 'Payment Confirmed' : 'Service Scheduled',
    };

    if (paymentMethod === 'after-service-cash') {
      updates.cashConfirmationStatus = 'awaiting-client-scan';
    }

    return updates;
  },

  /**
   * Submit cash confirmation
   * Updates booking: cashConfirmationStatus, submittedCashAmount, status
   */
  submitCashConfirmation: (bookingId, amount) => {
    // Mock implementation
    return {
      bookingId,
      cashConfirmationStatus: 'pending-worker-review',
      submittedCashAmount: amount,
      status: 'Cash Verification Pending',
    };
  },

  // ========================================================================
  // REFUND OPERATIONS
  // ========================================================================
  
  /**
   * Request refund
   * Updates booking: refundStatus, refundReason, refundAmount, status
   */
  requestRefund: (bookingId, reason, quoteAmount) => {
    // Mock implementation
    return {
      bookingId,
      refundStatus: 'requested',
      refundReason: reason,
      refundAmount: quoteAmount,
      status: 'Refund Processing',
    };
  },

  /**
   * Confirm refund received
   * Updates booking: refundStatus = 'approved', status = 'Refunded'
   */
  confirmRefundReceived: (bookingId) => {
    // Mock implementation
    return {
      bookingId,
      refundStatus: 'approved',
      status: 'Refunded',
    };
  },

  // ========================================================================
  // RATING OPERATIONS
  // ========================================================================
  
  /**
   * Submit rating and review
   * Updates booking: rating, review, canRate = false
   */
  submitRating: (bookingId, ratingValue, ratingComment) => {
    // Mock implementation
    return {
      bookingId,
      rating: ratingValue,
      review: ratingComment,
      canRate: false,
    };
  },

  // ========================================================================
  // SERVICE CONTROL OPERATIONS
  // ========================================================================
  
  /**
   * Stop service (for recurring bookings)
   * Updates booking: status = 'Service Stopped', serviceActive = false
   */
  stopService: (bookingId) => {
    // Mock implementation
    return {
      bookingId,
      status: 'Service Stopped',
      serviceActive: false,
      stopRequested: true,
      workerStopApproved: true,
      canRate: true,
      nextChargeDate: null,
    };
  },

  // ========================================================================
  // UTILITY FUNCTIONS - Used by controllers for data manipulation
  // ========================================================================
  
  /**
   * Parse date (helper for date calculations)
   */
  parseDateOnly: (dateString) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  },

  /**
   * Add days to date (helper for recurring billing)
   */
  addDaysToDate: (dateString, days) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  },

  /**
   * Check if booking uses recurring billing
   */
  isRecurringBilling: (booking) =>
    booking.billingCycle === 'weekly' || booking.billingCycle === 'monthly',

  /**
   * Check if booking service is stopped
   */
  isBookingStopped: (booking) =>
    booking.status === 'Service Stopped' || booking.serviceActive === false,

  /**
   * Check if recurring charge is due
   */
  isRecurringChargeDue: (booking) => {
    if (!bookingService.isRecurringBilling(booking) || bookingService.isBookingStopped(booking)) {
      return false;
    }
    if (!booking.nextChargeDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingService.parseDateOnly(booking.nextChargeDate) <= today;
  },

  /**
   * Get next charge date for recurring billing
   */
  getNextChargeDate: (booking, fromDate) => {
    if (booking.billingCycle === 'weekly') {
      return bookingService.addDaysToDate(fromDate, 7);
    }
    if (booking.billingCycle === 'monthly') {
      return bookingService.addDaysToDate(fromDate, 30);
    }
    return null;
  },

  /**
   * Get billing label for display
   */
  getBillingLabel: (booking) => {
    if (booking.billingCycle === 'weekly') return 'Weekly';
    if (booking.billingCycle === 'monthly') return 'Monthly';
    return null;
  },

  /**
   * Build mock transaction ID
   */
  buildMockTransactionId: (bookingId, channel) => {
    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const suffix = String(Math.floor(Math.random() * 9000) + 1000);
    return `${channel.toUpperCase()}-TRX-${dateStamp}-${bookingId}-${suffix}`;
  },
};
