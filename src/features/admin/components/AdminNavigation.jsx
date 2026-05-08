import React from 'react';
import { getThemeTokens } from '../../../shared/styles/themeTokens';

function AdminNavigation({ appTheme = 'light', activeSection = 'accounts', onSectionChange, onOpenDashboard, onOpenLogoutConfirm }) {
  const themeTokens = getThemeTokens(appTheme);

  const sections = [
    { key: 'overview', label: 'Overview', shortLabel: 'Overview' },
    { key: 'accounts', label: 'Account Management', shortLabel: 'Accounts' },
    { key: 'logs', label: 'Audit Logs', shortLabel: 'Logs' },
    { key: 'comments', label: 'Summary / Comments', shortLabel: 'Comments' },
  ];

  const styles = {
    nav: {
      position: 'sticky',
      top: 0,
      zIndex: 130,
      backgroundColor: themeTokens.navBg,
      borderBottom: `1px solid ${themeTokens.navBorder}`,
      boxShadow: themeTokens.shadowSoft,
    },
    inner: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0.75rem 1rem',
      display: 'grid',
      gridTemplateColumns: 'minmax(170px, 1fr) minmax(320px, 1.2fr) minmax(180px, 1fr)',
      alignItems: 'center',
      gap: '0.75rem',
    },
    brandWrap: { display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 },
    brand: {
      margin: 0,
      fontFamily: "'Times New Roman', Georgia, serif",
      fontSize: '1.85rem',
      fontWeight: 800,
      color: themeTokens.accent,
      lineHeight: 1,
      whiteSpace: 'nowrap',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '999px',
      padding: '4px 10px',
      fontSize: '12px',
      fontWeight: 800,
      backgroundColor: themeTokens.badgeBg,
      color: themeTokens.badgeText,
      whiteSpace: 'nowrap',
    },
    tabs: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    tab: {
      border: `1px solid ${themeTokens.border}`,
      backgroundColor: themeTokens.surface,
      color: themeTokens.textPrimary,
      borderRadius: '999px',
      padding: '0.62rem 1rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    tabActive: {
      backgroundColor: themeTokens.accent,
      color: '#ffffff',
      borderColor: themeTokens.accent,
      boxShadow: `0 10px 18px ${appTheme === 'dark' ? 'rgba(37, 99, 235, 0.24)' : 'rgba(37, 99, 235, 0.16)'}`,
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    actionButton: {
      border: `1px solid ${themeTokens.border}`,
      backgroundColor: themeTokens.surface,
      color: themeTokens.textPrimary,
      borderRadius: '999px',
      padding: '0.6rem 0.95rem',
      fontWeight: 700,
      cursor: 'pointer',
    },
    actionPrimary: {
      backgroundColor: themeTokens.accent,
      color: '#ffffff',
      borderColor: themeTokens.accent,
    },
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <div style={styles.brandWrap}>
          <h1 style={styles.brand}>GigLink</h1>
          <span style={styles.badge}>Admin</span>
        </div>

        <div style={styles.tabs}>
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              style={{ ...styles.tab, ...(activeSection === section.key ? styles.tabActive : {}) }}
              onClick={() => onSectionChange && onSectionChange(section.key)}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div style={styles.actions}>
          <button type="button" style={styles.actionButton} onClick={onOpenDashboard}>
            Back to App
          </button>
          <button type="button" style={{ ...styles.actionButton, ...styles.actionPrimary }} onClick={onOpenLogoutConfirm}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavigation;
