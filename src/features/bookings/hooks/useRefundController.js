import { useCallback } from 'react';
import {
  confirmBookingRefundReceived,
  requestBookingRefund,
} from '../services/bookingService';

export function useRefundController(replaceBooking, pushNotification) {
  const handleRequestRefund = useCallback(async (booking, reason) => {
    const updated = await requestBookingRefund(booking, reason);
    replaceBooking?.(updated);
    pushNotification?.(
      'Refund Requested',
      `Your refund request for ${booking.serviceType} has been submitted and is awaiting review.`
    );
    return updated;
  }, [pushNotification, replaceBooking]);

  const handleConfirmRefundReceived = useCallback(async (booking) => {
    const updated = await confirmBookingRefundReceived(booking);
    replaceBooking?.(updated);
    pushNotification?.(
      'Refund Confirmed',
      `You confirmed receiving the refund for ${booking.serviceType}.`
    );
    return updated;
  }, [pushNotification, replaceBooking]);

  return {
    handleConfirmRefundReceived,
    handleRequestRefund,
  };
}
