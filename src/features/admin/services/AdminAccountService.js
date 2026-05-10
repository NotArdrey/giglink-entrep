/**
 * AdminAccountService - Model Layer
 * 
 * Handles all API calls and data operations for admin account management.
 * Pure data layer - no React hooks, no UI logic.
 */

import { fetchAdminAccounts, updateAdminAccountRole, updateAdminAccountStatus } from '../../../shared/services/authService';

/**
 * Fetch all admin accounts from the database
 * @returns {Promise<Array>} List of admin accounts
 */
export const AdminAccountService = {
  /**
   * Fetch all accounts with proper error handling
   */
  async fetchAccounts() {
    try {
      const accounts = await fetchAdminAccounts();
      return accounts;
    } catch (error) {
      console.error('Failed to fetch admin accounts:', error);
      throw error;
    }
  },

  /**
   * Update an account's role
   * @param {string} userId - User ID
   * @param {string} role - New role (client, admin, worker)
   */
  async updateRole(userId, role) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!role) {
      throw new Error('Role is required');
    }

    try {
      await updateAdminAccountRole({ userId, role });
      return { success: true };
    } catch (error) {
      console.error(`Failed to update role for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Update an account's access status (active, disabled, suspended)
   * @param {string} userId - User ID
   * @param {string} status - New status (active, disabled, suspended)
   * @param {string} reason - Reason for the status change
   * @param {number} durationMinutes - Duration in minutes (for suspensions)
   */
  async updateStatus(userId, status, reason = '', durationMinutes = null) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!status) {
      throw new Error('Status is required');
    }

    try {
      await updateAdminAccountStatus({
        userId,
        status,
        reason,
        durationMinutes,
      });
      return { success: true };
    } catch (error) {
      console.error(`Failed to update status for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Calculate suspension expiry from duration value and unit
   * @param {string} value - Duration value (e.g., "2")
   * @param {string} unit - Duration unit (minutes, hours, days)
   * @returns {number} Duration in minutes
   */
  calculateDurationMinutes(value, unit = 'minutes') {
    const durationMap = {
      minutes: 1,
      hours: 60,
      days: 1440,
    };
    const multiplier = durationMap[unit] || 1;
    return Number(value) * multiplier;
  },
};

export default AdminAccountService;
