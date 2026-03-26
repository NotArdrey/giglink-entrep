import React, { useState } from 'react';

const SimulatedChat = ({ inquiry, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'client',
      type: 'text',
      text: `Hi! I'm interested in ${inquiry.service.toLowerCase()}. Are you available?`,
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      sender: 'client',
      type: 'text',
      text: inquiry.description,
      timestamp: '10:31 AM',
    },
  ]);

  const [replyText, setReplyText] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [hoveredQuick, setHoveredQuick] = useState('');
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'seller',
      type: 'text',
      text: replyText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setReplyText('');

    setTimeout(() => {
      const clientResponse = {
        id: messages.length + 2,
        sender: 'client',
        type: 'text',
        text: 'Great! When can we proceed with this?',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prevMessages) => [...prevMessages, clientResponse]);
    }, 2000);
  };

  const handleOpenQuoteModal = () => {
    setShowQuoteModal(true);
    setQuoteAmount('');
    setQuoteDescription('');
  };

  const handleSendQuote = () => {
    if (!quoteAmount.trim()) {
      alert('Please enter a quote amount');
      return;
    }

    const quoteMessage = {
      id: messages.length + 1,
      sender: 'seller',
      type: 'quote',
      amount: quoteAmount,
      description: quoteDescription || `Quote for ${inquiry.service}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, quoteMessage]);
    setShowQuoteModal(false);
    setQuoteAmount('');
    setQuoteDescription('');

    setTimeout(() => {
      const clientResponse = {
        id: messages.length + 2,
        sender: 'client',
        type: 'text',
        text: 'Thanks for the quote! This looks reasonable. Can we proceed to booking?',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prevMessages) => [...prevMessages, clientResponse]);
    }, 2500);
  };

  const handleQuickReply = (template) => {
    setReplyText(template);
  };

  const styles = {
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 999, padding: 0 },
    chatModal: { background: 'white', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', maxWidth: '500px', width: '100%', height: '80vh', maxHeight: '80vh' },
    chatModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eceff1', flexShrink: 0 },
    chatClientInfo: { display: 'flex', gap: '12px', flex: 1 },
    chatClientPhoto: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
    clientName: { fontSize: '15px', fontWeight: 700, color: '#2c3e50', margin: 0 },
    clientService: { fontSize: '12px', color: '#7f8c8d', margin: '2px 0 0 0' },
    chatCloseBtn: { background: 'none', border: 'none', fontSize: '24px', color: isCloseHovered ? '#2c3e50' : '#7f8c8d', cursor: 'pointer', padding: 0, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', transform: isCloseHovered ? 'scale(1.1)' : 'scale(1)' },
    chatMessages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f9f9f9' },
    message: { display: 'flex', flexDirection: 'column', maxWidth: '85%', opacity: 1, transform: 'translateY(0)', transition: 'transform 0.3s ease, opacity 0.3s ease' },
    messageClient: { alignSelf: 'flex-start' },
    messageSeller: { alignSelf: 'flex-end' },
    messageTextBase: { padding: '12px 16px', borderRadius: '12px', margin: 0, fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' },
    messageTextClient: { background: 'white', color: '#333', border: '1px solid #eceff1' },
    messageTextSeller: { background: '#27ae60', color: 'white' },
    messageTime: { fontSize: '11px', color: '#95a5a6', marginTop: '4px', padding: '0 12px' },
    quickReplies: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '12px', background: 'white', borderTop: '1px solid #eceff1', flexShrink: 0 },
    quickReplyBtn: { padding: '8px 12px', background: '#f0f0f0', color: '#2c3e50', border: '1px solid #eceff1', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' },
    quickReplyBtnHover: { background: '#27ae60', color: 'white', borderColor: '#27ae60' },
    sendQuoteBtn: { background: '#2563eb', color: 'white', borderColor: '#2563eb' },
    sendQuoteBtnHover: { background: '#1d4ed8', borderColor: '#1d4ed8', color: 'white' },
    chatInputArea: { display: 'flex', gap: '8px', padding: '12px', background: 'white', borderTop: '1px solid #eceff1', flexShrink: 0 },
    chatInput: { flex: 1, padding: '10px 12px', border: `1px solid ${isInputFocused ? '#27ae60' : '#eceff1'}`, borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s ease', outline: 'none', boxShadow: isInputFocused ? '0 0 0 2px rgba(39, 174, 96, 0.1)' : 'none' },
    chatSendBtn: { padding: '10px 16px', background: !replyText.trim() ? '#bdc3c7' : (isSendHovered ? '#229954' : '#27ae60'), color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: !replyText.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px' },
    quoteMessage: { background: 'linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)', border: '2px solid #27ae60', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
    quoteCardHeader: { display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#27ae60', fontSize: '13px' },
    quoteIcon: { fontSize: '16px' },
    quoteLabel: { textTransform: 'uppercase', letterSpacing: '0.5px' },
    quoteCardBody: { display: 'flex', flexDirection: 'column', gap: '4px' },
    quoteAmount: { fontSize: '20px', fontWeight: 700, color: '#27ae60' },
    quoteDescription: { fontSize: '13px', color: '#555', margin: 0, lineHeight: 1.4 },
    quoteModalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
    quoteModal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' },
    quoteModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #eceff1', flexShrink: 0 },
    quoteModalTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#2c3e50' },
    quoteModalClose: { background: 'none', border: 'none', fontSize: '24px', color: '#7f8c8d', cursor: 'pointer', padding: 0, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    quoteModalContent: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    formLabel: { fontSize: '14px', fontWeight: 600, color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '0.3px' },
    quoteInput: { minHeight: '46px', padding: '11px 12px', border: '1px solid #eceff1', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit' },
    quoteTextarea: { minHeight: '120px', padding: '11px 12px', border: '1px solid #eceff1', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical' },
    quotePreview: { background: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px solid #eceff1' },
    previewLabel: { fontSize: '12px', fontWeight: 600, color: '#7f8c8d', textTransform: 'uppercase', margin: '0 0 8px 0', letterSpacing: '0.3px' },
    quotePreviewCard: { background: 'white', border: '2px solid #27ae60', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
    previewAmount: { fontSize: '18px', fontWeight: 700, color: '#27ae60' },
    previewDesc: { fontSize: '13px', color: '#555', margin: 0, lineHeight: 1.4 },
    quoteModalActions: { display: 'flex', gap: '12px', padding: '16px 20px', background: '#f9f9f9', borderTop: '1px solid #eceff1', flexShrink: 0 },
    btnCancel: { flex: 1, padding: '12px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#eceff1', color: '#2c3e50' },
    btnSendQuote: { flex: 1, padding: '12px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px', background: quoteAmount.trim() ? '#27ae60' : '#bdc3c7', color: quoteAmount.trim() ? 'white' : '#95a5a6', cursor: quoteAmount.trim() ? 'pointer' : 'not-allowed' },
  };

  const getMessageWrapperStyle = (sender) => sender === 'seller' ? { ...styles.message, ...styles.messageSeller } : { ...styles.message, ...styles.messageClient };
  const getMessageTextStyle = (sender) => sender === 'seller' ? { ...styles.messageTextBase, ...styles.messageTextSeller } : { ...styles.messageTextBase, ...styles.messageTextClient };

  return (
    <div style={styles.chatOverlay}>
      <div style={styles.chatModal}>
        <div style={styles.chatModalHeader}>
          <div style={styles.chatClientInfo}>
            <img src={inquiry.clientPhoto} alt={inquiry.clientName} style={styles.chatClientPhoto} />
            <div>
              <h3 style={styles.clientName}>{inquiry.clientName}</h3>
              <p style={styles.clientService}>{inquiry.service}</p>
            </div>
          </div>
          <button style={styles.chatCloseBtn} onMouseEnter={() => setIsCloseHovered(true)} onMouseLeave={() => setIsCloseHovered(false)} onClick={onClose}>?</button>
        </div>

        <div style={styles.chatMessages}>
          {messages.map((msg) => (
            <div key={msg.id} style={getMessageWrapperStyle(msg.sender)}>
              {msg.type === 'text' && (
                <>
                  <p style={getMessageTextStyle(msg.sender)}>{msg.text}</p>
                  <span style={{ ...styles.messageTime, textAlign: msg.sender === 'seller' ? 'right' : 'left' }}>{msg.timestamp}</span>
                </>
              )}

              {msg.type === 'quote' && (
                <div style={styles.quoteMessage}>
                  <div style={styles.quoteCardHeader}>
                    <span style={styles.quoteIcon}>??</span>
                    <span style={styles.quoteLabel}>Price Quote</span>
                  </div>
                  <div style={styles.quoteCardBody}>
                    <div style={styles.quoteAmount}>?{msg.amount}</div>
                    <p style={styles.quoteDescription}>{msg.description}</p>
                  </div>
                  <span style={styles.messageTime}>{msg.timestamp}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={styles.quickReplies}>
          <button
            style={{ ...styles.quickReplyBtn, ...(hoveredQuick === 'accept' ? styles.quickReplyBtnHover : {}) }}
            onMouseEnter={() => setHoveredQuick('accept')}
            onMouseLeave={() => setHoveredQuick('')}
            onClick={() => handleQuickReply("Yes, I'm available! Let me know your preferred time.")}
          >
            Accept
          </button>
          <button
            style={{ ...styles.quickReplyBtn, ...styles.sendQuoteBtn, ...(hoveredQuick === 'quote' ? styles.sendQuoteBtnHover : {}) }}
            onMouseEnter={() => setHoveredQuick('quote')}
            onMouseLeave={() => setHoveredQuick('')}
            onClick={handleOpenQuoteModal}
          >
            Send Quote
          </button>
          <button
            style={{ ...styles.quickReplyBtn, ...(hoveredQuick === 'details' ? styles.quickReplyBtnHover : {}) }}
            onMouseEnter={() => setHoveredQuick('details')}
            onMouseLeave={() => setHoveredQuick('')}
            onClick={() => handleQuickReply('I need a bit more information to provide an accurate quote.')}
          >
            Ask Details
          </button>
        </div>

        <div style={styles.chatInputArea}>
          <input
            type="text"
            placeholder="Type your message..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            style={styles.chatInput}
          />
          <button
            style={styles.chatSendBtn}
            onMouseEnter={() => setIsSendHovered(true)}
            onMouseLeave={() => setIsSendHovered(false)}
            onClick={handleSendReply}
            disabled={!replyText.trim()}
          >
            Send
          </button>
        </div>
      </div>

      {showQuoteModal && (
        <div style={styles.quoteModalOverlay}>
          <div style={styles.quoteModal}>
            <div style={styles.quoteModalHeader}>
              <h3 style={styles.quoteModalTitle}>Send Price Quote</h3>
              <button style={styles.quoteModalClose} onClick={() => setShowQuoteModal(false)}>?</button>
            </div>

            <div style={styles.quoteModalContent}>
              <div style={styles.formGroup}>
                <label htmlFor="quote-amount" style={styles.formLabel}>Quote Amount (?)</label>
                <input
                  id="quote-amount"
                  type="number"
                  placeholder="e.g., 1500"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  min="0"
                  step="50"
                  style={styles.quoteInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="quote-description" style={styles.formLabel}>Quote Description (Optional)</label>
                <textarea
                  id="quote-description"
                  placeholder="e.g., Includes materials and labor, 2-3 days delivery..."
                  value={quoteDescription}
                  onChange={(e) => setQuoteDescription(e.target.value)}
                  rows={3}
                  style={styles.quoteTextarea}
                />
              </div>

              <div style={styles.quotePreview}>
                <p style={styles.previewLabel}>Preview:</p>
                <div style={styles.quotePreviewCard}>
                  <span style={styles.previewAmount}>?{quoteAmount || '—'}</span>
                  <p style={styles.previewDesc}>{quoteDescription || `Quote for ${inquiry.service}`}</p>
                </div>
              </div>
            </div>

            <div style={styles.quoteModalActions}>
              <button style={styles.btnCancel} onClick={() => setShowQuoteModal(false)}>
                Cancel
              </button>
              <button style={styles.btnSendQuote} onClick={handleSendQuote} disabled={!quoteAmount.trim()}>
                Send Quote to Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatedChat;
