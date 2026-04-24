import React, { useState, useEffect } from 'react';
import Header from '../../../shared/components/Header';
import ChatWindow from '../components/ChatWindow';
import SlotSelectionModal from '../components/SlotSelectionModal';
import PaymentModal from '../components/PaymentModal';

const MyBookings = ({ onGoHome, onLogout, onOpenSellerSetup, onOpenMyWork, sellerProfile, onOpenProfile, onOpenAccountSettings, onOpenSettings }) => {
  const [selectedBookingId, setSelectedBookingId] = useState(null);
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
  ]);

  const isGcashFlow = (paymentMethod) => paymentMethod === 'gcash-advance' || paymentMethod === 'after-service-gcash';
  const isRefundBooking = (booking) => Boolean(booking.refundStatus) || booking.status === 'Refund Processing' || booking.status === 'Refunded';
  const isCancelledCashBooking = (booking) => booking.status === 'Cancelled (Cash)' && booking.paymentMethod === 'after-service-cash';

  const handleOpenChat = (bookingId) => {
    setSelectedBookingId(bookingId);
    setUiState('chat');
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

    setCashReviewState('pending');
    setCashReviewMessage('Amount sent. Waiting for worker verification...');

    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === cashConfirmBookingId
          ? {
              ...booking,
              cashConfirmationStatus: 'pending-worker-review',
              submittedCashAmount: parsedAmount,
              status: 'Cash Verification Pending',
            }
          : booking
      )
    );

    setTimeout(() => {
      const isApproved = Math.round(parsedAmount * 100) === Math.round(targetBooking.quoteAmount * 100);

      if (isApproved) {
        const transactionId = buildMockTransactionId(cashConfirmBookingId, 'cash');
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === cashConfirmBookingId
              ? {
                  ...booking,
                  cashConfirmationStatus: 'approved',
                  paymentProofSubmitted: true,
                  paymentReference: transactionId,
                  transactionId,
                  canRate: true,
                  status: 'Completed Service',
                }
              : booking
          )
        );

        pushHeaderNotification(
          'Cash Payment Confirmed',
          `Worker approved your cash confirmation for ${targetBooking.serviceType}. Transaction ID: ${transactionId}.`
        );

        setPaymentStatusMessage(`Cash payment approved. Transaction ID: ${transactionId}`);
        setShowPaymentStatusNotice(true);
        setTimeout(() => setShowPaymentStatusNotice(false), 3200);

        setCashReviewState('approved');
        setCashReviewMessage('Worker approved the cash payment. Your transaction proof is now available in My Bookings.');
      } else {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === cashConfirmBookingId
              ? {
                  ...booking,
                  cashConfirmationStatus: 'denied',
                  status: 'Cash Verification Denied',
                }
              : booking
          )
        );

        pushHeaderNotification(
          'Cash Payment Denied',
          `Worker denied the cash confirmation for ${targetBooking.serviceType} due to amount mismatch.`
        );

        setPaymentStatusMessage('Cash payment denied: submitted amount does not match the expected quote.');
        setShowPaymentStatusNotice(true);
        setTimeout(() => setShowPaymentStatusNotice(false), 3200);

        setCashReviewState('denied');
        setCashReviewMessage('Worker denied the payment confirmation because the submitted amount does not match the quote.');
      }
    }, 1600);
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
    setUiState('slots');
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
        <div style={styles.bookingsHeader}>
          <h1 style={styles.title}>My Bookings & Transactions</h1>
          <p style={styles.subtitle}>Manage your service requests and track negotiations</p>
        </div>
        <div style={styles.bookingsFilters}>
          <button style={{ ...styles.filterBtn, ...(activeFilter === 'all' ? styles.filterBtnActive : {}) }} onClick={() => setActiveFilter('all')}>All Transactions</button>
          <button style={{ ...styles.filterBtn, ...(activeFilter === 'active' ? styles.filterBtnActive : {}) }} onClick={() => setActiveFilter('active')}>Active</button>
          <button style={{ ...styles.filterBtn, ...(activeFilter === 'completed' ? styles.filterBtnActive : {}) }} onClick={() => setActiveFilter('completed')}>Done / Completed</button>
        </div>
        <div style={styles.displayFilters}>
          <button style={{ ...styles.filterBtn, ...(displayFilter === 'all' ? styles.filterBtnActive : {}) }} onClick={() => setDisplayFilter('all')}>Show: All</button>
          <button style={{ ...styles.filterBtn, ...(displayFilter === 'cash-approvals' ? styles.filterBtnActive : {}) }} onClick={() => setDisplayFilter('cash-approvals')}>Cash Payments Approval</button>
          <button style={{ ...styles.filterBtn, ...(displayFilter === 'refunds' ? styles.filterBtnActive : {}) }} onClick={() => setDisplayFilter('refunds')}>Refund Cases</button>
          <button style={{ ...styles.filterBtn, ...(displayFilter === 'cancelled' ? styles.filterBtnActive : {}) }} onClick={() => setDisplayFilter('cancelled')}>Cancelled (Cash)</button>
          <p style={styles.displayHint}>Use this filter to showcase one flow at a time during demo.</p>
        </div>
        <div style={styles.bookingsList}>
          {isLoadingBookings
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={`loading-booking-${index}`} style={styles.loadingCard} aria-label="Loading booking card">
                  <div style={{ ...styles.loadingLine, width: '52%' }} />
                  <div style={{ ...styles.loadingLine, width: '35%' }} />
                  <div style={{ ...styles.loadingLine, width: '88%' }} />
                  <div style={{ ...styles.loadingLine, width: '70%' }} />
                  <div style={{ ...styles.loadingLine, width: '25%' }} />
                </div>
              ))
            : filteredBookings.length === 0
            ? (
                <div style={styles.emptyState}><p>No transactions found for this filter.</p></div>
              )
            : (
                filteredBookings.map((booking) => (
              <div
                key={booking.id}
                style={{ ...styles.bookingCard, ...(hoveredCardId === booking.id ? styles.bookingCardHover : {}) }}
                onMouseEnter={() => setHoveredCardId(booking.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                <div style={styles.bookingInfo}>
                  <h3 style={styles.workerName}>{booking.workerName}</h3>
                  <p style={styles.serviceType}>{booking.serviceType}</p>
                  <p style={styles.description}>{booking.description}</p>
                  <div style={styles.bookingMeta}>
                    <span style={styles.requestDate}>Requested: {booking.requestDate}</span>
                    {isRecurringBilling(booking) && <span style={styles.billingBadge}>{getBillingLabel(booking)} Billing</span>}
                    {isRecurringBilling(booking) && booking.nextChargeDate && !isBookingStopped(booking) && <span style={styles.nextChargeDate}>Next charge: {booking.nextChargeDate}</span>}
                    <span style={{ ...styles.statusBadge, ...(statusStyleMap[booking.status] || {}) }}>{booking.status}</span>
                    {booking.rating && <span style={styles.bookingRating}>Rating: {'\u2605'.repeat(booking.rating)} ({booking.rating}/5)</span>}
                  </div>
                </div>
                <div style={styles.bookingActions}>
                  <div style={styles.quotePreview}>
                    <span style={styles.quoteLabel}>Quote:</span>
                    <span style={styles.quoteAmount}>{`\u20B1${booking.quoteAmount}`}{isRecurringBilling(booking) ? ` / ${booking.billingCycle === 'monthly' ? 'month' : 'week'}` : ''}</span>
                  </div>
                  {isGcashFlow(booking.paymentMethod) && booking.status !== 'Completed Service' && (
                    <div style={styles.gcashPreview}>
                      <span style={styles.gcashLabel}>GCash:</span>
                      <span style={styles.gcashNumber}>{booking.gcashNumber || '09054891105'}</span>
                    </div>
                  )}
                  {booking.paymentMethod === 'after-service-cash' && (
                    <div style={styles.cashPreview}>
                      <span style={styles.cashLabel}>Cash Security:</span>
                      <span style={styles.cashHint}>
                        {booking.cashConfirmationStatus === 'approved'
                          ? 'Worker verified via QR confirmation'
                          : booking.cashConfirmationStatus === 'denied'
                            ? 'Last confirmation was denied'
                            : 'Client must scan worker QR and submit amount'}
                      </span>
                    </div>
                  )}
                  {isRefundBooking(booking) && (
                    <div style={styles.refundPreview}>
                      <span style={styles.refundTitle}>Refund Case</span>
                      <span style={styles.refundMeta}>Status: {booking.refundStatus || booking.status}</span>
                      {booking.refundAmount && <span style={styles.refundMeta}>Amount: {`\u20B1${booking.refundAmount}`}</span>}
                      {booking.refundReference && <span style={styles.refundMeta}>Ref: {booking.refundReference}</span>}
                      {booking.refundReason && <span style={styles.refundMeta}>Reason: {booking.refundReason}</span>}
                    </div>
                  )}
                  {isCancelledCashBooking(booking) && (
                    <div style={styles.cancelPreview}>
                      <span style={styles.cancelTitle}>Cancelled Cash Booking</span>
                      <span style={styles.cancelMeta}>Cancelled by: {booking.cancelledBy || 'Client'}</span>
                      <span style={styles.cancelMeta}>{booking.cancellationReason || 'Cash-only cancellation flow for demo.'}</span>
                    </div>
                  )}
                  {booking.transactionId && (
                    <span style={styles.transactionIdInline}>Transaction ID: {booking.transactionId}</span>
                  )}
                  <div style={styles.bookingActionRow}>
                    <button
                      style={{ ...styles.openChatBtn, ...(hoveredOpenChatId === booking.id ? styles.openChatBtnHover : {}) }}
                      onMouseEnter={() => setHoveredOpenChatId(booking.id)}
                      onMouseLeave={() => setHoveredOpenChatId(null)}
                      onClick={() => handleOpenChat(booking.id)}
                    >
                      Open Chat
                    </button>
                    {isGcashFlow(booking.paymentMethod)
                      && booking.status !== 'Service Stopped'
                      && booking.status !== 'Cancelled (Cash)'
                      && !isRefundBooking(booking)
                      && (((isRecurringBilling(booking) && isRecurringChargeDue(booking)) || (!isRecurringBilling(booking) && !booking.paymentProofSubmitted))) && (
                      <button
                        style={{ ...styles.payGcashBtn, ...(hoveredPayId === booking.id ? styles.payGcashBtnHover : {}) }}
                        onMouseEnter={() => setHoveredPayId(booking.id)}
                        onMouseLeave={() => setHoveredPayId(null)}
                        onClick={() => handleOpenPaymentProofModal(booking.id)}
                      >
                        {isRecurringBilling(booking) ? `Pay ${getBillingLabel(booking)} Charge` : 'Pay via GCash'}
                      </button>
                    )}
                    {booking.paymentMethod === 'after-service-cash'
                      && booking.status !== 'Service Stopped'
                      && booking.status !== 'Cancelled (Cash)'
                      && booking.cashConfirmationStatus !== 'approved' && (
                      <button
                        style={{ ...styles.cashConfirmBtn, ...(hoveredPayId === booking.id ? styles.cashConfirmBtnHover : {}) }}
                        onMouseEnter={() => setHoveredPayId(booking.id)}
                        onMouseLeave={() => setHoveredPayId(null)}
                        onClick={() => handleOpenCashConfirmModal(booking.id)}
                      >
                        Confirm Cash via Worker QR
                      </button>
                    )}
                    {(booking.transactionId || booking.paymentReference) && (
                      <button
                        style={styles.transactionProofBtn}
                        onClick={() => handleOpenTransactionProof(booking.id)}
                      >
                        View Transaction ID
                      </button>
                    )}
                    {(booking.status === 'Completed Service' || booking.canRate || booking.paymentProofSubmitted) && (
                      <button
                        style={{ ...styles.rateBtn, ...(hoveredRateId === booking.id ? styles.rateBtnHover : {}) }}
                        onMouseEnter={() => setHoveredRateId(booking.id)}
                        onMouseLeave={() => setHoveredRateId(null)}
                        onClick={() => handleOpenRating(booking.id)}
                      >
                        {booking.rating ? 'Edit Rating' : 'Rate'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
            )}
        </div>

        {ratingTargetId && (
          <div style={styles.ratingModalOverlay}>
            <div style={styles.ratingModal}>
              <h3 style={styles.ratingTitle}>Rate Completed Service</h3>
              <p style={styles.ratingSubtitle}>Your feedback helps build worker ratings shown in the dashboard.</p>
              <label style={styles.label}>Rating (Tap a star)</label>
              <div style={styles.starRating} onMouseLeave={() => setRatingHover(0)}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = (ratingHover || ratingValue) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      style={{ ...styles.starBtn, ...(isActive ? styles.starBtnActive : {}), transform: ratingHover === star ? 'scale(1.08)' : 'scale(1)' }}
                      onMouseEnter={() => setRatingHover(star)}
                      onClick={() => setRatingValue(star)}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      {'\u2605'}
                    </button>
                  );
                })}
              </div>
              <p style={styles.starRatingValue}>Selected: {ratingValue}/5</p>
              <label style={styles.label} htmlFor="rating-comment">Review (optional)</label>
              <textarea
                id="rating-comment"
                rows={4}
                value={ratingComment}
                onChange={(event) => setRatingComment(event.target.value)}
                placeholder="Share your experience with this service..."
                style={styles.textarea}
              />
              <div style={styles.ratingActions}>
                <button style={styles.btnCancelRate} onClick={() => setRatingTargetId(null)}>Cancel</button>
                <button style={styles.btnSubmitRate} onClick={handleSubmitRating}>Submit Rating</button>
              </div>
            </div>
          </div>
        )}

        {paymentProofBookingId && (
          <div style={styles.ratingModalOverlay}>
            <div style={{ ...styles.ratingModal, ...styles.paymentProofModal }}>
              <h3 style={styles.ratingTitle}>GCash Payment</h3>
              <p style={styles.ratingSubtitle}>
                {(() => {
                  const targetBooking = bookings.find((booking) => booking.id === paymentProofBookingId);
                  if (targetBooking && isRecurringBilling(targetBooking)) {
                    return `Submit proof for this ${targetBooking.billingCycle} charge. Only one payment is required per billing cycle unless the service is stopped.`;
                  }
                  return targetBooking?.paymentMethod === 'after-service-gcash'
                    ? 'Upload proof or enter your GCash reference once you have paid after service completion.'
                    : 'Send payment first, then upload proof or provide the reference number.';
                })()}
              </p>

              {(() => {
                const targetBooking = bookings.find((booking) => booking.id === paymentProofBookingId);
                if (!targetBooking) return null;
                return (
                  <>
                    <div style={styles.gcashPaymentHeader}>
                      <img src={targetBooking.qrImageUrl} alt="GCash QR" style={styles.gcashQrImage} />
                      <div style={styles.gcashPaymentInfo}>
                        <div style={styles.paymentInfoGroup}><p style={styles.infoLabel}><strong>Worker</strong></p><p style={styles.infoValue}>{targetBooking.workerName}</p></div>
                        <div style={styles.paymentInfoGroup}><p style={styles.infoLabel}><strong>Service</strong></p><p style={styles.infoValue}>{targetBooking.serviceType}</p></div>
                        <div style={styles.paymentInfoGroup}><p style={styles.infoLabel}><strong>Amount</strong></p><p style={styles.infoValueAmount}>{`\u20B1${targetBooking.quoteAmount.toLocaleString()}`}</p></div>
                        {isRecurringBilling(targetBooking) && <div style={styles.paymentInfoGroup}><p style={styles.infoLabel}><strong>Billing Cycle</strong></p><p style={styles.infoValue}>{getBillingLabel(targetBooking)}</p></div>}
                        {isRecurringBilling(targetBooking) && targetBooking.nextChargeDate && <div style={styles.paymentInfoGroup}><p style={styles.infoLabel}><strong>Charge Due Date</strong></p><p style={styles.infoValue}>{targetBooking.nextChargeDate}</p></div>}
                        <div style={{ ...styles.paymentInfoGroup, ...styles.gcashNumberGroup }}><p style={styles.infoLabel}><strong>GCash Number</strong></p><p style={{ ...styles.infoValue, ...styles.gcashNumber }}>{targetBooking.gcashNumber}</p></div>
                      </div>
                    </div>
                    <div style={styles.paymentProofSection}>
                      <h4 style={styles.h4}>Payment Proof</h4>
                      <div style={styles.proofUploadGroup}>
                        <label style={styles.label} htmlFor="proof-upload">Upload Proof of Transaction (Optional)</label>
                        <input id="proof-upload" type="file" accept="image/*,.pdf" onChange={handleProofFileChange} style={styles.fileInput} />
                        <p style={styles.proofFileName}>{proofFileName ? `Selected: ${proofFileName}` : 'No file selected'}</p>
                      </div>
                      <div style={styles.referenceNumberGroup}>
                        <label style={styles.label} htmlFor="reference-no">Reference Number (Optional)</label>
                        <input
                          id="reference-no"
                          type="text"
                          value={referenceNo}
                          onChange={(event) => setReferenceNo(event.target.value)}
                          onFocus={() => setIsReferenceFocused(true)}
                          onBlur={() => setIsReferenceFocused(false)}
                          placeholder="Enter GCash reference number"
                          style={{ ...styles.referenceInput, ...(isReferenceFocused ? styles.referenceInputFocused : {}) }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}

              {paymentProofError && <p style={styles.errorTextInline}>{paymentProofError}</p>}
              <div style={styles.paymentProofActions}>
                <button style={styles.btnCancelRate} onClick={() => setPaymentProofBookingId(null)}>Cancel</button>
                <button style={styles.btnSubmitRate} onClick={handleSubmitPaymentProof}>Submit Proof</button>
              </div>
            </div>
          </div>
        )}

        {cashConfirmBookingId && (
          <div style={styles.ratingModalOverlay}>
            <div style={styles.ratingModal}>
              {(() => {
                const targetBooking = bookings.find((booking) => booking.id === cashConfirmBookingId);
                if (!targetBooking) return null;

                const mockCashQr = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&format=png&data=CASH-CONFIRM|${targetBooking.cashVerifierQrId || `CASHQR-${targetBooking.id}`}|BOOKING-${targetBooking.id}`;
                const reviewStyle =
                  cashReviewState === 'approved'
                    ? { ...styles.cashReviewNotice, ...styles.cashReviewApproved }
                    : cashReviewState === 'denied' || cashReviewState === 'error'
                      ? { ...styles.cashReviewNotice, ...styles.cashReviewDenied }
                      : { ...styles.cashReviewNotice, ...styles.cashReviewPending };

                return (
                  <>
                    <div style={styles.cashModalHeader}>
                      <h3 style={styles.ratingTitle}>Cash Payment Confirmation (QR Security)</h3>
                      <p style={styles.ratingSubtitle}>
                        For in-person cash payments, scan the worker-generated QR, enter your paid amount, and wait for worker approval/denial.
                      </p>
                    </div>

                    <div style={styles.cashSecurityCard}>
                      <img src={mockCashQr} alt="Worker cash confirmation QR" style={styles.cashQrImage} />
                      <div>
                        <p style={styles.cashSecurityTitle}>Worker Verification QR</p>
                        <p style={styles.cashSecurityText}>
                          This QR is only for cash confirmation and is separate from GCash QR.
                        </p>
                        <ul style={styles.cashMetaList}>
                          <li>Booking: #{targetBooking.id}</li>
                          <li>Worker: {targetBooking.workerName}</li>
                          <li>Expected Amount: ₱{targetBooking.quoteAmount.toLocaleString()}</li>
                          <li>Verification Code: {targetBooking.cashVerifierQrId || `CASHQR-${targetBooking.id}`}</li>
                        </ul>
                      </div>
                    </div>

                    <div style={styles.cashFieldGroup}>
                      <label style={styles.label} htmlFor="cash-amount">Amount Paid in Cash</label>
                      <input
                        id="cash-amount"
                        type="number"
                        min="1"
                        value={cashEnteredAmount}
                        onChange={(event) => setCashEnteredAmount(event.target.value)}
                        onFocus={() => setIsCashAmountFocused(true)}
                        onBlur={() => setIsCashAmountFocused(false)}
                        placeholder="Enter the amount you paid"
                        style={{ ...styles.cashAmountInput, ...(isCashAmountFocused ? styles.cashAmountInputFocused : {}) }}
                        disabled={cashReviewState === 'pending'}
                      />
                    </div>

                    {cashReviewMessage && <p style={reviewStyle}>{cashReviewMessage}</p>}

                    <div style={styles.ratingActions}>
                      <button style={styles.btnCancelRate} onClick={() => setCashConfirmBookingId(null)}>Close</button>
                      <button
                        style={{ ...styles.btnSubmitRate, ...(cashReviewState === 'pending' ? { background: '#94a3b8', cursor: 'not-allowed' } : {}) }}
                        onClick={handleSubmitCashConfirmation}
                        disabled={cashReviewState === 'pending'}
                      >
                        {cashReviewState === 'pending' ? 'Waiting for Worker...' : 'Submit to Worker Review'}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {transactionProofBookingId && (
          <div style={styles.ratingModalOverlay}>
            <div style={styles.ratingModal}>
              {(() => {
                const proofBooking = bookings.find((booking) => booking.id === transactionProofBookingId);
                if (!proofBooking) return null;

                return (
                  <>
                    <h3 style={styles.ratingTitle}>Payment Proof / Transaction ID</h3>
                    <p style={styles.ratingSubtitle}>
                      Use this transaction ID as proof during presentation and client-worker verification checks.
                    </p>

                    <div style={styles.paymentProofSection}>
                      <div style={styles.paymentInfoGroup}><p style={styles.infoLabel}><strong>Booking ID</strong></p><p style={styles.infoValue}>#{proofBooking.id}</p></div>
                      <div style={styles.paymentInfoGroup}><p style={styles.infoLabel}><strong>Worker</strong></p><p style={styles.infoValue}>{proofBooking.workerName}</p></div>
                      <div style={styles.paymentInfoGroup}><p style={styles.infoLabel}><strong>Service</strong></p><p style={styles.infoValue}>{proofBooking.serviceType}</p></div>
                      <div style={styles.paymentInfoGroup}><p style={styles.infoLabel}><strong>Payment Channel</strong></p><p style={styles.infoValue}>{proofBooking.paymentMethod === 'after-service-cash' ? 'Cash QR Confirmation' : 'GCash'}</p></div>
                      <div style={styles.paymentInfoGroup}><p style={styles.infoLabel}><strong>Amount</strong></p><p style={styles.infoValueAmount}>₱{proofBooking.quoteAmount.toLocaleString()}</p></div>
                      <div style={styles.paymentInfoGroup}><p style={styles.infoLabel}><strong>Transaction ID</strong></p><p style={styles.transactionModalValue}>{proofBooking.transactionId || proofBooking.paymentReference || 'Pending Transaction ID'}</p></div>
                    </div>

                    <div style={styles.ratingActions}>
                      <button style={styles.btnCancelRate} onClick={() => setTransactionProofBookingId(null)}>Close</button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {showPaymentStatusNotice && <div style={styles.paymentStatusNotice}>{paymentStatusMessage || 'Payment update submitted.'}</div>}
      </div>
    );
  }

  return (
    <div style={styles.myBookings}>
      {uiState === 'chat' && (
        <ChatWindow
          booking={currentBooking}
          bookings={bookings}
          selectedBookingId={selectedBookingId}
          onSelectBooking={handleOpenChat}
          onApproveQuote={() => handleApproveQuote(currentBooking.id)}
          onStopServiceAccepted={() => handleStopServiceAccepted(currentBooking.id)}
          onCancel={handleBackToList}
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
              <p style={styles.confirmationNote}>A confirmation SMS has been sent to your registered number. The worker will contact you shortly to confirm the details.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
