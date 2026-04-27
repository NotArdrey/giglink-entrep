import { useEffect, useState } from 'react';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

function LoginModal({ isOpen, onClose, onSubmit, onForgotPassword }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    province: '',
    city: '',
    barangay: '',
    address: '',
  });

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityMunicipalityCode, setSelectedCityMunicipalityCode] = useState('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);
  const [apiError, setApiError] = useState('');
  const [hoveredButton, setHoveredButton] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen && !isLoginMode) {
      fetchProvinces();
    }
  }, [isOpen, isLoginMode]);

  const fetchProvinces = async () => {
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
  };

  const fetchCities = async (provinceCode) => {
    if (!provinceCode) {
      setCities([]);
      setSelectedCityMunicipalityCode('');
      return;
    }
    setLoadingCities(true);
    setApiError('');
    try {
      const response = await fetch(`${PSGC_BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      const data = await response.json();
      setCities(data);
      setFormData((prev) => ({ ...prev, city: '', barangay: '' }));
      setSelectedCityMunicipalityCode('');
      setBarangays([]);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setApiError('Could not load cities. Using fallback data.');
      setCities([
        { code: 'PHM030000000', name: 'Meycauayan' },
        { code: 'PHM031000000', name: 'Bulacan' },
      ]);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchBarangays = async (cityCode) => {
    if (!cityCode) {
      setBarangays([]);
      return;
    }
    setLoadingBarangays(true);
    setApiError('');
    try {
      const response = await fetch(`${PSGC_BASE_URL}/cities-municipalities/${cityCode}/barangays/`);
      if (!response.ok) throw new Error('Failed to fetch barangays');
      const data = await response.json();
      setBarangays(data);
      setFormData((prev) => ({ ...prev, barangay: '' }));
    } catch (error) {
      console.error('Error fetching barangays:', error);
      setApiError('Could not load barangays. Using fallback data.');
      setBarangays([
        { code: 'PHB030000000', name: 'Binakayan' },
        { code: 'PHB030100000', name: 'Canumay' },
      ]);
    } finally {
      setLoadingBarangays(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (event) => {
    const provinceCode = event.target.value;
    const selectedProvince = provinces.find((province) => province.code === provinceCode);
    setSelectedProvinceCode(provinceCode);
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
    setSelectedCityMunicipalityCode(cityCode);
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
    setSubmitError('');

    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      setSubmitError('Password and confirm password do not match.');
      return;
    }

    if (!isLoginMode && (!formData.province || !formData.city || !formData.barangay || !formData.address)) {
      setSubmitError('Please fill in all location fields.');
      return;
    }

    if (typeof onSubmit !== 'function') {
      setSubmitError('Authentication is not available yet.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData, isLoginMode);
      setFormData({
        email: '',
        password: '',
        name: '',
        confirmPassword: '',
        province: '',
        city: '',
        barangay: '',
        address: '',
      });
      setSelectedProvinceCode('');
      setSelectedCityMunicipalityCode('');
      setCities([]);
      setBarangays([]);
    } catch (error) {
      setSubmitError(error?.message || 'Unable to complete authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode((prev) => !prev);
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
    toggleLink: {
      background: 'none',
      border: 'none',
      color: hoveredButton === 'toggle' ? '#1d4ed8' : '#2563eb',
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: hoveredButton === 'toggle' ? 'underline' : 'none',
      transition: 'color 0.3s ease',
    },
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

        <h2 style={styles.title}>{isLoginMode ? 'Login' : 'Create Account'}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLoginMode && (
            <div style={styles.group}>
              <label htmlFor="name" style={styles.label}>Full Name</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} style={styles.input} placeholder="Enter your full name" required />
            </div>
          )}

          <div style={styles.group}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} style={styles.input} placeholder="Enter your email" required />
          </div>

          <div style={styles.group}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} style={styles.input} placeholder="Enter your password" required />
          </div>

          {!isLoginMode && (
            <div style={styles.group}>
              <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} style={styles.input} placeholder="Confirm your password" required />
            </div>
          )}

          {!isLoginMode && (
            <>
              <div style={styles.locationHeader}>
                <p style={styles.locationLabel}>Service Location (Philippines)</p>
              </div>

              <div style={styles.group}>
                <label htmlFor="province" style={styles.label}>Province {loadingProvinces && '(Loading...)'}</label>
                <select id="province" value={selectedProvinceCode} onChange={handleProvinceChange} style={styles.input} required disabled={loadingProvinces}>
                  <option value="">Select a Province</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>{province.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.group}>
                <label htmlFor="city" style={styles.label}>City/Municipality {loadingCities && '(Loading...)'}</label>
                <select id="city" value={selectedCityMunicipalityCode} onChange={handleCityChange} style={styles.input} required disabled={!selectedProvinceCode || loadingCities}>
                  <option value="">{!selectedProvinceCode ? 'Select Province First' : 'Select City/Municipality'}</option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.code}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.group}>
                <label htmlFor="barangay" style={styles.label}>Barangay {loadingBarangays && '(Loading...)'}</label>
                <select id="barangay" value={formData.barangay ? (barangays.find((barangay) => barangay.name === formData.barangay)?.code || '') : ''} onChange={handleBarangayChange} style={styles.input} required disabled={!selectedCityMunicipalityCode || loadingBarangays}>
                  <option value="">{!selectedCityMunicipalityCode ? 'Select City First' : 'Select Barangay'}</option>
                  {barangays.map((barangay) => (
                    <option key={barangay.code} value={barangay.code}>{barangay.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.group}>
                <label htmlFor="address" style={styles.label}>Specific Address</label>
                <input id="address" name="address" type="text" value={formData.address} onChange={handleInputChange} style={styles.input} placeholder="e.g., 123 Main St, Blk 5" required />
              </div>

              {apiError && <div style={styles.errorBox}>{apiError}</div>}
            </>
          )}

          {submitError && <div style={styles.errorBox}>{submitError}</div>}

          <button
            type="submit"
            style={{
              ...styles.submit,
              ...(isSubmitting ? { backgroundColor: '#94a3b8', cursor: 'not-allowed' } : {}),
            }}
            onMouseEnter={() => setHoveredButton('submit')}
            onMouseLeave={() => setHoveredButton('')}
            disabled={isSubmitting}
          >
            {isSubmitting ? (isLoginMode ? 'Logging in...' : 'Creating Account...') : (isLoginMode ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.toggleText}>
            {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={toggleMode}
              style={styles.toggleLink}
              onMouseEnter={() => setHoveredButton('toggle')}
              onMouseLeave={() => setHoveredButton('')}
            >
              {isLoginMode ? 'Register' : 'Login'}
            </button>
          </p>
          {isLoginMode && (
            <p style={styles.toggleText}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onForgotPassword?.();
                }}
                style={styles.toggleLink}
                onMouseEnter={() => setHoveredButton('forgot')}
                onMouseLeave={() => setHoveredButton('')}
              >
                Forgot Password?
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
