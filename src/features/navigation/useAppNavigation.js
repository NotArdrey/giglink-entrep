import { useState, useEffect } from 'react';

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

export const useAppNavigation = () => {
  // State management
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
  const [appLanguage, setAppLanguage] = useState(
    () => localStorage.getItem('giglink-language') || 'en'
  );
  const [isSellerOnboardingOpen, setIsSellerOnboardingOpen] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [resetEmail, setResetEmail] = useState(null);

  // Theme effect
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

  // Dark theme class effect
  useEffect(() => {
    const isDarkTheme = appTheme === 'dark';
    document.body.classList.toggle('app-theme-dark', isDarkTheme);
    document.body.classList.toggle('app-theme-light', !isDarkTheme);
  }, [appTheme]);

  // Language effect
  useEffect(() => {
    localStorage.setItem('giglink-language', appLanguage);
    document.documentElement.lang = appLanguage === 'fil' ? 'fil' : 'en';
  }, [appLanguage]);

  // Handler functions
  const handleLogin = (formData) => {
    setIsLoadingTransition(true);

    if (formData && formData.province) {
      setUserLocation({
        province: formData.province,
        city: formData.city,
        barangay: formData.barangay,
        address: formData.address,
      });
    }

    setTimeout(() => {
      setIsLoggedIn(true);
      setCurrentView('client-dashboard');
      setIsLoadingTransition(false);
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoadingTransition(true);

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

  const handleOpenForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handleOpenResetPassword = (token, email) => {
    setResetToken(token);
    setResetEmail(email);
    setCurrentView('reset-password');
  };

  const handleBackToLogin = () => {
    setCurrentView('client-dashboard');
    setResetToken(null);
    setResetEmail(null);
  };

  return {
    // State
    isLoggedIn,
    isLoadingTransition,
    currentView,
    previousView,
    sellerProfile,
    userLocation,
    themeMode,
    appTheme,
    appLanguage,
    isSellerOnboardingOpen,
    resetToken,
    resetEmail,

    // Handlers
    handleLogin,
    handleLogout,
    handleOpenSellerOnboarding,
    handleOnboardingComplete,
    handleCloseSellerOnboarding,
    handleProfileUpdate,
    handleBackToClientDashboard,
    handleOpenMyBookings,
    handleOpenMyWork,
    handleOpenProfile,
    handleOpenAccountSettings,
    handleOpenSettings,
    handleBackFromSettings,
    handleThemeChange,
    handleLanguageChange,
    handleOpenForgotPassword,
    handleOpenResetPassword,
    handleBackToLogin,
  };
};
