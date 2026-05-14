import React, { useState, useEffect, useCallback } from 'react';
import DashboardNavigation from '../../../shared/components/DashboardNavigation';
import ChatWindow from '../components/ChatWindow';
import SlotSelectionModal from '../components/SlotSelectionModal';
import PaymentModal from '../components/PaymentModal';
import { getThemeTokens } from '../../../shared/styles/themeTokens';

import {
  useBookingListController,
  usePaymentController,
  useRefundController,
  useRatingController,
} from '../hooks';

const MyBookings = ({ appTheme = 'light', themeMode = 'system', onThemeChange, currentView, searchQuery, onSearchChange, onGoHome, onLogout, onOpenSellerSetup, onOpenMyWork, sellerProfile, onOpenProfile, onOpenAccountSettings, onOpenSettings, onOpenMyBookings, onOpenChatPage, onOpenDashboard, onOpenBrowseServices, onOpenAdminDashboard }) => {
  // ========================================================================
  // CONTROLLER HOOKS INITIALIZATION
  // ========================================================================
  
  // Helper function to push header notifications
  const [, setHeaderNotifications] = useState([]);
  const pushHeaderNotification = useCallback((title, message) => {
    const id = `notif-${Date.now()}-${Math.floor(Math.random() * 999)}`;
    setHeaderNotifications((prev) => [
      {
        id,
        title,
        message,
        time: 'just now',
        isRead: false,
      },
      ...prev,
    ]);
  }, []);

  // Main booking list controller
  const bookingListCtrl = useBookingListController();

  // Payment controller
  const paymentCtrl = usePaymentController(
    undefined, // onPaymentProofSubmit
    undefined, // onPaymentMethodSelect
    bookingListCtrl.updateBooking
  );

  // Refund controller
  const refundCtrl = useRefundController(
    bookingListCtrl.replaceBooking,
    pushHeaderNotification
  );

  // Rating controller
  const ratingCtrl = useRatingController(
    bookingListCtrl.updateBooking,
    pushHeaderNotification
  );

  // ========================================================================
  // LOCAL UI STATE (Component-specific, not shared)
  // ========================================================================
  
  // View orchestration state
  const [selectedBookingId, setSelectedBookingId] = useState(1);
  const [uiState, setUiState] = useState('chat');

  const [hoveredBackToBookings, setHoveredBackToBookings] = useState(false);

  // Loading and responsive state
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  // ========================================================================
  // EFFECTS - Page Initialization & Responsive Behavior
  // ========================================================================
  
  // Handle window resize for responsive mobile layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ========================================================================
  // COMPUTED VALUES & HELPER FUNCTIONS
  // ========================================================================

  // ========================================================================
  // EVENT HANDLERS - Delegate to Controllers
  // ========================================================================

  // Chat navigation
  const handleOpenChat = useCallback((bookingId) => {
    setSelectedBookingId(bookingId);
    setUiState('chat');
  }, []);

  // Slot selection
  const handleOpenSlotSelection = useCallback(() => {
    setUiState('slots');
  }, []);

  const handleLeaveRating = useCallback(async (payload) => {
    try {
      await ratingCtrl.handleLeaveRating(payload);
    } catch (error) {
      pushHeaderNotification('Rating Failed', error?.message || 'Unable to save rating right now.');
    }
  }, [pushHeaderNotification, ratingCtrl]);

  const handleSelectPaymentMethod = useCallback(async (bookingId, paymentMethod) => {
    const booking = bookingListCtrl.getBooking(bookingId);
    if (booking) {
      try {
        await paymentCtrl.handleSelectPaymentMethod(booking, paymentMethod);
        setUiState('confirmed');

        if (paymentMethod === 'after-service-cash') {
          pushHeaderNotification(
            'Cash QR Ready',
            `Worker ${booking.workerName} generated a Cash Confirmation QR. Scan and submit amount after meetup.`
          );
        }
      } catch (error) {
        pushHeaderNotification('Payment Update Failed', error?.message || 'Unable to update payment method.');
      }
    }
  }, [paymentCtrl, bookingListCtrl, pushHeaderNotification]);

  // Refund workflow
  const handleRequestRefund = useCallback(async (bookingId, reason) => {
    const booking = bookingListCtrl.getBooking(bookingId);
    if (booking) {
      try {
        await refundCtrl.handleRequestRefund(booking, reason);
      } catch (error) {
        pushHeaderNotification('Refund Request Failed', error?.message || 'Unable to submit refund request.');
      }
    }
  }, [refundCtrl, bookingListCtrl, pushHeaderNotification]);

  const handleConfirmRefundReceived = useCallback(async (bookingId) => {
    const booking = bookingListCtrl.getBooking(bookingId);
    if (booking) {
      try {
        await refundCtrl.handleConfirmRefundReceived(booking);
      } catch (error) {
        pushHeaderNotification('Refund Update Failed', error?.message || 'Unable to confirm refund.');
      }
    }
  }, [refundCtrl, bookingListCtrl, pushHeaderNotification]);

  // Slot and payment confirmation
  const handleConfirmSlot = useCallback(async (bookingId, slotInfo) => {
    try {
      await bookingListCtrl.updateBooking(bookingId, {
        selectedSlot: slotInfo,
        status: 'Slot Selected - Payment Pending',
      });
      setUiState('payment');
    } catch (error) {
      pushHeaderNotification('Slot Update Failed', error?.message || 'Unable to update selected slot.');
    }
  }, [bookingListCtrl, pushHeaderNotification]);

  // Quote operations
  const handleApproveQuote = useCallback(async (bookingId) => {
    try {
      await bookingListCtrl.handleApproveQuote(bookingId);
      setUiState('chat');
    } catch (error) {
      pushHeaderNotification('Quote Update Failed', error?.message || 'Unable to approve quote.');
    }
  }, [bookingListCtrl, pushHeaderNotification]);

  const handleRejectQuote = useCallback(async (bookingId, reason) => {
    try {
      await bookingListCtrl.handleRejectQuote(bookingId, reason);
      pushHeaderNotification('Quote Rejected', 'Your reason was sent to the worker so they can review or revise the quote.');
      setUiState('chat');
    } catch (error) {
      pushHeaderNotification('Quote Update Failed', error?.message || 'Unable to reject quote.');
    }
  }, [bookingListCtrl, pushHeaderNotification]);

  // Service control
  const handleStopServiceAccepted = useCallback(async (bookingId) => {
    try {
      await bookingListCtrl.handleStopServiceAccepted(bookingId);
    } catch (error) {
      pushHeaderNotification('Service Update Failed', error?.message || 'Unable to stop service.');
    }
  }, [bookingListCtrl, pushHeaderNotification]);

  // Navigation
  const handleBackToList = useCallback(() => {
    setSelectedBookingId(null);
    setUiState('chat');
  }, []);

  const handleNewInquiry = useCallback(() => {
    setSelectedBookingId(null);
    setUiState('chat');
  }, []);

  // ========================================================================
  // COMPUTED VALUES FOR RENDERING
  // ========================================================================

  useEffect(() => {
    if (selectedBookingId && bookingListCtrl.bookings.some((booking) => booking.id === selectedBookingId)) return;
    setSelectedBookingId(bookingListCtrl.bookings[0]?.id || null);
  }, [bookingListCtrl.bookings, selectedBookingId]);

  const currentBooking = bookingListCtrl.bookings.find((b) => b.id === selectedBookingId);
  const themeTokens = getThemeTokens(appTheme);

  // ========================================================================
  // STYLES (UNCHANGED - Moved to end for clarity)
  // ========================================================================

  const styles = {
    myBookings: {
      padding: 0,
      background: themeTokens.pageBg,
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      width: '100%',
      overflowX: 'hidden',
      color: themeTokens.textPrimary,
    },
    bookingsHeader: { width: '100%', maxWidth: isMobile ? '720px' : '1200px', margin: '0 auto 24px', textAlign: 'center', padding: isMobile ? '20px 14px 0' : '32px 0', boxSizing: 'border-box' },
    title: { fontSize: isMobile ? '24px' : '32px', fontWeight: 700, color: themeTokens.textPrimary, margin: '0 0 8px 0' },
    subtitle: { fontSize: '14px', color: themeTokens.textSecondary, margin: 0 },
    bookingsFilters: { width: '100%', maxWidth: isMobile ? '720px' : '1200px', margin: '0 auto 16px', padding: isMobile ? '0 14px' : '0', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start', boxSizing: 'border-box' },
    filterBtn: { padding: '8px 14px', borderRadius: '999px', border: `1px solid ${themeTokens.border}`, background: themeTokens.surface, color: themeTokens.textPrimary, fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'center' },
    filterBtnActive: { background: themeTokens.accent, color: '#fff', borderColor: themeTokens.accent },
    displayFilters: { width: '100%', maxWidth: isMobile ? '720px' : '1200px', margin: '0 auto 14px', padding: isMobile ? '0 14px' : '0', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start', boxSizing: 'border-box' },
    displayHint: { width: '100%', margin: '2px 0 0', fontSize: '12px', color: themeTokens.textSecondary, textAlign: isMobile ? 'center' : 'left' },
    bookingsList: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: isMobile ? '720px' : '1200px', margin: '0 auto', padding: isMobile ? '0 14px 16px' : '0 0 20px', alignItems: 'stretch', boxSizing: 'border-box' },
    bookingCard: { background: themeTokens.surface, borderRadius: '12px', boxShadow: `0 2px 8px ${appTheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)'}`, padding: isMobile ? '14px' : '20px', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', borderLeft: `4px solid ${themeTokens.success}`, width: '100%', marginLeft: 'auto', marginRight: 'auto', boxSizing: 'border-box' },
    bookingCardHover: { boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)', transform: 'translateY(-2px)' },
    bookingInfo: { flex: 1 },
    workerName: { fontSize: '18px', fontWeight: 600, color: themeTokens.textPrimary, margin: '0 0 4px 0', textAlign: isMobile ? 'center' : 'left' },
    serviceType: { fontSize: '14px', color: themeTokens.success, fontWeight: 600, margin: '0 0 8px 0', textAlign: isMobile ? 'center' : 'left' },
    description: { fontSize: '14px', color: themeTokens.textSecondary, margin: '0 0 12px 0', lineHeight: 1.5, textAlign: isMobile ? 'center' : 'left' },
    bookingMeta: { display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: themeTokens.textSecondary, alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start' },
    requestDate: { display: 'inline-block' },
    billingBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: `${appTheme === 'dark' ? '#1e3a8a' : '#dbeafe'}`, color: `${appTheme === 'dark' ? '#93c5fd' : '#1e3a8a'}` },
    nextChargeDate: { fontSize: '12px', color: themeTokens.accent, fontWeight: 600 },
    statusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' },
    bookingRating: { color: `${appTheme === 'dark' ? '#fed7aa' : '#7c2d12'}`, fontWeight: 600 },
    bookingActions: { display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start', gap: '12px', marginTop: '16px', width: '100%' },
    quotePreview: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: themeTokens.textPrimary, justifyContent: isMobile ? 'center' : 'flex-start', width: isMobile ? '100%' : 'auto' },
    quoteLabel: { fontWeight: 600 },
    quoteAmount: { fontSize: '18px', fontWeight: 700, color: themeTokens.success },
    gcashPreview: { display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', background: `${appTheme === 'dark' ? '#064e3b' : '#ecfdf5'}`, border: `1px solid ${appTheme === 'dark' ? '#047857' : '#a7f3d0'}`, borderRadius: '6px', padding: '6px 10px' },
    gcashLabel: { color: '#065f46', fontWeight: 600 },
    gcashNumber: { color: '#047857', fontWeight: 700, fontFamily: "'Courier New', monospace" },
    cashPreview: { display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', padding: '6px 10px' },
    cashLabel: { color: '#9a3412', fontWeight: 700 },
    cashHint: { color: `${appTheme === 'dark' ? '#fbbf24' : '#b45309'}`, fontWeight: 600 },
    refundPreview: { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', background: `${appTheme === 'dark' ? '#312e81' : '#eef2ff'}`, border: `1px solid ${appTheme === 'dark' ? '#4f46e5' : '#c7d2fe'}`, borderRadius: '8px', padding: '8px 10px', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box' },
    refundTitle: { color: `${appTheme === 'dark' ? '#c7d2fe' : '#4338ca'}`, fontWeight: 800 },
    refundMeta: { color: `${appTheme === 'dark' ? '#a5b4fc' : '#4f46e5'}`, fontWeight: 600 },
    cancelPreview: { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', background: `${appTheme === 'dark' ? '#7f1d1d' : '#fef2f2'}`, border: `1px solid ${appTheme === 'dark' ? '#991b1b' : '#fecaca'}`, borderRadius: '8px', padding: '8px 10px', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box' },
    cancelTitle: { color: `${appTheme === 'dark' ? '#fca5a5' : '#b91c1c'}`, fontWeight: 800 },
    cancelMeta: { color: `${appTheme === 'dark' ? '#fecaca' : '#991b1b'}`, fontWeight: 600 },
    cashConfirmBtn: { padding: '10px 16px', background: `${appTheme === 'dark' ? '#ea580c' : '#ea580c'}`, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease' },
    cashConfirmBtnHover: { background: `${appTheme === 'dark' ? '#c2410c' : '#c2410c'}` },
    transactionProofBtn: { padding: '10px 14px', background: `${appTheme === 'dark' ? '#14b8a6' : '#0f766e'}`, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' },
    transactionIdInline: { padding: '6px 10px', borderRadius: '999px', background: `${appTheme === 'dark' ? '#0f766e' : '#ecfeff'}`, border: `1px solid ${appTheme === 'dark' ? '#14b8a6' : '#99f6e4'}`, color: `${appTheme === 'dark' ? '#a7f3d0' : '#0f766e'}`, fontSize: '12px', fontFamily: "'Courier New', monospace", fontWeight: 700 },
    bookingActionRow: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start', width: '100%' },
    openChatBtn: { padding: '10px 16px', background: themeTokens.success, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', transform: 'scale(1)' },
    openChatBtnHover: { background: `${appTheme === 'dark' ? '#059669' : '#229954'}`, transform: 'scale(1.02)' },
    rateBtn: { padding: '10px 18px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' },
    rateBtnHover: { background: '#d97706' },
    payGcashBtn: { padding: '10px 16px', background: themeTokens.accent, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease' },
    payGcashBtnHover: { background: `${appTheme === 'dark' ? '#1e40af' : '#1d4ed8'}` },
    loadingCard: { background: themeTokens.surface, borderRadius: '12px', boxShadow: `0 2px 8px ${appTheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.06)'}`, padding: '20px', border: `1px solid ${themeTokens.border}`, display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginLeft: 'auto', marginRight: 'auto', boxSizing: 'border-box' },
    loadingLine: { height: '11px', borderRadius: '999px', background: `${appTheme === 'dark' ? '#334155' : '#e2e8f0'}` },
    emptyState: { textAlign: 'center', padding: '60px 20px', color: themeTokens.textSecondary, width: '100%', marginLeft: 'auto', marginRight: 'auto', boxSizing: 'border-box' },
    ratingModalOverlay: { position: 'fixed', inset: 0, background: `${appTheme === 'dark' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.55)'}`, display: 'flex', justifyContent: 'center', alignItems: isMobile ? 'flex-start' : 'center', zIndex: 1100, padding: isMobile ? '10px 10px 14px' : '16px', overflowY: 'auto', overscrollBehavior: 'contain' },
    ratingModal: { width: '100%', maxWidth: isMobile ? '100%' : '760px', maxHeight: isMobile ? 'calc(100vh - 24px)' : '90vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: themeTokens.surface, borderRadius: '12px', padding: isMobile ? '14px' : '24px', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' },
    paymentProofModal: { maxWidth: isMobile ? '100%' : '900px' },
    ratingTitle: { margin: 0, color: themeTokens.textPrimary, fontSize: '26px' },
    ratingSubtitle: { margin: '0 0 8px', color: themeTokens.textSecondary, fontSize: '15px' },
    label: { fontSize: '14px', fontWeight: 600, color: themeTokens.textPrimary },
    starRating: { display: 'flex', gap: '6px', alignItems: 'center' },
    starBtn: { border: 'none', background: 'transparent', fontSize: '30px', lineHeight: 1, color: `${appTheme === 'dark' ? '#4b5563' : '#d1d5db'}`, cursor: 'pointer', transition: 'transform 0.15s ease, color 0.15s ease', padding: 0 },
    starBtnActive: { color: '#f59e0b' },
    starRatingValue: { margin: '2px 0 6px', fontSize: '13px', fontWeight: 600, color: themeTokens.textPrimary },
    textarea: { border: `1px solid ${themeTokens.border}`, borderRadius: '8px', minHeight: '120px', padding: '12px', fontSize: '15px', fontFamily: 'inherit', background: themeTokens.surface, color: themeTokens.textPrimary },
    ratingActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' },
    paymentProofActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px', position: 'sticky', bottom: 0, background: themeTokens.surface, paddingTop: '10px', paddingBottom: isMobile ? '2px' : 0, borderTop: `1px solid ${themeTokens.border}` },
    btnCancelRate: { border: 'none', borderRadius: '8px', padding: '10px 14px', fontWeight: 600, cursor: 'pointer', background: `${appTheme === 'dark' ? '#374151' : '#e5e7eb'}`, color: `${appTheme === 'dark' ? '#f1f5f9' : '#111827'}` },
    btnSubmitRate: { border: 'none', borderRadius: '8px', padding: '10px 14px', fontWeight: 600, cursor: 'pointer', background: themeTokens.accent, color: '#fff' },
    gcashPaymentHeader: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', gap: '16px', alignItems: 'start', marginBottom: '24px', padding: '16px', background: themeTokens.surface, borderRadius: '8px', border: `1px solid ${themeTokens.border}` },
    gcashQrImage: { width: '100%', border: `2px solid ${themeTokens.border}`, borderRadius: '8px', background: appTheme === 'dark' ? '#1f2937' : '#fff', display: 'block' },
    gcashPaymentInfo: { display: 'flex', flexDirection: 'column', gap: '12px' },
    paymentInfoGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    infoLabel: { fontSize: '12px', fontWeight: 600, color: themeTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 },
    infoValue: { fontSize: '14px', color: themeTokens.textPrimary, fontWeight: 500, margin: 0 },
    infoValueAmount: { fontSize: '18px', fontWeight: 700, color: themeTokens.success, margin: 0 },
    gcashNumberGroup: { paddingTop: '8px', borderTop: `1px solid ${themeTokens.border}`, marginTop: '4px' },
    paymentProofSection: { padding: '16px', background: themeTokens.surface, border: `1px solid ${themeTokens.border}`, borderRadius: '8px', marginBottom: '16px' },
    h4: { margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: themeTokens.textPrimary },
    proofUploadGroup: { marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
    fileInput: { minHeight: '46px', padding: '10px', border: `1px solid ${themeTokens.border}`, borderRadius: '6px', background: themeTokens.surface, fontSize: '14px', cursor: 'pointer', width: '100%', boxSizing: 'border-box', color: themeTokens.textPrimary },
    proofFileName: { margin: '2px 0 6px', fontSize: '12px', color: themeTokens.textSecondary },
    referenceNumberGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    referenceInput: { padding: '12px 14px', fontSize: '15px', border: `1px solid ${themeTokens.border}`, borderRadius: '6px', background: themeTokens.surface, fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s', minHeight: '48px', width: '100%', boxSizing: 'border-box', outline: 'none', color: themeTokens.textPrimary },
    referenceInputFocused: { borderColor: themeTokens.accent, boxShadow: `0 0 0 3px ${appTheme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}` },
    errorTextInline: { margin: 0, color: themeTokens.danger, fontSize: '13px', fontWeight: 600 },
    paymentStatusNotice: { position: 'fixed', right: isMobile ? '12px' : '16px', left: isMobile ? '12px' : 'auto', bottom: '16px', background: themeTokens.accent, color: '#fff', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', fontWeight: 600, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)', zIndex: 1400 },
    cashModalHeader: { marginBottom: '10px' },
    cashSecurityCard: { marginBottom: '14px', border: `1px solid ${appTheme === 'dark' ? '#7c2d12' : '#fed7aa'}`, background: `${appTheme === 'dark' ? '#3d2817' : '#fff7ed'}`, borderRadius: '8px', padding: '12px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '160px 1fr', gap: '12px', alignItems: 'start' },
    cashQrImage: { width: '100%', borderRadius: '8px', border: `1px solid ${appTheme === 'dark' ? '#92400e' : '#fdba74'}`, background: appTheme === 'dark' ? '#1f2937' : '#fff' },
    cashSecurityTitle: { margin: 0, color: `${appTheme === 'dark' ? '#fbbf24' : '#9a3412'}`, fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' },
    cashSecurityText: { margin: '6px 0 0', color: `${appTheme === 'dark' ? '#fed7aa' : '#7c2d12'}`, fontSize: '13px', lineHeight: 1.5 },
    cashMetaList: { margin: '8px 0 0', paddingLeft: '18px', color: `${appTheme === 'dark' ? '#fed7aa' : '#9a3412'}`, fontSize: '13px' },
    cashFieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' },
    cashAmountInput: { padding: '12px 14px', fontSize: '15px', border: `1px solid ${appTheme === 'dark' ? '#ea580c' : '#fdba74'}`, borderRadius: '6px', background: themeTokens.surface, fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s', minHeight: '48px', width: '100%', boxSizing: 'border-box', outline: 'none', color: themeTokens.textPrimary },
    cashAmountInputFocused: { borderColor: '#f97316', boxShadow: `0 0 0 3px ${appTheme === 'dark' ? 'rgba(249, 115, 22, 0.3)' : 'rgba(249, 115, 22, 0.15)'}` },
    cashReviewNotice: { margin: 0, borderRadius: '6px', padding: '9px 10px', fontSize: '13px', fontWeight: 600 },
    cashReviewPending: { background: `${appTheme === 'dark' ? '#1e3a8a' : '#eff6ff'}`, color: `${appTheme === 'dark' ? '#93c5fd' : '#1d4ed8'}`, border: `1px solid ${appTheme === 'dark' ? '#1e40af' : '#bfdbfe'}` },
    cashReviewApproved: { background: `${appTheme === 'dark' ? '#064e3b' : '#ecfdf5'}`, color: `${appTheme === 'dark' ? '#86efac' : '#047857'}`, border: `1px solid ${appTheme === 'dark' ? '#047857' : '#a7f3d0'}` },
    cashReviewDenied: { background: `${appTheme === 'dark' ? '#7f1d1d' : '#fef2f2'}`, color: `${appTheme === 'dark' ? '#fca5a5' : '#b91c1c'}`, border: `1px solid ${appTheme === 'dark' ? '#991b1b' : '#fecaca'}` },
    transactionModalValue: { fontSize: '14px', color: themeTokens.textPrimary, fontWeight: 700, fontFamily: "'Courier New', monospace" },
    confirmationOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: `${appTheme === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
    confirmationCard: { background: themeTokens.surface, borderRadius: '16px', padding: isMobile ? '24px 14px' : '40px 24px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', transition: 'transform 0.4s ease, opacity 0.4s ease' },
    confirmationHeader: { textAlign: 'center', marginBottom: '32px' },
    checkmarkIcon: { width: '80px', height: '80px', background: themeTokens.success, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#fff', margin: '0 auto 16px' },
    confirmationHeading: { fontSize: '24px', fontWeight: 700, color: themeTokens.textPrimary, margin: 0 },
    confirmationDetails: { background: `${appTheme === 'dark' ? '#1f2937' : '#f8f9fa'}`, borderRadius: '8px', padding: '24px', marginBottom: '24px' },
    detailRow: { display: 'flex', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '4px' : '0', padding: '8px 0', borderBottom: `1px solid ${appTheme === 'dark' ? '#374151' : '#ecf0f1'}` },
    detailLabel: { fontWeight: 600, color: themeTokens.textPrimary, fontSize: '13px' },
    detailValue: { color: themeTokens.textSecondary, fontSize: '13px' },
    payGcashAdvance: { color: themeTokens.success, fontWeight: 600 },
    payAfterCash: { color: `${appTheme === 'dark' ? '#fb923c' : '#d97706'}`, fontWeight: 600 },
    payAfterGcash: { color: themeTokens.success, fontWeight: 600 },
    confirmationActions: { textAlign: 'center' },
    backToBookings: { padding: '12px 32px', background: themeTokens.success, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', marginBottom: '16px', width: '100%' },
    backToBookingsHover: { background: `${appTheme === 'dark' ? '#059669' : '#229954'}` },
    confirmationNote: { fontSize: '12px', color: themeTokens.textSecondary, margin: 0, lineHeight: 1.5 },
  };

  // ========================================================================
  // RENDER - Main Page Component
  // ========================================================================

  return (
    <div
      className={uiState === 'chat' ? 'booking-chat-page' : undefined}
      style={styles.myBookings}
      data-testid="my-bookings-page"
    >
      <DashboardNavigation
        appTheme={appTheme}
        themeMode={themeMode}
        onThemeChange={onThemeChange}
        currentView={currentView}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onLogout={onLogout}
        onOpenSellerSetup={onOpenSellerSetup}
        onOpenMyBookings={onOpenMyBookings}
        onOpenChatPage={onOpenChatPage}
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
      {(bookingListCtrl.loadError || bookingListCtrl.actionError) && (
        <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 14px', color: themeTokens.danger, fontWeight: 700 }}>
          {bookingListCtrl.loadError || bookingListCtrl.actionError}
        </div>
      )}
      {bookingListCtrl.isLoading && (
        <div style={styles.emptyState}>Loading your bookings...</div>
      )}
      {!bookingListCtrl.isLoading && bookingListCtrl.bookings.length === 0 && (
        <div style={styles.emptyState}>
          <h2 style={{ margin: '0 0 8px', color: themeTokens.textPrimary }}>No bookings yet</h2>
          <p style={{ margin: 0 }}>Bookings you create from the marketplace will appear here.</p>
        </div>
      )}
      {!bookingListCtrl.isLoading && currentBooking && (
        <>
      {uiState === 'chat' && (
        <ChatWindow
          appTheme={appTheme}
          booking={currentBooking}
          bookings={bookingListCtrl.filteredBookings}
          selectedBookingId={selectedBookingId}
          onSelectBooking={handleOpenChat}
          onApproveQuote={() => handleApproveQuote(currentBooking.id)}
          onRejectQuote={(reason) => handleRejectQuote(currentBooking.id, reason)}
          onOpenSlotSelection={handleOpenSlotSelection}
          onOpenPaymentSelection={() => setUiState('payment')}
          onRequestRefund={(reason) => handleRequestRefund(currentBooking.id, reason)}
          onConfirmRefundReceived={() => handleConfirmRefundReceived(currentBooking.id)}
          onStopServiceAccepted={() => handleStopServiceAccepted(currentBooking.id)}
          onLeaveRating={handleLeaveRating}
        />
      )}
      {uiState === 'slots' && (
        <SlotSelectionModal
          booking={currentBooking}
          onConfirmSlot={(slotInfo) => handleConfirmSlot(currentBooking.id, slotInfo)}
          onCancel={handleBackToList}
        />
      )}
      {uiState === 'payment' && (
        <PaymentModal
          booking={currentBooking}
          onSelectPayment={(method) => handleSelectPaymentMethod(currentBooking.id, method)}
          onCancel={handleBackToList}
        />
      )}
      {uiState === 'confirmed' && (
        <div style={styles.confirmationOverlay}>
          <div style={styles.confirmationCard}>
            <div style={styles.confirmationHeader}>
              <div style={styles.checkmarkIcon}>{'\u2713'}</div>
              <h2 style={styles.confirmationHeading}>Booking Confirmed!</h2>
            </div>
            <div style={styles.confirmationDetails}>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Worker:</span><span style={styles.detailValue}>{currentBooking.workerName}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Service:</span><span style={styles.detailValue}>{currentBooking.serviceType}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Amount:</span><span style={styles.detailValue}>{`\u20B1${currentBooking.quoteAmount}`}</span></div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Booking Setup:</span>
                <span style={styles.detailValue}>
                  {currentBooking.bookingMode === 'calendar-only' ? 'Request booking - through chat' : 'Time-slot booking'}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Scheduled Date:</span>
                <span style={styles.detailValue}>{currentBooking.selectedSlot?.date || 'Coordinated through chat'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Time Slot:</span>
                <span style={styles.detailValue}>
                  {currentBooking.selectedSlot?.timeBlock
                    ? `${currentBooking.selectedSlot.timeBlock.startTime} - ${currentBooking.selectedSlot.timeBlock.endTime}`
                    : 'Coordinated through chat'}
                </span>
              </div>
              <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                <span style={styles.detailLabel}>Payment Method:</span>
                <span style={{
                  ...styles.detailValue,
                  ...(currentBooking.paymentMethod === 'gcash-advance' ? styles.payGcashAdvance : {}),
                  ...(currentBooking.paymentMethod === 'after-service-cash' ? styles.payAfterCash : {}),
                  ...(currentBooking.paymentMethod === 'after-service-gcash' ? styles.payAfterGcash : {}),
                }}>
                  {currentBooking.paymentMethod === 'gcash-advance' ? 'GCash Advance Payment' : currentBooking.paymentMethod === 'after-service-gcash' ? 'Pay After Service (GCash)' : 'Pay After Service (Cash)'}
                </span>
              </div>
            </div>
            <div style={styles.confirmationActions}>
              <button
                style={{ ...styles.backToBookings, ...(hoveredBackToBookings ? styles.backToBookingsHover : {}) }}
                onMouseEnter={() => setHoveredBackToBookings(true)}
                onMouseLeave={() => setHoveredBackToBookings(false)}
                onClick={handleNewInquiry}
              >
                Back to My Bookings
              </button>
              <p style={styles.confirmationNote}>Cash confirmation has been sent to the worker review queue. Once approved, a transaction ID will appear here automatically.</p>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default MyBookings;
