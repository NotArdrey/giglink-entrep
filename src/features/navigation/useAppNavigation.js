import { useState, useEffect } from 'react';
import { supabase } from '../../shared/services/supabaseClient';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  syncAuthenticatedUserProfile,
  syncWorkerSetup,
  resendSignupVerificationEmail,
  sendPasswordResetEmail,
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

const isProfilesTableApiError = (error) => {
  const message = String(error?.message || '');
  return /table public\.profiles is not available to the API yet/i.test(message)
    || /Could not find the table 'public\.profiles' in the schema cache/i.test(message);
};

const buildAuthOnlyProfile = (user, source = {}) => {
  const metadata = user?.user_metadata || {};
  const email = user?.email || source?.email || '';
  const province = source?.province || metadata?.province || '';
  const city = source?.city || metadata?.city || '';
  const barangay = source?.barangay || metadata?.barangay || '';
  const address = source?.address || metadata?.address || '';

  return {
    userId: user?.id || null,
    fullName: source?.name || metadata?.full_name || metadata?.name || (email ? email.split('@')[0] : 'GigLink User'),
    email,
    phoneNumber: source?.phoneNumber || metadata?.phone_number || '',
    profilePhoto: source?.profilePhoto || metadata?.profile_photo || '',
    bio: source?.bio || metadata?.bio || '',
    province,
    city,
    barangay,
    address,
    location: { province, city, barangay, address },
    isClient: true,
    isWorker: false,
  };
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

    let profile = source && source.userId ? source : null;
    if (!profile) {
      try {
        profile = await syncAuthenticatedUserProfile(user, source);
      } catch (error) {
        if (!isProfilesTableApiError(error)) {
          throw error;
        }

        // Keep login usable even if profile table API is temporarily unavailable.
        profile = buildAuthOnlyProfile(user, source);
        showErrorNotification('Logged in with limited profile mode. Database profile table is not reachable yet.');
      }
    }

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
          let profile;
          try {
            profile = await syncAuthenticatedUserProfile(sessionUser);
          } catch (profileError) {
            if (!isProfilesTableApiError(profileError)) {
              throw profileError;
            }
            profile = buildAuthOnlyProfile(sessionUser);
          }

          setAuthUser(sessionUser);
          setSellerProfile(profile);
          setUserLocation(profile?.location || null);
          setIsLoggedIn(true);
          setCurrentView('client-dashboard');
          if (!isMounted) return;
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
    try {
      if (isLoginMode) {
        const user = await signInWithEmail({
          email: formData.email,
          password: formData.password,
        });
        // Only show the loading screen AFTER we know auth succeeded
        setIsLoadingTransition(true);
        const result = await hydrateAuthenticatedUser(user);
        showSuccessNotification('Welcome back! You have successfully logged in.');
        setIsLoadingTransition(false);
        return result;
      }

      const result = await signUpWithEmail(formData);

      if (result.requiresEmailVerification) {
        showSuccessNotification('Account created. Please verify your email first, then log in.');
        return result.user;
      }

      // Only show the loading screen AFTER we know signup succeeded
      setIsLoadingTransition(true);
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
      setIsLoadingTransition(false);
      return result.user;
    } catch (error) {
      setIsLoadingTransition(false);
      setIsLoggedIn(false);
      setAuthUser(null);
      throw error;
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

  const handleResendVerification = async (email) => {
    await resendSignupVerificationEmail(email);
    showSuccessNotification('Verification email sent. Please check your inbox.');
  };

  const handleForgotPasswordSubmit = async (email) => {
    await sendPasswordResetEmail(email);
    showSuccessNotification('Password reset link sent. Please check your inbox.');
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
    handleResendVerification,
    handleForgotPasswordSubmit,
    handleOpenResetPassword,
    handleBackToLogin,
    showSuccessNotification,
    hideSuccessNotification,
    showErrorNotification,
    hideErrorNotification,
  };
};
