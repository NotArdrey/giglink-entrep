import React, { useEffect, useState } from 'react';
import DashboardNavigation from '../../../shared/components/DashboardNavigation';
import InquiryChatModal from '../components/InquiryChatModal';
import SlotEditModal from '../components/SlotEditModal';
import ProfileEditModal from '../components/ProfileEditModal';
import ConfirmActionModal from '../components/modals/ConfirmActionModal';
import QrPreviewModal from '../components/modals/QrPreviewModal';
import CreateServiceModal from '../components/CreateServiceModal';
import SuccessNotification from '../../../shared/components/SuccessNotification';
import ErrorNotification from '../../../shared/components/ErrorNotification';
import { updateBookingWorkflow } from '../../bookings/services/bookingService';
import { useWorkPayments, useWorkProfileServices, useWorkSchedule } from '../hooks';
import {
  CalendarDays,
  ChevronDown,
  Loader2,
  MapPin,
  MessageSquareText,
  Pencil,
  Star,
  Trash2,
  UserRound,
  WalletCards,
} from 'lucide-react';

const formatDateLong = (date) =>
  date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const normalizeRateBasis = (value) => {
  const raw = String(value || '').trim().toLowerCase().replace(/_/g, '-');
  if (raw === 'per-hour' || raw === 'hourly') return 'per-hour';
  if (raw === 'per-day' || raw === 'daily') return 'per-day';
  if (raw === 'per-week' || raw === 'weekly') return 'per-week';
  if (raw === 'per-month' || raw === 'monthly') return 'per-month';
  if (raw === 'per-project' || raw === 'project' || raw === 'package' || raw === 'fixed' || raw === 'custom') return 'per-project';
  return '';
};

const classStyles = {
  'my-work-page': { minHeight: '100vh', background: '#f9f9f9', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", overflowX: 'hidden' },
  'my-work-header-bar': { background: 'white', borderBottom: '1px solid #eceff1', padding: '16px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' },
  'my-work-title': { fontSize: '24px', fontWeight: 700, color: '#2c3e50', margin: 0, textAlign: 'center' },
  'back-to-dashboard-btn': { padding: '10px 16px', background: 'white', color: '#2c3e50', border: '1px solid #eceff1', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease' },
  'header-spacer': { width: '148px' },
  'my-work-main': { width: '100%', maxWidth: '1120px', margin: '0 auto', padding: '40px 16px', boxSizing: 'border-box' },
  'empty-state-banner': { background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #fcd34d', borderRadius: '12px', padding: '40px 24px', textAlign: 'center', marginBottom: '32px' },
  'profile-summary-card': { background: 'white', borderRadius: '12px', padding: '28px', margin: '0 auto 32px', width: '100%', maxWidth: '1100px', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', alignItems: 'start' },
  'profile-info': { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  'profile-avatar': { width: '80px', height: '80px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, flexShrink: 0 },
  'profile-name-link': { border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: '24px', fontWeight: 700, color: '#2c3e50', margin: '0 0 4px 0' },
  'service-type': { fontSize: '14px', color: '#2563eb', fontWeight: 600, margin: '0 0 8px 0' },
  location: { fontSize: '14px', color: '#7f8c8d', margin: 0 },
  'service-mode-tag': { margin: '8px 0 0', fontSize: '12px', fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', display: 'inline-block', padding: '4px 8px', borderRadius: '999px' },
  'profile-stats': { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  stat: { textAlign: 'center', padding: '16px', background: '#f9f9f9', borderRadius: '8px' },
  'stat-number': { display: 'block', fontSize: '24px', fontWeight: 700, color: '#2563eb', marginBottom: '4px' },
  'stat-label': { display: 'block', fontSize: '12px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' },
  'inquiries-section': { width: '100%', maxWidth: '1100px', margin: '0 auto 48px' },
  'section-header': { marginBottom: '24px' },
  'section-subtitle': { fontSize: '14px', color: '#7f8c8d', margin: 0 },
  'inquiries-grid': { width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' },
  'inquiry-card': { width: '100%', boxSizing: 'border-box', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s ease', border: '1px solid transparent' },
  'inquiry-header': { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  'client-info': { display: 'flex', gap: '12px', flex: 1 },
  'client-photo': { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  'client-rating': { fontSize: '12px', color: '#f59e0b', margin: '4px 0 0 0' },
  'status-badge': { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  'status-pending': { background: '#fef3c7', color: '#92400e' },
  'status-waiting': { background: '#dbeafe', color: '#1e40af' },
  'status-negotiating': { background: '#fecdd3', color: '#831843' },
  'status-default': { background: '#e5e7eb', color: '#374151' },
  'inquiry-body': { marginBottom: '16px' },
  'inquiry-service': { fontSize: '15px', fontWeight: 600, color: '#2563eb', margin: '0 0 8px 0' },
  'inquiry-description': { fontSize: '14px', color: '#555', margin: '0 0 12px 0', lineHeight: 1.5 },
  'inquiry-meta': { display: 'flex', gap: '16px', fontSize: '12px', color: '#7f8c8d' },
  'inquiry-actions': { display: 'flex', gap: '8px' },
  'btn-respond': { flex: 1, padding: '10px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease' },
  'schedule-section': { width: '100%', maxWidth: '1100px', margin: '0 auto 48px' },
  'week-slider': { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px' },
  'week-nav-btn': { border: '1px solid #cbd5e1', background: '#f8fafc', color: '#1f2937', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' },
  'week-range': { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: '#1f2937' },
  'calendar-availability-grid': { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' },
  'calendar-day-card': { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' },
  'calendar-date': { margin: '0 0 6px', color: '#1f2937', fontSize: '17px' },
  'calendar-booked': { margin: '0 0 4px', color: '#166534', fontSize: '13px', fontWeight: 700 },
  'calendar-note': { margin: 0, color: '#6b7280', fontSize: '13px' },
  'calendar-bookings-list': { marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #d1d5db', display: 'grid', gap: '6px' },
  'schedule-grid': { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  'schedule-day-card': { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
  'day-header': { fontSize: '18px', fontWeight: 700, color: '#2c3e50', margin: 0, paddingBottom: '12px', borderBottom: '2px solid #2563eb' },
  'day-date': { margin: '8px 0 12px', fontSize: '12px', color: '#64748b' },
  'no-slots': { fontSize: '14px', color: '#95a5a6', textAlign: 'center', padding: '20px 0', margin: 0 },
  'time-blocks': { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' },
  'time-block': { padding: '16px', border: '1px solid #eceff1', borderRadius: '8px', background: '#f9f9f9', position: 'relative', transition: 'all 0.3s ease' },
  'slot-available': { border: '1px solid #bfdbfe', background: '#eff6ff' },
  'slot-half': { border: '1px solid #fef3c7', background: '#fffbeb' },
  'slot-full': { border: '1px solid #fecaca', background: '#fef2f2', opacity: 0.7 },
  'block-time': { fontSize: '15px', fontWeight: 700, color: '#2c3e50', marginBottom: '8px' },
  'block-status': { marginBottom: '8px' },
  'slots-counter': { display: 'block', fontSize: '12px', color: '#555', marginBottom: '4px' },
  'status-bar': { width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' },
  'filled-bar': { height: '100%', background: 'linear-gradient(90deg, #2563eb, #1d4ed8)', transition: 'width 0.3s ease' },
  'bookings-preview': { fontSize: '12px', color: '#555', margin: '8px 0', padding: '8px', background: 'rgba(0, 0, 0, 0.03)', borderRadius: '4px', display: 'grid', gap: '6px' },
  'booking-item': { padding: 0, margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minHeight: '24px' },
  'booking-name': { fontWeight: 600, color: '#1f2937', fontSize: '12px', flexShrink: 0, minWidth: 'fit-content' },
  'booking-inline-actions': { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 },
  'recurring-cycle-pill': { display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: '999px', background: '#dbeafe', color: '#1e3a8a', fontSize: '11px', fontWeight: 700, height: '24px', whiteSpace: 'nowrap' },
  'lock-hint': { fontSize: '11px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' },
  'booking-item-checks': { fontSize: '11px', color: '#374151', whiteSpace: 'nowrap' },
  'check-toggle': { display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' },
  compact: { fontSize: '11px', padding: 0, height: '24px', display: 'flex', alignItems: 'center', gap: '4px' },
  'mark-done-btn': { border: 'none', background: '#27ae60', color: '#fff', borderRadius: '6px', padding: '5px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', height: '24px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' },
  'done-pill': { display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '999px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, height: '24px', whiteSpace: 'nowrap' },
  'block-actions': { display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' },
  'action-btn': { width: '28px', height: '28px', padding: 0, background: 'white', border: '1px solid #eceff1', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  'btn-add-slot': { width: '100%', padding: '10px', background: 'white', color: '#2563eb', border: '2px dashed #2563eb', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease' },
  'stats-footer': { width: '100%', maxWidth: '1100px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', margin: '48px auto 0' },
  'stat-card': { background: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
  'stat-value': { fontSize: '32px', fontWeight: 700, color: '#2563eb', margin: '0 0 4px 0' },
  'stat-desc': { fontSize: '12px', color: '#95a5a6', margin: 0 },
  'done-confirm-overlay': { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '14px' },
  'done-confirm-modal': { width: 'min(620px, 92vw)', background: '#ffffff', borderRadius: '12px', padding: '22px', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.25)' },
  'done-confirm-note': { marginTop: '10px', fontSize: '13px' },
  'done-confirm-actions': { marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  'done-cancel-btn': { border: 'none', borderRadius: '8px', minHeight: '44px', padding: '10px 14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: '#e5e7eb', color: '#111827' },
  'done-confirm-btn': { border: 'none', borderRadius: '8px', minHeight: '44px', padding: '10px 14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: '#16a34a', color: '#fff' },
  'delete-confirm-btn': { border: 'none', borderRadius: '8px', minHeight: '44px', padding: '10px 14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: '#dc2626', color: '#fff' },
  'gcash-qr-btn': { border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', padding: '5px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', height: '24px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  'profile-gcash-btn': { marginTop: '8px' },
  'gcash-preview-modal': { width: 'min(520px, 92vw)' },
  'gcash-preview-body': { marginTop: '12px', display: 'flex', gap: '14px', alignItems: 'flex-start' },
  'gcash-preview-qr': { width: '170px', height: '170px', borderRadius: '8px', border: '1px solid #d1d5db' },
  'payment-confirm-section': { width: '100%', maxWidth: '1100px', margin: '0 auto 40px' },
  'payment-confirm-grid': { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' },
  'payment-confirm-card': { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', display: 'grid', gap: '8px' },
  'payment-confirm-meta': { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  'confirm-status-pill': { display: 'inline-flex', alignItems: 'center', borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 },
  'confirm-status-pending': { background: '#ffedd5', color: '#9a3412' },
  'confirm-status-approved': { background: '#dcfce7', color: '#166534' },
  'confirm-status-denied': { background: '#fee2e2', color: '#b91c1c' },
  'payment-confirm-actions': { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  'btn-approve-cash': { border: 'none', background: '#16a34a', color: '#fff', borderRadius: '7px', padding: '8px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' },
  'btn-deny-cash': { border: 'none', background: '#dc2626', color: '#fff', borderRadius: '7px', padding: '8px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' },
  'btn-gcash-preview': { border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', padding: '5px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', height: '24px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px' },
  'payment-qr-grid': { marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' },
  'payment-qr-item': { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', background: '#f8fafc', textAlign: 'center' },
  'payment-qr-title': { margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#1f2937' },
  'payment-qr-caption': { margin: '6px 0 0', fontSize: '12px', color: '#6b7280' },
  'section-filter-row': { display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '0 auto 18px', width: '100%', maxWidth: '1100px' },
  'section-filter-btn': { padding: '8px 12px', borderRadius: '999px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontSize: '12px', fontWeight: 700, cursor: 'pointer' },
  'section-filter-btn-active': { background: '#1d4ed8', color: '#ffffff', borderColor: '#1d4ed8' },
  'refund-section': { width: '100%', maxWidth: '1100px', margin: '0 auto 40px' },
  'refund-grid': { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' },
  'refund-card': { background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', padding: '14px', display: 'grid', gap: '8px' },
  'refund-actions': { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  'btn-approve-refund': { border: 'none', background: '#4f46e5', color: '#fff', borderRadius: '7px', padding: '8px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' },
  'cancelled-section': { width: '100%', maxWidth: '1100px', margin: '0 auto 40px' },
  'cancelled-grid': { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' },
  'cancelled-card': { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', display: 'grid', gap: '8px' },
};

const hoverStyles = {
  backButton: { background: '#f9f9f9', border: '1px solid #2563eb', color: '#2563eb' },
  logoutButton: { background: '#fee', border: '1px solid #e74c3c' },
  profileName: { color: '#1d4ed8', textDecoration: 'underline' },
  inquiryCard: { boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)', border: '1px solid #2563eb', transform: 'translateY(-2px)' },
  respondButton: { background: '#1d4ed8', transform: 'translateY(-1px)' },
  weekNav: { background: '#eef2ff', border: '1px solid #818cf8' },
  gcashButton: { background: '#dbeafe', border: '1px solid #93c5fd' },
  markDone: { background: '#219653' },
  addSlot: { background: '#eff6ff', border: '2px dashed #1d4ed8', color: '#1d4ed8' },
  editAction: { background: '#dbeafe', border: '1px solid #2563eb' },
  deleteAction: { background: '#fecaca', border: '1px solid #e74c3c' },
  deleteConfirm: { background: '#b91c1c' },
  approveCash: { background: '#15803d' },
  denyCash: { background: '#b91c1c' },
  approveRefund: { background: '#4338ca' },
};

/**
 * - In production, these would be fetched from an API based on sellerProfile.id
 * - Conditional rendering checks the "hasService" flag to show Empty vs. Active states
 *
 * STATE MACHINE:
 * - If hasService === false: Show "Welcome! Setup your profile" banner
 * - If hasService === true: Show Active Inquiries + Schedule sections
 * - isSelectedChat: Controls which inquiry's chat is displayed (null = no chat open)
 *
 * DEMO DATA STRUCTURE:
 * inquiries: [{ id, clientName, service, status, requestDate }, ...]
 * schedules: { 'Mon': [...timeBlocks], 'Tue': [...], ... }
 */
const MyWork = ({ appTheme = 'light', currentView, searchQuery, onSearchChange, onLogout, onOpenSellerSetup, onOpenMyBookings, sellerProfile, onOpenMyWork, onOpenProfile, onOpenAccountSettings, onOpenSettings, onOpenDashboard, onOpenBrowseServices, onBackToDashboard, onAddNewWork, onOpenAdminDashboard }) => {
  // ============ STATE MANAGEMENT ============

  const [selectedChatId, setSelectedChatId] = useState(null);
  const [doneConfirmTarget, setDoneConfirmTarget] = useState(null);
  const [profileEditModalOpen, setProfileEditModalOpen] = useState(false);
  const [isGcashPreviewOpen, setIsGcashPreviewOpen] = useState(false);
  const [isCashQrPreviewOpen, setIsCashQrPreviewOpen] = useState(false);
  const [hoverKey, setHoverKey] = useState('');
  const [workSectionFilter, setWorkSectionFilter] = useState('all'); // all | inquiries | cash-approvals | refunds | cancelled
  const [isWorkNavDropdownOpen, setIsWorkNavDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  const {
    closeCreateService,
    currentProfile,
    handleCreateServiceChange,
    handleCreateServiceSubmit,
    handleSaveProfileEdit,
    hasSellerRecord,
    isCreateServiceOpen,
    isLoadingSellerData,
    newService,
    sellerData,
    sellerDataError,
    sellerDbServices,
    sellerId,
    setIsCreateServiceOpen,
    setSellerDataError,
    setSuccessMessage,
    showSetupBanner,
    successMessage,
  } = useWorkProfileServices({ sellerProfile });

  const {
    calendarAvailability,
    closeSlotModal,
    currentWeekMonday,
    currentWeekSunday,
    dayKeys,
    deleteConfirmTarget,
    editSlotData,
    editSlotDayKey,
    editSlotModalOpen,
    handleAddSlot,
    handleConfirmDelete,
    handleDeleteSlot,
    handleEditSlot,
    handleSaveSlotEdit,
    scheduleMode,
    setDeleteConfirmTarget,
    setWeekOffset,
    slotModalType,
    weekDateByDay,
    weekOffset,
    weekRangeLabel,
    weeklySchedule,
  } = useWorkSchedule({ sellerId, currentProfile });

  const {
    cancelledCashTransactions,
    cashConfirmationNotifications,
    cashDecisionTarget,
    cashPaymentView,
    handleApproveRefund,
    handleCloseCashDecisionModal,
    handleConfirmCashDecision,
    handleRequestCashConfirmationReview,
    paymentError,
    refundTransactions,
    refreshSellerTransactions,
    setCashPaymentView,
    setPaymentError,
    setTransactions,
    transactions,
    weekTransactions,
  } = useWorkPayments({ sellerId, weekOffset });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeInquiries = transactions
    .filter((txn) => !['Completed Service', 'Refunded', 'Cancelled (Cash)'].includes(txn.bookingStatus))
    .map((txn) => ({
      id: txn.sourceBookingId || txn.id,
      clientName: txn.clientName,
      clientPhoto: '',
      clientRating: null,
      service: txn.service,
      description: txn.rawBooking?.description || 'Service booking request',
      status: txn.bookingStatus || 'Service Scheduled',
      requestDate: txn.rawBooking?.requestDate || '',
      proposedBudget: txn.expectedCashAmount ? `PHP ${txn.expectedCashAmount}` : 'See booking',
      messages: 0,
      booking: txn.rawBooking,
    }));  
  const getTransactionForBooking = (scheduleRef, clientName) => {
    const matches = weekTransactions.filter(
      (txn) => txn.scheduleRef === scheduleRef && txn.clientName === clientName
    );

    if (matches.length === 0) return undefined;

    if (currentProfile?.rateBasis === 'per-month') {
      const monthlyMatch = matches.find((txn) => txn.recurringCycle === 'monthly');
      if (monthlyMatch) return monthlyMatch;
    }

    return matches[0];
  };

  const isMonthlyRecurringTxn = (txn) => txn?.recurringCycle === 'monthly' && !!txn?.subscriptionId;

  const getSubscriptionTransactions = (subscriptionId) =>
    transactions.filter((txn) => txn.subscriptionId === subscriptionId);

  const isLastCycleEntry = (txn) => {
    if (!isMonthlyRecurringTxn(txn)) return false;
    const cycleEntries = getSubscriptionTransactions(txn.subscriptionId);
    const maxOrder = Math.max(...cycleEntries.map((entry) => entry.cycleOrder || 0));
    return (txn.cycleOrder || 0) === maxOrder;
  };

  const canTogglePaid = (txn) => {
    if (!txn) return false;
    if (!isMonthlyRecurringTxn(txn)) return true;
    if (txn.paymentLocked) return false;

    if (txn.paymentMode === 'Advance') {
      return !txn.isPaid;
    }

    if (txn.paymentMode === 'After Service') {
      return isLastCycleEntry(txn) && txn.isDone;
    }

    return true;
  };

  const canMarkDone = (txn) => {
    if (!txn) return false;
    if (!isMonthlyRecurringTxn(txn)) return !txn.isDone;

    if (txn.paymentMode === 'After Service') {
      return !txn.isDone && isLastCycleEntry(txn);
    }

    return !txn.isDone;
  };

  // ============ EVENT HANDLERS ============
  
  /**
   * handleRespondClick(inquiryId)
   * Opens the chat modal for a specific inquiry
   */
  const handleRespondClick = (inquiryId) => {
    setSelectedChatId(inquiryId);
  };
  
  /**
   * handleCloseChat()
   * Closes the chat modal
   */
  const handleCloseChat = () => {
    setSelectedChatId(null);
  };
  
  const handleTogglePaid = (transactionId) => {
    const target = transactions.find((txn) => txn.id === transactionId);
    if (!target) return;
    const persistPaidState = (nextPaid) => {
      if (!target.sourceBookingId) return;
      updateBookingWorkflow(target.sourceBookingId, {
        paymentProofSubmitted: nextPaid,
        paymentReference: nextPaid ? (target.transactionId || `MANUAL-${String(target.id).slice(0, 8).toUpperCase()}`) : '',
      }).catch((error) => {
        setPaymentError(error?.message || 'Unable to update payment status.');
      });
    };

    // Monthly recurring rules:
    // 1) Advance: first paid marks whole cycle paid + locks paid toggle.
    // 2) After Service: only last cycle entry can trigger paid state for all previous weeks.
    if (isMonthlyRecurringTxn(target)) {
      if (!canTogglePaid(target)) return;

      if (target.paymentMode === 'Advance') {
        setTransactions((prev) =>
          prev.map((txn) =>
            txn.subscriptionId === target.subscriptionId
              ? { ...txn, isPaid: true, paymentLocked: true }
              : txn
          )
        );
        persistPaidState(true);
        return;
      }

      if (target.paymentMode === 'After Service') {
        setTransactions((prev) =>
          prev.map((txn) =>
            txn.subscriptionId === target.subscriptionId
              ? { ...txn, isPaid: true, paymentLocked: true }
              : txn
          )
        );
        persistPaidState(true);
        return;
      }
    }

    const nextPaid = !target.isPaid;
    setTransactions((prev) =>
      prev.map((txn) => {
        if (txn.id !== transactionId) return txn;
        return { ...txn, isPaid: nextPaid };
      })
    );
    persistPaidState(nextPaid);
  };

  const handleOpenDoneModal = (transaction) => {
    setDoneConfirmTarget(transaction);
  };

  const handleConfirmDone = () => {
    if (!doneConfirmTarget) return;
    const persistDoneState = () => {
      if (!doneConfirmTarget.sourceBookingId) return;
      updateBookingWorkflow(doneConfirmTarget.sourceBookingId, {
        status: 'Completed Service',
        canRate: true,
        paymentProofSubmitted: doneConfirmTarget.isPaid || doneConfirmTarget.paymentMode === 'Advance',
        paymentReference: doneConfirmTarget.transactionId || undefined,
        dbStatus: 'completed',
      }).catch((error) => {
        setPaymentError(error?.message || 'Unable to update service completion.');
      });
    };

    // Monthly after-service rule: if final cycle entry is marked done,
    // mark whole cycle paid and lock the paid state.
    if (isMonthlyRecurringTxn(doneConfirmTarget) && doneConfirmTarget.paymentMode === 'After Service' && isLastCycleEntry(doneConfirmTarget)) {
      setTransactions((prev) =>
        prev.map((txn) => {
          if (txn.subscriptionId === doneConfirmTarget.subscriptionId) {
            return {
              ...txn,
              isPaid: true,
              paymentLocked: true,
              isDone: txn.isDone || txn.id === doneConfirmTarget.id,
            };
          }

          if (txn.id === doneConfirmTarget.id) {
            return {
              ...txn,
              isDone: true,
            };
          }

          return txn;
        })
      );
      persistDoneState();
      setDoneConfirmTarget(null);
      return;
    }

    setTransactions((prev) =>
      prev.map((txn) =>
        txn.id === doneConfirmTarget.id
          ? {
              ...txn,
              isDone: true,
              isPaid: txn.isPaid || doneConfirmTarget.paymentMode === 'Advance',
            }
          : txn
      )
    );
    persistDoneState();
    setDoneConfirmTarget(null);
  };

  const handleOpenProfileEdit = () => {
    setProfileEditModalOpen(true);
  };

  const handleProfileEditSave = async (updatedData) => {
    await handleSaveProfileEdit(updatedData);
    setProfileEditModalOpen(false);
  };

  const handleOpenGcashPreview = () => {
    setIsGcashPreviewOpen(true);
  };

  const handleCloseGcashPreview = () => {
    setIsGcashPreviewOpen(false);
  };

  const handleOpenCashQrPreview = () => {
    setIsCashQrPreviewOpen(true);
  };

  const handleCloseCashQrPreview = () => {
    setIsCashQrPreviewOpen(false);
  };

  const responsiveClassStyles = isMobile
    ? {
        'my-work-header-bar': { padding: '12px', gap: '8px', flexWrap: 'wrap' },
        'my-work-title': { width: '100%', textAlign: 'center', fontSize: '20px', order: 2 },
        'back-to-dashboard-btn': { padding: '8px 10px', fontSize: '12px', order: 1, position: 'static' },
        'header-spacer': { display: 'none' },
        'my-work-main': { width: '100%', maxWidth: '640px', margin: '0 auto', padding: '18px 10px', boxSizing: 'border-box' },
        'empty-state-banner': { padding: '24px 14px' },
        'profile-summary-card': { gridTemplateColumns: '1fr', gap: '16px', padding: '16px' },
        'profile-info': { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
        'profile-name-link': { fontSize: '20px' },
        location: { textAlign: 'center' },
        'profile-stats': { gridTemplateColumns: '1fr' },
        'inquiries-section': { width: '100%', maxWidth: '600px', margin: '0 auto 32px' },
        'section-header': { textAlign: 'center' },
        'inquiries-grid': { width: '100%', maxWidth: '600px', margin: '0 auto', gridTemplateColumns: '1fr', justifyItems: 'center' },
        'inquiry-card': { width: '100%', maxWidth: '560px', margin: '0 auto' },
        'inquiry-meta': { flexWrap: 'wrap', gap: '8px' },
        'inquiry-actions': { flexDirection: 'column' },
        'week-slider': { flexDirection: 'column', alignItems: 'stretch' },
        'calendar-availability-grid': { gridTemplateColumns: '1fr' },
        'schedule-grid': { gridTemplateColumns: '1fr' },
        'booking-item': { flexDirection: 'column', alignItems: 'flex-start', gap: '6px' },
        'booking-name': { minWidth: 0 },
        'booking-inline-actions': { width: '100%', flexWrap: 'wrap' },
        'stats-footer': { gridTemplateColumns: '1fr', marginTop: '24px' },
        'gcash-preview-body': { flexDirection: 'column', alignItems: 'center' },
        'gcash-preview-qr': { width: '100%', maxWidth: '220px', height: 'auto' },
        'payment-confirm-grid': { gridTemplateColumns: '1fr' },
        'payment-qr-grid': { gridTemplateColumns: '1fr' },
        'section-filter-row': { justifyContent: 'center' },
        'refund-grid': { gridTemplateColumns: '1fr' },
        'cancelled-grid': { gridTemplateColumns: '1fr' },
      }
    : {};

  const sx = (...names) =>
    names.reduce(
      (acc, name) => ({
        ...acc,
        ...(classStyles[name] || {}),
        ...(responsiveClassStyles[name] || {}),
      }),
      {}
    );

  const isHovered = (key) => hoverKey === key;

  const gcashNumber = currentProfile?.gcashNumber || '09054891105';
  const currentRateBasis = normalizeRateBasis(
    currentProfile?.raw?.metadata?.rate_basis ||
    currentProfile?.raw?.rate_basis ||
    currentProfile?.raw?.price_type ||
    currentProfile?.rateBasis ||
    currentProfile?.pricingModel
  ) || 'per-project';
  const currentPriceValue = (() => {
    if (currentProfile?.raw?.base_price != null) return currentProfile.raw.base_price;
    if (currentRateBasis === 'per-hour') return currentProfile?.hourlyRate ?? currentProfile?.fixedPrice;
    if (currentRateBasis === 'per-day') return currentProfile?.dailyRate ?? currentProfile?.fixedPrice;
    if (currentRateBasis === 'per-week') return currentProfile?.weeklyRate ?? currentProfile?.fixedPrice;
    if (currentRateBasis === 'per-month') return currentProfile?.monthlyRate ?? currentProfile?.fixedPrice;
    return currentProfile?.fixedPrice ?? null;
  })();
  const currentPriceLabel =
    currentProfile?.pricingModel === 'inquiry'
      ? 'Price on inquiry'
      : currentPriceValue
        ? `P${currentPriceValue}/${
          currentRateBasis === 'per-day'
            ? 'day'
            : currentRateBasis === 'per-hour'
              ? 'hr'
              : currentRateBasis === 'per-week'
                ? 'wk'
                : currentRateBasis === 'per-month'
                  ? 'mo'
                  : 'project'
        }`
        : 'Custom pricing';
  const cashQrId = currentProfile?.cashQrId || `CASHQR-${(currentProfile?.fullName || 'WORKER').replace(/\s+/g, '-').toUpperCase()}`;
  const gcashQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`GCash-${gcashNumber}`)}`;
  const cashConfirmQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`CASH-CONFIRM-${currentProfile?.fullName || 'Worker'}-${gcashNumber}`)}`;
  
  const showInquiriesSection = workSectionFilter === 'all' || workSectionFilter === 'inquiries';
  const showCashApprovalSection = workSectionFilter === 'all' || workSectionFilter === 'cash-approvals';
  const showRefundSection = workSectionFilter === 'all' || workSectionFilter === 'refunds';
  const showCancelledSection = workSectionFilter === 'all' || workSectionFilter === 'cancelled';
  const showScheduleSection = workSectionFilter === 'all' || workSectionFilter === 'schedule';
  const workSectionOptions = [
    { label: 'Show All', value: 'all', description: 'Overview of every work section' },
    { label: 'Active Inquiries', value: 'inquiries', description: 'Client requests waiting for a response' },
    { label: 'Payment Confirmations', value: 'cash-approvals', description: 'Cash payment review queue' },
    { label: 'Refund Cases', value: 'refunds', description: 'GCash refund tracking' },
    { label: 'Cancelled Bookings', value: 'cancelled', description: 'Cancelled cash bookings' },
    { label: 'Weekly Schedule', value: 'schedule', description: 'Weekly availability and booking blocks' },
  ];
  const activeWorkSectionLabel = workSectionOptions.find((option) => option.value === workSectionFilter)?.label || 'Show All';
  
  // ============ HELPER FUNCTIONS ============
  
  /**
   * getInquiryById(id)
   * Retrieves inquiry data for a specific ID
   */
  const getInquiryById = (id) => activeInquiries.find(inq => inq.id === id);
  
  /**
   * getSlotStatusColor(slotsLeft, capacity)
   * Returns CSS class for slot availability coloring
   */
  const getSlotStatusColor = (slotsLeft, capacity) => {
    if (slotsLeft === 0) return 'slot-full';
    if (slotsLeft <= capacity / 2) return 'slot-half';
    return 'slot-available';
  };
  
  /**
   * getStatusBadgeColor(status)
   * Returns CSS class for inquiry status badge color
   */
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending Response': return 'status-pending';
      case 'Waiting for Reply': return 'status-waiting';
      case 'Negotiating Price': return 'status-negotiating';
      default: return 'status-default';
    }
  };
  
  // Currently selected inquiry for chat
  const selectedInquiry = selectedChatId ? getInquiryById(selectedChatId) : null;
  
  // ============ RENDER ============
  
  return (
    <div style={sx('my-work-page')} data-testid="my-work-page">
      <DashboardNavigation
        appTheme={appTheme}
        currentView={currentView}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onLogout={onLogout}
        onOpenSellerSetup={onOpenSellerSetup}
        onOpenMyBookings={onOpenMyBookings}
        sellerProfile={sellerProfile}
        onOpenMyWork={onOpenMyWork}
        onOpenProfile={onOpenProfile}
        onOpenAccountSettings={onOpenAccountSettings}
        onOpenSettings={onOpenSettings}
        onOpenDashboard={onOpenDashboard}
        onOpenBrowseServices={onOpenBrowseServices}
        isAdminView={false}
        onToggleAdminView={() => { if (typeof onOpenAdminDashboard === 'function') onOpenAdminDashboard(); }}
      />
      
      <main style={sx('my-work-main')}>

        {/* Inline notifications */}
        {successMessage && (
          <SuccessNotification
            message={successMessage}
            isVisible={Boolean(successMessage)}
            onClose={() => setSuccessMessage('')}
          />
        )}
        {(sellerDataError || paymentError) && (
          <ErrorNotification
            message={sellerDataError || paymentError}
            isVisible={Boolean(sellerDataError || paymentError)}
            onClose={() => {
              setSellerDataError(null);
              setPaymentError('');
            }}
          />
        )}

        {/* Loading state while fetching seller data */}
        {isLoadingSellerData && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
            <Loader2 size={30} className="gl-spin" aria-hidden="true" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', fontWeight: 500 }}>Loading your seller profile…</p>
          </div>
        )}

        {!isLoadingSellerData && (
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
            Synced services: {(sellerDbServices || []).length}
          </p>
        )}

        {showSetupBanner && (
          <div style={sx('empty-state-banner')}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#78350f', margin: '0 0 8px 0' }}>Welcome! Setup your profile</h2>
            <p style={{ fontSize: '16px', color: '#92400e', margin: '0 0 20px 0' }}>Complete your service profile to start receiving inquiries from clients.</p>
            <button
              style={{
                padding: '12px 28px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                ...(isHovered('empty-add-work') ? { background: '#d97706' } : {}),
              }}
              onMouseEnter={() => setHoverKey('empty-add-work')}
              onMouseLeave={() => setHoverKey('')}
              onClick={onAddNewWork}
            >
              Get Started
            </button>
          </div>
        )}
        
        {!isLoadingSellerData && hasSellerRecord && (
          <>
            <div style={sx('profile-summary-card')}>
              <div style={sx('profile-info')}>
                <div style={sx('profile-avatar')}>
                  {currentProfile?.fullName?.charAt(0) || '?'}
                </div>
                <div>
                  <button
                    style={{ ...sx('profile-name-link'), ...(isHovered('profile-name') ? hoverStyles.profileName : {}) }}
                    onMouseEnter={() => setHoverKey('profile-name')}
                    onMouseLeave={() => setHoverKey('')}
                    onClick={handleOpenProfileEdit}
                    title="Edit profile details"
                  >
                    {currentProfile?.fullName || 'Service Provider'}
                  </button>
                  <p style={sx('service-type')}>{currentProfile?.serviceType || 'Service Type'}</p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                    {currentPriceLabel}
                  </p>
                  <p style={sx('location')} className="gl-inline-icon-line">
                    <MapPin size={14} aria-hidden="true" />
                    {currentProfile?.location?.address || currentProfile?.location?.barangay || 'Sabang'}, {currentProfile?.location?.city || 'Baliwag'}, {currentProfile?.location?.province || 'Bulacan'}
                  </p>
                  <p style={sx('service-mode-tag')}>
                    Scheduling: {scheduleMode === 'calendar-only' ? 'Calendar Only' : 'With Slots'}
                  </p>
                  <button
                    style={{ ...sx('gcash-qr-btn', 'profile-gcash-btn'), ...(isHovered('profile-gcash-btn') ? hoverStyles.gcashButton : {}) }}
                    onMouseEnter={() => setHoverKey('profile-gcash-btn')}
                    onMouseLeave={() => setHoverKey('')}
                    onClick={handleOpenGcashPreview}
                  >
                    GCash QR
                  </button>
                  <button
                    style={{ ...sx('btn-gcash-preview', 'profile-gcash-btn'), ...(isHovered('profile-cash-btn') ? hoverStyles.gcashButton : {}) }}
                    onMouseEnter={() => setHoverKey('profile-cash-btn')}
                    onMouseLeave={() => setHoverKey('')}
                    onClick={handleOpenCashQrPreview}
                  >
                    Cash Confirm QR
                  </button>
                </div>
              </div>
              <div style={sx('profile-stats')}>
                <div style={sx('stat')}>
                  <span style={sx('stat-number')}>{activeInquiries.length}</span>
                  <span style={sx('stat-label')}>Active Inquiries</span>
                </div>
                <div style={sx('stat')}>
                  <span style={sx('stat-number')}>0</span>
                  <span style={sx('stat-label')}>Avg Rating</span>
                </div>
                <div style={sx('stat')}>
                  <span style={sx('stat-number')}>0</span>
                  <span style={sx('stat-label')}>Completed</span>
                </div>
              </div>
            </div>

            <div style={{ ...sx('section-filter-row'), justifyContent: 'flex-start', position: 'relative' }}>
              <div style={{ position: 'relative', minWidth: isMobile ? '100%' : '320px' }}>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: isWorkNavDropdownOpen ? '0 8px 24px rgba(37, 99, 235, 0.12)' : 'none',
                  }}
                  onClick={() => setIsWorkNavDropdownOpen((prev) => !prev)}
                >
                  <span>Navigate Work Sections</span>
                  <span style={{ color: '#2563eb', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {activeWorkSectionLabel}
                    <ChevronDown size={14} aria-hidden="true" />
                  </span>
                </button>

                {isWorkNavDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    left: 0,
                    background: '#ffffff',
                    border: '1px solid #dbe4ee',
                    borderRadius: '12px',
                    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.14)',
                    zIndex: 20,
                    overflow: 'hidden',
                  }}>
                    {workSectionOptions.map((option, index) => {
                      const isSelected = workSectionFilter === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 14px',
                            border: 'none',
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#1d4ed8' : '#0f172a',
                            cursor: 'pointer',
                            borderBottom: index < workSectionOptions.length - 1 ? '1px solid #eef2f7' : 'none',
                          }}
                          onClick={() => {
                            setWorkSectionFilter(option.value);
                            setIsWorkNavDropdownOpen(false);
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{option.label}</div>
                          <div style={{ fontSize: '12px', color: isSelected ? '#2563eb' : '#64748b', marginTop: '2px' }}>{option.description}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {showInquiriesSection && <section style={sx('inquiries-section')} data-testid="work-inquiries-section">
              <div style={sx('section-header')}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#2c3e50', margin: '0 0 4px 0' }}>Active Inquiries ({activeInquiries.length})</h2>
                <p style={sx('section-subtitle')}>Clients waiting for your response</p>
              </div>
              
              <div style={sx('inquiries-grid')}>
                {activeInquiries.map(inquiry => (
                  <div
                    key={inquiry.id}
                    style={{ ...sx('inquiry-card'), ...(isHovered(`inquiry-${inquiry.id}`) ? hoverStyles.inquiryCard : {}) }}
                    onMouseEnter={() => setHoverKey(`inquiry-${inquiry.id}`)}
                    onMouseLeave={() => setHoverKey('')}
                  >
                    <div style={sx('inquiry-header')}>
                      <div style={sx('client-info')}>
                        <img
                          src={inquiry.clientPhoto}
                          alt={inquiry.clientName}
                          style={sx('client-photo')}
                        />
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#2c3e50', margin: 0 }}>{inquiry.clientName}</h3>
                          <p style={sx('client-rating')} className="gl-inline-icon-line">
                            <Star size={13} fill="currentColor" aria-hidden="true" />
                            {inquiry.clientRating} rating
                          </p>
                        </div>
                      </div>
                      <span style={sx('status-badge', getStatusBadgeColor(inquiry.status))}>
                        {inquiry.status}
                      </span>
                    </div>
                    
                    <div style={sx('inquiry-body')}>
                      <p style={sx('inquiry-service')}>{inquiry.service}</p>
                      <p style={sx('inquiry-description')}>{inquiry.description}</p>
                      <div style={sx('inquiry-meta')}>
                        <span className="gl-inline-icon-line"><WalletCards size={13} aria-hidden="true" /> {inquiry.proposedBudget}</span>
                        <span className="gl-inline-icon-line"><CalendarDays size={13} aria-hidden="true" /> {inquiry.requestDate}</span>
                      </div>
                    </div>
                    
                    <div style={sx('inquiry-actions')}>
                      <button
                        style={{ ...sx('btn-respond'), ...(isHovered(`respond-${inquiry.id}`) ? hoverStyles.respondButton : {}) }}
                        onMouseEnter={() => setHoverKey(`respond-${inquiry.id}`)}
                        onMouseLeave={() => setHoverKey('')}
                        onClick={() => handleRespondClick(inquiry.id)}
                      >
                        <MessageSquareText size={16} aria-hidden="true" />
                        Respond {inquiry.messages > 0 && `(${inquiry.messages})`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>}

            {showCashApprovalSection && <section style={sx('payment-confirm-section')} data-testid="work-cash-section">
              <div style={sx('section-header')}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#2c3e50', margin: '0 0 4px 0' }}>Payment Confirmations (Cash)</h2>
                <p style={sx('section-subtitle')}>Worker review queue for face-to-face cash confirmations scanned via Cash QR.</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: cashPaymentView === 'pending' ? '#2563eb' : '#e2e8f0',
                      color: cashPaymentView === 'pending' ? '#ffffff' : '#0f172a',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                    onClick={() => setCashPaymentView('pending')}
                  >
                    Pending Review
                  </button>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: cashPaymentView === 'history' ? '#2563eb' : '#e2e8f0',
                      color: cashPaymentView === 'history' ? '#ffffff' : '#0f172a',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                    onClick={() => setCashPaymentView('history')}
                  >
                    History
                  </button>
                </div>
              </div>

              {cashConfirmationNotifications.length === 0 ? (
                <div style={sx('payment-confirm-card')}>
                  <p style={{ margin: 0, color: '#64748b' }}>{cashPaymentView === 'pending' ? 'No cash confirmation requests for this week.' : 'No completed cash transactions.'}</p>
                </div>
              ) : (
                <div style={sx('payment-confirm-grid')}>
                  {cashConfirmationNotifications.map((txn) => {
                    const statusStyle =
                      txn.cashConfirmationStatus === 'approved'
                        ? sx('confirm-status-pill', 'confirm-status-approved')
                        : txn.cashConfirmationStatus === 'denied'
                          ? sx('confirm-status-pill', 'confirm-status-denied')
                          : sx('confirm-status-pill', 'confirm-status-pending');

                    return (
                      <div key={`confirm-${txn.id}`} style={sx('payment-confirm-card')} data-testid={`cash-confirmation-${txn.id}`}>
                        <div style={sx('payment-confirm-meta')}>
                          <strong>{txn.clientName}</strong>
                          <span style={statusStyle}>
                            {txn.cashConfirmationStatus === 'approved'
                              ? 'Approved'
                              : txn.cashConfirmationStatus === 'denied'
                                ? 'Denied'
                                : 'Pending Review'}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: '#334155', fontSize: '13px' }}>{txn.service}</p>
                        <p style={{ margin: 0, color: '#475569', fontSize: '12px' }}>
                          QR Ref: {txn.cashConfirmationQrId || 'N/A'}
                        </p>
                        <p style={{ margin: 0, color: '#475569', fontSize: '12px' }}>
                          Submitted: ₱{txn.submittedCashAmount || 0} | Expected: ₱{txn.expectedCashAmount || 0}
                        </p>
                        <p style={{ margin: 0, color: '#0f766e', fontSize: '12px', fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
                          {txn.transactionId ? `Transaction ID: ${txn.transactionId}` : 'Transaction ID: Pending approval'}
                        </p>
                        {cashPaymentView === 'pending' && (
                          <div style={sx('payment-confirm-actions')}>
                            <button
                              data-testid={`cash-approve-${txn.id}`}
                              style={{ ...sx('btn-approve-cash'), ...(isHovered(`approve-cash-${txn.id}`) ? hoverStyles.approveCash : {}) }}
                              onMouseEnter={() => setHoverKey(`approve-cash-${txn.id}`)}
                              onMouseLeave={() => setHoverKey('')}
                              onClick={() => handleRequestCashConfirmationReview(txn, 'approve')}
                              disabled={txn.cashConfirmationStatus === 'approved'}
                            >
                              Approve
                            </button>
                            <button
                              data-testid={`cash-deny-${txn.id}`}
                              style={{ ...sx('btn-deny-cash'), ...(isHovered(`deny-cash-${txn.id}`) ? hoverStyles.denyCash : {}) }}
                              onMouseEnter={() => setHoverKey(`deny-cash-${txn.id}`)}
                              onMouseLeave={() => setHoverKey('')}
                              onClick={() => handleRequestCashConfirmationReview(txn, 'deny')}
                              disabled={txn.cashConfirmationStatus === 'denied'}
                            >
                              Deny
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>}
            
            {showRefundSection && (
              <section style={sx('refund-section')} data-testid="work-refund-section">
                <div style={sx('section-header')}>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#2c3e50', margin: '0 0 4px 0' }}>Refund Queue (GCash)</h2>
                  <p style={sx('section-subtitle')}>Cases for GCash Advance and GCash post-service payments that need refund tracking.</p>
                </div>
                {refundTransactions.length === 0 ? (
                  <div style={sx('payment-confirm-card')}>
                    <p style={{ margin: 0, color: '#64748b' }}>No refund scenarios for this week.</p>
                  </div>
                ) : (
                  <div style={sx('refund-grid')}>
                    {refundTransactions.map((txn) => (
                      <div key={`refund-${txn.id}`} style={sx('refund-card')} data-testid={`refund-request-${txn.id}`}>
                        <div style={sx('payment-confirm-meta')}>
                          <strong>{txn.clientName}</strong>
                          <span
                            style={{
                              ...sx('confirm-status-pill'),
                              ...((txn.refundStatus === 'completed' || txn.refundStatus === 'approved')
                                ? sx('confirm-status-approved')
                                : txn.refundStatus === 'approved-awaiting-client-confirmation'
                                  ? { background: '#dbeafe', color: '#1d4ed8' }
                                  : sx('confirm-status-pending')),
                            }}
                          >
                            {txn.refundStatus === 'completed' || txn.refundStatus === 'approved'
                              ? 'Refund Completed'
                              : txn.refundStatus === 'approved-awaiting-client-confirmation'
                                ? 'Awaiting Client Confirmation'
                                : 'Refund Requested'}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: '#3730a3', fontWeight: 700, fontSize: '13px' }}>{txn.service}</p>
                        <p style={{ margin: 0, color: '#4f46e5', fontSize: '12px' }}>Amount: ₱{txn.refundAmount || 0}</p>
                        <p style={{ margin: 0, color: '#4f46e5', fontSize: '12px' }}>Reason: {txn.refundReason || 'Service cancellation/refund case'}</p>
                        <p style={{ margin: 0, color: '#4338ca', fontSize: '12px', fontFamily: "'Courier New', monospace", fontWeight: 700 }}>
                          {txn.refundReference ? `Refund Ref: ${txn.refundReference}` : 'Refund Ref: Pending'}
                        </p>
                        <p style={{ margin: 0, color: '#0f766e', fontSize: '12px', fontFamily: "'Courier New', monospace", fontWeight: 700 }}>
                          {txn.transactionId ? `Transaction ID: ${txn.transactionId}` : 'Transaction ID: N/A'}
                        </p>
                        {txn.refundStatus === 'requested' && (
                          <div style={sx('refund-actions')}>
                            <button
                              data-testid={`refund-approve-${txn.id}`}
                              style={{ ...sx('btn-approve-refund'), ...(isHovered(`approve-refund-${txn.id}`) ? hoverStyles.approveRefund : {}) }}
                              onMouseEnter={() => setHoverKey(`approve-refund-${txn.id}`)}
                              onMouseLeave={() => setHoverKey('')}
                              onClick={() => handleApproveRefund(txn.id)}
                            >
                              Approve Refund
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {showCancelledSection && (
              <section style={sx('cancelled-section')} data-testid="work-cancelled-section">
                <div style={sx('section-header')}>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#2c3e50', margin: '0 0 4px 0' }}>Cancelled Bookings (Cash Only)</h2>
                  <p style={sx('section-subtitle')}>Cash-based bookings that were cancelled and should not enter GCash refund flow.</p>
                </div>
                {cancelledCashTransactions.length === 0 ? (
                  <div style={sx('payment-confirm-card')}>
                    <p style={{ margin: 0, color: '#64748b' }}>No cancelled cash bookings for this week.</p>
                  </div>
                ) : (
                  <div style={sx('cancelled-grid')}>
                    {cancelledCashTransactions.map((txn) => (
                      <div key={`cancelled-${txn.id}`} style={sx('cancelled-card')}>
                        <div style={sx('payment-confirm-meta')}>
                          <strong>{txn.clientName}</strong>
                          <span style={sx('confirm-status-pill', 'confirm-status-denied')}>Cancelled</span>
                        </div>
                        <p style={{ margin: 0, color: '#991b1b', fontWeight: 700, fontSize: '13px' }}>{txn.service}</p>
                        <p style={{ margin: 0, color: '#991b1b', fontSize: '12px' }}>Payment Channel: Cash (No GCash refund needed)</p>
                        <p style={{ margin: 0, color: '#b91c1c', fontSize: '12px' }}>Reason: {txn.cancelReason || 'Cancelled before service.'}</p>
                        <p style={{ margin: 0, color: '#7f1d1d', fontSize: '12px', fontWeight: 700 }}>{txn.cancelPolicy || 'Cash-only cancellation flow'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {showScheduleSection && <section style={sx('schedule-section')} data-testid="work-schedule-section">
              <div style={sx('section-header')}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#2c3e50', margin: '0 0 4px 0' }}>{scheduleMode === 'calendar-only' ? 'Calendar Availability' : 'Weekly Schedule'}</h2>
                <p style={sx('section-subtitle')}>
                  {scheduleMode === 'calendar-only'
                    ? 'Manage available dates for manual coordination'
                    : 'Manage your availability and time-slot bookings'}
                </p>
              </div>

              <div style={sx('week-slider')}>
                <button
                  style={{ ...sx('week-nav-btn'), ...(isHovered('prev-week') ? hoverStyles.weekNav : {}) }}
                  onMouseEnter={() => setHoverKey('prev-week')}
                  onMouseLeave={() => setHoverKey('')}
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                >
                  Previous Week
                </button>
                <div style={sx('week-range')}>
                  <strong>{weekRangeLabel}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{weekOffset === 0 ? 'Current Week' : `${weekOffset > 0 ? '+' : ''}${weekOffset} week`}</span>
                </div>
                <button
                  style={{ ...sx('week-nav-btn'), ...(isHovered('next-week') ? hoverStyles.weekNav : {}) }}
                  onMouseEnter={() => setHoverKey('next-week')}
                  onMouseLeave={() => setHoverKey('')}
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                >
                  Next Week
                </button>
              </div>

              {scheduleMode === 'calendar-only' ? (
                <div style={sx('calendar-availability-grid')}>
                  {calendarAvailability
                    .filter((entry) => {
                      const entryDate = new Date(`${entry.date}T00:00:00`);
                      return entryDate >= currentWeekMonday && entryDate <= currentWeekSunday;
                    })
                    .map((entry) => {
                      const entryTransactions = weekTransactions.filter((txn) => txn.scheduleRef === entry.id);
                      return (
                        <div key={entry.id} style={sx('calendar-day-card')}>
                          <h3 style={sx('calendar-date')} className="gl-inline-icon-line">
                            <CalendarDays size={16} aria-hidden="true" />
                            {entry.date}
                          </h3>
                          <p style={sx('calendar-booked')}>Booked: {entry.booked}/{entry.maxBookings}</p>
                          <p style={sx('calendar-note')}>{entry.note || 'No notes added'}</p>

                          {entryTransactions.length > 0 && (
                            <div style={sx('calendar-bookings-list')}>
                              {entryTransactions.map((txn) => (
                                <div key={txn.id} style={sx('booking-item')}>
                                  <span style={sx('booking-name')} className="gl-inline-icon-line">
                                    <UserRound size={13} aria-hidden="true" />
                                    {txn.clientName}
                                  </span>
                                  {isMonthlyRecurringTxn(txn) && (
                                    <span style={sx('recurring-cycle-pill')}>
                                      Monthly {txn.cycleOrder}/4 ({txn.cycleStart} to {txn.cycleEnd})
                                    </span>
                                  )}
                                  <div style={sx('booking-inline-actions')}>
                                    <label style={sx('check-toggle', 'compact')}>
                                      <input
                                        type="checkbox"
                                        checked={txn.isPaid}
                                        disabled={!canTogglePaid(txn)}
                                        onChange={() => handleTogglePaid(txn.id)}
                                        style={{ margin: 0, padding: 0 }}
                                      />
                                      <span>{txn.isPaid ? 'Paid' : 'Mark paid'}</span>
                                    </label>
                                    {isMonthlyRecurringTxn(txn) && !canTogglePaid(txn) && (
                                      <span style={sx('lock-hint')}>Locked for monthly cycle</span>
                                    )}
                                    {txn.isDone ? (
                                      <span style={sx('done-pill')}>Done</span>
                                    ) : (
                                      <button
                                        style={{ ...sx('mark-done-btn'), ...(isHovered(`mark-done-${txn.id}`) ? hoverStyles.markDone : {}), ...( !canMarkDone(txn) ? { background: '#9ca3af', cursor: 'not-allowed' } : {}) }}
                                        onMouseEnter={() => setHoverKey(`mark-done-${txn.id}`)}
                                        onMouseLeave={() => setHoverKey('')}
                                        disabled={!canMarkDone(txn)}
                                        onClick={() => handleOpenDoneModal(txn)}
                                      >
                                        Mark Done
                                      </button>
                                    )}
                                    {isMonthlyRecurringTxn(txn) && txn.paymentMode === 'After Service' && !isLastCycleEntry(txn) && (
                                      <span style={sx('lock-hint')}>Finalize on last cycle entry</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={sx('block-actions')}>
                            <button
                              style={{ ...sx('action-btn'), ...(isHovered(`cal-edit-${entry.id}`) ? hoverStyles.editAction : {}) }}
                              onMouseEnter={() => setHoverKey(`cal-edit-${entry.id}`)}
                              onMouseLeave={() => setHoverKey('')}
                              title="Edit date"
                              onClick={() => handleEditSlot(null, entry.id)}
                            >
                              <Pencil size={14} aria-hidden="true" />
                            </button>
                            <button
                              style={{ ...sx('action-btn'), ...(isHovered(`cal-delete-${entry.id}`) ? hoverStyles.deleteAction : {}) }}
                              onMouseEnter={() => setHoverKey(`cal-delete-${entry.id}`)}
                              onMouseLeave={() => setHoverKey('')}
                              title="Delete date"
                              aria-label="Remove date"
                              onClick={() => handleDeleteSlot(null, entry.id)}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  <button
                    style={{ ...sx('btn-add-slot'), ...(isHovered('add-date') ? hoverStyles.addSlot : {}) }}
                    onMouseEnter={() => setHoverKey('add-date')}
                    onMouseLeave={() => setHoverKey('')}
                    onClick={() => handleAddSlot('calendar')}
                  >
                    + Add Available Date
                  </button>
                </div>
              ) : (
                <div style={sx('schedule-grid')}>
                  {dayKeys.map((dayKey) => {
                    const timeBlocks = weeklySchedule[dayKey] || [];
                    return (
                      <div key={dayKey} style={sx('schedule-day-card')}>
                        <h3 style={sx('day-header')}>{dayKey}</h3>
                        <p style={sx('day-date')}>{formatDateLong(weekDateByDay[dayKey])}</p>

                        {timeBlocks.length === 0 ? (
                          <p style={sx('no-slots')}>No slots scheduled</p>
                        ) : (
                          <div style={sx('time-blocks')}>
                            {timeBlocks.map((block) => (
                              <div
                                key={block.id}
                                style={sx('time-block', getSlotStatusColor(block.slotsLeft, block.capacity))}
                              >
                                <div style={sx('block-time')}>
                                  <strong>
                                    {block.startTime} - {block.endTime}
                                  </strong>
                                </div>

                                <div style={sx('block-status')}>
                                  <span style={sx('slots-counter')}>
                                    {block.capacity - block.slotsLeft}/{block.capacity} Filled
                                  </span>
                                  <div style={sx('status-bar')}>
                                    <div
                                      style={{ ...sx('filled-bar'),
                                        width: `${((block.capacity - block.slotsLeft) / block.capacity) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>

                                {block.bookings.length > 0 && (
                                  <div style={sx('bookings-preview')}>
                                    {block.bookings.map((booking, idx) => {
                                      const bookingTxn = getTransactionForBooking(block.id, booking.clientName);
                                      return (
                                        <div key={idx} style={sx('booking-item')}>
                                          <span style={sx('booking-name')} className="gl-inline-icon-line">
                                            <UserRound size={13} aria-hidden="true" />
                                            {booking.clientName}
                                          </span>
                                          {bookingTxn ? (
                                            <div style={sx('booking-inline-actions')}>
                                              {isMonthlyRecurringTxn(bookingTxn) && (
                                                <span style={sx('recurring-cycle-pill')}>
                                                  Monthly {bookingTxn.cycleOrder}/4 ({bookingTxn.cycleStart} to {bookingTxn.cycleEnd})
                                                </span>
                                              )}
                                              <label style={sx('check-toggle', 'compact')}>
                                                <input
                                                  type="checkbox"
                                                  checked={bookingTxn.isPaid}
                                                  disabled={!canTogglePaid(bookingTxn)}
                                                  onChange={() => handleTogglePaid(bookingTxn.id)}
                                                  style={{ margin: 0, padding: 0 }}
                                                />
                                                <span>{bookingTxn.isPaid ? 'Paid' : 'Mark paid'}</span>
                                              </label>
                                              {isMonthlyRecurringTxn(bookingTxn) && !canTogglePaid(bookingTxn) && (
                                                <span style={sx('lock-hint')}>Locked for monthly cycle</span>
                                              )}
                                              {bookingTxn.isDone ? (
                                                <span style={sx('done-pill')}>Done</span>
                                              ) : (
                                                <button
                                                  style={{ ...sx('mark-done-btn'), ...(isHovered(`mark-done-${bookingTxn.id}`) ? hoverStyles.markDone : {}), ...(!canMarkDone(bookingTxn) ? { background: '#9ca3af', cursor: 'not-allowed' } : {}) }}
                                                  onMouseEnter={() => setHoverKey(`mark-done-${bookingTxn.id}`)}
                                                  onMouseLeave={() => setHoverKey('')}
                                                  disabled={!canMarkDone(bookingTxn)}
                                                  onClick={() => handleOpenDoneModal(bookingTxn)}
                                                >
                                                  Mark Done
                                                </button>
                                              )}
                                              {isMonthlyRecurringTxn(bookingTxn) && bookingTxn.paymentMode === 'After Service' && !isLastCycleEntry(bookingTxn) && (
                                                <span style={sx('lock-hint')}>Finalize on last cycle entry</span>
                                              )}
                                            </div>
                                          ) : (
                                            <span style={sx('booking-item-checks')}>No transaction record</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                <div style={sx('block-actions')}>
                                  <button
                                    style={{ ...sx('action-btn'), ...(isHovered(`slot-edit-${block.id}`) ? hoverStyles.editAction : {}) }}
                                    onMouseEnter={() => setHoverKey(`slot-edit-${block.id}`)}
                                    onMouseLeave={() => setHoverKey('')}
                                    title="Edit slot"
                                    onClick={() => handleEditSlot(dayKey, block.id)}
                                  >
                                    <Pencil size={14} aria-hidden="true" />
                                  </button>
                                  <button
                                    style={{ ...sx('action-btn'), ...(isHovered(`slot-delete-${block.id}`) ? hoverStyles.deleteAction : {}) }}
                                    onMouseEnter={() => setHoverKey(`slot-delete-${block.id}`)}
                                    onMouseLeave={() => setHoverKey('')}
                                    title="Delete slot"
                                    aria-label="Remove slot"
                                    onClick={() => handleDeleteSlot(dayKey, block.id)}
                                  >
                                    <Trash2 size={14} aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          style={{ ...sx('btn-add-slot'), ...(isHovered(`add-slot-${dayKey}`) ? hoverStyles.addSlot : {}) }}
                          onMouseEnter={() => setHoverKey(`add-slot-${dayKey}`)}
                          onMouseLeave={() => setHoverKey('')}
                          onClick={() => handleAddSlot(dayKey)}
                        >
                          + Add Slot
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>}
            
            {workSectionFilter === 'all' && <section style={sx('stats-footer')}>
              <div style={sx('stat-card')}>
                <h4 style={{ fontSize: '14px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>Response Rate</h4>
                <p style={sx('stat-value')}>92%</p>
                <p style={sx('stat-desc')}>Avg response within 2 hours</p>
              </div>
              <div style={sx('stat-card')}>
                <h4 style={{ fontSize: '14px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>This Week</h4>
                <p style={sx('stat-value')}>8 hours</p>
                <p style={sx('stat-desc')}>Total scheduled time</p>
              </div>
              <div style={sx('stat-card')}>
                <h4 style={{ fontSize: '14px', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>Earnings</h4>
                <p style={sx('stat-value')}>₱3,600</p>
                <p style={sx('stat-desc')}>Pending completion</p>
              </div>
            </section>}
          </>
        )}
      </main>

      <ConfirmActionModal
        isOpen={Boolean(doneConfirmTarget)}
        title="Confirm Service Completion"
        overlayStyle={sx('done-confirm-overlay')}
        modalStyle={sx('done-confirm-modal')}
        noteStyle={sx('done-confirm-note')}
        actionsStyle={sx('done-confirm-actions')}
        cancelButtonStyle={sx('done-cancel-btn')}
        confirmButtonStyle={{ ...sx('done-confirm-btn'), ...(isHovered('confirm-done') ? hoverStyles.markDone : {}) }}
        onCancel={() => setDoneConfirmTarget(null)}
        onConfirm={handleConfirmDone}
        onConfirmMouseEnter={() => setHoverKey('confirm-done')}
        onConfirmMouseLeave={() => setHoverKey('')}
        confirmLabel="Confirm Done"
        note="This confirms that the worker has completed the service for this transaction."
      >
        <p>
          Mark <strong>{doneConfirmTarget?.clientName}</strong> as completed?
        </p>
      </ConfirmActionModal>

      <ConfirmActionModal
        isOpen={Boolean(deleteConfirmTarget)}
        title="Confirm Deletion"
        overlayStyle={sx('done-confirm-overlay')}
        modalStyle={sx('done-confirm-modal')}
        noteStyle={sx('done-confirm-note')}
        actionsStyle={sx('done-confirm-actions')}
        cancelButtonStyle={sx('done-cancel-btn')}
        confirmButtonStyle={{ ...sx('delete-confirm-btn'), ...(isHovered('confirm-delete') ? hoverStyles.deleteConfirm : {}) }}
        onCancel={() => setDeleteConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        onConfirmMouseEnter={() => setHoverKey('confirm-delete')}
        onConfirmMouseLeave={() => setHoverKey('')}
        confirmLabel="Delete"
        note="This action cannot be undone."
      >
        <p>
          Delete <strong>{deleteConfirmTarget?.label}</strong>?
        </p>
      </ConfirmActionModal>

      <QrPreviewModal
        isOpen={isGcashPreviewOpen}
        title="GCash Face-to-Face Payment"
        subtitle="Show this QR to your client during meetup."
        imageSrc={gcashQrImageUrl}
        imageAlt="GCash QR"
        primaryLabel="GCash Number"
        primaryValue={gcashNumber}
        note="Ask your client to scan this QR or send payment to the number above."
        onClose={handleCloseGcashPreview}
        overlayStyle={sx('done-confirm-overlay')}
        modalStyle={sx('done-confirm-modal', 'gcash-preview-modal')}
        bodyStyle={sx('gcash-preview-body')}
        imageStyle={sx('gcash-preview-qr')}
        noteStyle={sx('done-confirm-note')}
        actionsStyle={sx('done-confirm-actions')}
        closeButtonStyle={sx('done-cancel-btn')}
      />

      <QrPreviewModal
        isOpen={isCashQrPreviewOpen}
        title="Cash Confirmation QR"
        subtitle="Let the client scan this QR after handing over cash to submit payment details for your approval."
        imageSrc={cashConfirmQrImageUrl}
        imageAlt="Cash Confirmation QR"
        primaryLabel="Cash QR ID"
        primaryValue={cashQrId}
        note="Client submits amount using this QR, then you approve or deny inside Payment Confirmations."
        onClose={handleCloseCashQrPreview}
        overlayStyle={sx('done-confirm-overlay')}
        modalStyle={sx('done-confirm-modal', 'gcash-preview-modal')}
        bodyStyle={sx('gcash-preview-body')}
        imageStyle={sx('gcash-preview-qr')}
        noteStyle={sx('done-confirm-note')}
        actionsStyle={sx('done-confirm-actions')}
        closeButtonStyle={sx('done-cancel-btn')}
      />

      <ConfirmActionModal
        isOpen={Boolean(cashDecisionTarget)}
        title="Confirm Cash Decision"
        overlayStyle={sx('done-confirm-overlay')}
        modalStyle={sx('done-confirm-modal')}
        noteStyle={sx('done-confirm-note')}
        actionsStyle={sx('done-confirm-actions')}
        cancelButtonStyle={sx('done-cancel-btn')}
        confirmButtonStyle={cashDecisionTarget?.decision === 'approve' ? sx('done-confirm-btn') : sx('delete-confirm-btn')}
        onCancel={handleCloseCashDecisionModal}
        onConfirm={handleConfirmCashDecision}
        cancelLabel="No"
        confirmLabel={`Yes, ${cashDecisionTarget?.decision === 'approve' ? 'Approve' : 'Deny'}`}
      >
        <p style={{ margin: 0, color: '#374151', lineHeight: 1.5 }}>
          Are you sure you want to <strong>{cashDecisionTarget?.decision === 'approve' ? 'approve' : 'deny'}</strong> this cash confirmation?
        </p>
        <p style={sx('done-confirm-note')}>
          Client: <strong>{cashDecisionTarget?.clientName}</strong> | Service: <strong>{cashDecisionTarget?.service}</strong>
        </p>
        <p style={{ margin: '8px 0 0', color: '#4b5563', fontSize: '13px' }}>
          Submitted: ₱{cashDecisionTarget?.submittedCashAmount} | Expected: ₱{cashDecisionTarget?.expectedCashAmount}
        </p>
        {cashDecisionTarget?.decision === 'deny' && (
          <p style={{ margin: '8px 0 0', color: '#b91c1c', fontSize: '13px', fontWeight: 600 }}>
            Denying this payment can affect transaction records. Please verify details before continuing.
          </p>
        )}
      </ConfirmActionModal>
      
      {/* CHAT MODAL */}
      {selectedChatId && selectedInquiry && (
        <InquiryChatModal
          inquiry={selectedInquiry}
          onClose={handleCloseChat}
          onBookingUpdated={() => refreshSellerTransactions()}
          onError={setPaymentError}
        />
      )}

      {/* SLOT EDIT MODAL */}
      <SlotEditModal
        isOpen={editSlotModalOpen}
        mode={scheduleMode}
        slotData={editSlotData}
        dayLabel={editSlotDayKey || 'Calendar Date'}
        modalTitle={
          scheduleMode === 'calendar-only'
            ? slotModalType === 'add'
              ? 'Add Available Date'
              : 'Edit Available Date'
            : `Edit Time Slot - ${editSlotDayKey || 'Day'}`
        }
        submitLabel={slotModalType === 'add' ? 'Add Date' : 'Save Changes'}
        onSave={handleSaveSlotEdit}
        onClose={closeSlotModal}
      />

      <CreateServiceModal
        isOpen={isCreateServiceOpen}
        newService={newService}
        onChange={handleCreateServiceChange}
        onClose={closeCreateService}
        onSubmit={handleCreateServiceSubmit}
      />

      {/* Floating Add Service button (visible when seller exists) */}
      {sellerData && (
        <button onClick={() => setIsCreateServiceOpen(true)} aria-label="Add service" style={{ position: 'fixed', right: isMobile ? 14 : 20, bottom: isMobile ? 112 : 28, zIndex: 2500, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 999, width: 56, height: 56, fontSize: 20 }}>+</button>
      )}

      {/* PROFILE EDIT MODAL */}
      <ProfileEditModal
        isOpen={profileEditModalOpen}
        profileData={currentProfile}
        onSave={handleProfileEditSave}
        onClose={() => setProfileEditModalOpen(false)}
      />

    </div>
  );
};

export default MyWork;
