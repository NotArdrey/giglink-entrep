import { useEffect, useState, useCallback } from 'react';
import { useAuthModalController } from '../hooks';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

function LoginModal({ isOpen, onClose, onSubmit, onForgotPassword, onResendVerification }) {
  // Initialize controller hook
  const controller = useAuthModalController(
    async (result, isLoginMode) => {
      // Callback when auth is successful
      const formDataForParent = controller.isLoginMode ? formData : formData;
      if (onSubmit) {
        try {
          await onSubmit(formDataForParent, isLoginMode);
          
          // For signup, show success message; for login, close immediately
          if (!isLoginMode) {
            // Signup success - show message
            setIsSignupSuccess(true);
          } else {
            // Login success - reset and close
            resetAllState();
          }
        } catch (error) {
          // Error handling is done in the parent
          console.error('Auth submission error in parent:', error);
        }
      }
    },
    async (email) => {
      // Callback when resend verification is successful
      if (onResendVerification) {
        try {
          await onResendVerification(email);
        } catch (error) {
          console.error('Resend verification error in parent:', error);
        }
      }
    }
  );

  // Form data state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    confirmPassword: '',
    province: '',
    city: '',
    barangay: '',
    address: '',
  });

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [hoveredButton, setHoveredButton] = useState('');
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const {
    setLoadingProvinces,
    setApiError,
  } = controller;

  // Helper to reset all state when modal closes
  const resetAllState = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      middleName: '',
      lastName: '',
      confirmPassword: '',
      province: '',
      city: '',
      barangay: '',
      address: '',
    });
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    setHoveredButton('');
    setIsSignupSuccess(false);
    controller.resetForm();
  };

  const fetchProvinces = useCallback(async () => {
    setLoadingProvinces(true);
    setApiError('');
    try {
      const response = await fetch(`${PSGC_BASE_URL}/provinces/`);
      if (!response.ok) throw new Error('Failed to fetch provinces');
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setApiError('Could not load provinces. Using fallback data.');
      setProvinces([
        { code: 'PHR030000000', name: 'Bulacan' },
        { code: 'PHR010000000', name: 'Abra' },
        { code: 'PHR020000000', name: 'Agusan del Norte' },
      ]);
    } finally {
      setLoadingProvinces(false);
    }
  }, [setLoadingProvinces, setApiError]);

  useEffect(() => {
    if (isOpen && !controller.isLoginMode) {
      fetchProvinces();
    }
  }, [isOpen, controller.isLoginMode, fetchProvinces]);

  const fetchCities = async (provinceCode) => {
    if (!provinceCode) {
      setCities([]);
      controller.setSelectedCityMunicipalityCode('');
      return;
    }
    controller.setLoadingCities(true);
    controller.setApiError('');
    try {
      const response = await fetch(`${PSGC_BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      const data = await response.json();
      setCities(data);
      setFormData((prev) => ({ ...prev, city: '', barangay: '' }));
      controller.setSelectedCityMunicipalityCode('');
      setBarangays([]);
    } catch (error) {
      console.error('Error fetching cities:', error);
      controller.setApiError('Could not load cities. Using fallback data.');
      setCities([
        { code: 'PHM030000000', name: 'Meycauayan' },
        { code: 'PHM031000000', name: 'Bulacan' },
      ]);
    } finally {
      controller.setLoadingCities(false);
    }
  };

  const fetchBarangays = async (cityCode) => {
    if (!cityCode) {
      setBarangays([]);
      return;
    }
    controller.setLoadingBarangays(true);
    controller.setApiError('');
    try {
      const response = await fetch(`${PSGC_BASE_URL}/cities-municipalities/${cityCode}/barangays/`);
      if (!response.ok) throw new Error('Failed to fetch barangays');
      const data = await response.json();
      setBarangays(data);
      setFormData((prev) => ({ ...prev, barangay: '' }));
    } catch (error) {
      console.error('Error fetching barangays:', error);
      controller.setApiError('Could not load barangays. Using fallback data.');
      setBarangays([
        { code: 'PHB030000000', name: 'Binakayan' },
        { code: 'PHB030100000', name: 'Canumay' },
      ]);
    } finally {
      controller.setLoadingBarangays(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (event) => {
    const provinceCode = event.target.value;
    const selectedProvince = provinces.find((province) => province.code === provinceCode);
    controller.setSelectedProvinceCode(provinceCode);
    setFormData((prev) => ({
      ...prev,
      province: selectedProvince ? selectedProvince.name : '',
      city: '',
      barangay: '',
    }));
    fetchCities(provinceCode);
  };

  const handleCityChange = (event) => {
    const cityCode = event.target.value;
    const selectedCity = cities.find((city) => city.code === cityCode);
    controller.setSelectedCityMunicipalityCode(cityCode);
    setFormData((prev) => ({
      ...prev,
      city: selectedCity ? selectedCity.name : '',
      barangay: '',
    }));
    fetchBarangays(cityCode);
  };

  const handleBarangayChange = (event) => {
    const barangayCode = event.target.value;
    const selectedBarangay = barangays.find((barangay) => barangay.code === barangayCode);
    setFormData((prev) => ({
      ...prev,
      barangay: selectedBarangay ? selectedBarangay.name : '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    controller.setSubmitError('');

    if (!controller.isLoginMode && formData.password !== formData.confirmPassword) {
      controller.setSubmitError('Password and confirm password do not match.');
      return;
    }

    if (!controller.isLoginMode && (!formData.firstName.trim() || !formData.lastName.trim())) {
      controller.setSubmitError('First name and last name are required.');
      return;
    }

    if (!controller.isLoginMode && (!formData.province || !formData.city || !formData.barangay || !formData.address)) {
      controller.setSubmitError('Please fill in all location fields.');
      return;
    }

    try {
      await controller.handleSubmit(formData);
    } catch (error) {
      // Error is already set in controller
      console.error('Form submission error:', error);
    }
  };

  const handleResendVerification = async () => {
    const email = formData.email?.trim();
    if (!email) {
      controller.setSubmitError('Enter your email first, then resend verification.');
      return;
    }

    try {
      await controller.handleResendVerification(email);
    } catch (error) {
      // Error is already set in controller
      console.error('Resend verification error:', error);
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
    },
    content: {
      backgroundColor: '#ffffff',
      borderRadius: '0.8rem',
      padding: '1.5rem',
      maxWidth: '540px',
      width: 'min(92vw, 540px)',
      maxHeight: '92vh',
      overflowY: 'auto',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      position: 'relative',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: hoveredButton === 'close' ? '#111827' : '#6b7280',
      transition: 'color 0.3s ease',
    },
    title: {
      fontSize: '2.15rem',
      color: '#111827',
      textAlign: 'center',
      margin: '0 0 1.15rem 0',
      fontWeight: 700,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
    },
    group: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.95rem',
      fontWeight: 600,
      color: '#111827',
    },
    input: {
      minHeight: '44px',
      height: '44px',
      boxSizing: 'border-box',
      padding: '0 0.85rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.4rem',
      fontSize: '1rem',
      lineHeight: 1.2,
      fontFamily: 'inherit',
      transition: 'all 0.3s ease',
      backgroundColor: '#ffffff',
      color: '#111827',
    },
    submit: {
      backgroundColor: hoveredButton === 'submit' ? '#1d4ed8' : '#2563eb',
      color: '#ffffff',
      border: 'none',
      minHeight: '44px',
      height: '44px',
      boxSizing: 'border-box',
      padding: '0 0.85rem',
      borderRadius: '0.4rem',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      marginTop: '0.3rem',
    },
    footer: {
      marginTop: '1.1rem',
      textAlign: 'center',
    },
    toggleText: {
      fontSize: '0.95rem',
      color: '#4b5563',
      margin: 0,
    },
    toggleLink: (key) => ({
      background: 'none',
      border: 'none',
      color: hoveredButton === key ? '#1d4ed8' : '#2563eb',
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: hoveredButton === key ? 'underline' : 'none',
      transition: 'color 0.3s ease',
    }),
    locationHeader: {
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid #e0e0e0',
    },
    locationLabel: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#7f8c8d',
      textTransform: 'uppercase',
      marginBottom: '12px',
    },
    errorBox: {
      padding: '10px',
      background: '#ffe6e6',
      color: '#c33',
      borderRadius: '4px',
      fontSize: '12px',
      marginTop: '10px',
    },
    successBox: {
      padding: '16px',
      background: '#dcfce7',
      border: '2px solid #22c55e',
      borderRadius: '6px',
      color: '#15803d',
      marginTop: '15px',
      marginBottom: '15px',
      textAlign: 'center',
    },
    successTitle: {
      fontWeight: 700,
      marginBottom: '10px',
      fontSize: '15px',
      color: '#15803d',
    },
    successText: {
      fontSize: '14px',
      lineHeight: '1.6',
      fontWeight: 500,
      color: '#15803d',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <button
          type="button"
          onClick={onClose}
          style={styles.closeButton}
          aria-label="Close modal"
          onMouseEnter={() => setHoveredButton('close')}
          onMouseLeave={() => setHoveredButton('')}
        >
          x
        </button>

        <h2 style={styles.title}>{controller.isLoginMode ? 'Login' : 'Create Account'}</h2>

        {!isSignupSuccess ? (
        <form onSubmit={handleSubmit} style={styles.form}>
          {!controller.isLoginMode && (
            <>
              <div style={styles.group}>
                <label htmlFor="firstName" style={styles.label}>First Name</label>
                <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} style={styles.input} placeholder="Enter your first name" required />
              </div>

              <div style={styles.group}>
                <label htmlFor="middleName" style={styles.label}>Middle Name (optional)</label>
                <input id="middleName" name="middleName" type="text" value={formData.middleName} onChange={handleInputChange} style={styles.input} placeholder="Enter your middle name" />
              </div>

              <div style={styles.group}>
                <label htmlFor="lastName" style={styles.label}>Last Name</label>
                <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} style={styles.input} placeholder="Enter your last name" required />
              </div>
            </>
          )}

          <div style={styles.group}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} style={styles.input} placeholder="Enter your email" required />
          </div>

          <div style={styles.group}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} style={styles.input} placeholder="Enter your password" required />
          </div>

          {!controller.isLoginMode && (
            <div style={styles.group}>
              <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} style={styles.input} placeholder="Confirm your password" required />
            </div>
          )}

          {!controller.isLoginMode && (
            <>
              <div style={styles.locationHeader}>
                <p style={styles.locationLabel}>Service Location (Philippines)</p>
              </div>

              <div style={styles.group}>
                <label htmlFor="province" style={styles.label}>Province {controller.loadingProvinces && '(Loading...)'}</label>
                <select id="province" value={controller.selectedProvinceCode} onChange={handleProvinceChange} style={styles.input} required disabled={controller.loadingProvinces}>
                  <option value="">Select a Province</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>{province.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.group}>
                <label htmlFor="city" style={styles.label}>City/Municipality {controller.loadingCities && '(Loading...)'}</label>
                <select id="city" value={controller.selectedCityMunicipalityCode} onChange={handleCityChange} style={styles.input} required disabled={!controller.selectedProvinceCode || controller.loadingCities}>
                  <option value="">{!controller.selectedProvinceCode ? 'Select Province First' : 'Select City/Municipality'}</option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.code}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.group}>
                <label htmlFor="barangay" style={styles.label}>Barangay {controller.loadingBarangays && '(Loading...)'}</label>
                <select id="barangay" value={formData.barangay ? (barangays.find((barangay) => barangay.name === formData.barangay)?.code || '') : ''} onChange={handleBarangayChange} style={styles.input} required disabled={!controller.selectedCityMunicipalityCode || controller.loadingBarangays}>
                  <option value="">{!controller.selectedCityMunicipalityCode ? 'Select City First' : 'Select Barangay'}</option>
                  {barangays.map((barangay) => (
                    <option key={barangay.code} value={barangay.code}>{barangay.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.group}>
                <label htmlFor="address" style={styles.label}>Specific Address</label>
                <input id="address" name="address" type="text" value={formData.address} onChange={handleInputChange} style={styles.input} placeholder="e.g., 123 Main St, Blk 5" required />
              </div>

              {controller.apiError && <div style={styles.errorBox}>{controller.apiError}</div>}
            </>
          )}

          {controller.submitError && <div style={styles.errorBox}>{controller.submitError}</div>}

          <button
            type="submit"
            style={{
              ...styles.submit,
              ...(controller.isSubmitting ? { backgroundColor: '#94a3b8', cursor: 'not-allowed' } : {}),
            }}
            onMouseEnter={() => setHoveredButton('submit')}
            onMouseLeave={() => setHoveredButton('')}
            disabled={controller.isSubmitting}
          >
            {controller.isSubmitting ? (controller.isLoginMode ? 'Logging in...' : 'Creating Account...') : (controller.isLoginMode ? 'Login' : 'Create Account')}
          </button>
        </form>
        ) : null}

        {isSignupSuccess && (
          <div style={styles.successBox}>
            <div style={styles.successTitle}>✓ Account Created Successfully!</div>
            <div style={styles.successText}>
              We've sent a confirmation email to <strong>{formData.email}</strong>. 
              <br />
              Please check your email and click the confirmation link to activate your account.
            </div>
          </div>
        )}

        <div style={styles.footer}>
          {isSignupSuccess ? (
            <button
              type="button"
              onClick={() => {
                setIsSignupSuccess(false);
                resetAllState();
                onClose();
              }}
              style={{
                ...styles.submit,
                width: '100%',
              }}
              onMouseEnter={() => setHoveredButton('close-success')}
              onMouseLeave={() => setHoveredButton('')}
            >
              Close
            </button>
          ) : (
          <>
          <p style={styles.toggleText}>
            {controller.isLoginMode ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={controller.toggleMode}
              style={styles.toggleLink('toggle')}
              onMouseEnter={() => setHoveredButton('toggle')}
              onMouseLeave={() => setHoveredButton('')}
            >
              {controller.isLoginMode ? 'Register' : 'Login'}
            </button>
          </p>
          {controller.isLoginMode && (
            <p style={styles.toggleText}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onForgotPassword?.();
                }}
                style={styles.toggleLink('forgot')}
                onMouseEnter={() => setHoveredButton('forgot')}
                onMouseLeave={() => setHoveredButton('')}
              >
                Forgot Password?
              </button>
            </p>
          )}
          {controller.isLoginMode && /verify your email|email not verified|email not confirmed/i.test(controller.submitError || '') && (
            <p style={styles.toggleText}>
              <button
                type="button"
                onClick={handleResendVerification}
                style={styles.toggleLink('resend')}
                onMouseEnter={() => setHoveredButton('resend')}
                onMouseLeave={() => setHoveredButton('')}
                disabled={controller.isResendingVerification}
              >
                {controller.isResendingVerification ? 'Resending verification...' : 'Resend verification email'}
              </button>
            </p>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
