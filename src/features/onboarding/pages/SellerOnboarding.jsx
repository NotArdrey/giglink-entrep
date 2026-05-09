import { useEffect, useRef, useState } from 'react';
import { getThemeTokens } from '../../../shared/styles/themeTokens';

function SellerOnboarding({ onBack, onComplete, userLocation, isFloating = false, appTheme = 'light' }) {
  const [step, setStep] = useState(1);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hoveredButton, setHoveredButton] = useState('');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
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
    uploadedFileNames: [],
    uploadedPreviews: [],
  });

  const fileInputRef = useRef(null);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleFilesUpload = (event) => {
    const files = event.target.files && Array.from(event.target.files);
    if (!files || !files.length) return;
    const names = [];
    const previews = [];
    let remaining = files.length;

    files.forEach((file, i) => {
      names.push(file.name);
      if (file.type && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews[i] = e.target.result;
          remaining -= 1;
          if (remaining === 0) {
            updateField('uploadedFileNames', names);
            updateField('uploadedPreviews', previews);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // non-image (e.g., pdf) - no preview
        previews[i] = null;
        remaining -= 1;
        if (remaining === 0) {
          updateField('uploadedFileNames', names);
          updateField('uploadedPreviews', previews);
        }
      }
    });
  };

  const handleUploadButtonClick = () => {
    if (fileInputRef && fileInputRef.current) fileInputRef.current.click();
  };

  const rateBasisPriceLabelMap = {
    'per-hour': 'Price Per Hour (₱)',
    'per-day': 'Price Per Day (₱)',
    'per-week': 'Price Per Week (₱)',
    'per-month': 'Price Per Month (₱)',
    'per-project': 'Price Per Project (₱)',
  };

  const fixedPriceLabel = rateBasisPriceLabelMap[formData.rateBasis] || 'Fixed Price (₱)';
  const themeTokens = getThemeTokens(appTheme);

  const styles = {
    onboardingPage: { minHeight: isFloating ? 'auto' : '100vh', background: isFloating ? 'transparent' : themeTokens.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isFloating ? 0 : isMobile ? '0.75rem' : '1.2rem' },
    onboardingCard: { width: isFloating ? 'min(760px, 95vw)' : 'min(760px, 96vw)', maxHeight: isFloating ? '90vh' : 'none', overflowY: isFloating ? 'auto' : 'visible', background: themeTokens.surface, border: `1px solid ${themeTokens.border}`, borderRadius: '14px', boxShadow: themeTokens.shadow, padding: isMobile ? '0.9rem' : '1.2rem', position: 'relative' },
    onboardingHeaderTitle: { margin: 0, color: themeTokens.textPrimary },
    onboardingHeaderStep: { margin: '0.25rem 0 0', color: themeTokens.textSecondary },
    onboardingCloseButton: { position: 'absolute', right: '14px', top: '12px', width: '32px', height: '32px', borderRadius: '999px', border: `1px solid ${themeTokens.inputBorder}`, background: hoveredButton === 'close' ? themeTokens.surfaceAlt : themeTokens.surface, color: themeTokens.textPrimary, fontSize: '14px', fontWeight: 700, cursor: 'pointer' },
    locationSummary: { marginTop: '0.75rem' },
    locationLabel: { fontSize: '12px', color: themeTokens.textSecondary, margin: '0 0 6px 0' },
    locationValue: { padding: '10px 12px', background: themeTokens.surfaceAlt, border: `1px solid ${themeTokens.border}`, borderRadius: '6px', fontSize: '13px', color: themeTokens.textPrimary, fontWeight: 500 },
    onboardingStep: { marginTop: '1rem', display: 'grid', gap: '0.65rem' },
    stepTitle: { margin: '0 0 0.35rem', fontSize: isMobile ? '1.05rem' : '1.15rem', color: themeTokens.textPrimary },
    fieldLabel: { fontSize: '0.92rem', fontWeight: 600, color: themeTokens.textPrimary, marginTop: '0.35rem' },
    input: { border: `1px solid ${themeTokens.inputBorder}`, borderRadius: '8px', minHeight: '42px', padding: '0.58rem 0.65rem', fontFamily: 'inherit', background: themeTokens.inputBg, color: themeTokens.inputText },
    textarea: { border: `1px solid ${themeTokens.inputBorder}`, borderRadius: '8px', minHeight: '104px', padding: '0.58rem 0.65rem', fontFamily: 'inherit', resize: 'vertical', background: themeTokens.inputBg, color: themeTokens.inputText },
    toggleGroup: { display: 'flex', flexWrap: 'wrap', gap: '0.55rem' },
    toggleButton: { border: `1px solid ${themeTokens.inputBorder}`, background: themeTokens.surfaceAlt, color: themeTokens.textPrimary, borderRadius: '8px', padding: '0.58rem 0.9rem', cursor: 'pointer', fontWeight: 600 },
    toggleButtonActive: { border: `1px solid ${themeTokens.accent}`, background: themeTokens.accent, color: '#ffffff' },
    checkboxRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.93rem', color: themeTokens.textPrimary },
    paymentExtraFields: { marginTop: '0.4rem', padding: '0.8rem', border: `1px dashed ${themeTokens.border}`, borderRadius: '8px', background: themeTokens.surfaceAlt, display: 'grid', gap: '0.45rem' },
    qrUploadHint: { margin: 0, fontSize: '0.83rem', color: themeTokens.textSecondary },
    fileHint: { margin: 0, fontSize: '0.83rem', color: themeTokens.textSecondary },
    photoGrid: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' },
    photoThumb: { width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${themeTokens.border}` },
    uploadBox: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', border: `1px solid ${themeTokens.inputBorder}`, borderRadius: '8px', background: themeTokens.inputBg },
    uploadButton: { border: 'none', background: themeTokens.surfaceAlt, color: themeTokens.textPrimary, padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
    uploadText: { color: themeTokens.textSecondary, fontSize: '0.92rem' },
    setupHint: { margin: '0.4rem 0 0', fontSize: '0.9rem', color: themeTokens.textSecondary },
    actions: { display: 'flex', justifyContent: 'space-between', flexDirection: isMobile ? 'column-reverse' : 'row', gap: '0.7rem', marginTop: '1.1rem' },
    backButton: { border: 'none', borderRadius: '8px', padding: '0.62rem 1rem', fontWeight: 700, cursor: 'pointer', background: themeTokens.surfaceSoft, color: themeTokens.textPrimary, width: isMobile ? '100%' : 'auto' },
    nextButton: { border: 'none', borderRadius: '8px', padding: '0.62rem 1rem', fontWeight: 700, cursor: 'pointer', background: hoveredButton === 'next' ? '#1d4ed8' : themeTokens.accent, color: '#ffffff', width: isMobile ? '100%' : 'auto' },
    submitButton: { border: 'none', borderRadius: '8px', padding: '0.62rem 1rem', fontWeight: 700, cursor: 'pointer', background: hoveredButton === 'submit' ? '#1d4ed8' : themeTokens.accent, color: '#ffffff', width: isMobile ? '100%' : 'auto' },
    onboardingError: { margin: '0.8rem 0 0', color: themeTokens.danger, fontWeight: 600, fontSize: '0.9rem' },
    successModalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 420 },
    successModalContent: { width: 'min(560px, 92vw)', borderRadius: '12px', background: themeTokens.surface, textAlign: 'left', padding: '1.5rem', border: `1px solid ${themeTokens.border}` },
    successTitle: { margin: 0, color: themeTokens.successText, fontSize: '24px' },
    successText: { margin: '0.5rem 0 0', color: themeTokens.textSecondary, fontSize: '15px' },
    successActions: { marginTop: '14px', display: 'flex', justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row', gap: '10px' },
    successSecondaryBtn: { border: 'none', borderRadius: '8px', minHeight: '44px', padding: '10px 16px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: themeTokens.surfaceSoft, color: themeTokens.textPrimary },
    successPrimaryBtn: { border: 'none', borderRadius: '8px', minHeight: '44px', padding: '10px 16px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: hoveredButton === 'success-primary' ? '#1d4ed8' : themeTokens.accent, color: '#fff' },
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

            <div style={{ marginTop: '0.6rem' }}>
              <h3 style={{ margin: '0 0 0.35rem', fontSize: isMobile ? '1rem' : '1.05rem', color: themeTokens.textPrimary }}>Add Photo / Credentials</h3>

              <label htmlFor="uploads" style={styles.fieldLabel}>Upload Photos / Certificates</label>

              <div style={styles.uploadBox}>
                <button type="button" style={styles.uploadButton} onClick={handleUploadButtonClick}>Choose files</button>
                <div style={styles.uploadText}>{formData.uploadedFileNames && formData.uploadedFileNames.length > 0 ? `${formData.uploadedFileNames.length} file(s) selected` : 'No files selected yet.'}</div>
                <input ref={fileInputRef} id="uploads" type="file" accept="image/*,application/pdf" multiple onChange={handleFilesUpload} style={{ display: 'none' }} />
              </div>

              {formData.uploadedPreviews && formData.uploadedPreviews.length > 0 && (
                <div style={styles.photoGrid}>
                  {formData.uploadedPreviews.map((p, i) => (
                    p ? (
                      // eslint-disable-next-line react/no-array-index-key
                      <img key={i} alt={`preview-${i}`} src={p} style={styles.photoThumb} />
                    ) : null
                  ))}
                </div>
              )}

              {formData.uploadedFileNames && formData.uploadedFileNames.length > 0 && (
                <div style={{ marginTop: '0.4rem' }}>
                  {formData.uploadedFileNames.map((n, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <p key={i} style={styles.fileHint}>{n}</p>
                  ))}
                </div>
              )}
            </div>
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

            <p style={styles.fieldLabel}>Rate Basis</p>
            <div style={styles.toggleGroup}>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.rateBasis === 'per-hour' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('rateBasis', 'per-hour')}>Per Hour Rate</button>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.rateBasis === 'per-day' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('rateBasis', 'per-day')}>Per Day Rate</button>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.rateBasis === 'per-week' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('rateBasis', 'per-week')}>Per Week Rate</button>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.rateBasis === 'per-month' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('rateBasis', 'per-month')}>Per Month Rate</button>
              <button type="button" style={{ ...styles.toggleButton, ...(formData.rateBasis === 'per-project' ? styles.toggleButtonActive : {}) }} onClick={() => updateField('rateBasis', 'per-project')}>Per Project Rate</button>
            </div>

            {formData.pricingModel === 'fixed' && (
              <>
                <label htmlFor="fixedPrice" style={styles.fieldLabel}>{fixedPriceLabel}</label>
                <input id="fixedPrice" type="number" min="1" value={formData.fixedPrice} onChange={(event) => updateField('fixedPrice', event.target.value)} placeholder="Enter fixed amount" style={styles.input} />
              </>
            )}

            {formData.pricingModel === 'inquiry' && (
              <div style={{ padding: '12px', background: themeTokens.successBg, border: `1px solid ${themeTokens.successBorder}`, borderRadius: '6px', fontSize: '13px', color: themeTokens.successText, marginTop: '10px' }}>
                &#9432; You'll negotiate prices with clients through the chat. Each inquiry gets a custom quote.
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
