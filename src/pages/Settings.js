import React, { useState } from 'react';
import '../styles/Settings.css';

/**
 * Settings Page - General Settings Section
 *
 * Global Mode Integration:
 * - Theme and language are controlled at App level and passed as props.
 * - This allows one setting change to affect all pages.
 * - Save action gives user feedback while app-level persistence happens immediately.
 */

const Settings = ({
  onBack,
  appTheme = 'light',
  themeMode = 'system',
  appLanguage = 'en',
  onThemeChange,
  onLanguageChange,
}) => {
  // ============ STATE MANAGEMENT ============

  const isDarkMode = appTheme === 'dark';
  const language = appLanguage === 'fil' ? 'fil' : 'en';
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  
  // Save feedback
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // ============ TRANSLATIONS OBJECT ============
  
  /**
   * Language mapping object for English and Filipino translations
   * Structure: translations[languageCode][labelKey]
   * Add new languages by extending this object with new language codes
   */
  const translations = {
    en: {
      title: 'Preferences',
      subtitle: 'Manage your preferences and account options',
      backButton: '← Back',
      generalSettings: 'General Preferences',
      settingsSubtitle: 'Customize your experience',
      language: 'Language',
      languageDesc: 'Choose your preferred language for the app',
      english: 'English',
      tagalog: 'Filipino (Tagalog)',
      theme: 'Theme',
      themeDesc: 'Choose between light and dark mode',
      followSystem: 'Use Device Appearance',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      notifications: 'Notifications',
      notificationsDesc: 'Manage your notification preferences',
      emailNotifications: 'Email Notifications',
      emailDesc: 'Receive notification updates via email',
      smsAlerts: 'SMS Alerts',
      smsDesc: 'Receive important alerts via SMS',
      saveButton: 'Save Changes',
      savingButton: 'Saving...',
      saveSuccess: 'Settings saved successfully!',
      on: 'On',
      off: 'Off',
    },
    fil: {
      title: 'Mga Preference',
      subtitle: 'Pamahalaan ang iyong mga preference at opsyon ng account',
      backButton: '← Bumalik',
      generalSettings: 'Pangkalahatang Preference',
      settingsSubtitle: 'I-customize ang iyong karanasan',
      language: 'Wika',
      languageDesc: 'Piliin ang iyong ginustong wika para sa app',
      english: 'English',
      tagalog: 'Filipino (Tagalog)',
      theme: 'Tema',
      themeDesc: 'Pumili sa pagitan ng light at dark mode',
      followSystem: 'Gamitin ang Tema ng Device',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      notifications: 'Mga Notification',
      notificationsDesc: 'Pamahalaan ang iyong mga kagustuhan sa notification',
      emailNotifications: 'Email Notifications',
      emailDesc: 'Makatanggap ng notification updates sa pamamagitan ng email',
      smsAlerts: 'SMS Alerts',
      smsDesc: 'Makatanggap ng mahalagang alerto sa pamamagitan ng SMS',
      saveButton: 'I-save ang Mga Pagbabago',
      savingButton: 'I-save...',
      saveSuccess: 'Matagumpay na na-save ang mga setting!',
      on: 'On',
      off: 'Off',
    },
  };
  
  // Get current translation object
  const t = translations[language];
  
  // ============ EVENT HANDLERS ============

  const handleLanguageChange = (e) => {
    if (onLanguageChange) {
      onLanguageChange(e.target.value);
    }
  };

  const handleThemeToggle = () => {
    if (onThemeChange) {
      onThemeChange(isDarkMode ? 'light' : 'dark');
    }
  };
  
  const handleEmailToggle = () => {
    setEmailNotifications(!emailNotifications);
  };
  
  const handleSmsToggle = () => {
    setSmsAlerts(!smsAlerts);
  };
  
  const handleSave = () => {
    setSaveMessage('');
    setIsSaving(true);

    // Theme/language persist immediately in App; this only confirms to users.
    setTimeout(() => {
      setSaveMessage(t.saveSuccess);
      setIsSaving(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    }, 800);
  };
  
  // ============ RENDER ============
  
  return (
    <div className={`settings-page ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Header with Back Button */}
      <div className="settings-header">
        <button className="settings-back-btn" onClick={onBack}>
          {t.backButton}
        </button>
        <h1 className="settings-title">{t.title}</h1>
        <div style={{ width: '100px' }}></div>
      </div>

      {/* Main Content */}
      <main className="settings-main">
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>{t.generalSettings}</h2>
            <p className="settings-card-subtitle">{t.settingsSubtitle}</p>
          </div>

          <div className="settings-content">
            {/* LANGUAGE SECTION */}
            <div className="settings-section">
              <div className="section-title">
                <h3>{t.language}</h3>
                <p className="section-desc">{t.languageDesc}</p>
              </div>

              <div className="setting-item">
                <select
                  className="language-select"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="en">{t.english}</option>
                  <option value="fil">{t.tagalog}</option>
                </select>
                <span className={`language-indicator ${language === 'en' ? 'english' : 'tagalog'}`}>
                  {language === 'en' ? '🇺🇸' : '🇵🇭'}
                </span>
              </div>
            </div>

            {/* THEME SECTION */}
            <div className="settings-section">
              <div className="section-title">
                <h3>{t.theme}</h3>
                <p className="section-desc">{t.themeDesc}</p>
              </div>

              <div className="theme-toggle-container">
                <div className="theme-option">
                  <span className="theme-icon light">☀️</span>
                  <span>{t.lightMode}</span>
                </div>

                <label className="theme-switch">
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={handleThemeToggle}
                  />
                  <span className="slider"></span>
                </label>

                <div className="theme-option">
                  <span className="theme-icon dark">🌙</span>
                  <span>{t.darkMode}</span>
                </div>
              </div>

              <button
                type="button"
                className={`system-theme-btn ${themeMode === 'system' ? 'active' : ''}`}
                onClick={() => onThemeChange && onThemeChange('system')}
              >
                {t.followSystem}
              </button>
            </div>

            {/* NOTIFICATIONS SECTION */}
            <div className="settings-section">
              <div className="section-title">
                <h3>{t.notifications}</h3>
                <p className="section-desc">{t.notificationsDesc}</p>
              </div>

              {/* Email Notifications Toggle */}
              <div className="notification-item">
                <div className="notification-info">
                  <label htmlFor="email-toggle" className="notification-label">
                    {t.emailNotifications}
                  </label>
                  <p className="notification-desc">{t.emailDesc}</p>
                </div>
                <label className="toggle-switch">
                  <input
                    id="email-toggle"
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={handleEmailToggle}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {emailNotifications ? t.on : t.off}
                  </span>
                </label>
              </div>

              {/* SMS Alerts Toggle */}
              <div className="notification-item">
                <div className="notification-info">
                  <label htmlFor="sms-toggle" className="notification-label">
                    {t.smsAlerts}
                  </label>
                  <p className="notification-desc">{t.smsDesc}</p>
                </div>
                <label className="toggle-switch">
                  <input
                    id="sms-toggle"
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={handleSmsToggle}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {smsAlerts ? t.on : t.off}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className="save-success-message">
              ✅ {saveMessage}
            </div>
          )}

          {/* Save Button */}
          <div className="settings-footer">
            <button className="save-changes-btn" onClick={handleSave} disabled={isSaving}>
              {isSaving ? t.savingButton : t.saveButton}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
