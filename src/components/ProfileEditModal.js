import React, { useState, useEffect } from 'react';
import '../styles/ProfileEditModal.css';

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

  useEffect(() => {
    if (profileData && isOpen) {
      setFullName(profileData.fullName || '');
      setServiceType(profileData.serviceType || '');
      setDescription(profileData.description || '');
      setPricingModel(profileData.pricingModel || 'fixed');
      setFixedPrice(profileData.fixedPrice || '');
      setHourlyRate(profileData.hourlyRate || '');
      setDailyRate(profileData.dailyRate || '');
      setWeeklyRate(profileData.weeklyRate || '');
      setMonthlyRate(profileData.monthlyRate || '');
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

    if (pricingModel === 'fixed' && (!fixedPrice.trim() || Number(fixedPrice) <= 0)) {
      setError('Please enter a valid fixed price');
      return;
    }

    if (pricingModel === 'hourly' && (!hourlyRate.trim() || Number(hourlyRate) <= 0)) {
      setError('Please enter a valid hourly rate');
      return;
    }

    if (pricingModel === 'daily' && (!dailyRate.trim() || Number(dailyRate) <= 0)) {
      setError('Please enter a valid daily rate');
      return;
    }

    if (pricingModel === 'weekly' && (!weeklyRate.trim() || Number(weeklyRate) <= 0)) {
      setError('Please enter a valid weekly rate');
      return;
    }

    if (pricingModel === 'monthly' && (!monthlyRate.trim() || Number(monthlyRate) <= 0)) {
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

  return (
    <div className="profile-edit-modal-overlay">
      <div className="profile-edit-modal">
        <div className="profile-edit-header">
          <h2>Edit Service Profile</h2>
          <button className="profile-edit-close" onClick={onClose}>✕</button>
        </div>

        <div className="profile-edit-body">
          {error && <div className="profile-edit-error">{error}</div>}

          {/* Service Type */}
          <div className="profile-edit-field">
            <label htmlFor="edit-service-type">Service Type</label>
            <input
              id="edit-service-type"
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g., Math Tutoring, Laptop Repair"
            />
          </div>

          {/* Description */}
          <div className="profile-edit-field">
            <label htmlFor="edit-description">Service Description</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your service and what you offer..."
              rows="4"
            />
          </div>

          {/* Pricing Section */}
          <div className="profile-edit-section">
            <h3>Pricing Model</h3>
            <div className="pricing-model-options">
              <label className="pricing-option">
                <input
                  type="radio"
                  name="pricingModel"
                  value="fixed"
                  checked={pricingModel === 'fixed'}
                  onChange={(e) => setPricingModel(e.target.value)}
                />
                <span>Fixed Price</span>
              </label>
              <label className="pricing-option">
                <input
                  type="radio"
                  name="pricingModel"
                  value="hourly"
                  checked={pricingModel === 'hourly'}
                  onChange={(e) => setPricingModel(e.target.value)}
                />
                <span>Hourly Rate</span>
              </label>
              <label className="pricing-option">
                <input
                  type="radio"
                  name="pricingModel"
                  value="daily"
                  checked={pricingModel === 'daily'}
                  onChange={(e) => setPricingModel(e.target.value)}
                />
                <span>Daily Rate</span>
              </label>
              <label className="pricing-option">
                <input
                  type="radio"
                  name="pricingModel"
                  value="weekly"
                  checked={pricingModel === 'weekly'}
                  onChange={(e) => setPricingModel(e.target.value)}
                />
                <span>Weekly Rate</span>
              </label>
              <label className="pricing-option">
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
              <div className="profile-edit-field">
                <label htmlFor="edit-fixed-price">Fixed Price (₱)</label>
                <input
                  id="edit-fixed-price"
                  type="number"
                  step="50"
                  min="0"
                  value={fixedPrice}
                  onChange={(e) => setFixedPrice(e.target.value)}
                  placeholder="e.g., 500"
                />
              </div>
            )}

            {pricingModel === 'hourly' && (
              <div className="profile-edit-field">
                <label htmlFor="edit-hourly-rate">Hourly Rate (₱/hour)</label>
                <input
                  id="edit-hourly-rate"
                  type="number"
                  step="25"
                  min="0"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="e.g., 250"
                />
              </div>
            )}

            {pricingModel === 'daily' && (
              <div className="profile-edit-field">
                <label htmlFor="edit-daily-rate">Daily Rate (₱/day)</label>
                <input
                  id="edit-daily-rate"
                  type="number"
                  step="50"
                  min="0"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  placeholder="e.g., 1500"
                />
              </div>
            )}

            {pricingModel === 'weekly' && (
              <div className="profile-edit-field">
                <label htmlFor="edit-weekly-rate">Weekly Rate (₱/week)</label>
                <input
                  id="edit-weekly-rate"
                  type="number"
                  step="100"
                  min="0"
                  value={weeklyRate}
                  onChange={(e) => setWeeklyRate(e.target.value)}
                  placeholder="e.g., 3000"
                />
              </div>
            )}

            {pricingModel === 'monthly' && (
              <div className="profile-edit-field">
                <label htmlFor="edit-monthly-rate">Monthly Rate (₱/month)</label>
                <input
                  id="edit-monthly-rate"
                  type="number"
                  step="500"
                  min="0"
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(e.target.value)}
                  placeholder="e.g., 12000"
                />
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="profile-edit-section">
            <h3>Payment Methods</h3>
            <div className="payment-methods">
              <label className="payment-method">
                <input
                  type="checkbox"
                  checked={paymentAdvance}
                  onChange={(e) => setPaymentAdvance(e.target.checked)}
                />
                <span>GCash Advance (Upfront)</span>
              </label>
              <label className="payment-method">
                <input
                  type="checkbox"
                  checked={paymentAfterService}
                  onChange={(e) => setPaymentAfterService(e.target.checked)}
                />
                <span>After Service</span>
              </label>
            </div>

            {paymentAfterService && (
              <div className="profile-edit-field">
                <label htmlFor="edit-after-service-type">After Service Payment Type</label>
                <select
                  id="edit-after-service-type"
                  value={afterServicePaymentType}
                  onChange={(e) => setAfterServicePaymentType(e.target.value)}
                >
                  <option value="both">Cash or GCash</option>
                  <option value="cash-only">Cash Only</option>
                  <option value="gcash-only">GCash Only</option>
                </select>
              </div>
            )}

            {(paymentAdvance || (paymentAfterService && afterServicePaymentType !== 'cash-only')) && (
              <div className="profile-edit-field">
                <label htmlFor="edit-gcash">GCash Number</label>
                <input
                  id="edit-gcash"
                  type="text"
                  value={gcashNumber}
                  onChange={(e) => setGcashNumber(e.target.value)}
                  placeholder="e.g., 09123456789"
                />
              </div>
            )}
          </div>
        </div>

        <div className="profile-edit-actions">
          <button className="profile-edit-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="profile-edit-save" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
