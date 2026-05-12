import { useEffect, useMemo, useRef, useState } from 'react';
import DashboardNavigation from '../../../shared/components/DashboardNavigation';
import { getThemeTokens } from '../../../shared/styles/themeTokens';


const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';
const BULACAN_CODE = '031400000';

/**
 * Navigation Flow:
 * - Opened from Profile page via "Manage Account & Privacy".
 * - "<- Back to Profile" returns users to Profile Hub.
 *
 * Security Validation Logic:
 * - Password update checks if New Password and Confirm New Password match.
 * - If mismatch: show red error message.
 * - If match: clear error and show success toast notification.
 */
function AccountSettings({ appTheme = 'light', themeMode = 'system', onThemeChange, currentView, searchQuery, onSearchChange, onLogout, onOpenSellerSetup, onOpenMyBookings, sellerProfile, onOpenMyWork, onOpenProfile, onOpenAccountSettings, onOpenSettings, onOpenDashboard, onOpenBrowseServices, userLocation, onBackToProfile, onUpdateProfile, onUpdatePassword, onOpenAdminDashboard }) {
  const splitNameParts = (value = '') => {
    const parts = String(value).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: '', middleName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], middleName: '', lastName: '' };
    if (parts.length === 2) return { firstName: parts[0], middleName: '', lastName: parts[1] };
    return { firstName: parts[0], middleName: parts.slice(1, -1).join(' '), lastName: parts.at(-1) };
  };
  const buildDisplayName = ({ firstName = '', middleName = '', lastName = '' } = {}) => [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
  const initialNameParts = sellerProfile?.firstName || sellerProfile?.middleName || sellerProfile?.lastName
    ? { firstName: sellerProfile?.firstName || '', middleName: sellerProfile?.middleName || '', lastName: sellerProfile?.lastName || '' }
    : splitNameParts(sellerProfile?.fullName || 'Juan Dela Cruz');
  const profileName = buildDisplayName(initialNameParts) || 'Juan Dela Cruz';
  const initialCityRef = useRef(userLocation?.city || sellerProfile?.city || '');
  const initialBarangayRef = useRef(userLocation?.barangay || sellerProfile?.barangay || '');
  const [email, setEmail] = useState(sellerProfile?.email || 'juandelacruz@email.com');
  const [phone, setPhone] = useState(sellerProfile?.phoneNumber || '09171234567');
  const [address, setAddress] = useState(userLocation?.address || sellerProfile?.address || '');
  const [firstName, setFirstName] = useState(initialNameParts.firstName);
  const [middleName, setMiddleName] = useState(initialNameParts.middleName);
  const [lastName, setLastName] = useState(initialNameParts.lastName);

  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [selectedBarangayCode, setSelectedBarangayCode] = useState('');
  const [locationError, setLocationError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const selectedCityName = useMemo(
    () => cities.find((item) => item.code === selectedCityCode)?.name || userLocation?.city || sellerProfile?.city || '',
    [cities, selectedCityCode, userLocation?.city, sellerProfile?.city]
  );
  const selectedBarangayName = useMemo(
    () => barangays.find((item) => item.code === selectedBarangayCode)?.name || userLocation?.barangay || sellerProfile?.barangay || '',
    [barangays, selectedBarangayCode, userLocation?.barangay, sellerProfile?.barangay]
  );
  const [hoveredButton, setHoveredButton] = useState('');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const themeTokens = getThemeTokens(appTheme);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const nextNameParts = sellerProfile?.firstName || sellerProfile?.middleName || sellerProfile?.lastName
      ? { firstName: sellerProfile?.firstName || '', middleName: sellerProfile?.middleName || '', lastName: sellerProfile?.lastName || '' }
      : splitNameParts(sellerProfile?.fullName || 'Juan Dela Cruz');
    setFirstName(nextNameParts.firstName);
    setMiddleName(nextNameParts.middleName);
    setLastName(nextNameParts.lastName);
    setEmail(sellerProfile?.email || 'juandelacruz@email.com');
    setPhone(sellerProfile?.phoneNumber || '09171234567');
    setAddress(userLocation?.address || sellerProfile?.address || '');
  }, [sellerProfile?.firstName, sellerProfile?.middleName, sellerProfile?.lastName, sellerProfile?.fullName, sellerProfile?.email, sellerProfile?.phoneNumber, sellerProfile?.address, userLocation?.address]);

  useEffect(() => {
    const fetchCities = async () => {
      setLocationError('');
      try {
        const response = await fetch(`${PSGC_BASE_URL}/provinces/${BULACAN_CODE}/cities-municipalities/`);
        if (!response.ok) throw new Error('Failed to fetch cities');
        const data = await response.json();
        setCities(data);

        const initialCity = data.find((item) => item.name.toLowerCase() === initialCityRef.current.toLowerCase());
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

        const initialBarangay = data.find((item) => item.name.toLowerCase() === initialBarangayRef.current.toLowerCase());
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
  };

  const handleBarangayChange = (event) => {
    const barangayCode = event.target.value;
    setSelectedBarangayCode(barangayCode);
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

    if (typeof onUpdatePassword !== 'function') {
      setPasswordError('Password update is not available right now.');
      return;
    }

    onUpdatePassword({ currentPassword, newPassword })
      .then(() => {
        setPasswordError('');
        setSuccessMessage('Password updated successfully.');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 2400);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      })
      .catch((error) => {
        setPasswordError(error?.message || 'Unable to update password.');
      });
  };

  const handleSavePersonalInfo = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setLocationError('First name and last name are required before saving changes.');
      return;
    }

    if (!phone.trim() || !address.trim()) {
      setLocationError('Phone and address are required before saving changes.');
      return;
    }

    if (typeof onUpdateProfile !== 'function') {
      setLocationError('Profile updates are not available right now.');
      return;
    }

    setLocationError('');
    onUpdateProfile({
      firstName,
      middleName,
      lastName,
      fullName: buildDisplayName({ firstName, middleName, lastName }),
      phoneNumber: phone,
      province: userLocation?.province || sellerProfile?.province || 'Bulacan',
      city: selectedCityName,
      barangay: selectedBarangayName,
      address,
    })
      .then(() => {
        setSuccessMessage('Personal information saved successfully.');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 2400);
      })
      .catch((error) => {
        setLocationError(error?.message || 'Unable to save personal information.');
      });
  };

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: themeTokens.pageBg,
      color: themeTokens.textPrimary,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      padding: isMobile ? '0.7rem' : '1rem',
      width: '100%',
      boxSizing: 'border-box',
    },
    card: {
      width: 'min(96vw, 760px)',
      backgroundColor: themeTokens.surface,
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '0.8rem',
      boxShadow: themeTokens.shadowSoft,
      padding: isMobile ? '0.8rem' : '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      margin: '0 auto',
    },
    backButton: {
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '0.5rem',
      backgroundColor: themeTokens.surface,
      color: themeTokens.textPrimary,
      padding: '0.5rem 0.7rem',
      cursor: 'pointer',
      width: 'fit-content',
      fontWeight: 600,
    },
    ownerText: { margin: 0, color: themeTokens.textSecondary },
    section: {
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '0.65rem',
      padding: isMobile ? '0.75rem' : '0.9rem',
      backgroundColor: themeTokens.surfaceAlt,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.45rem',
    },
    input: {
      border: `1px solid ${themeTokens.inputBorder}`,
      borderRadius: '0.45rem',
      padding: '0.5rem 0.58rem',
      backgroundColor: themeTokens.inputBg,
      color: themeTokens.inputText,
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
      backgroundColor: themeTokens.accent,
      color: '#ffffff',
      padding: '0.58rem 0.85rem',
      fontWeight: 700,
      cursor: 'pointer',
      width: isMobile ? '100%' : 'fit-content',
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
      width: isMobile ? 'calc(100vw - 24px)' : 'auto',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.page} data-testid="account-settings-page">
      <DashboardNavigation
        appTheme={appTheme}
        themeMode={themeMode}
        onThemeChange={onThemeChange}
        currentView={currentView}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onLogout={onLogout}
        onOpenSellerSetup={onOpenSellerSetup}
        onOpenMyBookings={onOpenMyBookings}
        sellerProfile={sellerProfile}
        onOpenMyWork={onOpenMyWork}
        onOpenProfile={onOpenProfile}
        onOpenAccountSettings={onOpenAccountSettings}
        onOpenSettings={onOpenSettings}
        onOpenDashboard={onOpenDashboard}
        onOpenBrowseServices={onOpenBrowseServices}
        isAdminView={false}
        onToggleAdminView={() => { if (typeof onOpenAdminDashboard === 'function') onOpenAdminDashboard(); }}
      />

      <div className="gl-settings-card-modern" style={styles.card}>

        <h1>Account & Privacy Settings</h1>
        <p style={styles.ownerText}>Managing account for: {profileName}</p>

        <section style={styles.section}>
          <h2>Personal Info</h2>
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            style={styles.input}
          />

          <label htmlFor="middleName">Middle Name (optional)</label>
          <input
            id="middleName"
            type="text"
            value={middleName}
            onChange={(event) => setMiddleName(event.target.value)}
            style={styles.input}
          />

          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            style={styles.input}
          />

          <label htmlFor="email">Email (from login)</label>
          <input
            id="email"
            type="email"
            value={email}
            readOnly
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

          <label htmlFor="address">Address</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
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
            style={{ ...styles.actionButton, backgroundColor: hoveredButton === 'save-personal' ? themeTokens.accentHover : themeTokens.accent }}
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
            style={{ ...styles.actionButton, backgroundColor: hoveredButton === 'update-password' ? themeTokens.accentHover : themeTokens.accent }}
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
