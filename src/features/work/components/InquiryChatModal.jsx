import { useEffect, useState } from 'react';
import {
  fetchBookingMessages,
  sendBookingMessage,
  updateBookingWorkflow,
} from '../../bookings/services/bookingService';

const InquiryChatModal = ({ inquiry, onClose, onBookingUpdated, onError }) => {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadMessages = async () => {
      if (!inquiry?.booking) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const rows = await fetchBookingMessages(inquiry.booking);
        if (mounted) setMessages(rows);
      } catch (error) {
        if (mounted) onError?.(error?.message || 'Unable to load inquiry messages.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadMessages();
    return () => {
      mounted = false;
    };
  }, [inquiry?.booking, onError]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !inquiry?.booking) return;

    try {
      setIsSaving(true);
      const saved = await sendBookingMessage(inquiry.booking, replyText.trim());
      setMessages((prev) => [...prev, saved]);
      setReplyText('');
    } catch (error) {
      onError?.(error?.message || 'Unable to send reply.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendQuote = async () => {
    const amount = Number(quoteAmount);
    if (!Number.isFinite(amount) || amount <= 0 || !inquiry?.booking) {
      onError?.('Enter a valid quote amount before sending.');
      return;
    }

    const description = quoteDescription.trim() || `Quote for ${inquiry.service}`;

    try {
      setIsSaving(true);
      const updatedBooking = await updateBookingWorkflow(inquiry.booking, {
        quoteAmount: amount,
        status: 'Negotiating',
        dbStatus: 'pending',
      });
      const quoteMessage = await sendBookingMessage(inquiry.booking, description, {
        type: 'quote',
        amount,
        description,
        note: 'Seller quote saved to the booking record.',
      });

      setMessages((prev) => [...prev, quoteMessage]);
      setShowQuoteModal(false);
      setQuoteAmount('');
      setQuoteDescription('');
      onBookingUpdated?.(updatedBooking);
    } catch (error) {
      onError?.(error?.message || 'Unable to send quote.');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 999, padding: 0 },
    modal: { background: '#ffffff', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', maxWidth: '520px', width: '100%', height: '80vh', maxHeight: '80vh', boxShadow: '0 -18px 42px rgba(15, 23, 42, 0.22)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 },
    title: { fontSize: '15px', fontWeight: 700, color: '#1f2937', margin: 0 },
    subtitle: { fontSize: '12px', color: '#64748b', margin: '2px 0 0' },
    closeButton: { background: 'none', border: 'none', fontSize: '24px', color: '#64748b', cursor: 'pointer', padding: 0, width: '32px', height: '32px' },
    messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' },
    empty: { color: '#64748b', textAlign: 'center', padding: '24px 10px' },
    message: { maxWidth: '86%', display: 'grid', gap: '4px' },
    clientMessage: { alignSelf: 'flex-start' },
    workerMessage: { alignSelf: 'flex-end' },
    bubble: { padding: '11px 13px', borderRadius: '10px', margin: 0, fontSize: '14px', lineHeight: 1.45 },
    clientBubble: { background: '#ffffff', color: '#1f2937', border: '1px solid #e5e7eb' },
    workerBubble: { background: '#2563eb', color: '#ffffff' },
    meta: { fontSize: '11px', color: '#94a3b8', padding: '0 6px' },
    quoteBubble: { border: '1px solid #86efac', background: '#ecfdf5', color: '#064e3b', borderRadius: '10px', padding: '12px', display: 'grid', gap: '6px' },
    quoteAmountText: { margin: 0, fontSize: '20px', fontWeight: 800 },
    actions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', background: '#ffffff', borderTop: '1px solid #e5e7eb', flexShrink: 0 },
    actionButton: { padding: '10px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' },
    secondaryButton: { background: '#e5e7eb', color: '#111827' },
    primaryButton: { background: '#2563eb', color: '#ffffff' },
    inputArea: { display: 'flex', gap: '8px', padding: '12px', background: '#ffffff', borderTop: '1px solid #e5e7eb', flexShrink: 0 },
    input: { flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none' },
    sendButton: { padding: '10px 16px', background: replyText.trim() && !isSaving ? '#2563eb' : '#94a3b8', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: replyText.trim() && !isSaving ? 'pointer' : 'not-allowed' },
    quoteOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
    quoteModal: { background: '#ffffff', borderRadius: '12px', width: 'min(92vw, 520px)', padding: '18px', display: 'grid', gap: '12px', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.28)' },
    label: { display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#334155' },
    quoteInput: { minHeight: '44px', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' },
    quoteTextarea: { minHeight: '100px', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' },
    quoteActions: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  };

  const getWrapperStyle = (message) => ({
    ...styles.message,
    ...(message.sender === 'worker' ? styles.workerMessage : styles.clientMessage),
  });

  const getBubbleStyle = (message) => ({
    ...styles.bubble,
    ...(message.sender === 'worker' ? styles.workerBubble : styles.clientBubble),
  });

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>{inquiry.clientName}</h3>
            <p style={styles.subtitle}>{inquiry.service}</p>
          </div>
          <button type="button" style={styles.closeButton} onClick={onClose} aria-label="Close inquiry">
            x
          </button>
        </div>

        <div style={styles.messages}>
          {isLoading ? (
            <div style={styles.empty}>Loading conversation...</div>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} style={getWrapperStyle(message)}>
                {message.type === 'quote' ? (
                  <div style={styles.quoteBubble}>
                    <strong>Price Quote</strong>
                    <p style={styles.quoteAmountText}>PHP {message.content.amount}</p>
                    <p style={{ margin: 0 }}>{message.content.description}</p>
                  </div>
                ) : (
                  <p style={getBubbleStyle(message)}>{message.content}</p>
                )}
                <span style={{ ...styles.meta, textAlign: message.sender === 'worker' ? 'right' : 'left' }}>
                  {message.timestamp}
                </span>
              </div>
            ))
          ) : (
            <div style={styles.empty}>
              <p>{inquiry.description}</p>
              <p>No saved messages yet.</p>
            </div>
          )}
        </div>

        <div style={styles.actions}>
          <button type="button" style={{ ...styles.actionButton, ...styles.secondaryButton }} onClick={() => setReplyText("Yes, I'm available. Let me confirm details.")}>
            Quick Reply
          </button>
          <button type="button" style={{ ...styles.actionButton, ...styles.primaryButton }} onClick={() => setShowQuoteModal(true)}>
            Send Quote
          </button>
        </div>

        <div style={styles.inputArea}>
          <input
            type="text"
            placeholder="Type your reply..."
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSendReply();
            }}
            style={styles.input}
          />
          <button type="button" style={styles.sendButton} onClick={handleSendReply} disabled={!replyText.trim() || isSaving}>
            Send
          </button>
        </div>
      </div>

      {showQuoteModal && (
        <div style={styles.quoteOverlay}>
          <div style={styles.quoteModal}>
            <h3 style={{ margin: 0 }}>Send Price Quote</h3>
            <label style={styles.label}>
              Quote Amount (PHP)
              <input
                type="number"
                value={quoteAmount}
                onChange={(event) => setQuoteAmount(event.target.value)}
                min="0"
                step="50"
                style={styles.quoteInput}
              />
            </label>
            <label style={styles.label}>
              Quote Description
              <textarea
                value={quoteDescription}
                onChange={(event) => setQuoteDescription(event.target.value)}
                rows={3}
                style={styles.quoteTextarea}
              />
            </label>
            <div style={styles.quoteActions}>
              <button type="button" style={{ ...styles.actionButton, ...styles.secondaryButton }} onClick={() => setShowQuoteModal(false)}>
                Cancel
              </button>
              <button type="button" style={{ ...styles.actionButton, ...styles.primaryButton }} onClick={handleSendQuote} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Send Quote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryChatModal;
