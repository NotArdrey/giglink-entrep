import React, { useState, useEffect } from 'react';
import Header from '../../../shared/components/Header';
import ChatWindow from '../components/ChatWindow';
import SlotSelectionModal from '../components/SlotSelectionModal';
import PaymentModal from '../components/PaymentModal';

const CASH_CONFIRMATION_REQUESTS_KEY = 'giglink_cash_confirmation_requests';
const REFUND_REQUESTS_KEY = 'giglink_refund_requests';

const MyBookings = ({ onGoHome, onLogout, onOpenSellerSetup, onOpenMyWork, sellerProfile, onOpenProfile, onOpenAccountSettings, onOpenSettings }) => {
  // Initialize with first booking selected and go directly to chat
  const [selectedBookingId, setSelectedBookingId] = useState(1);
  const [uiState, setUiState] = useState('chat');
  const [activeFilter, setActiveFilter] = useState('all');
  const [displayFilter, setDisplayFilter] = useState('all');
  const [ratingTargetId, setRatingTargetId] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [paymentProofBookingId, setPaymentProofBookingId] = useState(null);
  const [proofFileName, setProofFileName] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [showPaymentStatusNotice, setShowPaymentStatusNotice] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
  const [paymentProofError, setPaymentProofError] = useState('');
  const [headerNotifications, setHeaderNotifications] = useState([]);
  const [cashConfirmBookingId, setCashConfirmBookingId] = useState(null);
  const [cashEnteredAmount, setCashEnteredAmount] = useState('');
  const [cashReviewState, setCashReviewState] = useState('idle');
  const [cashReviewMessage, setCashReviewMessage] = useState('');
  const [isCashAmountFocused, setIsCashAmountFocused] = useState(false);
  const [transactionProofBookingId, setTransactionProofBookingId] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [hoveredOpenChatId, setHoveredOpenChatId] = useState(null);
  const [hoveredRateId, setHoveredRateId] = useState(null);
  const [hoveredPayId, setHoveredPayId] = useState(null);
  const [hoveredBackToBookings, setHoveredBackToBookings] = useState(false);
  const [isReferenceFocused, setIsReferenceFocused] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  // Simulate initial loading of bookings before list is shown.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingBookings(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const readCashRequests = () => {
      try {
        const raw = window.localStorage.getItem(CASH_CONFIRMATION_REQUESTS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };

    const syncCashRequests = () => {
      const requests = readCashRequests();
      if (!Array.isArray(requests) || requests.length === 0) return;

      setBookings((prevBookings) => {
        const nextBookings = prevBookings.map((booking) => {
          const request = [...requests].reverse().find((item) => String(item.bookingId) === String(booking.id));
          if (!request) return booking;

          if (request.status === 'approved') {
            return {
              ...booking,
              cashConfirmationStatus: 'approved',
              paymentProofSubmitted: true,
              paymentReference: request.transactionId || booking.paymentReference,
              transactionId: request.transactionId || booking.transactionId,
              canRate: true,
              status: 'Completed Service',
            };
          }

          if (request.status === 'denied') {
            return {
              ...booking,
              cashConfirmationStatus: 'denied',
              status: 'Cash Verification Denied',
            };
          }

          return {
            ...booking,
            cashConfirmationStatus: 'pending-worker-review',
            submittedCashAmount: request.submittedCashAmount ?? booking.submittedCashAmount,
            status: 'Cash Verification Pending',
          };
        });

        return JSON.stringify(nextBookings) === JSON.stringify(prevBookings) ? prevBookings : nextBookings;
      });
    };

    syncCashRequests();
    const interval = window.setInterval(syncCashRequests, 2500);

    const handleStorage = (event) => {
      if (event.key === CASH_CONFIRMATION_REQUESTS_KEY) {
        syncCashRequests();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const readRefundRequests = () => {
      try {
        const raw = window.localStorage.getItem(REFUND_REQUESTS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };

    const syncRefundRequests = () => {
      const requests = readRefundRequests();
      if (!Array.isArray(requests) || requests.length === 0) return;

      setBookings((prevBookings) => {
        const nextBookings = prevBookings.map((booking) => {
          const request = [...requests].reverse().find((item) => String(item.bookingId) === String(booking.id));
          if (!request) return booking;

          if (request.status === 'completed') {
            return {
              ...booking,
              status: 'Refunded',
              refundStatus: 'approved',
              refundReference: request.refundReference || booking.refundReference,
              refundReason: request.refundReason || booking.refundReason,
              refundAmount: request.refundAmount || booking.refundAmount || booking.quoteAmount,
            };
          }

          if (request.status === 'approved-awaiting-client-confirmation') {
            return {
              ...booking,
              status: 'Refund Processing',
              refundStatus: 'approved-awaiting-client-confirmation',
              refundReference: request.refundReference || booking.refundReference,
              refundReason: request.refundReason || booking.refundReason,
              refundAmount: request.refundAmount || booking.refundAmount || booking.quoteAmount,
            };
          }

          return {
            ...booking,
            status: 'Refund Processing',
            refundStatus: 'requested',
            refundReference: request.refundReference || booking.refundReference,
            refundReason: request.refundReason || booking.refundReason,
            refundAmount: request.refundAmount || booking.refundAmount || booking.quoteAmount,
          };
        });

        return JSON.stringify(nextBookings) === JSON.stringify(prevBookings) ? prevBookings : nextBookings;
      });
    };

    syncRefundRequests();
    const interval = window.setInterval(syncRefundRequests, 2500);

    const handleStorage = (event) => {
      if (event.key === REFUND_REQUESTS_KEY) {
        syncRefundRequests();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const parseDateOnly = (dateString) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const addDaysToDate = (dateString, days) => {
    const date = parseDateOnly(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };

  const isRecurringBilling = (booking) =>
    booking.billingCycle === 'weekly' || booking.billingCycle === 'monthly';

  const isBookingStopped = (booking) =>
    booking.status === 'Service Stopped' || booking.serviceActive === false;

  const isRecurringChargeDue = (booking) => {
    if (!isRecurringBilling(booking) || isBookingStopped(booking)) return false;
    if (!booking.nextChargeDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parseDateOnly(booking.nextChargeDate) <= today;
  };

  const getNextChargeDate = (booking, fromDate) => {
    if (booking.billingCycle === 'weekly') return addDaysToDate(fromDate, 7);
    if (booking.billingCycle === 'monthly') return addDaysToDate(fromDate, 30);
    return null;
  };

  const getBillingLabel = (booking) => {
    if (booking.billingCycle === 'weekly') return 'Weekly';
    if (booking.billingCycle === 'monthly') return 'Monthly';
    return null;
  };

  const buildMockTransactionId = (bookingId, channel) => {
    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const suffix = String(Math.floor(Math.random() * 9000) + 1000);
    return `${channel.toUpperCase()}-TRX-${dateStamp}-${bookingId}-${suffix}`;
  };

  const pushHeaderNotification = (title, message) => {
    const id = `notif-${Date.now()}-${Math.floor(Math.random() * 999)}`;
    setHeaderNotifications((prev) => [
      {
        id,
        title,
        message,
        time: 'just now',
        isRead: false,
      },
      ...prev,
    ]);
  };

  const [bookings, setBookings] = useState([
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
  ]);

  const isGcashFlow = (paymentMethod) => paymentMethod === 'gcash-advance' || paymentMethod === 'after-service-gcash';
  const isRefundBooking = (booking) => Boolean(booking.refundStatus) || booking.status === 'Refund Processing' || booking.status === 'Refunded';
  const isCancelledCashBooking = (booking) => booking.status === 'Cancelled (Cash)' && booking.paymentMethod === 'after-service-cash';

  const handleOpenChat = (bookingId) => {
    setSelectedBookingId(bookingId);
    setUiState('chat');
  };

  const handleOpenSlotSelection = () => {
    setUiState('slots');
  };

  const handleOpenRating = (bookingId) => {
    setRatingTargetId(bookingId);
    setRatingValue(5);
    setRatingHover(0);
    setRatingComment('');
  };

  const handleOpenPaymentProofModal = (bookingId) => {
    setPaymentProofBookingId(bookingId);
    setProofFileName('');
    setReferenceNo('');
    setPaymentProofError('');
  };

  const handleOpenCashConfirmModal = (bookingId) => {
    setCashConfirmBookingId(bookingId);
    setCashEnteredAmount('');
    setCashReviewState('idle');
    setCashReviewMessage('');
  };

  const handleOpenTransactionProof = (bookingId) => {
    setTransactionProofBookingId(bookingId);
  };

  const handleProofFileChange = (event) => {
    const selectedFile = event.target.files && event.target.files[0];
    setProofFileName(selectedFile ? selectedFile.name : '');
  };

  const handleSubmitPaymentProof = () => {
    if (!proofFileName && !referenceNo.trim()) {
      setPaymentProofError('Please upload proof of transaction or enter a reference number.');
      return;
    }

    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === paymentProofBookingId
          ? (() => {
              if (isRecurringBilling(booking)) {
                const chargeDate = booking.nextChargeDate || new Date().toISOString().slice(0, 10);
                return {
                  ...booking,
                  paymentProofSubmitted: true,
                  paymentReference: referenceNo.trim(),
                  status: 'Active Service',
                  canRate: false,
                  lastChargeDate: chargeDate,
                  nextChargeDate: getNextChargeDate(booking, chargeDate),
                };
              }

              return {
                ...booking,
                paymentProofSubmitted: true,
                paymentReference: referenceNo.trim(),
                status: 'Payment Submitted',
                canRate: true,
              };
            })()
          : booking
      )
    );

    setPaymentProofBookingId(null);
    setProofFileName('');
    setReferenceNo('');
    setPaymentProofError('');
    setPaymentStatusMessage('Payment proof submitted. Please check My Bookings for the updated status.');
    setShowPaymentStatusNotice(true);
    setTimeout(() => setShowPaymentStatusNotice(false), 2600);
  };

  const handleSubmitCashConfirmation = () => {
    if (!cashConfirmBookingId) return;

    const targetBooking = bookings.find((booking) => booking.id === cashConfirmBookingId);
    if (!targetBooking) return;

    const parsedAmount = Number(cashEnteredAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setCashReviewMessage('Enter a valid cash amount before sending for worker review.');
      setCashReviewState('error');
      return;
    }

    const requestId = `cash-request-${cashConfirmBookingId}-${Date.now()}`;

    setCashReviewState('pending');
    setCashReviewMessage('Cash confirmation sent to the worker review queue.');

    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === cashConfirmBookingId
          ? {
              ...booking,
              cashConfirmationStatus: 'pending-worker-review',
              submittedCashAmount: parsedAmount,
              status: 'Cash Verification Pending',
              paymentProofSubmitted: true,
              transactionId: '',
              paymentReference: '',
            }
          : booking
      )
    );

    const existingRequests = (() => {
      try {
        const raw = window.localStorage.getItem(CASH_CONFIRMATION_REQUESTS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();

    const nextRequests = [
      ...existingRequests.filter((request) => String(request.bookingId) !== String(cashConfirmBookingId)),
      {
        id: requestId,
        bookingId: cashConfirmBookingId,
        clientName: 'Client',
        workerName: targetBooking.workerName,
        serviceType: targetBooking.serviceType,
        submittedCashAmount: parsedAmount,
        expectedCashAmount: targetBooking.quoteAmount,
        status: 'pending-worker-review',
        transactionId: '',
        createdAt: new Date().toISOString(),
      },
    ];

    window.localStorage.setItem(CASH_CONFIRMATION_REQUESTS_KEY, JSON.stringify(nextRequests));

    pushHeaderNotification(
      'Cash Confirmation Sent',
      `Your cash payment for ${targetBooking.serviceType} is now waiting for worker verification.`
    );

    setPaymentStatusMessage('Cash confirmation submitted. Waiting for worker verification.');
    setShowPaymentStatusNotice(true);
    setTimeout(() => setShowPaymentStatusNotice(false), 3200);

    setCashReviewMessage('Your cash confirmation is now in the worker review queue.');
  };

  const handleSubmitRating = () => {
    if (!ratingTargetId) return;

    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === ratingTargetId
          ? {
              ...booking,
              rating: ratingValue,
              review: ratingComment.trim(),
              status: 'Completed Service',
            }
          : booking
      )
    );

    setRatingTargetId(null);
    setRatingValue(5);
    setRatingHover(0);
    setRatingComment('');
  };

  const handleApproveQuote = (bookingId) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, quoteApproved: true, status: 'Awaiting Slot Selection' }
          : booking
      )
    );
    setUiState('chat');
  };

  const handleStopServiceAccepted = (bookingId) => {
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
  };

  const handleRequestRefund = (bookingId, reason) => {
    const targetBooking = bookings.find((booking) => booking.id === bookingId);
    if (!targetBooking) return;

    const refundReference = `REFUND-REQ-${String(bookingId).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;
    const existingRequests = (() => {
      try {
        const raw = window.localStorage.getItem(REFUND_REQUESTS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();

    const nextRequests = [
      ...existingRequests.filter((request) => String(request.bookingId) !== String(bookingId)),
      {
        id: `refund-request-${bookingId}-${Date.now()}`,
        bookingId,
        clientName: 'Client',
        workerName: targetBooking.workerName,
        serviceType: targetBooking.serviceType,
        refundAmount: targetBooking.refundAmount || targetBooking.quoteAmount,
        refundReason: reason,
        refundReference,
        status: 'requested',
        createdAt: new Date().toISOString(),
      },
    ];

    window.localStorage.setItem(REFUND_REQUESTS_KEY, JSON.stringify(nextRequests));

    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: 'Refund Processing',
              refundStatus: 'requested',
              refundReason: reason,
              refundReference,
              refundAmount: booking.refundAmount || booking.quoteAmount,
            }
          : booking
      )
    );

    pushHeaderNotification(
      'Refund Requested',
      `Your refund request for ${targetBooking.serviceType} has been submitted and is awaiting review.`
    );

    setPaymentStatusMessage('Refund request submitted. The worker review queue will be notified.');
    setShowPaymentStatusNotice(true);
    setTimeout(() => setShowPaymentStatusNotice(false), 3200);
  };

  const handleConfirmRefundReceived = (bookingId) => {
    const targetBooking = bookings.find((booking) => booking.id === bookingId);
    if (!targetBooking) return;

    const existingRequests = (() => {
      try {
        const raw = window.localStorage.getItem(REFUND_REQUESTS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();

    const nextRequests = existingRequests.map((request) =>
      String(request.bookingId) === String(bookingId)
        ? { ...request, status: 'completed', completedAt: new Date().toISOString() }
        : request
    );

    window.localStorage.setItem(REFUND_REQUESTS_KEY, JSON.stringify(nextRequests));

    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: 'Refunded',
              refundStatus: 'approved',
            }
          : booking
      )
    );

    pushHeaderNotification(
      'Refund Confirmed',
      `You confirmed receiving the refund for ${targetBooking.serviceType}.`
    );
  };

  const handleConfirmSlot = (bookingId, slotInfo) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, selectedSlot: slotInfo, status: 'Slot Selected - Payment Pending' }
          : booking
      )
    );
    setUiState('payment');
  };

  const handleSelectPaymentMethod = (bookingId, paymentMethod) => {
    const targetBooking = bookings.find((booking) => booking.id === bookingId);

    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              paymentMethod,
              status: paymentMethod === 'gcash-advance' ? 'Payment Confirmed' : 'Service Scheduled',
              cashConfirmationStatus:
                paymentMethod === 'after-service-cash'
                  ? 'awaiting-client-scan'
                  : booking.cashConfirmationStatus,
              cashVerifierQrId:
                paymentMethod === 'after-service-cash'
                  ? booking.cashVerifierQrId || `CASHQR-${booking.workerId || booking.id}-${booking.id}`
                  : booking.cashVerifierQrId,
              submittedCashAmount: paymentMethod === 'after-service-cash' ? null : booking.submittedCashAmount,
            }
          : booking
      )
    );

    if (paymentMethod === 'after-service-cash' && targetBooking) {
      pushHeaderNotification(
        'Cash QR Ready',
        `Worker ${targetBooking.workerName} generated a Cash Confirmation QR. Scan and submit amount after meetup.`
      );
    }

    setUiState('confirmed');
  };

  const handleBackToList = () => {
    setSelectedBookingId(null);
    setUiState('chat');
  };

  const handleNewInquiry = () => {
    setSelectedBookingId(null);
    setUiState('chat');
  };

  const styles = {
    myBookings: {
      padding: 0,
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%)',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      width: '100%',
      overflowX: 'hidden',
    },
    bookingsHeader: { width: '100%', maxWidth: isMobile ? '390px' : '1200px', margin: '0 auto 24px', textAlign: 'center', padding: isMobile ? '20px 14px 0' : '32px 0', boxSizing: 'border-box' },
    title: { fontSize: isMobile ? '24px' : '32px', fontWeight: 700, color: '#2c3e50', margin: '0 0 8px 0' },
    subtitle: { fontSize: '14px', color: '#7f8c8d', margin: 0 },
    bookingsFilters: { width: '100%', maxWidth: isMobile ? '390px' : '1200px', margin: '0 auto 16px', padding: isMobile ? '0 14px' : '0', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start', boxSizing: 'border-box' },
    filterBtn: { padding: '8px 14px', borderRadius: '999px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'center' },
    filterBtnActive: { background: '#1d4ed8', color: '#fff', borderColor: '#1d4ed8' },
    displayFilters: { width: '100%', maxWidth: isMobile ? '390px' : '1200px', margin: '0 auto 14px', padding: isMobile ? '0 14px' : '0', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start', boxSizing: 'border-box' },
    displayHint: { width: '100%', margin: '2px 0 0', fontSize: '12px', color: '#64748b', textAlign: isMobile ? 'center' : 'left' },
    bookingsList: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: isMobile ? '390px' : '1200px', margin: '0 auto', padding: isMobile ? '0 14px 16px' : '0 0 20px', alignItems: 'stretch', boxSizing: 'border-box' },
    bookingCard: { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', padding: isMobile ? '14px' : '20px', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', borderLeft: '4px solid #27ae60', width: '100%', marginLeft: 'auto', marginRight: 'auto', boxSizing: 'border-box' },
    bookingCardHover: { boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)', transform: 'translateY(-2px)' },
    bookingInfo: { flex: 1 },
    workerName: { fontSize: '18px', fontWeight: 600, color: '#2c3e50', margin: '0 0 4px 0', textAlign: isMobile ? 'center' : 'left' },
    serviceType: { fontSize: '14px', color: '#27ae60', fontWeight: 600, margin: '0 0 8px 0', textAlign: isMobile ? 'center' : 'left' },
    description: { fontSize: '14px', color: '#555', margin: '0 0 12px 0', lineHeight: 1.5, textAlign: isMobile ? 'center' : 'left' },
    bookingMeta: { display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#7f8c8d', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start' },
    requestDate: { display: 'inline-block' },
    billingBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#dbeafe', color: '#1e3a8a' },
    nextChargeDate: { fontSize: '12px', color: '#1d4ed8', fontWeight: 600 },
    statusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' },
    bookingRating: { color: '#7c2d12', fontWeight: 600 },
    bookingActions: { display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start', gap: '12px', marginTop: '16px', width: '100%' },
    quotePreview: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#2c3e50', justifyContent: isMobile ? 'center' : 'flex-start', width: isMobile ? '100%' : 'auto' },
    quoteLabel: { fontWeight: 600 },
    quoteAmount: { fontSize: '18px', fontWeight: 700, color: '#27ae60' },
    gcashPreview: { display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '6px 10px' },
    gcashLabel: { color: '#065f46', fontWeight: 600 },
    gcashNumber: { color: '#047857', fontWeight: 700, fontFamily: "'Courier New', monospace" },
    cashPreview: { display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', padding: '6px 10px' },
    cashLabel: { color: '#9a3412', fontWeight: 700 },
    cashHint: { color: '#b45309', fontWeight: 600 },
    refundPreview: { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '8px 10px', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box' },
    refundTitle: { color: '#4338ca', fontWeight: 800 },
    refundMeta: { color: '#4f46e5', fontWeight: 600 },
    cancelPreview: { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 10px', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box' },
    cancelTitle: { color: '#b91c1c', fontWeight: 800 },
    cancelMeta: { color: '#991b1b', fontWeight: 600 },
    cashConfirmBtn: { padding: '10px 16px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease' },
    cashConfirmBtnHover: { background: '#c2410c' },
    transactionProofBtn: { padding: '10px 14px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' },
    transactionIdInline: { padding: '6px 10px', borderRadius: '999px', background: '#ecfeff', border: '1px solid #99f6e4', color: '#0f766e', fontSize: '12px', fontFamily: "'Courier New', monospace", fontWeight: 700 },
    bookingActionRow: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start', width: '100%' },
    openChatBtn: { padding: '10px 16px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', transform: 'scale(1)' },
    openChatBtnHover: { background: '#229954', transform: 'scale(1.02)' },
    rateBtn: { padding: '10px 18px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' },
    rateBtnHover: { background: '#d97706' },
    payGcashBtn: { padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease' },
    payGcashBtnHover: { background: '#1d4ed8' },
    loadingCard: { background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', padding: '20px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginLeft: 'auto', marginRight: 'auto', boxSizing: 'border-box' },
    loadingLine: { height: '11px', borderRadius: '999px', background: '#e2e8f0' },
    emptyState: { textAlign: 'center', padding: '60px 20px', color: '#7f8c8d', width: '100%', marginLeft: 'auto', marginRight: 'auto', boxSizing: 'border-box' },
    ratingModalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.55)', display: 'flex', justifyContent: 'center', alignItems: isMobile ? 'flex-start' : 'center', zIndex: 1100, padding: isMobile ? '10px 10px 14px' : '16px', overflowY: 'auto', overscrollBehavior: 'contain' },
    ratingModal: { width: '100%', maxWidth: isMobile ? '100%' : '760px', maxHeight: isMobile ? 'calc(100vh - 24px)' : '90vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#fff', borderRadius: '12px', padding: isMobile ? '14px' : '24px', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' },
    paymentProofModal: { maxWidth: isMobile ? '100%' : '900px' },
    ratingTitle: { margin: 0, color: '#1f2937', fontSize: '26px' },
    ratingSubtitle: { margin: '0 0 8px', color: '#6b7280', fontSize: '15px' },
    label: { fontSize: '14px', fontWeight: 600, color: '#374151' },
    starRating: { display: 'flex', gap: '6px', alignItems: 'center' },
    starBtn: { border: 'none', background: 'transparent', fontSize: '30px', lineHeight: 1, color: '#d1d5db', cursor: 'pointer', transition: 'transform 0.15s ease, color 0.15s ease', padding: 0 },
    starBtnActive: { color: '#f59e0b' },
    starRatingValue: { margin: '2px 0 6px', fontSize: '13px', fontWeight: 600, color: '#374151' },
    textarea: { border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '120px', padding: '12px', fontSize: '15px', fontFamily: 'inherit' },
    ratingActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' },
    paymentProofActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px', position: 'sticky', bottom: 0, background: '#fff', paddingTop: '10px', paddingBottom: isMobile ? '2px' : 0, borderTop: '1px solid #e5e7eb' },
    btnCancelRate: { border: 'none', borderRadius: '8px', padding: '10px 14px', fontWeight: 600, cursor: 'pointer', background: '#e5e7eb', color: '#111827' },
    btnSubmitRate: { border: 'none', borderRadius: '8px', padding: '10px 14px', fontWeight: 600, cursor: 'pointer', background: '#2563eb', color: '#fff' },
    gcashPaymentHeader: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', gap: '16px', alignItems: 'start', marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' },
    gcashQrImage: { width: '100%', border: '2px solid #e5e7eb', borderRadius: '8px', background: '#fff', display: 'block' },
    gcashPaymentInfo: { display: 'flex', flexDirection: 'column', gap: '12px' },
    paymentInfoGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    infoLabel: { fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 },
    infoValue: { fontSize: '14px', color: '#111827', fontWeight: 500, margin: 0 },
    infoValueAmount: { fontSize: '18px', fontWeight: 700, color: '#059669', margin: 0 },
    gcashNumberGroup: { paddingTop: '8px', borderTop: '1px solid #d1d5db', marginTop: '4px' },
    paymentProofSection: { padding: '16px', background: '#fafbfc', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '16px' },
    h4: { margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#111827' },
    proofUploadGroup: { marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
    fileInput: { minHeight: '46px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', fontSize: '14px', cursor: 'pointer', width: '100%', boxSizing: 'border-box' },
    proofFileName: { margin: '2px 0 6px', fontSize: '12px', color: '#6b7280' },
    referenceNumberGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    referenceInput: { padding: '12px 14px', fontSize: '15px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s', minHeight: '48px', width: '100%', boxSizing: 'border-box', outline: 'none' },
    referenceInputFocused: { borderColor: '#3b82f6', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' },
    errorTextInline: { margin: 0, color: '#dc2626', fontSize: '13px', fontWeight: 600 },
    paymentStatusNotice: { position: 'fixed', right: isMobile ? '12px' : '16px', left: isMobile ? '12px' : 'auto', bottom: '16px', background: '#1d4ed8', color: '#fff', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', fontWeight: 600, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)', zIndex: 1400 },
    cashModalHeader: { marginBottom: '10px' },
    cashSecurityCard: { marginBottom: '14px', border: '1px solid #fed7aa', background: '#fff7ed', borderRadius: '8px', padding: '12px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '160px 1fr', gap: '12px', alignItems: 'start' },
    cashQrImage: { width: '100%', borderRadius: '8px', border: '1px solid #fdba74', background: '#fff' },
    cashSecurityTitle: { margin: 0, color: '#9a3412', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' },
    cashSecurityText: { margin: '6px 0 0', color: '#7c2d12', fontSize: '13px', lineHeight: 1.5 },
    cashMetaList: { margin: '8px 0 0', paddingLeft: '18px', color: '#9a3412', fontSize: '13px' },
    cashFieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' },
    cashAmountInput: { padding: '12px 14px', fontSize: '15px', border: '1px solid #fdba74', borderRadius: '6px', background: '#fff', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s', minHeight: '48px', width: '100%', boxSizing: 'border-box', outline: 'none' },
    cashAmountInputFocused: { borderColor: '#f97316', boxShadow: '0 0 0 3px rgba(249, 115, 22, 0.15)' },
    cashReviewNotice: { margin: 0, borderRadius: '6px', padding: '9px 10px', fontSize: '13px', fontWeight: 600 },
    cashReviewPending: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
    cashReviewApproved: { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' },
    cashReviewDenied: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
    transactionModalValue: { fontSize: '14px', color: '#0f172a', fontWeight: 700, fontFamily: "'Courier New', monospace" },
    confirmationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
    confirmationCard: { background: '#fff', borderRadius: '16px', padding: isMobile ? '24px 14px' : '40px 24px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', transition: 'transform 0.4s ease, opacity 0.4s ease' },
    confirmationHeader: { textAlign: 'center', marginBottom: '32px' },
    checkmarkIcon: { width: '80px', height: '80px', background: '#27ae60', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#fff', margin: '0 auto 16px' },
    confirmationHeading: { fontSize: '24px', fontWeight: 700, color: '#2c3e50', margin: 0 },
    confirmationDetails: { background: '#f8f9fa', borderRadius: '8px', padding: '24px', marginBottom: '24px' },
    detailRow: { display: 'flex', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '4px' : '0', padding: '8px 0', borderBottom: '1px solid #ecf0f1' },
    detailLabel: { fontWeight: 600, color: '#2c3e50', fontSize: '13px' },
    detailValue: { color: '#555', fontSize: '13px' },
    payGcashAdvance: { color: '#27ae60', fontWeight: 600 },
    payAfterCash: { color: '#d97706', fontWeight: 600 },
    payAfterGcash: { color: '#27ae60', fontWeight: 600 },
    confirmationActions: { textAlign: 'center' },
    backToBookings: { padding: '12px 32px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', marginBottom: '16px', width: '100%' },
    backToBookingsHover: { background: '#229954' },
    confirmationNote: { fontSize: '12px', color: '#7f8c8d', margin: 0, lineHeight: 1.5 },
  };

  const statusStyleMap = {
    Negotiating: { background: '#fef3c7', color: '#92400e' },
    'Awaiting Payment': { background: '#fecaca', color: '#7f1d1d' },
    'Quote Sent': { background: '#bfdbfe', color: '#1e3a8a' },
    'Awaiting Slot Selection': { background: '#cffafe', color: '#164e63' },
    'Slot Selected - Payment Pending': { background: '#fecdd3', color: '#831843' },
    'Payment Confirmed': { background: '#dcfce7', color: '#15803d' },
    'Service Scheduled': { background: '#d1fae5', color: '#065f46' },
    'Completed Service': { background: '#dcfce7', color: '#166534' },
    'Awaiting GCash Payment': { background: '#fef3c7', color: '#92400e' },
    'Active Service': { background: '#dbeafe', color: '#1e40af' },
    'Service Stopped': { background: '#fee2e2', color: '#991b1b' },
    'Payment Submitted': { background: '#dbeafe', color: '#1e40af' },
    'Cash Verification Pending': { background: '#ffedd5', color: '#9a3412' },
    'Cash Verification Denied': { background: '#fee2e2', color: '#b91c1c' },
    'Cancelled (Cash)': { background: '#fee2e2', color: '#991b1b' },
    'Refund Processing': { background: '#e0e7ff', color: '#3730a3' },
    Refunded: { background: '#dcfce7', color: '#166534' },
  };

  const currentBooking = bookings.find((b) => b.id === selectedBookingId);
  const terminalStatuses = ['Completed Service', 'Service Stopped', 'Cancelled (Cash)', 'Refunded'];
  const statusFilteredBookings = bookings.filter((booking) => {
    if (activeFilter === 'completed') {
      return terminalStatuses.includes(booking.status) || booking.status === 'Refund Processing';
    }
    if (activeFilter === 'active') {
      return !terminalStatuses.includes(booking.status);
    }
    return true;
  });

  const filteredBookings = statusFilteredBookings.filter((booking) => {
    if (displayFilter === 'cash-approvals') {
      return booking.paymentMethod === 'after-service-cash';
    }
    if (displayFilter === 'refunds') {
      return isRefundBooking(booking);
    }
    if (displayFilter === 'cancelled') {
      return isCancelledCashBooking(booking);
    }
    return true;
  });

  if (!selectedBookingId) {
    // Skip booking list - go directly to chat interface
    setSelectedBookingId(1);
    return null;
  }

  return (
    <div style={styles.myBookings}>
      <Header
        searchQuery=""
        onSearchChange={() => {}}
        onLogout={onLogout}
        onOpenSellerSetup={onOpenSellerSetup}
        onOpenMyBookings={() => {}}
        sellerProfile={sellerProfile}
        onOpenMyWork={onOpenMyWork}
        onGoHome={onGoHome}
        onOpenProfile={onOpenProfile}
        onOpenAccountSettings={onOpenAccountSettings}
        onOpenSettings={onOpenSettings}
        externalNotifications={headerNotifications}
      />
      {uiState === 'chat' && (
        <ChatWindow
          booking={currentBooking}
          bookings={bookings}
          selectedBookingId={selectedBookingId}
          onSelectBooking={handleOpenChat}
          onApproveQuote={() => handleApproveQuote(currentBooking.id)}
          onOpenSlotSelection={handleOpenSlotSelection}
          onOpenPaymentSelection={() => setUiState('payment')}
          onRequestRefund={(reason) => handleRequestRefund(currentBooking.id, reason)}
          onConfirmRefundReceived={() => handleConfirmRefundReceived(currentBooking.id)}
          onStopServiceAccepted={() => handleStopServiceAccepted(currentBooking.id)}
        />
      )}
      {uiState === 'slots' && (
        <SlotSelectionModal
          booking={currentBooking}
          onConfirmSlot={(slotInfo) => handleConfirmSlot(currentBooking.id, slotInfo)}
          onCancel={handleBackToList}
        />
      )}
      {uiState === 'payment' && (
        <PaymentModal
          booking={currentBooking}
          onSelectPayment={(method) => handleSelectPaymentMethod(currentBooking.id, method)}
          onCancel={handleBackToList}
        />
      )}
      {uiState === 'confirmed' && (
        <div style={styles.confirmationOverlay}>
          <div style={styles.confirmationCard}>
            <div style={styles.confirmationHeader}>
              <div style={styles.checkmarkIcon}>{'\u2713'}</div>
              <h2 style={styles.confirmationHeading}>Booking Confirmed!</h2>
            </div>
            <div style={styles.confirmationDetails}>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Worker:</span><span style={styles.detailValue}>{currentBooking.workerName}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Service:</span><span style={styles.detailValue}>{currentBooking.serviceType}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Amount:</span><span style={styles.detailValue}>{`\u20B1${currentBooking.quoteAmount}`}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Scheduled Date:</span><span style={styles.detailValue}>{currentBooking.selectedSlot?.date}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Time Slot:</span><span style={styles.detailValue}>{currentBooking.selectedSlot?.timeBlock.startTime} - {currentBooking.selectedSlot?.timeBlock.endTime}</span></div>
              <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                <span style={styles.detailLabel}>Payment Method:</span>
                <span style={{
                  ...styles.detailValue,
                  ...(currentBooking.paymentMethod === 'gcash-advance' ? styles.payGcashAdvance : {}),
                  ...(currentBooking.paymentMethod === 'after-service-cash' ? styles.payAfterCash : {}),
                  ...(currentBooking.paymentMethod === 'after-service-gcash' ? styles.payAfterGcash : {}),
                }}>
                  {currentBooking.paymentMethod === 'gcash-advance' ? 'GCash Advance Payment' : currentBooking.paymentMethod === 'after-service-gcash' ? 'Pay After Service (GCash)' : 'Pay After Service (Cash)'}
                </span>
              </div>
            </div>
            <div style={styles.confirmationActions}>
              <button
                style={{ ...styles.backToBookings, ...(hoveredBackToBookings ? styles.backToBookingsHover : {}) }}
                onMouseEnter={() => setHoveredBackToBookings(true)}
                onMouseLeave={() => setHoveredBackToBookings(false)}
                onClick={handleNewInquiry}
              >
                Back to My Bookings
              </button>
              <p style={styles.confirmationNote}>Cash confirmation has been sent to the worker review queue. Once approved, a transaction ID will appear here automatically.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
