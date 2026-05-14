import React, { useEffect, useState } from 'react';


/**
 * PaymentModal Component
 * 
 * Final payment method selection in the booking workflow.
 * 
 * Flow:
 * 1. Display two payment options:
 *    - GCash Advance Payment: Client pays upfront via GCash
 *    - Pay After Service: Client pays after service is completed
 * 2. Selection triggers state change in parent (MyBookings)
 * 3. After selection, shows confirmation screen
 * 
 * Payment Methods:
 * - gcash-advance: Pay now via GCash (locked until payment confirmed)
 * - after-service: Pay after service completion (flexible)
 * 
 * State Management:
 * - selectedMethod: 'gcash-advance' | 'after-service' | null
 * - isProcessing: Loading state while the parent persists the selection
 */
const PaymentModal = ({ booking, onSelectPayment, onCancel }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [afterServiceChannel, setAfterServiceChannel] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [hoveredKey, setHoveredKey] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 720 : false
  );

  const allowsAdvanceGcash = booking?.allowGcashAdvance !== false;
  const allowsAfterService = booking?.allowAfterService !== false;
  const afterServicePaymentType = booking?.afterServicePaymentType || 'both';
  const allowsAfterServiceCash = allowsAfterService && (afterServicePaymentType === 'both' || afterServicePaymentType === 'cash-only');
  const allowsAfterServiceGcash = allowsAfterService && (afterServicePaymentType === 'both' || afterServicePaymentType === 'gcash-only');
  const isRequestBooking = booking?.bookingMode === 'calendar-only' || booking?.isRequestBooking;

  useEffect(() => {
    const availableMethods = [];
    if (allowsAdvanceGcash) availableMethods.push('gcash-advance');
    if (allowsAfterService) availableMethods.push('after-service');

    if (!availableMethods.includes(selectedMethod)) {
      setSelectedMethod(availableMethods[0] || null);
    }

    if (afterServicePaymentType === 'gcash-only') {
      setAfterServiceChannel('gcash');
    } else if (afterServicePaymentType === 'cash-only') {
      setAfterServiceChannel('cash');
    }
  }, [allowsAdvanceGcash, allowsAfterService, afterServicePaymentType, selectedMethod]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => setIsMobile(window.innerWidth <= 720);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // ============ EVENT HANDLERS ============
  
  /**
   * handleSelectMethod(method)
   * User selects a payment method
   * method = 'gcash-advance' | 'after-service'
   */
  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };
  
  /**
   * handleConfirmPayment()
   * Persists the chosen payment method through the parent callback.
   */
  const handleConfirmPayment = async () => {
    if (!selectedMethod) {
      setSubmitError('Please select a payment method.');
      return;
    }
    
    let resolvedMethod = selectedMethod;
    if (selectedMethod === 'after-service') {
      resolvedMethod = afterServiceChannel === 'gcash' ? 'after-service-gcash' : 'after-service-cash';
    }

    try {
      setSubmitError('');
      setShowProcessing(true);
      setIsProcessing(true);
      await Promise.resolve(onSelectPayment(resolvedMethod));
    } finally {
      setIsProcessing(false);
      setShowProcessing(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'center',
      zIndex: 280,
      padding: isMobile ? '0.75rem' : '1rem',
      overflowY: 'auto',
    },
    card: {
      width: 'min(100%, 900px)',
      maxHeight: isMobile ? 'calc(100svh - 24px)' : '94vh',
      overflowY: 'auto',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      boxShadow: '0 18px 40px rgba(15, 23, 42, 0.24)',
    },
    header: {
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      padding: isMobile ? '0.75rem' : '0.85rem 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: '0.6rem',
      flexWrap: 'wrap',
    },
    subtitle: { marginTop: '0.25rem', color: '#64748b' },
    close: { width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' },
    summary: {
      margin: '0.85rem 1rem 0',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      backgroundColor: '#f8fafc',
      padding: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem',
    },
    row: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: isMobile ? '0.15rem' : '0.5rem', color: '#334155' },
    label: { fontWeight: 700 },
    value: { color: '#0f172a' },
    amount: { color: '#166534', fontWeight: 800 },
    processing: {
      margin: '1rem',
      border: '1px solid #bfdbfe',
      backgroundColor: '#eff6ff',
      borderRadius: '8px',
      padding: '1rem',
      textAlign: 'center',
      color: '#1e3a8a',
    },
    spinner: {
      width: '34px',
      height: '34px',
      borderRadius: '999px',
      border: '4px solid #bfdbfe',
      borderTopColor: '#2563eb',
      margin: '0 auto 0.6rem',
    },
    methods: {
      padding: '0.9rem 1rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))',
      gap: '0.65rem',
    },
    option: {
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '0.7rem',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
    },
    optionSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
    optionHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
    icon: { fontSize: '1.1rem' },
    desc: { color: '#334155', fontSize: '0.9rem' },
    list: { margin: '0.45rem 0', color: '#334155', paddingLeft: '1.15rem' },
    footer: { borderTop: '1px solid #e2e8f0', marginTop: '0.5rem', paddingTop: '0.45rem', color: '#0f172a' },
    chooser: {
      display: 'flex',
      gap: '0.6rem',
      marginTop: '0.45rem',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      padding: '0.45rem 0.5rem',
      flexWrap: 'wrap',
    },
    actionWrap: {
      borderTop: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      padding: '0.75rem 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      gap: '0.7rem',
      alignItems: isMobile ? 'stretch' : 'center',
      flexWrap: 'wrap',
      flexDirection: isMobile ? 'column' : 'row',
    },
    note: { margin: 0, color: '#334155', fontSize: '0.9rem', maxWidth: '560px' },
    confirm: {
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontWeight: 700,
      cursor: 'pointer',
      padding: '0.55rem 0.85rem',
      width: isMobile ? '100%' : 'auto',
    },
  };
  
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h2>Select Payment Method</h2>
          <p style={styles.subtitle}>
            Choose how you'd like to pay for {booking.workerName}'s service
          </p>
          <button style={styles.close} onClick={onCancel} aria-label="Cancel payment selection">x</button>
        </div>
        
        {/* Payment Summary */}
        <div style={styles.summary}>
          <div style={styles.row}>
            <span style={styles.label}>Service:</span>
            <span style={styles.value}>{booking.serviceType}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Cost:</span>
            <span style={{ ...styles.value, ...styles.amount }}>PHP {booking.quoteAmount}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>{isRequestBooking ? 'Schedule:' : 'Scheduled:'}</span>
            <span style={styles.value}>
              {isRequestBooking
                ? 'Coordinated through chat'
                : `${booking.selectedSlot?.date || 'Pending'} at ${booking.selectedSlot?.timeBlock?.startTime || 'TBD'}`}
            </span>
          </div>
        </div>
        
        {/* Processing Overlay */}
        {submitError && (
          <div style={{ margin: '0.8rem 1rem 0', color: '#b91c1c', fontWeight: 700, fontSize: '13px' }}>
            {submitError}
          </div>
        )}

        {showProcessing && (
          <div style={styles.processing}>
            <div style={styles.spinner}></div>
            <p>{isProcessing ? 'Saving payment choice...' : 'Payment choice saved.'}</p>
          </div>
        )}
        
        {/* Payment Method Selection */}
        {!showProcessing && (
          <div style={styles.methods}>
            {allowsAdvanceGcash && (
              <div
                style={{
                  ...styles.option,
                  ...(selectedMethod === 'gcash-advance' ? styles.optionSelected : {}),
                  ...(hoveredKey === 'gcash-option' && selectedMethod !== 'gcash-advance' ? { backgroundColor: '#f8fafc' } : {}),
                }}
                onClick={() => handleSelectMethod('gcash-advance')}
                onMouseEnter={() => setHoveredKey('gcash-option')}
                onMouseLeave={() => setHoveredKey('')}
              >
                <div style={styles.optionHeader}>
                  <input
                    type="radio"
                    name="payment-method"
                    value="gcash-advance"
                    checked={selectedMethod === 'gcash-advance'}
                    onChange={() => {}}
                  />
                  <div style={styles.icon}></div>
                  <h3>GCash Advance Payment</h3>
                </div>

                <p style={styles.desc}>
                  {isRequestBooking
                    ? 'Pay now via GCash after agreeing on the details in chat.'
                    : 'Pay now via GCash, immediately securing your booking slot'}
                </p>

                <ul style={styles.list}>
                  <li>- Booking confirmed instantly</li>
                  <li>- Payment secured with GCash encryption</li>
                  <li>- Receive booking receipt via SMS</li>
                  <li>- Refund eligible if service not rendered</li>
                </ul>

                <div style={styles.footer}>
                  <p>Total: <strong>PHP {booking.quoteAmount}</strong></p>
                </div>
              </div>
            )}

            {allowsAfterService && (
              <div
                style={{
                  ...styles.option,
                  ...(selectedMethod === 'after-service' ? styles.optionSelected : {}),
                  ...(hoveredKey === 'after-service-option' && selectedMethod !== 'after-service' ? { backgroundColor: '#f8fafc' } : {}),
                }}
                onClick={() => handleSelectMethod('after-service')}
                onMouseEnter={() => setHoveredKey('after-service-option')}
                onMouseLeave={() => setHoveredKey('')}
              >
                <div style={styles.optionHeader}>
                  <input
                    type="radio"
                    name="payment-method"
                    value="after-service"
                    checked={selectedMethod === 'after-service'}
                    onChange={() => {}}
                  />
                  <div style={styles.icon}></div>
                  <h3>Pay After Service</h3>
                </div>

                <p style={styles.desc}>
                  {afterServicePaymentType === 'cash-only'
                    ? 'Pay in cash after the service is completed.'
                    : afterServicePaymentType === 'gcash-only'
                      ? 'Pay via GCash after the service is completed.'
                      : 'Pay after the service is completed and choose Cash or GCash.'}
                </p>

                {selectedMethod === 'after-service' && afterServicePaymentType === 'both' && (
                  <div style={styles.chooser}>
                    <label>
                      <input
                        type="radio"
                        name="after-service-channel"
                        value="cash"
                        checked={afterServiceChannel === 'cash'}
                        onChange={() => setAfterServiceChannel('cash')}
                      />
                      Cash
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="after-service-channel"
                        value="gcash"
                        checked={afterServiceChannel === 'gcash'}
                        onChange={() => setAfterServiceChannel('gcash')}
                      />
                      GCash
                    </label>
                  </div>
                )}

                <ul style={styles.list}>
                  {allowsAfterServiceCash && <li>- Cash payment accepted after completion</li>}
                  {allowsAfterServiceGcash && <li>- GCash payment accepted after completion</li>}
                  <li>- Verify service quality before paying</li>
                  <li>- Worker receives notification of your choice</li>
                </ul>

                <div style={styles.footer}>
                  <p>Total: <strong>PHP {booking.quoteAmount}</strong></p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Confirmation Button */}
        {!showProcessing || !isProcessing ? (
          <div style={styles.actionWrap}>
            <p style={styles.note}>
              {selectedMethod === 'after-service' && afterServiceChannel === 'cash'
                ? 'Cash payment is expected after service completion.'
                : 'GCash payment will redirect you to GCash app or website to complete the transaction.'}
            </p>
            <button
              style={{
                ...styles.confirm,
                ...(selectedMethod
                  ? { backgroundColor: hoveredKey === 'confirm-payment' ? '#1d4ed8' : '#2563eb' }
                  : { backgroundColor: '#94a3b8', cursor: 'not-allowed' }),
              }}
              onClick={handleConfirmPayment}
              disabled={!selectedMethod || isProcessing}
              onMouseEnter={() => setHoveredKey('confirm-payment')}
              onMouseLeave={() => setHoveredKey('')}
            >
              {isProcessing ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentModal;
