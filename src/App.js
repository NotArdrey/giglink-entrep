import { useEffect } from 'react';
import { LandingPage, SellerOnboarding } from './features';
import { LoadingScreen, SuccessNotification, ErrorNotification } from './shared/components';
import { useAppNavigation, renderView } from './features/navigation';

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

  // Use the navigation hook to get all state and handlers
  const navigationContext = useAppNavigation();


  // DOM setup effect - keeps full-bleed layout
  useEffect(() => {
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

  // Show loading screen if transition is active
  if (navigationContext.isLoadingTransition) {
    return <LoadingScreen />;
  }

  // Show landing page if not logged in
  if (!navigationContext.isLoggedIn) {
    return (
      <>
        <LandingPage
          onLogin={navigationContext.handleLogin}
          onResendVerification={navigationContext.handleResendVerification}
          onForgotPasswordSubmit={navigationContext.handleForgotPasswordSubmit}
        />
        <SuccessNotification
          message={navigationContext.successNotification.message}
          isVisible={navigationContext.successNotification.isVisible}
          onClose={navigationContext.hideSuccessNotification}
        />
        <ErrorNotification
          message={navigationContext.errorNotification.message}
          isVisible={navigationContext.errorNotification.isVisible}
          onClose={navigationContext.hideErrorNotification}
        />
      </>
    );
  }

  // Onboarding overlay
  const sellerOnboardingOverlay = navigationContext.isSellerOnboardingOpen ? (
    <div
      style={{
        ...styles.sellerOnboardingOverlay,
        backgroundColor: navigationContext.appTheme === 'dark' ? 'rgba(15, 23, 42, 0.65)' : styles.sellerOnboardingOverlay.backgroundColor,
      }}
      role="dialog"
      aria-modal="true"
    >
      <SellerOnboarding
        onBack={navigationContext.handleCloseSellerOnboarding}
        onComplete={navigationContext.handleOnboardingComplete}
        userLocation={navigationContext.userLocation}
        appTheme={navigationContext.appTheme}
        isFloating
      />
    </div>
  ) : null;

  const renderWithOnboardingOverlay = (content) => (
    <>
      {content}
      {sellerOnboardingOverlay}
      <SuccessNotification
        message={navigationContext.successNotification.message}
        isVisible={navigationContext.successNotification.isVisible}
        onClose={navigationContext.hideSuccessNotification}
      />
      <ErrorNotification
        message={navigationContext.errorNotification.message}
        isVisible={navigationContext.errorNotification.isVisible}
        onClose={navigationContext.hideErrorNotification}
      />
    </>
  );

  // Render current view with onboarding overlay
  return renderWithOnboardingOverlay(renderView(navigationContext.currentView, navigationContext));
}

export default App;
