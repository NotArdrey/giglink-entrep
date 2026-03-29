import {
  Dashboard,
  MyBookings,
  MyWork,
  Profile,
  AccountSettings,
  Settings,
  WorkerDashboard,
} from '../index';

// Map each view to its component and required props
export const viewMap = {
  'client-dashboard': {
    component: Dashboard,
    propsBuilder: (context) => ({
      onLogout: context.handleLogout,
      onBecomeSeller: context.handleOpenSellerOnboarding,
      onOpenMyBookings: context.handleOpenMyBookings,
      sellerProfile: context.sellerProfile,
      onOpenMyWork: context.handleOpenMyWork,
      onOpenProfile: context.handleOpenProfile,
      onOpenAccountSettings: context.handleOpenAccountSettings,
      onOpenSettings: context.handleOpenSettings,
    }),
  },
  'my-bookings': {
    component: MyBookings,
    propsBuilder: (context) => ({
      onGoHome: context.handleBackToClientDashboard,
      onLogout: context.handleLogout,
      onOpenSellerSetup: context.handleOpenSellerOnboarding,
      onOpenMyWork: context.handleOpenMyWork,
      sellerProfile: context.sellerProfile,
      onOpenProfile: context.handleOpenProfile,
      onOpenAccountSettings: context.handleOpenAccountSettings,
      onOpenSettings: context.handleOpenSettings,
    }),
  },
  'profile': {
    component: Profile,
    propsBuilder: (context) => ({
      sellerProfile: context.sellerProfile,
      userLocation: context.userLocation,
      onManageAccount: context.handleOpenAccountSettings,
      onBackToDashboard: context.handleBackToClientDashboard,
      onUpdateProfile: context.handleProfileUpdate,
    }),
  },
  'account-settings': {
    component: AccountSettings,
    propsBuilder: (context) => ({
      sellerProfile: context.sellerProfile,
      userLocation: context.userLocation,
      onBackToProfile: context.handleOpenProfile,
    }),
  },
  'settings': {
    component: Settings,
    propsBuilder: (context) => ({
      onBack: context.handleBackFromSettings,
      appTheme: context.appTheme,
      themeMode: context.themeMode,
      appLanguage: context.appLanguage,
      onThemeChange: context.handleThemeChange,
      onLanguageChange: context.handleLanguageChange,
    }),
  },
  'my-work': {
    component: MyWork,
    propsBuilder: (context) => ({
      sellerProfile: context.sellerProfile,
      onBackToDashboard: context.handleBackToClientDashboard,
      onLogout: context.handleLogout,
    }),
  },
  'worker-dashboard': {
    component: WorkerDashboard,
    propsBuilder: (context) => ({
      sellerProfile: context.sellerProfile,
      onBackToClient: context.handleBackToClientDashboard,
      onLogout: context.handleLogout,
    }),
  },
};

/**
 * Renders the correct view based on currentView and application context
 * @param {string} currentView - The current view key
 * @param {object} context - Navigation context with all state and handlers
 * @returns {JSX.Element} The rendered view component or null
 */
export const renderView = (currentView, context) => {
  const viewConfig = viewMap[currentView];

  if (!viewConfig) {
    // Fallback to client-dashboard if view not found
    return renderView('client-dashboard', context);
  }

  const { component: Component, propsBuilder } = viewConfig;
  const props = propsBuilder(context);

  return <Component {...props} />;
};
