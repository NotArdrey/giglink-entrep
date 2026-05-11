import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  Lock,
  LogIn,
  Mail,
  MapPin,
  RefreshCw,
  User,
  UserPlus,
} from 'lucide-react';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

const EMPTY_AUTH_FORM = {
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
};

const getAuthErrorMessage = (error) => {
  const errorMessage = error?.message || 'Authentication failed. Please try again.';
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }

  if (lowerMessage.includes('already registered') || lowerMessage.includes('user already exists')) {
    return 'This email is already registered. Please log in or use a different email.';
  }

  if (lowerMessage.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }

  if (lowerMessage.includes('weak password')) {
    return 'Password must be at least 8 characters with uppercase letters and numbers.';
  }

  return errorMessage;
};

function AuthPage({
  mode = 'login',
  onModeChange,
  onBack,
  onSubmit,
  onForgotPasswordSubmit,
  onResendVerification,
}) {
  const isRegisterMode = mode === 'register';
  const isForgotMode = mode === 'forgot';
  const isLoginMode = mode === 'login';

  const [formData, setFormData] = useState(EMPTY_AUTH_FORM);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityMunicipalityCode, setSelectedCityMunicipalityCode] = useState('');
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);
  const [apiError, setApiError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [isForgotSubmitted, setIsForgotSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const latestEmailRef = useRef('');

  const pageCopy = useMemo(() => {
    if (isForgotMode) {
      return {
        title: 'Reset Password',
        subtitle: 'Send a secure reset link to your email and get back to your bookings.',
      };
    }

    if (isRegisterMode) {
      return {
        title: 'Create Account',
        subtitle: 'Create your client profile, set your location, and start booking trusted local services.',
      };
    }

    return {
      title: 'Login',
      subtitle: 'Access your dashboard, bookings, saved providers, and service workspace.',
    };
  }, [isForgotMode, isRegisterMode]);

  const fetchProvinces = useCallback(async () => {
    setIsLoadingProvinces(true);
    setApiError('');

    try {
      const response = await fetch(`${PSGC_BASE_URL}/provinces/`);
      if (!response.ok) throw new Error('Failed to fetch provinces');
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setApiError('Could not load provinces. You can still try again in a moment.');
      setProvinces([
        { code: 'PHR030000000', name: 'Bulacan' },
        { code: 'PHR010000000', name: 'Abra' },
        { code: 'PHR020000000', name: 'Agusan del Norte' },
      ]);
    } finally {
      setIsLoadingProvinces(false);
    }
  }, []);

  useEffect(() => {
    if (isRegisterMode && provinces.length === 0) {
      fetchProvinces();
    }
  }, [fetchProvinces, isRegisterMode, provinces.length]);

  useEffect(() => {
    latestEmailRef.current = formData.email;
  }, [formData.email]);

  useEffect(() => {
    setSubmitError('');
    setForgotError('');
    setApiError('');
    setIsSignupSuccess(false);
    setIsForgotSubmitted(false);

    if (mode === 'forgot') {
      setForgotEmail((currentEmail) => currentEmail || latestEmailRef.current);
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [mode]);

  const fetchCities = async (provinceCode) => {
    if (!provinceCode) {
      setCities([]);
      setSelectedCityMunicipalityCode('');
      return;
    }

    setIsLoadingCities(true);
    setApiError('');

    try {
      const response = await fetch(`${PSGC_BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      const data = await response.json();
      setCities(data);
      setFormData((current) => ({ ...current, city: '', barangay: '' }));
      setSelectedCityMunicipalityCode('');
      setBarangays([]);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setApiError('Could not load cities. Using fallback options for now.');
      setCities([
        { code: 'PHM030000000', name: 'Meycauayan' },
        { code: 'PHM031000000', name: 'Bulacan' },
      ]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const fetchBarangays = async (cityCode) => {
    if (!cityCode) {
      setBarangays([]);
      return;
    }

    setIsLoadingBarangays(true);
    setApiError('');

    try {
      const response = await fetch(`${PSGC_BASE_URL}/cities-municipalities/${cityCode}/barangays/`);
      if (!response.ok) throw new Error('Failed to fetch barangays');
      const data = await response.json();
      setBarangays(data);
      setFormData((current) => ({ ...current, barangay: '' }));
    } catch (error) {
      console.error('Error fetching barangays:', error);
      setApiError('Could not load barangays. Using fallback options for now.');
      setBarangays([
        { code: 'PHB030000000', name: 'Binakayan' },
        { code: 'PHB030100000', name: 'Canumay' },
      ]);
    } finally {
      setIsLoadingBarangays(false);
    }
  };

  const handleModeChange = (nextMode) => {
    onModeChange?.(nextMode);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleProvinceChange = (event) => {
    const provinceCode = event.target.value;
    const selectedProvince = provinces.find((province) => province.code === provinceCode);

    setSelectedProvinceCode(provinceCode);
    setFormData((current) => ({
      ...current,
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
    setFormData((current) => ({
      ...current,
      city: selectedCity ? selectedCity.name : '',
      barangay: '',
    }));
    fetchBarangays(cityCode);
  };

  const handleBarangayChange = (event) => {
    const barangayCode = event.target.value;
    const selectedBarangay = barangays.find((barangay) => barangay.code === barangayCode);

    setFormData((current) => ({
      ...current,
      barangay: selectedBarangay ? selectedBarangay.name : '',
    }));
  };

  const validateAuthForm = () => {
    if (!isRegisterMode) return '';

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return 'First name and last name are required.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Password and confirm password do not match.';
    }

    if (!formData.province || !formData.city || !formData.barangay || !formData.address.trim()) {
      return 'Please complete all service location fields.';
    }

    return '';
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    const validationError = validateAuthForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit?.(formData, isLoginMode);

      if (isRegisterMode) {
        setIsSignupSuccess(true);
      }
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (event) => {
    event.preventDefault();
    setForgotError('');

    const submittedEmail = event.currentTarget.querySelector('input[name="email"]')?.value ?? '';
    const cleanEmail = submittedEmail.trim();
    if (!cleanEmail) {
      setForgotError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    try {
      setIsForgotSubmitting(true);
      setForgotEmail(cleanEmail);
      await onForgotPasswordSubmit?.(cleanEmail);
      setIsForgotSubmitted(true);
    } catch (error) {
      setForgotError(error?.message || 'Unable to send password reset email. Please try again.');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    const email = formData.email.trim();
    if (!email) {
      setSubmitError('Enter your email first, then resend verification.');
      return;
    }

    try {
      setIsResendingVerification(true);
      await onResendVerification?.(email);
    } catch (error) {
      setSubmitError(error?.message || 'Unable to resend verification email.');
    } finally {
      setIsResendingVerification(false);
    }
  };

  const resetRegisterSuccess = () => {
    setFormData(EMPTY_AUTH_FORM);
    setSelectedProvinceCode('');
    setSelectedCityMunicipalityCode('');
    setCities([]);
    setBarangays([]);
    setIsSignupSuccess(false);
    handleModeChange('login');
  };

  const shouldShowResend = isLoginMode && /verify your email|email not verified|email not confirmed/i.test(submitError || '');

  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <button type="button" className="auth-brand" onClick={onBack} aria-label="Back to GigLink home">
          <span className="auth-brand-mark">G</span>
          <span>
            <strong>GigLink</strong>
            <small>Service marketplace</small>
          </span>
        </button>

        <button type="button" className="auth-back-button" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </button>
      </header>

      <section className="auth-shell" aria-label="GigLink authentication">
        <aside className="auth-visual" aria-label="GigLink marketplace preview">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&h=1600&fit=crop"
            alt="Local professionals collaborating with clients"
            className="auth-visual-image"
          />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-content">
            <h2>Find help, book work, and manage every job in one place.</h2>
            <p>
              GigLink connects clients with service providers for real schedules,
              transparent rates, and clean booking handoffs.
            </p>

            <div className="auth-proof-grid" aria-label="GigLink trust highlights">
              <div>
                <strong>80+</strong>
                <span>Service categories</span>
              </div>
              <div>
                <strong>15m</strong>
                <span>Average response</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Booking access</span>
              </div>
            </div>
          </div>
        </aside>

        <section className={`auth-panel ${isRegisterMode ? 'register' : isForgotMode ? 'forgot' : 'login'}`}>
          <div className="auth-panel-head">
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.subtitle}</p>
          </div>

          {!isForgotMode && (
            <div className="auth-mode-toggle" role="tablist" aria-label="Choose login or register">
              <button
                type="button"
                className={isLoginMode ? 'active' : ''}
                onClick={() => handleModeChange('login')}
                role="tab"
                aria-selected={isLoginMode}
              >
                <LogIn size={16} aria-hidden="true" />
                Login
              </button>
              <button
                type="button"
                className={isRegisterMode ? 'active' : ''}
                onClick={() => handleModeChange('register')}
                role="tab"
                aria-selected={isRegisterMode}
              >
                <UserPlus size={16} aria-hidden="true" />
                Register
              </button>
            </div>
          )}

          {isForgotMode ? (
            <form className="auth-form" onSubmit={handleForgotSubmit}>
              {isForgotSubmitted ? (
                <div className="auth-success-panel">
                  <CheckCircle2 size={36} aria-hidden="true" />
                  <h2>Reset link sent</h2>
                  <p>
                    We sent a password reset link to <strong>{forgotEmail}</strong>.
                    Open it from your inbox to create a new password.
                  </p>
                  <button type="button" className="auth-submit secondary" onClick={() => handleModeChange('login')}>
                    <LogIn size={18} aria-hidden="true" />
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <label className="auth-field" htmlFor="forgot-email">
                    <span>Email</span>
                    <div className="auth-input-wrap">
                      <Mail size={18} aria-hidden="true" />
                      <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        value={forgotEmail}
                        onChange={(event) => setForgotEmail(event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </label>

                  {forgotError && <div className="auth-alert error">{forgotError}</div>}

                  <button type="submit" className="auth-submit" disabled={isForgotSubmitting}>
                    {isForgotSubmitting ? <RefreshCw className="gl-spin" size={18} aria-hidden="true" /> : <Mail size={18} aria-hidden="true" />}
                    {isForgotSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <button type="button" className="auth-link-button center" onClick={() => handleModeChange('login')}>
                    <ArrowLeft size={16} aria-hidden="true" />
                    Back to Login
                  </button>
                </>
              )}
            </form>
          ) : isSignupSuccess ? (
            <div className="auth-success-panel">
              <CheckCircle2 size={40} aria-hidden="true" />
              <h2>Account created</h2>
              <p>
                We sent a confirmation email to <strong>{formData.email}</strong>.
                Verify your email, then log in to continue.
              </p>
              <button type="button" className="auth-submit" onClick={resetRegisterSuccess}>
                <LogIn size={18} aria-hidden="true" />
                Continue to Login
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {isRegisterMode && (
                <div className="auth-register-grid">
                  <label className="auth-field" htmlFor="firstName">
                    <span>First Name</span>
                    <div className="auth-input-wrap">
                      <User size={18} aria-hidden="true" />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Juan"
                        autoComplete="given-name"
                        required
                      />
                    </div>
                  </label>

                  <label className="auth-field" htmlFor="middleName">
                    <span>Middle Name <small>(optional)</small></span>
                    <div className="auth-input-wrap">
                      <User size={18} aria-hidden="true" />
                      <input
                        id="middleName"
                        name="middleName"
                        type="text"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        placeholder="Santos"
                        autoComplete="additional-name"
                      />
                    </div>
                  </label>

                  <label className="auth-field full" htmlFor="lastName">
                    <span>Last Name</span>
                    <div className="auth-input-wrap">
                      <User size={18} aria-hidden="true" />
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Dela Cruz"
                        autoComplete="family-name"
                        required
                      />
                    </div>
                  </label>
                </div>
              )}

              <label className="auth-field" htmlFor="email">
                <span>Email</span>
                <div className="auth-input-wrap">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="auth-field" htmlFor="password">
                <span>Password</span>
                <div className="auth-input-wrap has-action">
                  <Lock size={18} aria-hidden="true" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                    required
                  />
                  <button
                    type="button"
                    className="auth-input-action"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide entered text' : 'Show entered text'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </label>

              {isRegisterMode && (
                <>
                  <label className="auth-field" htmlFor="confirmPassword">
                    <span>Confirm Password</span>
                    <div className="auth-input-wrap has-action">
                      <Lock size={18} aria-hidden="true" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="auth-input-action"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        aria-label={showConfirmPassword ? 'Hide confirmation text' : 'Show confirmation text'}
                        title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                      </button>
                    </div>
                  </label>

                  <div className="auth-location-block">
                    <div>
                      <span className="auth-location-kicker">
                        <MapPin size={15} aria-hidden="true" />
                        Service Location
                      </span>
                      <p>Used to match you with nearby providers in the Philippines.</p>
                    </div>
                  </div>

                  <label className="auth-field" htmlFor="province">
                    <span>Province {isLoadingProvinces && <small>(Loading...)</small>}</span>
                    <div className="auth-input-wrap">
                      <MapPin size={18} aria-hidden="true" />
                      <select
                        id="province"
                        value={selectedProvinceCode}
                        onChange={handleProvinceChange}
                        required
                        disabled={isLoadingProvinces}
                      >
                        <option value="">Select a Province</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>{province.name}</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="auth-field" htmlFor="city">
                    <span>City/Municipality {isLoadingCities && <small>(Loading...)</small>}</span>
                    <div className="auth-input-wrap">
                      <MapPin size={18} aria-hidden="true" />
                      <select
                        id="city"
                        value={selectedCityMunicipalityCode}
                        onChange={handleCityChange}
                        required
                        disabled={!selectedProvinceCode || isLoadingCities}
                      >
                        <option value="">{!selectedProvinceCode ? 'Select Province First' : 'Select City/Municipality'}</option>
                        {cities.map((city) => (
                          <option key={city.code} value={city.code}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="auth-field" htmlFor="barangay">
                    <span>Barangay {isLoadingBarangays && <small>(Loading...)</small>}</span>
                    <div className="auth-input-wrap">
                      <MapPin size={18} aria-hidden="true" />
                      <select
                        id="barangay"
                        value={formData.barangay ? (barangays.find((barangay) => barangay.name === formData.barangay)?.code || '') : ''}
                        onChange={handleBarangayChange}
                        required
                        disabled={!selectedCityMunicipalityCode || isLoadingBarangays}
                      >
                        <option value="">{!selectedCityMunicipalityCode ? 'Select City First' : 'Select Barangay'}</option>
                        {barangays.map((barangay) => (
                          <option key={barangay.code} value={barangay.code}>{barangay.name}</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="auth-field" htmlFor="address">
                    <span>Specific Address</span>
                    <div className="auth-input-wrap">
                      <Home size={18} aria-hidden="true" />
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Block, street, house number"
                        autoComplete="street-address"
                        required
                      />
                    </div>
                  </label>

                  {apiError && <div className="auth-alert warning">{apiError}</div>}
                </>
              )}

              {submitError && <div className="auth-alert error">{submitError}</div>}

              <button type="submit" className="auth-submit" disabled={isSubmitting}>
                {isSubmitting ? <RefreshCw className="gl-spin" size={18} aria-hidden="true" /> : isRegisterMode ? <UserPlus size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
                {isSubmitting ? (isRegisterMode ? 'Creating Account...' : 'Logging in...') : (isRegisterMode ? 'Create Account' : 'Login')}
              </button>

              {isLoginMode && (
                <div className="auth-form-footer">
                  <button type="button" className="auth-link-button" onClick={() => handleModeChange('forgot')}>
                    Forgot Password?
                  </button>
                  {shouldShowResend && (
                    <button
                      type="button"
                      className="auth-link-button"
                      onClick={handleResendVerification}
                      disabled={isResendingVerification}
                    >
                      {isResendingVerification ? 'Resending verification...' : 'Resend verification email'}
                    </button>
                  )}
                </div>
              )}
            </form>
          )}
        </section>
      </section>
    </main>
  );
}

export default AuthPage;
