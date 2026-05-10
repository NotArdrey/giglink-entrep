/**
 * useResetPasswordController - Controller Layer Hook for Reset Password
 * 
 * Manages state and logic for password reset flow.
 * Wraps authService calls and exposes clean interface to view.
 */

import { useState, useCallback } from 'react';
import { updateUserPassword } from '../../../shared/services/authService';

export function useResetPasswordController(onSubmitSuccess) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Handle password reset with token (email-based reset)
   * This is called by components that have a reset token from email link
   */
  const handleResetWithToken = useCallback(async (email) => {
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      // Note: The actual password reset via token is handled by Supabase
      // This function is just for validation and success notification
      setIsSuccess(true);
      if (onSubmitSuccess) {
        onSubmitSuccess(email);
      }
    } catch (err) {
      setError(err?.message || 'Unable to reset password. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [newPassword, confirmPassword, onSubmitSuccess]);

  /**
   * Handle password change for authenticated users
   */
  const handleChangePassword = useCallback(async (email, currentPassword) => {
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      await updateUserPassword({
        email,
        currentPassword,
        newPassword,
      });
      setIsSuccess(true);
      if (onSubmitSuccess) {
        onSubmitSuccess(email);
      }
    } catch (err) {
      setError(err?.message || 'Unable to change password. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [newPassword, confirmPassword, onSubmitSuccess]);

  /**
   * Reset form state
   */
  const resetForm = useCallback(() => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsSuccess(false);
  }, []);

  return {
    // Form state
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,

    // Submission state
    isLoading,
    error,
    setError,
    isSuccess,

    // Handlers
    handleResetWithToken,
    handleChangePassword,

    // Utility
    resetForm,
  };
}

export default useResetPasswordController;
