import { useEffect, useMemo, useState } from 'react';
import AdminNavigation from '../components/AdminNavigation';
import LogoutConfirmModal from '../../auth/components/LogoutConfirmModal';
import { ConfirmActionModal } from '../../../shared/components';
import { getThemeTokens } from '../../../shared/styles/themeTokens';
import { supabase } from '../../../shared/services/supabaseClient';
import { fetchAdminAccounts, updateAdminAccountRole, updateAdminAccountStatus } from '../../../shared/services/authService';

const initialAccounts = [
  { id: 1, name: 'Arian Cortez', email: 'arian@example.com', role: 'client', status: 'active', lastSeen: 'Today, 9:12 AM' },
  { id: 2, name: 'Mika Santos', email: 'mika@example.com', role: 'worker', status: 'active', lastSeen: 'Today, 8:41 AM' },
  { id: 3, name: 'Daryl Ng', email: 'daryl@example.com', role: 'worker', status: 'disabled', lastSeen: 'Yesterday, 6:23 PM' },
  { id: 4, name: 'Jenna Lim', email: 'jenna@example.com', role: 'client', status: 'active', lastSeen: 'Today, 10:05 AM' },
  { id: 5, name: 'Admin One', email: 'admin@example.com', role: 'admin', status: 'active', lastSeen: 'Now' },
];

const initialLogs = [
  { id: 1, actor: 'Admin One', action: 'Disabled account', target: 'Daryl Ng', timestamp: '2026-05-08 08:12', severity: 'medium' },
  { id: 2, actor: 'System', action: 'Worker profile updated', target: 'Mika Santos', timestamp: '2026-05-08 07:44', severity: 'low' },
  { id: 3, actor: 'Admin One', action: 'Review comment removed', target: 'Spam review #419', timestamp: '2026-05-08 07:01', severity: 'high' },
  { id: 4, actor: 'Arian Cortez', action: 'Logged in', target: 'Dashboard', timestamp: '2026-05-08 06:58', severity: 'low' },
  { id: 5, actor: 'System', action: 'New signup', target: 'Jenna Lim', timestamp: '2026-05-08 06:21', severity: 'low' },
];

const initialComments = [
  { id: 1, worker: 'Mika Santos', client: 'Arian Cortez', rating: 5, comment: 'Fast and professional. Great communication.', status: 'published' },
  { id: 2, worker: 'Daryl Ng', client: 'Jenna Lim', rating: 1, comment: 'This is a scam!!!', status: 'flagged' },
  { id: 3, worker: 'Arian Cortez', client: 'Paolo Diaz', rating: 4, comment: 'Helpful and on time.', status: 'published' },
  { id: 4, worker: 'Mika Santos', client: 'Trina Lopez', rating: 2, comment: 'Needs improvement on response time.', status: 'review' },
];

function AdminDashboard({ appTheme = 'light', onLogout, onOpenDashboard }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [comments, setComments] = useState(initialComments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [activeSection, setActiveSection] = useState('overview');
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [commentDeleteTarget, setCommentDeleteTarget] = useState(null);
  const [isAccountsLoading, setIsAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState('');
  const [roleSavingId, setRoleSavingId] = useState(null);
  const [accessActionTarget, setAccessActionTarget] = useState(null);
  const [accessActionMode, setAccessActionMode] = useState('disable');
  const [accessReason, setAccessReason] = useState('');
  const [accessDurationValue, setAccessDurationValue] = useState('2');
  const [accessDurationUnit, setAccessDurationUnit] = useState('minutes');

  useEffect(() => {
    let isMounted = true;

    const loadAccounts = async () => {
      setIsAccountsLoading(true);
      setAccountsError('');

      try {
        const dbAccounts = await fetchAdminAccounts();
        if (!isMounted) return;
        setAccounts(dbAccounts);
      } catch (error) {
        if (!isMounted) return;
        console.error('Unable to load admin accounts:', error);
        setAccountsError(error?.message || 'Unable to load accounts from the database right now.');
        setAccounts(initialAccounts.map((account) => ({
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

  useEffect(() => {
    const channel = supabase
      .channel('admin-accounts-watch')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        async () => {
          try {
            const dbAccounts = await fetchAdminAccounts();
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

  const themeTokens = getThemeTokens(appTheme);

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

  const normalizedAccounts = useMemo(() => filteredAccounts.map((account) => ({
    ...account,
    displayStatus: account.status || account.accountStatus || 'active',
    lastSeen: account.lastSeen || (account.updatedAt ? new Date(account.updatedAt).toLocaleString() : 'Unknown'),
  })), [filteredAccounts]);

  const stats = useMemo(() => {
    const activeAccounts = accounts.filter((account) => (account.status || account.accountStatus) === 'active').length;
    const disabledAccounts = accounts.filter((account) => (account.status || account.accountStatus) === 'disabled').length;
    const suspendedAccounts = accounts.filter((account) => (account.status || account.accountStatus) === 'suspended').length;
    const flaggedComments = comments.filter((comment) => comment.status === 'flagged').length;
    return { activeAccounts, disabledAccounts, suspendedAccounts, flaggedComments };
  }, [accounts, comments]);

  const handleUpdateRole = async (account, nextRole) => {
    if (!account?.id) return;
    setRoleSavingId(account.id);
    try {
      await updateAdminAccountRole({ userId: account.id, role: nextRole });
      setAccounts((prev) => prev.map((item) => (item.id === account.id ? { ...item, role: nextRole } : item)));
    } catch (error) {
      console.error('Unable to update role:', error);
      setAccountsError(error?.message || 'Unable to update role right now.');
    } finally {
      setRoleSavingId(null);
    }
  };

  const openAccessAction = (account, mode) => {
    setAccessActionTarget(account);
    setAccessActionMode(mode);
    setAccessReason(mode === 'ban' ? `Suspended for policy violation.` : `Disabled by admin.`);
    setAccessDurationValue('2');
    setAccessDurationUnit('minutes');
  };

  const closeAccessAction = () => {
    setAccessActionTarget(null);
    setAccessActionMode('disable');
    setAccessReason('');
    setAccessDurationValue('2');
    setAccessDurationUnit('minutes');
  };

  const handleConfirmAccessAction = async () => {
    if (!accessActionTarget?.id) return;

    const durationMap = {
      minutes: 1,
      hours: 60,
      days: 1440,
    };
    const durationMinutes = Number(accessDurationValue) * (durationMap[accessDurationUnit] || 1);

    try {
      await updateAdminAccountStatus({
        userId: accessActionTarget.id,
        status: accessActionMode === 'ban' ? 'suspended' : 'disabled',
        reason: accessReason,
        durationMinutes: accessActionMode === 'ban' ? durationMinutes : null,
      });

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
  };

  const handleRestoreAccount = async (account) => {
    if (!account?.id) return;

    try {
      await updateAdminAccountStatus({ userId: account.id, status: 'active', reason: '' });
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
  };

  const handleDeleteComment = (commentId) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setCommentDeleteTarget(null);
  };

  const handleOpenDeleteComment = (comment) => setCommentDeleteTarget(comment);

  const handleOpenLogoutConfirm = () => setIsLogoutConfirmOpen(true);

  const handleCloseLogoutConfirm = () => setIsLogoutConfirmOpen(false);

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    onLogout && onLogout();
  };

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: themeTokens.pageBg,
      color: themeTokens.textPrimary,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    shell: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '20px',
    },
    header: {
      backgroundColor: themeTokens.surface,
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '16px',
      boxShadow: themeTokens.shadowSoft,
      padding: '18px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },
    headerCopy: { display: 'grid', gap: '6px' },
    eyebrow: {
      display: 'inline-flex',
      width: 'fit-content',
      borderRadius: '999px',
      padding: '4px 10px',
      fontSize: '12px',
      fontWeight: 800,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      backgroundColor: themeTokens.badgeBg,
      color: themeTokens.badgeText,
    },
    title: { margin: 0, fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.15 },
    subtitle: { margin: 0, color: themeTokens.textSecondary, lineHeight: 1.5, maxWidth: '780px' },
    headerActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    actionButton: {
      border: 'none',
      borderRadius: '10px',
      padding: '10px 14px',
      fontWeight: 700,
      cursor: 'pointer',
      backgroundColor: themeTokens.accent,
      color: '#ffffff',
    },
    actionSecondary: {
      border: `1px solid ${themeTokens.border}`,
      backgroundColor: themeTokens.surfaceAlt,
      color: themeTokens.textPrimary,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '14px',
      marginTop: '16px',
    },
    statCard: {
      backgroundColor: themeTokens.surface,
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '14px',
      padding: '16px',
      boxShadow: themeTokens.shadowSoft,
    },
    statLabel: { margin: 0, color: themeTokens.textSecondary, fontSize: '0.9rem', fontWeight: 600 },
    statValue: { margin: '6px 0 0', fontSize: '1.65rem', fontWeight: 800 },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '1.1fr 0.9fr',
      gap: '16px',
      marginTop: '16px',
    },
    panel: {
      backgroundColor: themeTokens.surface,
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '16px',
      boxShadow: themeTokens.shadowSoft,
      padding: '16px',
      minWidth: 0,
    },
    panelHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '14px',
      flexWrap: 'wrap',
    },
    panelTitleWrap: { display: 'grid', gap: '4px' },
    panelTitle: { margin: 0, fontSize: '1.05rem', fontWeight: 800 },
    panelDesc: { margin: 0, color: themeTokens.textSecondary, fontSize: '0.92rem', lineHeight: 1.45 },
    filterBar: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
    searchInput: {
      minWidth: '220px',
      height: '42px',
      borderRadius: '10px',
      border: `1px solid ${themeTokens.inputBorder}`,
      backgroundColor: themeTokens.inputBg,
      color: themeTokens.inputText,
      padding: '0 12px',
      outline: 'none',
    },
    select: {
      height: '42px',
      borderRadius: '10px',
      border: `1px solid ${themeTokens.inputBorder}`,
      backgroundColor: themeTokens.inputBg,
      color: themeTokens.inputText,
      padding: '0 12px',
      outline: 'none',
    },
    tableWrap: { overflowX: 'auto', borderRadius: '12px', border: `1px solid ${themeTokens.border}` },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '720px', backgroundColor: themeTokens.surface },
    th: {
      textAlign: 'left',
      padding: '12px 14px',
      fontSize: '0.8rem',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: themeTokens.textSecondary,
      backgroundColor: themeTokens.surfaceAlt,
      borderBottom: `1px solid ${themeTokens.border}`,
    },
    td: { padding: '12px 14px', borderBottom: `1px solid ${themeTokens.border}`, verticalAlign: 'middle' },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 800,
      textTransform: 'capitalize',
    },
    badgeActive: { backgroundColor: themeTokens.successBg, color: themeTokens.successText, border: `1px solid ${themeTokens.successBorder}` },
    badgeDisabled: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
    badgeAdmin: { backgroundColor: themeTokens.badgeBg, color: themeTokens.badgeText, border: `1px solid ${themeTokens.accent}` },
    rowActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    rowButton: {
      border: 'none',
      borderRadius: '8px',
      padding: '8px 10px',
      fontWeight: 700,
      cursor: 'pointer',
      backgroundColor: themeTokens.accent,
      color: '#ffffff',
      fontSize: '12px',
    },
    rowButtonMuted: {
      backgroundColor: themeTokens.surfaceSoft,
      color: themeTokens.textPrimary,
      border: `1px solid ${themeTokens.border}`,
    },
    activityList: { display: 'grid', gap: '10px' },
    activityItem: {
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '12px',
      padding: '12px',
      backgroundColor: themeTokens.surfaceAlt,
      display: 'grid',
      gap: '6px',
    },
    activityTop: { display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' },
    activityMeta: { margin: 0, color: themeTokens.textSecondary, fontSize: '0.9rem' },
    activityTitle: { margin: 0, fontWeight: 800 },
    severity: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '999px',
      padding: '4px 10px',
      fontSize: '11px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      width: 'fit-content',
    },
    severityLow: { backgroundColor: themeTokens.successBg, color: themeTokens.successText },
    severityMedium: { backgroundColor: '#ffedd5', color: '#9a3412' },
    severityHigh: { backgroundColor: '#fee2e2', color: '#b91c1b' },
    commentList: { display: 'grid', gap: '12px' },
    commentCard: {
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '12px',
      padding: '12px',
      backgroundColor: themeTokens.surfaceAlt,
      display: 'grid',
      gap: '8px',
    },
    commentHeader: { display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' },
    commentMeta: { margin: 0, color: themeTokens.textSecondary, fontSize: '0.9rem' },
    commentText: { margin: 0, color: themeTokens.textPrimary, lineHeight: 1.5 },
    commentActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    emptyState: {
      padding: '18px',
      borderRadius: '12px',
      border: `1px dashed ${themeTokens.border}`,
      color: themeTokens.textSecondary,
      backgroundColor: themeTokens.surfaceAlt,
    },
    sectionNavHint: {
      marginTop: '14px',
      color: themeTokens.textSecondary,
      fontSize: '0.92rem',
    },
    overviewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '16px',
      marginTop: '16px',
    },
    miniChartCard: {
      backgroundColor: themeTokens.surface,
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '14px',
      padding: '16px',
      boxShadow: themeTokens.shadowSoft,
      display: 'grid',
      gap: '10px',
      minHeight: '190px',
    },
    miniChartBars: {
      display: 'flex',
      alignItems: 'end',
      gap: '10px',
      minHeight: '110px',
      paddingTop: '8px',
    },
    miniBar: (height, color) => ({
      width: '100%',
      height,
      borderRadius: '12px 12px 4px 4px',
      background: color,
      boxShadow: '0 10px 18px rgba(37, 99, 235, 0.12)',
    }),
    summaryRow: {
      display: 'grid',
      gridTemplateColumns: '1.1fr 0.9fr',
      gap: '16px',
      marginTop: '16px',
    },
    summaryList: { display: 'grid', gap: '10px' },
    summaryItem: {
      border: `1px solid ${themeTokens.border}`,
      borderRadius: '12px',
      padding: '12px',
      backgroundColor: themeTokens.surfaceAlt,
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      alignItems: 'center',
    },
    summaryLabel: { margin: 0, color: themeTokens.textSecondary, fontSize: '0.9rem' },
    summaryValue: { margin: 0, fontWeight: 800, fontSize: '1.05rem' },
  };

  return (
    <div style={styles.page}>
      <AdminNavigation
        appTheme={appTheme}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onOpenDashboard={onOpenDashboard}
        onOpenLogoutConfirm={handleOpenLogoutConfirm}
      />

      <div style={styles.shell}>
        {activeSection === 'overview' && (
          <>
            <section style={styles.header}>
              <div style={styles.headerCopy}>
                <span style={styles.eyebrow}>Admin Portal UI</span>
                <h1 style={styles.title}>GigLink Admin Dashboard</h1>
                <p style={styles.subtitle}>
                  Main landing view for admin summaries, trends, and quick status checks. Detailed management pages are available from the top navigation.
                </p>
              </div>
            </section>

            <section style={styles.statsGrid}>
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Total Accounts</p>
                <p style={styles.statValue}>{accounts.length}</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Disabled Accounts</p>
                <p style={styles.statValue}>{stats.disabledAccounts}</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Flagged Comments</p>
                <p style={styles.statValue}>{stats.flaggedComments}</p>
              </div>
            </section>

            <section style={styles.overviewGrid}>
              <article style={styles.miniChartCard}>
                <div>
                  <h2 style={styles.panelTitle}>Accounts Trend</h2>
                  <p style={styles.panelDesc}>Mock chart showing overall account activity.</p>
                </div>
                <div style={styles.miniChartBars}>
                  <div style={styles.miniBar('30%', '#dbeafe')} />
                  <div style={styles.miniBar('48%', '#bfdbfe')} />
                  <div style={styles.miniBar('70%', '#93c5fd')} />
                  <div style={styles.miniBar('54%', '#60a5fa')} />
                  <div style={styles.miniBar('82%', '#2563eb')} />
                </div>
              </article>

              <article style={styles.miniChartCard}>
                <div>
                  <h2 style={styles.panelTitle}>Content Health</h2>
                  <p style={styles.panelDesc}>Quick moderation snapshot for comments and reports.</p>
                </div>
                <div style={styles.miniChartBars}>
                  <div style={styles.miniBar('22%', '#dcfce7')} />
                  <div style={styles.miniBar('46%', '#bbf7d0')} />
                  <div style={styles.miniBar('28%', '#86efac')} />
                  <div style={styles.miniBar('61%', '#4ade80')} />
                  <div style={styles.miniBar('36%', '#16a34a')} />
                </div>
              </article>

              <article style={styles.miniChartCard}>
                <div>
                  <h2 style={styles.panelTitle}>Role Distribution</h2>
                  <p style={styles.panelDesc}>Overview of clients, workers, and admins.</p>
                </div>
                <div style={styles.miniChartBars}>
                  <div style={styles.miniBar('68%', '#e0e7ff')} />
                  <div style={styles.miniBar('44%', '#c7d2fe')} />
                  <div style={styles.miniBar('14%', '#818cf8')} />
                </div>
              </article>
            </section>

            <section style={styles.summaryRow}>
              <article style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitleWrap}>
                    <h2 style={styles.panelTitle}>Top Summary</h2>
                    <p style={styles.panelDesc}>A compact landing summary before opening each detailed page.</p>
                  </div>
                </div>

                <div style={styles.summaryList}>
                  <div style={styles.summaryItem}>
                    <div>
                      <p style={styles.summaryLabel}>Accounts Overview</p>
                      <p style={styles.summaryValue}>Manage client, worker, and admin users</p>
                    </div>
                    <span style={{ ...styles.badge, ...styles.badgeAdmin }}>{accounts.length}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <div>
                      <p style={styles.summaryLabel}>Audit Logs</p>
                      <p style={styles.summaryValue}>Recent actions, alerts, and system events</p>
                    </div>
                    <span style={{ ...styles.badge, ...styles.badgeActive }}>{initialLogs.length}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <div>
                      <p style={styles.summaryLabel}>Comment Moderation</p>
                      <p style={styles.summaryValue}>Review flagged feedback and remove spam</p>
                    </div>
                    <span style={{ ...styles.badge, ...styles.badgeDisabled }}>{stats.flaggedComments}</span>
                  </div>
                </div>
              </article>

              <article style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitleWrap}>
                    <h2 style={styles.panelTitle}>Quick Actions</h2>
                    <p style={styles.panelDesc}>Navigate into any section from here.</p>
                  </div>
                </div>

                <div style={styles.activityList}>
                  <div style={styles.activityItem}>
                    <p style={styles.activityTitle}>Review Accounts</p>
                    <p style={styles.activityMeta}>Open account management to disable or enable users.</p>
                  </div>
                  <div style={styles.activityItem}>
                    <p style={styles.activityTitle}>Check Logs</p>
                    <p style={styles.activityMeta}>View system activity and moderation history.</p>
                  </div>
                  <div style={styles.activityItem}>
                    <p style={styles.activityTitle}>Moderate Comments</p>
                    <p style={styles.activityMeta}>Handle spam, abuse, and review entries.</p>
                  </div>
                </div>
              </article>
            </section>
          </>
        )}

        {activeSection === 'accounts' && (
          <section style={{ ...styles.contentGrid, gridTemplateColumns: '1fr' }}>
            <article style={styles.panel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitleWrap}>
                  <h2 style={styles.panelTitle}>Account Management</h2>
                  <p style={styles.panelDesc}>View all accounts from the database, update roles for client/admin users, and apply soft disables or timed suspensions.</p>
                </div>
                <div style={styles.filterBar}>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search name, email, role"
                    style={styles.searchInput}
                  />
                  <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} style={styles.select}>
                    <option value="all">All Roles</option>
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {accountsError && <div style={{ ...styles.emptyState, marginBottom: '12px' }}>{accountsError}</div>}

              {isAccountsLoading && <div style={styles.emptyState}>Loading accounts from the database...</div>}

              {!isAccountsLoading && filteredAccounts.length > 0 ? (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Role</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Access Notes</th>
                        <th style={styles.th}>Last Seen</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {normalizedAccounts.map((account) => (
                        <tr key={account.id}>
                          <td style={styles.td}>{account.name}</td>
                          <td style={styles.td}>{account.email}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                ...(account.role === 'admin'
                                  ? styles.badgeAdmin
                                  : account.role === 'worker'
                                    ? { backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' }
                                    : styles.rowButtonMuted),
                              }}
                            >
                              {account.role}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                ...(account.displayStatus === 'active'
                                  ? styles.badgeActive
                                  : account.displayStatus === 'suspended'
                                    ? { backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fed7aa' }
                                    : styles.badgeDisabled),
                              }}
                            >
                              {account.displayStatus}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'grid', gap: '4px' }}>
                              <span style={styles.activityMeta}>
                                {account.displayStatus === 'suspended' && account.suspendedUntil
                                  ? `Until ${new Date(account.suspendedUntil).toLocaleString()}`
                                  : account.displayStatus === 'disabled'
                                    ? 'Soft disabled by admin'
                                    : 'No access restrictions'}
                              </span>
                              <span style={styles.activityMeta}>
                                {account.displayStatus === 'suspended'
                                  ? (account.suspendedReason || 'No suspension reason saved')
                                  : account.displayStatus === 'disabled'
                                    ? (account.disabledReason || 'No disable reason saved')
                                    : 'Account active'}
                              </span>
                            </div>
                          </td>
                          <td style={styles.td}>{account.lastSeen}</td>
                          <td style={styles.td}>
                            <div style={styles.rowActions}>
                              <button
                                type="button"
                                style={styles.rowButton}
                                disabled={roleSavingId === account.id}
                                onClick={() => handleUpdateRole(account, 'client')}
                              >
                                Set Client
                              </button>
                              <button
                                type="button"
                                style={{ ...styles.rowButton, ...styles.badgeAdmin }}
                                disabled={roleSavingId === account.id}
                                onClick={() => handleUpdateRole(account, 'admin')}
                              >
                                Set Admin
                              </button>
                              {(account.displayStatus === 'active') ? (
                                <>
                                  <button
                                    type="button"
                                    style={{ ...styles.rowButton, ...styles.rowButtonMuted }}
                                    onClick={() => openAccessAction(account, 'disable')}
                                  >
                                    Disable
                                  </button>
                                  <button
                                    type="button"
                                    style={{ ...styles.rowButton, backgroundColor: '#b45309' }}
                                    onClick={() => openAccessAction(account, 'ban')}
                                  >
                                    Ban
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  style={{ ...styles.rowButton, backgroundColor: '#15803d' }}
                                  onClick={() => handleRestoreAccount(account)}
                                >
                                  Restore
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={styles.emptyState}>No matching accounts found.</div>
              )}
            </article>
          </section>
        )}

        {activeSection === 'logs' && (
          <section style={{ ...styles.contentGrid, gridTemplateColumns: '1fr' }}>
            <article style={styles.panel}>
              <div style={styles.panelHeader}>
                <div style={styles.panelTitleWrap}>
                  <h2 style={styles.panelTitle}>Audit Logs</h2>
                  <p style={styles.panelDesc}>Track user-wide activities in a readable log layout. This is static UI for now and can later consume real audit events.</p>
                </div>
              </div>

              <div style={styles.activityList}>
                {initialLogs.map((log) => (
                  <div key={log.id} style={styles.activityItem}>
                    <div style={styles.activityTop}>
                      <p style={styles.activityTitle}>{log.action}</p>
                      <span
                        style={{
                          ...styles.severity,
                          ...(log.severity === 'high'
                            ? styles.severityHigh
                            : log.severity === 'medium'
                              ? styles.severityMedium
                              : styles.severityLow),
                        }}
                      >
                        {log.severity}
                      </span>
                    </div>
                    <p style={styles.activityMeta}>
                      Actor: <strong>{log.actor}</strong> · Target: <strong>{log.target}</strong>
                    </p>
                    <p style={styles.activityMeta}>{log.timestamp}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        )}

        {activeSection === 'comments' && (
          <section style={{ ...styles.contentGrid, gridTemplateColumns: '1fr' }}>
            <article style={styles.panel}>
            <div style={styles.panelHeader}>
              <div style={styles.panelTitleWrap}>
                <h2 style={styles.panelTitle}>Summary / Comment Moderation</h2>
                <p style={styles.panelDesc}>Review worker comments and remove troll/spam entries. Buttons are local-only for now so the UI is ready before backend hookup.</p>
              </div>
            </div>

            {comments.length > 0 ? (
              <div style={styles.commentList}>
                {comments.map((comment) => (
                  <div key={comment.id} style={styles.commentCard}>
                    <div style={styles.commentHeader}>
                      <div>
                        <p style={{ ...styles.commentMeta, marginBottom: '2px' }}>
                          Worker: <strong>{comment.worker}</strong>
                        </p>
                        <p style={styles.commentMeta}>From: {comment.client}</p>
                      </div>
                      <span style={{ ...styles.badge, ...styles.badgeAdmin }}>
                        {comment.rating} ★
                      </span>
                    </div>

                    <p style={styles.commentText}>{comment.comment}</p>

                    <div style={styles.commentActions}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(comment.status === 'flagged'
                            ? styles.badgeDisabled
                            : comment.status === 'review'
                              ? { backgroundColor: '#ffedd5', color: '#9a3412', border: '1px solid #fed7aa' }
                              : styles.badgeActive),
                        }}
                      >
                        {comment.status}
                      </span>
                      <button
                        type="button"
                        style={styles.rowButton}
                        onClick={() => handleOpenDeleteComment(comment)}
                      >
                        Delete Comment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>No comments to moderate.</div>
            )}
            </article>
          </section>
        )}

        {activeSection !== 'overview' && (
          <p style={styles.sectionNavHint}>
            Use the top navigation to switch between admin sections.
          </p>
        )}
      </div>

      {accessActionTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
          <div style={{ width: 'min(92vw, 560px)', backgroundColor: themeTokens.surface, border: `1px solid ${themeTokens.border}`, borderRadius: '16px', padding: '20px', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)', display: 'grid', gap: '14px' }}>
            <div style={styles.panelTitleWrap}>
              <h2 style={styles.panelTitle}>{accessActionMode === 'ban' ? 'Ban Account' : 'Disable Account'}</h2>
              <p style={styles.panelDesc}>
                {accessActionMode === 'ban'
                  ? `Suspend ${accessActionTarget.name} for a custom duration.`
                  : `Soft-disable ${accessActionTarget.name} until an admin restores access.`}
              </p>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <label style={{ display: 'grid', gap: '6px', fontWeight: 700 }}>
                Reason
                <textarea
                  value={accessReason}
                  onChange={(event) => setAccessReason(event.target.value)}
                  rows={4}
                  style={{
                    borderRadius: '12px',
                    border: `1px solid ${themeTokens.border}`,
                    backgroundColor: themeTokens.surfaceAlt,
                    color: themeTokens.textPrimary,
                    padding: '12px',
                    resize: 'vertical',
                  }}
                  placeholder="Add the admin reason for this action"
                />
              </label>

              {accessActionMode === 'ban' && (
                <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 160px' }}>
                  <label style={{ display: 'grid', gap: '6px', fontWeight: 700 }}>
                    Duration
                    <input
                      type="number"
                      min="1"
                      value={accessDurationValue}
                      onChange={(event) => setAccessDurationValue(event.target.value)}
                      style={{
                        minHeight: '42px',
                        borderRadius: '12px',
                        border: `1px solid ${themeTokens.border}`,
                        backgroundColor: themeTokens.surfaceAlt,
                        color: themeTokens.textPrimary,
                        padding: '0 12px',
                      }}
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '6px', fontWeight: 700 }}>
                    Unit
                    <select
                      value={accessDurationUnit}
                      onChange={(event) => setAccessDurationUnit(event.target.value)}
                      style={{
                        minHeight: '42px',
                        borderRadius: '12px',
                        border: `1px solid ${themeTokens.border}`,
                        backgroundColor: themeTokens.surfaceAlt,
                        color: themeTokens.textPrimary,
                        padding: '0 12px',
                      }}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" style={{ ...styles.rowButton, ...styles.rowButtonMuted }} onClick={closeAccessAction}>
                Cancel
              </button>
              <button
                type="button"
                style={{
                  ...styles.rowButton,
                  backgroundColor: accessActionMode === 'ban' ? '#b45309' : '#dc2626',
                }}
                onClick={handleConfirmAccessAction}
              >
                {accessActionMode === 'ban' ? 'Ban Account' : 'Disable Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={Boolean(commentDeleteTarget)}
        appTheme={appTheme}
        title="Delete Comment"
        description="This moderation action removes the selected comment from the admin UI." 
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setCommentDeleteTarget(null)}
        onConfirm={() => handleDeleteComment(commentDeleteTarget?.id)}
      >
        <p style={{ margin: 0, color: themeTokens.textPrimary }}>
          Delete <strong>{commentDeleteTarget?.comment}</strong> from <strong>{commentDeleteTarget?.worker}</strong>?
        </p>
      </ConfirmActionModal>

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onCancel={handleCloseLogoutConfirm}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}

export default AdminDashboard;
