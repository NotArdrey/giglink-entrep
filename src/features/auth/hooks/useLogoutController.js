/**
 * useLogoutController - Controller Layer Hook for Logout
 * 
 * Manages state and logic for logout confirmation.
 * Wraps authService calls and exposes clean interface to view.
 */

import { useState, useCallback } from 'react';
import { signOutUser } from '../../../shared/services/authService';

export function useLogoutController(onLogoutSuccess) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle logout confirmation
   */
  const handleConfirmLogout = useCallback(async () => {
    setError('');

    try {
      setIsLoading(true);
      await signOutUser();
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    } catch (err) {
      setError(err?.message || 'Unable to logout. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onLogoutSuccess]);

  return {
    // State
    isLoading,
    error,

    // Handler
    handleConfirmLogout,
  };
}

export default useLogoutController;
