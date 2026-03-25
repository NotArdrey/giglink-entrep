import { useEffect, useState } from 'react';
import '../styles/AccountSettings.css';

const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';
const BULACAN_CODE = '031400000';

/**
 * Navigation Flow:
 * - Opened from Profile page via "Manage Account & Privacy".
 * - "← Back to Profile" returns users to Profile Hub.
 *
 * Security Validation Logic:
 * - Password update checks if New Password and Confirm New Password match.
 * - If mismatch: show red error message.
 * - If match: clear error and show success toast notification.
 */
function AccountSettings({ sellerProfile, userLocation, onBackToProfile }) {
  const profileName = sellerProfile?.fullName || 'Juan Dela Cruz';
  const [email, setEmail] = useState('juandelacruz@email.com');
  const [phone, setPhone] = useState('09171234567');

  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [selectedBarangayCode, setSelectedBarangayCode] = useState('');
  const [city, setCity] = useState(userLocation?.city || 'Baliwag');
  const [barangay, setBarangay] = useState(userLocation?.barangay || 'Sabang');
  const [locationError, setLocationError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      setLocationError('');
      try {
        const response = await fetch(`${PSGC_BASE_URL}/provinces/${BULACAN_CODE}/cities-municipalities/`);
        if (!response.ok) throw new Error('Failed to fetch cities');
        const data = await response.json();
        setCities(data);

        const initialCity = data.find((item) => item.name.toLowerCase() === city.toLowerCase());
        if (initialCity) {
          setSelectedCityCode(initialCity.code);
        }
      } catch (error) {
        setLocationError('Could not load city list from API.');
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    if (!selectedCityCode) {
      setBarangays([]);
      return;
    }

    const fetchBarangays = async () => {
      setLocationError('');
      try {
        const response = await fetch(`${PSGC_BASE_URL}/cities-municipalities/${selectedCityCode}/barangays/`);
        if (!response.ok) throw new Error('Failed to fetch barangays');
        const data = await response.json();
        setBarangays(data);

        const initialBarangay = data.find((item) => item.name.toLowerCase() === barangay.toLowerCase());
        if (initialBarangay) {
          setSelectedBarangayCode(initialBarangay.code);
        }
      } catch (error) {
        setLocationError('Could not load barangay list from API.');
      }
    };

    fetchBarangays();
  }, [selectedCityCode]);

  const handleCityChange = (event) => {
    const cityCode = event.target.value;
    setSelectedCityCode(cityCode);
    setSelectedBarangayCode('');

    const selectedCity = cities.find((item) => item.code === cityCode);
    setCity(selectedCity ? selectedCity.name : '');
    setBarangay('');
  };

  const handleBarangayChange = (event) => {
    const barangayCode = event.target.value;
    setSelectedBarangayCode(barangayCode);

    const selectedBarangay = barangays.find((item) => item.code === barangayCode);
    setBarangay(selectedBarangay ? selectedBarangay.name : '');
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Please complete all password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordError('');
    setSuccessMessage('Password updated successfully.');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2400);

    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleSavePersonalInfo = () => {
    if (!email.trim() || !phone.trim()) {
      setLocationError('Email and phone are required before saving changes.');
      return;
    }

    setLocationError('');
    setSuccessMessage('Personal information saved successfully.');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2400);
  };

  return (
    <div className="account-settings-page">
      <div className="account-settings-card">
        <button className="back-profile-btn" onClick={onBackToProfile}>
          ← Back to Profile
        </button>

        <h1>Account & Privacy Settings</h1>
        <p className="account-owner">Managing account for: {profileName}</p>

        <section className="settings-section">
          <h2>Personal Info</h2>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />

          <label htmlFor="city">City (Bulacan API)</label>
          <select id="city" value={selectedCityCode} onChange={handleCityChange}>
            <option value="">Select city</option>
            {cities.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>

          <label htmlFor="barangay">Barangay</label>
          <select
            id="barangay"
            value={selectedBarangayCode}
            onChange={handleBarangayChange}
            disabled={!selectedCityCode}
          >
            <option value="">{selectedCityCode ? 'Select barangay' : 'Select city first'}</option>
            {barangays.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>

          {locationError && <p className="error-text">{locationError}</p>}

          <button className="primary-action-btn" onClick={handleSavePersonalInfo}>
            Save Changes
          </button>
        </section>

        <section className="settings-section">
          <h2>Privacy & Security</h2>

          <label htmlFor="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />

          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          <label htmlFor="confirmNewPassword">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(event) => setConfirmNewPassword(event.target.value)}
          />

          {passwordError && <p className="error-text">{passwordError}</p>}

          <button className="primary-action-btn" onClick={handlePasswordUpdate}>
            Update Password
          </button>
        </section>

      </div>

      {showSuccessToast && (
        <div className="success-toast">{successMessage}</div>
      )}
    </div>
  );
}

export default AccountSettings;
