import { useEffect, useState } from 'react';

// Note: Conditional rendering uses isLoggedIn to switch LandingPage and Dashboard views.
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import MyWork from './pages/MyWork';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import Settings from './pages/Settings';
import SellerOnboarding from './pages/SellerOnboarding';
import WorkerDashboard from './pages/WorkerDashboard';
import LoadingScreen from './components/LoadingScreen';

const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredThemeMode = () => {
  const savedThemeMode = localStorage.getItem('giglink-theme-mode');
  return savedThemeMode === 'light' || savedThemeMode === 'dark' || savedThemeMode === 'system'
    ? savedThemeMode
    : 'system';
};

function App() {
  const styles = {
    sellerOnboardingOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      zIndex: 150,
      overflowY: 'auto',
      padding: '1rem 0',
    },
  };

  // Note: isLoggedIn controls the main page view and loading state controls transition spinner.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingTransition, setIsLoadingTransition] = useState(false);
  const [currentView, setCurrentView] = useState('client-dashboard');
  const [previousView, setPreviousView] = useState('client-dashboard');
  const [sellerProfile, setSellerProfile] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [themeMode, setThemeMode] = useState(() => getStoredThemeMode());
  const [appTheme, setAppTheme] = useState(() => {
    const initialMode = getStoredThemeMode();
    return initialMode === 'system' ? getSystemTheme() : initialMode;
  });
  const [appLanguage, setAppLanguage] = useState(() => localStorage.getItem('giglink-language') || 'en');
  const [isSellerOnboardingOpen, setIsSellerOnboardingOpen] = useState(false);

  useEffect(() => {
    const nextTheme = themeMode === 'system' ? getSystemTheme() : themeMode;

    setAppTheme(nextTheme);
    localStorage.setItem('giglink-theme-mode', themeMode);

    if (themeMode !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      setAppTheme(getSystemTheme());
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleSystemThemeChange);
      return () => mediaQueryList.removeEventListener('change', handleSystemThemeChange);
    }

    mediaQueryList.addListener(handleSystemThemeChange);
    return () => mediaQueryList.removeListener(handleSystemThemeChange);
  }, [themeMode]);

  useEffect(() => {
    const isDarkTheme = appTheme === 'dark';
    document.body.classList.toggle('app-theme-dark', isDarkTheme);
    document.body.classList.toggle('app-theme-light', !isDarkTheme);
  }, [appTheme]);

  useEffect(() => {
    localStorage.setItem('giglink-language', appLanguage);
    document.documentElement.lang = appLanguage === 'fil' ? 'fil' : 'en';
  }, [appLanguage]);

  useEffect(() => {
    // Keep full-bleed layout now that global CSS reset files are removed.
    const previousBodyMargin = document.body.style.margin;
    const previousBodyPadding = document.body.style.padding;
    const previousBodyMinWidth = document.body.style.minWidth;
    const previousBodyOverflowX = document.body.style.overflowX;
    const previousHtmlMargin = document.documentElement.style.margin;
    const previousHtmlPadding = document.documentElement.style.padding;

    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.minWidth = '320px';
    document.body.style.overflowX = 'hidden';

    return () => {
      document.documentElement.style.margin = previousHtmlMargin;
      document.documentElement.style.padding = previousHtmlPadding;
      document.body.style.margin = previousBodyMargin;
      document.body.style.padding = previousBodyPadding;
      document.body.style.minWidth = previousBodyMinWidth;
      document.body.style.overflowX = previousBodyOverflowX;
    };
  }, []);

  // Note: camelCase for event handlers
  const handleLogin = (formData) => {
    // Show loading screen during transition
    setIsLoadingTransition(true);

    // Store user registration data including location
    if (formData && formData.province) {
      setUserLocation({
        province: formData.province,
        city: formData.city,
        barangay: formData.barangay,
        address: formData.address,
      });
    }

    // Simulated transition delay set to 1.5s as requested.
    setTimeout(() => {
      setIsLoggedIn(true);
      setCurrentView('client-dashboard');
      setIsLoadingTransition(false);
    }, 1500);
  };

  const handleLogout = () => {
    // Show loading screen during transition
    setIsLoadingTransition(true);
    
    // Simulate logout delay
    setTimeout(() => {
      setIsLoggedIn(false);
      setCurrentView('client-dashboard');
      setIsLoadingTransition(false);
    }, 1500);
  };

  const handleOpenSellerOnboarding = () => {
    setIsSellerOnboardingOpen(true);
  };

  const handleOnboardingComplete = (profileData, destination = 'my-work') => {
    setSellerProfile(profileData);
    setIsSellerOnboardingOpen(false);
    if (destination === 'home') {
      setCurrentView('client-dashboard');
      return;
    }
    setCurrentView('my-work');
  };

  const handleCloseSellerOnboarding = () => {
    setIsSellerOnboardingOpen(false);
  };

  const handleProfileUpdate = (updatedProfileFields) => {
    setSellerProfile((prev) => ({
      ...(prev || {}),
      ...updatedProfileFields,
    }));
  };

  const handleBackToClientDashboard = () => {
    setCurrentView('client-dashboard');
  };

  const handleOpenMyBookings = () => {
    setCurrentView('my-bookings');
  };

  const handleOpenMyWork = () => {
    setCurrentView('my-work');
  };

  const handleOpenProfile = () => {
    setCurrentView('profile');
  };

  const handleOpenAccountSettings = () => {
    setCurrentView('account-settings');
  };

  const handleOpenSettings = () => {
    setPreviousView(currentView);
    setCurrentView('settings');
  };

  const handleBackFromSettings = () => {
    setCurrentView(previousView || 'client-dashboard');
  };

  const handleThemeChange = (nextTheme) => {
    if (nextTheme === 'system') {
      setThemeMode('system');
      return;
    }
    setThemeMode(nextTheme === 'dark' ? 'dark' : 'light');
  };

  const handleLanguageChange = (nextLanguage) => {
    setAppLanguage(nextLanguage === 'fil' ? 'fil' : 'en');
  };

  // Show loading screen if transition is active
  if (isLoadingTransition) {
    return <LoadingScreen />;
  }

  const sellerOnboardingOverlay = isSellerOnboardingOpen ? (
    <div style={styles.sellerOnboardingOverlay} role="dialog" aria-modal="true">
      <SellerOnboarding
        onBack={handleCloseSellerOnboarding}
        onComplete={handleOnboardingComplete}
        userLocation={userLocation}
        isFloating
      />
    </div>
  ) : null;

  const renderWithOnboardingOverlay = (content) => (
    <>
      {content}
      {sellerOnboardingOverlay}
    </>
  );

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} />;
  }

  if (currentView === 'my-bookings') {
    return renderWithOnboardingOverlay(
      <MyBookings
        onGoHome={handleBackToClientDashboard}
        onLogout={handleLogout}
        onOpenSellerSetup={handleOpenSellerOnboarding}
        onOpenMyWork={handleOpenMyWork}
        sellerProfile={sellerProfile}
        onOpenProfile={handleOpenProfile}
        onOpenAccountSettings={handleOpenAccountSettings}
        onOpenSettings={handleOpenSettings}
      />
    );
  }

  if (currentView === 'profile') {
    return renderWithOnboardingOverlay(
      <Profile
        sellerProfile={sellerProfile}
        userLocation={userLocation}
        onManageAccount={handleOpenAccountSettings}
        onBackToDashboard={handleBackToClientDashboard}
        onUpdateProfile={handleProfileUpdate}
      />
    );
  }

  if (currentView === 'account-settings') {
    return renderWithOnboardingOverlay(
      <AccountSettings
        sellerProfile={sellerProfile}
        userLocation={userLocation}
        onBackToProfile={handleOpenProfile}
      />
    );
  }

  if (currentView === 'settings') {
    return renderWithOnboardingOverlay(
      <Settings
        onBack={handleBackFromSettings}
        appTheme={appTheme}
        themeMode={themeMode}
        appLanguage={appLanguage}
        onThemeChange={handleThemeChange}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  if (currentView === 'my-work') {
    return renderWithOnboardingOverlay(
      <MyWork
        sellerProfile={sellerProfile}
        onBackToDashboard={handleBackToClientDashboard}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'worker-dashboard') {
    return renderWithOnboardingOverlay(
      <WorkerDashboard
        sellerProfile={sellerProfile}
        onBackToClient={handleBackToClientDashboard}
        onLogout={handleLogout}
      />
    );
  }

  return renderWithOnboardingOverlay(
    <Dashboard
      onLogout={handleLogout}
      onBecomeSeller={handleOpenSellerOnboarding}
      onOpenMyBookings={handleOpenMyBookings}
      sellerProfile={sellerProfile}
      onOpenMyWork={handleOpenMyWork}
      onOpenProfile={handleOpenProfile}
      onOpenAccountSettings={handleOpenAccountSettings}
      onOpenSettings={handleOpenSettings}
    />
  );
}

export default App;
