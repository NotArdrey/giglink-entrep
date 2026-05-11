import { useState, useCallback } from 'react';
import { submitCashConfirmation } from '../services/bookingService';

export function useCashConfirmationController(replaceBooking, pushNotification) {
  const [cashConfirmBookingId, setCashConfirmBookingId] = useState(null);
  const [cashEnteredAmount, setCashEnteredAmount] = useState('');
  const [isCashAmountFocused, setIsCashAmountFocused] = useState(false);
  const [cashReviewState, setCashReviewState] = useState('idle');
  const [cashReviewMessage, setCashReviewMessage] = useState('');
  const [showPaymentStatusNotice, setShowPaymentStatusNotice] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');

  const handleOpenCashConfirmModal = useCallback((bookingId) => {
    setCashConfirmBookingId(bookingId);
    setCashEnteredAmount('');
    setCashReviewState('idle');
    setCashReviewMessage('');
  }, []);

  const handleSubmitCashConfirmation = useCallback(async (booking) => {
    if (!cashConfirmBookingId) return null;

    try {
      setCashReviewState('pending');
      setCashReviewMessage('Sending cash confirmation to the worker review queue.');

      const updated = await submitCashConfirmation(booking, cashEnteredAmount);
      replaceBooking?.(updated);

      pushNotification?.(
        'Cash Confirmation Sent',
        `Your cash payment for ${booking.serviceType} is now waiting for worker verification.`
      );

      setPaymentStatusMessage('Cash confirmation submitted. Waiting for worker verification.');
      setShowPaymentStatusNotice(true);
      window.setTimeout(() => setShowPaymentStatusNotice(false), 3200);
      setCashReviewMessage('Your cash confirmation is now in the worker review queue.');
      setCashConfirmBookingId(null);
      setCashEnteredAmount('');
      return updated;
    } catch (error) {
      setCashReviewState('error');
      setCashReviewMessage(error?.message || 'Unable to submit cash confirmation.');
      throw error;
    }
  }, [cashConfirmBookingId, cashEnteredAmount, pushNotification, replaceBooking]);

  return {
    cashConfirmBookingId,
    cashEnteredAmount,
    cashReviewMessage,
    cashReviewState,
    handleOpenCashConfirmModal,
    handleSubmitCashConfirmation,
    isCashAmountFocused,
    paymentStatusMessage,
    setCashConfirmBookingId,
    setCashEnteredAmount,
    setCashReviewMessage,
    setCashReviewState,
    setIsCashAmountFocused,
    setPaymentStatusMessage,
    setShowPaymentStatusNotice,
    showPaymentStatusNotice,
  };
}

