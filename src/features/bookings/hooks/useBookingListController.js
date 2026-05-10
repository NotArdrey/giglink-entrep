// ============================================================================
// useBookingListController.js - Booking List & Filtering Controller Hook
// ============================================================================
// Purpose: Manages booking list state, filtering, and quote/service operations
// Responsibilities:
//   - Manage bookings array state
//   - Handle activeFilter and displayFilter states
//   - Provide filtering logic for displaying bookings
//   - Handle quote approval/rejection
//   - Handle service stop requests
// 
// Returns: Object with bookings, filteredBookings, filters, and handlers
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import { bookingService } from '../services/bookingService';

export function useBookingListController(initialBookings) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  // Core bookings data
  const [bookings, setBookings] = useState(initialBookings || []);

  // Filter states
  const [activeFilter, setActiveFilter] = useState('all');
  const [displayFilter, setDisplayFilter] = useState('all');

  // ========================================================================
  // FILTERING LOGIC - Compute filtered bookings based on filters
  // ========================================================================
  
  const terminalStatuses = ['Completed Service', 'Service Stopped', 'Cancelled (Cash)', 'Refunded'];

  const statusFilteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (activeFilter === 'completed') {
        return terminalStatuses.includes(booking.status) || booking.status === 'Refund Processing';
      }
      if (activeFilter === 'active') {
        return !terminalStatuses.includes(booking.status);
      }
      return true;
    });
  }, [bookings, activeFilter]);

  const filteredBookings = useMemo(() => {
    return statusFilteredBookings.filter((booking) => {
      if (displayFilter === 'cash-approvals') {
        return booking.paymentMethod === 'after-service-cash';
      }
      if (displayFilter === 'refunds') {
        return Boolean(booking.refundStatus) || booking.status === 'Refund Processing';
      }
      if (displayFilter === 'cancelled') {
        return booking.status === 'Cancelled (Cash)' && booking.paymentMethod === 'after-service-cash';
      }
      return true;
    });
  }, [statusFilteredBookings, displayFilter]);

  // ========================================================================
  // HANDLER FUNCTIONS - Quote & Service Operations
  // ========================================================================

  /**
   * Approve a quote
   * Updates booking status to "Awaiting Slot Selection" and sets quoteApproved = true
   */
  const handleApproveQuote = useCallback((bookingId) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, quoteApproved: true, status: 'Awaiting Slot Selection', quoteRejectionReason: null }
          : booking
      )
    );
  }, []);

  /**
   * Reject a quote
   * Updates booking status to "Quote Rejected" and stores rejection reason
   */
  const handleRejectQuote = useCallback((bookingId, reason) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              quoteApproved: false,
              status: 'Quote Rejected',
              quoteRejectionReason: reason,
            }
          : booking
      )
    );
  }, []);

  /**
   * Stop a recurring service
   * Updates booking to mark service as stopped and allows rating
   */
  const handleStopServiceAccepted = useCallback((bookingId) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: 'Service Stopped',
              serviceActive: false,
              stopRequested: true,
              workerStopApproved: true,
              canRate: true,
              nextChargeDate: null,
            }
          : booking
      )
    );
  }, []);

  /**
   * Update booking with new data (used by other controllers)
   * Generic update function for merged state changes
   */
  const updateBooking = useCallback((bookingId, updates) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, ...updates }
          : booking
      )
    );
  }, []);

  /**
   * Get a single booking by ID
   */
  const getBooking = useCallback((bookingId) => {
    return bookings.find((b) => b.id === bookingId) || null;
  }, [bookings]);

  // ========================================================================
  // RETURN OBJECT - Exposed state and handlers
  // ========================================================================
  
  return {
    // Data
    bookings,
    filteredBookings,
    getBooking,
    updateBooking,

    // Filter state & setters
    activeFilter,
    setActiveFilter,
    displayFilter,
    setDisplayFilter,

    // Handlers
    handleApproveQuote,
    handleRejectQuote,
    handleStopServiceAccepted,
  };
}
