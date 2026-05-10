/**
 * useAuthModalController - Controller Layer Hook for Login/Signup
 * 
 * Manages all state and logic for login/signup modal.
 * Wraps authService calls and exposes clean interface to view.
 */

import { useState, useCallback } from 'react';
import { signInWithEmail, signUpWithEmail, resendSignupVerificationEmail } from '../../../shared/services/authService';

export function useAuthModalController(onSubmitSuccess, onResendVerificationSuccess) {
  // Form state
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // Location fetch state
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);
  const [apiError, setApiError] = useState('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityMunicipalityCode, setSelectedCityMunicipalityCode] = useState('');

  /**
   * Handle form submission - calls appropriate auth function
   */
  const handleSubmit = useCallback(async (formData) => {
    setSubmitError('');
    
    try {
      setIsSubmitting(true);

      if (isLoginMode) {
        // Login flow
        const user = await signInWithEmail({
          email: formData.email,
          password: formData.password,
        });
        if (onSubmitSuccess) {
          onSubmitSuccess(user, true); // true = isLoginMode
        }
      } else {
        // Signup flow
        const result = await signUpWithEmail(formData);
        if (onSubmitSuccess) {
          onSubmitSuccess(result, false); // false = not login mode
        }
      }
    } catch (error) {
      // Handle different error types
      const errorMsg = error?.message || 'Authentication failed. Please try again.';
      
      if (errorMsg.toLowerCase().includes('rate limit') || errorMsg.toLowerCase().includes('too many')) {
        setSubmitError('Too many signup attempts. Please wait 15-30 minutes before trying again, or try from a different network (mobile hotspot, VPN, etc.).');
      } else if (errorMsg.toLowerCase().includes('already registered') || errorMsg.toLowerCase().includes('user already exists')) {
        setSubmitError('This email is already registered. Please log in or use a different email.');
      } else if (errorMsg.toLowerCase().includes('invalid email')) {
        setSubmitError('Please enter a valid email address.');
      } else if (errorMsg.toLowerCase().includes('weak password')) {
        setSubmitError('Password must be at least 8 characters with uppercase and numbers.');
      } else {
        setSubmitError(errorMsg);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoginMode, onSubmitSuccess]);

  /**
   * Handle resend verification email
   */
  const handleResendVerification = useCallback(async (email) => {
    setSubmitError('');

    try {
      setIsResendingVerification(true);
      await resendSignupVerificationEmail(email);
      if (onResendVerificationSuccess) {
        onResendVerificationSuccess(email);
      }
    } catch (error) {
      const errorMsg = error?.message || 'Unable to resend verification email.';
      
      if (errorMsg.toLowerCase().includes('rate limit') || errorMsg.toLowerCase().includes('too many')) {
        setSubmitError('Too many resend attempts from your IP. Please wait 15-30 minutes before trying again.');
      } else {
        setSubmitError(errorMsg);
      }
      throw error;
    } finally {
      setIsResendingVerification(false);
    }
  }, [onResendVerificationSuccess]);

  /**
   * Toggle between login and signup modes
   */
  const toggleMode = useCallback(() => {
    setIsLoginMode((prev) => !prev);
    setSubmitError('');
  }, []);

  /**
   * Reset form state (for when modal closes)
   */
  const resetForm = useCallback(() => {
    setIsLoginMode(true);
    setSubmitError('');
    setSelectedProvinceCode('');
    setSelectedCityMunicipalityCode('');
  }, []);

  return {
    // Mode
    isLoginMode,
    toggleMode,

    // Submission state
    isSubmitting,
    submitError,
    setSubmitError,
    handleSubmit,

    // Verification
    isResendingVerification,
    handleResendVerification,

    // Location loading states (these are used by the component)
    loadingProvinces,
    setLoadingProvinces,
    loadingCities,
    setLoadingCities,
    loadingBarangays,
    setLoadingBarangays,
    apiError,
    setApiError,
    selectedProvinceCode,
    setSelectedProvinceCode,
    selectedCityMunicipalityCode,
    setSelectedCityMunicipalityCode,

    // Utility
    resetForm,
  };
}

export default useAuthModalController;
