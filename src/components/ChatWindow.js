import React, { useState, useEffect } from 'react';

const ChatWindow = ({ booking, onApproveQuote, onCancel, onStopServiceAccepted }) => {
  const [messages, setMessages] = useState([]);
  const [clientMessage, setClientMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStopRequestPending, setIsStopRequestPending] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isApproveHovered, setIsApproveHovered] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [isStopHovered, setIsStopHovered] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const isRecurringService = booking?.billingCycle === 'weekly' || booking?.billingCycle === 'monthly';
  const isServiceStopped = booking?.status === 'Service Stopped' || booking?.serviceActive === false;

  useEffect(() => {
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          sender: 'worker',
          type: 'text',
          content: `Hi! I've reviewed your request for ${booking.serviceType.toLowerCase()}. I can help you with that.`,
          timestamp: '10:15 AM',
        },
        {
          id: 2,
          sender: 'worker',
          type: 'text',
          content: "Based on the scope of work you described, here's my quote:",
          timestamp: '10:16 AM',
        },
        {
          id: 3,
          sender: 'worker',
          type: 'quote',
          content: {
            amount: booking.quoteAmount,
            description: booking.description,
            deliveryTime: '2-3 days',
            note: 'Price includes materials and labor',
          },
          timestamp: '10:16 AM',
        },
      ]);
      setIsLoading(false);
      setIsStopRequestPending(false);
    }, 500);
  }, [booking]);

  const handleSendMessage = () => {
    if (!clientMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'client',
      type: 'text',
      content: clientMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setClientMessage('');

    setTimeout(() => {
      const workerResponse = {
        id: messages.length + 2,
        sender: 'worker',
        type: 'text',
        content: "Thanks for your message. I'm confident I can deliver quality work at the quoted price. Feel free to approve the quote when ready!",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prevMessages) => [...prevMessages, workerResponse]);
    }, 1000);
  };

  const handleApproveQuoteClick = () => {
    const approvalMessage = {
      id: messages.length + 1,
      sender: 'system',
      type: 'text',
      content: 'You approved the quote. Proceeding to slot selection...',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, approvalMessage]);

    setTimeout(() => {
      onApproveQuote();
    }, 800);
  };

  const handleRequestStopService = () => {
    if (isStopRequestPending || isServiceStopped) return;

    const requestMessage = {
      id: `stop-request-${Date.now()}`,
      sender: 'client',
      type: 'text',
      content: 'I would like to stop this recurring service. Please confirm cancellation.',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prevMessages) => [...prevMessages, requestMessage]);
    setIsStopRequestPending(true);

    setTimeout(() => {
      const workerApprovalMessage = {
        id: `stop-worker-${Date.now()}`,
        sender: 'worker',
        type: 'text',
        content: 'Understood. I accept your request to stop this recurring service. We will end billing starting this cycle.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      const systemStopMessage = {
        id: `stop-system-${Date.now() + 1}`,
        sender: 'system',
        type: 'text',
        content: 'Service stop confirmed by worker. Recurring billing is now stopped.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prevMessages) => [...prevMessages, workerApprovalMessage, systemStopMessage]);
      setIsStopRequestPending(false);
      if (onStopServiceAccepted) {
        onStopServiceAccepted();
      }
    }, 1200);
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 999, padding: 0 },
    card: { background: 'white', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', maxWidth: '600px', width: '100%', height: '90vh', maxHeight: '90vh', transform: 'translateY(0)', transition: 'transform 0.4s ease' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #ecf0f1', flexShrink: 0 },
    workerInfo: { display: 'flex', gap: '12px', flex: 1 },
    workerAvatar: { width: '48px', height: '48px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '20px' },
    workerName: { fontSize: '15px', fontWeight: 700, color: '#2c3e50', margin: 0 },
    workerService: { fontSize: '13px', color: '#7f8c8d', margin: '2px 0 0 0' },
    workerStatus: { fontSize: '12px', color: '#2563eb', margin: '4px 0 0 0', fontWeight: 600 },
    recurringBadge: { fontSize: '11px', margin: '6px 0 0 0', fontWeight: 700, color: '#1d4ed8' },
    stoppedBadge: { fontSize: '11px', margin: '6px 0 0 0', fontWeight: 700, color: '#b91c1c' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', color: isCloseHovered ? '#2c3e50' : '#7f8c8d', cursor: 'pointer', padding: 0, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', transform: isCloseHovered ? 'scale(1.1)' : 'scale(1)' },
    messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8f9fa' },
    loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#7f8c8d' },
    spinner: { width: '40px', height: '40px', border: '4px solid #ecf0f1', borderTopColor: '#2563eb', borderRadius: '50%' },
    chatMessage: { display: 'flex', flexDirection: 'column', marginBottom: '8px', gap: '4px' },
    chatMessageWorker: { alignSelf: 'flex-start', maxWidth: '80%' },
    chatMessageClient: { alignSelf: 'flex-end', maxWidth: '80%', alignItems: 'flex-end' },
    chatMessageSystem: { alignSelf: 'center', maxWidth: '100%' },
    chatMessageTextBase: { padding: '12px 16px', borderRadius: '12px', margin: 0, fontSize: '14px', color: '#333', lineHeight: 1.5, wordWrap: 'break-word', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
    chatMessageTextWorker: { background: 'white', border: '1px solid #ecf0f1', borderRadius: '12px 12px 12px 2px' },
    chatMessageTextClient: { background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px 12px 2px 12px', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)' },
    chatMessageTime: { fontSize: '11px', color: '#95a5a6', padding: '0 4px' },
    chatSystemMessage: { background: '#ecf0f1', color: '#555', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', textAlign: 'center', margin: 0 },
    quoteCard: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)', border: '2px solid #2563eb', maxWidth: '320px' },
    quoteHeader: { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '12px 16px', color: 'white' },
    quoteLabel: { fontSize: '13px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' },
    quoteBody: { padding: '16px' },
    quoteAmount: { fontSize: '32px', fontWeight: 700, color: '#2563eb', margin: '0 0 8px 0' },
    quoteDescription: { fontSize: '13px', color: '#555', margin: '0 0 12px 0', lineHeight: 1.5 },
    quoteDelivery: { fontSize: '12px', color: '#7f8c8d', margin: '0 0 8px 0', display: 'flex', justifyContent: 'space-between' },
    label: { fontWeight: 600, color: '#2c3e50' },
    quoteNote: { fontSize: '12px', color: '#7f8c8d', margin: 0, padding: '12px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #2563eb' },
    quoteActionBar: { background: 'white', borderTop: '1px solid #ecf0f1', padding: '16px', marginTop: 'auto', flexShrink: 0 },
    actionContent: { textAlign: 'center' },
    actionPrompt: { fontSize: '13px', color: '#2c3e50', fontWeight: 600, margin: '0 0 12px 0' },
    approveBtn: { padding: '12px 24px', background: isApproveHovered ? '#1d4ed8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease', width: '100%', textTransform: 'uppercase', letterSpacing: '0.5px', transform: isApproveHovered ? 'translateY(-2px)' : 'translateY(0)', boxShadow: isApproveHovered ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none' },
    inputArea: { display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid #ecf0f1', background: 'white', flexShrink: 0 },
    messageInput: { flex: 1, padding: '10px 12px', border: `1px solid ${isInputFocused ? '#2563eb' : '#ecf0f1'}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s ease', outline: 'none', boxShadow: isInputFocused ? '0 0 0 2px rgba(37, 99, 235, 0.1)' : 'none' },
    sendBtn: { padding: '10px 20px', background: !clientMessage.trim() ? '#bdc3c7' : (isSendHovered ? '#1d4ed8' : '#2563eb'), color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: !clientMessage.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease' },
    stopServiceBtn: { padding: '10px 14px', background: isStopRequestPending ? '#fca5a5' : (isStopHovered ? '#b91c1c' : '#dc2626'), color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: isStopRequestPending ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease' },
    approvalStatus: { padding: '12px 16px', background: '#dbeafe', borderTop: '1px solid #bfdbfe', textAlign: 'center', flexShrink: 0 },
    approvalStatusText: { fontSize: '13px', color: '#1e3a8a', fontWeight: 600, margin: 0 },
  };

  const getMessageStyle = (msg) => {
    if (msg.sender === 'client') return { ...styles.chatMessage, ...styles.chatMessageClient };
    if (msg.sender === 'worker') return { ...styles.chatMessage, ...styles.chatMessageWorker };
    return { ...styles.chatMessage, ...styles.chatMessageSystem };
  };

  const getMessageTextStyle = (sender) => {
    if (sender === 'client') return { ...styles.chatMessageTextBase, ...styles.chatMessageTextClient };
    return { ...styles.chatMessageTextBase, ...styles.chatMessageTextWorker };
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.workerInfo}>
            <div style={styles.workerAvatar}>{booking.workerName.charAt(0)}</div>
            <div>
              <h3 style={styles.workerName}>{booking.workerName}</h3>
              <p style={styles.workerService}>{booking.serviceType}</p>
              <p style={styles.workerStatus}>{'\u2022'} Online</p>
              {isRecurringService && !isServiceStopped && (
                <p style={styles.recurringBadge}>
                  Recurring {booking.billingCycle === 'monthly' ? 'Monthly' : 'Weekly'} Service
                </p>
              )}
              {isServiceStopped && <p style={styles.stoppedBadge}>Service Stopped</p>}
            </div>
          </div>
          <button style={styles.closeBtn} onMouseEnter={() => setIsCloseHovered(true)} onMouseLeave={() => setIsCloseHovered(false)} onClick={onCancel}>{'\u00D7'}</button>
        </div>

        <div style={styles.messages}>
          {isLoading ? (
            <div style={styles.loadingState}>
              <p>Loading chat history...</p>
              <div style={styles.spinner}></div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={getMessageStyle(msg)}>
                {msg.type === 'text' && msg.sender !== 'system' && (
                  <>
                    <p style={getMessageTextStyle(msg.sender)}>{msg.content}</p>
                    <span style={styles.chatMessageTime}>{msg.timestamp}</span>
                  </>
                )}

                {msg.type === 'quote' && (
                  <div style={styles.quoteCard}>
                    <div style={styles.quoteHeader}>
                      <p style={styles.quoteLabel}>Price Quote</p>
                    </div>
                    <div style={styles.quoteBody}>
                      <div style={styles.quoteAmount}>{`\u20B1${msg.content.amount}`}</div>
                      <p style={styles.quoteDescription}>{msg.content.description}</p>
                      <p style={styles.quoteDelivery}>
                        <span style={styles.label}>Estimated Delivery:</span>
                        <span>{msg.content.deliveryTime}</span>
                      </p>
                      <p style={styles.quoteNote}>{msg.content.note}</p>
                    </div>
                  </div>
                )}

                {msg.type === 'text' && msg.sender === 'system' && (
                  <p style={styles.chatSystemMessage}>{msg.content}</p>
                )}
              </div>
            ))
          )}

          {!isLoading && !booking.quoteApproved && !isServiceStopped && !messages.some((m) => m.sender === 'system') && (
            <div style={styles.quoteActionBar}>
              <div style={styles.actionContent}>
                <p style={styles.actionPrompt}>Do you want to proceed with this quote?</p>
                <button style={styles.approveBtn} onMouseEnter={() => setIsApproveHovered(true)} onMouseLeave={() => setIsApproveHovered(false)} onClick={handleApproveQuoteClick}>
                  Approve Quote & Select Slot
                </button>
              </div>
            </div>
          )}
        </div>

        {!booking.quoteApproved && !isServiceStopped && (
          <div style={styles.inputArea}>
            <input
              type="text"
              placeholder="Ask a question or discuss the quote..."
              value={clientMessage}
              onChange={(e) => setClientMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              style={styles.messageInput}
            />
            <button style={styles.sendBtn} onMouseEnter={() => setIsSendHovered(true)} onMouseLeave={() => setIsSendHovered(false)} onClick={handleSendMessage} disabled={!clientMessage.trim()}>
              Send
            </button>
            {isRecurringService && (
              <button style={styles.stopServiceBtn} onMouseEnter={() => setIsStopHovered(true)} onMouseLeave={() => setIsStopHovered(false)} onClick={handleRequestStopService} disabled={isStopRequestPending}>
                {isStopRequestPending ? 'Waiting...' : 'Request Stop'}
              </button>
            )}
          </div>
        )}

        {booking.quoteApproved && (
          <div style={styles.approvalStatus}>
            <p style={styles.approvalStatusText}>{'\u2713'} Quote Approved - Proceeding to slot selection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
