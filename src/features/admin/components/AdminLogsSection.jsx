/**
 * AdminLogsSection - View Component
 * 
 * Displays audit logs and activity history.
 * Pure presentation component.
 */

import PropTypes from 'prop-types';

function AdminLogsSection({ logs, styles }) {
  return (
    <section style={{ ...styles.contentGrid, gridTemplateColumns: '1fr' }}>
      <article style={styles.panel}>
        <div style={styles.panelHeader}>
          <div style={styles.panelTitleWrap}>
            <h2 style={styles.panelTitle}>Audit Logs</h2>
            <p style={styles.panelDesc}>
              Track user-wide activities in a readable log layout when audit events are available.
            </p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div style={styles.emptyState}>No audit logs are available from the database yet.</div>
        ) : (
          <div style={styles.activityList}>
          {logs.map((log) => (
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
        )}
      </article>
    </section>
  );
}

AdminLogsSection.propTypes = {
  logs: PropTypes.arrayOf(PropTypes.object).isRequired,
  styles: PropTypes.object.isRequired,
};

export default AdminLogsSection;
