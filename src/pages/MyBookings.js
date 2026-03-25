import React, { useState } from 'react';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';
import SlotSelectionModal from '../components/SlotSelectionModal';
import PaymentModal from '../components/PaymentModal';
import '../styles/MyBookings.css';

/**
 * MyBookings Component
 * 
 * Manages the client's booking lifecycle with state-driven UI transitions:
 * 'list' → 'chat' → 'slots' → 'payment' → 'confirmed'
 * 
 * Each booking progresses through:
 * 1. Booking List (shows all active service requests)
 * 2. Chat & Quote Negotiation (Shopee-style messaging)
 * 3. Slot Selection (eGov-style calendar booking)
 * 4. Payment Selection (GCash Advance or After Service)
 * 5. Confirmation (transaction complete)
 */
const MyBookings = ({ onGoHome, onLogout, onOpenSellerSetup, onOpenMyWork, sellerProfile, onOpenProfile, onOpenAccountSettings, onOpenSettings }) => {
  // ============ STATE MANAGEMENT ============
  
  // Track which booking is being viewed (null = viewing list)
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  
  // UI state for current booking: 'chat' | 'slots' | 'payment' | 'confirmed'
  // 'chat' = showing quote negotiation
  // 'slots' = showing slot selection after quote approved
  // 'payment' = showing payment method selection
  // 'confirmed' = showing final confirmation
  const [uiState, setUiState] = useState('chat');
  const [activeFilter, setActiveFilter] = useState('all');
  const [ratingTargetId, setRatingTargetId] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [paymentProofBookingId, setPaymentProofBookingId] = useState(null);
  const [proofFileName, setProofFileName] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [showPaymentStatusNotice, setShowPaymentStatusNotice] = useState(false);
  const [paymentProofError, setPaymentProofError] = useState('');

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

  // Utility function to generate random Philippine GCash numbers (09XXXXXXXXX format)
  const generateRandomGcashNumber = () => {
    const firstDigit = Math.floor(Math.random() * 3) + 5; // 5, 6, or 7 (common prefixes)
    const remainingDigits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
    return `09${firstDigit}${remainingDigits}`;
  };
  
  // Simulated bookings list with various statuses
  const [bookings, setBookings] = useState([
    {
      id: 1,
      workerId: 101,
      workerName: 'Maria Santos',
      serviceType: 'House Cleaning',
      status: 'Negotiating', // Awaiting response to quote
      requestDate: '2026-03-20',
      description: 'Full house cleaning (3 bedrooms)',
      quoteAmount: 2500, // ₱2500 quote from worker
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
      paymentReference: '',
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
  ]);

  const isGcashFlow = (paymentMethod) => paymentMethod === 'gcash-advance' || paymentMethod === 'after-service-gcash';
  
  // ============ EVENT HANDLERS ============
  
  /**
   * handleOpenChat()
   * Transition: Booking List → Chat Window
   * Sets selectedBookingId and initializes UI state to 'chat'
   */
  const handleOpenChat = (bookingId) => {
    setSelectedBookingId(bookingId);
    setUiState('chat'); // Show quote negotiation window
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
    setShowPaymentStatusNotice(true);
    setTimeout(() => setShowPaymentStatusNotice(false), 2600);
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
  
  /**
   * handleApproveQuote()
   * Transition: Chat Window → Slot Selection
   * Updates booking status and moves to slot selection UI
   */
  const handleApproveQuote = (bookingId) => {
    // Update booking to show quote was approved
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, quoteApproved: true, status: 'Awaiting Slot Selection' }
          : booking
      )
    );
    
    // Change UI to show slot selection modal
    setUiState('slots'); // Show calendar and time slots
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
  
  /**
   * handleConfirmSlot()
   * Transition: Slot Selection → Payment Modal
   * Stores selected slot (date + time block) and moves to payment method choice
   */
  const handleConfirmSlot = (bookingId, slotInfo) => {
    // slotInfo = { date, timeBlock: { id, startTime, endTime, slotsLeft } }
    
    // Update booking with selected slot
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, selectedSlot: slotInfo, status: 'Slot Selected - Payment Pending' }
          : booking
      )
    );
    
    // Change UI to show payment method selection
    setUiState('payment'); // Show GCash Advance vs After Service options
  };
  
  /**
   * handleSelectPaymentMethod()
   * Transition: Payment Modal → Confirmation
   * Records payment method choice and shows confirmation
   */
  const handleSelectPaymentMethod = (bookingId, paymentMethod) => {
    // paymentMethod = 'gcash-advance' | 'after-service'
    
    // Update booking with payment method and mark as confirmed
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId
          ? {
              ...booking,
              paymentMethod,
              status: paymentMethod === 'gcash-advance' ? 'Payment Confirmed' : 'Service Scheduled',
            }
          : booking
      )
    );
    
    // Change UI to confirmation screen
    setUiState('confirmed'); // Show final confirmation with booking details
  };
  
  /**
   * handleBackToList()
   * Transition: Any modal → Booking List
   * Returns to main booking list view
   */
  const handleBackToList = () => {
    setSelectedBookingId(null);
    setUiState('chat'); // Reset to default state
  };
  
  /**
   * handleNewInquiry()
   * Transition: Confirmation → Booking List
   * Clears selection to return to booking list after transaction completes
   */
  const handleNewInquiry = () => {
    setSelectedBookingId(null);
    setUiState('chat');
  };
  
  // ============ RENDER LOGIC ============
  
  // Get currently selected booking
  const currentBooking = bookings.find(b => b.id === selectedBookingId);
  const filteredBookings = bookings.filter((booking) => {
    if (activeFilter === 'completed') {
      return booking.status === 'Completed Service' || booking.status === 'Service Stopped';
    }
    if (activeFilter === 'active') {
      return booking.status !== 'Completed Service' && booking.status !== 'Service Stopped';
    }
    return true;
  });
  
  // If no booking selected, show booking list
  if (!selectedBookingId) {
    return (
      <div className="my-bookings">
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
        />

        <div className="bookings-header">
          <h1>My Bookings & Transactions</h1>
          <p className="subtitle">Manage your service requests and track negotiations</p>
        </div>

        <div className="bookings-filters">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Transactions
          </button>
          <button
            className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Done / Completed
          </button>
        </div>
        
        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <p>No transactions found for this filter.</p>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-info">
                  <h3 className="worker-name">{booking.workerName}</h3>
                  <p className="service-type">{booking.serviceType}</p>
                  <p className="description">{booking.description}</p>
                  <div className="booking-meta">
                    <span className="request-date">Requested: {booking.requestDate}</span>
                    {isRecurringBilling(booking) && (
                      <span className="billing-badge">
                        {getBillingLabel(booking)} Billing
                      </span>
                    )}
                    {isRecurringBilling(booking) && booking.nextChargeDate && !isBookingStopped(booking) && (
                      <span className="next-charge-date">
                        Next charge: {booking.nextChargeDate}
                      </span>
                    )}
                    <span className={`status-badge status-${booking.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {booking.status}
                    </span>
                    {booking.rating && (
                      <span className="booking-rating">Rating: {'★'.repeat(booking.rating)} ({booking.rating}/5)</span>
                    )}
                  </div>
                </div>
                
                <div className="booking-actions">
                  <div className="quote-preview">
                    <span className="quote-label">Quote:</span>
                    <span className="quote-amount">
                      ₱{booking.quoteAmount}
                      {isRecurringBilling(booking)
                        ? ` / ${booking.billingCycle === 'monthly' ? 'month' : 'week'}`
                        : ''}
                    </span>
                  </div>
                  {isGcashFlow(booking.paymentMethod) && booking.status !== 'Completed Service' && (
                    <div className="gcash-preview">
                      <span className="gcash-label">GCash:</span>
                      <span className="gcash-number">{booking.gcashNumber || '09054891105'}</span>
                    </div>
                  )}
                  <div className="booking-action-row">
                    <button
                      className="open-chat-btn"
                      onClick={() => handleOpenChat(booking.id)}
                    >
                      Open Chat
                    </button>
                    {isGcashFlow(booking.paymentMethod)
                      && booking.status !== 'Service Stopped'
                      && (
                        (isRecurringBilling(booking) && isRecurringChargeDue(booking))
                        || (!isRecurringBilling(booking) && !booking.paymentProofSubmitted)
                      ) && (
                      <button
                        className="pay-gcash-btn"
                        onClick={() => handleOpenPaymentProofModal(booking.id)}
                      >
                        {isRecurringBilling(booking)
                          ? `Pay ${getBillingLabel(booking)} Charge`
                          : 'Pay via GCash'}
                      </button>
                    )}
                    {(booking.status === 'Completed Service' || booking.canRate || booking.paymentProofSubmitted) && (
                      <button
                        className="rate-btn"
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
          <div className="rating-modal-overlay">
            <div className="rating-modal">
              <h3>Rate Completed Service</h3>
              <p className="rating-subtitle">Your feedback helps build worker ratings shown in the dashboard.</p>

              <label>Rating (Tap a star)</label>
              <div className="star-rating" onMouseLeave={() => setRatingHover(0)}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = (ratingHover || ratingValue) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${isActive ? 'active' : ''}`}
                      onMouseEnter={() => setRatingHover(star)}
                      onClick={() => setRatingValue(star)}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <p className="star-rating-value">Selected: {ratingValue}/5</p>

              <label htmlFor="rating-comment">Review (optional)</label>
              <textarea
                id="rating-comment"
                rows={4}
                value={ratingComment}
                onChange={(event) => setRatingComment(event.target.value)}
                placeholder="Share your experience with this service..."
              />

              <div className="rating-actions">
                <button className="btn-cancel-rate" onClick={() => setRatingTargetId(null)}>
                  Cancel
                </button>
                <button className="btn-submit-rate" onClick={handleSubmitRating}>
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        )}

        {paymentProofBookingId && (
          <div className="rating-modal-overlay">
            <div className="rating-modal payment-proof-modal">
              <h3>GCash Payment</h3>
              <p className="rating-subtitle">
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
                    <div className="gcash-payment-header">
                      <img
                        src={targetBooking.qrImageUrl}
                        alt="GCash QR"
                        className="gcash-qr-image"
                      />
                      <div className="gcash-payment-info">
                        <div className="payment-info-group">
                          <p className="info-label"><strong>Worker</strong></p>
                          <p className="info-value">{targetBooking.workerName}</p>
                        </div>
                        <div className="payment-info-group">
                          <p className="info-label"><strong>Service</strong></p>
                          <p className="info-value">{targetBooking.serviceType}</p>
                        </div>
                        <div className="payment-info-group">
                          <p className="info-label"><strong>Amount</strong></p>
                          <p className="info-value amount">₱{targetBooking.quoteAmount.toLocaleString()}</p>
                        </div>
                        {isRecurringBilling(targetBooking) && (
                          <div className="payment-info-group">
                            <p className="info-label"><strong>Billing Cycle</strong></p>
                            <p className="info-value">{getBillingLabel(targetBooking)}</p>
                          </div>
                        )}
                        {isRecurringBilling(targetBooking) && targetBooking.nextChargeDate && (
                          <div className="payment-info-group">
                            <p className="info-label"><strong>Charge Due Date</strong></p>
                            <p className="info-value">{targetBooking.nextChargeDate}</p>
                          </div>
                        )}
                        <div className="payment-info-group gcash-number-group">
                          <p className="info-label"><strong>GCash Number</strong></p>
                          <p className="info-value gcash-number">{targetBooking.gcashNumber}</p>
                        </div>
                      </div>
                    </div>

                    <div className="payment-proof-section">
                      <h4>Payment Proof</h4>
                      
                      <div className="proof-upload-group">
                        <label htmlFor="proof-upload">Upload Proof of Transaction (Optional)</label>
                        <input id="proof-upload" type="file" accept="image/*,.pdf" onChange={handleProofFileChange} />
                        <p className="proof-file-name">{proofFileName ? `Selected: ${proofFileName}` : 'No file selected'}</p>
                      </div>

                      <div className="reference-number-group">
                        <label htmlFor="reference-no">Reference Number (Optional)</label>
                        <input
                          id="reference-no"
                          type="text"
                          value={referenceNo}
                          onChange={(event) => setReferenceNo(event.target.value)}
                          placeholder="Enter GCash reference number"
                          className="reference-input"
                        />
                      </div>
                    </div>
                  </>
                );
              })()}

              {paymentProofError && <p className="error-text-inline">{paymentProofError}</p>}

              <div className="rating-actions">
                <button className="btn-cancel-rate" onClick={() => setPaymentProofBookingId(null)}>
                  Cancel
                </button>
                <button className="btn-submit-rate" onClick={handleSubmitPaymentProof}>
                  Submit Proof
                </button>
              </div>
            </div>
          </div>
        )}

        {showPaymentStatusNotice && (
          <div className="payment-status-notice">
            Payment proof submitted. Please check My Bookings for the updated status.
          </div>
        )}
      </div>
    );
  }
  
  // If a booking is selected, show appropriate modal based on uiState
  return (
    <div className="my-bookings">
      {/* UI STATE: 'chat' - Quote Negotiation Window (Shopee-style) */}
      {uiState === 'chat' && (
        <ChatWindow
          booking={currentBooking}
          onApproveQuote={() => handleApproveQuote(currentBooking.id)}
          onStopServiceAccepted={() => handleStopServiceAccepted(currentBooking.id)}
          onCancel={handleBackToList}
        />
      )}
      
      {/* UI STATE: 'slots' - Slot Selection (eGov-style calendar) */}
      {uiState === 'slots' && (
        <SlotSelectionModal
          booking={currentBooking}
          onConfirmSlot={(slotInfo) => handleConfirmSlot(currentBooking.id, slotInfo)}
          onCancel={handleBackToList}
        />
      )}
      
      {/* UI STATE: 'payment' - Payment Method Selection */}
      {uiState === 'payment' && (
        <PaymentModal
          booking={currentBooking}
          onSelectPayment={(method) => handleSelectPaymentMethod(currentBooking.id, method)}
          onCancel={handleBackToList}
        />
      )}
      
      {/* UI STATE: 'confirmed' - Booking Confirmation */}
      {uiState === 'confirmed' && (
        <div className="confirmation-overlay">
          <div className="confirmation-card">
            <div className="confirmation-header">
              <div className="checkmark-icon">✓</div>
              <h2>Booking Confirmed!</h2>
            </div>
            
            <div className="confirmation-details">
              <div className="detail-row">
                <span className="label">Worker:</span>
                <span className="value">{currentBooking.workerName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Service:</span>
                <span className="value">{currentBooking.serviceType}</span>
              </div>
              <div className="detail-row">
                <span className="label">Amount:</span>
                <span className="value">₱{currentBooking.quoteAmount}</span>
              </div>
              <div className="detail-row">
                <span className="label">Scheduled Date:</span>
                <span className="value">{currentBooking.selectedSlot?.date}</span>
              </div>
              <div className="detail-row">
                <span className="label">Time Slot:</span>
                <span className="value">
                  {currentBooking.selectedSlot?.timeBlock.startTime} - {currentBooking.selectedSlot?.timeBlock.endTime}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Payment Method:</span>
                <span className={`value payment-${currentBooking.paymentMethod}`}>
                  {currentBooking.paymentMethod === 'gcash-advance'
                    ? 'GCash Advance Payment'
                    : currentBooking.paymentMethod === 'after-service-gcash'
                      ? 'Pay After Service (GCash)'
                      : 'Pay After Service (Cash)'}
                </span>
              </div>
            </div>
            
            <div className="confirmation-actions">
              <button
                className="btn-primary back-to-bookings"
                onClick={handleNewInquiry}
              >
                Back to My Bookings
              </button>
              <p className="confirmation-note">
                A confirmation SMS has been sent to your registered number.
                The worker will contact you shortly to confirm the details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
