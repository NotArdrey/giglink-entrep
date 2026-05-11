/**
 * AdminAccountService - Model Layer
 * 
 * Handles all API calls and data operations for admin account management.
 * Pure data layer - no React hooks, no UI logic.
 */

import { fetchAdminAccounts, updateAdminAccountRole, updateAdminAccountStatus } from '../../../shared/services/authService';
import { supabase } from '../../../shared/services/supabaseClient';

const formatReviewComment = (review = {}, profilesById = {}, sellersById = {}) => {
  const reviewer = profilesById[review.reviewer_id] || {};
  const seller = sellersById[review.seller_id] || {};

  return {
    id: review.id,
    worker: seller.display_name || seller.search_meta?.name || 'Service Provider',
    client: reviewer.full_name || reviewer.fullName || reviewer.email || 'Client',
    rating: review.rating,
    comment: review.body || review.title || '',
    status: review.published === false ? 'review' : 'published',
    createdAt: review.created_at,
    raw: review,
  };
};

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

  async fetchComments() {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    if (!reviews?.length) return [];

    const reviewerIds = [...new Set(reviews.map((review) => review.reviewer_id).filter(Boolean))];
    const sellerIds = [...new Set(reviews.map((review) => review.seller_id).filter(Boolean))];

    const [profilesResult, sellersResult] = await Promise.all([
      reviewerIds.length
        ? supabase.from('profiles').select('*').in('user_id', reviewerIds)
        : Promise.resolve({ data: [], error: null }),
      sellerIds.length
        ? supabase.from('sellers').select('*').in('user_id', sellerIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (sellersResult.error) throw sellersResult.error;

    const profilesById = Object.fromEntries((profilesResult.data || []).map((profile) => [profile.user_id, profile]));
    const sellersById = Object.fromEntries((sellersResult.data || []).map((seller) => [seller.user_id, seller]));

    return reviews.map((review) => formatReviewComment(review, profilesById, sellersById));
  },

  async deleteComment(commentId) {
    if (!commentId) throw new Error('Comment ID is required');

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    return { success: true };
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
