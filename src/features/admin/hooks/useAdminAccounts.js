/**
 * useAdminAccounts - Controller Layer Hook
 * 
 * Manages all business logic for admin account management:
 * - Data fetching and caching
 * - Realtime subscriptions
 * - State management
 * - Error handling
 * 
 * Separated from UI concerns - pure logic
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../../../shared/services/supabaseClient';
import AdminAccountService from '../services/AdminAccountService';

// Mock data for fallback
const INITIAL_ACCOUNTS = [
  { id: 1, name: 'Arian Cortez', email: 'arian@example.com', role: 'client', status: 'active', lastSeen: 'Today, 9:12 AM' },
  { id: 2, name: 'Mika Santos', email: 'mika@example.com', role: 'worker', status: 'active', lastSeen: 'Today, 8:41 AM' },
  { id: 3, name: 'Daryl Ng', email: 'daryl@example.com', role: 'worker', status: 'disabled', lastSeen: 'Yesterday, 6:23 PM' },
  { id: 4, name: 'Jenna Lim', email: 'jenna@example.com', role: 'client', status: 'active', lastSeen: 'Today, 10:05 AM' },
  { id: 5, name: 'Admin One', email: 'admin@example.com', role: 'admin', status: 'active', lastSeen: 'Now' },
];

const INITIAL_COMMENTS = [
  { id: 1, worker: 'Mika Santos', client: 'Arian Cortez', rating: 5, comment: 'Fast and professional. Great communication.', status: 'published' },
  { id: 2, worker: 'Daryl Ng', client: 'Jenna Lim', rating: 1, comment: 'This is a scam!!!', status: 'flagged' },
  { id: 3, worker: 'Arian Cortez', client: 'Paolo Diaz', rating: 4, comment: 'Helpful and on time.', status: 'published' },
  { id: 4, worker: 'Mika Santos', client: 'Trina Lopez', rating: 2, comment: 'Needs improvement on response time.', status: 'review' },
];

const INITIAL_LOGS = [
  { id: 1, actor: 'Admin One', action: 'Disabled account', target: 'Daryl Ng', timestamp: '2026-05-08 08:12', severity: 'medium' },
  { id: 2, actor: 'System', action: 'Worker profile updated', target: 'Mika Santos', timestamp: '2026-05-08 07:44', severity: 'low' },
  { id: 3, actor: 'Admin One', action: 'Review comment removed', target: 'Spam review #419', timestamp: '2026-05-08 07:01', severity: 'high' },
  { id: 4, actor: 'Arian Cortez', action: 'Logged in', target: 'Dashboard', timestamp: '2026-05-08 06:58', severity: 'low' },
  { id: 5, actor: 'System', action: 'New signup', target: 'Jenna Lim', timestamp: '2026-05-08 06:21', severity: 'low' },
];

/**
 * Custom hook for managing admin accounts
 * Returns all state and handlers needed by the UI
 */
export function useAdminAccounts() {
  // Account data state
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [isAccountsLoading, setIsAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState('');

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [roleSavingId, setRoleSavingId] = useState(null);

  // Comments state
  const [comments, setComments] = useState(INITIAL_COMMENTS);

  // Access action modal state
  const [accessActionTarget, setAccessActionTarget] = useState(null);
  const [accessActionMode, setAccessActionMode] = useState('disable');
  const [accessReason, setAccessReason] = useState('');
  const [accessDurationValue, setAccessDurationValue] = useState('2');
  const [accessDurationUnit, setAccessDurationUnit] = useState('minutes');

  // Comment delete modal state
  const [commentDeleteTarget, setCommentDeleteTarget] = useState(null);

  // Initial data load
  useEffect(() => {
    let isMounted = true;

    const loadAccounts = async () => {
      setIsAccountsLoading(true);
      setAccountsError('');

      try {
        const dbAccounts = await AdminAccountService.fetchAccounts();
        if (!isMounted) return;
        setAccounts(dbAccounts);
      } catch (error) {
        if (!isMounted) return;
        console.error('Unable to load admin accounts:', error);
        setAccountsError(error?.message || 'Unable to load accounts from the database right now.');
        setAccounts(INITIAL_ACCOUNTS.map((account) => ({
          ...account,
          accountStatus: account.status === 'disabled' ? 'disabled' : 'active',
        })));
      } finally {
        if (isMounted) setIsAccountsLoading(false);
      }
    };

    loadAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Realtime subscription to profiles table
  useEffect(() => {
    const channel = supabase
      .channel('admin-accounts-watch')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        async () => {
          try {
            const dbAccounts = await AdminAccountService.fetchAccounts();
            setAccounts(dbAccounts);
          } catch (error) {
            console.error('Unable to refresh admin accounts from realtime update:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Periodic refresh while on accounts section (handled by parent component via setActiveSection)
  // This could be moved to parent or a separate effect if needed

  // Computed: filtered accounts based on search and role
  const filteredAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchesQuery = !query
        || account.name.toLowerCase().includes(query)
        || account.email.toLowerCase().includes(query)
        || account.role.toLowerCase().includes(query);
      const matchesRole = selectedRole === 'all' || account.role === selectedRole;
      return matchesQuery && matchesRole;
    });
  }, [accounts, searchQuery, selectedRole]);

  // Computed: normalized accounts with display properties
  const normalizedAccounts = useMemo(
    () => filteredAccounts.map((account) => ({
      ...account,
      displayStatus: account.status || account.accountStatus || 'active',
      lastSeen: account.lastSeen || (account.updatedAt ? new Date(account.updatedAt).toLocaleString() : 'Unknown'),
    })),
    [filteredAccounts]
  );

  // Computed: statistics
  const stats = useMemo(() => {
    const activeAccounts = accounts.filter((account) => (account.status || account.accountStatus) === 'active').length;
    const disabledAccounts = accounts.filter((account) => (account.status || account.accountStatus) === 'disabled').length;
    const suspendedAccounts = accounts.filter((account) => (account.status || account.accountStatus) === 'suspended').length;
    const flaggedComments = comments.filter((comment) => comment.status === 'flagged').length;
    return { activeAccounts, disabledAccounts, suspendedAccounts, flaggedComments };
  }, [accounts, comments]);

  // Handler: Update account role
  const handleUpdateRole = useCallback(async (account, nextRole) => {
    if (!account?.id) return;
    setRoleSavingId(account.id);
    try {
      await AdminAccountService.updateRole(account.id, nextRole);
      setAccounts((prev) => prev.map((item) => (item.id === account.id ? { ...item, role: nextRole } : item)));
    } catch (error) {
      console.error('Unable to update role:', error);
      setAccountsError(error?.message || 'Unable to update role right now.');
    } finally {
      setRoleSavingId(null);
    }
  }, []);

  // Handler: Open access action modal
  const openAccessAction = useCallback((account, mode) => {
    setAccessActionTarget(account);
    setAccessActionMode(mode);
    setAccessReason(mode === 'ban' ? `Suspended for policy violation.` : `Disabled by admin.`);
    setAccessDurationValue('2');
    setAccessDurationUnit('minutes');
  }, []);

  // Handler: Close access action modal
  const closeAccessAction = useCallback(() => {
    setAccessActionTarget(null);
    setAccessActionMode('disable');
    setAccessReason('');
    setAccessDurationValue('2');
    setAccessDurationUnit('minutes');
  }, []);

  // Handler: Confirm access action (disable/ban)
  const handleConfirmAccessAction = useCallback(async () => {
    if (!accessActionTarget?.id) return;

    const durationMinutes = AdminAccountService.calculateDurationMinutes(accessDurationValue, accessDurationUnit);

    try {
      await AdminAccountService.updateStatus(
        accessActionTarget.id,
        accessActionMode === 'ban' ? 'suspended' : 'disabled',
        accessReason,
        accessActionMode === 'ban' ? durationMinutes : null
      );

      setAccounts((prev) => prev.map((item) => {
        if (item.id !== accessActionTarget.id) return item;
        if (accessActionMode === 'ban') {
          const suspendedUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
          return {
            ...item,
            status: 'suspended',
            suspendedReason: accessReason,
            suspendedUntil,
            suspendedAt: new Date().toISOString(),
          };
        }

        return {
          ...item,
          status: 'disabled',
          disabledReason: accessReason,
          disabledAt: new Date().toISOString(),
        };
      }));

      closeAccessAction();
    } catch (error) {
      console.error('Unable to update account access:', error);
      setAccountsError(error?.message || 'Unable to update account access right now.');
    }
  }, [accessActionTarget, accessActionMode, accessReason, accessDurationValue, accessDurationUnit, closeAccessAction]);

  // Handler: Restore account
  const handleRestoreAccount = useCallback(async (account) => {
    if (!account?.id) return;

    try {
      await AdminAccountService.updateStatus(account.id, 'active', '');
      setAccounts((prev) => prev.map((item) => (
        item.id === account.id
          ? {
              ...item,
              status: 'active',
              disabledReason: '',
              suspendedReason: '',
              suspendedUntil: null,
              disabledAt: null,
              suspendedAt: null,
            }
          : item
      )));
    } catch (error) {
      console.error('Unable to restore account:', error);
      setAccountsError(error?.message || 'Unable to restore account right now.');
    }
  }, []);

  // Handler: Delete comment
  const handleDeleteComment = useCallback((commentId) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setCommentDeleteTarget(null);
  }, []);

  // Return all state and handlers for use by UI components
  return {
    // Account data
    accounts,
    normalizedAccounts,
    filteredAccounts,
    isAccountsLoading,
    accountsError,
    stats,

    // Search & filter
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,

    // Account handlers
    handleUpdateRole,
    roleSavingId,
    openAccessAction,
    closeAccessAction,
    handleConfirmAccessAction,
    handleRestoreAccount,

    // Access action modal state
    accessActionTarget,
    setAccessActionTarget,
    accessActionMode,
    setAccessActionMode,
    accessReason,
    setAccessReason,
    accessDurationValue,
    setAccessDurationValue,
    accessDurationUnit,
    setAccessDurationUnit,

    // Comments
    comments,
    setComments,
    handleDeleteComment,
    commentDeleteTarget,
    setCommentDeleteTarget,

    // Static data
    logs: INITIAL_LOGS,
  };
}

export default useAdminAccounts;
