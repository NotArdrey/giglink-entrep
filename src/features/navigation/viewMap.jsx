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
      appTheme: context.appTheme,
      currentView: context.currentView,
      searchQuery: context.currentSearchQuery || '',
      onSearchChange: context.handleSearchChange || (() => {}),
      onLogout: context.handleLogout,
      onBecomeSeller: context.handleOpenSellerOnboarding,
      onOpenMyBookings: context.handleOpenMyBookings,
      sellerProfile: context.sellerProfile,
      onOpenMyWork: context.handleOpenMyWork,
      onOpenProfile: context.handleOpenProfile,
      onOpenAccountSettings: context.handleOpenAccountSettings,
      onOpenSettings: context.handleOpenSettings,
      onOpenSellerSetup: context.handleOpenSellerOnboarding,
      onOpenDashboard: context.handleBackToClientDashboard,
    }),
  },
  'my-bookings': {
    component: MyBookings,
    propsBuilder: (context) => ({
      appTheme: context.appTheme,
      currentView: context.currentView,
      searchQuery: context.currentSearchQuery || '',
      onSearchChange: context.handleSearchChange || (() => {}),
      onGoHome: context.handleBackToClientDashboard,
      onLogout: context.handleLogout,
      onOpenSellerSetup: context.handleOpenSellerOnboarding,
      onOpenMyWork: context.handleOpenMyWork,
      sellerProfile: context.sellerProfile,
      onOpenProfile: context.handleOpenProfile,
      onOpenAccountSettings: context.handleOpenAccountSettings,
      onOpenSettings: context.handleOpenSettings,
      onOpenMyBookings: context.handleOpenMyBookings,
      onOpenDashboard: context.handleBackToClientDashboard,
    }),
  },
  'profile': {
    component: Profile,
    propsBuilder: (context) => ({
      appTheme: context.appTheme,
      currentView: context.currentView,
      searchQuery: context.currentSearchQuery || '',
      onSearchChange: context.handleSearchChange || (() => {}),
      onLogout: context.handleLogout,
      onOpenSellerSetup: context.handleOpenSellerOnboarding,
      onOpenMyBookings: context.handleOpenMyBookings,
      sellerProfile: context.sellerProfile,
      onOpenMyWork: context.handleOpenMyWork,
      onOpenProfile: context.handleOpenProfile,
      onOpenAccountSettings: context.handleOpenAccountSettings,
      onOpenSettings: context.handleOpenSettings,
      userLocation: context.userLocation,
      onManageAccount: context.handleOpenAccountSettings,
      onBackToDashboard: context.handleBackToClientDashboard,
      onUpdateProfile: context.handleProfileUpdate,
      onOpenDashboard: context.handleBackToClientDashboard,
    }),
  },
  'account-settings': {
    component: AccountSettings,
    propsBuilder: (context) => ({
      appTheme: context.appTheme,
      currentView: context.currentView,
      searchQuery: context.currentSearchQuery || '',
      onSearchChange: context.handleSearchChange || (() => {}),
      onLogout: context.handleLogout,
      onOpenSellerSetup: context.handleOpenSellerOnboarding,
      onOpenMyBookings: context.handleOpenMyBookings,
      sellerProfile: context.sellerProfile,
      onOpenMyWork: context.handleOpenMyWork,
      onOpenProfile: context.handleOpenProfile,
      onOpenAccountSettings: context.handleOpenAccountSettings,
      onOpenSettings: context.handleOpenSettings,
      userLocation: context.userLocation,
      onBackToProfile: context.handleOpenProfile,
      onOpenDashboard: context.handleBackToClientDashboard,
    }),
  },
  'settings': {
    component: Settings,
    propsBuilder: (context) => ({
      appTheme: context.appTheme,
      currentView: context.currentView,
      searchQuery: context.currentSearchQuery || '',
      onSearchChange: context.handleSearchChange || (() => {}),
      onLogout: context.handleLogout,
      onOpenSellerSetup: context.handleOpenSellerOnboarding,
      onOpenMyBookings: context.handleOpenMyBookings,
      sellerProfile: context.sellerProfile,
      onOpenMyWork: context.handleOpenMyWork,
      onOpenProfile: context.handleOpenProfile,
      onOpenAccountSettings: context.handleOpenAccountSettings,
      onOpenSettings: context.handleOpenSettings,
      onBack: context.handleBackFromSettings,
      themeMode: context.themeMode,
      appLanguage: context.appLanguage,
      onThemeChange: context.handleThemeChange,
      onLanguageChange: context.handleLanguageChange,
      onOpenDashboard: context.handleBackToClientDashboard,
    }),
  },
  'my-work': {
    component: MyWork,
    propsBuilder: (context) => ({
      appTheme: context.appTheme,
      currentView: context.currentView,
      searchQuery: context.currentSearchQuery || '',
      onSearchChange: context.handleSearchChange || (() => {}),
      onLogout: context.handleLogout,
      onOpenSellerSetup: context.handleOpenSellerOnboarding,
      onOpenMyBookings: context.handleOpenMyBookings,
      sellerProfile: context.sellerProfile,
      onOpenMyWork: context.handleOpenMyWork,
      onOpenProfile: context.handleOpenProfile,
      onOpenAccountSettings: context.handleOpenAccountSettings,
      onOpenSettings: context.handleOpenSettings,
      onBackToDashboard: context.handleBackToClientDashboard,
      onAddNewWork: context.handleOpenSellerOnboarding,
      onOpenDashboard: context.handleBackToClientDashboard,
    }),
  },
  'worker-dashboard': {
    component: WorkerDashboard,
    propsBuilder: (context) => ({
      appTheme: context.appTheme,
      currentView: context.currentView,
      searchQuery: context.currentSearchQuery || '',
      onSearchChange: context.handleSearchChange || (() => {}),
      onLogout: context.handleLogout,
      onOpenSellerSetup: context.handleOpenSellerOnboarding,
      onOpenMyBookings: context.handleOpenMyBookings,
      sellerProfile: context.sellerProfile,
      onOpenMyWork: context.handleOpenMyWork,
      onOpenProfile: context.handleOpenProfile,
      onOpenAccountSettings: context.handleOpenAccountSettings,
      onOpenSettings: context.handleOpenSettings,
      onBackToClient: context.handleBackToClientDashboard,
      onOpenDashboard: context.handleBackToClientDashboard,
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
