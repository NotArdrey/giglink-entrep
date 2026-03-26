import { useEffect, useState } from 'react';


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
  const [hoveredButton, setHoveredButton] = useState('');

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

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '1rem',
    },
    card: {
      width: 'min(96vw, 760px)',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.8rem',
      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    backButton: {
      border: '1px solid #cbd5e1',
      borderRadius: '0.5rem',
      backgroundColor: '#ffffff',
      padding: '0.5rem 0.7rem',
      cursor: 'pointer',
      width: 'fit-content',
      fontWeight: 600,
    },
    ownerText: { margin: 0, color: '#64748b' },
    section: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.65rem',
      padding: '0.9rem',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.45rem',
    },
    input: {
      border: '1px solid #cbd5e1',
      borderRadius: '0.45rem',
      padding: '0.5rem 0.58rem',
      backgroundColor: '#ffffff',
      fontSize: '0.95rem',
    },
    errorText: {
      color: '#b91c1c',
      backgroundColor: '#fee2e2',
      borderRadius: '0.4rem',
      padding: '0.35rem 0.5rem',
      margin: 0,
      fontSize: '0.9rem',
    },
    actionButton: {
      border: 'none',
      borderRadius: '0.5rem',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      padding: '0.58rem 0.85rem',
      fontWeight: 700,
      cursor: 'pointer',
      width: 'fit-content',
      marginTop: '0.2rem',
    },
    toast: {
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      borderRadius: '0.6rem',
      backgroundColor: '#16a34a',
      color: '#ffffff',
      padding: '0.65rem 0.95rem',
      fontWeight: 700,
      zIndex: 200,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button style={styles.backButton} onClick={onBackToProfile}>
          ← Back to Profile
        </button>

        <h1>Account & Privacy Settings</h1>
        <p style={styles.ownerText}>Managing account for: {profileName}</p>

        <section style={styles.section}>
          <h2>Personal Info</h2>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={styles.input}
          />

          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            style={styles.input}
          />

          <label htmlFor="city">City (Bulacan API)</label>
          <select id="city" value={selectedCityCode} onChange={handleCityChange} style={styles.input}>
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
            style={styles.input}
          >
            <option value="">{selectedCityCode ? 'Select barangay' : 'Select city first'}</option>
            {barangays.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>

          {locationError && <p style={styles.errorText}>{locationError}</p>}

          <button
            style={{ ...styles.actionButton, backgroundColor: hoveredButton === 'save-personal' ? '#1d4ed8' : '#2563eb' }}
            onMouseEnter={() => setHoveredButton('save-personal')}
            onMouseLeave={() => setHoveredButton('')}
            onClick={handleSavePersonalInfo}
          >
            Save Changes
          </button>
        </section>

        <section style={styles.section}>
          <h2>Privacy & Security</h2>

          <label htmlFor="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            style={styles.input}
          />

          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            style={styles.input}
          />

          <label htmlFor="confirmNewPassword">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(event) => setConfirmNewPassword(event.target.value)}
            style={styles.input}
          />

          {passwordError && <p style={styles.errorText}>{passwordError}</p>}

          <button
            style={{ ...styles.actionButton, backgroundColor: hoveredButton === 'update-password' ? '#1d4ed8' : '#2563eb' }}
            onMouseEnter={() => setHoveredButton('update-password')}
            onMouseLeave={() => setHoveredButton('')}
            onClick={handlePasswordUpdate}
          >
            Update Password
          </button>
        </section>

      </div>

      {showSuccessToast && (
        <div style={styles.toast}>{successMessage}</div>
      )}
    </div>
  );
}

export default AccountSettings;
