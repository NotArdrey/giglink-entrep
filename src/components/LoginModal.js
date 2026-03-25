import { useState, useEffect } from 'react';
// Note: Using className for styling and camelCase for event handlers (onClick, onChange)
// Note: External CSS imported from styles/
import '../styles/LoginModal.css';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

function LoginModal({ isOpen, onClose, onSubmit }) {
  // Note: Using React useState to manage form input state
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
  
  // Location API state
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityMunicipalityCode, setSelectedCityMunicipalityCode] = useState('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);
  const [apiError, setApiError] = useState('');

  // Note: camelCase for event handler
  // Fetch provinces when registration mode is opened
  useEffect(() => {
    if (isOpen && !isLoginMode) {
      fetchProvinces();
    }
  }, [isOpen, isLoginMode]);

  /**
   * fetchProvinces() - Fetch all provinces from PSGC API
   * Public API: psgc.gitlab.io
   */
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

  /**
   * fetchCities(provinceCode) - Fetch cities/municipalities for a province
   */
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
      setFormData(prev => ({ ...prev, city: '', barangay: '' }));
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

  /**
   * fetchBarangays(cityCode) - Fetch barangays for a city
   */
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
      setFormData(prev => ({ ...prev, barangay: '' }));
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle province selection
  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
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

  // Handle city/municipality selection
  const handleCityChange = (e) => {
    const cityCode = e.target.value;
    const selectedCity = cities.find((city) => city.code === cityCode);

    setSelectedCityMunicipalityCode(cityCode);
    setFormData((prev) => ({
      ...prev,
      city: selectedCity ? selectedCity.name : '',
      barangay: '',
    }));
    fetchBarangays(cityCode);
  };

  // Handle barangay selection
  const handleBarangayChange = (e) => {
    const barangayCode = e.target.value;
    const selectedBarangay = barangays.find((barangay) => barangay.code === barangayCode);
    setFormData((prev) => ({
      ...prev,
      barangay: selectedBarangay ? selectedBarangay.name : '',
    }));
  };

  // Note: Simulated form submission with state-driven UI transition
  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Validate registration has location data
    if (!isLoginMode && (!formData.province || !formData.city || !formData.barangay || !formData.address)) {
      setApiError('Please fill in all location fields');
      return;
    }
  
    onSubmit(formData);
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
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="modal-close-button"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <h2 className="modal-title">
          {isLoginMode ? 'Login' : 'Create Account'}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Register: Name Field */}
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Register: Confirm Password Field */}
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {/* Register: Location Fields */}
          {!isLoginMode && (
            <>
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#7f8c8d', textTransform: 'uppercase', marginBottom: '12px' }}>
                  📍 Service Location (Philippines)
                </p>
              </div>

              {/* Province Dropdown */}
              <div className="form-group">
                <label htmlFor="province" className="form-label">
                  Province {loadingProvinces && '(Loading...)'}
                </label>
                <select
                  id="province"
                  value={selectedProvinceCode}
                  onChange={handleProvinceChange}
                  className="form-input"
                  required
                  disabled={loadingProvinces}
                >
                  <option value="">Select a Province</option>
                  {provinces.map(prov => (
                    <option key={prov.code} value={prov.code}>
                      {prov.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City/Municipality Dropdown */}
              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  City/Municipality {loadingCities && '(Loading...)'}
                </label>
                <select
                  id="city"
                  value={selectedCityMunicipalityCode}
                  onChange={handleCityChange}
                  className="form-input"
                  required
                  disabled={!selectedProvinceCode || loadingCities}
                >
                  <option value="">
                    {!selectedProvinceCode ? 'Select Province First' : 'Select City/Municipality'}
                  </option>
                  {cities.map(city => (
                    <option key={city.code} value={city.code}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Barangay Dropdown */}
              <div className="form-group">
                <label htmlFor="barangay" className="form-label">
                  Barangay {loadingBarangays && '(Loading...)'}
                </label>
                <select
                  id="barangay"
                  value={formData.barangay ? (barangays.find((barangay) => barangay.name === formData.barangay)?.code || '') : ''}
                  onChange={handleBarangayChange}
                  className="form-input"
                  required
                  disabled={!selectedCityMunicipalityCode || loadingBarangays}
                >
                  <option value="">
                    {!selectedCityMunicipalityCode ? 'Select City First' : 'Select Barangay'}
                  </option>
                  {barangays.map(barangay => (
                    <option key={barangay.code} value={barangay.code}>
                      {barangay.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Address */}
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Specific Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 123 Main St, Blk 5, Senior Citizen Village"
                  required
                />
              </div>

              {apiError && (
                <div style={{ padding: '10px', background: '#ffe6e6', color: '#c33', borderRadius: '4px', fontSize: '12px', marginTop: '10px' }}>
                  ⚠️ {apiError}
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <button type="submit" className="form-submit-button">
            {isLoginMode ? 'Login' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Between Login and Register */}
        <div className="modal-footer">
          <p className="modal-toggle-text">
            {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={toggleMode}
              className="modal-toggle-link"
            >
              {isLoginMode ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
