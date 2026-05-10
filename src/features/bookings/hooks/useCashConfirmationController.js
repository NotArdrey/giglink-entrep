// ============================================================================
// useCashConfirmationController.js - Cash Verification Workflow Controller Hook
// ============================================================================
// Purpose: Manages cash verification workflow with localStorage synchronization
// Responsibilities:
//   - Manage cash confirmation UI state (which booking, amount)
//   - Handle cash submission with localStorage write
//   - Sync cash requests from localStorage (2.5s polling + storage listener)
//   - Update bookings based on worker review (approve/deny)
//   - Manage UI feedback (pending, error states)
// 
// Returns: Object with state and handlers for cash confirmation workflow
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

const CASH_CONFIRMATION_REQUESTS_KEY = 'giglink_cash_confirmation_requests';

export function useCashConfirmationController(bookings, updateBooking, pushNotification) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  // Cash confirmation modal state
  const [cashConfirmBookingId, setCashConfirmBookingId] = useState(null);
  const [cashEnteredAmount, setCashEnteredAmount] = useState('');
  const [isCashAmountFocused, setIsCashAmountFocused] = useState(false);

  // Cash review feedback state
  const [cashReviewState, setCashReviewState] = useState('idle'); // 'idle' | 'pending' | 'error'
  const [cashReviewMessage, setCashReviewMessage] = useState('');

  // Payment status notification
  const [showPaymentStatusNotice, setShowPaymentStatusNotice] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');

  // ========================================================================
  // SIDE EFFECTS - localStorage Synchronization
  // ========================================================================

  /**
   * Read cash confirmation requests from localStorage
   */
  const readCashRequests = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(CASH_CONFIRMATION_REQUESTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  /**
   * Sync cash requests from localStorage and update bookings accordingly
   * This effect runs on mount, every 2.5s, and when storage event fires
   */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncCashRequests = () => {
      const requests = readCashRequests();
      if (!Array.isArray(requests) || requests.length === 0) return;

      // Process each booking to see if there's a cash confirmation update
      bookings.forEach((booking) => {
        const request = [...requests].reverse().find((item) => String(item.bookingId) === String(booking.id));
        if (!request) return;

        // Worker approved the cash confirmation
        if (request.status === 'approved') {
          updateBooking(booking.id, {
            cashConfirmationStatus: 'approved',
            paymentProofSubmitted: true,
            paymentReference: request.transactionId || booking.paymentReference,
            transactionId: request.transactionId || booking.transactionId,
            canRate: true,
            status: 'Completed Service',
          });
        }

        // Worker denied the cash confirmation
        if (request.status === 'denied') {
          updateBooking(booking.id, {
            cashConfirmationStatus: 'denied',
            status: 'Cash Verification Denied',
          });
        }

        // Worker still reviewing
        if (request.status === 'pending-worker-review') {
          updateBooking(booking.id, {
            cashConfirmationStatus: 'pending-worker-review',
            submittedCashAmount: request.submittedCashAmount ?? booking.submittedCashAmount,
            status: 'Cash Verification Pending',
          });
        }
      });
    };

    // Initial sync on mount
    syncCashRequests();

    // Periodic sync every 2.5 seconds
    const interval = window.setInterval(syncCashRequests, 2500);

    // Sync when localStorage changes (from another tab/window)
    const handleStorage = (event) => {
      if (event.key === CASH_CONFIRMATION_REQUESTS_KEY) {
        syncCashRequests();
      }
    };

    window.addEventListener('storage', handleStorage);

    // Cleanup
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [bookings, updateBooking, readCashRequests]);

  // ========================================================================
  // HANDLER FUNCTIONS - Cash Workflow
  // ========================================================================

  /**
   * Open cash confirmation modal for a specific booking
   */
  const handleOpenCashConfirmModal = useCallback((bookingId) => {
    setCashConfirmBookingId(bookingId);
    setCashEnteredAmount('');
    setCashReviewState('idle');
    setCashReviewMessage('');
  }, []);

  /**
   * Submit cash confirmation amount
   * Validates amount, writes to localStorage, updates booking state, shows notification
   */
  const handleSubmitCashConfirmation = useCallback((booking) => {
    if (!cashConfirmBookingId) return;

    // Validate amount
    const parsedAmount = Number(cashEnteredAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setCashReviewMessage('Enter a valid cash amount before sending for worker review.');
      setCashReviewState('error');
      return;
    }

    // Mark as pending submission
    setCashReviewState('pending');
    setCashReviewMessage('Cash confirmation sent to the worker review queue.');

    // Update booking UI state
    updateBooking(booking.id, {
      cashConfirmationStatus: 'pending-worker-review',
      submittedCashAmount: parsedAmount,
      status: 'Cash Verification Pending',
      paymentProofSubmitted: true,
      transactionId: '',
      paymentReference: '',
    });

    // Write to localStorage for worker review queue
    const existingRequests = readCashRequests();
    const requestId = `cash-request-${cashConfirmBookingId}-${Date.now()}`;

    const nextRequests = [
      ...existingRequests.filter((request) => String(request.bookingId) !== String(cashConfirmBookingId)),
      {
        id: requestId,
        bookingId: cashConfirmBookingId,
        clientName: 'Client',
        workerName: booking.workerName,
        serviceType: booking.serviceType,
        submittedCashAmount: parsedAmount,
        expectedCashAmount: booking.quoteAmount,
        status: 'pending-worker-review',
        transactionId: '',
        createdAt: new Date().toISOString(),
      },
    ];

    window.localStorage.setItem(CASH_CONFIRMATION_REQUESTS_KEY, JSON.stringify(nextRequests));

    // Push notification
    pushNotification?.(
      'Cash Confirmation Sent',
      `Your cash payment for ${booking.serviceType} is now waiting for worker verification.`
    );

    // Show success message
    setPaymentStatusMessage('Cash confirmation submitted. Waiting for worker verification.');
    setShowPaymentStatusNotice(true);
    setTimeout(() => setShowPaymentStatusNotice(false), 3200);

    // Update review message
    setCashReviewMessage('Your cash confirmation is now in the worker review queue.');

    // Close modal after brief delay
    setTimeout(() => {
      setCashConfirmBookingId(null);
      setCashEnteredAmount('');
    }, 500);
  }, [cashConfirmBookingId, cashEnteredAmount, updateBooking, readCashRequests, pushNotification]);

  // ========================================================================
  // RETURN OBJECT - Exposed state and handlers
  // ========================================================================
  
  return {
    // Cash confirmation modal state
    cashConfirmBookingId,
    setCashConfirmBookingId,
    cashEnteredAmount,
    setCashEnteredAmount,
    isCashAmountFocused,
    setIsCashAmountFocused,

    // Cash review feedback state
    cashReviewState,
    setCashReviewState,
    cashReviewMessage,
    setCashReviewMessage,

    // Payment status notification state
    showPaymentStatusNotice,
    setShowPaymentStatusNotice,
    paymentStatusMessage,
    setPaymentStatusMessage,

    // Handlers
    handleOpenCashConfirmModal,
    handleSubmitCashConfirmation,
  };
}
