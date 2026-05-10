import React, { useState, useEffect } from 'react';


/**
 * ProfileEditModal Component
 * 
 * Allows editing of seller profile details:
 * - Service name/type
 * - Service description
 * - Pricing model (fixed, hourly, daily)
 * - Payment methods (Advance, After Service)
 * - GCash number
 */
const ProfileEditModal = ({
  isOpen,
  profileData,
  onSave,
  onClose,
}) => {
  const [fullName, setFullName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [pricingModel, setPricingModel] = useState('fixed');
  const [fixedPrice, setFixedPrice] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [weeklyRate, setWeeklyRate] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  const [paymentAdvance, setPaymentAdvance] = useState(true);
  const [paymentAfterService, setPaymentAfterService] = useState(true);
  const [afterServicePaymentType, setAfterServicePaymentType] = useState('both');
  const [gcashNumber, setGcashNumber] = useState('');
  const [error, setError] = useState('');
  const [hoveredButton, setHoveredButton] = useState('');

  useEffect(() => {
    if (profileData && isOpen) {
      setFullName(profileData.fullName || '');
      setServiceType(profileData.serviceType || '');
      setDescription(profileData.description || '');
      setPricingModel(profileData.pricingModel || 'fixed');
      setFixedPrice(String(profileData.fixedPrice ?? ''));
      setHourlyRate(String(profileData.hourlyRate ?? ''));
      setDailyRate(String(profileData.dailyRate ?? ''));
      setWeeklyRate(String(profileData.weeklyRate ?? ''));
      setMonthlyRate(String(profileData.monthlyRate ?? ''));
      setPaymentAdvance(profileData.paymentAdvance !== false);
      setPaymentAfterService(profileData.paymentAfterService !== false);
      setAfterServicePaymentType(profileData.afterServicePaymentType || 'both');
      setGcashNumber(profileData.gcashNumber || '');
      setError('');
    }
  }, [profileData, isOpen]);

  const handleSave = () => {
    setError('');

    if (!serviceType.trim()) {
      setError('Please enter a service type');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a service description');
      return;
    }

    if (pricingModel === 'fixed' && (!String(fixedPrice).trim() || Number(fixedPrice) <= 0)) {
      setError('Please enter a valid fixed price');
      return;
    }

    if (pricingModel === 'hourly' && (!String(hourlyRate).trim() || Number(hourlyRate) <= 0)) {
      setError('Please enter a valid hourly rate');
      return;
    }

    if (pricingModel === 'daily' && (!String(dailyRate).trim() || Number(dailyRate) <= 0)) {
      setError('Please enter a valid daily rate');
      return;
    }

    if (pricingModel === 'weekly' && (!String(weeklyRate).trim() || Number(weeklyRate) <= 0)) {
      setError('Please enter a valid weekly rate');
      return;
    }

    if (pricingModel === 'monthly' && (!String(monthlyRate).trim() || Number(monthlyRate) <= 0)) {
      setError('Please enter a valid monthly rate');
      return;
    }

    if (!paymentAdvance && !paymentAfterService) {
      setError('Please select at least one payment method');
      return;
    }

    onSave({
      fullName,
      serviceType,
      description,
      pricingModel,
      fixedPrice: pricingModel === 'fixed' ? Number(fixedPrice) : null,
      hourlyRate: pricingModel === 'hourly' ? Number(hourlyRate) : null,
      dailyRate: pricingModel === 'daily' ? Number(dailyRate) : null,
      weeklyRate: pricingModel === 'weekly' ? Number(weeklyRate) : null,
      monthlyRate: pricingModel === 'monthly' ? Number(monthlyRate) : null,
      paymentAdvance,
      paymentAfterService,
      afterServicePaymentType,
      gcashNumber,
    });
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.52)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 270,
      padding: '1rem',
    },
    modal: {
      width: 'min(95vw, 760px)',
      maxHeight: '94vh',
      overflowY: 'auto',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.85rem',
      boxShadow: '0 18px 40px rgba(15, 23, 42, 0.25)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.8rem 1rem',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
    },
    close: {
      width: '32px',
      height: '32px',
      borderRadius: '999px',
      border: '1px solid #cbd5e1',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
    },
    body: { padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' },
    error: {
      borderRadius: '0.45rem',
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      padding: '0.45rem 0.6rem',
      fontSize: '0.9rem',
    },
    field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
    input: { border: '1px solid #cbd5e1', borderRadius: '0.45rem', padding: '0.5rem 0.55rem' },
    textarea: { border: '1px solid #cbd5e1', borderRadius: '0.45rem', padding: '0.5rem 0.55rem', resize: 'vertical' },
    section: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.65rem',
      backgroundColor: '#f8fafc',
      padding: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.55rem',
    },
    radioGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.5rem' },
    optionLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.45rem',
      border: '1px solid #cbd5e1',
      backgroundColor: '#ffffff',
      borderRadius: '0.45rem',
      padding: '0.4rem 0.5rem',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.5rem',
      borderTop: '1px solid #e2e8f0',
      padding: '0.75rem 1rem',
    },
    cancel: { border: '1px solid #cbd5e1', borderRadius: '0.45rem', backgroundColor: '#ffffff', padding: '0.5rem 0.75rem', cursor: 'pointer', fontWeight: 600 },
    save: { border: 'none', borderRadius: '0.45rem', backgroundColor: '#2563eb', color: '#ffffff', padding: '0.5rem 0.75rem', cursor: 'pointer', fontWeight: 700 },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>Edit Service Profile</h2>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          {error && <div style={styles.error}>{error}</div>}

          {/* Service Type */}
          <div style={styles.field}>
            <label htmlFor="edit-service-type">Service Type</label>
            <input
              id="edit-service-type"
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g., Math Tutoring, Laptop Repair"
              style={styles.input}
            />
          </div>

          {/* Description */}
          <div style={styles.field}>
            <label htmlFor="edit-description">Service Description</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your service and what you offer..."
              rows="4"
              style={styles.textarea}
            />
          </div>

          {/* Pricing Section */}
          <div style={styles.section}>
            <h3>Pricing Model</h3>
            <div style={styles.radioGrid}>
              <label style={styles.optionLabel}>
                <input
                  type="radio"
                  name="pricingModel"
                  value="fixed"
                  checked={pricingModel === 'fixed'}
                  onChange={(e) => setPricingModel(e.target.value)}
                />
                <span>Fixed Price</span>
              </label>
              <label style={styles.optionLabel}>
                <input
                  type="radio"
                  name="pricingModel"
                  value="hourly"
                  checked={pricingModel === 'hourly'}
                  onChange={(e) => setPricingModel(e.target.value)}
                />
                <span>Hourly Rate</span>
              </label>
              <label style={styles.optionLabel}>
                <input
                  type="radio"
                  name="pricingModel"
                  value="daily"
                  checked={pricingModel === 'daily'}
                  onChange={(e) => setPricingModel(e.target.value)}
                />
                <span>Daily Rate</span>
              </label>
              <label style={styles.optionLabel}>
                <input
                  type="radio"
                  name="pricingModel"
                  value="weekly"
                  checked={pricingModel === 'weekly'}
                  onChange={(e) => setPricingModel(e.target.value)}
                />
                <span>Weekly Rate</span>
              </label>
              <label style={styles.optionLabel}>
                <input
                  type="radio"
                  name="pricingModel"
                  value="monthly"
                  checked={pricingModel === 'monthly'}
                  onChange={(e) => setPricingModel(e.target.value)}
                />
                <span>Monthly Rate</span>
              </label>
            </div>

            {pricingModel === 'fixed' && (
              <div style={styles.field}>
                <label htmlFor="edit-fixed-price">Fixed Price (₱)</label>
                <input
                  id="edit-fixed-price"
                  type="number"
                  step="50"
                  min="0"
                  value={fixedPrice}
                  onChange={(e) => setFixedPrice(e.target.value)}
                  placeholder="e.g., 500"
                  style={styles.input}
                />
              </div>
            )}

            {pricingModel === 'hourly' && (
              <div style={styles.field}>
                <label htmlFor="edit-hourly-rate">Hourly Rate (₱/hour)</label>
                <input
                  id="edit-hourly-rate"
                  type="number"
                  step="25"
                  min="0"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="e.g., 250"
                  style={styles.input}
                />
              </div>
            )}

            {pricingModel === 'daily' && (
              <div style={styles.field}>
                <label htmlFor="edit-daily-rate">Daily Rate (₱/day)</label>
                <input
                  id="edit-daily-rate"
                  type="number"
                  step="50"
                  min="0"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  placeholder="e.g., 1500"
                  style={styles.input}
                />
              </div>
            )}

            {pricingModel === 'weekly' && (
              <div style={styles.field}>
                <label htmlFor="edit-weekly-rate">Weekly Rate (₱/week)</label>
                <input
                  id="edit-weekly-rate"
                  type="number"
                  step="100"
                  min="0"
                  value={weeklyRate}
                  onChange={(e) => setWeeklyRate(e.target.value)}
                  placeholder="e.g., 3000"
                  style={styles.input}
                />
              </div>
            )}

            {pricingModel === 'monthly' && (
              <div style={styles.field}>
                <label htmlFor="edit-monthly-rate">Monthly Rate (₱/month)</label>
                <input
                  id="edit-monthly-rate"
                  type="number"
                  step="500"
                  min="0"
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(e.target.value)}
                  placeholder="e.g., 12000"
                  style={styles.input}
                />
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div style={styles.section}>
            <h3>Payment Methods</h3>
            <div style={styles.radioGrid}>
              <label style={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={paymentAdvance}
                  onChange={(e) => setPaymentAdvance(e.target.checked)}
                />
                <span>GCash Advance (Upfront)</span>
              </label>
              <label style={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={paymentAfterService}
                  onChange={(e) => setPaymentAfterService(e.target.checked)}
                />
                <span>After Service</span>
              </label>
            </div>

            {paymentAfterService && (
              <div style={styles.field}>
                <label htmlFor="edit-after-service-type">After Service Payment Type</label>
                <select
                  id="edit-after-service-type"
                  value={afterServicePaymentType}
                  onChange={(e) => setAfterServicePaymentType(e.target.value)}
                  style={styles.input}
                >
                  <option value="both">Cash or GCash</option>
                  <option value="cash-only">Cash Only</option>
                  <option value="gcash-only">GCash Only</option>
                </select>
              </div>
            )}

            {(paymentAdvance || (paymentAfterService && afterServicePaymentType !== 'cash-only')) && (
              <div style={styles.field}>
                <label htmlFor="edit-gcash">GCash Number</label>
                <input
                  id="edit-gcash"
                  type="text"
                  value={gcashNumber}
                  onChange={(e) => setGcashNumber(e.target.value)}
                  placeholder="e.g., 09123456789"
                  style={styles.input}
                />
              </div>
            )}
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{ ...styles.save, backgroundColor: hoveredButton === 'save-profile' ? '#1d4ed8' : '#2563eb' }}
            onMouseEnter={() => setHoveredButton('save-profile')}
            onMouseLeave={() => setHoveredButton('')}
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
