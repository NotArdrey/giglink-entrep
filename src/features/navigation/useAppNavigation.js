import { useState, useEffect } from 'react';
import { supabase } from '../../shared/services/supabaseClient';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  syncAuthenticatedUserProfile,
  syncWorkerSetup,
} from '../../shared/services/gigadvanceAuth';

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
  const [isLoadingTransition, setIsLoadingTransition] = useState(true);
  const [authUser, setAuthUser] = useState(null);
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
  const [successNotification, setSuccessNotification] = useState({ isVisible: false, message: '' });
  const [errorNotification, setErrorNotification] = useState({ isVisible: false, message: '' });

  const hydrateAuthenticatedUser = async (user, source = {}) => {
    if (!user) return null;

    const profile = source && source.userId
      ? source
      : await syncAuthenticatedUserProfile(user, source);

    setAuthUser(user);
    setSellerProfile(profile);
    setUserLocation(profile?.location || null);
    setIsLoggedIn(true);
    setCurrentView('client-dashboard');
    return profile;
  };

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

  // Authentication bootstrap effect
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const sessionUser = data.session?.user || null;
        if (!isMounted) return;

        if (sessionUser) {
          const profile = await syncAuthenticatedUserProfile(sessionUser);

          if (!isMounted) return;
          setAuthUser(sessionUser);
          setSellerProfile(profile);
          setUserLocation(profile?.location || null);
          setIsLoggedIn(true);
          setCurrentView('client-dashboard');
        }
      } catch (error) {
        console.error('Unable to restore Supabase session:', error);
        if (isMounted) {
          setIsLoggedIn(false);
          setAuthUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingTransition(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handler functions
  const showSuccessNotification = (message) => {
    setSuccessNotification({ isVisible: true, message });
  };

  const hideSuccessNotification = () => {
    setSuccessNotification({ isVisible: false, message: '' });
  };

  const showErrorNotification = (message) => {
    setErrorNotification({ isVisible: true, message });
  };

  const hideErrorNotification = () => {
    setErrorNotification({ isVisible: false, message: '' });
  };

  const handleLogin = async (formData, isLoginMode = true) => {
    setIsLoadingTransition(true);

    try {
      if (isLoginMode) {
        const user = await signInWithEmail({
          email: formData.email,
          password: formData.password,
        });
        const profile = await syncAuthenticatedUserProfile(user);
        const result = await hydrateAuthenticatedUser(user, profile);
        showSuccessNotification('Welcome back! You have successfully logged in.');
        return result;
      }

      const result = await signUpWithEmail(formData);
      await hydrateAuthenticatedUser(result.user, result.profile || {
        userId: result.user.id,
        fullName: formData.name,
        email: formData.email,
        location: {
          province: formData.province,
          city: formData.city,
          barangay: formData.barangay,
          address: formData.address,
        },
        isWorker: false,
      });
      showSuccessNotification('Account created successfully! Welcome to GigLink.');
      return result.user;
    } catch (error) {
      setIsLoggedIn(false);
      setAuthUser(null);
      showErrorNotification(error?.message || 'Authentication failed. Please try again.');
      throw error;
    } finally {
      setIsLoadingTransition(false);
    }
  };

  const handleLogout = async () => {
    setIsLoadingTransition(true);

    try {
      await signOutUser();
    } catch (error) {
      console.error('Supabase sign out failed:', error);
    } finally {
      setIsLoggedIn(false);
      setAuthUser(null);
      setSellerProfile(null);
      setUserLocation(null);
      setIsSellerOnboardingOpen(false);
      setCurrentView('client-dashboard');
      setIsLoadingTransition(false);
    }
  };

  const handleOpenSellerOnboarding = () => {
    setIsSellerOnboardingOpen(true);
  };

  const handleOnboardingComplete = async (profileData, destination = 'my-work') => {
    const userId = authUser?.id || sellerProfile?.userId;
    if (!userId) return;

    const mergedProfile = await syncWorkerSetup(userId, profileData);
    setSellerProfile(mergedProfile);
    setUserLocation(mergedProfile?.location || null);
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

  const handleProfileUpdate = async (updatedProfileFields) => {
    const currentUser = authUser || {
      id: sellerProfile?.userId,
      email: sellerProfile?.email,
      user_metadata: {},
    };

    if (!currentUser?.id) return;

    const mergedProfile = await syncAuthenticatedUserProfile(currentUser, {
      ...sellerProfile,
      ...updatedProfileFields,
      name: updatedProfileFields.fullName || sellerProfile?.fullName,
    });

    setSellerProfile((prev) => ({
      ...(prev || {}),
      ...(mergedProfile || {}),
      ...updatedProfileFields,
    }));
    setUserLocation((prev) => ({
      ...(prev || {}),
      province: updatedProfileFields.province ?? prev?.province ?? sellerProfile?.province ?? '',
      city: updatedProfileFields.city ?? prev?.city ?? sellerProfile?.city ?? '',
      barangay: updatedProfileFields.barangay ?? prev?.barangay ?? sellerProfile?.barangay ?? '',
      address: updatedProfileFields.address ?? prev?.address ?? sellerProfile?.address ?? '',
    }));
  };

  const handleBackToClientDashboard = () => {
    setCurrentView('client-dashboard');
  };

  const handleOpenMyBookings = () => {
    setCurrentView('my-bookings');
  };

  const handleOpenMyWork = () => {
    if (!sellerProfile?.isWorker) {
      setIsSellerOnboardingOpen(true);
      return;
    }

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
    successNotification,
    errorNotification,

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
    showSuccessNotification,
    hideSuccessNotification,
    showErrorNotification,
    hideErrorNotification,
  };
};
