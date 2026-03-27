import { useState } from 'react';

function SellerOnboarding({ onBack, onComplete, userLocation, isFloating = false }) {
  const [step, setStep] = useState(1);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hoveredButton, setHoveredButton] = useState('');
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
      const hasCustomService = formData.serviceType !== 'Others' || formData.customServiceType.trim().length > 0;

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
    'per-hour': 'Price Per Hour (₱)',
    'per-day': 'Price Per Day (₱)',
    'per-week': 'Price Per Week (₱)',
    'per-month': 'Price Per Month (₱)',
    'per-project': 'Price Per Project (₱)',
  };

  const fixedPriceLabel = rateBasisPriceLabelMap[formData.rateBasis] || 'Fixed Price (₱)';

  const styles = {
    onboardingPage: { minHeight: isFloating ? 'auto' : '100vh', background: isFloating ? 'transparent' : 'linear-gradient(140deg, #f8fffb 0%, #eef5ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isFloating ? 0 : '1.2rem' },
    onboardingCard: { width: isFloating ? 'min(760px, 95vw)' : 'min(760px, 96vw)', maxHeight: isFloating ? '90vh' : 'none', overflowY: isFloating ? 'auto' : 'visible', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', boxShadow: '0 16px 38px rgba(15, 23, 42, 0.12)', padding: '1.2rem', position: 'relative' },
    onboardingHeaderTitle: { margin: 0, color: '#111827' },
    onboardingHeaderStep: { margin: '0.25rem 0 0', color: '#6b7280' },
    onboardingCloseButton: { position: 'absolute', right: '14px', top: '12px', width: '32px', height: '32px', borderRadius: '999px', border: '1px solid #d1d5db', background: hoveredButton === 'close' ? '#f3f4f6' : '#fff', color: '#374151', fontSize: '14px', fontWeight: 700, cursor: 'pointer' },
    locationSummary: { marginTop: '0.75rem' },
    locationLabel: { fontSize: '12px', color: '#7f8c8d', margin: '0 0 6px 0' },
    locationValue: { padding: '10px 12px', background: '#f0f8ff', border: '1px solid #bfd4ff', borderRadius: '6px', fontSize: '13px', color: '#2c3e50', fontWeight: 500 },
    onboardingStep: { marginTop: '1rem', display: 'grid', gap: '0.65rem' },
    stepTitle: { margin: '0 0 0.35rem', fontSize: '1.15rem', color: '#111827' },
    fieldLabel: { fontSize: '0.92rem', fontWeight: 600, color: '#374151', marginTop: '0.35rem' },
    input: { border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '42px', padding: '0.58rem 0.65rem', fontFamily: 'inherit' },
    textarea: { border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '104px', padding: '0.58rem 0.65rem', fontFamily: 'inherit', resize: 'vertical' },
    toggleGroup: { display: 'flex', flexWrap: 'wrap', gap: '0.55rem' },
    toggleButton: { border: '1px solid #d1d5db', background: '#ffffff', color: '#374151', borderRadius: '8px', padding: '0.58rem 0.9rem', cursor: 'pointer', fontWeight: 600 },
    toggleButtonActive: { borderColor: '#2563eb', background: '#2563eb', color: '#ffffff' },
    checkboxRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.93rem', color: '#1f2937' },
    paymentExtraFields: { marginTop: '0.4rem', padding: '0.8rem', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc', display: 'grid', gap: '0.45rem' },
    qrUploadHint: { margin: 0, fontSize: '0.83rem', color: '#64748b' },
    setupHint: { margin: '0.4rem 0 0', fontSize: '0.9rem', color: '#4b5563' },
    actions: { display: 'flex', justifyContent: 'space-between', gap: '0.7rem', marginTop: '1.1rem' },
    backButton: { border: 'none', borderRadius: '8px', padding: '0.62rem 1rem', fontWeight: 700, cursor: 'pointer', background: '#e5e7eb', color: '#1f2937' },
    nextButton: { border: 'none', borderRadius: '8px', padding: '0.62rem 1rem', fontWeight: 700, cursor: 'pointer', background: hoveredButton === 'next' ? '#1d4ed8' : '#2563eb', color: '#ffffff' },
    submitButton: { border: 'none', borderRadius: '8px', padding: '0.62rem 1rem', fontWeight: 700, cursor: 'pointer', background: hoveredButton === 'submit' ? '#1d4ed8' : '#2563eb', color: '#ffffff' },
    onboardingError: { margin: '0.8rem 0 0', color: '#b91c1c', fontWeight: 600, fontSize: '0.9rem' },
    successModalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 420 },
    successModalContent: { width: 'min(560px, 92vw)', borderRadius: '12px', background: '#ffffff', textAlign: 'left', padding: '1.5rem' },
    successTitle: { margin: 0, color: '#14532d', fontSize: '24px' },
    successText: { margin: '0.5rem 0 0', color: '#4b5563', fontSize: '15px' },
    successActions: { marginTop: '14px', display: 'flex', justifyContent: 'center', gap: '10px' },
    successSecondaryBtn: { border: 'none', borderRadius: '8px', minHeight: '44px', padding: '10px 16px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: '#e5e7eb', color: '#111827' },
    successPrimaryBtn: { border: 'none', borderRadius: '8px', minHeight: '44px', padding: '10px 16px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: hoveredButton === 'success-primary' ? '#1d4ed8' : '#2563eb', color: '#fff' },
  };

  return (
    <div style={styles.onboardingPage}>
      <div style={styles.onboardingCard}>
        <div>
          {isFloating && (
            <button
              type="button"
              style={styles.onboardingCloseButton}
              onMouseEnter={() => setHoveredButton('close')}
              onMouseLeave={() => setHoveredButton('')}
              onClick={onBack}
              aria-label="Close seller onboarding"
            >
              ×
            </button>
          )}
          <h1 style={styles.onboardingHeaderTitle}>Become a Seller</h1>
          <p style={styles.onboardingHeaderStep}>Step {step} of 3</p>
        </div>

        {userLocation && (
          <div style={styles.locationSummary}>
            <p style={styles.locationLabel}>Service Location (from registration):</p>
            <div style={styles.locationValue}>
              {userLocation.barangay}, {userLocation.city}
              {userLocation.address && ` - ${userLocation.address}`}
            </div>
          </div>
        )}

        {step === 1 && (
          <section style={styles.onboardingStep}>
            <h2 style={styles.stepTitle}>Basic Professional Info</h2>
            <label htmlFor="fullName" style={styles.fieldLabel}>Full Name</label>
            <input id="fullName" type="text" value={formData.fullName} onChange={(event) => updateField('fullName', event.target.value)} placeholder="Enter your full name" style={styles.input} />

            <label htmlFor="serviceType" style={styles.fieldLabel}>Service Type</label>
            <select id="serviceType" value={formData.serviceType} onChange={(event) => {
              const selected = event.target.value;
              updateField('serviceType', selected);
              if (selected !== 'Others') {
                updateField('customServiceType', '');
              }
            }} style={styles.input}>
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
                <label htmlFor="customServiceType" style={styles.fieldLabel}>Enter Your Service Type</label>
                <input id="customServiceType" type="text" value={formData.customServiceType} onChange={(event) => updateField('customServiceType', event.target.value)} placeholder="Example: Pilot Service for Online Games" style={styles.input} />
              </>
            )}

            <label htmlFor="bio" style={styles.fieldLabel}>Bio</label>
            <textarea id="bio" value={formData.bio} onChange={(event) => updateField('bio', event.target.value)} placeholder="Tell clients about your experience and style" rows={4} style={styles.textarea}></textarea>
          </section>
        )}

        {step === 2 && (
          <section style={styles.onboardingStep}>
            <h2 style={styles.stepTitle}>Service & Payment Setup</h2>

            <p style={styles.fieldLabel}>Pricing Model</p>
            <div style={styles.toggleGroup}>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.pricingModel === 'fixed' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('pricingModel', 'fixed')}>Fixed Price</button>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.pricingModel === 'inquiry' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('pricingModel', 'inquiry')}>Inquiry Based</button>
            </div>

            {formData.pricingModel === 'fixed' && (
              <>
                <label htmlFor="fixedPrice" style={styles.fieldLabel}>{fixedPriceLabel}</label>
                <input id="fixedPrice" type="number" min="1" value={formData.fixedPrice} onChange={(event) => updateField('fixedPrice', event.target.value)} placeholder="Enter fixed amount" style={styles.input} />
              </>
            )}

            {formData.pricingModel === 'inquiry' && (
              <div style={{ padding: '12px', background: '#e8f8f5', border: '1px solid #a3e4d7', borderRadius: '6px', fontSize: '13px', color: '#117a65', marginTop: '10px' }}>
                ?? You'll negotiate prices with clients through the chat. Each inquiry gets a custom quote.
              </div>
            )}

            <p style={styles.fieldLabel}>Payment Options</p>
            <label style={styles.checkboxRow}><input type="checkbox" checked={formData.paymentAdvance} onChange={(event) => updateField('paymentAdvance', event.target.checked)} /><span>Advance Payment (GCash)</span></label>
            <label style={styles.checkboxRow}><input type="checkbox" checked={formData.paymentAfterService} onChange={(event) => updateField('paymentAfterService', event.target.checked)} /><span>After Service Payment</span></label>

            {formData.paymentAfterService && (
              <>
                <label htmlFor="afterServicePaymentType" style={styles.fieldLabel}>After Service Payment Type</label>
                <select id="afterServicePaymentType" value={formData.afterServicePaymentType} onChange={(event) => updateField('afterServicePaymentType', event.target.value)} style={styles.input}>
                  <option value="both">Cash or GCash</option>
                  <option value="cash-only">Cash Only</option>
                  <option value="gcash-only">GCash Only</option>
                </select>
              </>
            )}

            {(formData.paymentAdvance || (formData.paymentAfterService && formData.afterServicePaymentType !== 'cash-only')) && (
              <div style={styles.paymentExtraFields}>
                <label htmlFor="gcashNumber" style={styles.fieldLabel}>GCash Number</label>
                <input id="gcashNumber" type="tel" value={formData.gcashNumber} onChange={(event) => updateField('gcashNumber', event.target.value)} placeholder="e.g., 09XXXXXXXXX" style={styles.input} />

                <label htmlFor="qrUpload" style={styles.fieldLabel}>Upload QR (optional)</label>
                <input id="qrUpload" type="file" accept="image/*" onChange={handleQrUpload} style={styles.input} />
                <p style={styles.qrUploadHint}>{formData.qrFileName ? `Selected file: ${formData.qrFileName}` : 'No QR image selected yet.'}</p>
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section style={styles.onboardingStep}>
            <h2 style={styles.stepTitle}>Service Delivery Setup</h2>

            <p style={styles.fieldLabel}>Scheduling Type</p>
            <div style={styles.toggleGroup}>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.bookingMode === 'calendar-only' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('bookingMode', 'calendar-only')}>Calendar Only</button>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.bookingMode === 'with-slots' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('bookingMode', 'with-slots')}>With Slots</button>
            </div>

            <p style={styles.fieldLabel}>Rate Basis</p>
            <div style={styles.toggleGroup}>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.rateBasis === 'per-hour' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('rateBasis', 'per-hour')}>Per Hour Rate</button>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.rateBasis === 'per-day' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('rateBasis', 'per-day')}>Per Day Rate</button>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.rateBasis === 'per-week' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('rateBasis', 'per-week')}>Per Week Rate</button>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.rateBasis === 'per-month' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('rateBasis', 'per-month')}>Per Month Rate</button>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.rateBasis === 'per-project' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('rateBasis', 'per-project')}>Per Project Rate</button>
            </div>

            <p style={styles.setupHint}>
              {formData.bookingMode === 'calendar-only'
                ? 'Clients can select available dates only. Exact time is coordinated manually.'
                : 'Clients can select available dates and specific time slots.'}
              {(formData.rateBasis === 'per-week' || formData.rateBasis === 'per-month')
                ? ' Recurring services are billed once per cycle and can be stopped through chat when both sides agree.'
                : ''}
            </p>
          </section>
        )}

        <div style={styles.actions}>
          <button style={styles.backButton} onClick={handleBack}>{isFloating && step === 1 ? 'Cancel' : 'Back'}</button>

          {step < 3 ? (
            <button style={styles.nextButton} onMouseEnter={() => setHoveredButton('next')} onMouseLeave={() => setHoveredButton('')} onClick={handleNext}>Next</button>
          ) : (
            <button style={styles.submitButton} onMouseEnter={() => setHoveredButton('submit')} onMouseLeave={() => setHoveredButton('')} onClick={handleSubmit}>Submit</button>
          )}
        </div>

        {errorMessage && <p style={styles.onboardingError}>{errorMessage}</p>}
      </div>

      {showCompletionModal && (
        <div style={styles.successModalOverlay}>
          <div style={styles.successModalContent}>
            <h3 style={styles.successTitle}>Profile Created Successfully</h3>
            <p style={styles.successText}>Where do you want to go next?</p>
            <div style={styles.successActions}>
              <button type="button" style={styles.successSecondaryBtn} onClick={() => handleCompletionChoice('home')}>Go to Home</button>
              <button type="button" style={styles.successPrimaryBtn} onMouseEnter={() => setHoveredButton('success-primary')} onMouseLeave={() => setHoveredButton('')} onClick={() => handleCompletionChoice('my-work')}>Go to My Work</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerOnboarding;
