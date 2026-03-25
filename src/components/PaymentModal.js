import React, { useEffect, useState } from 'react';
import '../styles/PaymentModal.css';

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
 * - isProcessing: Loading state during "payment confirmation"
 */
const PaymentModal = ({ booking, onSelectPayment, onCancel }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [afterServiceChannel, setAfterServiceChannel] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  const allowsAdvanceGcash = booking?.allowGcashAdvance !== false;
  const allowsAfterService = booking?.allowAfterService !== false;
  const afterServicePaymentType = booking?.afterServicePaymentType || 'both';
  const allowsAfterServiceCash = allowsAfterService && (afterServicePaymentType === 'both' || afterServicePaymentType === 'cash-only');
  const allowsAfterServiceGcash = allowsAfterService && (afterServicePaymentType === 'both' || afterServicePaymentType === 'gcash-only');

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
   * Transition: Payment Modal → Confirmation
   * Simulates payment processing and calls parent callback
   */
  const handleConfirmPayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }
    
    let resolvedMethod = selectedMethod;
    if (selectedMethod === 'after-service') {
      resolvedMethod = afterServiceChannel === 'gcash' ? 'after-service-gcash' : 'after-service-cash';
    }

    // Show processing animation
    setShowProcessing(true);
    setIsProcessing(true);
    
    // Simulate payment processing delay (2 seconds)
    setTimeout(() => {
      setIsProcessing(false);
      
      // Call parent callback to transition to confirmation
      onSelectPayment(resolvedMethod);
    }, 2000);
  };
  
  return (
    <div className="payment-overlay">
      <div className="payment-card">
        {/* Header */}
        <div className="payment-header">
          <h2>Select Payment Method</h2>
          <p className="payment-subtitle">
            Choose how you'd like to pay for {booking.workerName}'s service
          </p>
          <button className="payment-close-btn" onClick={onCancel}>✕</button>
        </div>
        
        {/* Payment Summary */}
        <div className="payment-summary">
          <div className="summary-row">
            <span className="label">Service:</span>
            <span className="value">{booking.serviceType}</span>
          </div>
          <div className="summary-row">
            <span className="label">Cost:</span>
            <span className="value amount">₱{booking.quoteAmount}</span>
          </div>
          <div className="summary-row">
            <span className="label">Scheduled:</span>
            <span className="value">
              {booking.selectedSlot?.date} at {booking.selectedSlot?.timeBlock.startTime}
            </span>
          </div>
        </div>
        
        {/* Processing Overlay */}
        {showProcessing && (
          <div className="payment-processing">
            <div className="processing-spinner"></div>
            <p>{isProcessing ? 'Processing payment...' : 'Payment confirmed!'}</p>
          </div>
        )}
        
        {/* Payment Method Selection */}
        {!showProcessing && (
          <div className="payment-methods">
            {allowsAdvanceGcash && (
              <div
                className={`payment-option gcash-option ${
                  selectedMethod === 'gcash-advance' ? 'selected' : ''
                }`}
                onClick={() => handleSelectMethod('gcash-advance')}
              >
                <div className="option-header">
                  <input
                    type="radio"
                    name="payment-method"
                    value="gcash-advance"
                    checked={selectedMethod === 'gcash-advance'}
                    onChange={() => {}}
                    className="option-radio"
                  />
                  <div className="option-icon">💳</div>
                  <h3>GCash Advance Payment</h3>
                </div>

                <p className="option-description">
                  Pay now via GCash, immediately securing your booking slot
                </p>

                <ul className="option-benefits">
                  <li>✓ Booking confirmed instantly</li>
                  <li>✓ Payment secured with GCash encryption</li>
                  <li>✓ Receive booking receipt via SMS</li>
                  <li>✓ Refund eligible if service not rendered</li>
                </ul>

                <div className="option-footer">
                  <p className="total-amount">Total: <strong>₱{booking.quoteAmount}</strong></p>
                </div>
              </div>
            )}

            {allowsAfterService && (
              <div
                className={`payment-option after-service-option ${
                  selectedMethod === 'after-service' ? 'selected' : ''
                }`}
                onClick={() => handleSelectMethod('after-service')}
              >
                <div className="option-header">
                  <input
                    type="radio"
                    name="payment-method"
                    value="after-service"
                    checked={selectedMethod === 'after-service'}
                    onChange={() => {}}
                    className="option-radio"
                  />
                  <div className="option-icon">🎯</div>
                  <h3>Pay After Service</h3>
                </div>

                <p className="option-description">
                  {afterServicePaymentType === 'cash-only'
                    ? 'Pay in cash after the service is completed.'
                    : afterServicePaymentType === 'gcash-only'
                      ? 'Pay via GCash after the service is completed.'
                      : 'Pay after the service is completed and choose Cash or GCash.'}
                </p>

                {selectedMethod === 'after-service' && afterServicePaymentType === 'both' && (
                  <div className="after-service-chooser">
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

                <ul className="option-benefits">
                  {allowsAfterServiceCash && <li>✓ Cash payment accepted after completion</li>}
                  {allowsAfterServiceGcash && <li>✓ GCash payment accepted after completion</li>}
                  <li>✓ Verify service quality before paying</li>
                  <li>✓ Worker receives notification of your choice</li>
                </ul>

                <div className="option-footer">
                  <p className="total-amount">Total: <strong>₱{booking.quoteAmount}</strong></p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Confirmation Button */}
        {!showProcessing || !isProcessing ? (
          <div className="payment-action">
            <p className="payment-note">
              {selectedMethod === 'after-service' && afterServiceChannel === 'cash'
                ? 'Cash payment is expected after service completion.'
                : 'GCash payment will redirect you to GCash app or website to complete the transaction.'}
            </p>
            <button
              className={`btn-confirm-payment ${selectedMethod ? 'active' : 'disabled'}`}
              onClick={handleConfirmPayment}
              disabled={!selectedMethod || isProcessing}
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
