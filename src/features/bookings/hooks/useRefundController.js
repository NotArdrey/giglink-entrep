// ============================================================================
// useRefundController.js - Refund Workflow Controller Hook
// ============================================================================
// Purpose: Manages refund request and processing workflow with localStorage sync
// Responsibilities:
//   - Handle refund request submission with localStorage write
//   - Sync refund requests from localStorage (2.5s polling + storage listener)
//   - Update bookings based on refund status (requested, approved, completed)
//   - Handle refund received confirmation
//   - Manage refund-related notifications
// 
// Returns: Object with handlers for refund workflows
// ============================================================================

import { useEffect, useCallback } from 'react';

const REFUND_REQUESTS_KEY = 'giglink_refund_requests';

export function useRefundController(bookings, updateBooking, pushNotification) {
  // ========================================================================
  // UTILITY FUNCTIONS - localStorage Operations
  // ========================================================================

  /**
   * Read refund requests from localStorage
   */
  const readRefundRequests = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(REFUND_REQUESTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // ========================================================================
  // SIDE EFFECTS - localStorage Synchronization
  // ========================================================================

  /**
   * Sync refund requests from localStorage and update bookings accordingly
   * This effect runs on mount, every 2.5s, and when storage event fires
   */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncRefundRequests = () => {
      const requests = readRefundRequests();
      if (!Array.isArray(requests) || requests.length === 0) return;

      // Process each booking to see if there's a refund status update
      bookings.forEach((booking) => {
        const request = [...requests].reverse().find((item) => String(item.bookingId) === String(booking.id));
        if (!request) return;

        // Refund has been completed (client confirmed receipt)
        if (request.status === 'completed') {
          updateBooking(booking.id, {
            status: 'Refunded',
            refundStatus: 'approved',
            refundReference: request.refundReference || booking.refundReference,
            refundReason: request.refundReason || booking.refundReason,
            refundAmount: request.refundAmount || booking.refundAmount || booking.quoteAmount,
          });
        }

        // Worker has approved refund, awaiting client confirmation
        if (request.status === 'approved-awaiting-client-confirmation') {
          updateBooking(booking.id, {
            status: 'Refund Processing',
            refundStatus: 'approved-awaiting-client-confirmation',
            refundReference: request.refundReference || booking.refundReference,
            refundReason: request.refundReason || booking.refundReason,
            refundAmount: request.refundAmount || booking.refundAmount || booking.quoteAmount,
          });
        }

        // Refund requested, worker is reviewing
        if (request.status === 'requested') {
          updateBooking(booking.id, {
            status: 'Refund Processing',
            refundStatus: 'requested',
            refundReference: request.refundReference || booking.refundReference,
            refundReason: request.refundReason || booking.refundReason,
            refundAmount: request.refundAmount || booking.refundAmount || booking.quoteAmount,
          });
        }
      });
    };

    // Initial sync on mount
    syncRefundRequests();

    // Periodic sync every 2.5 seconds
    const interval = window.setInterval(syncRefundRequests, 2500);

    // Sync when localStorage changes (from another tab/window)
    const handleStorage = (event) => {
      if (event.key === REFUND_REQUESTS_KEY) {
        syncRefundRequests();
      }
    };

    window.addEventListener('storage', handleStorage);

    // Cleanup
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [bookings, updateBooking, readRefundRequests]);

  // ========================================================================
  // HANDLER FUNCTIONS - Refund Workflow
  // ========================================================================

  /**
   * Request a refund
   * Writes refund request to localStorage, updates booking status
   */
  const handleRequestRefund = useCallback((booking, reason) => {
    const refundReference = `REFUND-REQ-${String(booking.id).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;

    // Read existing requests and add new one
    const existingRequests = readRefundRequests();
    const nextRequests = [
      ...existingRequests.filter((request) => String(request.bookingId) !== String(booking.id)),
      {
        id: `refund-request-${booking.id}-${Date.now()}`,
        bookingId: booking.id,
        clientName: 'Client',
        workerName: booking.workerName,
        serviceType: booking.serviceType,
        refundAmount: booking.refundAmount || booking.quoteAmount,
        refundReason: reason,
        refundReference,
        status: 'requested',
        createdAt: new Date().toISOString(),
      },
    ];

    // Write to localStorage
    window.localStorage.setItem(REFUND_REQUESTS_KEY, JSON.stringify(nextRequests));

    // Update booking state
    updateBooking(booking.id, {
      status: 'Refund Processing',
      refundStatus: 'requested',
      refundReason: reason,
      refundReference,
      refundAmount: booking.refundAmount || booking.quoteAmount,
    });

    // Push notification
    pushNotification?.(
      'Refund Requested',
      `Your refund request for ${booking.serviceType} has been submitted and is awaiting review.`
    );
  }, [readRefundRequests, updateBooking, pushNotification]);

  /**
   * Confirm that refund has been received
   * Updates localStorage to mark refund as completed, updates booking status
   */
  const handleConfirmRefundReceived = useCallback((booking) => {
    // Read existing requests
    const existingRequests = readRefundRequests();

    // Update the refund request status to completed
    const nextRequests = existingRequests.map((request) =>
      String(request.bookingId) === String(booking.id)
        ? { ...request, status: 'completed', completedAt: new Date().toISOString() }
        : request
    );

    // Write to localStorage
    window.localStorage.setItem(REFUND_REQUESTS_KEY, JSON.stringify(nextRequests));

    // Update booking state
    updateBooking(booking.id, {
      status: 'Refunded',
      refundStatus: 'approved',
    });

    // Push notification
    pushNotification?.(
      'Refund Confirmed',
      `You confirmed receiving the refund for ${booking.serviceType}.`
    );
  }, [readRefundRequests, updateBooking, pushNotification]);

  // ========================================================================
  // RETURN OBJECT - Exposed handlers
  // ========================================================================
  
  return {
    // Handlers
    handleRequestRefund,
    handleConfirmRefundReceived,
  };
}
