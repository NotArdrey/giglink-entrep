import { useState } from 'react';
// Note: Simplified onboarding flow - location is now fetched from user registration using PH-API
// Note: Step 1: Basic Professional Info, Step 2: Service & Payment Setup, Step 3: Service Delivery Setup
// Note: Location data comes from registration (userLocation prop) instead of being selected here
import '../styles/SellerOnboarding.css';

function SellerOnboarding({ onBack, onComplete, userLocation, isFloating = false }) {
  const [step, setStep] = useState(1);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    serviceType: '',
    customServiceType: '',
    bio: '',
    pricingModel: 'fixed',
    fixedPrice: '',
    bookingMode: 'with-slots',
    rateBasis: 'per-hour',
    paymentAdvance: false,
    paymentAfterService: true,
    afterServicePaymentType: 'both',
    gcashNumber: '',
    qrFileName: '',
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      const hasBasicFields = formData.fullName.trim() && formData.serviceType && formData.bio.trim();
      const hasCustomService =
        formData.serviceType !== 'Others' || formData.customServiceType.trim().length > 0;

      if (!hasBasicFields || !hasCustomService) {
        setErrorMessage('Please complete all required fields in Step 1.');
        return;
      }
    }

    if (step === 2 && formData.pricingModel === 'fixed' && (!formData.fixedPrice || Number(formData.fixedPrice) <= 0)) {
      setErrorMessage('Please enter a valid fixed price amount before continuing.');
      return;
    }

    setErrorMessage('');
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack && onBack();
    }
  };

  const handleSubmit = () => {
    if (formData.pricingModel === 'fixed' && (!formData.fixedPrice || Number(formData.fixedPrice) <= 0)) {
      setErrorMessage('Please enter a valid fixed price amount.');
      return;
    }

    setErrorMessage('');
    setShowCompletionModal(true);
  };

  const getCompleteProfile = () => ({
    ...formData,
    location: userLocation,
  });

  const handleCompletionChoice = (destination) => {
    const completeProfile = getCompleteProfile();
    setShowCompletionModal(false);
    onComplete && onComplete(completeProfile, destination);
  };

  const handleQrUpload = (event) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (!selectedFile) return;
    updateField('qrFileName', selectedFile.name);
  };

  const rateBasisPriceLabelMap = {
    'per-hour': 'Price Per Hour (PHP)',
    'per-day': 'Price Per Day (PHP)',
    'per-week': 'Price Per Week (PHP)',
    'per-month': 'Price Per Month (PHP)',
    'per-project': 'Price Per Project (PHP)',
  };

  const fixedPriceLabel = rateBasisPriceLabelMap[formData.rateBasis] || 'Fixed Price (PHP)';

  return (
    <div className={`onboarding-page ${isFloating ? 'onboarding-page-floating' : ''}`}>
      <div className="onboarding-card">
        <div className="onboarding-header">
          {isFloating && (
            <button
              type="button"
              className="onboarding-close-button"
              onClick={onBack}
              aria-label="Close seller onboarding"
            >
              x
            </button>
          )}
          <h1>Become a Seller</h1>
          <p>Step {step} of 3</p>
        </div>

        {/* Location Summary - Displayed at top for all steps */}
        {userLocation && (
          <div className="location-summary">
            <p style={{ fontSize: '12px', color: '#7f8c8d', margin: '0 0 6px 0' }}>
              📍 Service Location (from registration):
            </p>
            <div style={{
              padding: '10px 12px',
              background: '#f0f8ff',
              border: '1px solid #bfd4ff',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#2c3e50',
              fontWeight: '500',
            }}>
              {userLocation.barangay}, {userLocation.city}
              {userLocation.address && ` • ${userLocation.address}`}
            </div>
          </div>
        )}

        {step === 1 && (
          <section className="onboarding-step">
            <h2>Basic Professional Info</h2>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              placeholder="Enter your full name"
            />

            <label htmlFor="serviceType">Service Type</label>
            <select
              id="serviceType"
              value={formData.serviceType}
              onChange={(event) => {
                const selected = event.target.value;
                updateField('serviceType', selected);
                if (selected !== 'Others') {
                  updateField('customServiceType', '');
                }
              }}
            >
              <option value="">Select service type</option>
              <option value="Tutor">Tutor</option>
              <option value="Technician">Technician</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Designer">Designer</option>
              <option value="Gaming Coach">Gaming Coach</option>
              <option value="Others">Others</option>
            </select>

            {formData.serviceType === 'Others' && (
              <>
                <label htmlFor="customServiceType">Enter Your Service Type</label>
                <input
                  id="customServiceType"
                  type="text"
                  value={formData.customServiceType}
                  onChange={(event) => updateField('customServiceType', event.target.value)}
                  placeholder="Example: Pilot Service for Online Games"
                />
              </>
            )}

            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(event) => updateField('bio', event.target.value)}
              placeholder="Tell clients about your experience and style"
              rows={4}
            ></textarea>
          </section>
        )}

        {step === 2 && (
          <section className="onboarding-step">
            <h2>Service & Payment Setup</h2>

            <p className="field-label">Pricing Model</p>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-button ${formData.pricingModel === 'fixed' ? 'active' : ''}`}
                onClick={() => updateField('pricingModel', 'fixed')}
              >
                Fixed Price
              </button>
              <button
                type="button"
                className={`toggle-button ${formData.pricingModel === 'inquiry' ? 'active' : ''}`}
                onClick={() => updateField('pricingModel', 'inquiry')}
              >
                Inquiry Based
              </button>
            </div>

            {formData.pricingModel === 'fixed' && (
              <>
                <label htmlFor="fixedPrice">{fixedPriceLabel}</label>
                <input
                  id="fixedPrice"
                  type="number"
                  min="1"
                  value={formData.fixedPrice}
                  onChange={(event) => updateField('fixedPrice', event.target.value)}
                  placeholder="Enter fixed amount"
                />
              </>
            )}

            {formData.pricingModel === 'inquiry' && (
              <div style={{
                padding: '12px',
                background: '#e8f8f5',
                border: '1px solid #a3e4d7',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#117a65',
                marginTop: '10px',
              }}>
                💡 You'll negotiate prices with clients through the chat. Each inquiry gets a custom quote.
              </div>
            )}

            <p className="field-label">Payment Options</p>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={formData.paymentAdvance}
                onChange={(event) => updateField('paymentAdvance', event.target.checked)}
              />
              <span>Advance Payment (GCash)</span>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={formData.paymentAfterService}
                onChange={(event) => updateField('paymentAfterService', event.target.checked)}
              />
              <span>After Service Payment</span>
            </label>

            {formData.paymentAfterService && (
              <>
                <label htmlFor="afterServicePaymentType">After Service Payment Type</label>
                <select
                  id="afterServicePaymentType"
                  value={formData.afterServicePaymentType}
                  onChange={(event) => updateField('afterServicePaymentType', event.target.value)}
                >
                  <option value="both">Cash or GCash</option>
                  <option value="cash-only">Cash Only</option>
                  <option value="gcash-only">GCash Only</option>
                </select>
              </>
            )}

            {(formData.paymentAdvance || (formData.paymentAfterService && formData.afterServicePaymentType !== 'cash-only')) && (
              <div className="payment-extra-fields">
                <label htmlFor="gcashNumber">GCash Number</label>
                <input
                  id="gcashNumber"
                  type="tel"
                  value={formData.gcashNumber}
                  onChange={(event) => updateField('gcashNumber', event.target.value)}
                  placeholder="e.g., 09XXXXXXXXX"
                />

                <label htmlFor="qrUpload">Upload QR (optional)</label>
                <input
                  id="qrUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                />
                <p className="qr-upload-hint">
                  {formData.qrFileName ? `Selected file: ${formData.qrFileName}` : 'No QR image selected yet.'}
                </p>
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="onboarding-step">
            <h2>Service Delivery Setup</h2>

            <p className="field-label">Scheduling Type</p>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-button ${formData.bookingMode === 'calendar-only' ? 'active' : ''}`}
                onClick={() => updateField('bookingMode', 'calendar-only')}
              >
                Calendar Only
              </button>
              <button
                type="button"
                className={`toggle-button ${formData.bookingMode === 'with-slots' ? 'active' : ''}`}
                onClick={() => updateField('bookingMode', 'with-slots')}
              >
                With Slots
              </button>
            </div>

            <p className="field-label">Rate Basis</p>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-button ${formData.rateBasis === 'per-hour' ? 'active' : ''}`}
                onClick={() => updateField('rateBasis', 'per-hour')}
              >
                Per Hour Rate
              </button>
              <button
                type="button"
                className={`toggle-button ${formData.rateBasis === 'per-day' ? 'active' : ''}`}
                onClick={() => updateField('rateBasis', 'per-day')}
              >
                Per Day Rate
              </button>
              <button
                type="button"
                className={`toggle-button ${formData.rateBasis === 'per-week' ? 'active' : ''}`}
                onClick={() => updateField('rateBasis', 'per-week')}
              >
                Per Week Rate
              </button>
              <button
                type="button"
                className={`toggle-button ${formData.rateBasis === 'per-month' ? 'active' : ''}`}
                onClick={() => updateField('rateBasis', 'per-month')}
              >
                Per Month Rate
              </button>
              <button
                type="button"
                className={`toggle-button ${formData.rateBasis === 'per-project' ? 'active' : ''}`}
                onClick={() => updateField('rateBasis', 'per-project')}
              >
                Per Project Rate
              </button>
            </div>

            <p className="setup-hint">
              {formData.bookingMode === 'calendar-only'
                ? 'Clients can select available dates only. Exact time is coordinated manually.'
                : 'Clients can select available dates and specific time slots.'}
              {(formData.rateBasis === 'per-week' || formData.rateBasis === 'per-month')
                ? ' Recurring services are billed once per cycle and can be stopped through chat when both sides agree.'
                : ''}
            </p>
          </section>
        )}

        <div className="onboarding-actions">
          <button className="back-button" onClick={handleBack}>
            {isFloating && step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button className="next-button" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button className="submit-button" onClick={handleSubmit}>
              Submit
            </button>
          )}
        </div>

        {errorMessage && <p className="onboarding-error">{errorMessage}</p>}
      </div>

      {showCompletionModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <h3>Profile Created Successfully</h3>
            <p>Where do you want to go next?</p>
            <div className="success-modal-actions">
              <button
                type="button"
                className="success-secondary-btn"
                onClick={() => handleCompletionChoice('home')}
              >
                Go to Home
              </button>
              <button
                type="button"
                className="success-primary-btn"
                onClick={() => handleCompletionChoice('my-work')}
              >
                Go to My Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerOnboarding;
