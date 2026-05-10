/**
 * useForgotPasswordController - Controller Layer Hook for Forgot Password
 * 
 * Manages state and logic for forgot password flow.
 * Wraps authService calls and exposes clean interface to view.
 */

import { useState, useCallback } from 'react';
import { sendPasswordResetEmail } from '../../../shared/services/authService';

export function useForgotPasswordController(onSubmitSuccess) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle forgot password submission
   */
  const handleSubmit = useCallback(async (submittedEmail) => {
    setError('');

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(submittedEmail);
      setIsSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess(submittedEmail);
      }
    } catch (err) {
      setError(err?.message || 'Unable to send password reset email. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onSubmitSuccess]);

  /**
   * Reset form state (for when modal closes)
   */
  const resetForm = useCallback(() => {
    setEmail('');
    setIsSubmitted(false);
    setError('');
  }, []);

  /**
   * Send email again
   */
  const handleSendAgain = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    await handleSubmit(email);
  }, [email, handleSubmit]);

  return {
    // Form state
    email,
    setEmail,
    
    // Submission state
    isSubmitted,
    setIsSubmitted,
    isLoading,
    error,
    setError,

    // Handlers
    handleSubmit,
    handleSendAgain,

    // Utility
    resetForm,
  };
}

export default useForgotPasswordController;
