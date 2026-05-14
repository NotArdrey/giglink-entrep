import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  fetchClientBookings,
  submitBookingReview,
  updateBookingWorkflow,
} from '../services/bookingService';

const TERMINAL_STATUSES = ['Completed Service', 'Service Stopped', 'Cancelled (Cash)', 'Refunded'];

export function useBookingListController(initialBookings = [], options = {}) {
  const { autoLoad = true } = options;
  const [bookings, setBookings] = useState(Array.isArray(initialBookings) ? initialBookings : []);
  const [activeFilter, setActiveFilter] = useState('all');
  const [displayFilter, setDisplayFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(Boolean(autoLoad));
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  const refreshBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError('');
      const rows = await fetchClientBookings();
      setBookings(rows);
      return rows;
    } catch (error) {
      setLoadError(error?.message || 'Unable to load bookings.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoLoad) return undefined;
    let isMounted = true;

    const load = async () => {
      const rows = await refreshBookings();
      if (!isMounted) return;
      setBookings(rows);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [autoLoad, refreshBookings]);

  const replaceBooking = useCallback((updatedBooking) => {
    if (!updatedBooking?.id) return;
    setBookings((prevBookings) => {
      const exists = prevBookings.some((booking) => booking.id === updatedBooking.id);
      if (!exists) return [updatedBooking, ...prevBookings];
      return prevBookings.map((booking) => (
        booking.id === updatedBooking.id ? updatedBooking : booking
      ));
    });
  }, []);

  const getBooking = useCallback((bookingId) => (
    bookings.find((booking) => String(booking.id) === String(bookingId)) || null
  ), [bookings]);

  const persistBookingUpdate = useCallback(async (bookingId, updates) => {
    const current = getBooking(bookingId);
    if (!current) return null;

    try {
      setActionError('');
      const updated = updates.rating !== undefined
        ? await submitBookingReview(current, updates.rating, updates.review || '')
        : await updateBookingWorkflow(current, updates);
      replaceBooking(updated);
      return updated;
    } catch (error) {
      setActionError(error?.message || 'Unable to update booking.');
      throw error;
    }
  }, [getBooking, replaceBooking]);

  const handleApproveQuote = useCallback((bookingId) => {
    const booking = getBooking(bookingId);
    const isRequestBooking = booking?.bookingMode === 'calendar-only' || booking?.isRequestBooking;

    return persistBookingUpdate(bookingId, {
      quoteApproved: true,
      quoteRejectionReason: null,
      status: isRequestBooking ? 'Payment Pending' : 'Awaiting Slot Selection',
      dbStatus: 'pending',
    });
  }, [getBooking, persistBookingUpdate]);

  const handleRejectQuote = useCallback((bookingId, reason) => (
    persistBookingUpdate(bookingId, {
      quoteApproved: false,
      quoteRejectionReason: reason,
      status: 'Quote Rejected',
      dbStatus: 'pending',
    })
  ), [persistBookingUpdate]);

  const handleStopServiceAccepted = useCallback((bookingId) => (
    persistBookingUpdate(bookingId, {
      status: 'Service Stopped',
      serviceActive: false,
      stopRequested: true,
      workerStopApproved: true,
      canRate: true,
      nextChargeDate: null,
      dbStatus: 'completed',
    })
  ), [persistBookingUpdate]);

  const updateBooking = useCallback((bookingId, updates) => (
    persistBookingUpdate(bookingId, updates)
  ), [persistBookingUpdate]);

  const statusFilteredBookings = useMemo(() => (
    bookings.filter((booking) => {
      if (activeFilter === 'completed') {
        return TERMINAL_STATUSES.includes(booking.status) || booking.status === 'Refund Processing';
      }
      if (activeFilter === 'active') {
        return !TERMINAL_STATUSES.includes(booking.status);
      }
      return true;
    })
  ), [bookings, activeFilter]);

  const filteredBookings = useMemo(() => (
    statusFilteredBookings.filter((booking) => {
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
    })
  ), [statusFilteredBookings, displayFilter]);

  return {
    actionError,
    activeFilter,
    bookings,
    displayFilter,
    filteredBookings,
    getBooking,
    handleApproveQuote,
    handleRejectQuote,
    handleStopServiceAccepted,
    isLoading,
    loadError,
    refreshBookings,
    replaceBooking,
    setActionError,
    setActiveFilter,
    setDisplayFilter,
    setLoadError,
    updateBooking,
  };
}

