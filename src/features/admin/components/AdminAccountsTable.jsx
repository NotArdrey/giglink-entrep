/**
 * AdminAccountsTable - View Component
 * 
 * Displays admin accounts in a table with search/filter capabilities.
 * All state managed by parent - pure presentation only.
 */

import PropTypes from 'prop-types';

function AdminAccountsTable({
  normalizedAccounts,
  isAccountsLoading,
  accountsError,
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleFilterChange,
  roleSavingId,
  onUpdateRole,
  onOpenAccessAction,
  onRestoreAccount,
  themeTokens,
  styles,
}) {
  return (
    <section style={{ ...styles.contentGrid, gridTemplateColumns: '1fr' }}>
      <article style={styles.panel}>
        <div style={styles.panelHeader}>
          <div style={styles.panelTitleWrap}>
            <h2 style={styles.panelTitle}>Account Management</h2>
            <p style={styles.panelDesc}>
              View all accounts from the database, update roles for client/admin users, and apply soft disables or timed suspensions.
            </p>
          </div>
          <div style={styles.filterBar}>
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search name, email, role"
              style={styles.searchInput}
            />
            <select value={selectedRole} onChange={(event) => onRoleFilterChange(event.target.value)} style={styles.select}>
              <option value="all">All Roles</option>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {accountsError && <div style={{ ...styles.emptyState, marginBottom: '12px' }}>{accountsError}</div>}

        {isAccountsLoading && <div style={styles.emptyState}>Loading accounts from the database...</div>}

        {!isAccountsLoading && normalizedAccounts.length > 0 ? (
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
                          onClick={() => onUpdateRole(account, 'client')}
                        >
                          Set Client
                        </button>
                        <button
                          type="button"
                          style={{ ...styles.rowButton, ...styles.badgeAdmin }}
                          disabled={roleSavingId === account.id}
                          onClick={() => onUpdateRole(account, 'admin')}
                        >
                          Set Admin
                        </button>
                        {account.displayStatus === 'active' ? (
                          <>
                            <button
                              type="button"
                              style={{ ...styles.rowButton, ...styles.rowButtonMuted }}
                              onClick={() => onOpenAccessAction(account, 'disable')}
                            >
                              Disable
                            </button>
                            <button
                              type="button"
                              style={{ ...styles.rowButton, backgroundColor: '#b45309' }}
                              onClick={() => onOpenAccessAction(account, 'ban')}
                            >
                              Ban
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            style={{ ...styles.rowButton, backgroundColor: '#15803d' }}
                            onClick={() => onRestoreAccount(account)}
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
  );
}

AdminAccountsTable.propTypes = {
  normalizedAccounts: PropTypes.arrayOf(PropTypes.object).isRequired,
  isAccountsLoading: PropTypes.bool.isRequired,
  accountsError: PropTypes.string,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  selectedRole: PropTypes.string.isRequired,
  onRoleFilterChange: PropTypes.func.isRequired,
  roleSavingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onUpdateRole: PropTypes.func.isRequired,
  onOpenAccessAction: PropTypes.func.isRequired,
  onRestoreAccount: PropTypes.func.isRequired,
  themeTokens: PropTypes.object.isRequired,
  styles: PropTypes.object.isRequired,
};

export default AdminAccountsTable;
